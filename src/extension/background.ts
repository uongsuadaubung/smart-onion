/**
 * SmartOnion - Background Service Worker (Manifest V3)
 * Manages the lifetime of Chrome proxy settings and compiles rules into dynamic PAC scripts.
 */

import { z } from "zod";
import {
  getBlockedSubdomains,
  getProxySettings,
  getRootDomain,
  initializeDefaultSettings,
  RuleItemSchema,
  setBlockedSubdomains,
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

    // Clean up blocked subdomains that have been added to rules!
    if (changes.rules && changes.rules.newValue) {
      try {
        const nextRules = z.array(RuleItemSchema).parse(changes.rules.newValue);
        const rulePatterns = nextRules.flatMap((r) => [
          r.pattern,
          ...(r.children || []).map((c) => c.pattern),
        ]);

        const blockedSubdomains = await getBlockedSubdomains();

        let hasChanges = false;
        const updatedBlocked: Record<string, string[]> = {};

        for (const [parent, children] of Object.entries(blockedSubdomains)) {
          // If the parent pattern itself is no longer in rules, discard the error entries for it
          const parentStillExists = nextRules.some((r) => r.pattern === parent);
          if (!parentStillExists) {
            hasChanges = true;
            continue;
          }

          // Filter out any child domain that is now matched by any active rule pattern
          const filteredChildren = children.filter((child) =>
            !rulePatterns.some((pattern) => isDomainMatched(child, pattern))
          );

          if (filteredChildren.length !== children.length) {
            hasChanges = true;
          }

          if (filteredChildren.length > 0) {
            updatedBlocked[parent] = filteredChildren;
          } else {
            hasChanges = true;
          }
        }

        if (hasChanges) {
          await setBlockedSubdomains(updatedBlocked);
          console.log("Cleaned up blockedSubdomains storage successfully.");
        }
      } catch (err) {
        console.error(
          "Failed to clean up blocked subdomains on rules change:",
          err,
        );
      }
    }
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

    // Filter rules that are toggled on (active) and extract all active parent and child patterns
    const activeRules: string[] = [];
    for (const rule of rules) {
      if (rule.active) {
        activeRules.push(rule.pattern);
        if (rule.children) {
          for (const child of rule.children) {
            if (child.active) {
              activeRules.push(child.pattern);
            }
          }
        }
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

    const config = {
      mode: "pac_script" as const,
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
 * Supports exact domain matching, subdomain matching, and general wildcards.
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

// Listen for network connection errors to detect blocked subdomains dynamically
chrome.webRequest.onErrorOccurred.addListener(async (details) => {
  // We only track resources initiated by active browser tabs (having initiator origin and valid tabId)
  if (details.tabId < 0 || !details.initiator) return;

  // Exclude client-side cancellations and standard adblocker actions
  const excludedErrors = [
    "net::ERR_ABORTED",
    "net::ERR_BLOCKED_BY_CLIENT",
    "net::ERR_FILE_NOT_FOUND",
  ];

  if (excludedErrors.some((err) => details.error.includes(err))) return;

  try {
    const initiatorUrl = new URL(details.initiator);
    const initiatorHost = initiatorUrl.hostname.toLowerCase();

    const targetUrl = new URL(details.url);
    const targetHostRaw = targetUrl.hostname.toLowerCase();
    const targetHost = getRootDomain(targetHostRaw);

    // Skip recording if the subresource matches or resolves to the parent domain
    if (
      initiatorHost === targetHost || isDomainMatched(initiatorHost, targetHost)
    ) return;

    const settings = await getProxySettings();

    // Verify if the parent origin is currently matched by an active rule in our settings
    const matchedParentRule = settings.rules.find((r) =>
      r.active && isDomainMatched(initiatorHost, r.pattern)
    );

    if (!matchedParentRule) return;

    // Check if this target domain is already handled by any of our existing parent or child rules
    const targetIsAlreadyRule = settings.rules.some((r) => {
      if (isDomainMatched(targetHost, r.pattern)) return true;
      if (r.children) {
        return r.children.some((c) => isDomainMatched(targetHost, c.pattern));
      }
      return false;
    });

    if (targetIsAlreadyRule) return;

    const parentPattern = matchedParentRule.pattern;

    // Retrieve and update the blocked subdomains record map in local storage
    const blockedSubdomains = await getBlockedSubdomains();

    const existingChildren = blockedSubdomains[parentPattern] || [];
    if (!existingChildren.includes(targetHost)) {
      const nextChildren = [...existingChildren, targetHost];
      blockedSubdomains[parentPattern] = nextChildren;
      await setBlockedSubdomains(blockedSubdomains);
      console.log(
        `[Blocked Root Domain Detected] ${targetHost} (resolved from ${targetHostRaw}) initiated by parent pattern ${parentPattern}`,
      );
    }
  } catch {
    // Gracefully ignore parsing issues
  }
}, { urls: ["<all_urls>"] });
