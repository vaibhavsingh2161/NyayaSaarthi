// src/pages/UserDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/UserDashboard.css';
import { FaTrash } from 'react-icons/fa'; // Import trash icon

function UserDashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [news, setNews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user cases on component mount
    fetchUserCases();
    // Fetch bookmarks and legal news
    fetchBookmarks();
    fetchLegalNews();
  }, []);

  const fetchUserCases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        return;
      }

      const response = await axios.get('http://localhost:3005/api/cases/my-cases', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setCases(response.data.cases || []);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError('Failed to load your cases. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    // This would normally fetch from your API
    // Simulating with placeholder data for now
    setBookmarks([
      { id: 1, title: 'Bharatiya Nyaya Sanhita Section 354' },
      { id: 2, title: 'Recent Supreme Court Judgment on Property Rights' }
    ]);
  };

  const fetchLegalNews = async () => {
    // This would normally fetch from your API
    // Simulating with placeholder data for now
    setNews([
      { 
        id: 1, 
        title: 'Supreme Court Issues New Guidelines on Bail Applications', 
        summary: 'New guidelines aim to streamline the bail process and ensure timely hearings.',
        date: '24 Mar 2025'
      }
    ]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };

  const handleDeleteCase = async (caseId) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this case? This action cannot be undone.");
    
    if (!confirmDelete) {
      return; // User cancelled the deletion
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/sign-in');
        return;
      }
      
      await axios.delete(`http://localhost:3005/api/cases/case/${caseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Show success message
      alert("Case deleted successfully!");
      
      // Refresh the cases list
      fetchUserCases();
      
    } catch (err) {
      console.error('Error deleting case:', err);
      alert(err.response?.data?.message || 'Failed to delete case. Please try again later.');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <Link to="/">
            <img src="/images/golden nyayasarthi logo.png" alt="NyayaSarthi Logo" className="logo" />
          </Link>
          <nav className="dashboard-nav">
            <Link to="/dashboard" className="active">My Case</Link>
            <Link to="/nyaya-sanhita">Nyaya Sanhita</Link>
            <Link to="/qa">Q&A</Link>
            <Link to="/account">Account</Link>
          </nav>
        </header>

        {/* Main content */}
        <main className="dashboard-main">
          {/* My Cases Section */}
          <section className="dashboard-section">
            <h2>My Case</h2>
            
            {loading ? (
              <div className="loading">Loading your cases...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <div className="case-list">
                {cases.length > 0 ? (
                  <table className="case-table">
                    <tbody>
                      {cases.map((caseItem, index) => (
                        <tr key={caseItem._id} className="case-item">
                          <td className="case-index">{index + 1}.</td>
                          <td className="case-title">{caseItem.subject}</td>
                          <td className="case-date">{formatDate(caseItem.createdAt)}</td>
                          <td className="case-actions">
                            {/* Details button to view case details */}
                            <Link to={`/case/${caseItem._id}/details`} className="details-button">
                              Details
                            </Link>
                            
                            {/* Delete button with trash icon - only show if case is pending or has no assigned advocate */}
                            {(!caseItem.advocate || caseItem.status === 'pending') && (
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

          {/* Bookmarks Section */}
          <section className="dashboard-section">
            <h2>Bookmarks</h2>
            <div className="bookmarks-container">
              {bookmarks.map(bookmark => (
                <div key={bookmark.id} className="bookmark-item">
                  <p>{bookmark.title}</p>
                </div>
              ))}
              <div className="view-more">
                <Link to="/bookmarks">View more...</Link>
              </div>
            </div>
          </section>

          {/* News - Law Section */}
          <section className="dashboard-section">
            <h2>News - Law</h2>
            <div className="news-container">
              {news.map(item => (
                <div key={item.id} className="news-item">
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <span className="news-date">{item.date}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="dashboard-footer">
          <div className="footer-logo">
            <img src="/images/Component 1.png" alt="NyayaSarthi Logo" />
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
              <Link to="/floating-case">Float a Case</Link>
              <Link to="/find-a-lawyer">Find Lawyer</Link>
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