import { createMemo, For, Match, onMount, Show, Switch } from "solid-js";
import { appStore, appStoreActions } from "@/shared/store.ts";
import { t } from "@/shared/i18n.ts";
import { getRootDomain } from "@/shared/storage.ts";

import Header from "@/components/Header.tsx";
import StatusCard from "@/components/StatusCard.tsx";
import RuleItemView from "@/components/RuleItemView.tsx";
import Settings from "@/views/Settings.tsx";

import SearchIcon from "@/components/icons/SearchIcon.tsx";
import EmptyIcon from "@/components/icons/EmptyIcon.tsx";

interface WhitelistedItem {
  type: "whitelisted";
  rule: { pattern: string; active: boolean };
}

interface DiscoveredItem {
  type: "discovered";
  pattern: string;
}

type ListItem = WhitelistedItem | DiscoveredItem;

function isWhitelistedItem(item: ListItem): item is WhitelistedItem {
  return item.type === "whitelisted";
}

export default function Popup() {
  onMount(async () => {
    await appStoreActions.init();
  });

  // Calculate the domains active in the current tab (active tab root domain + all root domains requested by them)
  const currentTabLoadedDomains = createMemo(() => {
    const activeDomain = appStore.currentActiveTabDomain.toLowerCase().trim();
    if (
      !activeDomain || activeDomain === "localhost" ||
      activeDomain === "127.0.0.1"
    ) {
      return [];
    }
    const rootDomain = getRootDomain(activeDomain);

    const tabId = appStore.currentActiveTabId;
    const relations = tabId >= 0
      ? (appStore.tabRelations[String(tabId)] || [])
      : [];

    const allDomains = [rootDomain, ...relations];
    return Array.from(new Set(allDomains)).filter((d) =>
      d && d !== "localhost" && d !== "127.0.0.1"
    );
  });

  // List 1: Domains active on current site (both saved/whitelisted rules and new discovered domains)
  const list1 = createMemo<ListItem[]>(() => {
    const term = appStore.searchTerm.trim().toLowerCase();
    const loaded = currentTabLoadedDomains();
    const result: ListItem[] = [];

    for (const domain of loaded) {
      if (term && !domain.includes(term)) continue;

      const savedRule = appStore.rules.find(
        (r) => r.pattern.toLowerCase() === domain,
      );

      if (savedRule) {
        result.push({ type: "whitelisted", rule: savedRule });
      } else {
        result.push({ type: "discovered", pattern: domain });
      }
    }

    return result;
  });

  // List 2: All other saved whitelisted sites excluding those in List 1
  const list2 = createMemo(() => {
    const term = appStore.searchTerm.trim().toLowerCase();
    const loaded = new Set(
      currentTabLoadedDomains().map((d) => d.toLowerCase()),
    );

    return appStore.rules.filter((rule) => {
      const pattern = rule.pattern.toLowerCase();
      if (loaded.has(pattern)) return false;
      if (term && !pattern.includes(term)) return false;
      return true;
    });
  });

  const hasRulesOrDiscovered = createMemo(() => {
    return list1().length > 0 || list2().length > 0;
  });

  return (
    <Switch>
      <Match when={appStore.view === "settings"}>
        <Settings />
      </Match>

      <Match when={appStore.view === "main"}>
        <div class="app-container">
          {/* HEADER */}
          <Header />

          {/* TOR CONNECTIVITY STATUS */}
          <StatusCard
            isEnabled={appStore.isEnabled}
            statusCardClass={appStore.statusCardClass}
            statusDotClass={appStore.statusDotClass}
            statusLabel={t(appStore.statusLabel)}
            onToggleChange={(e) => {
              const target = e.target;
              if (target instanceof HTMLInputElement) {
                appStoreActions.updateMasterToggle(target.checked);
              }
            }}
          />

          {/* RULES PANEL */}
          <div class="rules-panel">
            <div class="panel-header">
              {/* SEARCH BAR */}
              <div class="search-box">
                <SearchIcon />
                <input
                  type="text"
                  id="search-input"
                  placeholder={t("search_placeholder")}
                  value={appStore.searchTerm}
                  onInput={(e) =>
                    appStoreActions.setSearchTerm(e.currentTarget.value)}
                />
              </div>
            </div>

            {/* RULES LISTS */}
            <div class="rules-scroll-area">
              <Show
                when={hasRulesOrDiscovered()}
                fallback={
                  <div
                    class="empty-state"
                    id="empty-state"
                    style="display: flex;"
                  >
                    <EmptyIcon />
                    <p class="empty-title">
                      {appStore.searchTerm
                        ? t("empty_no_results")
                        : t("empty_no_rules")}
                    </p>
                    <p class="empty-desc">
                      {appStore.searchTerm
                        ? t("empty_no_results_desc", {
                          term: appStore.searchTerm,
                        })
                        : t("empty_no_rules_desc")}
                    </p>
                  </div>
                }
              >
                <div class="rules-sections">
                  {/* GROUP 1: Active on current tab */}
                  <Show when={list1().length > 0}>
                    <div class="rules-section">
                      <div class="rules-group-header">
                        <span class="group-title">
                          {t("list_active_title")}
                        </span>
                        <span class="group-count">{list1().length}</span>
                      </div>
                      <ul class="rules-list">
                        <For each={list1()}>
                          {(item) => {
                            if (isWhitelistedItem(item)) {
                              return (
                                <RuleItemView
                                  rule={item.rule}
                                  onToggleActive={async (active) => {
                                    await appStoreActions.toggleRuleActive(
                                      item.rule.pattern,
                                      active,
                                    );
                                    if (active) {
                                      setTimeout(async () => {
                                        const tabs = await chrome.tabs.query({
                                          active: true,
                                          currentWindow: true,
                                        });
                                        const tabId = tabs[0]?.id;
                                        if (typeof tabId === "number") {
                                          chrome.tabs.reload(tabId);
                                        }
                                      }, 200);
                                    }
                                  }}
                                  onDelete={(el) =>
                                    appStoreActions.deleteRule(
                                      item.rule.pattern,
                                      el,
                                    )}
                                />
                              );
                            } else {
                              return (
                                <RuleItemView
                                  discoveredPattern={item.pattern}
                                  onAdd={() =>
                                    appStoreActions.addCustomRule(
                                      item.pattern,
                                    )}
                                />
                              );
                            }
                          }}
                        </For>
                      </ul>
                    </div>
                  </Show>

                  {/* GROUP 2: Other whitelisted sites */}
                  <Show when={list2().length > 0}>
                    <div class="rules-section">
                      {/* Only show header if List 1 is also visible to prevent redundancy */}
                      <Show when={list1().length > 0}>
                        <div class="rules-group-header">
                          <span class="group-title">
                            {t("list_other_title")}
                          </span>
                          <span class="group-count">{list2().length}</span>
                        </div>
                      </Show>
                      <ul class="rules-list">
                        <For each={list2()}>
                          {(rule) => (
                            <RuleItemView
                              rule={rule}
                              onToggleActive={(active) =>
                                appStoreActions.toggleRuleActive(
                                  rule.pattern,
                                  active,
                                )}
                              onDelete={(el) =>
                                appStoreActions.deleteRule(rule.pattern, el)}
                            />
                          )}
                        </For>
                      </ul>
                    </div>
                  </Show>
                </div>
              </Show>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <footer class="app-footer">
            <div class="footer-right" style="margin-left: auto;">
              <span class="version-text">
                v{chrome.runtime.getManifest().version}
              </span>
            </div>
          </footer>
        </div>
      </Match>
    </Switch>
  );
}
