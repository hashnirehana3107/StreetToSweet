import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import { AlertCircle, CheckCircle, FileText, MapPin, PawPrint, Search, SearchCheck } from "lucide-react";
import "./LostFound.css";
import lostfound from "../../assets/lostfound.jpg";

const LostFound = () => {
  const navigate = useNavigate();
  const backendUrl = "http://localhost:3000";

  const [posts, setPosts] = useState([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [type, setType] = useState("Lost");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("Lost");
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Validation states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const placeholderImg =
    "https://images.unsplash.com/photo-1601758123927-00b437a98b36?auto=format&fit=crop&w=600&q=80";

  // Fetch posts from backend
  useEffect(() => {
    axios
      .get(`${backendUrl}/lostfound`)
      .then((res) => setPosts(res.data))
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!userName.trim()) {
      newErrors.userName = "Name is required";
    } else if (userName.trim().length < 2) {
      newErrors.userName = "Name must be at least 2 characters long";
    } else if (!/^[a-zA-Z\s]*$/.test(userName.trim())) {
      newErrors.userName = "Name can only contain letters and spaces";
    }

    // Email validation
    if (!userEmail.trim()) {
      newErrors.userEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
      newErrors.userEmail = "Please enter a valid email address";
    }

    // Phone validation
    if (!userPhone.trim()) {
      newErrors.userPhone = "Phone number is required";
    } else if (!/^[\d\s\-\+\(\)]{10,15}$/.test(userPhone.replace(/\D/g, ''))) {
      newErrors.userPhone = "Please enter a valid phone number (10-15 digits)";
    } else if (userPhone.replace(/\D/g, '').length < 10) {
      newErrors.userPhone = "Phone number must be at least 10 digits";
    }

    // Title validation
    if (!title.trim()) {
      newErrors.title = "Dog name/title is required";
    } else if (title.trim().length < 2) {
      newErrors.title = "Dog name/title must be at least 2 characters long";
    }

    // Location validation
    if (!location.trim()) {
      newErrors.location = "Location is required";
    } else if (location.trim().length < 3) {
      newErrors.location = "Location must be at least 3 characters long";
    }

    // Details validation
    if (!details.trim()) {
      newErrors.details = "Details are required";
    } else if (details.trim().length < 10) {
      newErrors.details = "Please provide more details (at least 10 characters)";
    } else if (details.trim().length > 500) {
      newErrors.details = "Details cannot exceed 500 characters";
    }

    // File validation (optional but with restrictions if provided)
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        newErrors.file = "Please upload a valid image file (JPEG, PNG, GIF, WebP)";
      } else if (file.size > maxSize) {
        newErrors.file = "Image size must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // File preview
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    
    // Clear file error when new file is selected
    if (errors.file) {
      setErrors(prev => ({ ...prev, file: "" }));
    }

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  // Real-time validation for specific fields
  const handleBlur = (field) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'userName':
        if (!userName.trim()) {
          newErrors.userName = "Name is required";
        } else if (userName.trim().length < 2) {
          newErrors.userName = "Name must be at least 2 characters long";
        } else {
          delete newErrors.userName;
        }
        break;
      
      case 'userEmail':
        if (!userEmail.trim()) {
          newErrors.userEmail = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
          newErrors.userEmail = "Please enter a valid email address";
        } else {
          delete newErrors.userEmail;
        }
        break;
      
      case 'userPhone':
        if (!userPhone.trim()) {
          newErrors.userPhone = "Phone number is required";
        } else if (userPhone.replace(/\D/g, '').length < 10) {
          newErrors.userPhone = "Phone number must be at least 10 digits";
        } else {
          delete newErrors.userPhone;
        }
        break;
      
      case 'title':
        if (!title.trim()) {
          newErrors.title = "Dog name/title is required";
        } else if (title.trim().length < 2) {
          newErrors.title = "Dog name/title must be at least 2 characters long";
        } else {
          delete newErrors.title;
        }
        break;
      
      case 'location':
        if (!location.trim()) {
          newErrors.location = "Location is required";
        } else if (location.trim().length < 3) {
          newErrors.location = "Location must be at least 3 characters long";
        } else {
          delete newErrors.location;
        }
        break;
      
      case 'details':
        if (!details.trim()) {
          newErrors.details = "Details are required";
        } else if (details.trim().length < 10) {
          newErrors.details = "Please provide more details (at least 10 characters)";
        } else if (details.trim().length > 500) {
          newErrors.details = "Details cannot exceed 500 characters";
        } else {
          delete newErrors.details;
        }
        break;
      
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.error-field');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", title.trim());
      formData.append("details", details.trim());
      formData.append("type", type);
      formData.append("owner", userName.trim());
      formData.append("ownerEmail", userEmail.trim());
      formData.append("ownerPhone", userPhone.trim());
      formData.append("location", location.trim());
      if (file) formData.append("image", file);

      const res = await axios.post(`${backendUrl}/lostfound`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Add new post to state
      setPosts([res.data, ...posts]);

      // Reset form
      setTitle("");
      setDetails("");
      setUserName("");
      setUserEmail("");
      setUserPhone("");
      setLocation("");
      setType("Lost");
      setFile(null);
      setPreview(null);
      setErrors({});

      alert("Report submitted successfully!");
      navigate("/userprofile");
    } catch (err) {
      console.error("Error submitting post:", err);
      alert("Error submitting report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Character counter for details
  const detailsLength = details.trim().length;

  const filteredPosts = posts.filter((post) => post.type === activeTab);

  return (
    <>


      {/* Hero Section */}
      <div className="lf-hero">
        <div className="lf-hero-content">
          <h1 className="lf-hero-title">Help Reunite Lost & Found Dogs</h1>
          <p className="lf-hero-subtext">
            Report or search for street dogs to bring them back home safely.
          </p>
          <div className="lf-hero-buttons">
            <button className="lf-btn-primary" onClick={() => setType("Lost")}>
              Report Lost Dog
            </button>
            <button className="lf-btn-secondary" onClick={() => setType("Found")}>
              Report Found Dog
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <section className="lf-form-section">
        <div className="lf-form-container">
          <div className="lf-form-image">
            <img src={lostfound} alt="Dog" />
          </div>

          <div className="lf-form">
            <h3>
              Report {type} Dog <PawPrint size={32} />
            </h3>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              {/* Name Field */}
              <div className={`form-field ${errors.userName ? 'error-field' : ''}`}>
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onBlur={() => handleBlur('userName')}
                  required
                  className={errors.userName ? 'error-input' : ''}
                />
                {errors.userName && <span className="error-message">{errors.userName}</span>}
              </div>

              {/* Email Field */}
              <div className={`form-field ${errors.userEmail ? 'error-field' : ''}`}>
                <input
                  type="email"
                  placeholder="Email *"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  onBlur={() => handleBlur('userEmail')}
                  required
                  className={errors.userEmail ? 'error-input' : ''}
                />
                {errors.userEmail && <span className="error-message">{errors.userEmail}</span>}
              </div>

              {/* Phone Field */}
              <div className={`form-field ${errors.userPhone ? 'error-field' : ''}`}>
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  onBlur={() => handleBlur('userPhone')}
                  required
                  className={errors.userPhone ? 'error-input' : ''}
                />
                {errors.userPhone && <span className="error-message">{errors.userPhone}</span>}
              </div>

              {/* Type Field */}
              <div className="form-field">
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select>
              </div>

              {/* Title Field */}
              <div className={`form-field ${errors.title ? 'error-field' : ''}`}>
                <input
                  type="text"
                  placeholder="Dog Name / Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => handleBlur('title')}
                  required
                  className={errors.title ? 'error-input' : ''}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              {/* Location Field */}
              <div className={`form-field ${errors.location ? 'error-field' : ''}`}>
                <input
                  type="text"
                  placeholder="Location *"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onBlur={() => handleBlur('location')}
                  required
                  className={errors.location ? 'error-input' : ''}
                />
                {errors.location && <span className="error-message">{errors.location}</span>}
              </div>

              {/* Details Field */}
              <div className={`form-field ${errors.details ? 'error-field' : ''}`}>
                <textarea
                  placeholder="Details (breed, color, marks, behavior) *"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  onBlur={() => handleBlur('details')}
                  required
                  className={errors.details ? 'error-input' : ''}
                  maxLength={500}
                />
                <div className="character-counter">
                  {detailsLength}/500 characters
                  {errors.details && <span className="error-message">{errors.details}</span>}
                </div>
              </div>

              {/* File Field */}
              <div className={`form-field ${errors.file ? 'error-field' : ''}`}>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept="image/*"
                />
                {errors.file && <span className="error-message">{errors.file}</span>}
                {preview && <img src={preview} alt="preview" className="lf-preview" />}
                <div className="file-hint">Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)</div>
              </div>

              <button 
                type="submit" 
                className="lf-submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="lf-tabs">
        <button
          className={`lf-tab-button ${activeTab === "Lost" ? "active-tab-a" : ""}`}
          onClick={() => setActiveTab("Lost")}
        >
          <Search size={32} /> Lost Dogs
        </button>
        <button
          className={`lf-tab-button ${activeTab === "Found" ? "active-tab-b" : ""}`}
          onClick={() => setActiveTab("Found")}
        >
          <SearchCheck size={32} /> Found Dogs
        </button>
      </section>

      {/* Posts Section */}
      <section className="lf-posts-section">
        <div className="lf-posts">
          <h3>{activeTab} Dogs</h3>
          {filteredPosts.length === 0 && <p>No {activeTab.toLowerCase()} dogs reported.</p>}
          <div className="lf-post-grid">
            {filteredPosts.map((post) => (
              <div key={post._id} className={`lf-card ${post.type === "Lost" ? "dog-lost-card" : "dog-found-card"}`}>
                <div className="lf-card-header">
                  {post.type === "Lost" ? (
                    <AlertCircle className="icon lost-icon" />
                  ) : (
                    <CheckCircle className="icon found-icon" />
                  )}
                  <span>{post.name}</span>
                </div>
                <img
                  src={post.image ? `${backendUrl}/uploads/${post.image}` : placeholderImg}
                  alt={post.name}
                  className="lf-image"
                />
                <p className="lf-location">
                  <MapPin size={30} color="#239ce1ff"/> <span>Location: </span>{post.location || "Unknown"}  -  {new Date(post.date).toLocaleDateString()}
                </p>
                <p className="lf-details">
                  <span> Details: </span>{post.details}
                </p>

                {selectedOwner?._id === post._id && (
                  <div className="lf-owner-details-inline">
                    <h4>Contact Details</h4>
                    <p>
                      <strong>Name:</strong> {post.owner}
                    </p>
                    <p>
                      <strong>Email:</strong> {post.ownerEmail}
                    </p>
                    <p>
                      <strong>Phone:</strong> {post.ownerPhone}
                    </p>
                    <button className="lf-close-owner" onClick={() => setSelectedOwner(null)}>
                      Close
                    </button>
                  </div>
                )}

                <div className="lf-card-buttons">
                  <button onClick={() => setSelectedOwner(post)}>Contact Details</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LostFound;