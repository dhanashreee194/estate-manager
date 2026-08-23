import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./auth.css";
import api from "../api/axios";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeSwitcher from "../components/ThemeSwitcher";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const data = res.data;

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user.role;

      if (role === "ADMIN") {
        navigate("/dashboard");
      } else if (role === "SALES") {
        navigate("/sales");
      } else if (role === "ACCOUNTANT") {
        navigate("/accounts");
      } else {
        navigate("/login");
      }
    } catch (err: any) {
      setError(err.message || t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-controls">
        <ThemeSwitcher compact />
        <LanguageSwitcher compact />
      </div>
      <div className="brand">
        <h1>🏗️ {t("nav.brand")}</h1>
        <p className="subtitle">{t("auth.subtitle")}</p>
      </div>

      <div className="auth-card">
        <h2>{t("auth.login")}</h2>
        <p className="muted">{t("auth.loginHint")}</p>
        {error && <p className="muted" style={{ color: "#f87171" }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>{t("auth.email")}</label>
            <input
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>{t("auth.password")}</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="primary-btn" disabled={loading}>
            {t("auth.login")}
          </button>
        </form>

        <p className="footer-text">
          {t("auth.noAccount")}{" "}
          <Link to="/signup">{t("auth.signup")}</Link>
        </p>
      </div>
    </div>
  );
}
