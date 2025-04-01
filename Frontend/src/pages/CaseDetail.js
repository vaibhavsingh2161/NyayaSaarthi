// src/pages/CaseDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CaseDetail.css';
import { FaSignOutAlt } from 'react-icons/fa';
import logo from '../assets/golden nyayasarthi logo.png';
import footerLogo from '../assets/Component 1.png';

function CaseDetail() {
    const { caseId, tab = 'details' } = useParams();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(tab); // 'details', 'notifications', 'messages', 'documents'
    const navigate = useNavigate();
    const downloadLinkRef = useRef(null);
    const [statusUpdating, setStatusUpdating] = useState(false); // State for status update loading
    const [floatingUpdating, setFloatingUpdating] = useState(false); // State for floating status update

    // Document upload states
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Fetch case details based on caseId
        fetchCaseDetails();
        
        // Store the user ID when fetching case details
        const getUserId = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const response = await axios.get('http://localhost:3005/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                if (response.data && response.data._id) {
                    localStorage.setItem('userId', response.data._id);
                }
            } catch (err) {
                console.error('Error fetching user ID:', err);
            }
        };
        
        getUserId();
    }, [caseId]);

    const fetchCaseDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/sign-in');
                return;
            }

            const response = await axios.get(`http://localhost:3005/api/cases/case/${caseId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setCaseData(response.data.case);
        } catch (err) {
            console.error('Error fetching case details:', err);
            setError('Failed to load case details. Please try again later.');
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
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    };

    const handleDeleteCase = async () => {
        // Show confirmation dialog
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this case? This action cannot be undone."
        );

        if (!confirmDelete) {
            return; // User cancelled the deletion
        }

        try {
            setLoading(true);
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

            // Redirect to dashboard
            navigate('/dashboard');

        } catch (err) {
            console.error('Error deleting case:', err);
            setError(err.response?.data?.message || 'Failed to delete case. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle document opening
    const handleOpenDocument = async (documentId) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/sign-in');
                return;
            }

            // Add view=true query parameter to indicate this is for viewing
            const response = await axios({
                method: 'GET',
                url: `http://localhost:3005/api/cases/case/${caseId}/document/${documentId}?view=true`,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            // Get the content type from the response
            const contentType = response.headers['content-type'];

            // Create a blob URL with the correct content type
            const blob = new Blob([response.data], { type: contentType });
            const blobUrl = URL.createObjectURL(blob);

            // Open in a new window
            window.open(blobUrl, '_blank');

            // Clean up the blob URL after a delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);

        } catch (err) {
            console.error('Error opening document:', err);
            alert('Failed to open document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle document download
    const handleDownloadDocument = async (documentId, fileName) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/sign-in');
                return;
            }

            const response = await axios({
                method: 'GET',
                url: `http://localhost:3005/api/cases/case/${caseId}/document/${documentId}`,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                responseType: 'blob'
            });

            // Get the content type from the response
            const contentType = response.headers['content-type'];

            // Create a blob with the correct content type
            const blob = new Blob([response.data], { type: contentType });
            const blobUrl = URL.createObjectURL(blob);

            // Set download link properties
            downloadLinkRef.current.href = blobUrl;
            downloadLinkRef.current.download = fileName || 'document';

            // Trigger click on the download link
            downloadLinkRef.current.click();

            // Clean up the blob URL after a delay
            setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);

        } catch (err) {
            console.error('Error downloading document:', err);
            alert('Failed to download document. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Document upload functions
    // Handle file selection
    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            setSelectedFiles(Array.from(e.target.files));
            setUploadError(''); // Clear any previous errors
        }
    };

    // Trigger file input click
    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    // Handle document upload
    const handleUploadDocuments = async () => {
        if (selectedFiles.length === 0) {
            setUploadError('Please select at least one file to upload');
            return;
        }

        try {
            setUploading(true);
            setUploadError('');
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/sign-in');
                return;
            }

            // Create form data for file upload
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('documents', file);
            });

            // Send request to upload documents
            const response = await axios.post(
                `http://localhost:3005/api/cases/case/${caseId}/documents`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Handle successful upload
            alert('Documents uploaded successfully!');
            // Clear selected files
            setSelectedFiles([]);
            // Refresh case details to show new documents
            fetchCaseDetails();
        } catch (err) {
            console.error('Error uploading documents:', err);
            setUploadError(err.response?.data?.message || 'Failed to upload documents. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // These are placeholder data - in a real application, these would be fetched from your API
    const notifications = [
        { id: 1, message: 'Lawyer has responded to your case', date: '18 Mar 2025', isRead: false },
        { id: 2, message: 'New document has been added', date: '16 Mar 2025', isRead: true },
    ];

    const messages = [
        { id: 1, sender: 'Advocate Rajesh K.S', content: 'I have reviewed your case and have some questions about the incident.', timestamp: '16 Mar 2025, 14:30' },
        { id: 2, sender: 'You', content: 'Thank you. What additional information do you need?', timestamp: '16 Mar 2025, 15:45' },
    ];

    // Handle user logout
    const handleLogout = () => {
        // Clear all auth-related data from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        
        // Redirect to sign-in page
        navigate('/sign-in');
    };

    // Handle case floating status toggle
    const handleFloatingToggle = async () => {
        if (!caseData || floatingUpdating) return;
        
        try {
            setFloatingUpdating(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/sign-in');
                return;
            }

            // Call the API to update the floating status
            const response = await axios.patch(
                `http://localhost:3005/api/cases/case/${caseId}/floating`,
                { isFloating: !caseData.isFloating }, // Toggle the current value
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Update the case data with the new floating status
            setCaseData({
                ...caseData,
                isFloating: !caseData.isFloating
            });

            // Show success message
            alert(`Case is now ${!caseData.isFloating ? 'floating' : 'no longer floating'}.`);

        } catch (err) {
            console.error('Error updating floating status:', err);
            alert(err.response?.data?.message || 'Failed to update case floating status. Please try again.');
        } finally {
            setFloatingUpdating(false);
        }
    };

    // Handle case status update
    const handleStatusUpdate = async (newStatus) => {
        if (!caseData || statusUpdating) return;
        
        try {
            setStatusUpdating(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/sign-in');
                return;
            }

            // Call the API to update the case status
            const response = await axios.patch(
                `http://localhost:3005/api/cases/case/${caseId}/status`,
                { status: newStatus },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // Update the case data with the new status
            setCaseData({
                ...caseData,
                status: newStatus
            });

            // Show success message
            alert(`Case status updated to ${newStatus} successfully.`);

        } catch (err) {
            console.error('Error updating case status:', err);
            alert(err.response?.data?.message || 'Failed to update case status. Please try again.');
        } finally {
            setStatusUpdating(false);
        }
    };

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
                {/* Header */}
                <header className="case-detail-header">
                    <Link to="/">
                        <img src={logo} alt="NyayaSarthi Logo" className="logo" />
                    </Link>
                    <nav className="case-detail-nav">
                        <Link to={localStorage.getItem('userRole') === 'advocate' ? "/advocate-dashboard" : "/dashboard"}>
                            My Cases
                        </Link>
                        <Link to="/nyaya-sanhita">Nyaya Sanhita</Link>
                        <Link to="/qa">Q&A</Link>
                        <Link to="/account">Account</Link>
                    </nav>
                    <button onClick={handleLogout} className="logout-button">
                        <FaSignOutAlt />
                    </button>
                </header>

                {/* Main content */}
                <main className="case-detail-main">
                    {/* Case Title Bar */}
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

                    {/* Tabs Navigation */}
                    <div className="case-tabs">
                        <button
                            className={activeTab === 'details' ? 'active' : ''}
                            onClick={() => handleTabChange('details')}
                        >
                            Details
                        </button>
                        <button
                            className={activeTab === 'notifications' ? 'active' : ''}
                            onClick={() => handleTabChange('notifications')}
                        >
                            Notifications
                        </button>
                        <button
                            className={activeTab === 'messages' ? 'active' : ''}
                            onClick={() => handleTabChange('messages')}
                        >
                            Messages
                        </button>
                        <button
                            className={activeTab === 'documents' ? 'active' : ''}
                            onClick={() => handleTabChange('documents')}
                        >
                            Documents
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {/* Details Tab */}
                        {activeTab === 'details' && (
                            <div className="details-tab">
                                {/* Case Type Section - Horizontal Layout */}
                                <div className="case-type-section">
                                    <div className="case-type-header">
                                        <h3>Case Type:</h3>
                                        <p className="case-type-badge">{caseData?.caseType || 'Not specified'}</p>
                                    </div>
                                </div>

                                <div className="case-description">
                                    <h3>Case Description</h3>
                                    <p>{caseData?.description}</p>
                                </div>

                                {/* Add delete button section */}
                                {caseData?.user?._id === localStorage.getItem('userId') &&
                                    (!caseData?.advocate || caseData?.status === 'pending') && (
                                        <div className="case-actions-section">
                                            <button
                                                onClick={handleDeleteCase}
                                                className="delete-case-button"
                                                disabled={loading}
                                            >
                                                {loading ? "Deleting..." : "Delete Case"}
                                            </button>
                                            <p className="delete-info">
                                                Note: You can only delete a case if it hasn't been assigned to an advocate yet.
                                            </p>
                                        </div>
                                    )}

                                {caseData?.advocate ? (
                                    <div className="lawyer-info">
                                        <h3>Assigned Lawyer</h3>
                                        <div className="lawyer-card">
                                            <div className="lawyer-image">
                                                <img src="/images/444.jpeg" alt="Lawyer" />
                                            </div>
                                            <div className="lawyer-details">
                                                <h4>{caseData.advocate.name}</h4>
                                                <p><strong>Email:</strong> {caseData.advocate.email}</p>
                                                <p><strong>Phone:</strong> {caseData.advocate.phone}</p>
                                                <button className="contact-button">Contact Lawyer</button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="find-lawyer-section">
                                        <h3>No Lawyer Assigned</h3>
                                        <p>You don't have a lawyer assigned to this case yet.</p>
                                        <div className="lawyer-actions">
                                            <Link to={`/find-a-lawyer/${caseId}`} className="find-lawyer-button">Find a Lawyer</Link>
                                            
                                            {/* Only show floating option for plaintiffs */}
                                            {localStorage.getItem('userRole') === 'plaintiff' && (
                                                <button 
                                                    className={`float-case-button ${caseData?.isFloating ? 'floating-active' : ''}`}
                                                    onClick={handleFloatingToggle}
                                                    disabled={floatingUpdating}
                                                >
                                                    {floatingUpdating 
                                                        ? 'Updating...'
                                                        : caseData?.isFloating 
                                                            ? 'Remove from Floating Cases' 
                                                            : 'Float This Case'}
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Display floating status indicator */}
                                        {caseData?.isFloating && (
                                            <div className="floating-status">
                                                <p>
                                                    <span className="floating-badge">Floating</span>
                                                    This case is visible to all advocates who can request to handle it.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="case-status-section">
                                    <h3>Case Status</h3>
                                    <div className="status-timeline">
                                        <div className={`status-step ${caseData?.status === 'pending' || caseData?.status === 'assigned' || caseData?.status === 'in-progress' || caseData?.status === 'closed' ? 'completed' : ''}`}>
                                            <div className="status-indicator"></div>
                                            <p>Created</p>
                                        </div>
                                        <div className={`status-step ${caseData?.status === 'assigned' || caseData?.status === 'in-progress' || caseData?.status === 'closed' ? 'completed' : ''}`}>
                                            <div className="status-indicator"></div>
                                            <p>Lawyer Assigned</p>
                                        </div>
                                        <div className={`status-step ${caseData?.status === 'in-progress' || caseData?.status === 'closed' ? 'completed' : ''}`}>
                                            <div className="status-indicator"></div>
                                            <p>In Progress</p>
                                            {/* Show update button for assigned advocate if case is in 'assigned' state */}
                                            {caseData?.status === 'assigned' && 
                                             localStorage.getItem('userRole') === 'advocate' &&
                                             caseData?.advocate?._id === localStorage.getItem('userId') && (
                                                <button 
                                                    className="status-update-button"
                                                    onClick={() => handleStatusUpdate('in-progress')}
                                                    disabled={statusUpdating}
                                                >
                                                    {statusUpdating ? 'Updating...' : 'Start Progress'}
                                                </button>
                                            )}
                                        </div>
                                        <div className={`status-step ${caseData?.status === 'closed' ? 'completed' : ''}`}>
                                            <div className="status-indicator"></div>
                                            <p>Closed</p>
                                            {/* Show update button for assigned advocate if case is in 'in-progress' state */}
                                            {caseData?.status === 'in-progress' && 
                                             localStorage.getItem('userRole') === 'advocate' &&
                                             caseData?.advocate?._id === localStorage.getItem('userId') && (
                                                <button 
                                                    className="status-update-button"
                                                    onClick={() => handleStatusUpdate('closed')}
                                                    disabled={statusUpdating}
                                                >
                                                    {statusUpdating ? 'Updating...' : 'Close Case'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Current status indicator */}
                                    <div className="current-status-indicator">
                                        <p>Current Status: <span className="current-status">{caseData?.status}</span></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="notifications-tab">
                                <h3>Notifications</h3>
                                {notifications.length > 0 ? (
                                    <div className="notification-list">
                                        {notifications.map(notification => (
                                            <div key={notification.id} className={`notification-item ${!notification.isRead ? 'unread' : ''}`}>
                                                <div className="notification-content">
                                                    <p>{notification.message}</p>
                                                    <span className="notification-date">{notification.date}</span>
                                                </div>
                                                {!notification.isRead && <span className="unread-indicator"></span>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data-message">No notifications yet.</p>
                                )}
                            </div>
                        )}

                        {/* Messages Tab */}
                        {activeTab === 'messages' && (
                            <div className="messages-tab">
                                <h3>Messages</h3>
                                {messages.length > 0 ? (
                                    <div className="message-thread">
                                        {messages.map(message => (
                                            <div key={message.id} className={`message-item ${message.sender === 'You' ? 'sent' : 'received'}`}>
                                                <div className="message-bubble">
                                                    <p className="message-sender">{message.sender}</p>
                                                    <p className="message-content">{message.content}</p>
                                                    <span className="message-time">{message.timestamp}</span>
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

                        {/* Documents Tab - With document upload functionality */}
                        {activeTab === 'documents' && (
                            <div className="documents-tab">
                                <div className="documents-header">
                                    <h3>Documents</h3>
                                    <div className="upload-controls">
                                        <input
                                            type="file"
                                            multiple
                                            ref={fileInputRef}
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
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

                                {/* Selected files section */}
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

                                {/* Upload error message */}
                                {uploadError && <div className="error-message">{uploadError}</div>}

                                {/* Document list */}
                                {caseData?.documents && caseData.documents.length > 0 ? (
                                    <div className="document-list">
                                        {caseData.documents.map((document) => (
                                            <div key={document._id} className="document-item">
                                                <div className="document-icon">📄</div>
                                                <div className="document-info">
                                                    <p className="document-name">{document.fileName}</p>
                                                    <span className="document-meta">
                                                        {Math.round(document.fileSize / 1024)} KB • Uploaded on {formatDate(document.uploadDate)}
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
                                                        onClick={() => handleDownloadDocument(document._id, document.fileName)}
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

                {/* Footer */}
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

                {/* Hidden download link for document downloads */}
                <a ref={downloadLinkRef} style={{ display: 'none' }}></a>
            </div>
        </div>
    );
}

export default CaseDetail;