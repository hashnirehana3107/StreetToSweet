import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import axios from "axios";
import event1 from "../../assets/event1.jpg";
import event2 from "../../assets/event2.jpg";
import event3 from "../../assets/event3.jpg";
import past1 from "../../assets/past1.jpg";
import past2 from "../../assets/past2.jpg";
import past3 from "../../assets/past3.jpg";
import "./Events.css";

import { HandHeart, PawPrint, HandCoins, Facebook, Instagram, Twitter, CalendarDays, CalendarPlus, CalendarSearch, Dog, Syringe, Megaphone, MapPinOff, MapPin } from "lucide-react";
import { FaQuestion } from "react-icons/fa";


// Fallback local art if backend doesn't provide a photo
const fallbackImages = [event1, event2, event3];

const pastEvents = [
  {
    img: past1,
    caption: "12 dogs found homes at our last Adoption Drive 🏡🐶",
    badge: "🐶 25 Dogs Adopted",
    quote: "“Adopting Bruno was the best decision for our family!” – Volunteer",
  },
  {
    img: past2,
    caption: "Vaccination camp helped 50 street dogs 💉🐾",
    badge: "❤️ 50 Rescues Treated",
    quote: "“Seeing rescued dogs recover gave me hope.” – Shelter Vet",
  },
  {
    img: past3,
    caption: "Volunteers participated in Awareness Walk 💚🐶",
    badge: "👥 200+ People Joined",
    quote:
      "“It felt amazing to spread awareness and see so much love for animals.” – Participant",
  },
];

const involvementOptions = [
  {
    title: "Volunteer",
    desc: "Join our rescue teams, help in shelters, and make a real impact in the lives of street dogs.",
    icon: <HandHeart className="involve-icon" />,
  },
  {
    title: "Foster / Adopt",
    desc: "Give a dog a loving temporary or permanent home. Every paw matters 🐾.",
    icon: <PawPrint className="involve-icon" />,
  },
  {
    title: "Donate",
    desc: "Support medical care, food, and rescue operations with your kind contributions.",
    icon: <HandCoins className="involve-icon" />,
  },
];

const events = [
  {
    title: "Adoption Drive",
    date: "2025-09-05",
    type: "adoption", // 🟢
    desc: "Find your forever friend at our community adoption drive.",
    location: "Colombo City Park",
  },
  {
    title: "Free Vaccination Camp",
    date: "2025-09-12",
    type: "vaccination", // 🔵
    desc: "Join us for a free rabies and distemper vaccination program.",
    location: "Kandy Town Hall",
  },
  {
    title: "Fundraising Gala",
    date: "2025-09-20",
    type: "fundraising", // 🟡
    desc: "Support rescue and shelter expansion through our annual gala.",
    location: "Colombo Hilton Ballroom",
  },
];

const eventReasons = [
    { icon: <Dog size={40} color="#116282ff"/> , title: "Adoption Drives", desc: "Find loving homes for rescued dogs." },
    { icon: <Syringe size={40} color="#116282ff"/>, title: "Vaccination Camps", desc: "Protect street dogs from deadly diseases." },
    { icon: <Megaphone size={40} color="#116282ff"/>, title: "Awareness Walks", desc: "Educate people about kindness & responsibility." },
    { icon: <CalendarDays size={40} color="#116282ff"/>, title: "Fundraising Events", desc: "Support food, medicine, and shelter needs." },
  ];


const Events = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Fetch upcoming events from backend and start countdown on nearest
  useEffect(() => {
    let timer;
    const load = async () => {
      try {
        const res = await axios.get('/events/upcoming');
        const list = (res.data?.data?.events || []).map((e, i) => ({
          id: e._id,
          title: e.title,
          date: e.date ? e.date.split('T')[0] : '',
          location: e.location,
          type: (e.eventType || 'Other'),
          description: e.description || '',
          spots: Math.max(0, (e.maxVolunteers || 0) - (e.registeredVolunteers?.length || 0)),
          img: (e.photos && e.photos[0]) ? (e.photos[0].startsWith('http') ? e.photos[0] : `http://localhost:3000${e.photos[0]}`) : fallbackImages[i % fallbackImages.length]
        }));
        setUpcomingEvents(list);
        // setup countdown to nearest
        if (list.length > 0) {
          const nearest = list[0];
          timer = setInterval(() => {
            const eventDate = new Date(nearest.date).getTime();
            const now = new Date().getTime();
            const distance = eventDate - now;
            if (distance < 0) {
              clearInterval(timer);
              setTimeLeft({});
            } else {
              const days = Math.floor(distance / (1000 * 60 * 60 * 24));
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              setTimeLeft({ days, hours, minutes });
            }
          }, 1000);
        }
      } catch (err) {
        console.error('Failed to load upcoming events', err);
      }
    };
    load();
    return () => timer && clearInterval(timer);
  }, []);

  const filteredEvents = upcomingEvents.filter(
    (event) =>
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === "All" || event.type === filterType)
  );

  const addToCalendar = (event) => {
  try {
    // Get existing calendar events from localStorage
    const existingEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
    
    // Check if event is already in calendar
    const isAlreadyAdded = existingEvents.some(e => e.id === event.id);
    
    if (!isAlreadyAdded) {
      // Add new event to calendar
      const updatedEvents = [...existingEvents, event];
      localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
      
      // Show success message
      alert(`"${event.title}" has been added to your calendar!`);
    } else {
      alert(`"${event.title}" is already in your calendar.`);
    }
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    alert('Failed to add event to calendar. Please try again.');
  }
};

  // Helper: generate Google Calendar link
