import { Building2 } from "lucide-react";
import { LoginForm } from "../forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="obtp-auth">
      <div className="w-full max-w-[460px]">
        <div className="obtp-card obtp-card-strong obtp-auth-card">
          <div className="obtp-auth-header">
            <div className="obtp-auth-logo" aria-hidden="true">
              <Building2 size={34} />
            </div>
            <h1 className="obtp-auth-title">Quản Lý Nhà Xe</h1>
            <p className="obtp-auth-subtitle">
              Đăng nhập để quản trị doanh nghiệp của bạn
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
