import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Import axios
// import { Link } from 'react-router-dom';
import '../styles/FindALawyer.css';
import fallbackProfileImage from '../assets/444.jpeg'; // Import fallback image

function FindALawyer() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  // Fetch data from API endpoint
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('/api/advocate/list'); // Fetch from backend API
        setLawyers(response.data);
      } catch (err) {
        console.error("Error fetching lawyer data:", err);
        setError(err.message || 'Failed to fetch lawyers.');
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  // Function to get profile image URL
  const getProfileImageUrl = (profilePicturePath) => {
    if (!profilePicturePath) {
      return fallbackProfileImage;
    }
    // Remove 'uploads/' or 'uploads\' prefix if present, then prepend '/uploads/'
    return `/uploads/${profilePicturePath.replace(/^uploads[\\\/]?/, '')}`;
  };

  return (
    <div className="find-a-lawyer-container">
      <header className="header">
        <img
          src="/images/golden nyayasarthi logo.png"
          alt="Nyayasarthi Logo"
          className="logo"
        />
        <nav className="header-nav">
          <a href="#my-case">My Case</a>
          <a href="#nyaya-sanhita">Nyaya Sanhita</a>
          <a href="#qa">Q&A</a>
          <a href="#account">Account</a>
        </nav>
      </header>

      <main>
        <h2>Find a Lawyer</h2>
        <div className="filter-bar">
          <select className="filter-select">
            <option>Select Practice Area</option>
          </select>
          <select className="filter-select">
            <option>Select City</option>
          </select>
          <button className="search-button">🔍</button>
        </div>

        {loading && <p>Loading lawyers...</p>} {/* Loading indicator */}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>} {/* Error message */}
        {!loading && !error && (
          <div className="lawyer-list">
            {lawyers.length === 0 ? (
              <p>No lawyers found.</p>
            ) : (
              lawyers.map((lawyer) => (
                <div key={lawyer._id} className="lawyer-profile"> {/* Use lawyer._id as key */}
                  <div className="profile-image">
                    <img
                      src={getProfileImageUrl(lawyer.profilePicture)} // Use API data and helper function
                      alt={`${lawyer.userId?.name || 'Lawyer'}'s profile`}
                      className="profile-pic"
                      onError={(e) => { // Add onError fallback
                        e.target.src = fallbackProfileImage;
                        e.target.onerror = null; 
                      }}
                    />
                  </div>
                  <div className="profile-details">
                    <h3 className="lawyer-name">{lawyer.userId?.name || 'Advocate Name'}</h3> {/* Use userId.name */}
                    <p className="area-of-practice">
                      {/* Join specialisation array, handle empty case */}
                      <strong>Area of Practice:</strong> {lawyer.specialisation?.length > 0 ? lawyer.specialisation.join(', ') : 'N/A'}
                    </p>
                    <div className="profile-info">
                      <div className="rating">
                        {/* Static rating for now */}
                        <span>⭐⭐⭐⭐⭐</span> 
                        {/* <span className="rating-score">{lawyer.rating}</span> 
                        <span className="rating-count">| {lawyer.ratingsCount}</span> */}
                      </div>
                      <p className="location">📍 {lawyer.location || 'N/A'}</p> {/* Use location */}
                      <p className="experience">💼 {lawyer.yearsOfExperience !== undefined ? `${lawyer.yearsOfExperience} years` : 'N/A'} experience</p> {/* Use yearsOfExperience */}
                      <p className="languages">📄 Languages: {lawyer.languages?.length > 0 ? lawyer.languages.join(', ') : 'N/A'}</p> {/* Display languages */}
                    </div>
                  </div>
                  <button className="contact-button">Contact Now</button> {/* Keep button static for now */}
                </div>
              ))
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-logo">
          <img src="/images/Component 1.png" alt="Nyayasarthi Logo" />
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
}

export default FindALawyer;