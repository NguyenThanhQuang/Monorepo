// src/features/admin-auth/AdminLogin.tsx
import { useState } from "react";
import { User, Lock, ArrowLeft, Shield, Building2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

interface Props {
  adminType: "company" | "system";
  isLoading: boolean;
  onSubmit: (identifier: string, password: string) => void;
  onBack: () => void;
}

export function AdminLogin({
  adminType,
  isLoading,
  onSubmit,
  onBack,
}: Props) {
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const config = {
    company: {
      icon: Building2,
      title: t("companyAdminTitle"),
    },
    system: {
      icon: Shield,
      title: t("systemAdminTitle"),
    },
  };

  const Icon = config[adminType].icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow">
        <button onClick={onBack} className="flex items-center mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("backToHome")}
        </button>

        <div className="text-center mb-6">
          <Icon className="w-10 h-10 mx-auto mb-2" />
          <h1 className="text-xl font-semibold">
            {config[adminType].title}
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(identifier, password);
          }}
          className="space-y-4"
        >
          <div>
            <label>{t("username")}</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                className="pl-10 w-full border rounded p-2"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label>{t("password")}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                className="pl-10 w-full border rounded p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            {isLoading ? t("loggingIn") : t("login")}
          </button>
        </form>
      </div>
    </div>
  );
}
