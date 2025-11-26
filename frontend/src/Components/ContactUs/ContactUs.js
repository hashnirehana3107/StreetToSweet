import React, { useRef, useState } from 'react';
import Footer from "../Footer/Footer";
import emailjs from '@emailjs/browser';
import axios from 'axios';
import { MapPin, Phone, Mail, Heart, SmartphoneNfc, Ambulance } from 'lucide-react';
import './ContactUs.css';

import contactIllustration from "../../assets/contactIllustration.jpg";

export default function ContactUs() {
  const form = useRef();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (formData) => {
    const newErrors = {};

    // Name validation
    if (!formData.get('user_name')) {
      newErrors.user_name = 'Name is required';
    } else if (formData.get('user_name').length < 2) {
      newErrors.user_name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.get('user_email')) {
      newErrors.user_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.get('user_email'))) {
      newErrors.user_email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, validate)
    if (formData.get('user_phone') && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.get('user_phone').replace(/[\s\-\(\)]/g, ''))) {
      newErrors.user_phone = 'Please enter a valid phone number';
    }

    // Category validation
    if (!formData.get('c-category')) {
      newErrors.category = 'Please select a category';
    }

    // Message validation
    if (!formData.get('message')) {
      newErrors.message = 'Message is required';
    } else if (formData.get('message').length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (formData.get('message').length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters';
    }

    return newErrors;
  };

  const sendEmail = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(form.current);
    const newErrors = validateForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);

      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    // Clear previous errors
    setErrors({});

    // Prepare payload to save in DB
    const payload = {
      user_name: (formData.get('user_name') || '').trim(),
      user_email: (formData.get('user_email') || '').trim(),
      user_phone: (formData.get('user_phone') || '').trim(),
      'c-category': formData.get('c-category'),
      message: (formData.get('message') || '').trim(),
    };

    try {
      // 1) Save to database
      await axios.post('/contact-messages', payload);

      // 2) Try to send email notification via EmailJS (non-blocking for success)
      try {
        await emailjs.sendForm(
          'service_ip4pus7',
          'template_wb5zy9l',
          form.current,
          { publicKey: 'WRu0UwCVxutdnCH0T' }
        );
      } catch (emailErr) {
        console.warn('EmailJS failed, message saved to DB:', emailErr);
      }

      alert('Thank you for reaching out! Your message has been received and saved. Our team will contact you shortly 🐶💌');
      form.current.reset();
    } catch (err) {
      console.error('Error saving contact message:', err?.response?.data || err.message);
      const msg = err?.response?.data?.error || 'Message not saved. Please try again.';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  return (
    <div className="contact-container">
     

      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-overlay">
          <h1>Get in Touch <SmartphoneNfc size={40} color="#fff"/></h1><br></br>
          <p>“We’d love to hear from you! Whether it’s adoption queries, donations, or volunteering, reach out today.</p>
        </div><br></br>
        <div className="connect-hero-buttons">
            <button
              className="connect-btn-primary"
              onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
            >
              Connect Us
            </button>
            
          </div>
        {/* Floating paw animation */}
        <div className="floating-paws-hero">
          <span className="paw">🐾</span>
          <span className="paw">🐾</span>
          <span className="paw">🐾</span>
        </div>
      </section>

      {/* Emergency Rescue Hotline */}
      <div className="ee-emergency-banner">
        <Ambulance size={40}/>  Found an injured street dog? Call our 24/7 rescue hotline: +94 77 123 4567
      </div>

      <section className="contact-info-section-alt">
  {/* Visit Us */}
  <div className="info-block">
    <MapPin className="info-icon" />
    <div className="info-text">
      
      <h3> Visit Us</h3>
      <p>StreetToSweet Dog Shelter, Ella, Sri Lanka</p>
      <div className="map-wrapper">
        <iframe
          title="StreetToSweet Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.692056759444!2d80.63502731477447!3d7.290571994727972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae366266498acd3%3A0x7d3a61f686b3f5f!2sKandy%2C%20Sri%20Lanka!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  </div>

  {/* Call Us */}
  <div className="info-block">
    <Phone className="info-icon" />
    <div className="info-text">
      <h3>Call Us</h3>
      <p>Hotline: +94 777 123 234 (24/7 rescue)</p>
      <p>Office: +94 784 567 897 (general inquiries)</p>
    </div>
  </div>

  {/* Email Us */}
  <div className="info-block">
    <Mail className="info-icon" />
    <div className="info-text">
      <h3>Email Us</h3>
      <p>General: info@streettosweet.org</p>
      <p>Adoptions: adopt@streettosweet.org</p>
      <p>Volunteers: volunteer@streettosweet.org</p>
    </div>
  </div>
</section>


      <section className="c-contact-form-section">
  <div className="c-form-image-wrapper">
    {/* Left Side Image */}
    <div className="c-contact-image">
      <img src={contactIllustration} alt="Contact Illustration" />
      {/* Optional: floating paws on image */}
      <span className="paw-floating">🐾</span>
      <span className="paw-floating" style={{ top: '70%', left: '60%' }}>🐾</span>
    </div>

    {/* Right Side Form */}
    <div className="c-form-container">
      <h2>Send Us a Message</h2>
      <p className="c-form-subtitle">
        We'd love to hear from you! 
      </p>
      <p className="c-form-subtitle"> Fill out the form below and we'll get back to you soon.</p>
      <form ref={form} onSubmit={sendEmail} className="c-contact-form" noValidate>
        <div className="form-field">
          <input 
            type="text" 
            name="user_name" 
            placeholder="Your Name" 
            required 
            onChange={handleInputChange}
            className={errors.user_name ? 'error' : ''}
          />
          {errors.user_name && <span className="error-message">{errors.user_name}</span>}
        </div>
        
        <div className="form-field">
          <input 
            type="email" 
            name="user_email" 
            placeholder="Your Email" 
            required 
            onChange={handleInputChange}
            className={errors.user_email ? 'error' : ''}
          />
          {errors.user_email && <span className="error-message">{errors.user_email}</span>}
        </div>
        
        <div className="form-field">
          <input 
            type="tel" 
            name="user_phone" 
            placeholder="Phone (optional)" 
            onChange={handleInputChange}
            className={errors.user_phone ? 'error' : ''}
          />
          {errors.user_phone && <span className="error-message">{errors.user_phone}</span>}
        </div>
        
        <div className="form-field">
          <select 
            name="c-category" 
            required 
            onChange={handleInputChange}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select Category</option>
            <option value="Adoption">Adoption</option>
            <option value="Volunteer">Volunteer</option>
            <option value="Donation">Donation</option>
            <option value="Rescue">Rescue</option>
            <option value="General">General</option>
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>
        
        <div className="form-field">
          <textarea 
            name="message" 
            placeholder="Your Message" 
            rows="5" 
            required 
            onChange={handleInputChange}
            className={errors.message ? 'error' : ''}
          ></textarea>
          {errors.message && <span className="error-message">{errors.message}</span>}
        </div>
        
        <button 
          type="submit" 
          className="c-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : <><Heart /> Send Message</>}
        </button>
      </form>
    </div>
  </div>
</section>


      <Footer />
    </div>
  );
}