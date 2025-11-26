// ReportStray.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import rescueRequestAPI from '../../api/rescueRequestAPI';
import './ReportStray.css';

const ReportStray = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    urgency: 'medium',
    animalType: 'dog',
    contactInfo: '',
    photos: [],
    reporterName: '',
    reporterPhone: '',
    reporterEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters long';
        if (value.trim().length > 500) return 'Description must be less than 500 characters';
        return '';
      
      case 'location':
        if (!value.trim()) return 'Location is required';
        if (value.trim().length < 5) return 'Location must be at least 5 characters long';
        return '';
      
      case 'reporterName':
        if (value && !/^[a-zA-Z\s]{2,50}$/.test(value.trim())) 
          return 'Name must contain only letters and spaces (2-50 characters)';
        return '';
      
      case 'reporterPhone':
    if (value && !/^[\+]?[0-9][\d]{9}$/.test(value.replace(/[\s\-\(\)]/g, ''))) 
        return 'Please enter a valid 10-digit phone number';
    return '';
      
      case 'reporterEmail':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) 
          return 'Please enter a valid email address';
        return '';
      
      case 'contactInfo':
        if (value && value.length > 100) return 'Contact info must be less than 100 characters';
        return '';
      
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    
    // Field-specific validation
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    // Photo validation
    if (formData.photos.length > 5) {
      newErrors.photos = 'Maximum 5 photos allowed';
    }
    
    formData.photos.forEach((photo, index) => {
      if (photo.size > 5 * 1024 * 1024) { // 5MB limit
        newErrors.photos = `Photo ${index + 1} exceeds 5MB size limit`;
      }
      if (!photo.type.startsWith('image/')) {
        newErrors.photos = `Photo ${index + 1} must be an image file`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation for the changed field
    if (errors[name]) {
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      } else {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (files.length > 5) {
      setErrors(prev => ({ ...prev, photos: 'Maximum 5 photos allowed' }));
      return;
    }
    
    // Validate each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photos: `Photo ${i + 1} exceeds 5MB size limit` }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photos: `Photo ${i + 1} must be an image file` }));
        return;
      }
    }
    
    // Clear photo errors if validation passes
    const newErrors = { ...errors };
    delete newErrors.photos;
    setErrors(newErrors);
    
    setFormData(prev => ({
      ...prev,
      photos: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate entire form before submission
    if (!validateForm()) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      // Submit to backend API
      const response = await rescueRequestAPI.submitRescueRequest(formData);
      
      // Call parent onSubmit if provided (for backward compatibility)
      if (onSubmit) {
        await onSubmit(formData);
      }
      
      // Reset form
      setFormData({
        description: '',
        location: '',
        urgency: 'medium',
        animalType: 'dog',
        contactInfo: '',
        photos: [],
        reporterName: '',
        reporterPhone: '',
        reporterEmail: ''
      });
      setErrors({});
      
      // Show success message
      alert('Report submitted successfully! Thank you for helping rescue animals.');
      
      // Redirect to home page
      navigate('/');
      
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error submitting report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="re-st-report-stray">
      <h2>Report a Stray Dog</h2>
      <form onSubmit={handleSubmit} className="re-st-report-form" noValidate>
        <div className="re-st-form-group">
          <label htmlFor="animalType">Animal Type *</label>
          <select
            id="animalType"
            name="animalType"
            value={formData.animalType}
            onChange={handleInputChange}
            required
          >
            <option value="dog">Dog</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="re-st-form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the animal's condition, behavior, etc. (Minimum 10 characters)"
            rows="4"
            required
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
          <small>{formData.description.length}/500 characters</small>
        </div>

        <div className="re-st-form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Street address or nearby landmarks"
            required
            className={errors.location ? 'error' : ''}
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>

        <div className="re-st-form-group">
          <label htmlFor="urgency">Urgency Level</label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleInputChange}
          >
            <option value="low">Low - Animal appears healthy</option>
            <option value="medium">Medium - Some concerns</option>
            <option value="high">High - Animal needs immediate help</option>
          </select>
        </div>

        <div className="re-st-form-group">
          <label htmlFor="reporterName">Your Name</label>
          <input
            type="text"
            id="reporterName"
            name="reporterName"
            value={formData.reporterName}
            onChange={handleInputChange}
            placeholder="Your full name"
            className={errors.reporterName ? 'error' : ''}
          />
          {errors.reporterName && <span className="error-message">{errors.reporterName}</span>}
        </div>

        <div className="re-st-form-group">
          <label htmlFor="reporterPhone">Your Phone Number</label>
          <input
            type="tel"
            id="reporterPhone"
            name="reporterPhone"
            value={formData.reporterPhone}
            onChange={handleInputChange}
            placeholder="Your phone number"
            className={errors.reporterPhone ? 'error' : ''}
          />
          {errors.reporterPhone && <span className="error-message">{errors.reporterPhone}</span>}
        </div>

        <div className="re-st-form-group">
          <label htmlFor="reporterEmail">Your Email (Optional)</label>
          <input
            type="email"
            id="reporterEmail"
            name="reporterEmail"
            value={formData.reporterEmail}
            onChange={handleInputChange}
            placeholder="your.email@example.com"
            className={errors.reporterEmail ? 'error' : ''}
          />
          {errors.reporterEmail && <span className="error-message">{errors.reporterEmail}</span>}
        </div>

        <div className="re-st-form-group">
          <label htmlFor="contactInfo">Additional Contact Information</label>
          <input
            type="text"
            id="contactInfo"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleInputChange}
            placeholder="Alternative contact method (optional)"
            className={errors.contactInfo ? 'error' : ''}
          />
          {errors.contactInfo && <span className="error-message">{errors.contactInfo}</span>}
          <small>{formData.contactInfo.length}/100 characters</small>
        </div>

        <div className="re-st-form-group">
          <label htmlFor="photos">Photos</label>
          <input
            type="file"
            id="photos"
            name="photos"
            onChange={handlePhotoUpload}
            multiple
            accept="image/*"
            className={errors.photos ? 'error' : ''}
          />
          {errors.photos && <span className="error-message">{errors.photos}</span>}
          <small>Upload photos to help rescue teams identify the animal (Max 5 photos, 5MB each)</small>
          {formData.photos.length > 0 && (
            <small>Selected files: {formData.photos.map(photo => photo.name).join(', ')}</small>
          )}
        </div>

        <button type="submit" disabled={loading || Object.keys(errors).length > 0} className="re-st-submit-btn">
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default ReportStray;