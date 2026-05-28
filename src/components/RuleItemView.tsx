import { For, Show } from "solid-js";
import type { RuleItem } from "@/shared/storage.ts";
import GlobeIcon from "@/components/icons/GlobeIcon.tsx";
import WildcardIcon from "@/components/icons/WildcardIcon.tsx";
import DeleteIcon from "@/components/icons/DeleteIcon.tsx";
import { t } from "@/shared/i18n.ts";

interface RuleItemViewProps {
  rule: RuleItem;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleActive: (active: boolean) => void;
  onDelete: (el: HTMLLIElement) => void;
  blockedSubdomains: string[];
  onAddSubdomain: (sub: string) => void;
  onToggleChildActive: (childPattern: string, active: boolean) => void;
  onDeleteChild: (childPattern: string, el: HTMLLIElement) => void;
}

export default function RuleItemView(props: RuleItemViewProps) {
  let itemRef: HTMLLIElement | undefined;

  const isWildcard = () => props.rule.pattern.includes("*");

  const hasChildrenOrErrors = () => {
    const hasErrors = (props.blockedSubdomains?.length || 0) > 0;
    const hasKids = !!(props.rule.children && props.rule.children.length > 0);
    return hasErrors || hasKids;
  };

  return (
    <li
      ref={itemRef}
      class="rule-item-container"
      classList={{
        "rule-disabled": !props.rule.active,
        "rule-expanded": props.expanded && hasChildrenOrErrors(),
      }}
    >
      <div class="rule-item">
        <div class="rule-info">
          <label
            class="rule-toggle"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={props.rule.active}
              onChange={(e) => props.onToggleActive(e.currentTarget.checked)}
            />
            <span class="rule-slider"></span>
          </label>
          <Show
            when={isWildcard()}
            fallback={<GlobeIcon />}
          >
            <WildcardIcon />
          </Show>
          <span
            class="rule-text"
            title={props.rule.pattern}
            style={hasChildrenOrErrors() ? "cursor: pointer;" : ""}
            onClick={() => hasChildrenOrErrors() && props.onToggleExpanded()}
          >
            {props.rule.pattern}
          </span>
          <Show
            when={props.rule.children && props.rule.children.length > 0}
          >
            <span
              class="child-count-badge"
              title={t("child_count_badge_title")}
              onClick={() => props.onToggleExpanded()}
            >
              🛡️ {props.rule.children.length}
            </span>
          </Show>
          <Show when={(props.blockedSubdomains?.length || 0) > 0}>
            <span
              class="error-badge"
              title={t("error_badge_title")}
              onClick={() => props.onToggleExpanded()}
            >
              ⚠️ {props.blockedSubdomains.length}
            </span>
          </Show>
        </div>
        <button
          type="button"
          class="delete-btn"
          title={t("delete_rule_title")}
          onClick={() => itemRef && props.onDelete(itemRef)}
        >
          <DeleteIcon />
        </button>
      </div>

      {/* Subdomain Accordion */}
      <Show
        when={props.expanded && hasChildrenOrErrors()}
      >
        <div class="subdomain-list-container">
          {/* 1. List of already added nested children rules */}
          <Show
            when={props.rule.children && props.rule.children.length > 0}
          >
            <ul class="subdomain-list">
              <For each={props.rule.children}>
                {(child) => {
                  let childRef: HTMLLIElement | undefined;
                  return (
                    <li
                      ref={childRef}
                      class="subdomain-item"
                      classList={{
                        "rule-disabled": !child.active,
                      }}
                    >
                      <div class="subdomain-info">
                        <label
                          class="rule-toggle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={child.active}
                            onChange={(e) =>
                              props.onToggleChildActive(
                                child.pattern,
                                e.currentTarget.checked,
                              )}
                          />
                          <span class="rule-slider"></span>
                        </label>
                        <span
                          class="subdomain-text"
                          title={child.pattern}
                        >
                          {child.pattern}
                        </span>
                      </div>
                      <button
                        type="button"
                        class="delete-btn mini-delete-btn"
                        title={t("delete_child_title")}
                        onClick={() =>
                          childRef &&
                          props.onDeleteChild(
                            child.pattern,
                            childRef,
                          )}
                      >
                        <DeleteIcon />
                      </button>
                    </li>
                  );
                }}
              </For>
            </ul>
          </Show>

          {/* 2. List of failed subdomains */}
          <Show when={(props.blockedSubdomains?.length || 0) > 0}>
            <div class="nested-header warning-header">
              {t("subdomain_header")}
            </div>
            <ul class="subdomain-list">
              <For each={props.blockedSubdomains}>
                {(subdomain) => (
                  <li class="subdomain-item">
                    <div class="subdomain-info">
                      <span class="subdomain-bullet"></span>
                      <span
                        class="subdomain-text text-warning"
                        title={subdomain}
                      >
                        {subdomain}
                      </span>
                    </div>
                    <button
                      type="button"
                      class="subdomain-add-btn"
                      onClick={() => props.onAddSubdomain(subdomain)}
                      title={t("subdomain_add_btn")}
                    >
                      {t("subdomain_add_btn")}
                    </button>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>
      </Show>
    </li>
  );
}
