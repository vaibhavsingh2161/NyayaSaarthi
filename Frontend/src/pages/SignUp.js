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
    barCouncilRegNo: "", // Only for advocate role
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);

    // Clear bar council registration number if not advocate
    if (selectedRole !== "advocate") {
      setFormData({ ...formData, barCouncilRegNo: "" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      if (!role) {
        setError("Please select a role before signing up.");
        setIsLoading(false);
        return;
      }

      // Validation for required fields
      if (!formData.name || !formData.phone || !formData.email || !formData.password) {
        setError("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }

      // Validation for advocate role
      if (role === "advocate" && !formData.barCouncilRegNo) {
        setError("Bar Council Registration Number is required for advocates.");
        setIsLoading(false);
        return;
      }

      // Log registration data for debugging
      console.log("Sending registration request with:", {
        ...formData,
        role,
      });

      // Send data to the backend
      const response = await axios.post(
        "http://localhost:3005/api/users/register",
        {
          ...formData,
          role,
        }
      );

      // Log successful response for debugging
      console.log("Registration successful:", response.data);

      alert("Registration successful!");
      
      if (role === "advocate") {
        navigate("/create-profile"); // Redirect to create-profile for advocates
      } else {
        navigate("/sign-in"); // Redirect to sign-in for plaintiffs
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
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
          {error && <p className="error-message">{error}</p>}
          
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

            <button 
              type="submit" 
              className="signup-button"
              disabled={isLoading}
            >
              {isLoading ? "Signing Up..." : "Submit"}
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