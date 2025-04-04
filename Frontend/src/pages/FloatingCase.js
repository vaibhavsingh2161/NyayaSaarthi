import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/FloatingCase.css";
import logo from "../assets/golden nyayasarthi logo.png";
import footerLogo from "../assets/Component 1.png";
import NavbarAdv from "../components/NavbarAdv";
import { Link } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { Menu } from "lucide-react";
const FloatingCase = () => {
  const [floatingCases, setFloatingCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [practiceAreaFilter, setPracticeAreaFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [bidAmount, setBidAmount] = useState({});
  const [bidMessage, setBidMessage] = useState({});
  const [bidLoading, setBidLoading] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFloatingCases = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:3005/api/cases/floating",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setFloatingCases(response.data.cases || []);
        setFilteredCases(response.data.cases || []);
      } catch (err) {
        console.error("Error fetching floating cases:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load floating cases. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFloatingCases();
  }, [navigate]);

  useEffect(() => {
    if (!floatingCases.length) return;

    let result = [...floatingCases];

    if (practiceAreaFilter) {
      result = result.filter((caseItem) =>
        caseItem.caseType
          ?.toLowerCase()
          .includes(practiceAreaFilter.toLowerCase())
      );
    }

    if (cityFilter) {
    }

    setFilteredCases(result);
  }, [floatingCases, practiceAreaFilter, cityFilter]);

  const handlePracticeAreaChange = (e) => {
    setPracticeAreaFilter(e.target.value);
  };

  const handleCityChange = (e) => {
    setCityFilter(e.target.value);
  };

  const handleBidAmountChange = (caseId, amount) => {
    setBidAmount({
      ...bidAmount,
      [caseId]: amount,
    });
  };

  const handleBidMessageChange = (caseId, message) => {
    setBidMessage({
      ...bidMessage,
      [caseId]: message,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/sign-in");
  };

  const handleSubmitBid = async (caseId) => {
    if (!bidAmount[caseId]) {
      alert("Please enter a bid amount");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/sign-in");
      return;
    }

    setBidLoading({
      ...bidLoading,
      [caseId]: true,
    });

    try {
      const response = await axios.post(
        "http://localhost:3005/api/cases/submit-bid",
        {
          caseId: caseId,
          amount: parseFloat(bidAmount[caseId]),
          message: bidMessage[caseId] || "Interested in this case.",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Bid submitted successfully!");

      setFloatingCases((prevCases) =>
        prevCases.filter((c) => c._id !== caseId)
      );
    } catch (err) {
      console.error("Error submitting bid:", err);
      alert(
        err.response?.data?.message || "Failed to submit bid. Please try again."
      );
    } finally {
      setBidLoading({
        ...bidLoading,
        [caseId]: false,
      });
    }
  };

  const handleViewDetails = (caseId) => {
    navigate(`/case/${caseId}/details`);
  };

  return (
    <div className="floating-case-container">
      {}
      <header className="dashboard-header">
        <Link to="/">
          <img src={logo} alt="NyayaSarthi Logo" className="logo" />
        </Link>

        <nav className={`dashboard-nav ${menuOpen ? "open" : ""}`}>
          <Link to="/advocate-dashboard">Dashboard</Link>
          <Link to="/nyaya-sanhita">Nyaya Sanhita</Link>
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt /> Logout
          </button>
        </nav>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={24} />
        </button>
      </header>

      {}
      <section className="page-title">
        <h2>Floating Cases</h2>
        <p>
          These cases are open for you to bid on. Submit your bid to represent
          the client.
        </p>
      </section>

      {}
      <section className="filter-section">
        <select
          className="filter-dropdown"
          value={practiceAreaFilter}
          onChange={handlePracticeAreaChange}
        >
          <option value="">Select Practice Area</option>
          <option value="Divorce">Divorce</option>
          <option value="Child Custody">Child Custody</option>
          <option value="Corporate">Corporate</option>
          <option value="Criminal">Criminal</option>
          <option value="Property">Property</option>
        </select>
        <select
          className="filter-dropdown"
          value={cityFilter}
          onChange={handleCityChange}
        >
          <option value="">Select City</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Delhi">Delhi</option>
          <option value="Chennai">Chennai</option>
        </select>
        <button className="search-button">🔍 Search</button>
      </section>

      {}
      {loading && (
        <div className="loading-message">Loading floating cases...</div>
      )}
      {error && <div className="error-message">{error}</div>}

      {}
      {!loading && !error && (
        <section className="case-list">
          {filteredCases.length === 0 ? (
            <div className="no-cases-message">
              <p>No floating cases available at this time.</p>
            </div>
          ) : (
            filteredCases.map((caseItem) => (
              <div key={caseItem._id} className="case-card">
                <h3>{caseItem.subject}</h3>
                <p className="case-type">
                  Case Type: <span>{caseItem.caseType}</span>
                </p>
                <p className="case-description">{caseItem.description}</p>
                <div className="case-meta">
                  <span style={{ color: "#010000" }}>Created: {formatDate(caseItem.createdAt)}</span>
                  <span style={{ color: "#010000" }}>Status: {caseItem.status}</span>
                  <span style={{ color: "#010000" }}>Client: {caseItem.user?.name || "Anonymous"}</span>
                </div>

                <div className="case-actions-bid">
                  <button
                    className="details-button"
                    onClick={() => handleViewDetails(caseItem._id)}
                  >
                    View Details
                  </button>

                  {localStorage.getItem("userRole") === "advocate" && (
                    <div className="bid-section">
                      <div className="bid-inputs">
                        <input
                          type="number"
                          placeholder="Bid Amount (₹)"
                          value={bidAmount[caseItem._id] || ""}
                          onChange={(e) =>
                            handleBidAmountChange(caseItem._id, e.target.value)
                          }
                          className="bid-amount-input"
                        />
                        <textarea
                          placeholder="Your message to the client..."
                          value={bidMessage[caseItem._id] || ""}
                          onChange={(e) =>
                            handleBidMessageChange(caseItem._id, e.target.value)
                          }
                          className="bid-message-input"
                        />
                      </div>
                      <button
                        className="bid-button"
                        onClick={() => handleSubmitBid(caseItem._id)}
                        disabled={bidLoading[caseItem._id]}
                      >
                        {bidLoading[caseItem._id]
                          ? "Submitting..."
                          : "Submit Bid"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      {}
      <footer className="footer">
        <div className="footer-logo">
          <img src={footerLogo} alt="Nyayasarthi Logo" />
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
            <a href="/nyaya-sanhita">Find Relevant Laws</a>
            <a href="">Float a Case</a>
            <a href="">Find Lawyer</a>
            <a href="">Legal Advice</a>
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

export default FloatingCase;
