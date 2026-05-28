interface StatusCardProps {
  isEnabled: boolean;
  statusCardClass: string;
  statusDotClass: string;
  statusLabel: string;
  onToggleChange: (e: Event) => void;
}

export default function StatusCard(props: StatusCardProps) {
  return (
    <div class={props.statusCardClass} id="status-card">
      <div class="status-indicator">
        <span class={props.statusDotClass} id="status-dot"></span>
        <span class="status-label" id="status-label">{props.statusLabel}</span>
      </div>

      {/* MASTER TOGGLE */}
      <div class="toggle-container">
        <label class="switch">
          <input
            type="checkbox"
            id="master-toggle"
            checked={props.isEnabled}
            onChange={props.onToggleChange}
          />
          <span class="slider round"></span>
        </label>
      </div>
    </div>
  );
}
