import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import "./Donate.css";

// Donation type images
import foodDonation from "../../assets/food-donation.jpg";
import medDonation from "../../assets/medicine-donation.jpg";
import shelterDonation from "../../assets/shelter-donation.jpg";
import eventDonation from "../../assets/event-donation.jpg";
import ngoBadge from "../../assets/ngo-badge.png";
import donationIllustration from "../../assets/donation-illustration.png"; // your image path

// Donor images
import donor1 from "../../assets/donor1.jpg";
import donor2 from "../../assets/donor2.jpg";
import donor3 from "../../assets/donor3.jpg";
import { Soup,PawPrint, Syringe,Hospital,HandCoins,Banknote,BookCheck, Verified,HeartHandshake,HeartPlus, Heart, Award, Camera, ArrowBigRight } from "lucide-react";


import miloBefore from "../../assets/milo-before.jpg";
import miloAfter from "../../assets/milo-after.jpg";
import BooBefore from "../../assets/Boo-before.jpg";
import BooAfter from "../../assets/Boo-after.jpg";
import lunaBefore from "../../assets/luna-before.jpg";
import lunaAfter from "../../assets/luna-after.jpg";


// Sample success stories
const successStories = [

  {
    before: miloBefore,
    after: miloAfter,
    caption: "Milo was rescued from the streets and is now healthy & happy ❤️.",
    donor: "Kavindu Silva",
  },
  {
    before: BooBefore,
    after: BooAfter,
    caption: "Luna received urgent medical care and a loving family 🐾.",
    donor: "Nethmi Fernando",
  },
  {
    before: lunaBefore,
    after: lunaAfter,
    caption: "Groomed, vaccinated, and found her forever home 🐾.",
    donor: "Nethmi Fernando",
  },
];

// Donation categories
const donationUses = [
    { title: "Medical Care", percent: 40, img: medDonation },
    { title: "Food & Shelter", percent: 30, img: foodDonation },
    { title: "Rescue Operations", percent: 20, img: shelterDonation },
    { title: "Awareness & Events", percent: 10, img: eventDonation },
  ];

// Donors
const donors = [
  { name: "Ayesha Perera", amount: 100, img: donor1, message: "Happy to support the street dogs!" },
  { name: "Kavindu Silva", amount: 50, img: donor2, message: "Every dog deserves love & care." },
  { name: "Nethmi Fernando", amount: 200, img: donor3, message: "Proud to be a part of Street2Sweet." },
];




