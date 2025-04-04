import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/CreateCase.css";
import { FaMicrophone, FaStopCircle } from "react-icons/fa";
import logo from "../assets/golden nyayasarthi logo.png";
import footerLogo from "../assets/Component 1.png";

function CreateCase() {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    caseType: "",
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const caseTypes = [
    "Civil Case",
    "Criminal Case",
    "Family Case",
    "Property Dispute",
    "Corporate Case",
    "Intellectual Property",
    "Consumer Case",
    "Labor Dispute",
    "Other",
  ];

  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setFormData((prevData) => ({
            ...prevData,
            description: prevData.description + " " + finalTranscript,
          }));
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        if (isListening) {
          recognition.start();
        }
      };

      setSpeechRecognition(recognition);
    }

    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!speechRecognition) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      speechRecognition.stop();
      setIsListening(false);
    } else {
      speechRecognition.start();
      setIsListening(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (isListening && speechRecognition) {
      speechRecognition.stop();
      setIsListening(false);
    }

    if (
      !formData.subject.trim() ||
      !formData.description.trim() ||
      !formData.caseType
    ) {
      setError("Subject, description, and case type are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      const caseData = new FormData();
      caseData.append("subject", formData.subject);
      caseData.append("description", formData.description);
      caseData.append("caseType", formData.caseType);

      files.forEach((file, index) => {
        caseData.append("documents", file);
      });

      const response = await axios.post(
        "http://localhost:3005/api/cases/create",
        caseData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Case created successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error creating case:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create case. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-case-page">
      <header className="create-case-header">
        <img src={logo} alt="NyayaSarthi Logo" className="logo" />
        <nav className="header-nav">
          <a href="/dashboard">My Case</a>
          <a href="/nyaya-sanhita">Nyaya Sanhita</a>
          <a href="/qa">Q&A</a>
          <a href="/account">Account</a>
        </nav>
      </header>

      <main className="create-case-content">
        <h1>Create Case</h1>

        {error && <div className="error-message">{error}</div>}

        <form className="case-form" onSubmit={handleCreateCase}>
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            className="case-input"
            value={formData.subject}
            onChange={handleChange}
            required
          />

          {}
          <div className="form-group">
            <label htmlFor="caseType">Case Type</label>
            <select
              id="caseType"
              name="caseType"
              value={formData.caseType}
              onChange={handleChange}
              className="case-input"
              required
            >
              <option value="">Select Case Type</option>
              {caseTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="textarea-container">
            <textarea
              name="description"
              placeholder="Description"
              className="case-textarea"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
            <button
              type="button"
              className={`speech-button ${isListening ? "listening" : ""}`}
              onClick={toggleListening}
              title={isListening ? "Stop dictation" : "Start dictation"}
            >
              {isListening ? <FaStopCircle /> : <FaMicrophone />}
            </button>
          </div>

          {}
          <div className="upload-section">
            <button
              type="button"
              className="upload-document-button"
              onClick={handleUploadClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="upload-icon"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload Documents
            </button>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {}
          {files.length > 0 && (
            <div className="file-names">
              <p>Uploaded Files:</p>
              {files.map((file, index) => (
                <p key={index} className="file-name">
                  {file.name}
                </p>
              ))}
            </div>
          )}

          <div className="form-buttons">
            <button
              type="submit"
              className="create-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Case..." : "Create Case"}
            </button>
          </div>
        </form>
      </main>

      <footer className="create-case-footer">
        <div className="footer-logo">
          <img src={footerLogo} alt="NyayaSarthi Logo" />
        </div>
        <div className="footer-links">
          <div className="footer-column">
            <h4>Quick Links</h4>
            <a href="/announcements">Announcement</a>
            <a href="/about-us">About Us</a>
            <a href="/feedback">Feedback</a>
            <a href="/qa">Q&A</a>
          </div>
          <div className="footer-column">
            <h4>Case</h4>
            <a href="/nyaya-sanhita">Find Relevant Laws</a>
            <a href="/floating-case">Float a Case</a>
            <a href="/find-a-lawyer">Find Lawyer</a>
            <a href="/legal-advice">Legal Advice</a>
          </div>
          <div className="footer-column">
            <h4>Law</h4>
            <a href="/nyaya-sanhita">Nyaya Sanhita</a>
            <a href="/search">Search</a>
            <a href="/news">Recent News</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CreateCase;
