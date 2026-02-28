import { useMemo, useState } from "react";
import { Trash2, Link2, Moon, Sun } from "lucide-react";
import { useTheme } from "../../../app/providers";

export default function SettingsPage() { 
  const { theme, toggleTheme } = useTheme();
  const [cleared, setCleared] = useState(false);

  const apiBase = useMemo(() => {
    const env = (import.meta as any).env || {};
    return env.VITE_API_BASE_URL || env.VITE_API_URL || "Chưa cấu hình .env";
  }, []);

  const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminUser");
    setCleared(true);
    setTimeout(() => setCleared(false), 1500);
  };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div>
        <div style={{ fontSize: 28, fontWeight: 900 }}>Cài đặt</div>
        <div style={{ color: "var(--obtp-muted2)" }}>
          Thiết lập giao diện và thông tin kết nối (local).
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        <div className="obtp-card" style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              className="obtp-auth-logo"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                marginBottom: 0,
              }}
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div>
              <div style={{ fontWeight: 900 }}>Giao diện</div>
              <div style={{ color: "var(--obtp-muted2)", fontSize: 13 }}>
                Đang dùng: {theme === "light" ? "Sáng" : "Tối"}
              </div>
            </div>
          </div>

          <button
            className="obtp-btn-secondary"
            type="button"
            onClick={toggleTheme}
          >
            {theme === "light" ? "Chuyển sang tối" : "Chuyển sang sáng"}
          </button>
        </div>

        <div className="obtp-card" style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              className="obtp-auth-logo"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                marginBottom: 0,
              }}
            >
              <Link2 size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 900 }}>Kết nối API</div>
              <div style={{ color: "var(--obtp-muted2)", fontSize: 13 }}>
                Portal dùng base URL từ{" "}
                <code style={{ opacity: 0.9 }}>.env</code>
              </div>
            </div>
          </div>

          <input className="obtp-input" value={apiBase} readOnly />

          <div
            style={{
              color: "var(--obtp-muted2)",
              fontSize: 12,
              marginTop: 10,
              lineHeight: 1.6,
            }}
          >
            Nếu bạn đổi API sang IP/domain khác, hãy sửa{" "}
            <code>VITE_API_BASE_URL</code> và <code>VITE_API_URL</code> trong{" "}
            <code>apps/portal/.env</code> rồi chạy lại dev server.
          </div>
        </div>

        <div className="obtp-card" style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <div
              className="obtp-auth-logo"
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                marginBottom: 0,
                background:
                  "linear-gradient(135deg, rgba(239,68,68,.95), rgba(245,158,11,.90))",
              }}
            >
              <Trash2 size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 900 }}>Dọn dẹp</div>
              <div style={{ color: "var(--obtp-muted2)", fontSize: 13 }}>
                Xoá token lưu trên trình duyệt để test đăng nhập lại.
              </div>
            </div>
          </div>

          <button
            className="obtp-btn-secondary"
            type="button"
            onClick={clearTokens}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
            >
              <Trash2 size={18} />
              <span>{cleared ? "Đã xoá!" : "Xoá token"}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
