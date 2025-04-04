import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/SignIn.css";
import logo from "../assets/golden nyayasarthi logo.png";
function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email || !formData.password || !role) {
      setError("Please fill in all fields, including selecting your role.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Sending login request with:", { ...formData, role });

      const response = await axios.post(
        "http://localhost:3005/api/users/login",
        { ...formData, role }
      );

      console.log("Login successful:", response.data);

      localStorage.setItem("token", response.data.token || "");
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", response.data.name || "");

      alert(`Welcome back, ${response.data.name || "User"}!`);

      console.log("Redirecting user with role:", role);

      if (role === "advocate") {
        console.log("Redirecting to advocate dashboard");
        navigate("/advocate-dashboard");
      } else {
        console.log("Redirecting to plaintiff dashboard");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message ||
          "Invalid credentials. Please check your email, password, and role."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-profile-container">
      {}
      <div className="profile-left">
        <img src={logo} alt="Logo" className="logo" />
        <div className="divider"></div>
        <p className="quote">Law without justice is a wound without a cure.</p>
      </div>

      {}
      <div className="profile-right">
        <h2>Sign In</h2>
        <div className="signin-form-container">
          {}
          {error && <p className="error-message">{error}</p>}

          <form className="profile-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
            />
            <div className="role-selection">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="advocate"
                  checked={role === "advocate"}
                  onChange={handleRoleChange}
                />
                Advocate
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="plaintiff"
                  checked={role === "plaintiff"}
                  onChange={handleRoleChange}
                />
                Plaintiff
              </label>
            </div>
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="signup-prompt">
            Not registered? <Link to="/sign-up">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
