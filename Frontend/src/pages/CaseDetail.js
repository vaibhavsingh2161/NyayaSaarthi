import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CaseDetail.css";
import { FaSignOutAlt } from "react-icons/fa";
import logo from "../assets/golden nyayasarthi logo.png";
import footerLogo from "../assets/Component 1.png";
import NavbarUser from "../components/NavbarUser";
import NavbarAdv from "../components/NavbarAdv";

function CaseDetail() {
  const { caseId, tab = "details" } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(tab);
  const navigate = useNavigate();
  const downloadLinkRef = useRef(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [floatingUpdating, setFloatingUpdating] = useState(false);
  const userRole = localStorage.getItem("userRole");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCaseDetails();

    const getUserId = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://localhost:3005/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data._id) {
          localStorage.setItem("userId", response.data._id);
        }
      } catch (err) {
        console.error("Error fetching user ID:", err);
      }
    };

    getUserId();
  }, [caseId]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await axios.get(
        `http://localhost:3005/api/cases/case/${caseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCaseData(response.data.case);
    } catch (err) {
      console.error("Error fetching case details:", err);
      setError("Failed to load case details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    navigate(`/case/${caseId}/${tabName.toLowerCase()}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()} ${date.toLocaleString("default", {
      month: "short",
    })} ${date.getFullYear()}`;
  };

  const handleDeleteCase = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this case? This action cannot be undone."
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setLoading(true);
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

      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting case:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete case. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = async (documentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await axios({
        method: "GET",
        url: `http://localhost:3005/api/cases/case/${caseId}/document/${documentId}?view=true`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const contentType = response.headers["content-type"];

      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, "_blank");

      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (err) {
      console.error("Error opening document:", err);
      alert("Failed to open document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (documentId, fileName) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await axios({
        method: "GET",
        url: `http://localhost:3005/api/cases/case/${caseId}/document/${documentId}`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const contentType = response.headers["content-type"];

      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);

      downloadLinkRef.current.href = blobUrl;
      downloadLinkRef.current.download = fileName || "document";

      downloadLinkRef.current.click();

      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (err) {
      console.error("Error downloading document:", err);
      alert("Failed to download document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
      setUploadError("");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      setUploadError("Please select at least one file to upload");
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("documents", file);
      });

      const response = await axios.post(
        `http://localhost:3005/api/cases/case/${caseId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Documents uploaded successfully!");

      setSelectedFiles([]);

      fetchCaseDetails();
    } catch (err) {
      console.error("Error uploading documents:", err);
      setUploadError(
        err.response?.data?.message ||
          "Failed to upload documents. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const notifications = [
    {
      id: 1,
      message: "Lawyer has responded to your case",
      date: "18 Mar 2025",
      isRead: false,
    },
    {
      id: 2,
      message: "New document has been added",
      date: "16 Mar 2025",
      isRead: true,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Advocate Rajesh K.S",
      content:
        "I have reviewed your case and have some questions about the incident.",
      timestamp: "16 Mar 2025, 14:30",
    },
    {
      id: 2,
      sender: "You",
      content: "Thank you. What additional information do you need?",
      timestamp: "16 Mar 2025, 15:45",
    },
  ];

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.post(
          "http://localhost:3005/api/users/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      navigate("/sign-in");
    }
  };

  const handleFloatingToggle = async () => {
    if (!caseData || floatingUpdating) return;

    try {
      setFloatingUpdating(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await axios.patch(
        `http://localhost:3005/api/cases/case/${caseId}/floating`,
        { isFloating: !caseData.isFloating },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCaseData({
        ...caseData,
        isFloating: !caseData.isFloating,
      });

      alert(
        `Case is now ${
          !caseData.isFloating ? "floating" : "no longer floating"
        }.`
      );
    } catch (err) {
      console.error("Error updating floating status:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update case floating status. Please try again."
      );
    } finally {
      setFloatingUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!caseData || statusUpdating) return;

    try {
      setStatusUpdating(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/sign-in");
        return;
      }

      const response = await axios.patch(
        `http://localhost:3005/api/cases/case/${caseId}/status`,
        { status: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCaseData({
        ...caseData,
        status: newStatus,
      });

      alert(`Case status updated to ${newStatus} successfully.`);
    } catch (err) {
      console.error("Error updating case status:", err);
      alert(
        err.response?.data?.message ||
          "Failed to update case status. Please try again."
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const NavbarComponent = userRole === "advocate" ? NavbarAdv : NavbarUser;

  if (loading) {
    return (
      <div className="case-detail-container">
        <div className="loading">Loading case details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="case-detail-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="case-detail-container">
      <div className="case-detail-content">
        {}
        <NavbarComponent logo={logo} handleLogout={handleLogout} />
        {}
        <main className="case-detail-main">
          {}
          <div className="case-title-bar">
            <div className="case-header">
              <h1>{caseData?.subject}</h1>
              <span className="case-status">{caseData?.status}</span>
            </div>
            <div className="case-meta">
              <span>Created on {formatDate(caseData?.createdAt)}</span>
              <span>Case ID: {caseData?._id}</span>
            </div>
          </div>

          {}
          <div className="case-tabs">
            <button
              className={activeTab === "details" ? "active" : ""}
              onClick={() => handleTabChange("details")}
            >
              Details
            </button>
            <button
              className={activeTab === "notifications" ? "active" : ""}
              onClick={() => handleTabChange("notifications")}
            >
              Notifications
            </button>
            <button
              className={activeTab === "messages" ? "active" : ""}
              onClick={() => handleTabChange("messages")}
            >
              Messages
            </button>
            <button
              className={activeTab === "documents" ? "active" : ""}
              onClick={() => handleTabChange("documents")}
            >
              Documents
            </button>
          </div>

          {}
          <div className="tab-content">
            {}
            {activeTab === "details" && (
              <div className="details-tab">
                {}
                <div className="case-type-section">
                  <div className="case-type-header">
                    <h3>Case Type:</h3>
                    <p className="case-type-badge">
                      {caseData?.caseType || "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="case-description">
                  <h3>Case Description</h3>
                  <p>{caseData?.description}</p>
                </div>

                {}
                {caseData?.user?._id === localStorage.getItem("userId") &&
                  (!caseData?.advocate || caseData?.status === "pending") && (
                    <div className="case-actions-section">
                      <button
                        onClick={handleDeleteCase}
                        className="delete-case-button"
                        disabled={loading}
                      >
                        {loading ? "Deleting..." : "Delete Case"}
                      </button>
                      <p className="delete-info">
                        Note: You can only delete a case if it hasn't been
                        assigned to an advocate yet.
                      </p>
                    </div>
                  )}

                {}
                {caseData?.advocate ? (
                  <div className="lawyer-info">
                    <h3>Assigned Lawyer</h3>
                    <div className="lawyer-card">
                      <div className="lawyer-image">
                        <img src="/images/444.jpeg" alt="Lawyer" />
                      </div>
                      <div className="lawyer-details">
                        <h4>{caseData.advocate.name}</h4>
                        <p>
                          <strong>Email:</strong> {caseData.advocate.email}
                        </p>
                        <p>
                          <strong>Phone:</strong> {caseData.advocate.phone}
                        </p>
                        <button className="contact-button">
                          Contact Lawyer
                        </button>
                      </div>
                    </div>
                  </div>
                ) : userRole === "plaintiff" ? (
                  <div className="find-lawyer-section">
                    <h3>No Lawyer Assigned</h3>
                    <p>You don't have a lawyer assigned to this case yet.</p>
                    <div className="lawyer-actions">
                      <Link
                        to={`/find-a-lawyer/${caseId}`}
                        className="find-lawyer-button"
                      >
                        Find a Lawyer
                      </Link>

                      {}
                      <button
                        className={`float-case-button ${
                          caseData?.isFloating ? "floating-active" : ""
                        }`}
                        onClick={handleFloatingToggle}
                        disabled={floatingUpdating}
                      >
                        {floatingUpdating
                          ? "Updating..."
                          : caseData?.isFloating
                          ? "Remove from Floating Cases"
                          : "Float This Case"}
                      </button>
                    </div>

                    {}
                    {caseData?.isFloating && (
                      <div className="floating-status">
                        <p>
                          <span className="floating-badge">Floating</span>
                          This case is visible to all advocates who can request
                          to handle it.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="find-lawyer-section">
                    <h3>No Lawyer Assigned</h3>
                    <p>
                      This case is currently pending assignment to an advocate.
                    </p>
                    {}
                  </div>
                )}

                <div className="case-status-section">
                  <h3>Case Status</h3>
                  <div className="status-timeline">
                    <div
                      className={`status-step ${
                        caseData?.status === "pending" ||
                        caseData?.status === "assigned" ||
                        caseData?.status === "in-progress" ||
                        caseData?.status === "closed"
                          ? "completed"
                          : ""
                      }`}
                    >
                      <div className="status-indicator"></div>
                      <p>Created</p>
                    </div>
                    <div
                      className={`status-step ${
                        caseData?.status === "assigned" ||
                        caseData?.status === "in-progress" ||
                        caseData?.status === "closed"
                          ? "completed"
                          : ""
                      }`}
                    >
                      <div className="status-indicator"></div>
                      <p>Lawyer Assigned</p>
                    </div>
                    <div
                      className={`status-step ${
                        caseData?.status === "in-progress" ||
                        caseData?.status === "closed"
                          ? "completed"
                          : ""
                      }`}
                    >
                      <div className="status-indicator"></div>
                      <p>In Progress</p>
                      {}
                      {caseData?.status === "assigned" &&
                        localStorage.getItem("userRole") === "advocate" &&
                        caseData?.advocate?._id ===
                          localStorage.getItem("userId") && (
                          <button
                            className="status-update-button"
                            onClick={() => handleStatusUpdate("in-progress")}
                            disabled={statusUpdating}
                          >
                            {statusUpdating ? "Updating..." : "Start Progress"}
                          </button>
                        )}
                    </div>
                    <div
                      className={`status-step ${
                        caseData?.status === "closed" ? "completed" : ""
                      }`}
                    >
                      <div className="status-indicator"></div>
                      <p>Closed</p>
                      {}
                      {caseData?.status === "in-progress" &&
                        localStorage.getItem("userRole") === "advocate" &&
                        caseData?.advocate?._id ===
                          localStorage.getItem("userId") && (
                          <button
                            className="status-update-button"
                            onClick={() => handleStatusUpdate("closed")}
                            disabled={statusUpdating}
                          >
                            {statusUpdating ? "Updating..." : "Close Case"}
                          </button>
                        )}
                    </div>
                  </div>

                  {}
                  <div className="current-status-indicator">
                    <p>
                      Current Status:{" "}
                      <span className="current-status">{caseData?.status}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {}
            {activeTab === "notifications" && (
              <div className="notifications-tab">
                <h3>Notifications</h3>
                {notifications.length > 0 ? (
                  <div className="notification-list">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`notification-item ${
                          !notification.isRead ? "unread" : ""
                        }`}
                      >
                        <div className="notification-content">
                          <p>{notification.message}</p>
                          <span className="notification-date">
                            {notification.date}
                          </span>
                        </div>
                        {!notification.isRead && (
                          <span className="unread-indicator"></span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data-message">No notifications yet.</p>
                )}
              </div>
            )}

            {}
            {activeTab === "messages" && (
              <div className="messages-tab">
                <h3>Messages</h3>
                {messages.length > 0 ? (
                  <div className="message-thread">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message-item ${
                          message.sender === "You" ? "sent" : "received"
                        }`}
                      >
                        <div className="message-bubble">
                          <p className="message-sender">{message.sender}</p>
                          <p className="message-content">{message.content}</p>
                          <span className="message-time">
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="message-input">
                      <textarea placeholder="Type your message here..."></textarea>
                      <button>Send</button>
                    </div>
                  </div>
                ) : (
                  <p className="no-data-message">No messages yet.</p>
                )}
              </div>
            )}

            {}
            {activeTab === "documents" && (
              <div className="documents-tab">
                <div className="documents-header">
                  <h3>Documents</h3>
                  <div className="upload-controls">
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      style={{ display: "none" }}
                    />
                    <button
                      className="upload-document-button"
                      onClick={handleUploadClick}
                      disabled={uploading}
                    >
                      + Select Documents
                    </button>
                  </div>
                </div>

                {}
                {selectedFiles.length > 0 && (
                  <div className="selected-files-list">
                    <h4>Selected Files ({selectedFiles.length})</h4>
                    <ul>
                      {selectedFiles.map((file, index) => (
                        <li key={index}>
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                    <button
                      className="upload-submit-button"
                      onClick={handleUploadDocuments}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Upload Files"}
                    </button>
                  </div>
                )}

                {}
                {uploadError && (
                  <div className="error-message">{uploadError}</div>
                )}

                {}
                {caseData?.documents && caseData.documents.length > 0 ? (
                  <div className="document-list">
                    {caseData.documents.map((document) => (
                      <div key={document._id} className="document-item">
                        <div className="document-icon">📄</div>
                        <div className="document-info">
                          <p className="document-name">{document.fileName}</p>
                          <span className="document-meta">
                            {Math.round(document.fileSize / 1024)} KB • Uploaded
                            on {formatDate(document.uploadDate)}
                          </span>
                        </div>
                        <div className="document-actions">
                          <button
                            onClick={() => handleOpenDocument(document._id)}
                            className="open-button"
                            disabled={loading || uploading}
                          >
                            Open
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadDocument(
                                document._id,
                                document.fileName
                              )
                            }
                            className="download-button"
                            disabled={loading || uploading}
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data-message">No documents uploaded yet.</p>
                )}
              </div>
            )}
          </div>
        </main>

        {}
        <footer className="case-detail-footer">
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

        {}
        <a ref={downloadLinkRef} style={{ display: "none" }}></a>
      </div>
    </div>
  );
}

export default CaseDetail;
