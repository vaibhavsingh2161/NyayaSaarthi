import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CreateProfile.css";
import logo from "../assets/golden nyayasarthi logo.png";
import footerLogo from "../assets/Component 1.png";

const CreateProfile = () => {
  const [step, setStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState(["English"]);
  const [languageInput, setLanguageInput] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [enrolmentNo, setEnrolmentNo] = useState("");
  const [barCouncilRegNo, setBarCouncilRegNo] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [specialisation, setSpecialisation] = useState([]);
  const [casesHandled, setCasesHandled] = useState([]);
  const [description, setDescription] = useState("");
  const [clientele, setClientele] = useState([]);
  const [courts, setCourts] = useState([]);
  const navigate = useNavigate();

  const handleAddLanguage = (e) => {
    e.preventDefault();
    if (languageInput && !selectedLanguages.includes(languageInput)) {
      setSelectedLanguages([...selectedLanguages, languageInput]);
    }
    setLanguageInput("");
  };

  const handleRemoveLanguage = (language) => {
    setSelectedLanguages(selectedLanguages.filter((lang) => lang !== language));
  };

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

  const nextStep = () => {
    setStep(step + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("languages", JSON.stringify(selectedLanguages));
    formData.append("dob", dob);
    formData.append("location", location);
    formData.append("profilePicture", profilePicture);
    formData.append("enrolmentNo", enrolmentNo);
    formData.append("barCouncilRegNo", barCouncilRegNo);
    formData.append("yearsOfExperience", yearsOfExperience);
    formData.append("education", JSON.stringify(education));
    formData.append("workExperience", JSON.stringify(workExperience));
    formData.append("specialisation", JSON.stringify(specialisation));
    formData.append("casesHandled", JSON.stringify(casesHandled));
    formData.append("description", description);
    formData.append("clientele", JSON.stringify(clientele));
    formData.append("courts", JSON.stringify(courts));

    try {
      const response = await axios.post(
        "http://localhost:3005/api/advocate/createProfile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        // Store the profile picture URL if it was returned
        if (response.data.profilePictureUrl) {
          localStorage.setItem('advocateProfilePictureUrl', response.data.profilePictureUrl);
        }
        
        alert(
          "Profile submitted successfully! Please wait for admin approval to sign in."
        );
        navigate("/sign-in");
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      alert(
        `Error submitting profile: ${
          error.response?.data?.message || error.message
        }`
      );
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
          <span className={`step ${step === 1 ? "active" : ""}`}>1</span>
          <span className={`step ${step === 2 ? "active" : ""}`}>2</span>
          <span className={`step ${step === 3 ? "active" : ""}`}>3</span>
          <span className="step-label">
            {step === 1
              ? "Basic Details"
              : step === 2
              ? "Professional Details"
              : "Specialisation & Court"}
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
      <button onClick={handleAddLanguage} className="add-language-button">
        Add
      </button>
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
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        required
      />
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
      <input
        type="file"
        onChange={(e) => setProfilePicture(e.target.files[0])}
      />
      <p className="file-info">10 MB Max</p>
    </div>

    <button type="button" onClick={nextStep} className="next-button">
      Next
    </button>
  </form>
);

const ProfessionalDetails = ({
  enrolmentNo,
  setEnrolmentNo,
  yearsOfExperience,
  setYearsOfExperience,
  education,
  setEducation,
  workExperience,
  setWorkExperience,
  nextStep,
}) => {
  const [educationForm, setEducationForm] = useState({
    degree: "",
    university: "",
    yearOfPassing: "",
    extraCourses: ""
  });

  const [workExperienceForm, setWorkExperienceForm] = useState({
    firm: "",
    startDate: "",
    endDate: "",
    briefExperience: ""
  });

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setEducationForm({
      ...educationForm,
      [name]: value
    });
  };

  const handleWorkExperienceChange = (e) => {
    const { name, value } = e.target;
    setWorkExperienceForm({
      ...workExperienceForm,
      [name]: value
    });
  };

  const addEducation = (e) => {
    e.preventDefault();
    if (educationForm.degree && educationForm.university && educationForm.yearOfPassing) {
      setEducation([...education, educationForm]);
      setEducationForm({
        degree: "",
        university: "",
        yearOfPassing: "",
        extraCourses: ""
      });
    }
  };

  const removeEducation = (index) => {
    const updatedEducation = [...education];
    updatedEducation.splice(index, 1);
    setEducation(updatedEducation);
  };

  const addWorkExperience = (e) => {
    e.preventDefault();
    if (workExperienceForm.firm && workExperienceForm.startDate) {
      setWorkExperience([...workExperience, workExperienceForm]);
      setWorkExperienceForm({
        firm: "",
        startDate: "",
        endDate: "",
        briefExperience: ""
      });
    }
  };

  const removeWorkExperience = (index) => {
    const updatedWorkExperience = [...workExperience];
    updatedWorkExperience.splice(index, 1);
    setWorkExperience(updatedWorkExperience);
  };

  return (
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
          <input 
            type="text" 
            name="degree"
            value={educationForm.degree}
            onChange={handleEducationChange}
            placeholder="Law Degree" 
            required 
          />
          <select 
            name="degree" 
            value={educationForm.degree}
            onChange={handleEducationChange}
          >
            <option value="">Select Degree</option>
            <option value="L.L.B.">L.L.B.</option>
            <option value="L.L.M.">L.L.M.</option>
            <option value="Ph.D. in Law">Ph.D. in Law</option>
          </select>
          <input 
            type="text" 
            name="university"
            value={educationForm.university}
            onChange={handleEducationChange}
            placeholder="University/Institution" 
            required 
          />
          <input 
            type="number" 
            name="yearOfPassing"
            value={educationForm.yearOfPassing}
            onChange={handleEducationChange}
            placeholder="Year of passing" 
            required 
          />
          <input 
            type="text" 
            name="extraCourses"
            value={educationForm.extraCourses}
            onChange={handleEducationChange}
            placeholder="Extra Courses" 
          />
          <button 
            type="button" 
            className="add-button" 
            onClick={addEducation}
          >
            Add Education
          </button>
        </div>
        
        {education.length > 0 && (
          <div className="added-items">
            <h4>Added Education:</h4>
            <ul>
              {education.map((edu, index) => (
                <li key={index}>
                  {edu.degree} from {edu.university} ({edu.yearOfPassing})
                  <button 
                    type="button" 
                    onClick={() => removeEducation(index)}
                    className="remove-button"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="form-group work-experience-section">
        <label>Work Experience</label>
        <div className="work-experience-box">
          <input 
            type="text"
            name="firm"
            value={workExperienceForm.firm}
            onChange={handleWorkExperienceChange}
            placeholder="Firm / Organisation" 
            required 
          />
          <div className="date-group">
            <input 
              type="date"
              name="startDate"
              value={workExperienceForm.startDate}
              onChange={handleWorkExperienceChange}
              placeholder="Start date" 
              required 
            />
            <input 
              type="date"
              name="endDate"
              value={workExperienceForm.endDate}
              onChange={handleWorkExperienceChange}
              placeholder="End date" 
            />
          </div>
          <input 
            type="text"
            name="briefExperience"
            value={workExperienceForm.briefExperience}
            onChange={handleWorkExperienceChange}
            placeholder="Brief of experience" 
          />
          <button 
            type="button" 
            className="add-button" 
            onClick={addWorkExperience}
          >
            Add Work Experience
          </button>
        </div>
        
        {workExperience.length > 0 && (
          <div className="added-items">
            <h4>Added Work Experience:</h4>
            <ul>
              {workExperience.map((exp, index) => (
                <li key={index}>
                  {exp.firm} ({exp.startDate} - {exp.endDate || 'Present'})
                  <button 
                    type="button" 
                    onClick={() => removeWorkExperience(index)}
                    className="remove-button"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <button type="button" onClick={nextStep} className="next-button">
        Next
      </button>
    </form>
  );
};

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
  handleSubmit,
}) => {
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

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Area of Specialisation</label>
        <div className="tag-input">
          <input
            type="text"
            placeholder="Add specialisation"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag(setSpecialisation, e.target.value);
                e.target.value = "";
              }
            }}
          />
          <div className="tag-container">
            {specialisation.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(setSpecialisation, tag)}
                >
                  ×
                </button>
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
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag(setCasesHandled, e.target.value);
                e.target.value = "";
              }
            }}
          />
          <div className="tag-container">
            {casesHandled.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(setCasesHandled, tag)}
                >
                  ×
                </button>
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
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag(setClientele, e.target.value);
                e.target.value = "";
              }
            }}
          />
          <div className="tag-container">
            {clientele.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(setClientele, tag)}
                >
                  ×
                </button>
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
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag(setCourts, e.target.value);
                e.target.value = "";
              }
            }}
          />
          <div className="tag-container">
            {courts.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(setCourts, tag)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <button type="submit" className="submit-button">
        Submit
      </button>
    </form>
  );
};

export default CreateProfile;
