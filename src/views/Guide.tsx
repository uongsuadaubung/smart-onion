import { type Component, createSignal, onMount, Show } from "solid-js";
import { appStore, appStoreActions } from "@/shared/store.ts";
import { t } from "@/shared/i18n.ts";
import LogoIcon from "@/components/icons/LogoIcon.tsx";
import StatusCard from "@/components/StatusCard.tsx";

export const Guide: Component = () => {
  const GuideTab = {
    General: "general",
    BatTorrc: "bat-torrc",
    Troubleshooting: "troubleshooting",
    FAQ: "faq",
    Security: "security",
  } as const;

  type GuideTab = typeof GuideTab[keyof typeof GuideTab];

  const [activeTab, setActiveTab] = createSignal<GuideTab>(GuideTab.General);

  onMount(async () => {
    // Add native guide body class for layout
    document.body.classList.add("guide-body-native");
    await appStoreActions.init();
  });

  return (
    <Show when={appStore.isLoaded}>
      <div class="guide-wrapper">
        {/* Top Navigation Bar */}
        <header class="guide-header">
          <div class="logo-area">
            <LogoIcon />
            <div class="brand">
              <h1 class="accent-text">SmartOnion</h1>
              <span class="badge">v{chrome.runtime.getManifest().version}</span>
            </div>
          </div>

          <div class="header-controls">
            {/* Quick Language Switcher */}
            <div class="lang-selector">
              <span>🌐</span>
              <div class="select-wrapper" style={{ width: "120px" }}>
                <select
                  id="select-lang"
                  class="setting-select"
                  value={appStore.language}
                  onChange={(e) =>
                    appStoreActions.updateLanguage(
                      e.currentTarget.value as "en" | "vi",
                    )}
                  style={{
                    padding: "6px 28px 6px 12px",
                    "font-size": "12px",
                    "border-radius": "20px",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              class="outline-button"
              onClick={() => globalThis.close()}
              style={{
                padding: "6px 16px",
                "font-size": "12px",
                "border-radius": "20px",
                background: "transparent",
                border: "1.5px solid var(--border-subtle)",
                color: "var(--text-main)",
                cursor: "pointer",
                transition: "var(--transition-smooth)",
              }}
            >
              {t("guide_close_page")}
            </button>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div class="guide-container">
          {/* Sidebar Navigation */}
          <aside class="guide-sidebar">
            <nav class="tabs-nav">
              <button
                type="button"
                class={`nav-tab ${
                  activeTab() === GuideTab.General ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.General)}
              >
                <span class="tab-icon">📖</span>
                <span class="tab-label">{t("guide_tab_general")}</span>
              </button>

              <button
                type="button"
                class={`nav-tab ${
                  activeTab() === GuideTab.BatTorrc ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.BatTorrc)}
              >
                <span class="tab-icon">📄</span>
                <span class="tab-label">{t("guide_tab_bat_torrc")}</span>
              </button>

              <button
                type="button"
                class={`nav-tab ${
                  activeTab() === GuideTab.Troubleshooting ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.Troubleshooting)}
              >
                <span class="tab-icon">🛠️</span>
                <span class="tab-label">{t("guide_tab_trouble")}</span>
              </button>

              <button
                type="button"
                class={`nav-tab ${
                  activeTab() === GuideTab.FAQ ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.FAQ)}
              >
                <span class="tab-icon">💡</span>
                <span class="tab-label">{t("guide_tab_faq")}</span>
              </button>

              <button
                type="button"
                class={`nav-tab ${
                  activeTab() === GuideTab.Security ? "active" : ""
                }`}
                onclick={() => setActiveTab(GuideTab.Security)}
              >
                <span class="tab-icon">🛡️</span>
                <span class="tab-label">{t("guide_tab_security")}</span>
              </button>
            </nav>

            {/* Quick Action Card */}
            <div class="quick-action-card">
              <h3>SmartOnion</h3>
              <p>{t("guide_quick_action_desc")}</p>
              <a
                href="https://www.torproject.org/download/tor/"
                target="_blank"
                rel="noopener noreferrer"
                class="game-btn"
                style={{
                  display: "block",
                  "text-align": "center",
                  background:
                    "linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))",
                  color: "#ffffff",
                  "font-weight": "700",
                  "font-size": "0.85rem",
                  padding: "10px",
                  "border-radius": "10px",
                  "text-decoration": "none",
                  transition: "all 0.2s",
                }}
              >
                🧅 {t("guide_step1_btn")}
              </a>
            </div>
          </aside>

          {/* Main Content Area */}
          <main class="guide-main-content">
            {/* GENERAL TAB */}
            <Show when={activeTab() === GuideTab.General}>
              <section class="tab-panel fade-in">
                <div class="hero-section">
                  <div class="hero-overlay">
                    <h2>{t("guide_welcome")}</h2>
                    <p>{t("guide_subtitle")}</p>
                  </div>
                </div>

                <div class="section-title">
                  <h2>
                    {appStore.language === "vi"
                      ? "3 Bước khởi đầu nhanh"
                      : "3 Quick Start Steps"}
                  </h2>
                  <div class="divider"></div>
                </div>

                <div class="steps-grid">
                  <section class="guide-step">
                    <div class="step-badge">
                      <span class="step-num">01</span>
                    </div>
                    <div class="step-text">
                      <h3>{t("guide_step1_title")}</h3>
                      <p>{t("guide_step1_desc")}</p>
                      <div style={{ "margin-top": "16px" }}>
                        <a
                          href="https://www.torproject.org/download/tor/"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="action-link-btn"
                        >
                          🌐 {t("guide_step1_btn")}
                        </a>
                      </div>
                    </div>
                  </section>

                  <section class="guide-step">
                    <div class="step-badge">
                      <span class="step-num">02</span>
                    </div>
                    <div class="step-text">
                      <h3>{t("guide_step2_title")}</h3>
                      <p>{t("guide_step2_desc")}</p>
                    </div>
                  </section>

                  <section class="guide-step">
                    <div class="step-badge">
                      <span class="step-num">03</span>
                    </div>
                    <div class="step-text">
                      <h3>{t("guide_step3_title")}</h3>
                      <p>{t("guide_step3_desc")}</p>
                    </div>
                  </section>
                </div>

                <div
                  class="tutorial-image-container"
                  style={{ "margin-top": "32px" }}
                >
                  <div class="tip-banner">
                    <span class="tip-icon">💡</span>
                    <p>{t("guide_note")}</p>
                  </div>
                </div>
              </section>
            </Show>

            {/* BAT & TORRC TAB */}
            <Show when={activeTab() === GuideTab.BatTorrc}>
              <section class="tab-panel fade-in">
                <div class="panel-header">
                  <h2>{t("guide_bat_torrc_title")}</h2>
                  <p>{t("guide_bat_torrc_desc")}</p>
                </div>

                <div class="steps-vertical">
                  <div class="vertical-step-card">
                    <div class="step-index">⚙️</div>
                    <div class="step-content">
                      <h3>{t("guide_torrc_section")}</h3>
                      <p>{t("guide_torrc_desc")}</p>

                      <pre
                        style={{
                          background: "var(--bg-input)",
                          border: "1.5px solid var(--border-subtle)",
                          padding: "16px",
                          "border-radius": "10px",
                          "font-family": "monospace",
                          "font-size": "13px",
                          color: "var(--text-main)",
                          "overflow-x": "auto",
                          "white-space": "pre",
                          "margin-top": "12px",
                        }}
                      >
{`# ==============================================================================
# Tor Standalone Expert Bundle Configuration (torrc)
# ==============================================================================

# 1. Mở cổng SOCKS5 kết nối cục bộ
SocksPort 9050

# 2. Khai báo các đường dẫn dạng tương đối dùng dấu gạch chéo xuôi "/" chống lỗi Escape Character
DataDirectory ../data
GeoIPFile ../data/geoip
GeoIPv6File ../data/geoip6

# 3. Tối ưu hóa Exit Node: Ưu tiên băng thông cao và làm loãng IP Pool
# Ưu tiên các Hub mạng gần Việt Nam và các nước có hạ tầng băng thông Gigabit cực lớn
ExitNodes {sg},{jp},{hk},{tw},{kr},{us},{de},{nl},{fr},{gb},{se},{ch}

# Tắt StrictNodes để tự động cân bằng tải và linh hoạt tự chọn Exit Node khác khi cần
StrictNodes 0

# Loại bỏ các quốc gia đường truyền chậm hoặc IP thường bị lạm dụng/spam
ExcludeNodes {cn},{ru},{ir},{sy},{kp},{pk},{cu},{by},{ua}

# 4. Tăng tính bảo mật, chống rò rỉ DNS để giảm tối đa xác suất bị xem là Bot
TestSocks 1
SafeSocks 1

# 5. Tăng thời gian sống của mạch nối lên 1 giờ để giữ kết nối cực kỳ ổn định, tránh lag
MaxCircuitDirtiness 3600
NewCircuitPeriod 120`}
                      </pre>
                    </div>
                  </div>

                  <div class="vertical-step-card">
                    <div class="step-index">💻</div>
                    <div class="step-content">
                      <h3>{t("guide_bat_section")}</h3>
                      <p>{t("guide_bat_desc")}</p>

                      <pre
                        style={{
                          background: "var(--bg-input)",
                          border: "1.5px solid var(--border-subtle)",
                          padding: "16px",
                          "border-radius": "10px",
                          "font-family": "monospace",
                          "font-size": "13px",
                          color: "var(--text-main)",
                          "overflow-x": "auto",
                          "white-space": "pre",
                          "margin-top": "12px",
                        }}
                      >
{`@echo off
title Tor Standalone Service (Port 9050)
cls

echo ========================================================
echo       TOR STANDALONE SERVICE LAUNCHER
echo ========================================================
echo [*] Dang khoi chay dich vu Tor tren cong SOCKS5 127.0.0.1:9050...
echo [*] Vui long giu cua so nay de duy tri mang Tor.
echo [*] De tat Tor, chi can dong cua so nay lai.
echo ========================================================
echo.

cd /d "%~dp0tor"
tor.exe -f torrc

echo.
echo [!] Tor da dung hoat dong.
pause`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div
                  class="tutorial-image-container"
                  style={{ "margin-top": "32px" }}
                >
                  <div class="tip-banner">
                    <span class="tip-icon">💡</span>
                    <p>{t("guide_bat_torrc_tip")}</p>
                  </div>
                </div>
              </section>
            </Show>

            {/* TROUBLESHOOTING TAB */}
            <Show when={activeTab() === GuideTab.Troubleshooting}>
              <section class="tab-panel fade-in">
                <div class="panel-header">
                  <h2>{t("guide_trouble_title")}</h2>
                  <p>{t("guide_trouble_desc")}</p>
                </div>

                {/* Connection Status Card */}
                <div style={{ "margin-bottom": "24px", "max-width": "400px" }}>
                  <StatusCard
                    isEnabled={appStore.isEnabled}
                    statusCardClass={appStore.statusCardClass}
                    statusDotClass={appStore.statusDotClass}
                    statusLabel={t(appStore.statusLabel)}
                    onToggleChange={(e) => appStoreActions.updateMasterToggle(
                      (e.currentTarget as HTMLInputElement).checked,
                    )}
                  />
                </div>

                <div class="steps-vertical">
                  <div class="vertical-step-card">
                    <div class="step-index">1</div>
                    <div class="step-content">
                      <h3>
                        {appStore.language === "vi"
                          ? "Kiểm tra Dịch vụ Tor (tor.exe)"
                          : "Check Tor Service (tor.exe)"}
                      </h3>
                      <p>{t("guide_trouble_step1")}</p>
                    </div>
                  </div>

                  <div class="vertical-step-card">
                    <div class="step-index">2</div>
                    <div class="step-content">
                      <h3>
                        {appStore.language === "vi"
                          ? "Sử dụng Cầu nối (Bridges)"
                          : "Use Bridges Connection"}
                      </h3>
                      <p>{t("guide_trouble_step2")}</p>
                    </div>
                  </div>

                  <div class="vertical-step-card">
                    <div class="step-index">3</div>
                    <div class="step-content">
                      <h3>
                        {appStore.language === "vi"
                          ? `Đảm bảo đúng cổng proxy (${appStore.proxyPort})`
                          : `Ensure proxy port is correct (${appStore.proxyPort})`}
                      </h3>
                      <p>{t("guide_trouble_step3")}</p>
                    </div>
                  </div>

                  <div class="vertical-step-card">
                    <div class="step-index">4</div>
                    <div class="step-content">
                      <h3>
                        {t("guide_trouble_step4")}
                      </h3>
                      <p>{t("guide_trouble_step4_desc")}</p>
                    </div>
                  </div>
                </div>
              </section>
            </Show>

            {/* FAQ TAB */}
            <Show when={activeTab() === GuideTab.FAQ}>
              <section class="tab-panel fade-in">
                <div class="panel-header">
                  <h2>
                    {appStore.language === "vi"
                      ? "Câu hỏi thường gặp"
                      : "Frequently Asked Questions"}
                  </h2>
                  <p>
                    {appStore.language === "vi"
                      ? "Các giải đáp nhanh giúp bạn làm chủ SmartOnion."
                      : "Quick answers to help you master SmartOnion."}
                  </p>
                </div>

                <div class="faq-grid">
                  <div class="faq-card text-highlight">
                    <h4>❓ {t("guide_faq_q1")}</h4>
                    <p>{t("guide_faq_a1")}</p>
                  </div>

                  <div class="faq-card">
                    <h4>❓ {t("guide_faq_q2")}</h4>
                    <p>{t("guide_faq_a2")}</p>
                  </div>

                  <div class="faq-card">
                    <h4>❓ {t("guide_faq_q3")}</h4>
                    <p>{t("guide_faq_a3")}</p>
                  </div>
                </div>
              </section>
            </Show>

            {/* SECURITY TAB */}
            <Show when={activeTab() === GuideTab.Security}>
              <section class="tab-panel fade-in">
                <div class="panel-header">
                  <h2>{t("guide_sec_title")}</h2>
                  <p>{t("guide_sec_desc")}</p>
                </div>

                <div class="steps-vertical">
                  <div class="vertical-step-card">
                    <div class="step-index">🔒</div>
                    <div class="step-content">
                      <h3>
                        {appStore.language === "vi"
                          ? "Cục bộ hoàn toàn"
                          : "100% Local Storage"}
                      </h3>
                      <p>{t("guide_sec_point1")}</p>
                    </div>
                  </div>

                  <div class="vertical-step-card">
                    <div class="step-index">📜</div>
                    <div class="step-content">
                      <h3>
                        {appStore.language === "vi"
                          ? "Mã nguồn mở và Sạch sẽ"
                          : "Open Source & Clean Code"}
                      </h3>
                      <p>{t("guide_sec_point2")}</p>
                    </div>
                  </div>

                  <div class="vertical-step-card">
                    <div class="step-index">🧅</div>
                    <div class="step-content">
                      <h3>
                        {appStore.language === "vi"
                          ? "Ủy quyền trực tiếp qua Tor"
                          : "Direct Routing via Tor SOCKS5"}
                      </h3>
                      <p>{t("guide_sec_point3")}</p>
                    </div>
                  </div>
                </div>
              </section>
            </Show>
          </main>
        </div>
      </div>
    </Show>
  );
};

export default Guide;
