import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CreateProfile.css';
import logo from '../assets/golden nyayasarthi logo.png';
import footerLogo from '../assets/Component 1.png';

const CreateProfile = () => {
  const [step, setStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState(['English']);
  const [languageInput, setLanguageInput] = useState('');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [enrolmentNo, setEnrolmentNo] = useState('');
  const [barCouncilRegNo, setBarCouncilRegNo] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [specialisation, setSpecialisation] = useState([]);
  const [casesHandled, setCasesHandled] = useState([]);
  const [description, setDescription] = useState('');
  const [clientele, setClientele] = useState([]);
  const [courts, setCourts] = useState([]);
  const navigate = useNavigate();

  // Language handling
  const handleAddLanguage = (e) => {
    e.preventDefault();
    if (languageInput && !selectedLanguages.includes(languageInput)) {
      setSelectedLanguages([...selectedLanguages, languageInput]);
    }
    setLanguageInput('');
  };

  const handleRemoveLanguage = (language) => {
    setSelectedLanguages(selectedLanguages.filter((lang) => lang !== language));
  };

  // Tag handling (for specialization, cases handled, etc.)
  const handleAddTag = (setter, value) => {
    setter((prevTags) => {
      if (value && !prevTags.includes(value)) {
        return [...prevTags, value];
      }
      return prevTags;
    });
  };

  const handleRemoveTag = (setter, value) => {
    setter((prevTags) => prevTags.filter((item) => item !== value));
  };

  // Move to next step in the form
  const nextStep = () => {
    setStep(step + 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare FormData for file upload and other data
    const formData = new FormData();
    formData.append('languages', JSON.stringify(selectedLanguages));
    formData.append('dob', dob);
    formData.append('location', location);
    formData.append('profilePicture', profilePicture);
    formData.append('enrolmentNo', enrolmentNo);
    formData.append('barCouncilRegNo', barCouncilRegNo);
    formData.append('yearsOfExperience', yearsOfExperience);
    formData.append('education', JSON.stringify(education));
    formData.append('workExperience', JSON.stringify(workExperience));
    formData.append('specialisation', JSON.stringify(specialisation));
    formData.append('casesHandled', JSON.stringify(casesHandled));
    formData.append('description', description);
    formData.append('clientele', JSON.stringify(clientele));
    formData.append('courts', JSON.stringify(courts));

    try {
      const response = await axios.post('http://localhost:3005/api/advocate/createProfile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Use token for authentication
        },
      });

      if (response.status === 201) {
        // Inform the user and redirect to sign-in for approval check
        alert('Profile submitted successfully! Please wait for admin approval to sign in.');
        navigate('/sign-in'); // Redirect to sign-in page
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Provide more specific error feedback if possible
      alert(`Error submitting profile: ${error.response?.data?.message || error.message}`);
    }
  };


  return (
    <div className="create-profile-container">
      <div className="profile-left">
        <img src={footerLogo} alt="Logo" className="logo" />
        <div className="divider"></div>
        <p className="quote">Law without justice is a wound without a cure.</p>
      </div>

      <div className="profile-right">
        <h2>Create Profile</h2>
        <div className="progress">
          <span className={`step ${step === 1 ? 'active' : ''}`}>1</span>
          <span className={`step ${step === 2 ? 'active' : ''}`}>2</span>
          <span className={`step ${step === 3 ? 'active' : ''}`}>3</span>
          <span className="step-label">
            {step === 1 ? 'Basic Details' : step === 2 ? 'Professional Details' : 'Specialisation & Court'}
          </span>
        </div>

        {step === 1 && (
          <BasicDetails
            selectedLanguages={selectedLanguages}
            languageInput={languageInput}
            handleAddLanguage={handleAddLanguage}
            handleRemoveLanguage={handleRemoveLanguage}
            setLanguageInput={setLanguageInput}
            dob={dob}
            setDob={setDob}
            location={location}
            setLocation={setLocation}
            profilePicture={profilePicture}
            setProfilePicture={setProfilePicture}
            nextStep={nextStep}
          />
        )}
        {step === 2 && (
          <ProfessionalDetails
            enrolmentNo={enrolmentNo}
            setEnrolmentNo={setEnrolmentNo}
            barCouncilRegNo={barCouncilRegNo}
            setBarCouncilRegNo={setBarCouncilRegNo}
            yearsOfExperience={yearsOfExperience}
            setYearsOfExperience={setYearsOfExperience}
            education={education}
            setEducation={setEducation}
            workExperience={workExperience}
            setWorkExperience={setWorkExperience}
            nextStep={nextStep}
          />
        )}
        {step === 3 && (
          <SpecialisationCourt
            specialisation={specialisation}
            setSpecialisation={setSpecialisation}
            casesHandled={casesHandled}
            setCasesHandled={setCasesHandled}
            description={description}
            setDescription={setDescription}
            clientele={clientele}
            setClientele={setClientele}
            courts={courts}
            setCourts={setCourts}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};

const BasicDetails = ({
  selectedLanguages,
  languageInput,
  handleAddLanguage,
  handleRemoveLanguage,
  setLanguageInput,
  dob,
  setDob,
  location,
  setLocation,
  profilePicture,
  setProfilePicture,
  nextStep,
}) => (
  <form className="profile-form">
    <div className="form-group">
      <label>Languages</label>
      <input
        type="text"
        value={languageInput}
        onChange={(e) => setLanguageInput(e.target.value)}
        placeholder="Add a language"
      />
      <button onClick={handleAddLanguage} className="add-language-button">Add</button>
      <div className="language-tags">
        {selectedLanguages.map((language) => (
          <span className="language-tag" key={language}>
            {language}
            <button onClick={() => handleRemoveLanguage(language)}>×</button>
          </span>
        ))}
      </div>
    </div>

    <div className="form-group">
      <label>Date of Birth</label>
      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
    </div>

    <div className="form-group">
      <label>Location</label>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Bangalore"
        required
      />
    </div>

    <div className="form-group">
      <label>Profile Picture</label>
      <input type="file" onChange={(e) => setProfilePicture(e.target.files[0])} />
      <p className="file-info">10 MB Max</p>
    </div>

    <button type="button" onClick={nextStep} className="next-button">Next</button>
  </form>
);

const ProfessionalDetails = ({
  enrolmentNo,
  setEnrolmentNo,
  barCouncilRegNo,
  setBarCouncilRegNo,
  yearsOfExperience,
  setYearsOfExperience,
  education,
  setEducation,
  workExperience,
  setWorkExperience,
  nextStep
}) => (
  <form className="profile-form">
    <div className="form-group">
      <label>Enrolment No.</label>
      <input
        type="text"
        value={enrolmentNo}
        onChange={(e) => setEnrolmentNo(e.target.value)}
        placeholder="Enrolment Number"
        required
      />
    </div>
    <div className="form-group">
      <label>Bar Council Reg. No.</label>
      <input
        type="text"
        value={barCouncilRegNo}
        onChange={(e) => setBarCouncilRegNo(e.target.value)}
        placeholder="Bar Council Registration Number"
        required
      />
    </div>
    <div className="form-group">
      <label>Years of Experience</label>
      <input
        type="number"
        value={yearsOfExperience}
        onChange={(e) => setYearsOfExperience(e.target.value)}
        placeholder="Years of Experience"
        required
      />
    </div>
    <div className="form-group education-section">
      <label>Education</label>
      <div className="education-box">
        <input type="text" placeholder="Law Degree" required />
        <select>
          <option>L.L.B.</option>
          <option>L.L.M.</option>
          <option>Ph.D. in Law</option>
        </select>
        <input type="text" placeholder="University/Institution" required />
        <input type="number" placeholder="Year of passing" required />
        <input type="text" placeholder="Extra Courses" />
      </div>
    </div>
    <div className="form-group work-experience-section">
      <label>Work Experience</label>
      <div className="work-experience-box">
      <input type="text" placeholder="Firm / Organisation" required />
        <div className="date-group">
          <input type="date" placeholder="Start date" required />
          <input type="date" placeholder="End date" required />
        </div>
        <input type="text" placeholder="Brief of experience" />
      </div>
    </div>
    <button type="button" onClick={nextStep} className="next-button">Next</button>
  </form>
);

const SpecialisationCourt = ({
  specialisation,
  setSpecialisation,
  casesHandled,
  setCasesHandled,
  description,
  setDescription,
  clientele,
  setClientele,
  courts,
  setCourts,
  handleSubmit
}) => {
  // Define the handleAddTag and handleRemoveTag functions inside the component
  const handleAddTag = (setter, value) => {
    setter((prevTags) => {
      // Check if the tag already exists before adding
      if (value && !prevTags.includes(value)) {
        return [...prevTags, value];
      }
      return prevTags;
    });
  };

  const handleRemoveTag = (setter, value) => {
    setter((prevTags) => prevTags.filter((item) => item !== value));
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Area of Specialisation</label>
        <div className="tag-input">
          <input
            type="text"
            placeholder="Add specialisation"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission on Enter
                handleAddTag(setSpecialisation, e.target.value);
                e.target.value = ''; // Clear input after adding
              }
            }}
          />
          <div className="tag-container">
            {specialisation.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(setSpecialisation, tag)}>×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Types of Cases Handled</label>
        <div className="tag-input">
          <input
            type="text"
            placeholder="Add case type"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission on Enter
                handleAddTag(setCasesHandled, e.target.value);
                e.target.value = ''; // Clear input after adding
              }
            }}
          />
          <div className="tag-container">
            {casesHandled.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(setCasesHandled, tag)}>×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Your Description as a Lawyer</label>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>Preferred Clientele</label>
        <div className="tag-input">
          <input
            type="text"
            placeholder="Add clientele"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission on Enter
                handleAddTag(setClientele, e.target.value);
                e.target.value = ''; // Clear input after adding
              }
            }}
          />
          <div className="tag-container">
            {clientele.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(setClientele, tag)}>×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Courts</label>
        <div className="tag-input">
          <input
            type="text"
            placeholder="Add court"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission on Enter
                handleAddTag(setCourts, e.target.value);
                e.target.value = ''; // Clear input after adding
              }
            }}
          />
          <div className="tag-container">
            {courts.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(setCourts, tag)}>×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" className="submit-button">Submit</button>
    </form>
  );
};


export default CreateProfile;

