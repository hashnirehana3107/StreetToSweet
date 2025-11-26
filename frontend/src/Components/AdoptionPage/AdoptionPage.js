import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DogCard from "../DogCard/DogCard";
import "./AdoptionPage.css";
import { HeartHandshake, Hourglass, PawPrint, Filter, X } from "lucide-react";

export default function AdoptionPage() {
  const navigate = useNavigate();
  const [dogs, setDogs] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [breedFilter, setBreedFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const [selectedDog, setSelectedDog] = useState(null);

  // Fetch dogs from backend
  useEffect(() => {
    fetch("http://localhost:3000/dogs")
      .then(res => res.json())
      .then(data => {
        const updated = data.map(d => ({
          ...d,
          photo: d.photo ? `http://localhost:3000/uploads/dogs/${d.photo}` : "/placeholder.jpg"
        }));
        setDogs(updated);
      })
      .catch(console.error);
  }, []);

  // Favorites localStorage
  useEffect(() => {
    const raw = localStorage.getItem("favDogs");
    if (raw) setFavorites(new Set(JSON.parse(raw)));
  }, []);

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

  const handleAdopt = dog => navigate("/adoptionrequest", { state: { dog } });
  const handleSeeDetails = dog => setSelectedDog(dog);

  // Get unique breeds for filter dropdown
  const allBreeds = useMemo(() => {
    const breeds = new Set();
    dogs.forEach(dog => {
      if (dog.breed) breeds.add(dog.breed);
    });
    return ["all", ...Array.from(breeds).sort()];
  }, [dogs]);

  const filteredDogs = useMemo(() => {
    return dogs.filter(d => {
      if (statusFilter === "adoption" && d.status !== "adoption") return false;
      if (statusFilter === "treatment" && d.status !== "treatment") return false;
      if (!d.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      
      // Breed filter
      if (breedFilter !== "all" && d.breed !== breedFilter) return false;
      
      // Age filter
      if (ageFilter !== "all") {
        const age = parseInt(d.age) || 0;
        if (ageFilter === "puppy" && age >= 2) return false;
        if (ageFilter === "young" && (age < 2 || age >= 5)) return false;
        if (ageFilter === "adult" && (age < 5 || age >= 8)) return false;
        if (ageFilter === "senior" && age < 8) return false;
      }
      
      // Size filter
      if (sizeFilter !== "all") {
        const weight = parseInt(d.weight) || 0;
        if (sizeFilter === "small" && weight >= 25) return false;
        if (sizeFilter === "medium" && (weight < 25 || weight >= 55)) return false;
        if (sizeFilter === "large" && weight < 55) return false;
      }
      
      return true;
    });
  }, [dogs, query, statusFilter, breedFilter, ageFilter, sizeFilter]);

  const readyForAdoption = filteredDogs.filter(d => d.status === "adoption");
  const underTreatment = filteredDogs.filter(d => d.status === "treatment");

  const clearAdvancedFilters = () => {
    setBreedFilter("all");
    setAgeFilter("all");
    setSizeFilter("all");
  };

  const hasAdvancedFilters = breedFilter !== "all" || ageFilter !== "all" || sizeFilter !== "all";

  return (
    <div className="adoption-page">
      <div className="hero">
        <h1>Meet Our Dogs <PawPrint size={30} color="#0c2865ae" /> </h1><br></br><br></br><br></br>
        <p> Find your perfect friend or check dogs under our care</p>
      </div>

      <div className="search-filter">
        <input type="search" placeholder="Search by name..." value={query} onChange={e => setQuery(e.target.value)} />
        
        <div className="filter-buttons">
          <button className={statusFilter==="all"?"active":""} onClick={()=>setStatusFilter("all")}>All Dogs</button>
          <button className={statusFilter==="adoption"?"active":""} onClick={()=>setStatusFilter("adoption")}>Available for Adoption</button>
          <button className={statusFilter==="treatment"?"active":""} onClick={()=>setStatusFilter("treatment")}>Rescued & Healing</button>
          
          <button 
            className={`advanced-filter-toggle ${showAdvancedFilters ? 'active' : ''}`}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter size={16} />
            More Filters
            {hasAdvancedFilters && <span className="filter-indicator"></span>}
          </button>
        </div>
      </div>

      {showAdvancedFilters && (
        <div className="advanced-filters">
          <div className="advanced-filters-header">
            <h3>Advanced Filters</h3>
            <button className="close-filters" onClick={() => setShowAdvancedFilters(false)}>
              <X size={18} />
            </button>
          </div>
          
          <div className="filter-group">
            <div className="filter-item">
              <label>Breed</label>
              <select value={breedFilter} onChange={e => setBreedFilter(e.target.value)}>
                {allBreeds.map(breed => (
                  <option key={breed} value={breed}>
                    {breed === "all" ? "All Breeds" : breed}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="filter-item">
              <label>Age</label>
              <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)}>
                <option value="all">All Ages</option>
                <option value="puppy">Puppy (0-2 years)</option>
                <option value="young">Young (2-5 years)</option>
                <option value="adult">Adult (5-8 years)</option>
                <option value="senior">Senior (8+ years)</option>
              </select>
            </div>
            
            <div className="filter-item">
              <label>Size</label>
              <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}>
                <option value="all">All Sizes</option>
                <option value="small">Small (under 25 lbs)</option>
                <option value="medium">Medium (25-55 lbs)</option>
                <option value="large">Large (55+ lbs)</option>
              </select>
            </div>
          </div>
          
          {hasAdvancedFilters && (
            <button className="clear-filters-btn" onClick={clearAdvancedFilters}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      <section className="ra-dc-section"> 
        <h2>Available for Adoption <HeartHandshake size={40} color="#0a5757ff" /></h2><br></br><br></br>
        <div className="ra-dc-para">
          <p> “These lovely dogs are healthy, vaccinated, and ready to find their forever homes. Browse their profiles and submit an adoption request to welcome one into your family.” </p>
        </div>

        <br></br><br></br><br></br>
      
        <div className="dog-grid">
          {readyForAdoption.length > 0 ? readyForAdoption.map(dog => (
            <DogCard key={dog._id} dog={dog} isFavorite={favorites.has(dog._id)} onFavToggle={toggleFav} onSeeDetails={handleSeeDetails} onAdopt={handleAdopt}/>
          )) : <p>No dogs available for adoption.</p>}
        </div>
      </section>

      <section className="wl-dc-section">
        <h2>Coming Soon - Under Care <Hourglass size={40} color="#8d3613ff" /></h2><br></br><br></br>
        <div className="wl-dc-para">
          <p> “These dogs have been rescued and are currently under medical care. They are not ready for adoption yet, but you can follow their recovery journey and support them until they're healthy enough to find a loving home.” </p>
        </div>
        <br></br><br></br><br></br>
        <div className="dog-grid">
          {underTreatment.length > 0 ? underTreatment.map(dog => (
            <DogCard key={dog._id} dog={dog} isFavorite={favorites.has(dog._id)} onFavToggle={toggleFav} onSeeDetails={handleSeeDetails}/>
          )) : <p>No dogs under treatment currently.</p>}
        </div>
      </section>

    {selectedDog && (
  <div className="modal">
    <div className="modal-panel">
      <button className="modal-close" onClick={()=>setSelectedDog(null)}>✕</button>
      <div className="modal-grid">
        <div className="modal-image-dog"><img src={selectedDog.photo} alt={selectedDog.name}/></div>
        <div className="modal-info">
          <h3>{selectedDog.name} <span className="id">#{selectedDog.id}</span></h3>
          <p><span>Age: </span>{selectedDog.age}</p> 
          <p><span>Breed: </span>{selectedDog.breed}</p>
          <p><span>Status: </span>{selectedDog.status==="adoption"?"Available":"Under Treatment"}</p>
          <p><span>Health Status: </span>{selectedDog.healthStatus}</p>
          <p><span>Medical Notes: </span>{selectedDog.medicalNotes}</p>
          <p><span>Recent Treatment: </span>{selectedDog.treatment}</p>

          {selectedDog.status==="adoption" && <button className="btn dc-adopt-btn" onClick={()=>handleAdopt(selectedDog)}>Adopt Me</button>}
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}