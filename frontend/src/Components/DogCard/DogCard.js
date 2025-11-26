import React from "react";
import "./DogCard.css";

export default function DogCard({ dog, isFavorite, onFavToggle, onSeeDetails, onAdopt }) {
  return (
    <article className={`card ${dog.status}`}>
      <div className="card-media">
        <img src={dog.photo} alt={dog.name} loading="lazy" />
        <div className="badges">
          {dog.badges?.map((b) => (
            <span className="badge" key={b}>{b}</span>
          ))}
        </div>
        <button
          className={`fav ${isFavorite ? "active" : ""}`}
          onClick={() => onFavToggle(dog._id)}
          title="Favorite"
        >❤</button>
      </div>
      <div className="card-body">
        <h3>{dog.name}</h3>
        <p className="meta">{dog.age} • {dog.breed}</p>
        {dog.status === "adoption" && <span className="status available">Available</span>}
        {dog.status === "treatment" && <span className="status treatment-badge">Under Treatment</span>}
        <p className="desc">{dog.description}</p>
      </div>
      <div className="card-actions">
        <button className="btn-see-detail" onClick={() => onSeeDetails(dog)}>See Details</button>
        {dog.status === "adoption" && <button className="btn-primary-adopt" onClick={() => onAdopt(dog)}>Adopt Me</button>}
      </div>
    </article>
  );
}
