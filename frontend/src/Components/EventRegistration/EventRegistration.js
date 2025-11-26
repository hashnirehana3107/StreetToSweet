import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import "./EventRegistration.css";

const EventRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState({});
  const [formData, setFormData] = useState({ 
    fullName: "", 
    email: "", 
    phone: "", 
    role: "participant", 
    message: "",
    bringSupplies: false,
    suppliesDescription: ""
  });
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`/events/${id}`);
        const e = res.data?.data?.event;
        if (e) {
          setEvent({
            id: e._id,
            title: e.title,
            date: e.date,
            time: e.startTime,
            location: e.location,
            image: (e.photos && e.photos[0]) ? (e.photos[0].startsWith('http') ? e.photos[0] : `http://localhost:3000${e.photos[0]}`) : '/default-event.png',
            description: e.description || ''
          });
        }
      } catch (err) {
        console.error('Failed to load event', err);
      }
    };
    load();
  }, [id]);

  // Auto-fill user information if logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData, 
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    }
    
    if (step === 2 && formData.role === "volunteer" && formData.bringSupplies && !formData.suppliesDescription.trim()) {
      newErrors.suppliesDescription = "Please describe what supplies you'll bring";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to register for the event.');
      return;
    }
    if (validateStep(step)) {
      try {
        const resp = await axios.post(`/events/${id}/register`);
        const registrationId = resp.data?.data?.registrationId;
        setSuccess(true);
        // Navigate to confirmation with details in state for a richer page
        navigate('/eventconfirm', {
          state: {
            confirmation: {
              registration: {
                id: registrationId || 'N/A',
                fullName: formData.fullName,
                email: formData.email,
                role: formData.role
              },
              event: {
                id: event.id,
                title: event.title,
                date: event.date,
                time: event.time,
                location: event.location,
                type: (event.type || 'event'),
                image: event.image
              }
            }
          }
        });
      } catch (err) {
        const msg = err.response?.data?.message || 'Registration failed';
        alert(msg);
      }
    }
  };

  if (success) return (
    <div className="reg-success">
      <div className="reg-success-content">
        <div className="reg-success-icon">🎉</div>
        <h2>Thank You for Registering!</h2>
        <p>You are now registered for <strong>{event.title}</strong>.</p>
        <p>We've sent a confirmation email with event details.</p>
        <div className="reg-success-actions">
          <button className="reg-btn-primary" onClick={() => navigate("/eventconfirm")}>
            My Event Confirmation
          </button>
          <button className="reg-btn-secondary" onClick={() => navigate('/profile', { state: { section: 'events' } })}>
            View My Events
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="event-registration">
      <div className="reg-container">
        <div className="reg-header">
          <button className="reg-back-btn" onClick={() => navigate(-1)}>
            &larr; Back
          </button>
          <h1>Event Registration</h1>
          <div className="reg-progress">
            <div className={`reg-progress-step ${step >= 1 ? 'active' : ''}`}>
              <span>1</span>
              <p>Your Info</p>
            </div>
            <div className={`reg-progress-step ${step >= 2 ? 'active' : ''}`}>
              <span>2</span>
              <p>Details</p>
            </div>
            <div className={`reg-progress-step ${step >= 3 ? 'active' : ''}`}>
              <span>3</span>
              <p>Confirm</p>
            </div>
          </div>
        </div>

        <div className="reg-content">
          <div className="reg-event-card">
            <div 
              className="reg-event-image"
              style={{ 
                backgroundImage: `url(${event.image || "/default-event.png"})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
            <div className="reg-event-info">
              <h3>{event.title}</h3>
              <p><i className="fas fa-calendar"></i> {event.date ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : ''}</p>
              <p><i className="fas fa-clock"></i> {event.time}</p>
              <p><i className="fas fa-map-marker-alt"></i> {event.location}</p>
            </div>
          </div>

          <form className="reg-form" onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="reg-form-step">
                <h2>Your Information</h2>
                <p className="reg-step-desc">Please provide your contact information</p>
                
                <div className="reg-input-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input 
                    type="text" 
                    id="fullName"
                    name="fullName" 
                    placeholder="Enter your full name" 
                    value={formData.fullName} 
                    onChange={handleChange}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="reg-error">{errors.fullName}</span>}
                </div>
                
                <div className="reg-input-group">
                  <label htmlFor="email">Email Address *</label>
                  <input 
                    type="email" 
                    id="email"
                    name="email" 
                    placeholder="Enter your email" 
                    value={formData.email} 
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="reg-error">{errors.email}</span>}
                </div>
                
                <div className="reg-input-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input 
                    type="tel" 
                    id="phone"
                    name="phone" 
                    placeholder="Enter your phone number" 
                    value={formData.phone} 
                    onChange={handleChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="reg-error">{errors.phone}</span>}
                </div>
                
                <button type="button" className="reg-btn-next" onClick={handleNext}>
                  Continue <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="reg-form-step">
                <h2>Registration Details</h2>
                <p className="reg-step-desc">Tell us more about your participation</p>
                
                <div className="reg-input-group">
                  <label htmlFor="role">I'm registering as *</label>
                  <select 
                    id="role"
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                  >
                    <option value="participant">Participant</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="donor">Donor</option>
                    <option value="foster">Foster Care Provider</option>
                  </select>
                </div>
                
                {formData.role === "volunteer" && (
                  <>
                    <div className="reg-input-group reg-checkbox-group">
                      <label className="reg-checkbox">
                        <input 
                          type="checkbox" 
                          name="bringSupplies" 
                          checked={formData.bringSupplies} 
                          onChange={handleChange}
                        />
                        <span className="checkmark"></span>
                        I can bring supplies (food, blankets, medical supplies, etc.)
                      </label>
                    </div>
                    
                    {formData.bringSupplies && (
                      <div className="reg-input-group">
                        <label htmlFor="suppliesDescription">What supplies can you bring?</label>
                        <textarea 
                          id="suppliesDescription"
                          name="suppliesDescription" 
                          placeholder="Please describe the supplies you can contribute..." 
                          value={formData.suppliesDescription} 
                          onChange={handleChange}
                          rows="3"
                          className={errors.suppliesDescription ? 'error' : ''}
                        />
                        {errors.suppliesDescription && <span className="reg-error">{errors.suppliesDescription}</span>}
                      </div>
                    )}
                  </>
                )}
                
                <div className="reg-input-group">
                  <label htmlFor="message">Message / Notes (Optional)</label>
                  <textarea 
                    id="message"
                    name="message" 
                    placeholder="Any questions or additional information you'd like to share..." 
                    value={formData.message} 
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                
                <div className="reg-step-buttons">
                  <button type="button" className="reg-btn-back" onClick={handleBack}>
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <button type="button" className="reg-btn-next" onClick={handleNext}>
                    Continue <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="reg-form-step">
                <h2>Review Your Registration</h2>
                <p className="reg-step-desc">Please confirm your details before submitting</p>
                
                <div className="reg-review-card">
                  <h3>Personal Information</h3>
                  <div className="reg-review-item">
                    <span>Name:</span>
                    <span>{formData.fullName}</span>
                  </div>
                  <div className="reg-review-item">
                    <span>Email:</span>
                    <span>{formData.email}</span>
                  </div>
                  <div className="reg-review-item">
                    <span>Phone:</span>
                    <span>{formData.phone}</span>
                  </div>
                  <div className="reg-review-item">
                    <span>Role:</span>
                    <span className="reg-role-badge">{formData.role}</span>
                  </div>
                  
                  {formData.message && (
                    <>
                      <h3>Additional Notes</h3>
                      <div className="reg-review-item">
                        <p>{formData.message}</p>
                      </div>
                    </>
                  )}
                  
                  {formData.bringSupplies && (
                    <>
                      <h3>Supplies Contribution</h3>
                      <div className="reg-review-item">
                        <p>{formData.suppliesDescription}</p>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="reg-step-buttons">
                  <button type="button" className="reg-btn-back" onClick={handleBack}>
                    <i className="fas fa-arrow-left"></i> Back
                  </button>
                  <button type="submit" className="reg-btn-submit">
                    Confirm Registration <i className="fas fa-check"></i>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;