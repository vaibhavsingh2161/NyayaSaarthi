// CreateProfile.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateProfile.css';

const CreateProfile = () => {
  const [step, setStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState(['English', 'Hindi']);
  const [languageInput, setLanguageInput] = useState('');
  const navigate = useNavigate();

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

  const nextStep = () => {
    setStep(step + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="create-profile-container">
      <div className="profile-left">
        <img src="/images/Component 1.png" alt="Logo" className="logo" />
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
            nextStep={nextStep}
          />
        )}
        {step === 2 && <ProfessionalDetails nextStep={nextStep} />}
        {step === 3 && <SpecialisationCourt handleSubmit={handleSubmit} />}
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
  nextStep
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
      <input type="date" required />
    </div>

    <div className="form-group">
      <label>Location</label>
      <input type="text" placeholder="Bangalore" required />
    </div>

    <div className="form-group">
      <label>Profile Picture</label>
      <input type="file" />
      <p className="file-info">10 MB Max</p>
    </div>

    <button type="button" onClick={nextStep} className="next-button">Next</button>
  </form>
);

const ProfessionalDetails = ({ nextStep }) => (
  <form className="profile-form">
    <div className="form-group">
      <label>Enrolment No.</label>
      <input type="text" placeholder="Enrolment Number" required />
    </div>
    <div className="form-group">
      <label>Bar Council Reg. No.</label>
      <input type="text" placeholder="Bar Council Registration Number" required />
    </div>
    <div className="form-group">
      <label>Years of Experience</label>
      <input type="number" placeholder="Years of Experience" required />
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

const SpecialisationCourt = ({ handleSubmit }) => {
  const [specialisations, setSpecialisations] = useState([]);
  const [casesHandled, setCasesHandled] = useState([]);
  const [clientele, setClientele] = useState([]);
  const [courts, setCourts] = useState([]);
  const [description, setDescription] = useState('');

  const handleAddTag = (setter, value) => {
    if (value && !setter.includes(value)) {
      setter((prev) => [...prev, value]);
    }
  };

  const handleRemoveTag = (setter, value) => {
    setter((prev) => prev.filter((item) => item !== value));
  };

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Area of Specialisation</label>
        <div className="tag-input">
          <input
            type="text"
            placeholder="Add specialisation"
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag(setSpecialisations, e.target.value)}
          />
          <div className="tag-container">
            {specialisations.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(setSpecialisations, tag)}>×</button>
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
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag(setCasesHandled, e.target.value)}
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
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag(setClientele, e.target.value)}
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
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag(setCourts, e.target.value)}
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