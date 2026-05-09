import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";
import { loginApi } from "./auth.api";
import { saveAuth } from "./auth.storage";
import api from "../api/axios";

export default function Login() {
  const navigate = useNavigate();

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

      // 🔑 STORE JWT & USER
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🔀 ROLE BASED REDIRECT
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
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="brand">
        <h1>🏗️ Estate Manager</h1>
        <p className="subtitle">Smart Construction & Real Estate ERP</p>
      </div>

      <div className="auth-card">
        <h2>Login</h2>
        <p className="muted">Access your company dashboard</p>

        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="primary-btn">Login</button>
        </form>

        <p className="footer-text">
          Don’t have an account? <Link to="/signup">Create company</Link>
        </p>
      </div>
    </div>
  );
}
