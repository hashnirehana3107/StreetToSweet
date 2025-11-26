import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import "./EventConfirm.css";
import { FaFacebook, FaTiktok, FaTwitch, FaTwitter, FaWhatsapp } from "react-icons/fa";
import { Mail } from "lucide-react";

const EventConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const [registrationData, setRegistrationData] = useState(null);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Load from navigation state (preferred) or fallback to fetching my latest registration
  useEffect(() => {
    const fromState = location.state && location.state.confirmation;
    if (fromState) {
      // Use data from navigation state but fill in user details from auth context
      setRegistrationData({
        ...fromState.registration,
        fullName: user?.name || fromState.registration.fullName || 'Unknown User',
        email: user?.email || fromState.registration.email || 'No email provided'
      });
      setEvent(fromState.event);
      setIsLoading(false);
      return;
    }

    const loadLatest = async () => {
      try {
        // Load my events and use the latest
        const res = await axios.get('/events/mine');
        const list = res.data?.data?.events || [];
        if (list.length > 0) {
          const ev = list[0];
          const registration = ev.myRegistration || null;
          setRegistrationData({
            id: registration?._id || 'N/A',
            fullName: user?.name || 'Unknown User',
            email: user?.email || 'No email provided',
            role: registration?.status || 'registered'
          });
          setEvent({
            id: ev._id,
            title: ev.title,
            date: ev.date,
            time: ev.startTime,
            location: ev.location,
            type: ev.eventType,
            image: (ev.photos && ev.photos[0]) ? (ev.photos[0].startsWith('http') ? ev.photos[0] : `http://localhost:3000${ev.photos[0]}`) : '/default-event.png'
          });
        }
      } catch (e) {
        console.error('Failed to load confirmation', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadLatest();
  }, [location.state, user]);

  const handleDownloadPDF = async () => {
    if (!event || !event.id) {
      alert("Event information not available for PDF generation.");
      return;
    }

    // Check authentication status from context
    if (!isAuthenticated || !user) {
      alert("You need to be logged in to download the confirmation PDF.");
      return;
    }

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert("Authentication token not found. Please log in again.");
        return;
      }

      // Show loading indicator (optional)
      console.log('Generating PDF...');

      // Use fetch instead of axios for blob downloads
      const response = await fetch(`http://localhost:3000/events/${event.id}/confirmation-pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob data
      const blob = await response.blob();
      
      // Check if blob has content
      if (blob.size === 0) {
        throw new Error('Empty PDF response received');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `event-confirmation-${event.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('PDF downloaded successfully');

    } catch (error) {
      console.error('PDF download error:', error);
      
      // Handle different error types
      if (error.message.includes('status: 404')) {
        alert("Registration not found. Please make sure you are registered for this event.");
      } else if (error.message.includes('status: 401') || error.message.includes('status: 403')) {
        alert("Authentication failed. Please log in again.");
      } else if (error.message.includes('status: 500')) {
        alert("Server error occurred while generating PDF. Please try again later.");
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("Network error. Please check your internet connection and try again.");
      } else {
        alert("Failed to download PDF. Please try again later.");
      }
    }
  };

  const handleShareEvent = (platform) => {
    const eventDetails = `I've registered for ${event.title} on ${event.date} at ${event.location}. Join me in supporting street dogs!`;
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(eventDetails)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(eventDetails)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=Event Registration: ${event.title}&body=${encodeURIComponent(eventDetails)}`, '_blank');
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: `Event Registration: ${event.title}`,
            text: eventDetails,
            url: window.location.origin,
          });
        } else {
          navigator.clipboard.writeText(eventDetails);
          alert('Event details copied to clipboard!');
        }
    }
  };

  if (isLoading) {
    return (
      <div className="event-confirm loading">
        <div className="loading-spinner"></div>
        <p>Loading your confirmation...</p>
      </div>
    );
  }

  return (
    <div className="event-confirm">
      <div className="event-confirm-container">
        {/* Success Message */}
        <div className="event-confirm-success">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h1>You're registered successfully!</h1>
          <p>Thank you for supporting street dogs in our community.</p>
        </div>

        {/* Event Summary */}
        <div className="event-confirm-summary">
          <h2>Event Summary</h2>
          <div className="event-confirm-card">
            <div 
              className="event-confirm-image"
              style={{ 
                backgroundImage: `url(${event.image || "/default-event.png"})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
            <div className="event-confirm-details">
              <div className="event-confirm-badge event-confirm-badge-{event.type}">
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)} Event
              </div>
              <h3>{event.title}</h3>
              
              <div className="event-confirm-info">
                <div className="event-confirm-info-item">
                  <i className="fas fa-calendar-alt"></i>
                  <div>
                    <p className="event-confirm-info-label">Date & Time</p>
                    <p className="event-confirm-info-value">
                      {new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      <br />
                      {event.time}
                    </p>
                  </div>
                </div>
                
                <div className="event-confirm-info-item">
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <p className="event-confirm-info-label">Location</p>
                    <p className="event-confirm-info-value">{event.location}</p>
                    {event.locationLink && (
                      <a href={event.locationLink} target="_blank" rel="noopener noreferrer" className="event-confirm-map-link">
                        View on Map <i className="fas fa-external-link-alt"></i>
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="event-confirm-info-item">
                  <i className="fas fa-user"></i>
                  <div>
                    <p className="event-confirm-info-label">Registered by</p>
                    <p className="event-confirm-info-value">{registrationData.fullName}</p>
                    <p className="event-confirm-info-email">{registrationData.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Proof of Registration */}
        <div className="event-confirm-proof">
          <h2>Proof of Registration</h2>
          <div className="event-confirm-proof-content">
            <div className="event-confirm-id">
              <p className="event-confirm-id-label">Registration ID</p>
              <p className="event-confirm-id-value">{registrationData.id}</p>
            </div>
            
            <div className="event-confirm-qr">
             
              
            </div>
            
            <div className="event-confirm-email-notice">
              <i className="fas fa-envelope"></i>
              <p>A confirmation email has been sent to <strong>{registrationData.email}</strong></p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="event-confirm-actions">
          <button className="event-confirm-btn event-confirm-btn-primary" onClick={handleDownloadPDF}>
            <i className="fas fa-download"></i> Download Confirmation PDF
          </button>
          
          <div className="event-confirm-share">
            <p>Share this event:</p>
            <div className="event-confirm-share-buttons">
              <button 
                className="event-confirm-share-btn event-confirm-share-facebook "
                onClick={() => handleShareEvent('facebook')}
              ><FaFacebook size={40} color="#ffffff" />
                <i className="fab fa-facebook-f  "></i>
              </button>
              <button
  className="event-confirm-share-btn event-confirm-share-whatsapp"
  onClick={() => handleShareEvent('whatsapp')}
>
  <FaWhatsapp size={40} color="#ffffff" /> {/* ✅ Icon inside the button */}
  <i className="fab fa-whatsapp"></i>
</button>

              <button 
                className="event-confirm-share-btn event-confirm-share-email"
                onClick={() => handleShareEvent('twitter')}
              ><FaTwitter size={40} color="#ffffff" />
                <i className="fas fa-twitter"></i>
              </button>
              <button 
                className="event-confirm-share-btn event-confirm-share-generic"
                onClick={() => handleShareEvent()}
              ><FaTiktok size={40} color="#ffffff" />
                <i className="fas fa-share-alt"></i>
              </button>
            </div>
          </div>
          
          <Link to="/events" className="event-confirm-btn event-confirm-btn-secondary">
            <i className="fas fa-arrow-left"></i> Back to Events Page
          </Link>
        </div>

        {/* Extra Info */}
        <div className="event-confirm-extra">
          <h3>Next Steps & Important Information</h3>
          <ul>
            <li><i className="fas fa-clock"></i> Please arrive 15 minutes early for registration</li>
            <li><i className="fas fa-id-card"></i> Bring your ID for verification</li>
            <li><i className="fas fa-envelope-open"></i> Check your email for any updates or changes</li>
            <li><i className="fas fa-phone"></i> Contact us at <strong>+94 11 234 5678</strong> if you have questions</li>
            {event.type === "volunteer" && (
              <li><i className="fas fa-hands-helping"></i> Volunteer orientation will begin 30 minutes before the event</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EventConfirmation;