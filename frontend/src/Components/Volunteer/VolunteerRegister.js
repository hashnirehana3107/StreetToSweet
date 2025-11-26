import React, { useState, useEffect } from "react";
import Footer from "../Footer/Footer";
import "./VolunteerRegister.css";
import volunteerImg from "../../assets/volunteer-dog.jpg";
import { Handshake } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function VolunteerRegister() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    availability: "",
    task: "",
    motivation: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
    availability: "",
    task: "",
    motivation: "",
  });

  // Pre-populate form with user data if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prevData => ({
        ...prevData,
        name: user.name || prevData.name,
        email: user.email || prevData.email,
        phone: user.phone || prevData.phone,
      }));
    }
  }, [user, isAuthenticated]);

  // Name validation function
  const validateName = (name) => {
    if (!name) return "Full name is required";
    if (name.length < 2) return "Name must be at least 2 characters long";
    if (name.length > 50) return "Name is too long (max 50 characters)";
    if (!/^[a-zA-Z\s]+$/.test(name)) return "Name can only contain letters and spaces";
    return "";
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 254) return "Email address is too long";
    return "";
  };

  // Phone validation function
  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone) return "Phone number is required";
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) return "Please enter a valid 10-digit phone number";
    return "";
  };

  // Availability validation function
  const validateAvailability = (availability) => {
    if (!availability) return "Availability is required";
    if (availability.length < 5) return "Please provide more specific availability";
    if (availability.length > 100) return "Availability description is too long";
    return "";
  };

  // Task validation function
  const validateTask = (task) => {
    if (!task) return "Please select a preferred task";
    const validTasks = ["Dog Walking", "Cleaning", "Feeding", "Rescue", "Post-care Involvement", "Other"];
    if (!validTasks.includes(task)) return "Please select a valid task";
    return "";
  };

  // Motivation validation function
  const validateMotivation = (motivation) => {
    if (!motivation) return "Motivation is required";
    
    return "";
  };

  // Real-time field validation
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return validateName(value);
      case "email":
        return validateEmail(value);
      case "phone":
        return validatePhone(value);
      case "availability":
        return validateAvailability(value);
      case "task":
        return validateTask(value);
      case "motivation":
        return validateMotivation(value);
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData({ ...formData, [name]: value });
    
    // Clear general message
    setMessage("");
    
    // Validate field in real-time and update field errors
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  // Form validation before submission
  const validateForm = () => {
    const errors = {
      name: isAuthenticated && user ? "" : validateName(formData.name),
      email: isAuthenticated && user ? "" : validateEmail(formData.email),
      phone: (isAuthenticated && user && user.phone) ? "" : validatePhone(formData.phone),
      availability: validateAvailability(formData.availability),
      task: validateTask(formData.task),
      motivation: validateMotivation(formData.motivation)
    };

    setFieldErrors(errors);

    // Check if any errors exist
    return !Object.values(errors).some(error => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setMessage("Please fix the validation errors above.");
      return;
    }

    // Additional security checks
    if (formData.email && formData.email.trim() !== formData.email) {
      setMessage("Email should not contain leading or trailing spaces");
      return;
    }

    if (formData.name && formData.name.trim() !== formData.name) {
      setMessage("Name should not contain leading or trailing spaces");
      return;
    }

    setLoading(true);
    setMessage("");
    setRegistrationSuccess(false);

    try {
      let url = "http://localhost:3000/volunteerregister";
      let requestBody = formData;

      // If user is authenticated, use the authenticated route and simplified data
      if (isAuthenticated && user) {
        url = "http://localhost:3000/volunteers/register-authenticated";
        requestBody = {
          availability: formData.availability.trim(),
          task: formData.task,
          motivation: formData.motivation.trim()
        };
      } else {
        // For guest registration, clean the data
        requestBody = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          availability: formData.availability.trim(),
          task: formData.task,
          motivation: formData.motivation.trim()
        };
      }

      const headers = {
        "Content-Type": "application/json"
      };

      // Add authorization header if user is authenticated
      if (isAuthenticated) {
        const token = localStorage.getItem('authToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const res = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (res.ok) {
        // Save volunteer ID to localStorage
        localStorage.setItem("volunteerId", data.volunteer._id);

        // Update auth context and token if new token is provided
        if (data.token && data.user && isAuthenticated) {
          // Update localStorage with new token
          localStorage.setItem('authToken', data.token);
          
          // Update auth context with new user data
          updateUser(data.user);
          
          console.log('Updated token and user role to:', data.user.role);
        }

        let successMessage = "🎉 Thank you for registering as a volunteer!";
        if (data.userRoleUpdated) {
          successMessage += " Your user role has been updated to 'volunteer'.";
        }

        setMessage(successMessage);
        setRegistrationSuccess(true);
        
        // Reset form only if not using pre-filled data
        if (!isAuthenticated) {
          setFormData({
            name: "",
            email: "",
            phone: "",
            availability: "",
            task: "",
            motivation: "",
          });
        } else {
          // Just reset the volunteer-specific fields
          setFormData(prevData => ({
            ...prevData,
            availability: "",
            task: "",
            motivation: "",
          }));
        }

        // Clear field errors on success
        setFieldErrors({
          name: "",
          email: "",
          phone: "",
          availability: "",
          task: "",
          motivation: "",
        });

        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Auto-redirect after 3 seconds
        setTimeout(() => {
          handleRedirectToDashboard();
        }, 3000);
      } else {
        setMessage(data.message || data.error || "⚠ Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleRedirectToDashboard = () => {
    setRedirecting(true);
    if (isAuthenticated) {
      navigate("/volunteer/dashboard");
    } else {
      // For guest registration, redirect to the general volunteer dashboard
      navigate("/volunteerdashboard");
    }
  };

  // Check if form is valid for submission
  const isFormValid = !Object.values(fieldErrors).some(error => error !== "") && 
                     formData.availability && formData.task && formData.motivation &&
                     (isAuthenticated || (formData.name && formData.email && formData.phone));

  return (
    <div className="volunteer-register">
      

      <div className="v-header">
        <h1>Together We Can Save More Paws</h1>
      </div>

      <div className="volunteer-container">
        {/* Left Side Image */}
        <div className="volunteer-image">
          <h2>
            <Handshake size={40} /> Join Our Mission
          </h2>
          <p>
            Every hand helps! Be part of our journey to rescue, heal, and find
            loving homes for street dogs.
          </p>
          <br />
          <img src={volunteerImg} alt="Volunteer with dogs" />
        </div>

        {/* Right Side Form */}
        <div className="volunteer-form-container">
          <h2>Register as a Volunteer</h2>
          {isAuthenticated && user ? (
            <div className="auth-user-info">
              <p className="welcome-message">
                👋 Welcome back, <strong>{user.name}</strong>!
              </p>
              <p className="pre-fill-notice">
                ✅ We've pre-filled your personal information. Just complete the volunteer-specific details below.
              </p>
            </div>
          ) : (
            <p className="guest-notice">
              📝 Please fill in all your information below to register as a volunteer.
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="volunteer-form">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading || (isAuthenticated && user)}
              placeholder="Enter your full name"
              className={`${isAuthenticated && user ? "readonly-field" : ""} ${fieldErrors.name ? "error-field" : ""}`}
            />
            {fieldErrors.name && (
              <span className="field-error">{fieldErrors.name}</span>
            )}

            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading || (isAuthenticated && user)}
              placeholder="Enter your email address"
              className={`${isAuthenticated && user ? "readonly-field" : ""} ${fieldErrors.email ? "error-field" : ""}`}
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}

            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading || (isAuthenticated && user && user.phone)}
              placeholder="Enter your 10-digit phone number"
              className={`${isAuthenticated && user && user.phone ? "readonly-field" : ""} ${fieldErrors.phone ? "error-field" : ""}`}
            />
            {fieldErrors.phone && (
              <span className="field-error">{fieldErrors.phone}</span>
            )}

            <label>Availability *</label>
            <input
              type="text"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g., Weekends, Evenings, Monday-Friday"
              className={fieldErrors.availability ? "error-field" : ""}
            />
            {fieldErrors.availability && (
              <span className="field-error">{fieldErrors.availability}</span>
            )}

            <label>Preferred Task *</label>
            <select
              name="task"
              value={formData.task}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.task ? "error-field" : ""}
            >
              <option value="">-- Select Task --</option>
              <option value="Dog Walking">🐕 Dog Walking</option>
              <option value="Cleaning">🧹 Cleaning</option>
              <option value="Feeding">🍽️ Feeding</option>
              <option value="Rescue">🚑 Rescue</option>
              <option value="Post-care Involvement">❤️ Post-care Involvement</option>
              <option value="Other">🔧 Other</option>
            </select>
            {fieldErrors.task && (
              <span className="field-error">{fieldErrors.task}</span>
            )}

            <label>Motivation *</label>
            <textarea
              name="motivation"
              value={formData.motivation}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Tell us why you want to volunteer and help street dogs..."
              className={fieldErrors.motivation ? "error-field" : ""}
            ></textarea>
            {fieldErrors.motivation && (
              <span className="field-error">{fieldErrors.motivation}</span>
            )}

            <button type="submit" className="volunteer-btn" disabled={loading || !isFormValid}>
              {loading ? "Registering..." : "Register as Volunteer"}
            </button>
          </form>

          {message && (
            <div className={`message ${message.includes('🎉') ? 'success' : 'error'}`}>
              <p>{message}</p>
            </div>
          )}
          
          {registrationSuccess && !redirecting && (
            <div className="success-actions">
              <button 
                className="dashboard-btn" 
                onClick={handleRedirectToDashboard}
                disabled={redirecting}
              >
                {redirecting ? "Redirecting..." : "Go to Volunteer Dashboard →"}
              </button>
              <p className="auto-redirect-note">
                You will be automatically redirected in a few seconds...
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default VolunteerRegister;