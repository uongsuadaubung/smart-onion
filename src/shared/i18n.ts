import { createSignal } from "solid-js";

export enum SupportLanguage {
  En = "en",
  Vi = "vi",
}

const translations = {
  [SupportLanguage.En]: {
    app_subtitle: "Bypass Censorship",
    status_checking: "Checking connection...",
    status_connecting: "Connecting...",
    status_connected: "Connected",
    status_disconnected: "Disconnected",
    quick_add_prefix: "Quick add this page: ",
    input_placeholder: "Enter domain (e.g. domain.com)",
    rules_list_title: "Routing rules",
    search_placeholder: "Search rules...",
    list_active_title: "Active on current site",
    list_other_title: "Other whitelisted sites",
    rule_add_btn: "[+] Add",
    empty_no_results: "No results found",
    empty_no_results_desc: 'No rules match the search keyword "{term}".',
    empty_no_rules: "No rules yet",
    empty_no_rules_desc:
      "All web traffic is going DIRECT to optimize speed. Please add rules to route via Tor.",
    delete_rule_title: "Delete this rule",
    child_count_badge_title: "Active subdomain rules protecting this site",
    error_badge_title: "Click to view blocked subdomains list",
    subdomain_header: "Blocked subdomains (Not added)",
    delete_child_title: "Delete this subdomain rule",
    subdomain_add_btn: "[+] Add",
    settings_title: "Settings",
    lang_label: "Language",
    port_label: "Tor SOCKS5 Port",
    setting_autopilot_label: "Auto-Pilot Bypass",
    setting_autopilot_desc:
      "Automatically add root domains to proxy routing rules when network connection failures or HTTP status blocks (403/451) are intercepted.",
    port_help_note:
      "🔒 Proxy host is locked to 127.0.0.1 for maximum security. Ensure this port matches the SocksPort inside your torrc configuration.",
    btn_go_back: "Back",
    btn_save: "Save",

    // Setup Guide Page
    guide_title: "Setup & Installation Guide",
    guide_subtitle:
      "Bypass internet censorship in 3 simple steps using Tor Expert Bundle",
    guide_step1_title: "Step 1: Download Tor Expert Bundle",
    guide_step1_desc:
      "Visit the official Tor Project website to download the lightweight Tor Expert Bundle (which contains the standalone Tor command-line service).",
    guide_step1_btn: "Download Tor Expert Bundle",
    guide_step2_title: "Step 2: Extract & Run Tor Service",
    guide_step2_desc:
      "Extract the downloaded archive. On Windows, run the 'tor.exe' binary inside the 'tor' folder. To run it persistently in the background, open command prompt as Administrator and run: tor.exe --service install. It starts a SOCKS5 proxy server at 127.0.0.1:9050.",
    guide_step3_title: "Step 3: Toggle SmartOnion ON",
    guide_step3_desc:
      "Open the SmartOnion popup dashboard, toggle the master switch ON. Blocked sites you visit will automatically appear in the active list for you to toggle ON, or let Auto-Pilot Bypass handle them automatically!",
    guide_status_checking: "Loading connection settings...",
    guide_note:
      "Tip: Unlike Tor Browser, Tor Expert Bundle runs quietly in the background as a lightweight system service, consuming minimal memory and CPU!",
    guide_close_page: "Close",
    guide_tab_general: "Quick Start",
    guide_tab_bat_torrc: "Script & Config",
    guide_tab_trouble: "Troubleshooting",
    guide_tab_faq: "FAQ",
    guide_tab_security: "Security",
    guide_welcome: "Welcome to SmartOnion!",
    guide_quick_action_desc:
      "SmartOnion routes your selected traffic through Tor proxy to bypass local blocks. Always official & secure.",
    guide_bat_torrc_title: "Optimize Startup Script & torrc Configuration",
    guide_bat_torrc_desc:
      "Configure an ultra-fast, robust standalone Tor background service.",
    guide_torrc_section: "1. Create optimized 'torrc' configuration file",
    guide_torrc_desc:
      "Navigate to the 'tor' folder inside your extracted directory (this folder contains the tor.exe executable). Create a new text file named 'torrc' (make sure to delete the .txt extension) and paste the optimized settings below. It is critical that this file is placed exactly in the 'tor' directory:",
    guide_bat_section: "2. Create easy-to-use launch script 'run-tor.bat'",
    guide_bat_desc:
      "Go back to the root directory (outside the 'tor' folder, next to data and docs). Create a new file named 'run-tor.bat' and paste the following Windows batch script:",
    guide_bat_torrc_tip:
      "Tip: Minimize the batch CMD window to let Tor run quietly and lightweight in the background on port 9050!",
    guide_trouble_title: "Why is my connection failing?",
    guide_trouble_desc:
      "If you see 'Disconnected' even when the extension is ON, verify the following steps:",
    guide_trouble_step1:
      "Make sure Tor Service (tor.exe) is actively running in the background. If the process is stopped, the SOCKS5 proxy at 127.0.0.1:9050 will not be available.",
    guide_trouble_step2:
      "Check if your network has extremely strict firewalls that block Tor directly. If so, configure Tor to use a bridge (e.g. obfs4 or meek-azure) in your torrc file.",
    guide_trouble_step3:
      "Verify that the SOCKS5 port configured in your 'torrc' file matches the SOCKS5 port specified in SmartOnion's Settings.",
    guide_trouble_step4: "Flush Browser Sockets Cache",
    guide_trouble_step4_desc:
      "If you recently changed the SOCKS5 port and connections fail, Chrome might still cache old socket pools. Open a new tab, navigate to 'chrome://net-internals/#sockets', and click 'Flush socket pools' to clear the browser cache instantly.",
    guide_faq_q1: "Does SmartOnion slow down my entire browsing speed?",
    guide_faq_a1:
      "No! This is the major benefit of SmartOnion. Only traffic matching your rules goes through Tor. All other websites connect directly at maximum speed.",
    guide_faq_q2:
      "How do I run Tor Expert Bundle automatically at Windows startup?",
    guide_faq_a2:
      "You can easily copy the 'run-tor.bat' launch script (or a shortcut of it) into your Windows Startup folder (press Win + R, type 'shell:startup', and hit Enter) to automatically boot the Tor service on system startup.",
    guide_faq_q3: "Can I customize the SOCKS5 proxy port?",
    guide_faq_a3:
      "Yes! You can customize the SOCKS5 proxy port under the Settings menu (it defaults to 9050 to match the official Tor client). The proxy host address is locked to 127.0.0.1 (localhost) to guarantee absolute local security and prevent SOCKS5 traffic or DNS from leaking over the network.",
    guide_sec_title: "Security & Privacy Guarantee",
    guide_sec_desc:
      "SmartOnion is designed with zero-tracking and absolute local privacy in mind.",
    guide_sec_point1:
      "Zero remote servers: All rules and settings are stored locally inside your browser.",
    guide_sec_point2:
      "Open Source & Clean code: We do not intercept password inputs, cookies, or track your browsing history.",
    guide_sec_point3:
      "Official Tor client: Traffic is directly sent to your local Tor client, utilizing standard SOCKS5 protocols.",
  },
  [SupportLanguage.Vi]: {
    app_subtitle: "Vượt tường lửa",
    status_checking: "Đang kiểm tra kết nối...",
    status_connecting: "Đang kết nối...",
    status_connected: "Đã kết nối",
    status_disconnected: "Mất kết nối",
    quick_add_prefix: "Thêm nhanh trang này: ",
    input_placeholder: "Nhập tên miền (ví dụ: domain.com)",
    rules_list_title: "Danh sách quy tắc",
    search_placeholder: "Tìm kiếm quy tắc...",
    list_active_title: "Hoạt động ở trang hiện tại",
    list_other_title: "Các trang web khác",
    rule_add_btn: "[+] Thêm",
    empty_no_results: "Không tìm thấy kết quả",
    empty_no_results_desc: 'Không có quy tắc nào khớp với từ khóa "{term}".',
    empty_no_rules: "Chưa có quy tắc nào",
    empty_no_rules_desc:
      "Tất cả lưu lượng web đang đi TRỰC TIẾP (DIRECT) để tối ưu tốc độ. Vui lòng thêm quy tắc để định tuyến qua Tor.",
    delete_rule_title: "Xóa quy tắc này",
    child_count_badge_title: "Số quy tắc con đang bảo vệ",
    error_badge_title: "Nhấp để xem danh sách tên miền con bị chặn",
    subdomain_header: "Phát hiện bị chặn (Chưa thêm)",
    delete_child_title: "Xóa quy tắc con này",
    subdomain_add_btn: "[+] Thêm",
    settings_title: "Cài đặt",
    lang_label: "Ngôn ngữ",
    setting_autopilot_label: "Tự động vượt tường lửa",
    setting_autopilot_desc:
      "Tự động thêm tên miền vào danh sách proxy khi phát hiện sự cố mất kết nối mạng hoặc lỗi máy chủ chặn truy cập (403/451).",
    port_label: "Cổng SOCKS5 Tor",
    port_help_note:
      "🔒 Địa chỉ Proxy được khóa cố định ở 127.0.0.1 để bảo mật tối đa. Hãy đảm bảo cổng này khớp với SocksPort trong cấu hình torrc của bạn.",
    btn_go_back: "Quay lại",
    btn_save: "Lưu",

    // Setup Guide Page
    guide_title: "Hướng dẫn Sử dụng & Cài đặt",
    guide_subtitle:
      "Vượt tường lửa Internet trong 3 bước cực kỳ đơn giản với Tor Expert Bundle",
    guide_step1_title: "Bước 1: Tải Tor Expert Bundle",
    guide_step1_desc:
      "Truy cập trang chủ chính thức của Tor Project để tải gói Tor Expert Bundle siêu nhẹ (chứa nhân dịch vụ Tor chạy bằng dòng lệnh độc lập).",
    guide_step1_btn: "Tải về Tor Expert Bundle",
    guide_step2_title: "Bước 2: Giải nén & Khởi chạy Tor Service",
    guide_step2_desc:
      "Giải nén tệp vừa tải. Trên Windows, chạy tệp 'tor.exe' trong thư mục 'tor'. Để cài đặt chạy ngầm vĩnh viễn, mở cmd với quyền Admin và chạy lệnh: tor.exe --service install. Máy chủ proxy SOCKS5 sẽ chạy tại 127.0.0.1:9050.",
    guide_step3_title: "Bước 3: Bật công tắc SmartOnion",
    guide_step3_desc:
      "Mở bảng điều khiển SmartOnion, bật công tắc tổng sang ON. Các trang bị chặn bạn truy cập sẽ tự động xuất hiện trong danh sách hoạt động để bạn gạt ON, hoặc để chế độ Tự động vượt tường lửa tự xử lý!",
    guide_status_checking: "Đang tải cài đặt kết nối...",
    guide_note:
      "Mẹo nhỏ: Khác với Tor Browser, Tor Expert Bundle chạy cực kỳ nhẹ nhàng dưới dạng dịch vụ hệ thống ngầm, không tốn tài nguyên RAM và CPU của máy tính!",
    guide_close_page: "Đóng",
    guide_tab_general: "Bắt đầu nhanh",
    guide_tab_bat_torrc: "Script & Config",
    guide_tab_trouble: "Sửa lỗi kết nối",
    guide_tab_faq: "Hỏi đáp",
    guide_tab_security: "Bảo mật",
    guide_welcome: "Chào mừng bạn đến với SmartOnion!",
    guide_quick_action_desc:
      "SmartOnion định tuyến thông minh lưu lượng đã chọn qua proxy Tor để vượt chặn. Tuyệt đối an toàn.",
    guide_bat_torrc_title: "Tạo file khởi chạy .bat & Cấu hình torrc tối ưu",
    guide_bat_torrc_desc:
      "Thiết lập môi trường dịch vụ Tor Expert Bundle độc lập, định tuyến mạng lân cận tốc độ cao.",
    guide_torrc_section: "1. Tạo file cấu hình 'torrc' tối ưu hóa",
    guide_torrc_desc:
      "Truy cập vào thư mục 'tor' bên trong thư mục giải nén (thư mục chứa tệp thực thi tor.exe). Tạo một file văn bản mới tên là 'torrc' (lưu ý xóa đuôi .txt nếu có) và dán cấu hình bên dưới. Bắt buộc file torrc phải được lưu trữ chính xác trong thư mục 'tor' này cạnh tor.exe:",
    guide_bat_section: "2. Tạo file khởi chạy nhanh 'run-tor.bat'",
    guide_bat_desc:
      "Quay lại thư mục gốc (bên ngoài thư mục 'tor', cạnh thư mục data và docs). Tạo một file mới tên là 'run-tor.bat' và dán đoạn mã kịch bản sau để tự động di chuyển thư mục và gọi tor.exe an toàn:",
    guide_bat_torrc_tip:
      "Mẹo: Bạn chỉ cần thu nhỏ cửa sổ CMD để dịch vụ tiếp tục chạy ngầm cực kỳ nhẹ nhàng trên cổng 9050 mà không chiếm tài nguyên RAM/CPU!",
    guide_trouble_title: "Tại sao kiểm tra kết nối thất bại?",
    guide_trouble_desc:
      "Nếu trạng thái hiển thị 'Mất kết nối' khi đã bật extension, vui lòng kiểm tra:",
    guide_trouble_step1:
      "Chắc chắn rằng dịch vụ Tor (tor.exe) vẫn đang mở và chạy ngầm. Nếu tiến trình này bị dừng, proxy SOCKS5 tại địa chỉ 127.0.0.1:9050 sẽ không hoạt động.",
    guide_trouble_step2:
      "Kiểm tra xem mạng của bạn có chặn Tor trực tiếp không. Nếu có, bạn cần thiết lập cấu hình cầu nối (Bridges) trong tệp cấu hình torrc.",
    guide_trouble_step3:
      "Đảm bảo cổng SOCKS5 cấu hình trong file 'torrc' trùng khớp hoàn toàn với Cổng SOCKS5 Tor bạn lưu trong Cài đặt của SmartOnion.",
    guide_trouble_step4: "Dọn dẹp bộ đệm Socket",
    guide_trouble_step4_desc:
      "Nếu bạn vừa đổi cổng SOCKS5 và gặp lỗi kết nối, trình duyệt có thể vẫn lưu socket cũ. Hãy mở tab mới, truy cập 'chrome://net-internals/#sockets' và bấm nút 'Flush socket pools' để dọn sạch bộ đệm tức thì.",
    guide_faq_q1:
      "SmartOnion có làm chậm toàn bộ tốc độ duyệt web của tôi không?",
    guide_faq_a1:
      "Không! Đây là ưu điểm vượt trội của SmartOnion. Chỉ những trang web khớp quy tắc mới qua Tor. Các trang khác đi trực tiếp với tốc độ gốc tối đa.",
    guide_faq_q2: "Làm thế nào để chạy Tor Expert Bundle tự động cùng Windows?",
    guide_faq_a2:
      "Bạn có thể sao chép tệp khởi chạy 'run-tor.bat' (hoặc shortcut của nó) vào thư mục Startup của Windows (bấm tổ hợp phím Win + R, nhập 'shell:startup' và nhấn Enter) để dịch vụ tự động chạy ngầm mỗi khi khởi động máy.",
    guide_faq_q3: "Tôi có thể tùy chỉnh cổng proxy SOCKS5 không?",
    guide_faq_a3:
      "Có! Bạn có thể dễ dàng tùy chỉnh cổng SOCKS5 trong phần Cài đặt (mặc định là 9050 để khớp với Tor client chính thức). Địa chỉ máy chủ proxy (host) được khóa cố định ở 127.0.0.1 (localhost) nhằm đảm bảo an toàn tuyệt đối, tránh rò rỉ dữ liệu hoặc DNS qua mạng.",
    guide_sec_title: "Cam kết An toàn & Bảo mật",
    guide_sec_desc:
      "SmartOnion được thiết kế với tiêu chí bảo mật tuyệt đối, không thu thập dữ liệu.",
    guide_sec_point1:
      "Không máy chủ trung gian: Mọi quy tắc và cài đặt được lưu trữ cục bộ.",
    guide_sec_point2:
      "Mã nguồn mở & Sạch sẽ: Hoàn toàn không can thiệp mật khẩu, cookie, hay theo dõi lịch sử.",
    guide_sec_point3:
      "Kết nối trực tiếp: Lưu lượng đi thẳng từ máy bạn tới client Tor nội bộ thông qua chuẩn SOCKS5 an toàn.",
  },
};

const [currentLanguageCode, setCurrentLanguageCode] = createSignal<
  SupportLanguage
>(SupportLanguage.Vi);

export function setLanguage(code: SupportLanguage): void {
  setCurrentLanguageCode(code);
}

export function currentLanguage(): SupportLanguage {
  return currentLanguageCode();
}

export function t(
  key: keyof typeof translations[SupportLanguage.Vi],
  params?: Record<string, string>,
): string {
  let val = translations[currentLanguageCode()][key] ||
    translations[SupportLanguage.Vi][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      val = val.replace(`{${k}}`, v);
    });
  }
  return val;
}
