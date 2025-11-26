import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import { useAuth } from "../../contexts/AuthContext";
import bgImage from "../../assets/login-bg.jpg";
import { FaApple, FaFacebook, FaInstagram } from "react-icons/fa";
import { Eye, EyeOff } from "lucide-react";

function Login({ setIsLoggedIn }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: ""
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    if (email.length > 254) return "Email address is too long";
    return "";
  };

  // Password validation function
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters long";
    if (password.length > 128) return "Password is too long";
    return "";
  };

  // Real-time field validation
  const validateField = (name, value) => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
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
  };

  // Form validation before submission
  const validateForm = () => {
    const errors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password)
    };

    setFieldErrors(errors);

    // Check if any errors exist
    return !errors.email && !errors.password;
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

    setLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setIsLoggedIn(true); // Update App state for backward compatibility
        
        // Get the redirect URL based on role
        const redirectTo = result.redirectTo || "/dashboard";
        
        alert(`✅ Login successful! Welcome, ${result.user.name}`);
        navigate(redirectTo);
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for submission
  const isFormValid = !fieldErrors.email && !fieldErrors.password && formData.email && formData.password;

  return (
    <div
      className="login-container"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="welcome-box">
        <h1>Welcome to StreetToSweet!</h1>
        <p>Every paw deserves care. Sign in to continue helping street dogs.</p>
      </div>
      <div className="login-box">
        <h2>Sign In</h2>
        
        {error && (
          <div className="error-message" style={{
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
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className={fieldErrors.email ? "error" : ""}
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>
          <div className="input-group password-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className={fieldErrors.password ? "error" : ""}
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </span>
            </div>
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading || !isFormValid}
          >
            {loading ? "Signing In..." : "Log In"}
          </button>
          {/* ✅ Emergency Report Button */}
          <button
            type="button"
            className="emergency-btn"
            onClick={() => navigate("/emergencyreport")}
            disabled={loading}
          >
             Report Emergency ➠
          </button>
        </form>
        <div className="signup-link">
          <p>
            Don't have an account? <Link to="/register">Sign up here</Link>
          </p>
        </div>
        <div className="social-icons">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
          >
            <FaFacebook size={40} />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <FaInstagram size={40} />
          </a>
          <a
            href="https://apple.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Apple"
          >
            <FaApple size={40} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;