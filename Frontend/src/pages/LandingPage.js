import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";
import logo from "../assets/golden nyayasarthi logo.png";
import footerLogo from "../assets/Component 1.png";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {}
      <header className="header">
        <img src={logo} alt="Nyayasarthi Logo" className="logo" />
        {}
        <div className="header-buttons">
          <button className="login-btn" onClick={() => navigate("/sign-in")}>
            Login
          </button>
          <button className="signup-btn" onClick={() => navigate("/sign-up")}>
            Register
          </button>
        </div>
      </header>

      {}
      <section className="hero">
        <div className="hero-text">
          {}
          <h1>
            <span className="highlight">Smart. Secure. Seamless</span> – Legal
            Case Management Made Easy!
          </h1>
          <p>
            Manage your legal cases effortlessly with NyayaSarthi. Whether
            you're an advocate handling multiple clients or a user seeking legal
            assistance, our smart and secure platform streamlines case requests,
            tracking, and communication—all in one place.
          </p>
        </div>
        <div className="hero-image">
          <img src="/images/lawyers-illustration.png" alt="Lawyers" />
        </div>
      </section>

      {}
      <section className="legal-help-section">
        <div className="legal-help-content">
          <div className="left-section">
            <h2>How to get legal help through NyayaSarthi?</h2>
            <p>
              1️⃣ Sign Up – Create your account as a user or advocate. <br />
              2️⃣ Submit Case Request – Describe your legal issue and submit a
              request. <br />
              3️⃣ Connect with Advocates – Get matched with experienced lawyers.{" "}
              <br />
              4️⃣ Track Progress – Stay updated on your case in real time. <br />
              5️⃣ Communicate Securely – Chat, share documents, and receive legal
              advice. <br />
              <br />
              NyayaSarthi ensures a seamless legal experience, from request to
              resolution! ⚖️🚀
            </p>
          </div>
          <div className="right-section">
            <div className="help-step">
              <div className="icon-container">
                <img src="/images/create-case-icon.png" alt="Create a case" />
              </div>
              <div>
                <h3>Create a case</h3>
                <p>
                  Here user will add all the necessary details about the case.
                  Also can learn about different laws.
                </p>
              </div>
            </div>
            <div className="help-step">
              <div className="icon-container">
                <img src="/images/find-lawyer-icon.png" alt="Find a lawyer" />
              </div>
              <div>
                <h3>Find a lawyer</h3>
                <p>
                  Connect with the best lawyers present on the platform. Submit
                  the case details to them.
                </p>
              </div>
            </div>
            <div className="help-step">
              <div className="icon-container">
                <img
                  src="/images/discuss-legal-icon.png"
                  alt="Discuss your legal matter"
                />
              </div>
              <div>
                <h3>Discuss your legal matter</h3>
                <p>
                  Get proper guidance and proper help for your legal procedure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section
        className="law-search-portal"
        style={{
          backgroundImage: "url('/images/background-illustration.png')",
        }}
      >
        <div className="law-search-content">
          <h2>Indian Law Search portal</h2>
          <input
            type="text"
            placeholder="Select Practice Area"
            className="search-bar"
          />
          <p>
            Our legal search portal empowers users to effortlessly access any
            law based on their queries, helping to spread awareness about recent
            and relevant legislation. Whether you're searching by{" "}
            <span className="highlight">keywords</span>, specific{" "}
            <span className="highlight">chapters</span>, or individual{" "}
            <span className="highlight">clauses</span>, our platform provides
            comprehensive results.
          </p>
          <div className="gavel-image">
            <img src="/images/Object.png" alt="Gavel Illustration" />
          </div>
        </div>
      </section>

      {}
      <section className="features-section">
        <div className="features-content">
          <h2>
            Discover best-in-class features to help you find the perfect lawyer
            for your legal needs.
          </h2>
          <div className="features-cards">
            <div className="feature-card">
              <div className="icon-container">
                <img
                  src="/images/find-lawyer-icon.png"
                  alt="Float a Case Icon"
                />
              </div>
              <h3>Float a Case</h3>
              <p>
                With our "Float Your Case" feature, you no longer have to worry
                about finding the right lawyer.
              </p>
              <p>
                Just submit the details of your case, and{" "}
                <strong>experienced lawyers</strong> will pitch you, offering
                competitive prices and personalized expertise.
              </p>
              <p>
                This allows you to choose the best legal representation,
                tailored to your needs.
              </p>
            </div>
            <div className="feature-card">
              <div className="icon-container">
                <img
                  src="/images/discuss-legal-icon.png"
                  alt="Search Lawyer Icon"
                />
              </div>
              <h3>Search Lawyer</h3>
              <p>
                With our "Search by Location or Practice Area" feature, finding
                the right lawyer has never been easier.
              </p>
              <p>
                Simply enter your location or the legal service you need, and
                connect with top <strong>professionals</strong> nearby.
              </p>
              <p>
                Get specialized legal expertise tailored to your case and region
                with just a few clicks!
              </p>
            </div>
          </div>
        </div>
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
            <a href="/sign-in">Find Relevant Laws</a>
            <a href="/sign-in">Float a Case</a>
            <a href="/sign-in">Find Lawyer</a>
            <a href="/sign-in">Legal Advice</a>
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

export default LandingPage;
