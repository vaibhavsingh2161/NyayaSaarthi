import React, { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/AdvocateDashboard.css";
import { FaSignOutAlt, FaExternalLinkAlt } from "react-icons/fa";
import logo from "../assets/golden nyayasarthi logo.png";
import footerLogo from "../assets/Component 1.png";
import NavbarAdv from "../components/NavbarAdv";
const AdvocateDashboard = () => {
  const [caseRequests, setCaseRequests] = useState([]);
  const [myCases, setMyCases] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingMyCases, setLoadingMyCases] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();
  const [floatingCasesCount, setFloatingCasesCount] = useState(0);
  const userRole = localStorage.getItem("userRole");
  useEffect(() => {
    if (userRole !== "advocate") {
      alert("Access denied. Redirecting...");
      navigate(userRole === "plaintiff" ? "/dashboard" : "/sign-in");
    }
  }, [userRole, navigate]);
  useEffect(() => {
    if (userRole === "advocate") {
      fetchCaseRequests();
      fetchMyCases();
      fetchFloatingCasesCount();
    }
  }, [userRole]);
  if (userRole !== "advocate") {
    return null;
  }
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
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      navigate("/sign-in");
    }
  };
  const fetchCaseRequests = async () => {
    setLoadingRequests(true);
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required.");
      setLoadingRequests(false);
      return;
    }
    try {
      const response = await axios.get(
        "http://localhost:3005/api/advocate/case-requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCaseRequests(response.data.cases);
    } catch (err) {
      console.error("Error fetching case requests:", err);
      setError(err.response?.data?.message || "Failed to load case requests.");
    } finally {
      setLoadingRequests(false);
    }
  };
  const fetchMyCases = async () => {
    setLoadingMyCases(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingMyCases(false);
      return;
    }
    try {
      const response = await axios.get(
        "http://localhost:3005/api/cases/my-cases",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMyCases(
        response.data.cases.filter((c) => !c.isFloating && c.advocate)
      );
    } catch (err) {
      console.error("Error fetching my cases:", err);
      setError(err.response?.data?.message || "Failed to load assigned cases.");
    } finally {
      setLoadingMyCases(false);
    }
  };
  const fetchFloatingCasesCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await axios.get(
        "http://localhost:3005/api/cases/floating",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFloatingCasesCount(response.data.count || 0);
    } catch (err) {
      console.error("Error fetching floating cases count:", err);
    }
  };
  const handleCaseAction = async (caseId, action) => {
    setActionLoading((prev) => ({ ...prev, [caseId]: true }));
    setError("");
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required.");
      setActionLoading((prev) => ({ ...prev, [caseId]: false }));
      return;
    }
    const url = `http://localhost:3005/api/advocate/${action}-case`;
    try {
      await axios.post(
        url,
        { caseId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(
        `Case ${action === "accept" ? "accepted" : "denied"} successfully.`
      );

      fetchCaseRequests();
      fetchMyCases();
    } catch (err) {
      console.error(`Error ${action}ing case:`, err);
      setError(err.response?.data?.message || `Failed to ${action} case.`);
    } finally {
      setActionLoading((prev) => ({ ...prev, [caseId]: false }));
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;
  };
  return (
    <div className="dashboard-container">
      <NavbarAdv logo={logo} handleLogout={handleLogout} />

      <section className="floating-cases-banner">
        <div className="banner-content">
          <h3>Browse Floating Cases</h3>
          <p>
            There are currently <strong>{floatingCasesCount}</strong> cases
            available for you to bid on.
          </p>
          <Link to="/floating-case" className="view-floating-button">
            View Floating Cases <FaExternalLinkAlt />
          </Link>
        </div>
      </section>
      <section className="section my-case">
        <h3>My Cases</h3>
        {loadingMyCases && <p>Loading assigned cases...</p>}
        {!loadingMyCases && error && (
          <p style={{ color: "red" }}>Error loading cases: {error}</p>
        )}
        {!loadingMyCases && !error && (
          <div className="case-list">
            {myCases.length === 0 ? (
              <p>You have no assigned cases yet.</p>
            ) : (
              myCases.map((caseItem) => (
                <div key={caseItem._id} className="case-item">
                  <span>
                    {caseItem.subject} ({caseItem.caseType})
                  </span>
                  <span>Created: {formatDate(caseItem.createdAt)}</span>
                  <span>Client: {caseItem.user?.name || "N/A"}</span>
                  <div className="case-actions">
                    <Link
                      to={`/case/${caseItem._id}/details`}
                      className="details-link"
                    >
                      View Details
                    </Link>
                    {}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
      {}
      <section className="section case-request">
        <h3>Case Requests</h3>
        {loadingRequests && <p>Loading case requests...</p>}
        {!loadingRequests && error && <p style={{ color: "red" }}>{error}</p>}
        {!loadingRequests && !error && (
          <div className="case-request-list">
            {caseRequests.length === 0 ? (
              <p>No pending case requests.</p>
            ) : (
              caseRequests.map((request) => (
                <div key={request._id} className="case-request-item">
                  <span>
                    {request.subject} ({request.caseType})
                  </span>
                  <span>Requested: {formatDate(request.createdAt)}</span>
                  <span>From: {request.user?.name || "Unknown User"}</span>
                  <div className="request-actions">
                    <Link
                      to={`/case/${request._id}/details`}
                      className="details-link"
                      onClick={(e) => {
                        console.log(
                          `Navigating to case details for: ${request._id}`
                        );
                      }}
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleCaseAction(request._id, "accept")}
                      disabled={actionLoading[request._id]}
                      className="accept-button"
                    >
                      {actionLoading[request._id] ? "Accepting..." : "Accept"}
                    </button>
                    <button
                      onClick={() => handleCaseAction(request._id, "deny")}
                      disabled={actionLoading[request._id]}
                      className="deny-button"
                    >
                      {actionLoading[request._id] ? "Denying..." : "Deny"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
      {}
      <section className="section bookmarks">
        <h3>Bookmarks</h3>
        <div className="bookmark-items">
          <div className="bookmark-item"></div>
          <div className="bookmark-item"></div>
          <a href="#view-more" className="view-more">
            View more...
          </a>
        </div>
      </section>
      {}
      <section className="section news-law">
        <h3>News - Law</h3>
        <div className="news-content"></div>
      </section>
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
export default AdvocateDashboard;
