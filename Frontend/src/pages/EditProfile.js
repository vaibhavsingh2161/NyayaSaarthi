import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/EditProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    languages: [],
    dob: "",
    location: "",
    enrolmentNo: "",
    barCouncilRegNo: "",
    yearsOfExperience: "",
    description: "",
    courts: [],
    specialisation: [],
    education: [],
    workExperience: [],
    casesHandled: [],
    clientele: [],
  });

  const [newLanguage, setNewLanguage] = useState("");
  const [newCourt, setNewCourt] = useState("");
  const [newSpecialisation, setNewSpecialisation] = useState("");
  const [newCaseHandled, setNewCaseHandled] = useState("");
  const [newClientele, setNewClientele] = useState("");

  const [newEducation, setNewEducation] = useState({
    degree: "",
    university: "",
    yearOfPassing: "",
    extraCourses: "",
  });

  const [newWorkExperience, setNewWorkExperience] = useState({
    firm: "",
    startDate: "",
    endDate: "",
    briefExperience: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found, please log in.");
        }

        const response = await axios.get("/api/advocate/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let profileData = response.data;
        if (profileData.dob) {
          profileData.dob = new Date(profileData.dob)
            .toISOString()
            .split("T")[0];
        }

        if (profileData.workExperience) {
          profileData.workExperience = profileData.workExperience.map(
            (exp) => ({
              ...exp,
              startDate: exp.startDate
                ? new Date(exp.startDate).toISOString().split("T")[0]
                : "",
              endDate: exp.endDate
                ? new Date(exp.endDate).toISOString().split("T")[0]
                : "",
            })
          );
        }

        setFormData(profileData);
        console.log("Fetched profile data:", profileData);
      } catch (err) {
        console.error("Error fetching profile for editing:", err);
        setError(err.message || "Failed to fetch profile data.");

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          localStorage.removeItem("token");
          navigate("/sign-in");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTag = (tagType, value) => {
    if (!value.trim()) return;

    setFormData({
      ...formData,
      [tagType]: [...formData[tagType], value.trim()],
    });

    switch (tagType) {
      case "languages":
        setNewLanguage("");
        break;
      case "courts":
        setNewCourt("");
        break;
      case "specialisation":
        setNewSpecialisation("");
        break;
      case "casesHandled":
        setNewCaseHandled("");
        break;
      case "clientele":
        setNewClientele("");
        break;
      default:
        break;
    }
  };

  const handleRemoveTag = (tagType, index) => {
    setFormData({
      ...formData,
      [tagType]: formData[tagType].filter((_, i) => i !== index),
    });
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setNewEducation({ ...newEducation, [name]: value });
  };

  const handleAddEducation = () => {
    if (
      !newEducation.degree ||
      !newEducation.university ||
      !newEducation.yearOfPassing
    )
      return;

    setFormData({
      ...formData,
      education: [...formData.education, newEducation],
    });

    setNewEducation({
      degree: "",
      university: "",
      yearOfPassing: "",
      extraCourses: "",
    });
  };

  const handleRemoveEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const handleWorkExperienceChange = (e) => {
    const { name, value } = e.target;
    setNewWorkExperience({ ...newWorkExperience, [name]: value });
  };

  const handleAddWorkExperience = () => {
    if (!newWorkExperience.firm || !newWorkExperience.startDate) return;

    setFormData({
      ...formData,
      workExperience: [...formData.workExperience, newWorkExperience],
    });

    setNewWorkExperience({
      firm: "",
      startDate: "",
      endDate: "",
      briefExperience: "",
    });
  };

  const handleRemoveWorkExperience = (index) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found, please log in.");
      }

      await axios.put("/api/advocate/profile", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-container">
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-profile-container">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <header className="profile-header">
        <h2>Edit Profile</h2>
        <button onClick={() => navigate("/profile")} className="cancel-button">
          Cancel
        </button>
      </header>

      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              placeholder="City, State"
            />
          </div>

          <div className="form-group">
            <label>Enrolment Number</label>
            <input
              type="text"
              name="enrolmentNo"
              value={formData.enrolmentNo || ""}
              onChange={handleChange}
              placeholder="Your enrolment number"
            />
          </div>

          <div className="form-group">
            <label>Bar Council Registration Number</label>
            <input
              type="text"
              name="barCouncilRegNo"
              value={formData.barCouncilRegNo || ""}
              onChange={handleChange}
              placeholder="Your bar council registration number"
            />
          </div>

          <div className="form-group">
            <label>Years of Experience</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience || ""}
              onChange={handleChange}
              placeholder="Years of professional experience"
              min="0"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Languages</h3>
          <div className="tag-input-container">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add language"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag("languages", newLanguage);
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddTag("languages", newLanguage)}
              className="add-tag-btn"
            >
              Add
            </button>
          </div>
          <div className="tags-container">
            {formData.languages &&
              formData.languages.map((lang, index) => (
                <div key={index} className="tag">
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("languages", index)}
                    className="remove-tag-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Courts</h3>
          <div className="tag-input-container">
            <input
              type="text"
              value={newCourt}
              onChange={(e) => setNewCourt(e.target.value)}
              placeholder="Add court (e.g., Supreme Court)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag("courts", newCourt);
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddTag("courts", newCourt)}
              className="add-tag-btn"
            >
              Add
            </button>
          </div>
          <div className="tags-container">
            {formData.courts &&
              formData.courts.map((court, index) => (
                <div key={index} className="tag">
                  {court}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("courts", index)}
                    className="remove-tag-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Specialisation</h3>
          <div className="tag-input-container">
            <input
              type="text"
              value={newSpecialisation}
              onChange={(e) => setNewSpecialisation(e.target.value)}
              placeholder="Add specialisation (e.g., Criminal Law)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag("specialisation", newSpecialisation);
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddTag("specialisation", newSpecialisation)}
              className="add-tag-btn"
            >
              Add
            </button>
          </div>
          <div className="tags-container">
            {formData.specialisation &&
              formData.specialisation.map((spec, index) => (
                <div key={index} className="tag">
                  {spec}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("specialisation", index)}
                    className="remove-tag-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="form-section">
          <h3>About</h3>
          <div className="form-group">
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              placeholder="Describe your professional background, approach, and expertise..."
              rows="5"
            ></textarea>
          </div>
        </div>

        <div className="form-section">
          <h3>Education</h3>
          <div className="complex-input-container">
            <div className="complex-input-fields">
              <input
                type="text"
                name="degree"
                value={newEducation.degree}
                onChange={handleEducationChange}
                placeholder="Degree/Certificate"
              />
              <input
                type="text"
                name="university"
                value={newEducation.university}
                onChange={handleEducationChange}
                placeholder="University/Institution"
              />
              <input
                type="number"
                name="yearOfPassing"
                value={newEducation.yearOfPassing}
                onChange={handleEducationChange}
                placeholder="Year of Passing"
                min="1950"
                max={new Date().getFullYear()}
              />
              <input
                type="text"
                name="extraCourses"
                value={newEducation.extraCourses}
                onChange={handleEducationChange}
                placeholder="Extra Courses (optional)"
              />
            </div>
            <button
              type="button"
              onClick={handleAddEducation}
              className="add-complex-btn"
            >
              Add Education
            </button>
          </div>

          <div className="complex-items-container">
            {formData.education &&
              formData.education.map((edu, index) => (
                <div key={index} className="complex-item">
                  <div className="complex-item-details">
                    <strong>{edu.degree}</strong>
                    <p>
                      {edu.university} | {edu.yearOfPassing}
                    </p>
                    {edu.extraCourses && <p>Additional: {edu.extraCourses}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(index)}
                    className="remove-complex-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Work Experience</h3>
          <div className="complex-input-container">
            <div className="complex-input-fields">
              <input
                type="text"
                name="firm"
                value={newWorkExperience.firm}
                onChange={handleWorkExperienceChange}
                placeholder="Firm/Organization"
              />
              <input
                type="date"
                name="startDate"
                value={newWorkExperience.startDate}
                onChange={handleWorkExperienceChange}
                placeholder="Start Date"
              />
              <input
                type="date"
                name="endDate"
                value={newWorkExperience.endDate}
                onChange={handleWorkExperienceChange}
                placeholder="End Date (leave blank if current)"
              />
              <input
                type="text"
                name="briefExperience"
                value={newWorkExperience.briefExperience}
                onChange={handleWorkExperienceChange}
                placeholder="Brief description of your role"
              />
            </div>
            <button
              type="button"
              onClick={handleAddWorkExperience}
              className="add-complex-btn"
            >
              Add Experience
            </button>
          </div>

          <div className="complex-items-container">
            {formData.workExperience &&
              formData.workExperience.map((exp, index) => (
                <div key={index} className="complex-item">
                  <div className="complex-item-details">
                    <strong>{exp.firm}</strong>
                    <p>
                      {exp.startDate
                        ? new Date(exp.startDate).toLocaleDateString()
                        : "N/A"}
                      {exp.endDate
                        ? ` - ${new Date(exp.endDate).toLocaleDateString()}`
                        : " - Present"}
                    </p>
                    {exp.briefExperience && <p>{exp.briefExperience}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveWorkExperience(index)}
                    className="remove-complex-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Cases Handled</h3>
          <div className="tag-input-container">
            <input
              type="text"
              value={newCaseHandled}
              onChange={(e) => setNewCaseHandled(e.target.value)}
              placeholder="Add case type handled"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag("casesHandled", newCaseHandled);
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddTag("casesHandled", newCaseHandled)}
              className="add-tag-btn"
            >
              Add
            </button>
          </div>
          <div className="tags-container">
            {formData.casesHandled &&
              formData.casesHandled.map((caseType, index) => (
                <div key={index} className="tag">
                  {caseType}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("casesHandled", index)}
                    className="remove-tag-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Clientele</h3>
          <div className="tag-input-container">
            <input
              type="text"
              value={newClientele}
              onChange={(e) => setNewClientele(e.target.value)}
              placeholder="Add client type"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag("clientele", newClientele);
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddTag("clientele", newClientele)}
              className="add-tag-btn"
            >
              Add
            </button>
          </div>
          <div className="tags-container">
            {formData.clientele &&
              formData.clientele.map((client, index) => (
                <div key={index} className="tag">
                  {client}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag("clientele", index)}
                    className="remove-tag-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button type="submit" className="save-btn" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
