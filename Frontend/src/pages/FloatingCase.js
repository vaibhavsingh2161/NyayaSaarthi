// FloatingCase.js
import React from 'react';
import '../styles/FloatingCase.css';
import { NavLink } from 'react-router-dom';

const FloatingCase = () => {
  return (
    <div className="floating-case-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <img src="/images/golden nyayasarthi logo.png" alt="Nyayasarthi Logo" className="logo" />
        <div className="nav-links">
          <NavLink to="/my-case">My Case</NavLink>
          <NavLink to="/nyaya-sanhita">Nyaya Sanhita</NavLink>
          <NavLink to="/floating-case" activeClassName="active-link">Floating Case</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/account">Account</NavLink>
        </div>
      </nav>

      {/* Filter Section */}
      <section className="filter-section">
        <select className="filter-dropdown">
          <option>Select Practice Area</option>
          <option>Divorce</option>
          <option>Child Custody</option>
          <option>Corporate</option>
          <option>Criminal</option>
          {/* Add more options as needed */}
        </select>
        <select className="filter-dropdown">
          <option>Select City</option>
          <option>Bangalore</option>
          <option>Mumbai</option>
          <option>Delhi</option>
          <option>Chennai</option>
          {/* Add more cities as needed */}
        </select>
        <button className="search-button">🔍</button>
      </section>

      {/* Case Cards */}
      <section className="case-list">
        <div className="case-card">
          <h3>Divorce Settlement and Child Custody</h3>
          <p>Handled a complex divorce case involving the division of assets and child custody disputes. Successfully negotiated an out-of-court settlement, ensuring the client received a fair share of assets and primary custody of the child. The case was resolved within six months, minimizing emotional and financial stress for the client.</p>
          <div className="case-meta">
            <span>High Court</span>
            <span>Bangalore</span>
          </div>
          <button className="details-button">Details</button>
        </div>
        
        {/* Duplicate card for example */}
        <div className="case-card">
          <h3>Divorce Settlement and Child Custody</h3>
          <p>Handled a complex divorce case involving the division of assets and child custody disputes. Successfully negotiated an out-of-court settlement, ensuring the client received a fair share of assets and primary custody of the child. The case was resolved within six months, minimizing emotional and financial stress for the client.</p>
          <div className="case-meta">
            <span>High Court</span>
            <span>Bangalore</span>
          </div>
          <button className="details-button">Details</button>
        </div>
      </section>
      
      {/* Footer */}
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
};

export default FloatingCase;