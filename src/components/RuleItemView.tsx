import { Show } from "solid-js";
import type { RuleItem } from "@/shared/storage.ts";
import GlobeIcon from "@/components/icons/GlobeIcon.tsx";
import DeleteIcon from "@/components/icons/DeleteIcon.tsx";
import { t } from "@/shared/i18n.ts";

interface RuleItemViewProps {
  rule?: RuleItem;
  discoveredPattern?: string;
  onToggleActive?: (active: boolean) => void;
  onDelete?: (el: HTMLLIElement) => void;
  onAdd?: () => void;
}

export default function RuleItemView(props: RuleItemViewProps) {
  let itemRef: HTMLLIElement | undefined;

  const isDiscovered = () => props.discoveredPattern !== undefined;
  const pattern = () => {
    const r = props.rule;
    if (r) return r.pattern;
    const dp = props.discoveredPattern;
    if (dp !== undefined) return dp;
    return "";
  };
  const isActive = () => {
    const r = props.rule;
    if (r) return r.active;
    return false;
  };

  return (
    <li
      ref={itemRef}
      class="rule-item-container"
      classList={{
        "rule-disabled": !isDiscovered() && !isActive(),
        "rule-discovered": isDiscovered(),
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
              checked={isDiscovered() ? false : isActive()}
              onChange={(e) => {
                const checked = e.currentTarget.checked;
                if (isDiscovered()) {
                  if (checked && props.onAdd) {
                    props.onAdd();
                  }
                } else {
                  if (props.onToggleActive) {
                    props.onToggleActive(checked);
                  }
                }
              }}
            />
            <span class="rule-slider"></span>
          </label>

          <GlobeIcon />

          <span
            class="rule-text"
            title={pattern()}
          >
            {pattern()}
          </span>
        </div>

        <Show when={!isDiscovered()}>
          <button
            type="button"
            class="delete-btn"
            title={t("delete_rule_title")}
            onClick={() => itemRef && props.onDelete && props.onDelete(itemRef)}
          >
            <DeleteIcon />
          </button>
        </Show>
      </div>
    </li>
  );
}
