import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/FindALawyer.css";
import fallbackProfileImage from "../assets/444.jpeg";
import logo from "../assets/golden nyayasarthi logo.png";
import footerLogo from "../assets/Component 1.png";
import NavbarUser from "../components/NavbarUser";

function FindALawyer() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState({});
  const [requestError, setRequestError] = useState("");

  const [practiceAreaFilter, setPracticeAreaFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          "http://localhost:3005/api/advocate/list"
        );
        setLawyers(response.data);
        setFilteredLawyers(response.data);

        const uniquePracticeAreas = new Set();
        const uniqueCities = new Set();

        response.data.forEach((lawyer) => {
          if (lawyer.specialisation && Array.isArray(lawyer.specialisation)) {
            lawyer.specialisation.forEach((area) => {
              if (area && area.trim()) uniquePracticeAreas.add(area.trim());
            });
          }

          if (lawyer.location && lawyer.location.trim()) {
            uniqueCities.add(lawyer.location.trim());
          }
        });

        setPracticeAreas(Array.from(uniquePracticeAreas).sort());
        setCities(Array.from(uniqueCities).sort());
      } catch (err) {
        console.error("Error fetching lawyer data:", err);
        setError(err.message || "Failed to fetch lawyers.");
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  useEffect(() => {
    if (!lawyers.length) return;

    const applyFilters = () => {
      let result = [...lawyers];

      if (practiceAreaFilter) {
        result = result.filter(
          (lawyer) =>
            lawyer.specialisation &&
            Array.isArray(lawyer.specialisation) &&
            lawyer.specialisation.some((area) =>
              area.toLowerCase().includes(practiceAreaFilter.toLowerCase())
            )
        );
      }

      if (cityFilter) {
        result = result.filter(
          (lawyer) =>
            lawyer.location &&
            lawyer.location.toLowerCase().includes(cityFilter.toLowerCase())
        );
      }

      setFilteredLawyers(result);
    };

    applyFilters();
  }, [lawyers, practiceAreaFilter, cityFilter]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/sign-in");
  };

  const handlePracticeAreaChange = (e) => {
    setPracticeAreaFilter(e.target.value);
  };

  const handleCityChange = (e) => {
    setCityFilter(e.target.value);
  };

  const handleSearch = () => {
    console.log(
      `Searching for lawyers with practice area: ${
        practiceAreaFilter || "Any"
      } and city: ${cityFilter || "Any"}`
    );
  };

  const getProfileImageUrl = (profilePicturePath) => {
    if (!profilePicturePath) {
      return fallbackProfileImage;
    }

    return `/uploads/${profilePicturePath.replace(/^uploads[\\\/]?/, "")}`;
  };

  const handleContactNow = async (advocateId) => {
    if (!caseId) {
      setRequestError("Cannot send request: Case ID is missing.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
      return;
    }

    setRequestStatus((prev) => ({ ...prev, [advocateId]: "pending" }));
    setRequestError("");

    try {
      await axios.post(
        `http://localhost:3005/api/cases/${caseId}/request-advocate`,
        { advocateId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestStatus((prev) => ({ ...prev, [advocateId]: "sent" }));
      alert("Request sent successfully!");
    } catch (err) {
      console.error("Error sending request:", err);
      setRequestStatus((prev) => ({ ...prev, [advocateId]: "error" }));
      setRequestError(
        err.response?.data?.message ||
          "Failed to send request. Please try again."
      );

      setTimeout(
        () => setRequestStatus((prev) => ({ ...prev, [advocateId]: null })),
        3000
      );
    }
  };

  return (
    <div className="find-a-lawyer-container">
      <NavbarUser logo={logo} handleLogout={handleLogout} />

      <main>
        <h2>Find a Lawyer</h2>
        <div className="filter-bar">
          <select
            className="filter-select"
            value={practiceAreaFilter}
            onChange={handlePracticeAreaChange}
          >
            <option value="">Select Practice Area</option>
            {practiceAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={cityFilter}
            onChange={handleCityChange}
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <button className="search-button" onClick={handleSearch}>
            🔍 Search
          </button>

          {(practiceAreaFilter || cityFilter) && (
            <button
              className="clear-filter-button"
              onClick={() => {
                setPracticeAreaFilter("");
                setCityFilter("");
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
        {}
        {(practiceAreaFilter || cityFilter) && (
          <div className="filter-indicator">
            <p>
              Showing results for:
              {practiceAreaFilter ? (
                <span className="filter-tag">
                  Practice Area: {practiceAreaFilter}
                </span>
              ) : null}
              {cityFilter ? (
                <span className="filter-tag">City: {cityFilter}</span>
              ) : null}
            </p>
          </div>
        )}
        {loading && <p>Loading lawyers...</p>} {}
        {error && <p style={{ color: "red" }}>Error: {error}</p>} {}
        {!loading && !error && (
          <div className="lawyer-list-container">
            {filteredLawyers.length === 0 ? (
              <p className="no-lawyers-msg">
                No lawyers found matching your criteria.
              </p>
            ) : (
              <div className="lawyer-list">
                {filteredLawyers.map((lawyer) => (
                  <div key={lawyer._id} className="lawyer-card">
                    <div className="profile-image">
                      <img
                        src={getProfileImageUrl(lawyer.profilePicture)}
                        alt={`${lawyer.userId?.name || "Lawyer"}'s profile`}
                        className="profile-pic"
                        onError={(e) => {
                          e.target.src = fallbackProfileImage;
                          e.target.onerror = null;
                        }}
                      />
                    </div>
                    <div className="profile-details">
                      <h3 className="lawyer-name">
                        {lawyer.userId?.name || "Advocate Name"}
                      </h3>
                      <p className="lawyer-specialisation">
                        <strong>Practice Area:</strong>{" "}
                        {lawyer.specialisation?.join(", ") || "N/A"}
                      </p>
                      <p className="lawyer-location">
                        📍 {lawyer.location || "N/A"}
                      </p>
                      <p className="lawyer-experience">
                        💼 {lawyer.yearsOfExperience || "N/A"} years experience
                      </p>
                      <p className="lawyer-languages">
                        🗣️ Languages: {lawyer.languages?.join(", ") || "N/A"}
                      </p>
                    </div>
                    <button
                      className={`contact-button ${
                        requestStatus[lawyer.userId?._id] ? "disabled" : ""
                      }`}
                      onClick={() => handleContactNow(lawyer.userId?._id)}
                      disabled={
                        !caseId ||
                        loading ||
                        requestStatus[lawyer.userId?._id] === "pending" ||
                        requestStatus[lawyer.userId?._id] === "sent"
                      }
                    >
                      {requestStatus[lawyer.userId?._id] === "pending"
                        ? "Sending..."
                        : requestStatus[lawyer.userId?._id] === "sent"
                        ? "Request Sent"
                        : requestStatus[lawyer.userId?._id] === "error"
                        ? "Error"
                        : "Contact Now"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {requestError && <p style={{ color: "red" }}>Error: {requestError}</p>}{" "}
        {}
      </main>

      <footer className="dashboard-footer">
        <div className="footer-logo">
          <img src={footerLogo} alt="NyayaSarthi Logo" />
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>Quick Links</h4>
            <Link to="/announcements">Announcement</Link>
            <Link to="/about-us">About Us</Link>
            <Link to="/feedback">Feedback</Link>
            <Link to="/qa">Q&A</Link>
          </div>
          <div className="footer-column">
            <h4>Case</h4>
            <Link to="/nyaya-sanhita">Find Relevant Laws</Link>
            <Link to="#">Float a Case</Link>
            <Link to="#">Find Lawyer</Link>
            <Link to="/legal-advice">Legal Advice</Link>
          </div>
          <div className="footer-column">
            <h4>Law</h4>
            <Link to="/nyaya-sanhita">Nyaya Sanhita</Link>
            <Link to="/search">Search</Link>
            <Link to="/news">Recent News</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FindALawyer;
