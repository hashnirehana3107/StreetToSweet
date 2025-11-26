// AdoptionRequestForm.js
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AdoptionRequestForm.css";
import { Dog, PawPrint } from "lucide-react";
import axios from "axios";

export default function AdoptionRequestForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const dog = location.state?.dog; // Dog passed from AllDogs.js
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    message: "",
    status: "",
    homeType: "",
    hasPets: false,
    agree: false,
  });

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required";
      isValid = false;
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full Name must be at least 2 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
      isValid = false;
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Phone number must be exactly 10 digits";
      isValid = false;
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
      isValid = false;
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
      isValid = false;
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = "Please select your status";
      isValid = false;
    }

    // Home Type validation
    if (!formData.homeType) {
      newErrors.homeType = "Please select your home type";
      isValid = false;
    }

    // Agreement validation
    if (!formData.agree) {
      newErrors.agree = "You must agree to adopt";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors).find(key => errors[key]);
      if (firstErrorField) {
        document.querySelector(`[name="${firstErrorField}"]`).focus();
      }
      return;
    }

    if (!dog?._id) {
      alert("Dog not selected correctly. Please go back and select a dog.");
      return;
    }

    try {
      // Send request to backend - automatically sets vetReviewStatus to "pending"
      const res = await axios.post("/adoption-requests", {
        ...formData,
        dog: dog._id, // <-- send the real ObjectId
      });

      console.log("Adoption Request Submitted:", res.data);
      setIsSubmitted(true);
      // Notify dashboard listeners
      window.dispatchEvent(new Event("adoptionRequestSubmitted"));
    } catch (error) {
      console.error("Error submitting adoption request:", error.response || error);
      alert("Failed to submit request. Please try again.");
    }
  };

  if (!dog) {
    return (
      <div>
        <div className="no-dog">
          <p>No dog selected for adoption. Please select a dog first.</p>
          <button onClick={() => navigate("/adoptdogspage")} className="btn">
            Back to Dogs
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="adoption-form-page">
        <div className="form-hero">
          <h1>Thank You for Your Application!</h1>
          <p>
            We've received your request to adopt {dog.name} and will review it shortly.
          </p>
        </div>
        
        <div className="submission-success">
          <div className="success-message">
            <h2>Application Submitted Successfully</h2>
            <p>Thank you for your interest in adopting {dog.name}!</p>
            <p>Our team will review your application and contact you within 3-5 business days.</p>
            <p>You'll receive a confirmation email at {formData.email} shortly.</p>
            <button 
              onClick={() => navigate("/mainhome")} 
              className="adopt-request-btn primary"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="adoption-form-page">
      <div className="form-hero">
        <h1> Adopt {dog.name} </h1>
        <p>
          Complete the adoption request form below and help {dog.name} find a
          loving home!
        </p>
      </div>

      <div className="form-container">
        <div className="dog-preview">
          <img src={dog.photo} alt={dog.name} />
          <h3>
            {dog.name} <span className="dog-id">#{dog.id}</span>
          </h3>
          <p>
            {dog.age} • {dog.breed}
          </p>
          <span
            className={`adopt-status ${
              dog.status === "adoption" ? "available" : "treatment-badge"
            }`}
          >
            {dog.status === "adoption" ? "Available" : "Under Treatment"}
          </span>

          <div> <br></br><br></br><br></br>
            <div className="t-message">
              "Thank you for choosing to give a street dog a forever home!"
            </div>
            <p className="t-para">
              <PawPrint size={20} /> Please fill out this adoption request form
              with your details.
            </p>
            <p className="t-para">
              <PawPrint size={20} /> Your application will be reviewed by our
              team, and a vet will ensure the dog is healthy before approval.
            </p>
            <p className="t-para">
              <PawPrint size={20} /> Together, we can make a difference — from
              Street to Sweet!"
            </p>
          </div>
        </div>

        <form className="adoption-form" onSubmit={handleSubmit}>
          <h2>
            Adoption Request Form <Dog size={50} />
          </h2>
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </label>

          <label>
            Phone Number
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            {errors.phone && <span className="error-msg">{errors.phone}</span>}
          </label>

          <label>
            Address
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            {errors.address && <span className="error-msg">{errors.address}</span>}
          </label>

          <label>
            Adopter Status
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="">Select your status</option>
              <option value="student">Student</option>
              <option value="employed">Employed</option>
              <option value="self-employed">Self-Employed</option>
              <option value="retired">Retired</option>
              <option value="other">Other</option>
            </select>
            {errors.status && <span className="error-msg">{errors.status}</span>}
          </label>

          <label>
            Home Type
            <select
              name="homeType"
              value={formData.homeType}
              onChange={handleChange}
              required
            >
              <option value="">Select home type</option>
              <option value="apartment">Apartment</option>
              <option value="house">House with Yard</option>
              <option value="farm">Farm</option>
              <option value="other">Other</option>
            </select>
            {errors.homeType && <span className="error-msg">{errors.homeType}</span>}
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              name="hasPets"
              checked={formData.hasPets}
              onChange={handleChange}
            />
            Do you have other pets at home?
          </label>

          <label>
            Message (Optional)
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={`Tell us why you want to adopt ${dog.name}`}
            />
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              name="agree"
              checked={formData.agree}
              onChange={handleChange}
              required
            />
            I agree to provide lifelong care, love, and post-adoption support for{" "}
            {dog.name}.
            {errors.agree && <span className="error-msg">{errors.agree}</span>}
          </label>

          <button type="submit" className="adopt-request-btn primary">
            Submit Adoption Request <PawPrint size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}