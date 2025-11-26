import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, HeartPlus } from "lucide-react"; // icons
import "./DonateQR.css";
import donationIllustration from "../../assets/donation-illustration.png"; // your image path

const DonateQR = () => {
  const navigate = useNavigate();
  const [donation, setDonation] = useState({
    type: "",
    amount: "",
    name: "",
    email: "",
    recurring: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDonation({
      ...donation,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/donation-payment", { state: donation });
  };

  return (
    <div>
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
                >
                  <option value="">Select Method</option>
                  <option value="Credit/Debit Card">Credit/Debit Card</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>

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
                    />

                    <div className="credit-card-row">
                      <input
                        type="text"
                        name="cardNumber"
                        value={donation.cardNumber || ""}
                        onChange={handleChange}
                        placeholder="Card Number"
                        required
                      />
                      <input
                        type="text"
                        name="cvv"
                        value={donation.cvv || ""}
                        onChange={handleChange}
                        placeholder="CVV"
                        required
                      />
                    </div>

                    <label>Expiry Date (MM/YY):</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={donation.expiryDate || ""}
                      onChange={handleChange}
                      placeholder="MM/YY"
                    />
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
                    />
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
                    />
                    <label>Bank Name (Optional):</label>
                    <input
                      type="text"
                      name="bankName"
                      value={donation.bankName || ""}
                      onChange={handleChange}
                      placeholder="Enter bank name"
                    />
                    <label>Account Holder Name (Optional):</label>
                    <input
                      type="text"
                      name="bankHolderName"
                      value={donation.bankHolderName || ""}
                      onChange={handleChange}
                      placeholder="Enter account holder name"
                    />
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
              <button type="submit" className="donate-cta">
                Complete My Donation
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DonateQR;
