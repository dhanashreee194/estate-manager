import { useEffect, useState } from "react";
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
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");

  // Start waking the free-tier API while the user is still typing.
  useEffect(() => {
    api.get("/health").catch(() => {});
  }, []);

  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const timer = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(timer);
  }, [loading]);

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

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || t("auth.loginFailed"),
      );
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

      <section className="auth-hero" aria-label={t("nav.brand")}>
        <span className="logo-mark" aria-hidden />
        <h1>{t("nav.brand")}</h1>
        <p className="subtitle">{t("auth.subtitle")}</p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <h2>{t("auth.login")}</h2>
          <p className="muted">{t("auth.loginHint")}</p>
          {error && <p className="error-text">{error}</p>}

          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="login-email">{t("auth.email")}</label>
              <input
                id="login-email"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label htmlFor="login-password">{t("auth.password")}</label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button className="primary-btn" disabled={loading} type="submit">
              {loading ? t("common.loading") : t("auth.login")}
            </button>
            {slow && <p className="muted auth-wait-hint">{t("auth.serverWaking")}</p>}
          </form>

          <p className="footer-text">
            {t("auth.noAccount")}{" "}
            <Link to="/signup">{t("auth.signup")}</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