const Donate = () => {
  const [showCertificate, setShowCertificate] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [errors, setErrors] = useState({});
  const [donation, setDonation] = useState({
    type: "",
    amount: "",
    name: "",
    email: "",
    recurring: false,
    frequency: "One-time",
    paymentMethod: "",
    cardHolderName: "",
    cardNumber: "",
    cvv: "",
    expiryDate: "",
    paypalAccount: "",
    paypalName: "",
    paypalTransactionId: "",
    bankAccount: "",
    bankName: "",
    bankHolderName: "",
    bankReference: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateForm = () => {
    const newErrors = {};
    
    // Amount validation
    if (!donation.amount || Number(donation.amount) <= 0) {
      newErrors.amount = "Please enter a valid donation amount";
    } else if (Number(donation.amount) > 100000) {
      newErrors.amount = "Donation amount cannot exceed Rs. 100,000";
    }
    
    // Payment method validation
    if (!donation.paymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
    }
    
    // Credit/Debit Card validations
    if (donation.paymentMethod === "Credit/Debit Card") {
      if (!donation.cardHolderName?.trim()) {
        newErrors.cardHolderName = "Cardholder name is required";
      }
      
      if (!donation.cardNumber || donation.cardNumber.length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }
      
      if (!donation.cvv || donation.cvv.length !== 3) {
        newErrors.cvv = "CVV must be 3 digits";
      }
      
      if (!donation.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(donation.expiryDate)) {
        newErrors.expiryDate = "Please enter a valid expiry date (MM/YY)";
      } else {
        // Check if card is expired
        const [month, year] = donation.expiryDate.split('/');
        const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
        const today = new Date();
        if (expiry < today) {
          newErrors.expiryDate = "Card has expired";
        }
      }
    }
    
    // PayPal validations
    if (donation.paymentMethod === "PayPal") {
      if (!donation.paypalAccount) {
        newErrors.paypalAccount = "PayPal email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donation.paypalAccount)) {
        newErrors.paypalAccount = "Please enter a valid email address";
      }
    }
    
    // Bank Transfer validations
    if (donation.paymentMethod === "Bank Transfer") {
      if (!donation.bankAccount) {
        newErrors.bankAccount = "Bank account number is required";
      } else if (donation.bankAccount.length < 6) {
        newErrors.bankAccount = "Bank account number seems too short";
      }
      
      if (!donation.bankHolderName?.trim()) {
        newErrors.bankHolderName = "Account holder name is required";
      }
    }
    
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    let newErrors = { ...errors };

    // Clear error for this field when user starts typing
    if (newErrors[name]) {
      delete newErrors[name];
    }

    // ===== Validation rules =====
    if (name === "amount") {
      if (newValue && (Number(newValue) <= 0 || Number(newValue) > 100000)) {
        newErrors.amount = "Amount must be between Rs. 1 and Rs. 100,000";
      } else {
        delete newErrors.amount;
      }
    }

    if (name === "cardNumber") {
      newValue = newValue.replace(/\D/g, "").slice(0, 16);
      if (newValue && newValue.length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      } else {
        delete newErrors.cardNumber;
      }
    }

    if (name === "cvv") {
      newValue = newValue.replace(/\D/g, "").slice(0, 3);
      if (newValue && newValue.length !== 3) {
        newErrors.cvv = "CVV must be 3 digits";
      } else {
        delete newErrors.cvv;
      }
    }

    if (name === "expiryDate") {
      newValue = newValue.replace(/[^\d/]/g, "").slice(0, 5);
      if (newValue.length === 2 && !newValue.includes("/")) {
        newValue = newValue + "/";
      }
      if (newValue && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(newValue)) {
        newErrors.expiryDate = "Invalid MM/YY format";
      } else {
        delete newErrors.expiryDate;
      }
    }

    if (name === "bankAccount") {
      newValue = newValue.replace(/\D/g, "");
      if (newValue && newValue.length < 6) {
        newErrors.bankAccount = "Bank account number seems too short";
      } else {
        delete newErrors.bankAccount;
      }
    }

    if (name === "paypalAccount") {
      if (newValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
        newErrors.paypalAccount = "Invalid email format";
      } else {
        delete newErrors.paypalAccount;
      }
    }

    if (name === "cardHolderName" && newValue && !/^[a-zA-Z\s]+$/.test(newValue)) {
      newErrors.cardHolderName = "Name can only contain letters and spaces";
    } else if (name === "cardHolderName") {
      delete newErrors.cardHolderName;
    }

    if (name === "bankHolderName" && newValue && !/^[a-zA-Z\s]+$/.test(newValue)) {
      newErrors.bankHolderName = "Name can only contain letters and spaces";
    } else if (name === "bankHolderName") {
      delete newErrors.bankHolderName;
    }

    // ===== Update state =====
    setErrors(newErrors);
    setDonation({
      ...donation,
      [name]: newValue,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!isAuthenticated) {
      navigate('/login', { state: { redirectTo: '/donate' } });
      return;
    }

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setSubmitError("Please fix the errors below before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      // Build payload, avoid sending sensitive fields if not needed
      const payload = {
        amount: Number(donation.amount),
        frequency: donation.frequency,
        paymentMethod: donation.paymentMethod,
        // Optional donor identity fields
        name: donation.name || user?.name,
        email: donation.email || user?.email,
      };

      if (donation.paymentMethod === 'Credit/Debit Card') {
        payload.cardHolderName = donation.cardHolderName;
        payload.cardNumber = donation.cardNumber; // backend only stores last4
        // Note: cvv/expiry are intentionally NOT sent to backend for storage/processing
      }
      if (donation.paymentMethod === 'PayPal') {
        payload.paypalAccount = donation.paypalAccount;
        payload.paypalName = donation.paypalName;
        payload.paypalTransactionId = donation.paypalTransactionId;
      }
      if (donation.paymentMethod === 'Bank Transfer') {
        payload.bankAccount = donation.bankAccount;
        payload.bankName = donation.bankName;
        payload.bankHolderName = donation.bankHolderName;
        payload.bankReference = donation.bankReference;
      }

      await axios.post('/donations', payload);

      // Go to profile donations tab
      navigate('/profile', { state: { section: 'donations' } });
    } catch (err) {
      console.error('Donation submit failed', err);
      setSubmitError(err.response?.data?.message || 'Failed to record donation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  
  const scrollRef = React.useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -clientWidth : clientWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div>
     

      {/* Hero Section */}
      <div className="donate-hero">
        <div className="donate-hero-content">
          <h1 className="d-hero-title">Support StreetToSweet <PawPrint size={40}/></h1>
          <p className="d-hero-subtext">
            Your generosity helps us feed, treat, and shelter hundreds of street dogs every month. 
            Every contribution, big or small, creates hope and happiness for our furry friends. ❤️
          </p>
          <div className="d-hero-buttons">
            <button
              className="d-btn-primary"
              onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
            >
              Donate Now
            </button>
            
          </div>
        </div>
      </div>

   {/* ---------- Why Donate? (Impact Section) ---------- */}
<section className="donate-impact-section">
  <h3 className="donate-impact-title">
    Why Donate? Your Impact <HeartHandshake size={50} className="impact-heart"/>
  </h3>
  <p className="donate-impact-subtext">
    With your help, we provide nutritious food, medical treatments, vaccinations,
    and warm shelters for abandoned dogs. We also organize adoption events to help
    them find loving homes. Every donation brings us closer to a world where no dog suffers alone!
  </p>

  <div className="donate-impact-cards">
    <div className="donate-impact-card">
      <div className="donate-impact-icon"><Soup size={40}/></div>
      <h4>Rs. 500</h4>
      <p>Meals for 5 dogs</p>
    </div>

    <div className="donate-impact-card">
      <div className="donate-impact-icon"><Syringe size={40}/></div>
      <h4>Rs. 1000</h4>
      <p>Vaccinations for 2 dogs</p>
    </div>

    <div className="donate-impact-card">
      <div className="donate-impact-icon"><Hospital size={40}/></div>
      <h4>Rs. 2500</h4>
      <p>Medical care for an injured dog</p>
    </div>

    <div className="donate-impact-card">
      <div className="donate-impact-icon"><HandCoins size={40}/></div>
      <h4>Rs. 5000</h4>
      <p>Support a dog until adoption</p>
    </div>
  </div>

  {/* Progress / Goal Tracker */}
  <div className="goal-tracker">
    <p>This month's goal: Rs. 50,000 → <span>72% Reached</span></p>
    <div className="progress-bar">
      <div className="progress-filled"></div>
    </div>
  </div>
</section>




<section className="donate-options-section">
  {/* Impact Title */}
  <h3 className="impact-title">
    Complete Your Donation <HeartPlus size={50} className="impact-heart" />
  </h3>

  <div className="donate-options-container">
    {/* Left Side Image */}
    <div className="donate-image">
      <img src={donationIllustration} alt="Donate Illustration" />
    </div>

    {/* Right Side Form */}
    <div className="donate-form-wrapper">
      <h3>
        Complete Your Donation <Heart size={40} color="#ef6b6bff" />
      </h3>
      <p>Select your donation amount, frequency, and payment method</p>

      <form className="donate-options-form" onSubmit={handleSubmit}>
        {submitError && (
          <div className="error-msg" style={{ marginBottom: 12 }}>{submitError}</div>
        )}
        
        {/* Amount validation error */}
        {errors.amount && (
          <div className="error-msg" style={{ marginBottom: 12 }}>{errors.amount}</div>
        )}
        
        {/* Preset Amounts */}
        <div className="preset-amounts">
          {["500", "1000", "2500"].map((amt) => (
            <button
              type="button"
              key={amt}
              className={`preset-btn ${donation.amount === amt ? "active" : ""}`}
              onClick={() => setDonation({ ...donation, amount: amt })}
            >
              RS.{amt}
            </button>
          ))}
          <input
            type="number"
            name="amount"
            placeholder="Custom"
            min="1"
            max="100000"
            value={
              donation.amount &&
              !["500", "1000", "2500"].includes(donation.amount.toString())
                ? donation.amount
                : ""
            }
            onChange={handleChange}
            className="custom-amount"
          />
        </div>

        {/* Frequency */}
        <div className="frequency-options">
          {["One-time", "Monthly", "Yearly"].map((freq) => (
            <label key={freq} className="frequency-label">
              <input
                type="radio"
                name="frequency"
                value={freq}
                checked={donation.frequency === freq}
                onChange={handleChange}
              />
              {freq}
            </label>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <label>Payment Method:</label>
          
          <select
            name="paymentMethod"
            value={donation.paymentMethod || ""}
            onChange={handleChange}
            required
            className={errors.paymentMethod ? "error" : ""}
          >
            <option value="">Select Method</option>
            <option value="Credit/Debit Card">Credit/Debit Card</option>
            <option value="PayPal">PayPal</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
          {errors.paymentMethod && (
            <span className="error-msg">{errors.paymentMethod}</span>
          )}

          {/* Credit/Debit Card */}
          {donation.paymentMethod === "Credit/Debit Card" && (
            <div className="payment-input">
              <label>Cardholder Name:</label>
              <input
                type="text"
                name="cardHolderName"
                value={donation.cardHolderName || ""}
                onChange={handleChange}
                placeholder="Enter cardholder name"
                required
                className={errors.cardHolderName ? "error" : ""}
              />
              {errors.cardHolderName && (
                <span className="error-msg">{errors.cardHolderName}</span>
              )}

              <div className="credit-card-row">
                <div className="input-group">
                  <input
                    type="text"
                    name="cardNumber"
                    value={donation.cardNumber || ""}
                    onChange={handleChange}
                    placeholder="Card Number"
                    required
                    className={errors.cardNumber ? "error" : ""}
                  />
                  {errors.cardNumber && (
                    <span className="error-msg">{errors.cardNumber}</span>
                  )}
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    name="cvv"
                    value={donation.cvv || ""}
                    onChange={handleChange}
                    placeholder="CVV"
                    required
                    className={errors.cvv ? "error" : ""}
                  />
                  {errors.cvv && (
                    <span className="error-msg">{errors.cvv}</span>
                  )}
                </div>
              </div>

              <label>Expiry Date (MM/YY):</label>
              <input
                type="text"
                name="expiryDate"
                value={donation.expiryDate || ""}
                onChange={handleChange}
                placeholder="MM/YY"
                required
                className={errors.expiryDate ? "error" : ""}
              />
              {errors.expiryDate && (
                <span className="error-msg">{errors.expiryDate}</span>
              )}
            </div>
          )}

          {/* PayPal */}
          {donation.paymentMethod === "PayPal" && (
            <div className="payment-input">
              <label>PayPal Account Email:</label>
              <input
                type="email"
                name="paypalAccount"
                value={donation.paypalAccount || ""}
                onChange={handleChange}
                placeholder="Enter PayPal email"
                required
                className={errors.paypalAccount ? "error" : ""}
              />
              {errors.paypalAccount && (
                <span className="error-msg">{errors.paypalAccount}</span>
              )}
              <label>Donor Full Name (Optional):</label>
              <input
                type="text"
                name="paypalName"
                value={donation.paypalName || ""}
                onChange={handleChange}
                placeholder="Enter full name"
              />
              <label>Transaction ID (Optional):</label>
              <input
                type="text"
                name="paypalTransactionId"
                value={donation.paypalTransactionId || ""}
                onChange={handleChange}
                placeholder="Enter transaction ID"
              />
            </div>
          )}

          {/* Bank Transfer */}
          {donation.paymentMethod === "Bank Transfer" && (
            <div className="payment-input">
              <label>Bank Account Number:</label>
              <input
                type="text"
                name="bankAccount"
                value={donation.bankAccount || ""}
                onChange={handleChange}
                placeholder="Enter bank account number"
                required
                className={errors.bankAccount ? "error" : ""}
              />
              {errors.bankAccount && (
                <span className="error-msg">{errors.bankAccount}</span>
              )}
              <label>Bank Name (Optional):</label>
              <input
                type="text"
                name="bankName"
                value={donation.bankName || ""}
                onChange={handleChange}
                placeholder="Enter bank name"
              />
              <label>Account Holder Name:</label>
              <input
                type="text"
                name="bankHolderName"
                value={donation.bankHolderName || ""}
                onChange={handleChange}
                placeholder="Enter account holder name"
                required
                className={errors.bankHolderName ? "error" : ""}
              />
              {errors.bankHolderName && (
                <span className="error-msg">{errors.bankHolderName}</span>
              )}
              <label>Reference / Transaction ID (Optional):</label>
              <input
                type="text"
                name="bankReference"
                value={donation.bankReference || ""}
                onChange={handleChange}
                placeholder="Enter reference or transaction ID"
              />
            </div>
          )}
        </div>

        {/* Submit CTA */}
        <button type="submit" className="donate-cta" disabled={submitting}>
          {submitting ? 'Processing...' : 'Complete My Donation'}
        </button>
      </form>
    </div>
  </div>
</section>




 <div className="transparency-section">
      <h3>Where Your Donations Go <ArrowBigRight size={40}/></h3>
      <p className="transparency-subtext">
        We value your trust and want you to see the real impact of your contribution!
      </p>

      <div className="transparency-cards">
        {donationUses.map((item, index) => (
          <div key={index} className="transparency-card">
            <img src={item.img} alt={item.title} className="transparency-icon" />
            <div className="progress-circle" style={{ "--percent": item.percent }}>
              <span>{item.percent}%</span>
            </div>
            <h4>{item.title}</h4>
          </div>
        ))}
      </div>
<div className="certifications-section">
  <h3>Trusted & Verified <Verified size={40} color="#9e1983ff"/></h3>
  <p>Your donations are fully transparent. See our official certification below!</p>

  <div className="cert-card">
    <div className="cert-image-wrapper">
      <img src={ngoBadge} alt="NGO Certified" className="cert-badge" />
      <div className="cert-overlay">
        <button
          className="view-certificate-btn"
          onClick={() => setShowCertificate(true)}
        >
          View Certificate
        </button>
      </div>
    </div>
    <p className="cert-text">NGO Registration No: 123456789</p>
  </div>

  {showCertificate && (
    <div
      className="certificate-modal"
      onClick={() => setShowCertificate(false)}
    >
      <div
        className="certificate-content"
        onClick={(e) => e.stopPropagation()}
      >
        <img src={ngoBadge} alt="NGO Certificate Full" />
        <button
          className="close-btn"
          onClick={() => setShowCertificate(false)}
        >
          ✖
        </button>
      </div>
    </div>
  )}
</div>
</div>

<section className="success-section">
  <h2>Success Stories & Donor Impact <BookCheck size={40} color="#4d4709ff"/></h2>
  <p className="success-subtext">
    Your donations make miracles happen! See how rescued dogs are thriving.
  </p>

  <div className="success-carousel-wrapper">
    <div className="success-carousel auto-scroll">
      {[...successStories, ...successStories].map((story, idx) => (
        <div key={idx} className="success-card">
          <div className="story-images">
           
            <img src={story.before} alt="Before Rescue" className="before" />  <span className="label">Before</span>
             <span className="label">After</span>
            <img src={story.after} alt="After Rescue" className="after" />
          </div>
          <div className="story-caption">
            <p>{story.caption}</p>
            <small>- {story.donor}</small>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>



      {/* Donor Highlights / Impact Wall */}
<section className="donor-section">
  <h2>Our Proud Donors  <BookCheck size={40} color="#cc5798ff"/></h2>
  <p className="donor-subtext">
    Thanks to your generosity, we continue to rescue, feed, and care for street dogs every day.
  </p>

  <div className="donor-cards">
    {donors.map((donor, index) => (
      <div key={index} className="donor-card">
        <div className="donor-img-container">
          <img src={donor.img} alt={donor.name} />
          <span className="donation-badge"> ${donor.amount}</span>
        </div>
        <h4>{donor.name}</h4>
        <p className="donor-message">"{donor.message}"</p>
      </div>
    ))}
  </div>
</section>



    

      <Footer />
    </div>
    
  );
};

export default Donate;