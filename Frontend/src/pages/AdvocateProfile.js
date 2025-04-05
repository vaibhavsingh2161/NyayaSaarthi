import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AdvocateProfile.css";

import fallbackProfileImage from "../assets/444.jpeg";
import footerLogo from "../assets/Component 1.png";
import NavbarAdv from "../components/NavbarAdv";
import logo from "../assets/golden nyayasarthi logo.png";

const AdvocateProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found, please log in.");
        }

        const response = await axios.get(
          "http://localhost:3005/api/advocate/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setProfile(response.data);
        console.log("Profile data:", response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || "Failed to fetch profile data.");

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.post(
          "http://localhost:3005/api/users/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      navigate("/sign-in");
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <p>No profile data found.</p>
      </div>
    );
  }

  const {
    userId = {},
    languages = [],
    dob = "N/A",
    location = "N/A",
    profilePicture = null,
    enrolmentNo = "N/A",
    barCouncilRegNo = "N/A",
    yearsOfExperience = 0,
    education = [],
    workExperience = [],
    specialisation = [],
    casesHandled = [],
    description = "No information provided.",
    clientele = [],
    courts = [],
  } = profile;

  const fallbackImage = fallbackProfileImage;

  const profileImageUrl = profilePicture
    ? `/uploads/${profilePicture.replace(/^uploads[\\\\\\/]?/, "")}`
    : fallbackImage;

  if (profileImageUrl !== fallbackImage) {
    localStorage.setItem('advocateProfilePictureUrl', profileImageUrl);
  } else {
    localStorage.removeItem('advocateProfilePictureUrl');
  }

  return (
    <div className="profile-container">
      <NavbarAdv logo={logo} handleLogout={handleLogout} />
      <header className="profile-header">
        <h2>My Profile</h2>
        <div className="profile-header-buttons">
          {" "}
          {}
          <a
            href="/edit-profile"
            className="edit-link"
            style={{ marginRight: "1rem" }}
          >
            Edit Profile
          </a>{" "}
          {}
          {}
        </div>
      </header>
      <section className="profile-details">
        <div className="profile-card">
          {}
          <img
            src={profileImageUrl}
            alt="Profile"
            className="profile-picture"
            onError={(e) => {
              console.log("Image failed to load, using fallback");

              e.target.src = fallbackImage;

              e.target.onerror = null;
            }}
          />
          <div className="profile-info">
            <h3>{userId?.name || "Advocate"}</h3> {}
            <div className="profile-meta">
              <p>
                <span>📍</span> {location}
              </p>
              <p>
                <span>💼</span> {yearsOfExperience} years experience
              </p>
              <p>
                <span>📄</span> {languages.join(", ")}
              </p>{" "}
              {}
            </div>
            <p>
              <strong>Enrolment No.:</strong> {enrolmentNo}
            </p>
            <p>
              <strong>Registration No.:</strong> {barCouncilRegNo}
            </p>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h4>Basic Information:</h4>
            <p>
              <strong>Date of Birth:</strong>{" "}
              {dob ? new Date(dob).toLocaleDateString() : "N/A"}
            </p>
            <p>
              <strong>Location:</strong> {location}
            </p>
          </div>

          <div className="profile-section">
            <h4>Practice License:</h4>
            <p>{courts.length > 0 ? courts.join(", ") : "Not specified"}</p>
          </div>

          <div className="profile-section">
            <h4>Practice Area:</h4>
            <p>
              {specialisation.length > 0
                ? specialisation.join(", ")
                : "Not specified"}
            </p>
          </div>

          <div className="profile-section">
            <h4>About Lawyer:</h4>
            <p>{description}</p>
          </div>

          <div className="profile-section">
            <h4>Education:</h4>
            {education.length > 0 ? (
              <ul>
                {education.map((edu, index) => (
                  <li key={index}>
                    <strong>{edu?.degree || 'N/A'}</strong> - {edu?.university || 'N/A'} (
                    {edu?.yearOfPassing || 'N/A'})
                    {edu?.extraCourses && <span> ({edu.extraCourses})</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Not specified</p>
            )}
          </div>

          <div className="profile-section">
            <h4>Work Experience:</h4>
            {workExperience.length > 0 ? (
              <ul>
                {workExperience.map((exp, index) => (
                  <li key={index}>
                    <strong>{exp?.firm || 'N/A'}</strong>(
                    {exp?.startDate
                      ? new Date(exp.startDate).toLocaleDateString()
                      : 'N/A'}
                    {exp?.endDate
                      ? ` - ${new Date(exp.endDate).toLocaleDateString()}`
                      : ' - Present'}
                    )
                    {exp?.briefExperience && (
                      <p style={{ margin: "0.2em 0 0 1em", fontSize: "0.9em" }}>
                        {exp.briefExperience}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Not specified</p>
            )}
          </div>

          <div className="profile-section">
            <h4>Cases Handled:</h4>
            <p>
              {casesHandled.length > 0
                ? casesHandled.join(", ")
                : "Not specified"}
            </p>
          </div>

          <div className="profile-section">
            <h4>Clientele:</h4>
            <p>
              {clientele.length > 0 ? clientele.join(", ") : "Not specified"}
            </p>
          </div>
        </div>
      </section>

      {}
      <footer className="footer">
        <div className="footer-logo">
          <img src={footerLogo} alt="Nyayasarthi Logo" /> {}
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>Quick Links</h4>
            <a href="#announcement">Announcement</a>
            <a href="#about-us">About Us</a>
            <a href="#feedback">Feedback</a>
            <a href="#qa">Q&A</a>
          </div>
          <div className="footer-column">
            <h4>Case</h4>
            <a href="#find-laws">Find Relevant Laws</a>
            <a href="#float-case">Float a Case</a>
            <a href="#find-lawyer">Find Lawyer</a>
            <a href="#legal-advice">Legal Advice</a>
          </div>
          <div className="footer-column">
            <h4>Law</h4>
            <a href="#nyaya-sanhita">Nyaya Sanhita</a>
            <a href="#search">Search</a>
            <a href="#recent-news">Recent News</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdvocateProfile;
