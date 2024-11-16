import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/SignUp.css";

const SignUp = () => {
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    barCouncilRegNumber: "", // Added for advocate role
  });
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    // Clear bar council registration number if not advocate
    if (selectedRole !== "advocate") {
      setFormData({ ...formData, barCouncilRegNumber: "" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!role) {
        alert("Please select a role before signing up.");
        return;
      }

      // Send data to the backend
      const response = await axios.post(
        "http://localhost:3005/api/users/register",
        {
          ...formData,
          role,
        }
      );

      alert("Registration successful!");
      if (role === "advocate") {
        navigate("/create-profile"); // Redirect to create-profile for advocates
      } else {
        navigate("/sign-in"); // Redirect to sign-in for plaintiffs
      }
    } catch (error) {
      console.error(error.response.data.message);
      alert(error.response.data.message || "Registration failed");
    }
  };

  return (
    <div className="signup-container">
      <div className="profile-left">
        <img src="/images/Component 1.png" alt="Logo" className="logo" />
        <div className="divider"></div>
        <p className="quote">Law without justice is a wound without a cure.</p>
      </div>
      <div className="profile-right">
        <h2>Sign Up</h2>
        <div className="signup-form-container">
          <form className="signup-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
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

            {role === "advocate" && (
              <input
                type="text"
                name="barCouncilRegNo"
                placeholder="Bar Council Registration Number"
                value={formData.barCouncilRegNo}
                onChange={handleInputChange}
                required
              />
            )}

            <button type="submit" className="signup-button">
              Submit
            </button>
          </form>
        </div>
        <p className="login-link">
          Already have an account? <Link to="/sign-in">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
