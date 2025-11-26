import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Adoption.css";
import DogCard from "../DogCard/DogCard";



import {
  Heart,
  PawPrint,
  Home,
  ChevronLeft,
  ChevronRight,
  CircleQuestionMark,
  House,
} from "lucide-react";

import Footer from "../Footer/Footer";
import { Dog, Clipboard, BookHeart } from "lucide-react";


import dog24 from "../../assets/dog24.jpg";
import dog21 from "../../assets/dog21.jpg";
import dog23 from "../../assets/dog23.jpg";
import dog22 from "../../assets/dog22.jpg";




// --- Mock stories ---

const stories = [
  {
    img: dog21,
    text: "Dixy was rescued from the streets, and today she enjoys cozy naps and playful walks with her new family.",
  },
  {
    img: dog22,
    text: "Bailey used to be shy and afraid, but adoption gave him confidence and a loving forever home.",
  },
  {
    img: dog23,
    text: "Tom went from a stray to the princess of the house. She loves garden runs and cuddles!",
  },
  {
    img: dog24,
    text: "Tummy now wakes up to belly rubs every morning and enjoys car rides with his new dad.",
  },
];


const Adoption = () => {
  const navigate = useNavigate();
  const [storyIndex, setStoryIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
const [selectedDog, setSelectedDog] = useState(null);
  function handleAdopt(dog) {
    // navigate to adopt page with dog data so form can auto-fill
    navigate("/adoptionrequest", { state: { dog } });
  }

  // Toggle favorite heart
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  useEffect(() => {
  axios.get("http://localhost:3000/dogs")
    .then(res => {
      const dogsWithPhotos = res.data.map(dog => ({
        ...dog,
        photo: dog.photo
          ? `http://localhost:3000/uploads/dogs/${dog.photo}` // make sure backend serves files here
          : "/placeholder.jpg" // fallback
      }));
      setDogs(dogsWithPhotos);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
}, []);


  return (
    <div>
      <div className="adoption-container">
        {/* Hero Section */}
        <div className="adopt-hero">
          <div className="adopt-hero-content">
            <h1 className="adopt-hero-title">
              Give a Street Dog a Forever Home <House size={40} />
            </h1>
            <p className="adopt-hero-subtext">
              Every dog deserves a second chance at love. Adoption is free. Your
              love is priceless
            </p>
            <div className="adopt-hero-buttons">
              <button
                className="adopt-btn-primary "
                onClick={() => {
                  window.scrollTo({ top: 100, behavior: "smooth" });
                  navigate("/adoptdogspage");
                }}
              >
                Browse Dogs
              </button>

              <button className="about-btn-secondary" onClick={() => {
              window.scrollTo({ top: 100, behavior: "smooth" });
              navigate("/lostFound");
            }}>Lost & Found Dog</button>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <section className="ap-stats">
          <div className="ap-stat-card">
            <PawPrint /> 120+ Dogs Rescued
          </div>
          <div className="ap-stat-card">
            <Home /> 45 Adoptions This Month
          </div>
          <div className="ap-stat-card">
            <Heart /> 100% Vaccinated
          </div>
        </section>

        {/* ADOPTION STEPS */}
        <section className="ap-adoption-steps">
          <h2 className="ap-steps-title">
            {" "}
            <Dog size={45} /> Simple Adoption Steps
          </h2>

          <div className="ap-steps-container">
            {/* Left Animated Dog */}
            <img
              src="https://i.pinimg.com/1200x/b7/74/aa/b774aa3692c529405af78f31dadc103e.jpg"
              alt="Happy Dog"
              className="ap-step-img left-img floating-dog"
            />

            {/* Timeline Steps */}
            <div className="ap-timeline">
              <div className="ap-timeline-line"></div>

              <div className="ap-timeline-step">
                <span className="ap-step-number">1</span>
                <p>Browse Dogs </p>
              </div>
              <div className="ap-timeline-step">
                <span className="ap-step-number">2</span>
                <p>Submit Request</p>
              </div>
              <div className="ap-timeline-step">
                <span className="ap-step-number">3</span>
                <p>Approval</p>
              </div>
              <div className="ap-timeline-step">
                <span className="ap-step-number">4</span>
                <p>Shelter Visit</p>
              </div>
              <div className="ap-timeline-step">
                <span className="ap-step-number">5</span>
                <p>Welcome Home</p>
              </div>
              <div className="ap-timeline-step">
                <span className="ap-step-number">6</span>
                <p>Post-Adoption Support</p>
              </div>
            </div>

            {/* Right Animated Dog */}
            <img
              src="https://i.pinimg.com/1200x/e0/13/62/e0136221d792a75e3f45c26dcbf30e69.jpg"
              alt="Playful Dog"
              className="ap-step-img right-img floating-dog"
            />
          </div>
        </section>


{/* ---------- FEATURED DOGS CAROUSEL ---------- */}
<section className="ad-featured">
  <h2 className="ad-featured-title">🌟 Featured Dogs for Adoption</h2>
  <p className="ad-featured-subtitle">
    Give a loving home to a rescued dog. Meet our adorable friends waiting for adoption!
  </p>

  {loading ? (
    <div className="ad-loading">Loading dogs...</div>
  ) : dogs.filter(dog => dog.status === "adoption").length === 0 ? (
    <p className="ad-no-dogs">No dogs currently available for adoption.</p>
  ) : (
    <div className="ad-dog-carousel-wrapper">
  <div className="ad-dog-carousel-scroll-track">
    {dogs
      .filter(dog => dog.status === "adoption")
      .slice(0, 7)
      .map((dog, index) => (
        <div className="ap-d-card" key={dog._id + "-" + index}>
          <DogCard
            dog={dog}
            isFavorite={favorites.includes(dog._id)}
            onFavToggle={(id) => toggleFavorite(id)}
            onSeeDetails={(d) => setSelectedDog(d)}
            onAdopt={(d) => handleAdopt(d)}
          />
        </div>
      ))}
    {/* Duplicate cards for seamless scrolling */}
    {dogs
      .filter(dog => dog.status === "adoption")
      .slice(0, 7)
      .map((dog, index) => (
        <div className="ap-d-card" key={"dup-" + dog._id + "-" + index}>
          <DogCard
            dog={dog}
            isFavorite={favorites.includes(dog._id)}
            onFavToggle={(id) => toggleFavorite(id)}
            onSeeDetails={(d) => setSelectedDog(d)}
            onAdopt={(d) => handleAdopt(d)}
          />
        </div>
      ))}
  </div>
</div>

  )}

    <div className="ad-browse-more">
    <h3>If You Want To Browse More Dogs, Click Here!</h3>
    <div className="ad-btn-wrapper">
      <button
        className="ad-btn-see-all"
        onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate("/adoptdogspage");
            }}
      >
        <Dog size={30} /> See All Dogs
      </button>
    </div>
  </div>

  {/* ---------- MODAL FOR DOG DETAILS ---------- */}
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

</section>



        {/* DASHBOARD */}
        <section className="ado-dashboard">
          <div className="ado-dashboard-container">
            {/* Header & Description */}
            <div className="ado-dashboard-header">
              <h2>
                <Clipboard size={45} /> My Adoption Dashboard
              </h2>
              <p>
                Track your adoption journey - from requests to follow-ups-all in
                one place!
              </p>
            </div>

            {/* Layout: Cards Left & Button Right */}
            <div className="ado-dashboard-main">
              {/* Left: Cards */}
              <div className="ado-dashboard-cards">
                <div className="ado-dash-card">
                  <PawPrint size={32} className="icon-anim" />
                  <h3>Requests</h3>
                  <p>See all your adoption requests</p>
                </div>
                <div className="ado-dash-card">
                  <Heart size={32} className="icon-anim" />
                  <h3>Certificates</h3>
                  <p>View adoption certificates & proof</p>
                </div>
                <div className="ado-dash-card">
                  <Home size={32} className="icon-anim" />
                  <h3>Follow-ups</h3>
                  <p>Check scheduled visits & care notes</p>
                </div>
              </div>

              {/* Right: Button + Illustration */}
              <div className="ado-dashboard-action">
                <button
                  className="ado-btn-primary"
                  onClick={() => {
                    window.scrollTo({ top: 100, behavior: "smooth" });
                    setTimeout(() => {
                      navigate("/adoptiondashboard");
                    }, 400); // delay so scroll happens smoothly
                  }}
                >
                  Go to My Adoption Dashboard &rarr;
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* LOST & FOUND */}
        <section className="lost-found">
          
          

          {/* Main Content */}
          <div className="lost-found-container">
            <h2>
              <Dog size={45} /> Lost or Found a Dog?
            </h2>
            <p>
              Help reunite pets with their families or report a dog you found.
              Your quick action can save lives!
            </p>

            <div className="lost-found-actions">
              <button className="btn-primary"onClick={() => {
              window.scrollTo({ top: -5, behavior: "smooth" });
              navigate("/lostfound");
            }} >Report Lost/Found</button>
             
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="testimonials">
          <div className="testimonials-header">
            <h2>
              {" "}
              <BookHeart size={45} /> From Street to Sweet Home{" "}
            </h2>
            <h3>Adoption Success Stories</h3>
          </div>

          <div className="carousel">
            {/* Left Button */}
            <button
              className="carousel-btn left"
              onClick={() =>
                setStoryIndex(
                  (storyIndex - 1 + stories.length) % stories.length
                )
              }
            >
              <ChevronLeft size={24} />
            </button>

            {/* Story Card */}
            <div className="story-card">
              <img
                src={stories[storyIndex].img}
                alt="Adoption Story"
                className="story-img"
              />
              <p className="story-text">“{stories[storyIndex].text}”</p>
            </div>

            {/* Right Button */}
            <button
              className="carousel-btn right"
              onClick={() => setStoryIndex((storyIndex + 1) % stories.length)}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="dots">
            {stories.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === storyIndex ? "active" : ""}`}
                onClick={() => setStoryIndex(i)}
              ></span>
            ))}
          </div>
        </section>

    {/* ---------- FAQ SECTION ---------- */}
<section className="faq">
  <h2 className="faq-title">
    <CircleQuestionMark size={45} /> Frequently Asked Questions
  </h2>

  {/* Subtitle + Contact Button Row */}
  <div className="faq-header-row">
    <h3 className="faq-subtitle">
      Need more info about adoption? Get in touch with us anytime.
    </h3>
    <button
      className="ad-faq-button"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        navigate("/contactus");
      }}
    >
      Contact Us
    </button>
  </div>

  {/* FAQ Items */}
  {[
    {
      q: "Is adoption free?",
      a: "Yes, always free with proper screening.",
    },
    {
      q: "What are the requirements?",
      a: "A safe space, commitment, and love for the dog.",
    },
    {
      q: "What if I can’t keep the dog?",
      a: "Contact our shelter to ensure a safe return.",
    },
  ].map((item, index) => (
    <div
      className="faq-item"
      key={index}
      onClick={(e) => e.currentTarget.classList.toggle("active")}
    >
      <h4>{item.q}</h4>
      <p>{item.a}</p>
    </div>
  ))}
</section>



        {/* CALL TO ACTION */}
        <section className="ad-cta-section">
          <h2>Not ready to adopt? You can still make a difference!</h2><br></br>
          <p className="ad-cta-desc">
            Help street dogs by volunteering, donating, or spreading awareness.
            Every action counts!
          </p>

          <div className="ad-section-buttons">
            <button className="ad-btn-primary" onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              navigate("/volunteerregister");
            }}>Become a Volunteer</button>
            <button className="ad-btn-secondary"onClick={() => {
              window.scrollTo({ top: 1000, behavior: "smooth" });
              navigate("/donate");
            }} >Support with Donation</button>
          </div>

          {/* Floating paw prints inside section */}
          <div className="floating-paws">
            <span className="paw">🐾</span>
            <span className="paw">🐾</span>
            <span className="paw">🐾</span>
            <span className="paw">🐾</span>
            <span className="paw">🐾</span>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Adoption;


