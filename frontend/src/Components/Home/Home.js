import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import Footer from "../Footer/Footer";
import axios from "axios";
import DogCard from "../DogCard/DogCard";  
import { useNavigate } from "react-router-dom";
import {
  Ambulance,
  Activity,
  Dog,
  HeartHandshake,
  HeartPulse,
  Smartphone,
  Stethoscope,
  House,
  CalendarDays,
  Megaphone,
  MapPin,
  Search,
  DogIcon,
  Calendar,
  HeartPlus,
  CalendarPlus,
  UserPlus,
  HandCoins
} from "lucide-react";

import walkImg from "../../assets/walk.jpg";
import feedImg from "../../assets/feed.jpg";
import cleanImg from "../../assets/clean.jpg";
import rescueImg from "../../assets/rescue.jpg";

import qr from "../../assets/qr.jpg";

import bg1 from "../../assets/bg1.jpg";
import bg2 from "../../assets/bg2.jpg";
import bg3 from "../../assets/bg3.png";
import bg4 from "../../assets/bg4.jpg";
import { FaArrowRight } from "react-icons/fa";

import lostdog from "../../assets/lostdog.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [spotlightDogs, setSpotlightDogs] = useState([]);
  // --- Hero images ---
  const images = [bg1, bg2, bg3, bg4];
  const [bgIndex, setBgIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [openChat, setOpenChat] = useState(false);
  const [selectedDog, setSelectedDog] = useState(null); // Added for modal
  const [upcomingEvents, setUpcomingEvents] = useState([]); // Added for events
  
  // AI Assistant State - Client Side Only
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I'm your StreetToSweet assistant. How can I help you today? ", 
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatBodyRef = useRef(null);

  // Predefined Q&A for the AI assistant
  const predefinedQA = {
    // Adoption related
    "how to adopt a dog": "To adopt a dog, visit our Adoption page, browse available dogs, fill out the adoption form, and our team will contact you for a screening process. We ensure all dogs are vaccinated, spayed/neutered, and ready for their forever homes! 🏠",
    "adoption process": "Our adoption process includes: 1. Browse available dogs 2. Submit adoption application 3. Virtual/home visit 4. Meet & greet with the dog 5. Final adoption approval and paperwork 6. Take your new friend home! 📝",
    "adoption fees": "Adoption fees range from Rs. 5000-15000 depending on the dog's medical needs. This includes all vaccinations, spay/neuter surgery, microchipping, and 30 days of free vet consultation. 💰",
    
    // Rescue related
    "how to report a stray dog": "Click 'Report Now' in the Rescue section or visit the Report Stray page. Provide the exact location, dog's description, condition, and photos if possible. Our rescue team responds within 24 hours. 🚨",
    "emergency rescue": "For emergency rescue of injured/stray dogs, call our 24/7 hotline: +94 77 123 4568. Provide exact location, dog's condition, and your contact information immediately. 📞",
    
    // Volunteer related
    "volunteer opportunities": "We need volunteers for: feeding, dog walking, kennel cleaning, rescue operations, event coordination, and administrative tasks. Register through our Volunteer page and attend orientation. 🤝",
    "how to volunteer": "Visit our Volunteer section, fill out the registration form, and attend an orientation session. We'll match you with opportunities based on your skills and availability! 🌟",
    
    // Donation related
    "how to donate": "You can donate: Online via our website, QR code scanning, bank transfer, or in-person at our shelter. All donations go directly toward food, shelter maintenance, and medical care. 💝",
    "donation methods": "We accept: Online payments, bank transfers (Account: StreetToSweet, Bank: Commercial Bank), QR code payments, and cash donations at our shelter locations. 🏦",
    
    // Medical care
    "medical care for dogs": "All rescued dogs receive: complete vaccinations, spay/neuter surgery, deworming, flea/tick treatment, and any necessary emergency medical care. Regular health check-ups ensure they're adoption-ready! 🏥",
    
    // Lost & Found
    "lost and found pets": "Report lost or found pets on our Lost & Found page. Include photos, location, distinguishing features, and contact info. We share these on social media and our community network. 🔍",
    "found a dog": "If you found a dog, please report it on our Lost & Found page with photos and location details. This helps reunite lost pets with their families quickly! 🐕",
    
    // Events
    "event information": "Check our Events section for: Adoption drives every weekend, monthly fundraising events, volunteer training workshops, and community awareness programs. Follow us on social media for updates! 📅",
    "upcoming events": "We have regular adoption drives, fundraising events, and awareness workshops. Check the Events section on our website for the latest schedule and locations! 🎉",
    
    // Contact
    "contact information": "Email: help@streettosweet.org | Phone: +94 77 123 4567 | Address: 123 Dog Lane, Colombo | Emergency Rescue: +94 77 123 4568 (24/7) 📧",
    "how to contact": "You can reach us via email at help@streettosweet.org, call +94 77 123 4567 during office hours, or use our emergency hotline +94 77 123 4568 for urgent rescues. 📞",
    
    // General
    "what is streettosweet": "StreetToSweet is a community-driven platform that rescues stray dogs, provides medical care, and finds them loving forever homes through adoption. We also coordinate volunteers and community awareness programs. 🌟",
    "about streettosweet": "We're a dedicated team working to transform the lives of street dogs through rescue, medical care, adoption services, and community education. Our mission is safe homes for every street dog! 🐾",
    
    // Foster program
    "foster program": "Our foster program provides temporary care for dogs needing special attention. Requirements: secure home, time for care, and transportation for vet visits. Apply through Volunteer section. 🏡",
    
    // Training
    "dog training": "We provide basic obedience training for all adopted dogs and offer post-adoption training support. We also conduct monthly training workshops for adopters. 🎓",
    
    // Surrender
    "surrender a dog": "If you need to surrender a dog, contact us first for counseling. If unavoidable, we accept surrenders by appointment with complete medical history and behavioral information. 💔"
  };

  // Fallback responses for unmatched questions
  const fallbackResponses = [
    "I'd love to help you with that! For specific questions about our services, please contact us directly at help@streettosweet.org or call +94 77 123 4567.",
    "That's a great question! Our team would be happy to assist you directly. You can reach us at help@streettosweet.org or visit our Contact page.",
    "I'm still learning about all aspects of our services. For detailed information, please contact our support team at help@streettosweet.org or call +94 77 123 4567.",
    "Thank you for your question! For the most accurate and detailed response, I recommend contacting our team directly at help@streettosweet.org.",
    "I want to make sure you get the best help possible. Please reach out to our team at help@streettosweet.org for personalized assistance with this matter."
  ];

  // --- Typing animation for hero title ---
  useEffect(() => {
    const text = "StreetToSweet 🐕";
    let i = 0;
    let deleting = false;

    const typingInterval = setInterval(() => {
      if (!deleting) {
        setTypedText(text.slice(0, i + 1));
        i++;
        if (i === text.length) {
          setTimeout(() => {
            deleting = true;
          }, 1000); // pause before deleting
        }
      } else {
        setTypedText(text.slice(0, i - 1));
        i--;
        if (i === 0) {
          deleting = false;
        }
      }
    }, 150);

    return () => clearInterval(typingInterval);
  }, []);

  // Initialize suggested questions
  useEffect(() => {
    setSuggestedQuestions([
      "How to adopt a dog?",
      "What is the adoption process?",
      "How to report a stray dog?",
      "What volunteer opportunities are available?",
      "How can I donate?",
      "What medical care do dogs receive?",
      "How does lost and found work?",
      "When are the next events?",
      "How to contact the shelter?",
      "Do you have a foster program?"
    ]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Auto-scroll hero images ---
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(slideInterval);
  }, [images.length]);

  useEffect(() => {
    fetch("http://localhost:3000/dogs")
      .then(res => res.json())
      .then(data => {
        const updated = data.map(d => ({
          ...d,
          photo: d.photo ? `http://localhost:3000/uploads/dogs/${d.photo}` : "/placeholder.jpg"
        }));
        const adoptionDogs = updated.filter(d => d.status === "adoption");
        setSpotlightDogs(adoptionDogs.slice(0, 4));
      })
      .catch(console.error);
  }, []);

  // Fetch upcoming events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('http://localhost:3000/events/upcoming');
        const data = await res.json();
        const events = (data?.data?.events || []).map((e, i) => ({
          id: e._id,
          title: e.title,
          date: e.date ? e.date.split('T')[0] : '',
          location: e.location,
          type: (e.eventType || 'Other'),
          description: e.description || '',
          spots: Math.max(0, (e.maxVolunteers || 0) - (e.registeredVolunteers?.length || 0)),
          img: (e.photos && e.photos[0]) ? (e.photos[0].startsWith('http') ? e.photos[0] : `http://localhost:3000${e.photos[0]}`) : "https://placedog.net/400/250"
        }));
        setUpcomingEvents(events);
      } catch (err) {
        console.error('Failed to load upcoming events', err);
      }
    };
    fetchEvents();
  }, []);

  // Client-side AI response handler
  const getAIResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase().trim();
    const cleanMessage = lowerMessage.replace(/[?!.,]/g, '');
    
    // Direct match
    let response = predefinedQA[cleanMessage];
    
    // Fuzzy match for similar questions
    if (!response) {
      for (const [key, value] of Object.entries(predefinedQA)) {
        if (cleanMessage.includes(key) || key.includes(cleanMessage)) {
          response = value;
          break;
        }
      }
    }
    
    // If no match found, use fallback response
    if (!response) {
      const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
      response = fallbackResponses[randomIndex];
    }
    
    return response;
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const aiResponse = getAIResponse(input);
      
      const botMessage = {
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
        isPredefined: true // All responses are predefined in this client-side version
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 1000); // 1 second delay to simulate thinking
  };

  const handleSuggestionClick = (question) => {
    setInput(question);
    // Auto-send after a brief delay
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const cards = [
    {
      icon: <Ambulance size={36} />,
      title: "Rescue",
      desc: "24/7 emergency response to save stray dogs in need.",
      color: "#FF6B6B",
    },
    {
      icon: <Activity size={36} />,
      title: "Care",
      desc: "Providing medical treatment, food, and safe shelter.",
      color: "#4ECDC4",
    },
    {
      icon: <Dog size={36} />,
      title: "Adopt",
      desc: "Helping families connect with their future furry friends.",
      color: "#556270",
    },
    {
      icon: <HeartHandshake size={36} />,
      title: "Love",
      desc: "Every adoption leads to a lifelong bond of love.",
      color: "#FFB347",
    },
  ];

  const roles = [
    {
      img: feedImg,
      title: "Feeding",
      desc: "Help provide meals and hydration to rescued dogs daily.",
    },
    {
      img: walkImg,
      title: "Walking",
      desc: "Take dogs for walks to keep them active, happy, and healthy.",
    },
    {
      img: cleanImg,
      title: "Cleaning",
      desc: "Assist with keeping kennels and play areas neat and hygienic.",
    },
    {
      img: rescueImg,
      title: "Rescue",
      desc: "Join our emergency response team to save injured street dogs.",
    },
  ];

  return (
    <div className="home">
      {/* 1️⃣ Hero / Carousel */}
      <section id="carousel-container">
        <div
          id="carousel"
          style={{ transform: `translateX(-${bgIndex * 100}vw)` }}
        >
          {images.map((img, idx) => (
            <div className="carousel-item" key={idx}>
              <img src={img} alt={`Rescued Dog ${idx + 1}`} />
            </div>
          ))}
        </div>

        <div id="carousel-overlay-center">
          <h1 className="typing-text">{typedText}</h1>
          <h3> One Platform, One Mission: Safe Homes for Every Street Dog</h3>
          <div className="carousel-buttons">
            <button
              className="btn-modern-btn"
              onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
            >
              Get Started 🢃
            </button>
            <button
              className="btn-modern-btn"
              onClick={() => navigate("/adoption")}
            >
              Adopt a Dog 🢂
            </button>
          </div>
        </div>
      </section>

      {/* --- About Section --- */}
      <section className="about">
        <div className="about-header">
          <h2>
            About <span>StreetToSweet</span>
          </h2>
          <p>
            StreetToSweet is a{" "}
            <strong>community-driven shelter management system</strong> built to
            transform the lives of stray dogs. From rescue to adoption, our
            platform ensures proper care, shelter, and community awareness.
          </p>
          <p>
            Our system provides real-time stray reporting, adoption listings,
            donation management, and volunteer coordination - making rescue and
            rehoming easier and impactful.
          </p>
        </div>

        <div className="ab-timeline-cards">
          {cards.map((card, index) => (
            <div className="ab-timeline-card" key={index}>
              <div className="ab-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Rescue / Emergency Section --- */}
      <section className="rescue-section">
        <h2 className="rescue-header">Report a Stray Dog 🚨</h2>

        <div className="rescue-content">
          <HeartPulse className="heart-pulse" size={150} />

          <p className="rescue-description">
            Found an injured or abandoned dog? Help us save lives immediately by
            reporting. Our rescue team responds 24/7 to ensure every stray dog
            gets the care it deserves.
          </p>

          {/* How it works infographic */}
          <div className="rescue-infographic">
            <div className="step">
              {" "}
              <Smartphone size={100} /> <br />
              Report
            </div>
            <div className="arrow">
              <FaArrowRight size={50} />
            </div>
            <div className="step">
              <Ambulance size={100} /> <br />
              Rescue
            </div>
            <div className="arrow">
              <FaArrowRight size={50} />
            </div>
            <div className="step">
              <Stethoscope size={100} /> <br />
              Medical Care
            </div>
            <div className="arrow">
              <FaArrowRight size={50} />
            </div>
            <div className="step">
              <House size={100} /> <br />
              Adoption
            </div>
          </div>
          <button
            className="btn emergency-btn"
            onClick={() => {
              window.scrollTo({ top: 100, behavior: "smooth" });
              navigate("/reportStray");
            }}
          >
            Report Now
          </button>
        </div>
      </section>

      {/* --- Adoption Spotlight --- */}
      <section className="spotlight">
        <h2>Adoption Spotlight <Dog size={50} color="#6f2b83ff" /></h2>
        {/* QR Code → navigate to DonationPay.js */}
            <div className="qr-container-i">
              <p>Scan to See Available Dogs ❤</p>
              <img
                src={qr}
                alt="QR Code"
                style={{ cursor: "pointer" }}

                
              />
            </div><br></br>
        <p className="section-desc"> Give rescued dogs a loving home. Explore some of our adorable dogs below! </p>
        <h3>If you want to browse more dogs, click here.</h3> 
        <button className="btn adopt" onClick={() => { 
          window.scrollTo({ top: 100, behavior: "smooth" }); 
          navigate("/adoptdogspage"); 
        }}> 
          See All Dogs 
        </button> 
        <br/><br/><br/><br/><br/>
        
        <div className="dog-grid">
          {spotlightDogs.length > 0 ? (
            spotlightDogs.map(dog => (
              <DogCard
                key={dog._id}
                dog={dog}
                isFavorite={false}
                onFavToggle={() => {}}
                onSeeDetails={() => setSelectedDog(dog)}
                onAdopt={() => navigate("/adoptionrequest", { state: { dog } })}
              />
            ))
          ) : (
            <p>No adoption-ready dogs available right now.</p>
          )}
        </div>

        <br/>
        {/* --- Small Sub-section for Adoption Journey --- */}
        <div className="adoption-journey">
          <p>Already adopted a dog? Track your journey here!</p><br/>
          <button
            className="btn dashboard"
            onClick={() => navigate("/adoptionDashboard")}
          >
            My Adoption Dashboard
          </button>
        </div>
      </section>

      <section className="lostfound-section">
        <h2>
          Lost or Found a Pet?  <Search size={40} color="#3e3e3eff"/>
        </h2>

        <div className="lostfound-row">
          {/* Left: Image */}
          <div className="lostfound-illustration">
            <img src={lostdog} alt="Lost Dog Illustration"/>
          </div>

          {/* Right: Text + Button */}
          <div className="lostfound-content">
            <p>
              Every lost pet deserves a chance to be found. Use our Lost &amp;
              Found platform to report missing dogs, share information about
              pets you've rescued, or browse community posts.
            </p>
            <p>
              Together, we can help families reunite with their beloved companions.
            </p>
            <button
              className="btn view"
              onClick={() => {
                window.scrollTo({ top: 100, behavior: "smooth" });
                navigate("/lostfound");
              }}
            >
              Report/Found Dog <FaArrowRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <br/>
      <section className="home-volunteer-section">
        <h2>
          Not ready to adopt? <DogIcon size={40} color="#190958ff"/> <br />
          <span className="highlight">Be a hero, become a volunteer!</span>
        </h2>

        <div className="home-volunteer-cards">
          {roles.map((role, index) => (
            <div key={index} className="home-volunteer-card">
              <div className="img-box">
                <img src={role.img} alt={role.title} />
                <div className="overlay"></div>
              </div>
              <h3>{role.title}</h3>
              <p>{role.desc}</p>
            </div>
          ))}
        </div>

        <button className="vcta-btn" onClick={() => {
          window.scrollTo({ top: 40, behavior: "smooth" });
          navigate("/volunteerregister");
        }}>
          Register as Volunteer
        </button>
      </section>

      {/* --- Upcoming Events Section (Updated) --- */}
      <section className="events-section">
        <div className="events-header">
          <h2 className="events-title">
            <br/>
            Upcoming Events <Calendar size={40} />
          </h2>
          <p>Be part of our mission — together we make tails wag! 🐾</p>
        </div>

        <div className="events-container">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-img-container">
                  <img src={event.img} alt={event.title} className="event-img" />
                  <span className={`event-type ${event.type.toLowerCase()}`}>
                    {event.type}
                  </span>
                </div>

                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p className="event-date"><CalendarDays size={20}/> {event.date}</p>
                  <p className="event-location"><MapPin size={20}/> {event.location}</p>
                  <p className="event-spots"><Megaphone size={20}/> Spots Left: {event.spots}</p>
                  
                  <div className="event-buttons">
                    <button 
                      className="btn register-btn"
                      onClick={() => navigate(`/eventregistration/${event.id}`)}
                    >
                      <UserPlus size={18} /> Register Now
                    </button>
                   
                    <button 
                      className="btn calendar-btn"
                      onClick={() => {
                        // Add to calendar logic
                        const existingEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
                        const isAlreadyAdded = existingEvents.some(e => e.id === event.id);
                        
                        if (!isAlreadyAdded) {
                          const updatedEvents = [...existingEvents, event];
                          localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
                          alert(`"${event.title}" has been added to your calendar!`);
                        } else {
                          alert(`"${event.title}" is already in your calendar.`);
                        }
                        navigate("/eventcalendar");
                      }}
                    >
                      <CalendarPlus size={18} /> Add to Calendar
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events">
              <p>No upcoming events at the moment. Check back soon!</p>
            </div>
          )}
        </div>

        <div className="events-footer">
          <p>Don't miss out on our exciting events!</p>
          <button
            className="btn all-events"
            onClick={() => {
              window.scrollTo({ top: 100, behavior: "smooth" });
              navigate("/events");
            }}
          >
            View All Events 🢂
          </button>
        </div>
        <br/>
      </section>

      <section className="donation-section">
        {/* Floating paw background */}
        <div className="paw-bg">
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
          <span>🐾</span>
        </div>

        {/* Header centered at top */}
        <h2 className="donation-title">
          Every Paw Needs Your Support <HeartPlus size={40} color="#0d3c23ff"/>
        </h2>

        {/* Row: Left Image, Right Content */}
        <div className="donation-container">
          {/* Left Image */}
          <div className="donation-image">
            <img
              src="https://thumbs.dreamstime.com/b/donation-dog-chihuahua-can-collecting-money-charity-isolated-white-background-46887219.jpg"
              alt="Cute Dog"
            />
          </div>

          {/* Right Content */}
          <div className="donation-content"><br></br>
            <p className="donation-desc">
              Your donations fund rescues, food, medicine, and shelter for
              street dogs. Every contribution saves lives! Let's make tails wag together.
            </p>
<br></br>
            {/* Predefined Amounts */}
            <div className="donation-amounts">
              <button className="amount-btn">Rs. 500</button>
              <button className="amount-btn">Rs. 1000</button>
              <button className="amount-btn">Rs. 2500</button>
              <button className="amount-btn custom">Custom</button>
            </div>
<br></br>
            {/* Progress Bar */}
            <div className="progress-container">
              <p>This month's goal: <strong>75% reached!</strong></p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "75%" }}></div>
              </div>
            </div>
<br></br>
            {/* Donate Button */}
            <button
              className="btn donate"
              onClick={() => {
                window.scrollTo({ top: 1100, behavior: "smooth" });
                navigate("/donate");
              }}
            >
              <HandCoins size={40} color="#ffffffff"/> Donate Now
            </button>

         
          </div>
        </div>
      </section>

      {/* Dog Details Modal */}
      {selectedDog && (
        <div className="modal">
          <div className="modal-panel">
            <button className="modal-close" onClick={() => setSelectedDog(null)}>✕</button>
            <div className="modal-grid">
              <div className="modal-image">
                <img src={selectedDog.photo} alt={selectedDog.name} />
              </div>
              <div className="modal-info">
                <h3>{selectedDog.name}</h3>
                <p><span>Age: </span>{selectedDog.age}</p>
                <p><span>Breed: </span>{selectedDog.breed}</p>
                <p><span>Status: </span>{selectedDog.status === "adoption" ? "Available" : "Under Treatment"}</p>
                <p><span>Health Status: </span>{selectedDog.healthStatus}</p>
                <p><span>Medical Notes: </span>{selectedDog.medicalNotes}</p>
                <p><span>Recent Treatment: </span>{selectedDog.treatment}</p>
                
                {selectedDog.status === "adoption" && (
                  <button 
                    className="btn dc-adopt-btn" 
                    onClick={() => {
                      setSelectedDog(null);
                      navigate("/adoptionrequest", { state: { dog: selectedDog } });
                    }}
                  >
                    Adopt Me
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* AI Assistant Component - Client Side Only */}
      <div className={`ai-assistant ${openChat ? "open" : ""}`}>
        {openChat ? (
          <div className="ai-chat-window">
            {/* Header */}
            <div className="ai-chat-header">
              <div className="ai-header-content">
                <div className="ai-avatar">🤖</div>
                <div className="ai-header-text">
                  <span className="ai-title">StreetToSweet Assistant</span>
                  <span className="ai-status">Online • Ready to help</span>
                </div>
              </div>
              <button className="ai-close-btn" onClick={() => setOpenChat(false)}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="ai-chat-body" ref={chatBodyRef}>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`ai-message ${msg.sender === "user" ? "user-msg" : "bot-msg"} ${
                    msg.isError ? "error-msg" : ""
                  }`}
                >
                  <div className="message-content">
                    <p>{msg.text}</p>
                    <span className="message-time">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  {msg.isPredefined && (
                    <div className="predefined-badge">Quick Answer</div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="ai-message bot-msg">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Suggested Questions */}
              {messages.length <= 2 && suggestedQuestions.length > 0 && (
                <div className="suggested-questions">
                  <p className="suggestions-title">Quick questions you can ask:</p>
                  <div className="suggestions-grid">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        className="suggestion-chip"
                        onClick={() => handleSuggestionClick(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="ai-chat-footer">
              <div className="input-container">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about adoption, volunteering, donations..."
                  disabled={isLoading}
                />
                <button 
                  className="ai-send-btn" 
                  onClick={handleSend}
                  disabled={isLoading || input.trim() === ""}
                >
                  {isLoading ? "⏳" : "↑"}
                </button>
              </div>
              <div className="ai-footer-note">
                Powered by Smart Responses • Your data stays secure
              </div>
            </div>
          </div>
        ) : (
          <button 
            className="ai-assistant-toggle"
            onClick={() => setOpenChat(true)}
          >
            <span className="ai-icon">🤖</span>
            <span className="ai-pulse"></span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;