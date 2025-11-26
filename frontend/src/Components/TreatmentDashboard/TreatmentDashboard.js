import React, { useState } from 'react';
import './TreatmentDashboard.css';

const TreatmentDashboard = () => {
  // Sample data for demonstration
  const sampleDogs = [
    {
      id: 1,
      name: "Buddy",
      breed: "Golden Retriever",
      age: 3,
      photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face",
      treatments: [
        { id: 1, condition: "Vaccination", medicine: "Rabies Vaccine", vet: "Dr. Smith", startDate: "2023-05-15", nextDate: "2024-05-15", status: "Completed", notes: "Annual vaccination" },
        { id: 2, condition: "Check-up", medicine: "None", vet: "Dr. Johnson", startDate: "2023-10-10", nextDate: "2023-11-10", status: "Ongoing", notes: "Monthly check-up" }
      ]
    },
    {
      id: 2,
      name: "Luna",
      breed: "German Shepherd",
      age: 2,
      photo: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=150&h=150&fit=crop&crop=face",
      treatments: [
        { id: 1, condition: "Skin Infection", medicine: "Antibiotics", vet: "Dr. Wilson", startDate: "2023-06-20", nextDate: "2023-07-20", status: "Ongoing", notes: "Skin infection treatment", urgent: true }
      ]
    },
    {
      id: 3,
      name: "Max",
      breed: "Labrador",
      age: 4,
      photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&h=150&fit=crop&crop=face",
      treatments: [
        { id: 1, condition: "Surgery", medicine: "Pain Medication", vet: "Dr. Brown", startDate: "2023-04-05", nextDate: "2023-04-15", status: "Completed", notes: "Spay surgery recovery" },
        { id: 2, condition: "Vaccination", medicine: "DHPP Vaccine", vet: "Dr. Davis", startDate: "2023-01-12", nextDate: "2024-01-12", status: "Completed", notes: "Booster shot" }
      ]
    },
    {
      id: 4,
      name: "Charlie",
      breed: "Beagle",
      age: 1,
      photo: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=150&h=150&fit=crop&crop=face",
      treatments: [
        { id: 1, condition: "Emergency", medicine: "IV Fluids", vet: "Dr. Miller", startDate: "2023-09-05", nextDate: "2023-09-12", status: "Pending", notes: "Dehydration treatment", urgent: true }
      ]
    }
  ];

  const vets = ["Dr. Smith", "Dr. Johnson", "Dr. Wilson", "Dr. Brown", "Dr. Davis", "Dr. Miller"];
  const conditions = ["Vaccination", "Surgery", "Check-up", "Emergency", "Dental", "Skin Condition"];
  const statuses = ["Pending", "Ongoing", "Completed"];

  const [dogs, setDogs] = useState(sampleDogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    condition: '',
    vet: ''
  });
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTreatment, setNewTreatment] = useState({
    dogId: '',
    condition: '',
    medicine: '',
    vet: '',
    startDate: '',
    nextDate: '',
    status: 'Pending',
    notes: ''
  });

  // Calculate metrics
  const totalDogs = dogs.length;
  const ongoingTreatments = dogs.reduce((count, dog) => 
    count + dog.treatments.filter(t => t.status === 'Ongoing').length, 0);
  const vaccinatedDogs = dogs.filter(dog => 
    dog.treatments.some(t => t.condition === 'Vaccination' && t.status === 'Completed')).length;
  const urgentCases = dogs.reduce((count, dog) => 
    count + dog.treatments.filter(t => t.urgent).length, 0);

  // Filter dogs based on search term and filters
  const filteredDogs = dogs.filter(dog => {
    const matchesSearch = dog.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         dog.id.toString().includes(searchTerm);
    
    const hasMatchingTreatment = dog.treatments.some(treatment => {
      const matchesStatus = !filters.status || treatment.status === filters.status;
      const matchesCondition = !filters.condition || treatment.condition === filters.condition;
      const matchesVet = !filters.vet || treatment.vet === filters.vet;
      
      return matchesStatus && matchesCondition && matchesVet;
    });
    
    return matchesSearch && (hasMatchingTreatment || Object.values(filters).every(f => !f));
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTreatment({
      ...newTreatment,
      [name]: value
    });
  };

  const handleAddTreatment = (e) => {
    e.preventDefault();
    
    const updatedDogs = dogs.map(dog => {
      if (dog.id.toString() === newTreatment.dogId) {
        const newTreatmentObj = {
          id: dog.treatments.length + 1,
          condition: newTreatment.condition,
          medicine: newTreatment.medicine,
          vet: newTreatment.vet,
          startDate: newTreatment.startDate,
          nextDate: newTreatment.nextDate,
          status: newTreatment.status,
          notes: newTreatment.notes
        };
        
        return {
          ...dog,
          treatments: [...dog.treatments, newTreatmentObj]
        };
      }
      return dog;
    });
    
    setDogs(updatedDogs);
    setNewTreatment({
      dogId: '',
      condition: '',
      medicine: '',
      vet: '',
      startDate: '',
      nextDate: '',
      status: 'Pending',
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleStatusUpdate = (dogId, treatmentId, newStatus) => {
    const updatedDogs = dogs.map(dog => {
      if (dog.id === dogId) {
        const updatedTreatments = dog.treatments.map(treatment => {
          if (treatment.id === treatmentId) {
            return { ...treatment, status: newStatus };
          }
          return treatment;
        });
        
        return { ...dog, treatments: updatedTreatments };
      }
      return dog;
    });
    
    setDogs(updatedDogs);
  };

  const handleDeleteTreatment = (dogId, treatmentId) => {
    const updatedDogs = dogs.map(dog => {
      if (dog.id === dogId) {
        const updatedTreatments = dog.treatments.filter(t => t.id !== treatmentId);
        return { ...dog, treatments: updatedTreatments };
      }
      return dog;
    });
    
    setDogs(updatedDogs);
  };

  const handleExport = () => {
    // In a real application, this would generate a PDF or Excel file
    alert("Exporting treatment data...");
  };

  return (
    <div className="treat-dash">
      {/* Header Section */}
      <header className="treat-dash-header">
        <h1>Treatment Dashboard</h1>
        <p>Monitor and manage treatments of all rescued dogs.</p>
        
        {/* Quick Metrics */}
        <div className="treat-dash-metrics">
          <div className="treat-dash-metric">
            <div className="treat-dash-metric-icon">🐕</div>
            <div className="treat-dash-metric-info">
              <span className="treat-dash-metric-value">{totalDogs}</span>
              <span className="treat-dash-metric-label">Total Dogs</span>
            </div>
          </div>
          
          <div className="treat-dash-metric">
            <div className="treat-dash-metric-icon">💊</div>
            <div className="treat-dash-metric-info">
              <span className="treat-dash-metric-value">{ongoingTreatments}</span>
              <span className="treat-dash-metric-label">Ongoing Treatments</span>
            </div>
          </div>
          
          <div className="treat-dash-metric">
            <div className="treat-dash-metric-icon">✅</div>
            <div className="treat-dash-metric-info">
              <span className="treat-dash-metric-value">{vaccinatedDogs}</span>
              <span className="treat-dash-metric-label">Vaccinated Dogs</span>
            </div>
          </div>
          
          <div className="treat-dash-metric">
            <div className="treat-dash-metric-icon">🚨</div>
            <div className="treat-dash-metric-info">
              <span className="treat-dash-metric-value">{urgentCases}</span>
              <span className="treat-dash-metric-label">Urgent Cases</span>
            </div>
          </div>
        </div>
      </header>

      {/* Filters & Search Section */}
      <section className="treat-dash-filters">
        <div className="treat-dash-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by Dog ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="treat-dash-filter-group">
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select name="condition" value={filters.condition} onChange={handleFilterChange}>
            <option value="">All Conditions</option>
            {conditions.map(condition => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
          
          <select name="vet" value={filters.vet} onChange={handleFilterChange}>
            <option value="">All Vets</option>
            {vets.map(vet => (
              <option key={vet} value={vet}>{vet}</option>
            ))}
          </select>
        </div>
        
        <div className="treat-dash-view-controls">
          <button 
            className={viewMode === 'cards' ? 'treat-dash-active' : ''}
            onClick={() => setViewMode('cards')}
          >
            <i className="fas fa-th"></i> Cards
          </button>
          <button 
            className={viewMode === 'table' ? 'treat-dash-active' : ''}
            onClick={() => setViewMode('table')}
          >
            <i className="fas fa-table"></i> Table
          </button>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="treat-dash-actions">
        <button className="treat-dash-btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <i className="fas fa-plus"></i> Assign New Treatment
        </button>
        <button className="treat-dash-btn-secondary" onClick={handleExport}>
          <i className="fas fa-download"></i> Export Report
        </button>
      </section>

      {/* Add Treatment Form */}
      {showAddForm && (
        <section className="treat-dash-add-form">
          <h3>Assign New Treatment</h3>
          <form onSubmit={handleAddTreatment}>
            <div className="treat-dash-form-row">
              <div className="treat-dash-form-group">
                <label>Select Dog</label>
                <select
                  name="dogId"
                  value={newTreatment.dogId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a Dog</option>
                  {dogs.map(dog => (
                    <option key={dog.id} value={dog.id}>{dog.name} (ID: {dog.id})</option>
                  ))}
                </select>
              </div>
              
              <div className="treat-dash-form-group">
                <label>Condition / Treatment Type</label>
                <select
                  name="condition"
                  value={newTreatment.condition}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Condition</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="treat-dash-form-row">
              <div className="treat-dash-form-group">
                <label>Medicine / Vaccine</label>
                <input
                  type="text"
                  name="medicine"
                  value={newTreatment.medicine}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="treat-dash-form-group">
                <label>Assigned Vet</label>
                <select
                  name="vet"
                  value={newTreatment.vet}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Vet</option>
                  {vets.map(vet => (
                    <option key={vet} value={vet}>{vet}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="treat-dash-form-row">
              <div className="treat-dash-form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={newTreatment.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="treat-dash-form-group">
                <label>Next Treatment Date</label>
                <input
                  type="date"
                  name="nextDate"
                  value={newTreatment.nextDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="treat-dash-form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={newTreatment.status}
                  onChange={handleInputChange}
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="treat-dash-form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={newTreatment.notes}
                onChange={handleInputChange}
                rows="3"
              />
            </div>
            
            <div className="treat-dash-form-actions">
              <button type="submit" className="treat-dash-btn-primary">
                <i className="fas fa-save"></i> Save Treatment
              </button>
              <button type="button" className="treat-dash-btn-secondary" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Treatment Cards/Table View */}
      <section className="treat-dash-view">
        {viewMode === 'cards' ? (
          /* Cards View */
          <div className="treat-dash-cards">
            {filteredDogs.map(dog => (
              <div key={dog.id} className="treat-dash-card">
                <div className="treat-dash-card-header">
                  <img src={dog.photo} alt={dog.name} />
                  <div className="treat-dash-card-info">
                    <h3>{dog.name}</h3>
                    <p>{dog.breed}, {dog.age} years</p>
                  </div>
                </div>
                
                <div className="treat-dash-card-body">
                  {dog.treatments.map(treatment => (
                    <div key={treatment.id} className={`treat-dash-item ${treatment.urgent ? 'treat-dash-urgent' : ''}`}>
                      <div className="treat-dash-item-header">
                        <span className="treat-dash-condition">{treatment.condition}</span>
                        <span className={`treat-dash-status ${treatment.status.toLowerCase()}`}>
                          {treatment.status}
                          {treatment.urgent && <span className="treat-dash-urgent-indicator">🚨</span>}
                        </span>
                      </div>
                      
                      <div className="treat-dash-item-details">
                        <p><i className="fas fa-pills"></i> {treatment.medicine}</p>
                        <p><i className="fas fa-user-md"></i> {treatment.vet}</p>
                        <p><i className="fas fa-calendar"></i> Next: {treatment.nextDate}</p>
                        {treatment.notes && <p><i className="fas fa-sticky-note"></i> {treatment.notes}</p>}
                      </div>
                      
                      <div className="treat-dash-item-actions">
                        <select 
                          value={treatment.status} 
                          onChange={(e) => handleStatusUpdate(dog.id, treatment.id, e.target.value)}
                        >
                          {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        <button 
                          className="treat-dash-btn-delete"
                          onClick={() => handleDeleteTreatment(dog.id, treatment.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {dog.treatments.length === 0 && (
                    <p className="treat-dash-no-treatments">No treatments recorded for {dog.name}</p>
                  )}
                </div>
              </div>
            ))}
            
            {filteredDogs.length === 0 && (
              <p className="treat-dash-no-results">No dogs match your search criteria</p>
            )}
          </div>
        ) : (
          /* Table View */
          <div className="treat-dash-table-container">
            <table className="treat-dash-table">
              <thead>
                <tr>
                  <th>Dog Name</th>
                  <th>Condition</th>
                  <th>Medicine</th>
                  <th>Vet</th>
                  <th>Next Treatment Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDogs.map(dog => (
                  dog.treatments.map(treatment => (
                    <tr key={`${dog.id}-${treatment.id}`} className={treatment.urgent ? 'treat-dash-urgent' : ''}>
                      <td>
                        <div className="treat-dash-table-dog">
                          <img src={dog.photo} alt={dog.name} />
                          <div>
                            <div>{dog.name}</div>
                            <small>{dog.breed}, {dog.age}y</small>
                          </div>
                        </div>
                      </td>
                      <td>{treatment.condition}</td>
                      <td>{treatment.medicine}</td>
                      <td>{treatment.vet}</td>
                      <td>{treatment.nextDate}</td>
                      <td>
                        <span className={`treat-dash-status ${treatment.status.toLowerCase()}`}>
                          {treatment.status}
                          {treatment.urgent && <span className="treat-dash-urgent-indicator">🚨</span>}
                        </span>
                      </td>
                      <td>
                        <div className="treat-dash-table-actions">
                          <select 
                            value={treatment.status} 
                            onChange={(e) => handleStatusUpdate(dog.id, treatment.id, e.target.value)}
                          >
                            {statuses.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <button 
                            className="treat-dash-btn-delete"
                            onClick={() => handleDeleteTreatment(dog.id, treatment.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}
                
                {filteredDogs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="treat-dash-no-results">No treatments match your search criteria</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default TreatmentDashboard;