import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";
import { saveAuth } from "./auth.storage";
import { signupApi } from "./auth.api";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    const res = await fetch("http://localhost:3000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("Signup failed");
      return;
    }

    const data = await res.json();

    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.location.href = "/dashboard";
  };

  return (
    <div className="auth-container">
      <div className="brand">
        <h1>🏗️ Estate Manager</h1>
        <p className="subtitle">Smart Construction & Real Estate ERP</p>
      </div>

      <div className="auth-card">
        <h2>Create Company</h2>
        <p className="muted">Set up your real estate workspace</p>

        <form onSubmit={handleSignup}>
          <div className="field">
            <label>Company Name</label>
            <input
              name="companyName"
              placeholder="Green Valley Builders"
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Company Email</label>
            <input
              name="companyEmail"
              type="email"
              placeholder="contact@greenvalley.com"
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Admin Name</label>
            <input
              name="adminName"
              placeholder="Admin User"
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Admin Email</label>
            <input
              name="adminEmail"
              type="email"
              placeholder="admin@greenvalley.com"
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              onChange={handleChange}
              required
            />
          </div>
          <button className="primary-btn" disabled={loading}>
            {loading ? "Creating company..." : "Create Company"}
          </button>{" "}
        </form>

        <p className="footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
