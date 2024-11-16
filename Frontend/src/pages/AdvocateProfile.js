// AdvocateProfile.js
import React from 'react';
import '../styles/AdvocateProfile.css';

const AdvocateProfile = () => {
  return (
    <div className="profile-container">
      <header className="profile-header">
        <h2>My Profile</h2>
        <a href="/edit-profile" className="edit-link">edit</a>
      </header>
      <section className="profile-details">
        <div className="profile-card">
          <img src="/images/444.jpeg" alt="Profile" className="profile-picture" />
          <div className="profile-info">
            <h3>Advocate Rajesh K.S</h3>
            <p className="profile-rating">
              <span className="stars">⭐⭐⭐⭐</span> 4.0 | 250+ user ratings
            </p>
            <div className="profile-meta">
              <p><span>📍</span> Bangalore / Bengaluru</p>
              <p><span>💼</span> 12 years experience</p>
              <p><span>📄</span> English, Hindi, Kannada</p>
            </div>
            <p><strong>Enrolment No.:</strong> KAR/01145/2006</p>
            <p><strong>Registration No.:</strong> NB/KAR/2023/11210</p>
          </div>
        </div>
        
        <div className="profile-sections">
          <div className="profile-section">
            <h4>Practice License:</h4>
            <p>Supreme Court, High Court, District Court</p>
          </div>
          
          <div className="profile-section">
            <h4>Practice Area:</h4>
            <p>Anticipatory Bail, Arbitration, Bankruptcy / Insolvency, Breach of Contract, Cheque Bounce, Child Custody, Consumer Court, Corporate, Criminal, Cyber Crime, Divorce, Documentation, Domestic Violence, High Court, Insurance, Labour & Service, Landlord/Tenant, Media and Entertainment</p>
          </div>
          
          <div className="profile-section">
            <h4>About Lawyer:</h4>
            <p>Advocate Rajesh K.S has been practicing and handling cases independently with a result-oriented approach, both professionally and ethically and has acquired excellent professional experience in providing legal consultancy and advisory services in various fields of law.</p>
            <p>Advocate Rajesh provides legal services in a variety of legal areas including Family Disputes, Property related Matters, Matrimonial Disputes, and Drafting and vetting of various agreements and connected matters, Writ Jurisdiction, Service matters, Civil matters, Criminal matters, and other miscellaneous matters.</p>
          </div>
          
          <div className="profile-section">
            <h4>Specialisation:</h4>
            <p>File for Divorce, Reply / Send Legal Notice for Divorce, Contest / Appeal in Divorce Case, Dowry Demand / Domestic Violence / Abuse, Alimony / Maintenance Issue, Child Custody Issue, Extramarital Affair / Cheating, Property Documentation / Verification, Illegal Possession, Illegal Construction, Landlord / Tenant Issues, Builder Delay / Fraud, Transfer of Ownership / Name Change, Gifting of Property, Municipal Corporation Issues, Divorce / Matrimonial Issue, Succession of Property.</p>
          </div>
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

export default AdvocateProfile;