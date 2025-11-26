// src/Components/AllsysDogCard/AllsysDogCard.js
import React from "react";
import "./AllsysDogCard.css";

export default function AllsysDogCard({ dog, isFavorite, onFavToggle, onSeeDetails }) {
  return (
    <article
      className={`allsysdog-card 
        ${dog.status === "adoption" ? "adoption" : ""} 
        ${dog.status === "treatment" ? "treatment" : ""} 
        ${dog.disabled ? "disabled" : ""}`}
    >
      {/* Image + Badges + Fav */}
      <div className="allsysdog-card-media">
        <img src={dog.photo} alt={dog.name} loading="lazy" />

        {/* Status Badges */}
        <div className="allsysdog-badges">
          {dog.status === "treatment" && (
            <span className="allsysdog-badge treatment">Under Treatment</span>
          )}
          {dog.disabled && (
            <span className="allsysdog-badge disabled">Special Needs</span>
          )}
          {dog.vaccinated && (
            <span className="allsysdog-badge vaccinated">Vaccinated</span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          className={`allsysdog-fav ${isFavorite ? "active" : ""}`}
          onClick={() => onFavToggle(dog._id)}
          title="Favorite"
        >
          ❤
        </button>
      </div>

      {/* Card Content */}
      <div className="allsysdog-card-body">
        <h3>
          {dog.name}{" "}
          <span className="allsysdog-id">#{dog._id?.slice(-4)}</span>
        </h3>
        <p className="allsysdog-meta">
          {dog.age || "Unknown age"} • {dog.breed || "Unknown breed"}
        </p>

        {/* Status Text */}
        <div className="allsysdog-status-container">
          {dog.status === "adoption" && (
            <span className="allsysdog-status available">
              Available for Adoption
            </span>
          )}
          {dog.status === "treatment" && (
            <span className="allsysdog-status treatment">
              Under Medical Care
            </span>
          )}
        </div>

        {/* Description */}
        <p className="allsysdog-desc">
          {dog.description || "No description available."}
        </p>

        {/* Health Info */}
        <div className="allsysdog-health-info">
          <span className="allsysdog-health-label">Health Status:</span>
          <span className="allsysdog-health-value">
            {dog.health || "No information"}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="allsysdog-card-actions">
        <button
          type="button"
          className="allsysdog-btn-details"
          onClick={() => onSeeDetails(dog)}
        >
          View Full Details
        </button>
      </div>
    </article>
  );
}
