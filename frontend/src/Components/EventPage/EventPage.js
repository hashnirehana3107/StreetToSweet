import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./EventPage.css";

const EventPage = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch events from backend
    axios.get("http://localhost:3000/events")
      .then((res) => {
        const now = new Date();
        const upcoming = res.data.filter(e => new Date(e.date) >= now);
        const past = res.data.filter(e => new Date(e.date) < now);
        setUpcomingEvents(upcoming);
        setPastEvents(past);
      })
      .catch(err => console.error(err));
  }, []);

  const handleRegister = (eventId) => {
    navigate(`/event-registration/${eventId}`);
  };

  const filteredUpcoming = upcomingEvents.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="event-page">
      {/* Header */}
      <header className="event-header">
        <h1>🐾 Upcoming & Past Events</h1>
        <p>Join us in making a difference for street dogs!</p>
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />
      </header>

      {/* Upcoming Events */}
      <section className="upcoming-events">
        <h2>Upcoming Events</h2>
        <div className="events-grid">
          {filteredUpcoming.length > 0 ? filteredUpcoming.map(event => (
            <div key={event._id} className="event-card upcoming">
              <img src={event.image || "/default-event.png"} alt={event.title} />
              <h3>{event.title}</h3>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {event.time}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p className="description">{event.description}</p>
              <button className="register-btn" onClick={() => handleRegister(event._id)}>Register Now</button>
            </div>
          )) : <p>No upcoming events found.</p>}
        </div>
      </section>

      {/* Past Events */}
      <section className="past-events">
        <h2>Past Events</h2>
        <div className="events-grid">
          {pastEvents.length > 0 ? pastEvents.map(event => (
            <div key={event._id} className="event-card past">
              <img src={event.image || "/default-event.png"} alt={event.title} />
              <h3>{event.title}</h3>
              <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
              <p className="description">{event.description}</p>
              <p className="outcome">{event.outcome && `Outcome: ${event.outcome}`}</p>
            </div>
          )) : <p>No past events yet.</p>}
        </div>
      </section>
    </div>
  );
};

export default EventPage;
