import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/UserDashboard.css";
import { FaTrash, FaSignOutAlt } from "react-icons/fa";
import logo from "../assets/golden nyayasarthi logo.png";
import footerLogo from "../assets/Component 1.png";
import NavbarUser from "../components/NavbarUser";

function UserDashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [news, setNews] = useState([]);
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    if (userRole !== "plaintiff") {
      alert("Access denied. Redirecting...");
      navigate(userRole === "advocate" ? "/advocate-dashboard" : "/sign-in");
    }
  }, [userRole, navigate]);

  useEffect(() => {
    if (userRole === "plaintiff") {
      fetchUserCases();
      fetchBookmarks();
      fetchLegalNews();
    }
  }, [userRole]);

  if (userRole !== "plaintiff") {
    return null;
  }

  const fetchUserCases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await axios.get(
        "http://localhost:3005/api/cases/my-cases",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCases(response.data.cases || []);
    } catch (err) {
      console.error("Error fetching cases:", err);
      setError("Failed to load your cases. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");

    navigate("/sign-in");
  };

  const fetchBookmarks = async () => {
    setBookmarks([
      { id: 4, title: "Supreme Court Judgment on Contract Law (2024)" },
      {
        id: 5,
        title: "Land Acquisition Act – Key Amendments & Interpretations",
      },
      { id: 6, title: "Latest High Court Ruling on Tenant Eviction Rights" },
      { id: 7, title: "Indian Penal Code Section 420: Cheating & Fraud Cases" },
    ]);
  };

  const fetchLegalNews = async () => {
    setNews([
      {
        id: 2,
        title: "Delhi High Court Rules on Digital Evidence Admissibility",
        summary:
          "The Delhi High Court has ruled that digital evidence must comply with Section 65B of the Indian Evidence Act to be admissible in court.",
        date: "28 Mar 2025",
      },
      {
        id: 3,
        title: "Government Introduces New Data Protection Bill in Parliament",
        summary:
          "The Indian government has tabled the Data Protection Bill 2025, focusing on user consent and data localization requirements.",
        date: "30 Mar 2025",
      },
    ]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;
  };

  const handleDeleteCase = async (caseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this case? This action cannot be undone."
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      await axios.delete(`http://localhost:3005/api/cases/case/${caseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Case deleted successfully!");

      fetchUserCases();
    } catch (err) {
      console.error("Error deleting case:", err);
      alert(
        err.response?.data?.message ||
          "Failed to delete case. Please try again later."
      );
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {}
        <NavbarUser logo={logo} handleLogout={handleLogout} />

        {}
        <main className="dashboard-main">
          {}
          <section className="dashboard-section">
            <h2>My Cases</h2>

            {loading ? (
              <div className="loading">Loading your cases...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="case-listu">
                {cases.length > 0 ? (
                  <table className="case-table">
                    <tbody>
                      {cases.map((caseItem, index) => (
                        <tr key={caseItem._id} className="case-item">
                          <td className="case-index">{index + 1}.</td>
                          <td className="case-title">{caseItem.subject}</td>
                          <td className="case-date">
                            {formatDate(caseItem.createdAt)}
                          </td>
                          <td className="case-actions">
                            {}

                            {}
                            {(!caseItem.advocate ||
                              caseItem.status === "pending") && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDeleteCase(caseItem._id);
                                }}
                                className="delete-button"
                                title="Delete Case"
                              >
                                <FaTrash />
                              </button>
                            )}
                            <Link
                              to={`/case/${caseItem._id}/details`}
                              className="details-button"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-cases">
                    <p>You don't have any cases yet.</p>
                  </div>
                )}
                <div className="create-case-link">
                  <Link to="/create-case">
                    <span className="plus-icon">+</span> Create Case
                  </Link>
                </div>
              </div>
            )}
          </section>

          {}
          <section className="dashboard-section">
            <h2>Bookmarks</h2>
            <div className="bookmarks-container">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="bookmark-item">
                  <p>{bookmark.title}</p>
                </div>
              ))}
              <div className="wrap-view-more">
                <div className="view-more">
                  <Link to="/bookmarks">View more</Link>
                </div>
              </div>
            </div>
          </section>

          {}
          <section className="dashboard-section">
            <h2>News - Law</h2>
            <div className="news-container">
              {news.map((item) => (
                <div key={item.id} className="news-item">
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="news-date">{item.date}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        {}
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
    </div>
  );
}

export default UserDashboard;
