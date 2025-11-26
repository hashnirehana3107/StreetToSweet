import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SysDogProfile.css";
import { ArrowLeft, Calendar, AlertCircle, HeartPulse, Syringe, FileText } from "lucide-react";

export default function SysDogProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const dog = location.state?.dog;
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("health");

  // Mock treatment history data - in a real app, this would come from an API
  useEffect(() => {
    if (dog) {
      // Simulate API call to fetch treatment history
      const mockTreatmentHistory = [
        {
          id: 1,
          date: "2023-10-15",
          procedure: "Vaccination",
          description: "Annual booster vaccination",
          veterinarian: "Dr. Smith",
          medications: ["Rabies vaccine", "Parvovirus vaccine"]
        },
        {
          id: 2,
          date: "2023-09-22",
          procedure: "Dental Cleaning",
          description: "Routine dental cleaning and examination",
          veterinarian: "Dr. Johnson",
          medications: ["Anesthesia", "Pain relief medication"]
        },
        {
          id: 3,
          date: "2023-08-10",
          procedure: "Spay Surgery",
          description: "Routine spay surgery performed",
          veterinarian: "Dr. Williams",
          medications: ["Antibiotics", "Pain management"]
        }
      ];
      setTreatmentHistory(mockTreatmentHistory);
    }
  }, [dog]);

  if (!dog) {
    return (
      <div className="sys-dog-profile">
        <div className="sys-profile-error">
          <AlertCircle size={48} />
          <h2>No Dog Selected</h2>
          <p>Please select a dog from the system dashboard to view its profile.</p>
          <button onClick={() => navigate("/system/dogs")}>Back to System Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sys-dog-profile">
      {/* Header with back button */}
      <div className="sys-profile-header">
        <button className="sys-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>System Dog Profile</h1>
      </div>

      {/* Dog Overview */}
      <section className="sys-dog-overview">
        <div className="sys-dog-image">
          <img src={dog.photo} alt={dog.name} />
          {dog.disabled && (
            <div className="sys-disabled-badge">
              <AlertCircle size={16} />
              Special Needs
            </div>
          )}
        </div>
        <div className="sys-dog-basic-info">
          <h2>{dog.name} <span className="sys-dog-id">ID: #{dog._id?.slice(-4) || 'N/A'}</span></h2>
          <div className="sys-dog-meta">
            <span>{dog.breed}</span>
            <span>{dog.age}</span>
            <span>{dog.gender || "Not specified"}</span>
          </div>
          <div className="sys-status-badge">
            {dog.status === "adoption" ? "Available for Adoption" : "Under Treatment"}
          </div>
          <p className="sys-dog-desc">{dog.description}</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sys-profile-tabs">
        <button 
          className={activeTab === "health" ? "sys-tab-active" : ""}
          onClick={() => setActiveTab("health")}
        >
          <HeartPulse size={18} />
          Health Information
        </button>
        <button 
          className={activeTab === "treatment" ? "sys-tab-active" : ""}
          onClick={() => setActiveTab("treatment")}
        >
          <Syringe size={18} />
          Treatment History
        </button>
        <button 
          className={activeTab === "notes" ? "sys-tab-active" : ""}
          onClick={() => setActiveTab("notes")}
        >
          <FileText size={18} />
          Medical Notes
        </button>
      </div>

      {/* Health Information Tab */}
      {activeTab === "health" && (
        <section className="sys-health-info">
          <h3>Health Details</h3>
          <div className="sys-health-grid">
            <div className="sys-health-item">
              <label>Vaccination Status</label>
              <span className={dog.vaccinated ? "sys-status-good" : "sys-status-bad"}>
                {dog.vaccinated ? "Up to date" : "Not vaccinated"}
              </span>
            </div>
            <div className="sys-health-item">
              <label>Health Condition</label>
              <span>{dog.health || "No information"}</span>
            </div>
            <div className="sys-health-item">
              <label>Last Checkup</label>
              <span>2023-10-15</span>
            </div>
            <div className="sys-health-item">
              <label>Next Appointment</label>
              <span>2024-01-15</span>
            </div>
            <div className="sys-health-item">
              <label>Special Needs</label>
              <span>{dog.disabled ? "Yes" : "No"}</span>
            </div>
            <div className="sys-health-item">
              <label>Weight</label>
              <span>22 kg</span>
            </div>
          </div>

          <div className="sys-current-medications">
            <h4>Current Medications</h4>
            {dog.status === "treatment" ? (
              <ul>
                <li>Antibiotics - 2x daily (until 2023-11-15)</li>
                <li>Pain relief - 1x daily (as needed)</li>
              </ul>
            ) : (
              <p>No current medications</p>
            )}
          </div>
        </section>
      )}

      {/* Treatment History Tab */}
      {activeTab === "treatment" && (
        <section className="sys-treatment-history">
          <h3>Treatment History</h3>
          {treatmentHistory.length > 0 ? (
            <div className="sys-treatment-list">
              {treatmentHistory.map(treatment => (
                <div key={treatment.id} className="sys-treatment-item">
                  <div className="sys-treatment-date">
                    <Calendar size={16} />
                    {treatment.date}
                  </div>
                  <div className="sys-treatment-details">
                    <h4>{treatment.procedure}</h4>
                    <p>{treatment.description}</p>
                    <div className="sys-treatment-meta">
                      <span>Veterinarian: {treatment.veterinarian}</span>
                    </div>
                    {treatment.medications && treatment.medications.length > 0 && (
                      <div className="sys-treatment-meds">
                        <strong>Medications:</strong>
                        <ul>
                          {treatment.medications.map((med, index) => (
                            <li key={index}>{med}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No treatment history recorded for this dog.</p>
          )}
        </section>
      )}

      {/* Medical Notes Tab */}
      {activeTab === "notes" && (
        <section className="sys-medical-notes">
          <h3>Medical Notes</h3>
          <div className="sys-notes-container">
            <div className="sys-note">
              <div className="sys-note-header">
                <span className="sys-note-date">2023-10-15</span>
                <span className="sys-note-author">Dr. Smith</span>
              </div>
              <div className="sys-note-content">
                <p>Dog received annual vaccinations. No adverse reactions observed. Weight is stable at 22kg. Recommended follow-up in 3 months for routine checkup.</p>
              </div>
            </div>
            <div className="sys-note">
              <div className="sys-note-header">
                <span className="sys-note-date">2023-09-22</span>
                <span className="sys-note-author">Dr. Johnson</span>
              </div>
              <div className="sys-note-content">
                <p>Dental cleaning performed. Minor plaque buildup removed. No signs of dental disease. Dog recovered well from anesthesia.</p>
              </div>
            </div>
            <div className="sys-note">
              <div className="sys-note-header">
                <span className="sys-note-date">2023-08-10</span>
                <span className="sys-note-author">Dr. Williams</span>
              </div>
              <div className="sys-note-content">
                <p>Spay surgery performed successfully. Incision healing well. Prescribed antibiotics and pain medication. Dog resting comfortably.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}