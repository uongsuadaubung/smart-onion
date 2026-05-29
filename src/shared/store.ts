import { createStore } from "solid-js/store";
import { getProxySettings, setProxySettings } from "@/shared/storage.ts";
import type { RuleItem } from "@/shared/storage.ts";
import { setLanguage, SupportLanguage } from "@/shared/i18n.ts";
import { z } from "zod";

export interface AppStore {
  isEnabled: boolean;
  rules: RuleItem[];
  searchTerm: string;
  currentActiveTabDomain: string;
  currentActiveTabId: number;
  tabRelations: Record<string, string[]>;
  expandedRule: string | null;
  statusCardClass: string;
  statusDotClass: string;
  statusLabel:
    | "status_checking"
    | "status_connecting"
    | "status_connected"
    | "status_disconnected";
  isLoaded: boolean;
  view: "main" | "settings";
  language: "en" | "vi";
  proxyPort: number;
  autoPilot: boolean;
}

export const [appStore, setAppStore] = createStore<AppStore>({
  isEnabled: false,
  rules: [],
  searchTerm: "",
  currentActiveTabDomain: "",
  currentActiveTabId: -1,
  tabRelations: {},
  expandedRule: null,
  statusCardClass: "status-card",
  statusDotClass: "status-dot",
  statusLabel: "status_checking",
  isLoaded: false,
  view: "main",
  language: "vi",
  proxyPort: 9050,
  autoPilot: true,
});

const RelationsSchema = z.record(z.string(), z.array(z.string()));

