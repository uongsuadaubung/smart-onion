import AddIcon from "@/components/icons/AddIcon.tsx";
import { t } from "@/shared/i18n.ts";
import { isValidRuleInput } from "@/shared/store.ts";



interface RuleInputFormProps {
  value: string;
  onInput: (value: string) => void;
  onAdd: () => void;
}

export default function RuleInputForm(props: RuleInputFormProps) {
  return (
    <div class="form-card">
      <div class="input-group">
        <input
          type="text"
          id="rule-input"
          placeholder={t("input_placeholder")}
          autocomplete="off"
          value={props.value}
          onInput={(e) => props.onInput(e.currentTarget.value)}
          onKeyDown={(e) => e.key === "Enter" && props.onAdd()}
        />
        <button
          type="button"
          id="add-rule-btn"
          class="glow-button"
          onClick={props.onAdd}
          disabled={!isValidRuleInput(props.value)}
        >
          <AddIcon />
        </button>
      </div>
    </div>
  );
}
