// DogProfileAdopt.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DogProfileAdopt.css";

export default function DogProfileAdopt() {
  const location = useLocation();
  const navigate = useNavigate();
  const dog = location.state?.dog;

  if (!dog) {
    return (
      <div className="dog-profile">
        <p>No dog selected. Go back to adoption page.</p>
        <button onClick={() => navigate("/adoption")}>Back to Adoption</button>
      </div>
    );
  }

  return (
    <div className="dog-profile">
      {/* Header */}
      <header className="dog-header">
        <img src={dog.photo} alt={dog.name} className="dog-main-img" />
        <h1>{dog.name}</h1>
      </header>

      {/* Details */}
      <section className="dog-details">
        <p><strong>Breed:</strong> {dog.breed}</p>
        <p><strong>Age:</strong> {dog.age}</p>
        <p><strong>Gender:</strong> {dog.gender || "Not specified"}</p>
        <p><strong>Health:</strong> {dog.health}</p>
        <p><strong>Status:</strong> {dog.status === "adoption" ? "Available for Adoption" : "Not Available"}</p>
        <p className="desc"><strong>About:</strong> {dog.description}</p>
      </section>

      {/* Actions */}
      <div className="dog-actions">
        {dog.status === "adoption" && (
          <button
            className="btn primary"
            onClick={() => navigate("/adoptionrequest", { state: { dog } })}
          >
            Request Adoption
          </button>
        )}
        <button className="btn secondary" onClick={() => navigate("/adoption")}>
          Back to Adoption Page
        </button>
      </div>
    </div>
  );
}
