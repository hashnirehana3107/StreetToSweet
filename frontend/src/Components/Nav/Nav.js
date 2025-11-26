import React, { useState, useEffect } from 'react'; // ✅ import useState, useEffect
import { Link, useNavigate } from 'react-router-dom';
import './nav.css';

function Nav() {
  const navigate = useNavigate();

  // ✅ use state instead of reading localStorage only once
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!(localStorage.getItem("token") || localStorage.getItem("authToken"));
  });

  // ✅ listen to localStorage changes and check token periodically
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem("token") || localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };

    // Check immediately
    checkAuthStatus();

    // Listen to storage changes (for multiple tabs)
    const handleStorageChange = () => checkAuthStatus();
    window.addEventListener("storage", handleStorageChange);

    // Also listen to custom login/logout events
    const handleAuthChange = () => checkAuthStatus();
    window.addEventListener("authStateChanged", handleAuthChange);

    // Check periodically (every 1 second) to catch same-tab changes
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    setIsLoggedIn(false); // ✅ update state immediately
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("authStateChanged"));
    
    navigate("/login"); // redirect to login
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/animalShelter.png" alt="StreetToSweet Logo" className="logo" />
        <h1 className="system-name">StreetToSweet</h1>
      </div>
      <ul className="navbar-right">
        <li><Link to="/mainhome">Home</Link></li>
        <li><Link to="/reportstray">Report Stray</Link></li>
        <li><Link to="/adoption">Adoption</Link></li>
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/donate">Donate</Link></li>
        <li><Link to="/contactus">Contact Us</Link></li>
        <li><Link to="/aboutus">About Us</Link></li>

        {isLoggedIn ? (
          <>
            <li><Link to="/userprofile" className="btn-profile">Profile</Link></li>
            <li><button onClick={handleLogout} className="btn-log">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/register" className="btn-reg">Register</Link></li>
            <li><Link to="/login" className="btn-log">Login</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Nav;
