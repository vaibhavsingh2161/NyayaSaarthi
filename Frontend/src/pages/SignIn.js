import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/SignIn.css";

function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(""); // State to track error messages
  const navigate = useNavigate(); // For redirecting after successful login

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      // Make API call to login
      const response = await axios.post(
        "http://localhost:3005/api/users/login",
        formData
      );

      // Store the token (optional: store in cookies/localStorage if required)
      const { token, name, role } = response.data;
      localStorage.setItem("token", token); // Save the token for future API calls

      alert(`Welcome back, ${name}!`);

      // Redirect based on the role
      if (role === "plaintiff") {
        navigate("/dashboard"); // Replace with the plaintiff dashboard route
      } else if (role === "advocate") {
        navigate("/advocate-portal"); // Replace with the advocate portal route
      }
    } catch (error) {
      console.error(error.response?.data?.message || "An error occurred");
      setError(
        error.response?.data?.message ||
          "Invalid credentials. Please try again."
      );
    }
  };

  return (
    <div className="create-profile-container">
      {/* Profile Left Section */}
      <div className="profile-left">
        <img src="/images/Component 1.png" alt="Logo" className="logo" />
        <div className="divider"></div>
        <p className="quote">Law without justice is a wound without a cure.</p>
      </div>

      {/* Profile Right Section */}
      <div className="profile-right">
        <h2>Sign In</h2>
        <div className="signin-form-container">
          {/* Error message */}
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
            <button type="submit" className="submit-button">
              Sign In
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
