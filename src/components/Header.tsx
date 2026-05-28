import LogoIcon from "@/components/icons/LogoIcon.tsx";
import { appStoreActions } from "@/shared/store.ts";
import { t } from "@/shared/i18n.ts";

interface HeaderProps {
  showBack?: boolean;
}

export default function Header(props: HeaderProps) {
  return (
    <header class="app-header">
      {props.showBack
        ? (
          <div class="back-navigation">
            <button
              type="button"
              class="header-btn back-btn"
              title={t("btn_go_back")}
              onClick={() => appStoreActions.navigate("main")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                width="20"
                height="20"
              >
                <path
                  fill-rule="evenodd"
                  d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <span class="settings-header-title">{t("settings_title")}</span>
          </div>
        )
        : (
          <div class="logo-area">
            <LogoIcon />
            <div class="brand-text">
              <h1>
                Smart<span class="accent-text">Onion</span>
              </h1>
              <span class="sub-brand">{t("app_subtitle")}</span>
            </div>
          </div>
        )}

      {!props.showBack && (
        <div class="header-actions" style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            class="header-btn help-btn"
            title={t("guide_title")}
            onClick={() =>
              chrome.tabs.create({ url: chrome.runtime.getURL("guide.html") })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
              width="20"
              height="20"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
              />
            </svg>
          </button>

          <button
            type="button"
            class="header-btn settings-btn"
            title={t("settings_title")}
            onClick={() =>
              appStoreActions.navigate("settings")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
              width="20"
              height="20"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869L9.594 3.94z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
}