const generateGoogleCalendarLink = (event) => {
  const start = event.date.replace(/-/g, "");
  const end = event.date.replace(/-/g, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.title
  )}&dates=${start}/${end}&details=${encodeURIComponent(
    event.desc
  )}&location=${encodeURIComponent(event.location)}`;
};

  return (
    <div>
      
<div className="event-container"></div>
      {/* Hero Section */}
      <div className="event-hero">
        <div className="event-hero-content">
          <h1 className="event-hero-title">Join Our Events, Save More Lives Home <CalendarSearch size={40}/></h1>
          <p className="event-hero-subtext">
            Together, we can turn stray paws into joyful moments.
          </p>
          <div className="event-hero-buttons">
            <button
              className="event-btn-primary"
            onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}>
            
              Join Our Events
            </button>

<button
            className="event-btn-secondary"
            onClick={() => navigate("/eventlisting")}>
             See Our Shelter Events
          </button>
            
          </div>
        </div>
     

        {/* Floating Paws */}
        <div className="floating-paws">
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className="paw"
              style={{
                left: `${Math.random() * 90}%`,
                fontSize: `${1.5 + Math.random() * 1.5}rem`,
                animationDelay: `${Math.random() * 8}s`,
                opacity: 0.1 + Math.random() * 0.3,
              }}
            >
              🐾
            </span>
          ))}
        </div>
      </div>

      {/* Countdown */}
      {timeLeft.days !== undefined && (
        <div className="countdown">
          <p>
            Nearest Event Starts In: {timeLeft.days}d {timeLeft.hours}h{" "}
            {timeLeft.minutes}m
          </p>
        </div>
      )}

      {/* Why Events */}
    <section className="why-events">
      <div className="why-events-header">
        <br></br><br></br>
        <h2>Why Our Events Matter <FaQuestion size={40}/></h2>
        <p>
          Our events are more than gatherings – they are lifelines for street dogs. 
          Adoption drives give dogs a chance at forever homes, vaccination camps keep 
          them safe and healthy, and awareness programs help build a compassionate community.
        </p>
      </div>

      <div className="why-events-grid">
        {eventReasons.map((event, idx) => (
          <div className="event-card" key={idx}>
            <div className="event-icon">{event.icon}</div>
            <h3>{event.title}</h3>
            <p>{event.desc}</p>
           
          </div>
          
        ))}
      </div>
       <br></br><br></br><br></br>
    </section>


      {/* Upcoming Events */}
      <div className="events-section" id="events-section">
        <br></br>
        <h2> Upcoming Events <CalendarDays size={40} /> </h2>
        <p>Join us in our upcoming events where we bring the community together to rescue, care for, and rehome street dogs. Every event is a step toward giving them a safer, happier life. </p>

        {/* Event Cards */}
        <div className="events-container">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-img-container">
                <img src={event.img} alt={event.title} className="event-img" />
                <span className={`event-type ${event.type.toLowerCase()}`}>
                  {event.type}
                </span>
              </div>

              <div className="event-info">
                <h3>{event.title}</h3>
                <p className="event-date"><CalendarDays size={20}/>  {event.date}</p>
                <p className="event-location"><MapPin size={20}/> {event.location}</p>
                <p className="event-spots"><Megaphone size={20}/> Spots Left: {event.spots}</p>
                {/* <p className="event-description">{event.description}</p> */}

                <div className="event-buttons">
            <button onClick={() => navigate(`/eventregistration/${event.id}`)}>
                     Register Now
                  </button>

                  
                  
                </div>
                <br></br>

                <button
  className="add-calendar-btn"
  onClick={(e) => {
    e.stopPropagation(); // Prevent event card click from triggering
    addToCalendar(event);
    navigate("/eventcalendar");
  }}
>
  <CalendarPlus size={18} /> Add to Calendar
</button>

              </div>
            </div>
          ))}
        </div>
        <br></br><br></br><br></br>
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedEvent.img} alt={selectedEvent.title} />
            <h2>{selectedEvent.title}</h2>
            <p>📅 {selectedEvent.date}</p>
            <p>📍 {selectedEvent.location}</p>
            <p>{selectedEvent.description}</p>
            <button onClick={() => navigate(`/eventregistration/${selectedEvent.id}`)}>
              Register Now
            </button>
            <button onClick={() => setSelectedEvent(null)}>Close</button>
          </div>
        </div>
      )}

       <div className="past--events">
  <h2>Past Events & Success Stories</h2><br></br>
  <p>Celebrate the milestones we've achieved together through our past events and success stories. From heartwarming adoptions to life-saving rescues, every story reflects our community’s compassion and commitment to transforming the lives of street dogs.</p>
  <div className="past-carousel">
    {pastEvents.map((past, index) => (
      <div key={index} className="past-card">
        <span className="impact-badge">🐶 {past.badge}</span>
        <img src={past.img} alt={`Past Event ${index + 1}`} />
        <div className="past-caption">{past.caption}</div>
        <p className="testimonial">“{past.quote}”</p>
      </div>
    ))}
  </div>
</div>


    
<div className="involved-section">
      <h2>How You Can Get Involved</h2>
      <div className="involved-cards">
        {involvementOptions.map((option, index) => (
          <div key={index} className="involve-card">
            <div className="icon-wrapper">{option.icon}</div>
            <h3>{option.title}</h3>
            <p>{option.desc}</p>

            {/* Social Share */}
            <div className="share-buttons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <Facebook />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <Instagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <Twitter />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>


      <Footer />
    </div>
  );
};

export default Events;
