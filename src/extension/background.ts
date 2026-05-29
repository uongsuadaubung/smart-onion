/**
 * SmartOnion - Background Service Worker (Manifest V3)
 * Manages the lifetime of Chrome proxy settings and compiles rules into dynamic PAC scripts.
 */

import { z } from "zod";
import {
  getProxySettings,
  getRootDomain,
  initializeDefaultSettings,
  setProxySettings,
} from "@/shared/storage.ts";

declare const browser: {
  proxy: {
    onRequest: {
      addListener: (
        callback: (requestInfo: { url: string }) => {
          type: string;
          host?: string;
          port?: number;
          proxyDNS?: boolean;
        },
        filter: { urls: string[] },
      ) => void;
    };
  };
};

const isFirefox = typeof navigator !== "undefined" &&
  navigator.userAgent.toLowerCase().includes("firefox");

let activeFirefoxRules: string[] = [];
let firefoxProxyPort = 9050;
let firefoxIsEnabled = false;

// In Firefox, we listen to requests and proxy them natively if they match rules
function handleFirefoxProxyRequest(requestInfo: { url: string }) {
  if (!firefoxIsEnabled || activeFirefoxRules.length === 0) {
    return { type: "direct" };
  }

  const urlString = requestInfo.url;
  let urlObj;
  try {
    urlObj = new URL(urlString);
  } catch {
    return { type: "direct" };
  }
  const host = urlObj.hostname.toLowerCase();

  // SPECIAL INTERNAL RULE: Always route health check site through Tor to verify connection health
  if (host === "icanhazip.com" || host === "www.icanhazip.com") {
    return {
      type: "socks",
      host: "127.0.0.1",
      port: firefoxProxyPort,
      proxyDNS: true,
    };
  }

  // Check if host matches active rules
  for (const rule of activeFirefoxRules) {
    if (!rule) continue;
    if (
      isDomainMatched(host, rule) ||
      isDomainMatched(urlString, rule) ||
      urlString.toLowerCase().includes(rule.toLowerCase())
    ) {
      return {
        type: "socks",
        host: "127.0.0.1",
        port: firefoxProxyPort,
        proxyDNS: true,
      };
    }
  }

  return { type: "direct" };
}

if (isFirefox) {
  browser.proxy.onRequest.addListener(handleFirefoxProxyRequest, {
    urls: ["<all_urls>"],
  });
  console.log("Firefox native proxy.onRequest listener registered.");
}

// Initialize default settings upon installation
chrome.runtime.onInstalled.addListener(async () => {
  console.log("Tor Bridge installed. Initializing default settings...");
  try {
    await initializeDefaultSettings();
    await applyProxySettings();
  } catch (err) {
    console.error("Failed to initialize default settings:", err);
  }
});

// Update proxy settings when local storage changes
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (
    areaName === "local" &&
    (changes.isEnabled || changes.rules || changes.proxyPort)
  ) {
    console.log("Settings changed. Re-applying proxy rules...");
    await applyProxySettings();
  }
});

// Re-apply proxy settings when the Service Worker starts up
applyProxySettings().catch((err) => {
  console.error("Failed to apply initial proxy settings on startup:", err);
});

