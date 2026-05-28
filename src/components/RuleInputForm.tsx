import AddIcon from "@/components/icons/AddIcon.tsx";

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
          placeholder="Nhập tên miền (ví dụ: *.domain.*)"
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
        >
          <AddIcon />
        </button>
      </div>
    </div>
  );
}
