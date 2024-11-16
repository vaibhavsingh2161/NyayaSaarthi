// CreateCase.js
import React, { useRef, useState } from 'react';
import './CreateCase.css';

function CreateCase() {
  const fileInputRef = useRef(null);
  const [fileNames, setFileNames] = useState([]);

  const handleUploadClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setFileNames(files.map((file) => file.name)); // Store file names
  };

  return (
    <div className="create-case-page">
      <header className="create-case-header">
        <img src="/images/golden nyayasarthi logo.png" alt="NyayaSarthi Logo" className="logo" />
        <nav className="header-nav">
          <a href="#my-case">My Case</a>
          <a href="#nyaya-sanhita">Nyaya Sanhita</a>
          <a href="#qa">Q&A</a>
          <a href="#account">Account</a>
        </nav>
      </header>

      <main className="create-case-content">
        <h1>Create Case</h1>
        <form className="case-form">
          <input type="text" placeholder="Subject" className="case-input" />
          <textarea placeholder="Description" className="case-textarea"></textarea>

          {/* Upload Section */}
          <div className="upload-section">
            <button type="button" className="upload-button" onClick={handleUploadClick}>
              <span className="upload-icon">&#x2191;</span> Upload Documents
            </button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }} // Hide the file input
            />
          </div>

          {/* Display selected file names */}
          <div className="file-names">
            {fileNames.length > 0 && <p>Uploaded Files:</p>}
            {fileNames.map((name, index) => (
              <p key={index} className="file-name">{name}</p>
            ))}
          </div>

          <div className="form-buttons">
            <button type="button" className="float-button">Float Case</button>
            <button type="submit" className="create-button">Create Case</button>
          </div>
        </form>
      </main>

      <footer className="create-case-footer">
        <img src="/images/Component 1.png" alt="NyayaSarthi Logo" className="footer-logo" />
        <div className="footer-links">
          <div>
            <h4>Quick Links</h4>
            <a href="#announcement">Announcement</a>
            <a href="#about-us">About Us</a>
            <a href="#feedback">Feedback</a>
            <a href="#qa">Q&A</a>
          </div>
          <div>
            <h4>Case</h4>
            <a href="#relevant-laws">Find Relevant Laws</a>
            <a href="#float-case">Float a Case</a>
            <a href="#find-lawyer">Find Lawyer</a>
            <a href="#legal-advice">Legal Advice</a>
          </div>
          <div>
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

export default CreateCase;