export const appStoreActions = {
  async init() {
    try {
      const result = await getProxySettings();
      setAppStore({
        isEnabled: result.isEnabled,
        rules: result.rules,
        language: result.language,
        proxyPort: result.proxyPort,
        autoPilot: result.autoPilot,
      });

      // Synchronize language state with i18n module
      setLanguage(
        result.language === "vi" ? SupportLanguage.Vi : SupportLanguage.En,
      );

      // Load initial tab relations from session storage
      try {
        const sessionData = await chrome.storage.session.get("tabRelations");
        const parsed = RelationsSchema.safeParse(sessionData.tabRelations);
        if (parsed.success) {
          setAppStore("tabRelations", parsed.data);
        }
      } catch (err) {
        console.error("Failed to load session relations:", err);
      }

      await appStoreActions.checkCurrentTab();
      appStoreActions.updateStatusStyles();
      setAppStore("isLoaded", true);
    } catch (err) {
      console.error("Failed to load initial settings:", err);
    }

    // Sync state instantly if updated by the background worker or other contexts
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local") {
        if (changes.isEnabled) {
          const val = changes.isEnabled.newValue;
          if (typeof val === "boolean") {
            setAppStore("isEnabled", val);
            appStoreActions.updateStatusStyles();
          }
        }
        if (changes.rules) {
          const parsed = z.array(z.object({
            pattern: z.string(),
            active: z.boolean(),
          })).safeParse(changes.rules.newValue);
          if (parsed.success) {
            setAppStore("rules", parsed.data);
          }
        }
        if (changes.language) {
          const val = changes.language.newValue;
          if (val === "en" || val === "vi") {
            setAppStore("language", val);
            setLanguage(val === "vi" ? SupportLanguage.Vi : SupportLanguage.En);
          }
        }
        if (changes.proxyPort) {
          const val = changes.proxyPort.newValue;
          if (typeof val === "number") {
            setAppStore("proxyPort", val);
          }
        }
        if (changes.autoPilot) {
          const val = changes.autoPilot.newValue;
          if (typeof val === "boolean") {
            setAppStore("autoPilot", val);
          }
        }
      }
      if (areaName === "session" && changes.tabRelations) {
        const parsed = RelationsSchema.safeParse(changes.tabRelations.newValue);
        if (parsed.success) {
          setAppStore("tabRelations", parsed.data);
        }
      }
    });
  },

  updateStatusStyles() {
    const enabled = appStore.isEnabled;
    if (!enabled) {
      setAppStore({
        statusCardClass: "status-card",
        statusDotClass: "status-dot",
        statusLabel: "status_disconnected",
      });
      return;
    }
    appStoreActions.performHealthCheck().catch((err) => {
      console.error("Error during health check:", err);
    });
  },

  async checkCurrentTab() {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tabs || tabs.length === 0) return;

      const tabId = tabs[0].id;
      if (typeof tabId === "number") {
        setAppStore("currentActiveTabId", tabId);
      }

      const urlString = tabs[0].url;

      if (
        urlString &&
        (urlString.startsWith("http://") || urlString.startsWith("https://"))
      ) {
        try {
          const urlObj = new URL(urlString);
          const domain = urlObj.hostname;
          setAppStore("currentActiveTabDomain", domain);
        } catch {
          // Gracefully ignore parsing errors
        }
      }
    } catch (err) {
      console.error("Failed to query current tab:", err);
    }
  },

  async performHealthCheck() {
    if (!appStore.isEnabled) return;

    setAppStore({
      statusDotClass: "status-dot pulse",
      statusLabel: "status_connecting",
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch("https://icanhazip.com", {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setAppStore({
          statusCardClass: "status-card connected",
          statusLabel: "status_connected",
        });
      } else {
        setAppStore({
          statusCardClass: "status-card disconnected",
          statusLabel: "status_disconnected",
        });
      }
    } catch {
      clearTimeout(timeoutId);
      setAppStore({
        statusCardClass: "status-card disconnected",
        statusLabel: "status_disconnected",
      });
    }
  },

  async updateMasterToggle(value: boolean) {
    setAppStore("isEnabled", value);
    try {
      await setProxySettings({ isEnabled: value });
      appStoreActions.updateStatusStyles();
      await appStoreActions.checkCurrentTab();
    } catch (err) {
      console.error("Failed to save toggle state to storage:", err);
    }
  },

  setSearchTerm(term: string) {
    setAppStore("searchTerm", term);
  },

  setExpandedRule(pattern: string | null) {
    setAppStore("expandedRule", pattern);
  },

  async addCustomRule(pattern: string) {
    const normalizedPattern = pattern.trim().toLowerCase();
    if (!normalizedPattern) return;
    if (appStore.rules.some((r) => r.pattern === normalizedPattern)) return;

    const newRuleItem: RuleItem = { pattern: normalizedPattern, active: true };
    const nextRules = [newRuleItem, ...appStore.rules];
    setAppStore("rules", nextRules);
    try {
      await setProxySettings({ rules: nextRules });
      await appStoreActions.checkCurrentTab();

      // Auto-reload the active tab to apply proxy immediately after a 200ms delay to allow PAC script propagation
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const tabId = tabs[0]?.id;
      if (typeof tabId === "number") {
        setTimeout(async () => {
          await chrome.tabs.reload(tabId);
        }, 200);
      }
    } catch (err) {
      console.error("Failed to add custom rule:", err);
    }
  },

  deleteRule(ruleToDeletePattern: string, itemEl: HTMLLIElement) {
    itemEl.classList.add("fade-out");

    setTimeout(async () => {
      const nextRules = appStore.rules.filter((r) =>
        r.pattern !== ruleToDeletePattern
      );
      setAppStore("rules", nextRules);
      try {
        await setProxySettings({ rules: nextRules });
        await appStoreActions.checkCurrentTab();
      } catch (err) {
        console.error("Failed to delete rule from storage:", err);
      }
    }, 200);
  },

  async toggleRuleActive(patternToToggle: string, active: boolean) {
    const nextRules = appStore.rules.map((r) =>
      r.pattern === patternToToggle ? { ...r, active } : r
    );
    setAppStore("rules", nextRules);
    try {
      await setProxySettings({ rules: nextRules });
    } catch (err) {
      console.error("Failed to toggle rule active state:", err);
    }
  },

  navigate(newView: "main" | "settings") {
    setAppStore("view", newView);
  },

  async updateLanguage(lang: "en" | "vi") {
    setAppStore("language", lang);
    setLanguage(lang === "vi" ? SupportLanguage.Vi : SupportLanguage.En);
    try {
      await setProxySettings({ language: lang });
      appStoreActions.updateStatusStyles();
    } catch (err) {
      console.error("Failed to save language to storage:", err);
    }
  },

  async updateProxyPort(port: number) {
    setAppStore("proxyPort", port);
    try {
      await setProxySettings({ proxyPort: port });
      appStoreActions.updateStatusStyles();
    } catch (err) {
      console.error("Failed to save proxy port to storage:", err);
    }
  },

  async updateAutoPilot(value: boolean) {
    setAppStore("autoPilot", value);
    try {
      await setProxySettings({ autoPilot: value });
    } catch (err) {
      console.error("Failed to save auto-pilot setting to storage:", err);
    }
  },
};
