import { useLanguage } from "@/contexts/LanguageContext";
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuthLogic } from "../hooks/useAuthLogic";

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const logic = useAuthLogic({ onLoginSuccess });
  const { t } = useLanguage();

  const passwordChecks = {
    minLength: logic.password.length >= 8,
    upper: /[A-Z]/.test(logic.password),
    lower: /[a-z]/.test(logic.password),
    number: /\d/.test(logic.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(logic.password),
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const isPasswordMatch =
    logic.password === logic.confirmPassword && logic.confirmPassword !== "";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {logic.mode === "login" && t("login")}
              {logic.mode === "register" && t("register")}
              {logic.mode === "forgot-password" && t("forgotPassword")}
              {logic.mode === "verify-email" && "Xác thực email"}
            </h2>
            <div className="w-10" />
          </div>

          {/* LOGO */}
          {logic.mode !== "verify-email" && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center bg-linear-to-br from-blue-600 to-teal-500 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <span className="text-4xl">🚌</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {logic.mode === "login" && t("loginSubtitle")}
                {logic.mode === "register" && t("registerSubtitle")}
                {logic.mode === "forgot-password" &&
                  t("forgotPasswordSubtitle")}
              </p>
            </div>
          )}

          {/* CONTENT */}
          {logic.mode === "verify-email" ? (
            <VerifyEmailScreen
              email={logic.registeredEmail}
              onBackToLogin={() => logic.setMode("login")}
              onResend={logic.handleResendVerification}
              loading={logic.loading}
            />
          ) : (
            <>
              <form onSubmit={logic.handleSubmit} className="space-y-4">
                {/* REGISTER FIELDS */}
                {logic.mode === "register" && (
                  <>
                    <Input
                      icon={<UserIcon />}
                      placeholder={t("enterFullName")}
                      value={logic.fullName}
                      onChange={(e) => logic.setFullName(e.target.value)}
                    />
                    <Input
                      icon={<Phone />}
                      placeholder={t("enterPhoneNumber")}
                      value={logic.phone}
                      onChange={(e) => logic.setPhone(e.target.value)}
                    />
                  </>
                )}

                {/* EMAIL */}
                <Input
                  icon={<Mail />}
                  type="email"
                  placeholder={t("enterEmail")}
                  value={logic.email}
                  onChange={(e) => logic.setEmail(e.target.value)}
                />

                {/* PASSWORD FIELDS */}
                {logic.mode !== "forgot-password" && (
                  <Input
                    icon={<Lock />}
                    type={logic.showPassword ? "text" : "password"}
                    placeholder={t("enterPassword")}
                    value={logic.password}
                    onChange={(e) => logic.setPassword(e.target.value)}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() =>
                          logic.setShowPassword(!logic.showPassword)
                        }
                      >
                        {logic.showPassword ? <EyeOff /> : <Eye />}
                      </button>
                    }
                  />
                )}

                {/* PASSWORD RULES */}
                {logic.mode === "register" && logic.password && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl space-y-2">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Yêu cầu mật khẩu:
                    </p>
                    <PasswordRule
                      ok={passwordChecks.minLength}
                      text="Ít nhất 8 ký tự"
                    />
                    <PasswordRule
                      ok={passwordChecks.upper}
                      text="Có chữ hoa (A-Z)"
                    />
                    <PasswordRule
                      ok={passwordChecks.lower}
                      text="Có chữ thường (a-z)"
                    />
                    <PasswordRule
                      ok={passwordChecks.number}
                      text="Có số (0-9)"
                    />
                    <PasswordRule
                      ok={passwordChecks.special}
                      text="Có ký tự đặc biệt"
                    />
                  </div>
                )}

                {/* CONFIRM PASSWORD */}
                {logic.mode === "register" && (
                  <Input
                    icon={<Lock />}
                    type={logic.showConfirmPassword ? "text" : "password"}
                    placeholder={t("enterConfirmPassword")}
                    value={logic.confirmPassword}
                    onChange={(e) => logic.setConfirmPassword(e.target.value)}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() =>
                          logic.setShowConfirmPassword(
                            !logic.showConfirmPassword,
                          )
                        }
                      >
                        {logic.showConfirmPassword ? <EyeOff /> : <Eye />}
                      </button>
                    }
                  />
                )}

                {logic.mode === "register" &&
                  logic.confirmPassword &&
                  !isPasswordMatch && (
                    <p className="text-sm text-red-500">
                      Mật khẩu xác nhận không khớp
                    </p>
                  )}

                {/* FORGOT PASSWORD LINK */}
                {logic.mode === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => logic.setMode("forgot-password")}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {t("forgotPassword")}?
                    </button>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={
                    logic.loading ||
                    (logic.mode === "register" &&
                      (!isPasswordValid || !isPasswordMatch))
                  }
                  className="w-full py-4 bg-linear-to-r from-blue-600 to-teal-500 text-white rounded-2xl disabled:opacity-50 hover:from-blue-700 hover:to-teal-600 transition-all duration-300"
                >
                  {logic.loading
                    ? t("loading")
                    : logic.mode === "login"
                      ? t("login")
                      : logic.mode === "register"
                        ? t("register")
                        : t("resetPassword")}
                </button>
              </form>

              {/* FOOTER SWITCH */}
              <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
                {logic.mode === "login" && (
                  <>
                    {t("noAccount")}{" "}
                    <button
                      onClick={() => logic.setMode("register")}
                      className="text-blue-600 hover:underline"
                    >
                      {t("registerNow")}
                    </button>
                  </>
                )}
                {logic.mode === "register" && (
                  <>
                    {t("haveAccount")}{" "}
                    <button
                      onClick={() => logic.setMode("login")}
                      className="text-blue-600 hover:underline"
                    >
                      {t("loginNow")}
                    </button>
                  </>
                )}
                {logic.mode === "forgot-password" && (
                  <button
                    onClick={() => logic.setMode("login")}
                    className="text-blue-600 hover:underline"
                  >
                    {t("backToLogin")}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function VerifyEmailScreen({ email, onBackToLogin, onResend, loading }: any) {
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center bg-linear-to-br from-green-500 to-teal-500 text-white p-6 rounded-3xl shadow-lg mb-6">
        <Mail className="w-12 h-12" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        Xác thực email của bạn
      </h3>
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-6">
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          Chúng tôi đã gửi email xác thực đến:
        </p>
        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 break-all">
          {email}
        </p>
      </div>
      <div className="space-y-3">
        <button
          onClick={onResend}
          disabled={loading}
          className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50 font-medium"
        >
          {loading ? "Đang gửi..." : "Gửi lại email xác thực"}
        </button>
        <button
          onClick={onBackToLogin}
          className="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-colors"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
}

function PasswordRule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {ok ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
      <span className={ok ? "text-green-600" : "text-red-500"}>{text}</span>
    </div>
  );
}

function Input({
  icon,
  rightIcon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
  rightIcon?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        {icon}
      </span>
      <input
        {...props}
        className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white transition-all"
      />
      {rightIcon && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
          {rightIcon}
        </span>
      )}
    </div>
  );
}
