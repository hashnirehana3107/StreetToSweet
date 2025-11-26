import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AllsysDogCard from "../AllsysDogs/AllsysDogCard";
import "./AllsysDogs.css";
import { HeartHandshake, Hourglass, PawPrint, AlertTriangle } from "lucide-react";

export default function AllsysDogs() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [favorites, setFavorites] = useState(new Set());

  // Fetch all dogs
  useEffect(() => {
    fetch("http://localhost:3000/dogs")
      .then(res => res.json())
      .then(data => {
        const updated = data.map(d => ({
          ...d,
          photo: d.photo ? `http://localhost:3000/file/${d.photo}` : "/placeholder.jpg"
        }));
        setDogs(updated);
      })
      .catch(console.error);
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("favDogs");
    if (raw) setFavorites(new Set(JSON.parse(raw)));
  }, []);

  // Save favorites
  useEffect(() => {
    localStorage.setItem("favDogs", JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  const toggleFav = id => {
    setFavorites(prev => {
      const nxt = new Set(prev);
      nxt.has(id) ? nxt.delete(id) : nxt.add(id);
      return nxt;
    });
  };

  // Navigate to dog profile page
  const handleSeeDetails = (dog) => {
    navigate("/sysdogprofile", { state: { dog } });
  };

  // Filtering
  const filteredDogs = useMemo(() => {
    return dogs.filter(d => {
      if (statusFilter === "adoption" && d.status !== "adoption") return false;
      if (statusFilter === "treatment" && d.status !== "treatment") return false;
      if (statusFilter === "disabled" && !d.disabled) return false;
      if (!d.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [dogs, query, statusFilter]);

  const readyForAdoption = filteredDogs.filter(d => d.status === "adoption");
  const underTreatment = filteredDogs.filter(d => d.status === "treatment");
  const disabledDogs = filteredDogs.filter(d => d.disabled);

  return (
    <div className="all-sys-dog">
      <div className="sys-hero">
        <h1>
          System Dogs Management <PawPrint size={30} color="#0c2865ae" />
        </h1>
        <p>Internal system view - All dogs in shelter including treatment and special needs</p>
      </div>

      {/* Search + Filters */}
      <div className="sys-search-filter">
        <input
          type="search"
          placeholder="Search by name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="sys-filter-buttons">
          <button className={statusFilter === "all" ? "sys-active" : ""} onClick={() => setStatusFilter("all")}>All Dogs</button>
          <button className={statusFilter === "adoption" ? "sys-active" : ""} onClick={() => setStatusFilter("adoption")}>Available for Adoption</button>
          <button className={statusFilter === "treatment" ? "sys-active" : ""} onClick={() => setStatusFilter("treatment")}>Under Treatment</button>
          <button className={statusFilter === "disabled" ? "sys-active" : ""} onClick={() => setStatusFilter("disabled")}>Disabled Dogs</button>
        </div>
      </div>

      {/* Adoption Section */}
      <section className="sys-ra-dc-section">
        <h2>
          Available for Adoption <HeartHandshake size={40} color="#0a5757ff" />
        </h2>
        <p>Healthy dogs ready for adoption. Total: {readyForAdoption.length}</p>
        <div className="sys-dog-grid">
          {readyForAdoption.length > 0 ? readyForAdoption.map(dog => (
            <AllsysDogCard
              key={dog._id}
              dog={dog}
              isFavorite={favorites.has(dog._id)}
              onFavToggle={toggleFav}
              onSeeDetails={handleSeeDetails}
            />
          )) : <p>No dogs available for adoption.</p>}
        </div>
      </section>

      {/* Treatment Section */}
      <section className="sys-wl-dc-section">
        <h2>
          Under Medical Care <Hourglass size={40} color="#8d3613ff" />
        </h2>
        <p>Dogs currently receiving medical treatment. Total: {underTreatment.length}</p>
        <div className="sys-dog-grid">
          {underTreatment.length > 0 ? underTreatment.map(dog => (
            <AllsysDogCard
              key={dog._id}
              dog={dog}
              isFavorite={favorites.has(dog._id)}
              onFavToggle={toggleFav}
              onSeeDetails={handleSeeDetails}
            />
          )) : <p>No dogs under treatment currently.</p>}
        </div>
      </section>

      {/* Disabled Section */}
      <section className="sys-disabled-dc-section">
        <h2>
          Disabled Dogs <AlertTriangle size={40} color="#cc0000" />
        </h2>
        <p>Dogs with special needs requiring additional care. Total: {disabledDogs.length}</p>
        <div className="sys-dog-grid">
          {disabledDogs.length > 0 ? disabledDogs.map(dog => (
            <AllsysDogCard
              key={dog._id}
              dog={dog}
              isFavorite={favorites.has(dog._id)}
              onFavToggle={toggleFav}
              onSeeDetails={handleSeeDetails}
            />
          )) : <p>No disabled dogs in the system.</p>}
        </div>
      </section>
    </div>
  );
}
