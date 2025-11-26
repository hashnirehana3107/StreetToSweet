import React from "react";
import "./Footer.css";
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter, FaDonate } from "react-icons/fa";
import { Clock, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer-page">
      <div className="footer-container">
        {/* Brand & Mission */}
        <div className="footer-section-brand">
          <h2 className="logo"> StreetToSweet</h2>
          <p className="tagline">
            Rescuing, healing, and rehoming street dogs with love.
          </p>
          <p className="tagline">
            We connect rescuers, adopters, volunteers, and donors to build a
            caring community for street dogs.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
  <li>
    &gt; <Link to="/" onClick={() => window.scrollTo(0, 0)}>Home</Link>
  </li>
  <li>
    &gt; <Link to="/reportstray" onClick={() => window.scrollTo(0, 0)}>Report Stray</Link>
  </li>
  <li>
    &gt; <Link to="/adoption" onClick={() => window.scrollTo(0, 0)}>Adoption</Link>
  </li>
  <li>
    &gt; <Link to="/events" onClick={() => window.scrollTo(0, 0)}>Events</Link>
  </li>
  <li>
    &gt; <Link to="/donate" onClick={() => window.scrollTo(0, 0)}>Donate</Link>
  </li>
  <li>
    &gt; <Link to="/contactus" onClick={() => window.scrollTo(0, 0)}>Contact Us</Link>
  </li>
  <li>
    &gt; <Link to="/aboutus" onClick={() => window.scrollTo(0, 0)}>About Us</Link>
  </li>
</ul>

        </div>

        {/* Contact Info */}
        <div className="footer-section contact">
          <h3>Contact</h3>
          <p><MapPin size={15}/> Ella, Sri Lanka</p>
          <p><Phone size={15}/> +94 77 123 4567</p>
          <p><FaDonate size={15}/> support@streettosweet.org</p>
          <p><Clock size={15}/> Mon–Sat, 9 AM – 6 PM</p>
        </div>

        {/* Social Media + Newsletter */}
        <div className="footer-section social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          </div>
          <p>Follow our rescues & happy adoption stories!</p>

          {/* Newsletter below Social Media */}
          <div className="newsletter">
            <p>Stay updated with rescues & events.</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button>Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Strip */}
      <div className="footer-bottom">
        <p>© 2025 StreetToSweet | All Rights Reserved</p>
        <div className="legal-links">
          <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
