import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../Footer/Footer";
import { ChevronLeft, ChevronRight, MapPin, CalendarDays, Plus } from "lucide-react";
import "./EventCalendar.css";

const EventCalendar = () => {
  const navigate = useNavigate();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [customEvent, setCustomEvent] = useState({
    title: "",
    date: "",
    location: "",
    type: "custom"
  });
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(today);

  // Load events from localStorage on component mount
  useEffect(() => {
    const loadEvents = () => {
      try {
        const savedEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
        setCalendarEvents(savedEvents);
      } catch (error) {
        console.error('Error loading events from storage:', error);
      }
    };
    
    loadEvents();
    
    // Also listen for storage events in case of changes from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'calendarEvents') {
        loadEvents();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  // Add custom event
  const addCustomEvent = () => {
    if (!customEvent.title || !customEvent.date) {
      alert("Please provide at least a title and date for your event.");
      return;
    }
    
    const newEvent = {
      id: `custom-${Date.now()}`,
      title: customEvent.title,
      date: customEvent.date,
      location: customEvent.location || "Not specified",
      type: "custom"
    };
    
    const updatedEvents = [...calendarEvents, newEvent];
    setCalendarEvents(updatedEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
    
    setCustomEvent({
      title: "",
      date: "",
      location: "",
      type: "custom"
    });
    setShowAddEventForm(false);
  };

  // Remove event from calendar
  const removeEvent = (eventId) => {
    const updatedEvents = calendarEvents.filter(event => event.id !== eventId);
    setCalendarEvents(updatedEvents);
    localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
  };

  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Generate calendar days
  const generateCalendar = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const calendar = [];
    let day = 1;
    
    // Create empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      calendar.push({ day: null, date: null });
    }
    
    // Fill in the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const dateEvents = getEventsForDate(date);
      calendar.push({ 
        day: i, 
        date: date,
        hasEvents: dateEvents.length > 0,
        events: dateEvents
      });
    }
    
    return calendar;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const calendarDays = generateCalendar();
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="calendar-page">
   
      
      <div className="calendar-container">
        <div className="calendar-header">
          <h1>My Event Calendar <CalendarDays size={36} /></h1>
          <p>Your personalized calendar of dog rescue events</p>
          
        
          
          
          
          <div className="calendar-navigation">
            <button onClick={prevMonth} className="nav-button">
              <ChevronLeft size={20} />
            </button>
            
            <h2>{monthNames[currentMonth]} {currentYear}</h2>
            
            <button onClick={nextMonth} className="nav-button">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        <div className="calendar-grid">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((dayObj, index) => {
            if (dayObj.day === null) {
              return <div key={index} className="calendar-day empty"></div>;
            }
            
            const isToday = dayObj.date.getDate() === today.getDate() && 
                            dayObj.date.getMonth() === today.getMonth() && 
                            dayObj.date.getFullYear() === today.getFullYear();
            
            const isSelected = dayObj.date.getDate() === selectedDate.getDate() && 
                              dayObj.date.getMonth() === selectedDate.getMonth() && 
                              dayObj.date.getFullYear() === selectedDate.getFullYear();
            
            return (
              <div 
                key={index} 
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${dayObj.hasEvents ? 'has-events' : ''}`}
                onClick={() => setSelectedDate(dayObj.date)}
              >
                <span className="day-number">{dayObj.day}</span>
                {dayObj.hasEvents && (
                  <div className="event-indicator">
                    {dayObj.events.length}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="events-panel">
          <h3>Events on {selectedDate.toDateString()}</h3>
          
          {selectedDateEvents.length > 0 ? (
            <div className="events-list">
              {selectedDateEvents.map((event, index) => (
                <div key={index} className="event-item">
                  <h4>{event.title}</h4>
                  <p><MapPin size={16} /> {event.location}</p>
                  <p className={`event-type ${event.type}`}>{event.type}</p>
                  
                  <div className="event-actions">
                    {event.type !== 'custom' && (
                      <button 
                        onClick={() => navigate(`/eventregistration/${event.id}`)}
                        className="register-btn"
                      >
                        Register Now
                      </button>
                    )}
                    <button 
                      onClick={() => removeEvent(event.id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">No events scheduled for this date</p>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default EventCalendar;