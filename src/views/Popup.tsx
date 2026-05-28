import { createMemo, For, Match, onMount, Show, Switch } from "solid-js";
import { appStore, appStoreActions } from "@/shared/store.ts";
import { t } from "@/shared/i18n.ts";

import Header from "@/components/Header.tsx";
import StatusCard from "@/components/StatusCard.tsx";
import QuickAddBanner from "@/components/QuickAddBanner.tsx";
import RuleInputForm from "@/components/RuleInputForm.tsx";
import RuleItemView from "@/components/RuleItemView.tsx";
import Settings from "@/views/Settings.tsx";

import SearchIcon from "@/components/icons/SearchIcon.tsx";
import EmptyIcon from "@/components/icons/EmptyIcon.tsx";

export default function Popup() {
  onMount(async () => {
    await appStoreActions.init();
  });

  const filteredRules = createMemo(() => {
    const term = appStore.searchTerm.trim().toLowerCase();
    return appStore.rules.filter((r) => r.pattern.includes(term));
  });

  const rulesCount = createMemo(() => appStore.rules.length);

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

          {/* QUICK ADD BAR */}
          <QuickAddBanner
            visible={appStore.quickAddVisible}
            domain={appStore.currentActiveTabDomain}
            onQuickAdd={() => appStoreActions.quickAdd()}
          />

          {/* INPUT RULE FORM */}
          <RuleInputForm
            value={appStore.ruleInput}
            onInput={(val) => appStoreActions.setRuleInput(val)}
            onAdd={() => appStoreActions.addRule()}
          />

          {/* RULES PANEL */}
          <div class="rules-panel">
            <div class="panel-header">
              <h2>
                {t("rules_list_title")} (
                <span id="rule-count">{rulesCount()}</span>)
              </h2>
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

            {/* RULES LIST */}
            <div class="rules-scroll-area">
              <Show
                when={filteredRules().length > 0}
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
                <ul id="rules-list" class="rules-list" style="display: flex;">
                  <For each={filteredRules()}>
                    {(rule) => (
                      <RuleItemView
                        rule={rule}
                        expanded={appStore.expandedRule === rule.pattern}
                        onToggleExpanded={() =>
                          appStoreActions.setExpandedRule(
                            appStore.expandedRule === rule.pattern
                              ? null
                              : rule.pattern,
                          )}
                        onToggleActive={(active) =>
                          appStoreActions.toggleRuleActive(
                            rule.pattern,
                            active,
                          )}
                        onDelete={(el) =>
                          appStoreActions.deleteRule(rule.pattern, el)}
                        blockedSubdomains={appStore.blockedMap[rule.pattern] ||
                          []}
                        onAddSubdomain={(sub) =>
                          appStoreActions.addSubdomain(rule.pattern, sub)}
                        onToggleChildActive={(childPattern, active) =>
                          appStoreActions.toggleChildRuleActive(
                            rule.pattern,
                            childPattern,
                            active,
                          )}
                        onDeleteChild={(childPattern, el) =>
                          appStoreActions.deleteChildRule(
                            rule.pattern,
                            childPattern,
                            el,
                          )}
                      />
                    )}
                  </For>
                </ul>
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
