// AdvocateDashboard.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/AdvocateDashboard.css';

const AdvocateDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <img src="/images/golden nyayasarthi logo.png" alt="Nyayasarthi Logo" className="logo" />
        <div className="nav-links">
          <NavLink to="/my-case" activeClassName="active-link">My Case</NavLink>
          <NavLink to="/nyaya-sanhita" activeClassName="active-link">Nyaya Sanhita</NavLink>
          <NavLink to="/floating-case" activeClassName="active-link">Floating Case</NavLink>
          <NavLink to="/profile" activeClassName="active-link">Profile</NavLink> {/* Updated Profile link */}
          <NavLink to="/account" activeClassName="active-link">Account</NavLink>
        </div>
      </nav>

      {/* My Case Section */}
      <section className="section my-case">
        <h3>My Case</h3>
        <div className="case-list">
          <div className="case-item">
            <span>1. Divorce Case</span>
            <span>14 Aug 2024</span>
            <div className="case-actions">
              <a href="#notifications">Notifications</a>
              <a href="#messages">Messages</a>
              <a href="#documents">Documents</a>
            </div>
          </div>
          <div className="case-item">
            <span>2. Civil Case</span>
            <span>28 Aug 2024</span>
            <div className="case-actions">
              <a href="#notifications">Notifications</a>
              <a href="#messages">Messages</a>
              <a href="#documents">Documents</a>
            </div>
          </div>
        </div>
      </section>

      {/* Case Request Section */}
      <section className="section case-request">
        <h3>Case Request</h3>
        <div className="case-request-list">
          <div className="case-request-item">
            <span>1. Corporate Case</span>
            <span>2 Sept 2024</span>
            <span>Akash Rao</span>
            <a href="#case-details">Case Details</a>
          </div>
          <div className="case-request-item">
            <span>2. Civil Case</span>
            <span>4 Sept 2024</span>
            <span>Rohan Shetty</span>
            <a href="#case-details">Case Details</a>
          </div>
        </div>
      </section>

      {/* Bookmarks Section */}
      <section className="section bookmarks">
        <h3>Bookmarks</h3>
        <div className="bookmark-items">
          <div className="bookmark-item"></div>
          <div className="bookmark-item"></div>
          <a href="#view-more" className="view-more">View more...</a>
        </div>
      </section>

      {/* News - Law Section */}
      <section className="section news-law">
        <h3>News - Law</h3>
        <div className="news-content"></div>
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

export default AdvocateDashboard;