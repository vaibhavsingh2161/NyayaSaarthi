import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import axios from 'axios'; // Import axios
// import { Link } from 'react-router-dom';
import '../styles/FindALawyer.css';
import fallbackProfileImage from '../assets/444.jpeg'; // Import fallback image
import logo from '../assets/golden nyayasarthi logo.png';
import footerLogo from '../assets/Component 1.png';

function FindALawyer() {
  const { caseId } = useParams(); // Get caseId from URL params
  const navigate = useNavigate(); // Hook for navigation
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [requestStatus, setRequestStatus] = useState({}); // Track request status for each lawyer { lawyerId: 'pending' | 'sent' | 'error' | null }
  const [requestError, setRequestError] = useState(''); // Error message for the request
  
  // Filter states
  const [practiceAreaFilter, setPracticeAreaFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [practiceAreas, setPracticeAreas] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch data from API endpoint
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:3005/api/advocate/list'); // Fetch from backend API with full URL
        setLawyers(response.data);
        setFilteredLawyers(response.data);
        
        // Extract unique practice areas and cities from lawyer data
        const uniquePracticeAreas = new Set();
        const uniqueCities = new Set();
        
        response.data.forEach(lawyer => {
          // Add specializations to practice areas
          if (lawyer.specialisation && Array.isArray(lawyer.specialisation)) {
            lawyer.specialisation.forEach(area => {
              if (area && area.trim()) uniquePracticeAreas.add(area.trim());
            });
          }
          
          // Add location to cities
          if (lawyer.location && lawyer.location.trim()) {
            uniqueCities.add(lawyer.location.trim());
          }
        });
        
        setPracticeAreas(Array.from(uniquePracticeAreas).sort());
        setCities(Array.from(uniqueCities).sort());
      } catch (err) {
        console.error("Error fetching lawyer data:", err);
        setError(err.message || 'Failed to fetch lawyers.');
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);
  
  // Apply filters when filter values change
  useEffect(() => {
    if (!lawyers.length) return;
    
    const applyFilters = () => {
      let result = [...lawyers];
      
      // Filter by practice area
      if (practiceAreaFilter) {
        result = result.filter(lawyer => 
          lawyer.specialisation && 
          Array.isArray(lawyer.specialisation) && 
          lawyer.specialisation.some(area => 
            area.toLowerCase().includes(practiceAreaFilter.toLowerCase())
          )
        );
      }
      
      // Filter by city
      if (cityFilter) {
        result = result.filter(lawyer => 
          lawyer.location && 
          lawyer.location.toLowerCase().includes(cityFilter.toLowerCase())
        );
      }
      
      setFilteredLawyers(result);
    };
    
    applyFilters();
  }, [lawyers, practiceAreaFilter, cityFilter]);
  
  // Handle filter changes
  const handlePracticeAreaChange = (e) => {
    setPracticeAreaFilter(e.target.value);
  };
  
  const handleCityChange = (e) => {
    setCityFilter(e.target.value);
  };
  
  // Handle search button click
  const handleSearch = () => {
    // The filters are already applied through the useEffect, but we could add additional logic here
    console.log(`Searching for lawyers with practice area: ${practiceAreaFilter || 'Any'} and city: ${cityFilter || 'Any'}`);
  };

  // Function to get profile image URL
  const getProfileImageUrl = (profilePicturePath) => {
    if (!profilePicturePath) {
      return fallbackProfileImage;
    }
    // Remove 'uploads/' or 'uploads\' prefix if present, then prepend '/uploads/'
    return `/uploads/${profilePicturePath.replace(/^uploads[\\\/]?/, '')}`;
  };

  // Handle sending request to advocate
  const handleContactNow = async (advocateId) => {
    if (!caseId) {
      setRequestError('Cannot send request: Case ID is missing.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/sign-in'); // Redirect to sign-in if not logged in
      return;
    }

    setRequestStatus(prev => ({ ...prev, [advocateId]: 'pending' })); // Set status to pending
    setRequestError('');

    try {
      await axios.post(
        `http://localhost:3005/api/cases/${caseId}/request-advocate`,
        { advocateId }, // Send advocateId in the request body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequestStatus(prev => ({ ...prev, [advocateId]: 'sent' })); // Set status to sent
      alert('Request sent successfully!');

      // Optionally, redirect back to the case detail page or dashboard
      // navigate(`/case/${caseId}`);

    } catch (err) {
      console.error("Error sending request:", err);
      setRequestStatus(prev => ({ ...prev, [advocateId]: 'error' }));
      setRequestError(err.response?.data?.message || 'Failed to send request. Please try again.');
      // Reset status after a delay so the user can try again
      setTimeout(() => setRequestStatus(prev => ({ ...prev, [advocateId]: null })), 3000);
    }
  };

  return (
    <div className="find-a-lawyer-container">
      <header className="header">
        <img
          src={logo}
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
          <select 
            className="filter-select" 
            value={practiceAreaFilter}
            onChange={handlePracticeAreaChange}
          >
            <option value="">Select Practice Area</option>
            {practiceAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          
          <select 
            className="filter-select"
            value={cityFilter}
            onChange={handleCityChange}
          >
            <option value="">Select City</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          
          <button 
            className="search-button"
            onClick={handleSearch}
          >
            🔍 Search
          </button>
          
          {(practiceAreaFilter || cityFilter) && (
            <button 
              className="clear-filter-button"
              onClick={() => {
                setPracticeAreaFilter('');
                setCityFilter('');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
        
        {/* Filter indicator */}
        {(practiceAreaFilter || cityFilter) && (
          <div className="filter-indicator">
            <p>
              Showing results for: 
              {practiceAreaFilter ? <span className="filter-tag">Practice Area: {practiceAreaFilter}</span> : null}
              {cityFilter ? <span className="filter-tag">City: {cityFilter}</span> : null}
            </p>
          </div>
        )}

        {loading && <p>Loading lawyers...</p>} {/* Loading indicator */}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>} {/* Error message */}
        {!loading && !error && (
          <div className="lawyer-list">
            {filteredLawyers.length === 0 ? (
              <p>No lawyers found matching your criteria.</p>
            ) : (
              filteredLawyers.map((lawyer) => (
                <div key={lawyer._id} className="lawyer-profile"> {/* Use lawyer._id as key */}
                  <div className="profile-image">
                    <img
                      src={getProfileImageUrl(lawyer.profilePicture)} // Use API data and helper function
                      alt={`${lawyer.userId?.name || 'Lawyer'}'s profile`}
                      className="profile-pic"
                      onError={(e) => { // Add onError fallback
                        e.target.src = fallbackProfileImage;
                        e.target.onerror = null; 
                      }}
                    />
                  </div>
                  <div className="profile-details">
                    <h3 className="lawyer-name">{lawyer.userId?.name || 'Advocate Name'}</h3> {/* Use userId.name */}
                    <p className="area-of-practice">
                      {/* Join specialisation array, handle empty case */}
                      <strong>Area of Practice:</strong> {lawyer.specialisation?.length > 0 ? lawyer.specialisation.join(', ') : 'N/A'}
                    </p>
                    <div className="profile-info">
                      <div className="rating">
                        {/* Static rating for now */}
                        <span>⭐⭐⭐⭐⭐</span> 
                        {/* <span className="rating-score">{lawyer.rating}</span> 
                        <span className="rating-count">| {lawyer.ratingsCount}</span> */}
                      </div>
                      <p className="location">📍 {lawyer.location || 'N/A'}</p> {/* Use location */}
                      <p className="experience">💼 {lawyer.yearsOfExperience !== undefined ? `${lawyer.yearsOfExperience} years` : 'N/A'} experience</p> {/* Use yearsOfExperience */}
                      <p className="languages">📄 Languages: {lawyer.languages?.length > 0 ? lawyer.languages.join(', ') : 'N/A'}</p> {/* Display languages */}
                    </div>
                  </div>
                  <button
                    className={`contact-button ${requestStatus[lawyer.userId?._id] ? 'disabled' : ''}`}
                    onClick={() => handleContactNow(lawyer.userId?._id)}
                    disabled={!caseId || loading || requestStatus[lawyer.userId?._id] === 'pending' || requestStatus[lawyer.userId?._id] === 'sent'}
                  >
                    {requestStatus[lawyer.userId?._id] === 'pending' ? 'Sending...'
                      : requestStatus[lawyer.userId?._id] === 'sent' ? 'Request Sent'
                      : requestStatus[lawyer.userId?._id] === 'error' ? 'Error'
                      : 'Contact Now'}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        {requestError && <p style={{ color: 'red' }}>Error: {requestError}</p>} {/* Display request error */}
      </main>

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