async function applyProxySettings(): Promise<void> {
  try {
    const data = await getProxySettings();
    const isEnabled = data.isEnabled;
    const rules = data.rules;

    // Filter rules that are toggled on (active)
    const activeRules: string[] = [];
    for (const rule of rules) {
      if (rule.active) {
        activeRules.push(rule.pattern);
      }
    }

    if (isFirefox) {
      if (!isEnabled || activeRules.length === 0) {
        firefoxIsEnabled = false;
        activeFirefoxRules = [];
        console.log("Tor Bridge disabled in Firefox.");
      } else {
        firefoxIsEnabled = true;
        activeFirefoxRules = activeRules;
        firefoxProxyPort = data.proxyPort;
        console.log(
          "Tor Bridge active in Firefox. Updated request listener with",
          activeRules.length,
          "active rules on port",
          data.proxyPort,
        );
      }
      return;
    }

    if (!isEnabled || activeRules.length === 0) {
      // Clear proxy settings completely to fall back to system defaults / other extensions politely.
      try {
        await chrome.proxy.settings.clear({ scope: "regular" });
        console.log(
          "Tor Bridge disabled. Proxy settings cleared successfully.",
        );
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("Failed to clear proxy settings:", error.message);
      }
      return;
    }

    // Compile rules into a PAC script string using only active rules
    const pacScriptString = generatePacScript(activeRules, data.proxyPort);

    const config: chrome.proxy.ProxyConfig = {
      mode: "pac_script",
      pacScript: {
        data: pacScriptString,
      },
    };
    try {
      await chrome.proxy.settings.set({ value: config, scope: "regular" });
      console.log(
        "Tor Bridge active. Chrome dynamic PAC script applied successfully with",
        activeRules.length,
        "active rules.",
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Failed to set Chrome dynamic PAC proxy:", error.message);
    }
  } catch (err) {
    console.error("Failed to fetch proxy settings from storage:", err);
  }
}

/**
 * Dynamically generates a valid Proxy Auto-Config (PAC) script.
 * Supports exact domain matching and automatic subdomain matching.
 *
 * @param rules Array of user-defined matching patterns
 * @returns Fully functional JavaScript PAC script
 */
function generatePacScript(rules: string[], proxyPort: number): string {
  // Serialize the rules array into standard JSON for embedded execution
  const serializedRules = JSON.stringify(rules);

  return `
    // SmartOnion Dynamically Generated PAC Script
    var rules = ${serializedRules};

    function FindProxyForURL(url, host) {
      // SPECIAL INTERNAL RULE: Always route health check site through Tor to verify connection health
      if (host === 'icanhazip.com' || host === 'www.icanhazip.com') {
        return 'SOCKS5 127.0.0.1:${proxyPort}; SOCKS 127.0.0.1:${proxyPort}; DIRECT';
      }

      // Direct matches or general rules logic
      for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (!rule) continue;
        
        // Lowercase rule for case-insensitive comparisons
        rule = rule.toLowerCase();
        
        // Match exact host or subdomain (e.g. facebook.com or *.facebook.com)
        if (host === rule || shExpMatch(host, '*.' + rule)) {
          return 'SOCKS5 127.0.0.1:${proxyPort}; SOCKS 127.0.0.1:${proxyPort}; DIRECT';
        }
      }
      
    // Default to direct fast route for all other traffic
    return 'DIRECT';
  }
`;
}

/**
 * Unified matching logic mirroring standard PAC script rules.
 * Handles exact matches and subdomain matching (e.g. www.facebook.com matches facebook.com).
 */
function isDomainMatched(host: string, pattern: string): boolean {
  const normalizedHost = host.toLowerCase();
  const normalizedPattern = pattern.toLowerCase();

  return normalizedHost === normalizedPattern ||
    normalizedHost.endsWith("." + normalizedPattern);
}

// Listen for network connection errors to detect blocked domains dynamically
chrome.webRequest.onErrorOccurred.addListener(async (details) => {
  // Only target main frame pages to avoid sub-resources triggering auto-whitelisting
  if (details.type !== "main_frame") return;

  // Exclude client-side cancellations and standard adblocker actions
  const excludedErrors = [
    "net::ERR_ABORTED",
    "net::ERR_BLOCKED_BY_CLIENT",
    "net::ERR_FILE_NOT_FOUND",
  ];

  if (excludedErrors.some((err) => details.error.includes(err))) return;

  try {
    const targetUrl = new URL(details.url);
    const targetHostRaw = targetUrl.hostname.toLowerCase();
    const targetHost = getRootDomain(targetHostRaw);

    // Skip special localhost or empty patterns
    if (targetHost === "localhost" || targetHost === "127.0.0.1") return;

    const settings = await getProxySettings();
    if (!settings.autoPilot) return;

    // Verify if this target domain is already handled by any existing rule
    const targetIsAlreadyRule = settings.rules.some((r) =>
      isDomainMatched(targetHost, r.pattern)
    );

    if (targetIsAlreadyRule) return;

    // Tự động thêm domain gốc vào local storage
    const newRule = { pattern: targetHost, active: true };
    const nextRules = [...settings.rules, newRule];
    await setProxySettings({ rules: nextRules });
    await applyProxySettings();

    console.log(
      `[Auto-Pilot] Automatically added blocked root domain "${targetHost}" due to ${details.error}`,
    );

    // Automatically reload the tab to retry via Tor immediately after a 200ms delay to allow Chrome to swap the PAC script in the network thread
    if (details.tabId >= 0) {
      setTimeout(() => {
        chrome.tabs.reload(details.tabId);
      }, 100);
    }
  } catch {
    // Gracefully ignore parsing issues
  }
}, { urls: ["<all_urls>"] });

// Listen for HTTP response headers to detect 403 Forbidden or 451 Legal blocks dynamically
chrome.webRequest.onHeadersReceived.addListener((details) => {
  // Execute async block inside a synchronous handler to satisfy TS type declarations
  (async () => {
    // Only target main frame pages to avoid sub-resources triggering reload loops
    if (details.type !== "main_frame") return;

    const statusCode = details.statusCode;
    if (statusCode === 403 || statusCode === 451) {
      try {
        const targetUrl = new URL(details.url);
        const targetHostRaw = targetUrl.hostname.toLowerCase();
        const targetHost = getRootDomain(targetHostRaw);

        // Skip special localhost or empty patterns
        if (targetHost === "localhost" || targetHost === "127.0.0.1") return;

        const settings = await getProxySettings();
        if (!settings.autoPilot) return;

        // Verify if this target domain is already handled by any existing rule
        const targetIsAlreadyRule = settings.rules.some((r) =>
          isDomainMatched(targetHost, r.pattern)
        );

        if (targetIsAlreadyRule) return;

        // Auto-add the root domain as a flat active rule
        const newRule = { pattern: targetHost, active: true };
        const nextRules = [...settings.rules, newRule];
        await setProxySettings({ rules: nextRules });
        await applyProxySettings();

        console.log(
          `[Auto-Pilot] Automatically added root domain "${targetHost}" due to HTTP status ${statusCode}`,
        );

        // Automatically reload the tab to retry via Tor immediately after a 200ms delay to allow Chrome to swap the PAC script in the network thread
        if (details.tabId >= 0) {
          setTimeout(() => {
            chrome.tabs.reload(details.tabId);
          }, 100);
        }
      } catch {
        // Gracefully ignore parsing issues
      }
    }
  })();
}, { urls: ["<all_urls>"] });

// Listen to all outgoing requests to map initiator-to-target dependencies in session storage by tabId
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.tabId < 0) return;

    try {
      const targetUrl = new URL(details.url);
      const targetHost = targetUrl.hostname.toLowerCase().trim();
      const targetRoot = getRootDomain(targetHost);

      // Skip localhost
      if (targetRoot === "localhost" || targetRoot === "127.0.0.1") return;

      (async () => {
        const sessionData = await chrome.storage.session.get(["tabRelations"]);
        const parsed = z.record(z.string(), z.array(z.string())).safeParse(
          sessionData.tabRelations,
        );
        const tabRelations = parsed.success ? parsed.data : {};

        const key = String(details.tabId);
        const existingList = tabRelations[key] || [];

        let changed = false;

        if (details.type === "main_frame") {
          // Reset list for a new navigation, but include the main frame root domain
          tabRelations[key] = [targetRoot];
          changed = true;
        } else {
          // For sub-resources, ONLY add the resolved root domain to keep the list clean and premium!
          const updated = [...existingList];
          if (!updated.includes(targetRoot)) {
            updated.push(targetRoot);
            changed = true;
          }
          if (changed) {
            tabRelations[key] = updated;
          }
        }

        if (changed) {
          await chrome.storage.session.set({ tabRelations });
        }
      })();
    } catch {
      // Ignore URL parsing errors
    }
  },
  { urls: ["<all_urls>"] },
);
