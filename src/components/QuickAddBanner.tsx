import { Show } from "solid-js";
import QuickAddIcon from "@/components/icons/QuickAddIcon.tsx";
import { t } from "@/shared/i18n.ts";


interface QuickAddBannerProps {
  visible: boolean;
  domain: string;
  onQuickAdd: () => void;
}

export default function QuickAddBanner(props: QuickAddBannerProps) {
  return (
    <Show when={props.visible}>
      <div class="quick-add-container" id="quick-add-panel">
        <button
          type="button"
          class="quick-add-btn"
          id="quick-add-btn"
          onClick={props.onQuickAdd}
        >
          <QuickAddIcon />
          <span>
            {t("quick_add_prefix")}
            <strong id="current-domain">{props.domain}</strong>
          </span>
        </button>
      </div>
    </Show>
  );
}
