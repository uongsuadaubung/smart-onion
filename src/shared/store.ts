import { createStore } from "solid-js/store";
import {
  BlockedSubdomainsSchema,
  getBlockedSubdomains,
  getProxySettings,
  setBlockedSubdomains,
  setProxySettings,
} from "@/shared/storage.ts";
import type { BlockedSubdomains, RuleItem } from "@/shared/storage.ts";
import { setLanguage, SupportLanguage } from "@/shared/i18n.ts";

export interface AppStore {
  isEnabled: boolean;
  rules: RuleItem[];
  searchTerm: string;
  ruleInput: string;
  currentActiveTabDomain: string;
  quickAddVisible: boolean;
  blockedMap: BlockedSubdomains;
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
}

export const [appStore, setAppStore] = createStore<AppStore>({
  isEnabled: false,
  rules: [],
  searchTerm: "",
  ruleInput: "",
  currentActiveTabDomain: "",
  quickAddVisible: false,
  blockedMap: {},
  expandedRule: null,
  statusCardClass: "status-card",
  statusDotClass: "status-dot",
  statusLabel: "status_checking",
  isLoaded: false,
  view: "main",
  language: "vi",
  proxyPort: 9050,
});

export const appStoreActions = {
  async init() {
    try {
      const result = await getProxySettings();
      setAppStore({
        isEnabled: result.isEnabled,
        rules: result.rules,
        language: result.language,
        proxyPort: result.proxyPort,
      });

      // Synchronize language state with i18n module
      setLanguage(
        result.language === "vi" ? SupportLanguage.Vi : SupportLanguage.En,
      );

      // Load blocked subdomains from local storage
      setAppStore("blockedMap", await getBlockedSubdomains());

      await appStoreActions.checkCurrentTab();
      appStoreActions.updateStatusStyles();
      setAppStore("isLoaded", true);
    } catch (err) {
      console.error("Failed to load initial settings:", err);
    }

    // Sync blocked subdomains instantly if updated by the background worker
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local" && changes.blockedSubdomains) {
        setAppStore(
          "blockedMap",
          BlockedSubdomainsSchema.parse(changes.blockedSubdomains.newValue),
        );
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
      const urlString = tabs[0].url;

      if (
        urlString &&
        (urlString.startsWith("http://") || urlString.startsWith("https://"))
      ) {
        try {
          const urlObj = new URL(urlString);
          const domain = urlObj.hostname;
          setAppStore("currentActiveTabDomain", domain);

          const alreadyMatched = appStore.rules.some((rule) => {
            const pattern = rule.pattern.toLowerCase();
            const host = domain.toLowerCase();

            if (pattern === host) return true;

            if (pattern.includes("*")) {
              const regexStr = "^" +
                pattern.split("*").map((s) =>
                  s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")
                ).join(
                  ".*",
                ) + "$";
              return new RegExp(regexStr, "i").test(host);
            }

            if (host.endsWith("." + pattern)) return true;

            return false;
          });

          setAppStore("quickAddVisible", !alreadyMatched);
        } catch {
          setAppStore("quickAddVisible", false);
        }
      } else {
        setAppStore("quickAddVisible", false);
      }
    } catch (err) {
      console.error("Failed to query current tab:", err);
      setAppStore("quickAddVisible", false);
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

  setRuleInput(input: string) {
    setAppStore("ruleInput", input);
  },

  setExpandedRule(pattern: string | null) {
    setAppStore("expandedRule", pattern);
  },

  async addRule() {
    let rule = appStore.ruleInput.trim().toLowerCase();
    if (!rule) return;

    if (rule.includes("://") && !rule.includes("*")) {
      try {
        const urlObj = new URL(rule);
        rule = urlObj.hostname;
      } catch {
        rule = rule.replace(/(^\w+:|^)\/\//, "").split("/")[0];
      }
    }

    if (appStore.rules.some((r) => r.pattern === rule)) {
      const inputEl = document.getElementById("rule-input");
      if (inputEl) {
        inputEl.classList.add("input-error");
        setTimeout(() => inputEl.classList.remove("input-error"), 500);
      }
      return;
    }

    const newRuleItem: RuleItem = { pattern: rule, active: true, children: [] };
    const nextRules = [newRuleItem, ...appStore.rules];
    setAppStore("rules", nextRules);
    try {
      await setProxySettings({ rules: nextRules });
      setAppStore("ruleInput", "");
      await appStoreActions.checkCurrentTab();
    } catch (err) {
      console.error("Failed to add new rule to storage:", err);
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

  async addSubdomain(parentPattern: string, subdomain: string) {
    const nextRules = appStore.rules.map((r) => {
      if (r.pattern === parentPattern) {
        if (r.children.some((c) => c.pattern === subdomain)) return r;
        return {
          ...r,
          children: [...r.children, { pattern: subdomain, active: true }],
        };
      }
      return r;
    });
    setAppStore("rules", nextRules);

    const currentMap = { ...appStore.blockedMap };
    if (currentMap[parentPattern]) {
      currentMap[parentPattern] = currentMap[parentPattern].filter(
        (s) => s !== subdomain,
      );
      if (currentMap[parentPattern].length === 0) {
        delete currentMap[parentPattern];
      }
      setAppStore("blockedMap", currentMap);
    }

    try {
      await setProxySettings({ rules: nextRules });
      await setBlockedSubdomains(currentMap);
      await appStoreActions.checkCurrentTab();
    } catch (err) {
      console.error("Failed to add subdomain rule:", err);
    }
  },

  async toggleChildRuleActive(
    parentPattern: string,
    childPattern: string,
    active: boolean,
  ) {
    const nextRules = appStore.rules.map((r) => {
      if (r.pattern === parentPattern) {
        return {
          ...r,
          children: r.children.map((c) =>
            c.pattern === childPattern ? { ...c, active } : c
          ),
        };
      }
      return r;
    });
    setAppStore("rules", nextRules);
    try {
      await setProxySettings({ rules: nextRules });
    } catch (err) {
      console.error("Failed to toggle child rule active state:", err);
    }
  },

  deleteChildRule(
    parentPattern: string,
    childPattern: string,
    childEl: HTMLLIElement,
  ) {
    childEl.classList.add("fade-out");
    setTimeout(async () => {
      const nextRules = appStore.rules.map((r) => {
        if (r.pattern === parentPattern) {
          return {
            ...r,
            children: r.children.filter((c) => c.pattern !== childPattern),
          };
        }
        return r;
      });
      setAppStore("rules", nextRules);
      try {
        await setProxySettings({ rules: nextRules });
        await appStoreActions.checkCurrentTab();
      } catch (err) {
        console.error("Failed to delete child rule:", err);
      }
    }, 200);
  },

  async quickAdd() {
    const domain = appStore.currentActiveTabDomain;
    if (domain && !appStore.rules.some((r) => r.pattern === domain)) {
      const newRuleItem: RuleItem = {
        pattern: domain,
        active: true,
        children: [],
      };
      const nextRules = [newRuleItem, ...appStore.rules];
      setAppStore("rules", nextRules);
      try {
        await setProxySettings({ rules: nextRules });
        setAppStore("quickAddVisible", false);
      } catch (err) {
        console.error("Failed to save quick add rule to storage:", err);
      }
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
};
