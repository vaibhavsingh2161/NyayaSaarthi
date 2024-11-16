import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
import '../styles/FindALawyer.css';

function FindALawyer() {
  const [lawyers, setLawyers] = useState([]);

  // Fetch data from lawyers.json
  useEffect(() => {
    fetch('/lawyers.json')
      .then(response => response.json())
      .then(data => setLawyers(data))
      .catch(error => console.error("Error fetching lawyer data:", error));
  }, []);

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

        <div className="lawyer-list">
          {lawyers.map((lawyer, index) => (
            <div key={index} className="lawyer-profile">
              <div className="profile-image">
                <img
                  src={lawyer.profilePic}
                  alt={`${lawyer.name}'s profile`}
                  className="profile-pic"
                />
              </div>
              <div className="profile-details">
                <h3 className="lawyer-name">{lawyer.name}</h3>
                <p className="area-of-practice">
                  <strong>Area of Practice:</strong> {lawyer.practiceAreas}
                </p>
                <div className="profile-info">
                  <div className="rating">
                    <span>⭐⭐⭐⭐⭐</span>
                    <span className="rating-score">{lawyer.rating}</span>
                    <span className="rating-count">| {lawyer.ratingsCount}</span>
                  </div>
                  <p className="location">📍 {lawyer.location}</p>
                  <p className="experience">💼 {lawyer.experience}</p>
                </div>
              </div>
              <button className="contact-button">Contact Now</button>
            </div>
          ))}
        </div>
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