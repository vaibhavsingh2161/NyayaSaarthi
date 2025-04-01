// AdvocateProfile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios'; // Import axios for API calls
import '../styles/AdvocateProfile.css';
// Import the images directly
import fallbackProfileImage from '../assets/444.jpeg';
import footerLogo from '../assets/Component 1.png'; // Import the footer logo

const AdvocateProfile = () => {
  const [profile, setProfile] = useState(null); // State to hold profile data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        // Retrieve token from local storage (adjust key if different)
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found, please log in.');
        }

        // Fetch profile data from the backend
        const response = await axios.get('/api/advocate/profile', {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
        });

        setProfile(response.data); // Store fetched data in state
        console.log('Profile data:', response.data); // Log the received data
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message || 'Failed to fetch profile data.');
        // Optional: Redirect to login if token is invalid or expired
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
             localStorage.removeItem('token'); // Clear invalid token
             navigate('/login'); // Redirect to login
        }
      } finally {
        setLoading(false); // Set loading to false
      }
    };

    fetchProfile();
  }, [navigate]); // Add navigate to dependency array

  // Logout handler
  const handleLogout = async () => {
    try {
      // Get the token (might be needed for authorization)
      const token = localStorage.getItem('token');
      
      // Call the backend logout API (optional)
      if (token) {
        await axios.post('/api/users/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always remove the token and redirect regardless of API success/failure
      localStorage.removeItem('token');
      navigate('/sign-in');
    }
  };

  if (loading) {
    return <div className="profile-container"><p>Loading profile...</p></div>;
  }

  if (error) {
    return <div className="profile-container"><p>Error: {error}</p></div>;
  }

  if (!profile) {
    return <div className="profile-container"><p>No profile data found.</p></div>;
  }

  // Assuming the API returns data matching the structure previously hardcoded
  // Adjust field names if your API response is different (e.g., profile.user.name, profile.details.experience)
  const {
    userId = {},
    languages = [],
    dob = "N/A",
    location = "N/A",
    profilePicture = null,
    enrolmentNo = "N/A",
    barCouncilRegNo = "N/A",
    yearsOfExperience = 0,
    education = [],
    workExperience = [],
    specialisation = [],
    casesHandled = [],
    description = "No information provided.",
    clientele = [],
    courts = []
  } = profile;

  // Use the imported image as fallback
  const fallbackImage = fallbackProfileImage;
  // Construct proper path for profile picture if it exists
  const profileImageUrl = profilePicture ?
    // Remove 'uploads/' or 'uploads\' prefix if present, then prepend '/uploads/'
    `/uploads/${profilePicture.replace(/^uploads[\\\/]?/, '')}`
    : fallbackImage;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h2>My Profile</h2>
        <div> {/* Container for buttons */}
          <a href="/edit-profile" className="edit-link" style={{ marginRight: '1rem' }}>edit</a> {/* Added margin */}
          <button onClick={handleLogout} className="logout-button">Logout</button> {/* Logout Button */}
        </div>
      </header>
      <section className="profile-details">
        <div className="profile-card">
          {/* Use profilePicture with proper error handling */}
          <img 
            src={profileImageUrl} 
            alt="Profile" 
            className="profile-picture" 
            onError={(e) => {
              console.log("Image failed to load, using fallback");
              // Don't need to check source when using imported image
              e.target.src = fallbackImage;
              // Prevent further error events
              e.target.onerror = null;
            }} 
          />
          <div className="profile-info">
            <h3>{userId?.name || "Advocate"}</h3> {/* Try to get name from userId if populated */}
            <p className="profile-rating">
              {/* For now, use static rating data until you implement ratings */}
              <span className="stars">⭐⭐⭐⭐</span> 4.0 | 250+ user ratings
            </p>
            <div className="profile-meta">
              <p><span>📍</span> {location}</p>
              <p><span>💼</span> {yearsOfExperience} years experience</p>
              <p><span>📄</span> {languages.join(', ')}</p> {/* Join languages array */}
            </div>
            <p><strong>Enrolment No.:</strong> {enrolmentNo}</p>
            <p><strong>Registration No.:</strong> {barCouncilRegNo}</p>
          </div>
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h4>Basic Information:</h4>
            <p><strong>Date of Birth:</strong> {dob ? new Date(dob).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Location:</strong> {location}</p>
          </div>
          
          <div className="profile-section">
            <h4>Practice License:</h4>
            <p>{courts.length > 0 ? courts.join(', ') : 'Not specified'}</p>
          </div>

          <div className="profile-section">
            <h4>Practice Area:</h4>
            <p>{specialisation.length > 0 ? specialisation.join(', ') : 'Not specified'}</p>
          </div>

          <div className="profile-section">
            <h4>About Lawyer:</h4>
            <p>{description}</p>
          </div>

          <div className="profile-section">
            <h4>Education:</h4>
            {education.length > 0 ? (
              <ul>
                {education.map((edu, index) => (
                  <li key={index}>
                    <strong>{edu.degree}</strong> - {edu.university} ({edu.yearOfPassing})
                    {edu.extraCourses && <span> ({edu.extraCourses})</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Not specified</p>
            )}
          </div>
          
          <div className="profile-section">
            <h4>Work Experience:</h4>
            {workExperience.length > 0 ? (
               <ul>
                {workExperience.map((exp, index) => (
                  <li key={index}>
                    <strong>{exp.firm}</strong> 
                    ({exp.startDate ? new Date(exp.startDate).toLocaleDateString() : 'N/A'} 
                    {exp.endDate ? ` - ${new Date(exp.endDate).toLocaleDateString()}` : ' - Present'})
                    {exp.briefExperience && <p style={{margin:'0.2em 0 0 1em', fontSize: '0.9em'}}>{exp.briefExperience}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Not specified</p>
            )}
          </div>
          
          <div className="profile-section">
            <h4>Cases Handled:</h4>
            <p>{casesHandled.length > 0 ? casesHandled.join(', ') : 'Not specified'}</p>
          </div>

          <div className="profile-section">
            <h4>Clientele:</h4>
            <p>{clientele.length > 0 ? clientele.join(', ') : 'Not specified'}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-logo">
          <img src={footerLogo} alt="Nyayasarthi Logo" /> {/* Use imported logo */}
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