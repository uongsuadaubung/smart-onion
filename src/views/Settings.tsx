import { createSignal, onMount } from "solid-js";
import { appStore, appStoreActions } from "@/shared/store.ts";
import Header from "@/components/Header.tsx";
import { t } from "@/shared/i18n.ts";

export default function Settings() {
  const [langInput, setLangInput] = createSignal<"en" | "vi">("vi");
  const [portInput, setPortInput] = createSignal<number>(9050);

  onMount(() => {
    setLangInput(appStore.language);
    setPortInput(appStore.proxyPort);
  });

  const handleSave = async () => {
    await appStoreActions.updateLanguage(langInput());
    await appStoreActions.updateProxyPort(portInput());
    appStoreActions.navigate("main");
  };

  return (
    <div class="settings-view">
      <Header showBack />

      <main class="settings-main">
        <div class="setting-group">
          <label for="select-lang" class="setting-label">
            {t("lang_label")}
          </label>
          <div class="select-wrapper">
            <select
              id="select-lang"
              class="setting-select"
              value={langInput()}
              onChange={(e) =>
                setLangInput(e.currentTarget.value as "en" | "vi")}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div class="setting-group" style={{ "margin-top": "20px" }}>
          <label for="input-port" class="setting-label">
            {t("port_label")}
          </label>
          <input
            type="number"
            id="input-port"
            class="setting-input"
            value={portInput()}
            onInput={(e) => {
              const val = parseInt(e.currentTarget.value);
              setPortInput(isNaN(val) ? 9050 : val);
            }}
            min="1"
            max="65535"
          />
          <span
            style={{
              "font-size": "11px",
              color: "var(--text-muted)",
              "line-height": "1.4",
              "margin-top": "4px",
            }}
          >
            {t("port_help_note")}
          </span>
        </div>

        <div class="settings-actions">
          <button
            type="button"
            class="glow-button save-settings-btn"
            onClick={handleSave}
          >
            {t("btn_save")}
          </button>
        </div>
      </main>
    </div>
  );
}
