import React, { useState } from "react";
import "./EventDetails.css";

const EventDetails = () => {
  const [activeTab, setActiveTab] = useState("details");

  // Mock events data
  const event = {
    title: "Dog Awareness Walk",
    description: "Join us for a community walk to raise awareness about street dogs in our city. We'll be walking through downtown areas, distributing informational pamphlets, and engaging with the public about responsible pet ownership and the importance of sterilizing street dogs. This event aims to educate the community and reduce the stigma around street dogs while promoting adoption and responsible care.",
    date: "2023-10-15",
    time: "09:00 AM - 12:00 PM",
    location: "Independence Square, Colombo",
    locationLink: "https://goo.gl/maps/example",
    organizer: "Paws for Hope",
    image: "/dog-awareness-walk.jpg",
    type: "awareness",
    status: "upcoming",
    activities: ["Awareness walk", "Educational booths", "Pamphlet distribution", "Q&A session"],
    audience: "Families, animal lovers, students, community members",
    requirements: "Comfortable walking shoes, water bottle, sun protection",
    contact: "contact@pawsforhope.org | +94 77 123 4567",
    volunteers: ["John D.", "Sarah M.", "Robert P.", "Lisa K."],
    gallery: ["/event-gallery-1.jpg", "/event-gallery-2.jpg", "/event-gallery-3.jpg"]
  };

  const handleShareEvent = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Event link copied to clipboard!');
  };

  return (
    <div className="event-details-page">
      {/* Event Banner */}
      <div className="event-banner">
        <div 
          className="event-banner-image"
          style={{ 
            backgroundImage: `url(${event.image || "/default-event.png"})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        <div className="event-banner-overlay">
          <div className="event-header">
            <div className="event-tags">
              <span className={`event-type event-type-${event.type}`}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
              </span>
              <span className={`event-status event-status-${event.status}`}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </span>
            </div>
            <h1>{event.title}</h1>
            <p className="event-organizer">Organized by {event.organizer}</p>
          </div>
        </div>
      </div>

      <div className="event-content-container">
        {/* Event Summary */}
        <div className="event-summary">
          <div className="summary-item">
            <i className="fas fa-calendar-alt"></i>
            <div>
              <h4>Date & Time</h4>
              <p>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p>{event.time}</p>
            </div>
          </div>
          
          <div className="summary-item">
            <i className="fas fa-map-marker-alt"></i>
            <div>
              <h4>Location</h4>
              <p>{event.location}</p>
              {event.locationLink && (
                <a href={event.locationLink} target="_blank" rel="noopener noreferrer" className="map-link">
                  View on Map
                </a>
              )}
            </div>
          </div>
          
          <div className="summary-item">
            <i className="fas fa-users"></i>
            <div>
              <h4>Organizer</h4>
              <p>{event.organizer}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="event-actions">
          <button className="btn-primary">
            Register Now
          </button>
          <button className="btn-secondary">
            Add to Calendar
          </button>
          <button className="btn-share" onClick={handleShareEvent}>
            Share Event
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="event-tabs">
          <button 
            className={activeTab === "details" ? "tab-active" : ""}
            onClick={() => setActiveTab("details")}
          >
            Details
          </button>
          <button 
            className={activeTab === "gallery" ? "tab-active" : ""}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery
          </button>
          <button 
            className={activeTab === "volunteers" ? "tab-active" : ""}
            onClick={() => setActiveTab("volunteers")}
          >
            Volunteers
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "details" && (
            <div className="tab-pane">
              <h2>About This Event</h2>
              <p>{event.description}</p>
            </div>
          )}

          {activeTab === "gallery" && (
            <div className="tab-pane">
              <h2>Event Gallery</h2>
              <div className="event-gallery">
                {event.gallery.map((img, index) => (
                  <div key={index} className="gallery-item">
                    <div className="gallery-image" style={{ backgroundImage: `url(${img})` }}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "volunteers" && (
            <div className="tab-pane">
              <h2>Our Volunteers</h2>
              <div className="volunteers-list">
                {event.volunteers.map((volunteer, index) => (
                  <div key={index} className="volunteer-card">
                    <div className="volunteer-avatar">{volunteer.charAt(0)}</div>
                    <div className="volunteer-info">
                      <h4>{volunteer}</h4>
                      <p>Animal Welfare Volunteer</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
