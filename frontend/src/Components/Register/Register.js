import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import { useAuth } from "../../contexts/AuthContext";
import bgImage from "../../assets/register-bg.jpg";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "user" // Default role
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: ""
  });

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
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) return "Please enter a valid 10-digit phone number";
    return "";
  };

  // Password validation function
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters long";
    if (password.length > 128) return "Password is too long";
    if (!/(?=.*[a-z])/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/(?=.*[A-Z])/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain at least one number";
    if (!/(?=.*[@$!%*?&])/.test(password)) return "Password must contain at least one special character";
    return "";
  };

  // Confirm password validation function
  const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== password) return "Passwords do not match";
    return "";
  };

  // Role validation function
  const validateRole = (role) => {
    if (!role) return "Please select a role";
    const validRoles = ["user", "driver", "vet"];
    if (!validRoles.includes(role)) return "Please select a valid role";
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
      case "password":
        return validatePassword(value);
      case "confirmPassword":
        return validateConfirmPassword(value, formData.password);
      case "role":
        return validateRole(value);
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData({ ...formData, [name]: value });
    
    // Clear general error
    setError("");
    
    // Validate field in real-time and update field errors
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    // Special case: if password changes, re-validate confirm password
    if (name === "password") {
      const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, value);
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: confirmPasswordError
      }));
    }
  };

  // Form validation before submission
  const validateForm = () => {
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
      role: validateRole(formData.role)
    };

    setFieldErrors(errors);

    // Check if any errors exist
    return !Object.values(errors).some(error => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      setError("Please fix the validation errors above.");
      return;
    }

    // Additional security checks
    if (formData.email.trim() !== formData.email) {
      setError("Email should not contain leading or trailing spaces");
      return;
    }

    if (formData.name.trim() !== formData.name) {
      setError("Name should not contain leading or trailing spaces");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''), // Clean phone number
        password: formData.password,
        role: formData.role
      });

      if (result.success) {
        alert(`✅ Registration successful! Welcome, ${result.user.name}`);
        
        // Get the redirect URL based on role
        const redirectTo = result.redirectTo || "/dashboard";
        navigate(redirectTo);
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = !Object.values(fieldErrors).some(error => error !== "") && 
                     formData.name && formData.email && formData.phone && 
                     formData.password && formData.confirmPassword;

  return (
    <div
      className="rg-register-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="rg-welcome-box">
        <h1>Welcome to StreetToSweet!</h1>
        <p>Register to Start Your Journey</p>
      </div>
      <div className="rg-signup-box">
        <h2>Create Your Account</h2>
        
        {error && (
          <div className="rg-error-message" style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="rg-input-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.name ? "rg-error" : ""}
            />
            {fieldErrors.name && (
              <span className="rg-field-error">{fieldErrors.name}</span>
            )}
          </div>
          <div className="rg-input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.email ? "rg-error" : ""}
            />
            {fieldErrors.email && (
              <span className="rg-field-error">{fieldErrors.email}</span>
            )}
          </div>
          <div className="rg-input-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.phone ? "rg-error" : ""}
              placeholder="10-digit phone number"
            />
            {fieldErrors.phone && (
              <span className="rg-field-error">{fieldErrors.phone}</span>
            )}
          </div>
          <div className="rg-input-group">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className={fieldErrors.role ? "rg-error" : ""}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px'
              }}
            >
              <option value="user">User</option>
              <option value="driver">Driver</option>
              <option value="vet">Veterinarian</option>
            </select>
            {fieldErrors.role && (
              <span className="rg-field-error">{fieldErrors.role}</span>
            )}
          </div>
          <div className="rg-input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
              className={fieldErrors.password ? "rg-error" : ""}
            />
            {fieldErrors.password && (
              <span className="rg-field-error">{fieldErrors.password}</span>
            )}
          </div>
          <div className="rg-input-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={6}
              className={fieldErrors.confirmPassword ? "rg-error" : ""}
            />
            {fieldErrors.confirmPassword && (
              <span className="rg-field-error">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="rg-submit-btn" disabled={loading || !isFormValid}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          <button
            type="button"
            className="emergency-btn"
            onClick={() => navigate("/emergencyreport")}
            disabled={loading}
          >
             Report Emergency ➠
          </button>
        </form>
        <div className="rg-signin-link">
          <p>
            Already have an account? <Link to="/login">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;