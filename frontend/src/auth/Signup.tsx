import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../api/baseUrl";
import "./auth.css";
import LanguageSwitcher from "../components/LanguageSwitcher";
import ThemeSwitcher from "../components/ThemeSwitcher";

export default function Signup() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    adminName: "",
    adminEmail: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        alert(t("auth.signupFailed"));
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/dashboard";
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
          <h2>{t("auth.signup")}</h2>
          <p className="muted">{t("auth.signupHint")}</p>

          <form onSubmit={handleSignup}>
            <div className="field">
              <label htmlFor="companyName">{t("auth.companyName")}</label>
              <input
                id="companyName"
                name="companyName"
                placeholder="Green Valley Builders"
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="companyEmail">{t("auth.companyEmail")}</label>
              <input
                id="companyEmail"
                name="companyEmail"
                type="email"
                placeholder="contact@greenvalley.com"
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="adminName">{t("auth.adminName")}</label>
              <input
                id="adminName"
                name="adminName"
                placeholder="Admin User"
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="adminEmail">{t("auth.adminEmail")}</label>
              <input
                id="adminEmail"
                name="adminEmail"
                type="email"
                placeholder="admin@greenvalley.com"
                onChange={handleChange}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">{t("auth.password")}</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder={t("auth.minPassword")}
                onChange={handleChange}
                required
              />
            </div>
            <button className="primary-btn" disabled={loading} type="submit">
              {loading ? t("common.saving") : t("auth.signup")}
            </button>
          </form>

          <p className="footer-text">
            {t("auth.hasAccount")} <Link to="/login">{t("auth.login")}</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
