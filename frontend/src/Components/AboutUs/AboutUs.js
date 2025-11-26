import { Link, useNavigate } from 'react-router-dom';
import Nav from '../Nav/Nav';
import Footer from "../Footer/Footer";
import { PawPrint, ShieldCheck, Calendar, HeartHandshake, MapPin, Star, Home, Hospital, Users, AlertCircle, Gift } from 'lucide-react';
import './AboutUs.css';
import { useEffect, useState } from "react";

import storyImg1 from "../../assets/story1.jpg"; // e.g. street dogs rescue
import storyImg2 from "../../assets/story2.jpg"; // e.g. volunteers with dogs
import storyImg3 from "../../assets/story3.jpg"; // e.g. adoption moment

export default function AboutUs() {
 const navigate = useNavigate();
  const staff = [
    { name: "Dr. Achala Perera", role: "Veterinarian", bio: "Provides medical care and treatment plans for rescued street dogs.", image: "/vet1.jpg" },
    { name: "Dr. Nimal Fernando", role: "Veterinarian", bio: "Oversees medical check-ups and ensures all dogs are healthy.", image: "/vet2.jpg" },
    { name: "Sahan Wijesinghe", role: "Rescue Driver", bio: "Experienced driver handling urgent street dog rescues.", image: "/driver1.jpg" },
    { name: "Tharindu Rajapakse", role: "Rescue Driver", bio: "Assists in rescue operations and ensures dog safety.", image: "/driver2.jpg" },
    { name: "Sasi Karunarathna", role: "Shelter Staff", bio: "Organizes adoption camps, community awareness, and volunteer activities.", image: "/organizer.jpg" },
  ];

  const subsystems = [
    { icon: <Hospital />, title: "Shelter & Medical Care", desc: "Healing rescued dogs.", link: "/shelter" },
    { icon: <Home />, title: "Adoption & Public Interaction", desc: "Finding forever homes.", link: "/adoption" },
    { icon: <AlertCircle />, title: "Emergency Rescue Management", desc: "Saving dogs in need.", link: "/rescue" },
    { icon: <Gift />, title: "Awareness & Event Management", desc: "Educating and engaging the community.", link: "/events" }
  ];

  // ✅ Changed to statsData for consistency
  const statsData = [
    { icon: <PawPrint />, label: "Dogs Rescued", value: 215 },
    { icon: <Home />, label: "Dogs Adopted", value: 152 },
    { icon: <Users />, label: "Active Volunteers", value: 35 },
    { icon: <Calendar />, label: "Events Organized", value: 18 },
  ];

  const missions = [
    {
      icon: <AlertCircle className="mission-icon" />,
      title: "Rescue",
      desc: "Swift response to save injured or abandoned dogs in need.",
    },
    {
      icon: <Hospital className="mission-icon" />,
      title: "Medical Care",
      desc: "Providing vaccinations, treatments & surgeries for recovery.",
    },
    {
      icon: <Home className="mission-icon" />,
      title: "Adoption",
      desc: "Connecting loving families with dogs looking for forever homes.",
    },
    {
      icon: <HeartHandshake className="mission-icon" />,
      title: "Love",
      desc: "Spreading compassion and awareness within communities.",
    },
  ];

  const [counts, setCounts] = useState(statsData.map(() => 0));

  useEffect(() => {
    statsData.forEach((stat, idx) => {
      let start = 0;
      const end = stat.value;
      const duration = 2000; // 2s
      const step = Math.ceil(end / (duration / 30));

      const counter = setInterval(() => {
        start += step;
        if (start >= end) {
          start = end;
          clearInterval(counter);
        }
        setCounts((prev) => {
          const newCounts = [...prev];
          newCounts[idx] = start;
          return newCounts;
        });
      }, 30);
    });
  }, [statsData]);

  return (
    <div className="about-container">
      

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay">
          <h1>About StreetToSweet <PawPrint size={40} color="#fff"/></h1><br />
          <p>From rescuing to rehoming, we’re here to turn every street dog’s story into a sweet one.</p>
        </div><br />
        <div className="about-hero-buttons">
          <button
            className="about-btn-primary"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate("/reportStray");
            }}
          >
            Report a Rescue
          </button>

          <button
            className="about-btn-secondary "
           onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate("/adoption");
            }}
          >
            Adopt a Dog
          </button>
        </div>

        {/* Floating paw animation */}
        <div className="floating-paws-hero">
          <span className="paw">🐾</span>
          <span className="paw">🐾</span>
          <span className="paw">🐾</span>
        </div>
      </section>

      {/* Our Mission */}
      <section className="mission-section">
        <h2 className="fade-in">Our Mission</h2>
        <p className="fade-in delay-1">
          StreetToSweet is dedicated to rescuing street dogs, providing shelter &
          medical care, and helping them find loving homes. We also run community
          awareness and adoption drives.
        </p>

        <div className="mission-grid fade-in delay-2">
          {missions.map((m, i) => (
            <div className="mission-card" key={i}>
              {m.icon}
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Story */}
      <section className="story-section">
        <div className="story-content fade-in">
          <h2><PawPrint size={40}/> Our Story </h2>
          <p>
            StreetToSweet began in the heart of <strong>Ella, Sri Lanka</strong>, 
            where locals and volunteers united to bring hope to street dogs. 
            What started as a small community initiative has now grown into a 
            digital platform - streamlining <strong>rescues, medical care, 
            sheltering, and adoptions</strong>.
          </p>
          <p>
            Every rescue is a story of compassion. Our dedicated <strong>volunteers</strong>, 
            <strong> vets</strong>, and <strong>rescue drivers</strong> work tirelessly 
            to ensure every dog gets a second chance at life.
          </p>
          <p>
            Today, StreetToSweet isn’t just about saving dogs - it’s about 
            <strong>building a community of kindness</strong>, where technology 
            empowers people to act with love and responsibility.
          </p>
        </div>

        <div className="story-gallery fade-in delay-1">
          <div className="story-image large">
            <img src={storyImg1} alt="Street dog rescue in Ella" />
          </div>
          <div className="story-image small">
            <img src={storyImg2} alt="Volunteers caring for dogs" />
          </div>
          <div className="story-image small">
            <img src={storyImg3} alt="Dog adoption success" />
          </div>
        </div>
      </section>

      {/* Subsystems */}
      <section className="subsystems-section">
        <h2>Our 4 Sub Systems </h2>
        <div className="subsystems-grid">
          {subsystems.map((s, idx) => (
            <div className="subsystem-card fade-in" key={idx}>
              <div className="sub-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Section */}
<section className="impact-section">
  <h2 className="impact-title">Our Impact in Numbers</h2>
  <div className="impact-grid">
    {statsData.map((stat, idx) => (
      <div className="impact-card" key={idx}>
        <div className="impact-icon">
          {stat.icon}
        </div>
        <h3 className="impact-count">{counts[idx]}</h3>
        <p className="impact-label">{stat.label}</p>
      </div>
    ))}
  </div>
</section>

      {/* Staff Section */}
<section className="staff-section">
  <h2 className="staff-title">Our Dedicated Staff</h2>
  <div className="staff-grid">
    {staff.map((member, index) => (
      <div
        className="staff-card"
        key={index}
        style={{ animationDelay: `${index * 0.2}s` }} // stagger fade-in
      >
        <div className="staff-image-wrapper">
          <img
            src={member.image}
            alt={member.name}
            onError={(e) => { e.target.onerror = null; e.target.src = '/default-profile.jpg'; }}
          />
        </div>
        <h3>{member.name}</h3>
        <p className="role">{member.role}</p>
        <p className="bio">{member.bio}</p>
      </div>
    ))}
  </div>
</section>
      <Footer />
    </div>
  );
}
