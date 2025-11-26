import React, { useState } from 'react';
import './MedicalRecords.css';

const MedicalRecords = () => {
  // Sample data for demonstration
  const sampleDogs = [
    {
      id: 1,
      name: "Buddy",
      breed: "Golden Retriever",
      age: 3,
      gender: "Male",
      status: "In Shelter",
      healthStatus: "Healthy",
      photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face",
      vaccinationStatus: "Fully Vaccinated",
      medicalHistory: [
        { id: 1, date: "2023-05-15", type: "Vaccination", medicine: "Rabies Vaccine", vetName: "Dr. Smith", notes: "Annual vaccination" },
        { id: 2, date: "2023-03-10", type: "Check-up", medicine: "None", vetName: "Dr. Johnson", notes: "Routine check-up" }
      ]
    },
    {
      id: 2,
      name: "Luna",
      breed: "German Shepherd",
      age: 2,
      gender: "Female",
      status: "In Shelter",
      healthStatus: "Needs Care",
      photo: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=150&h=150&fit=crop&crop=face",
      vaccinationStatus: "Partially Vaccinated",
      medicalHistory: [
        { id: 1, date: "2023-06-20", type: "Treatment", medicine: "Antibiotics", vetName: "Dr. Wilson", notes: "Skin infection treatment" }
      ]
    },
    {
      id: 3,
      name: "Max",
      breed: "Labrador",
      age: 4,
      gender: "Male",
      status: "Adopted",
      healthStatus: "Healthy",
      photo: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&h=150&fit=crop&crop=face",
      vaccinationStatus: "Fully Vaccinated",
      medicalHistory: [
        { id: 1, date: "2023-04-05", type: "Surgery", medicine: "Anesthesia", vetName: "Dr. Brown", notes: "Spay surgery" },
        { id: 2, date: "2023-01-12", type: "Vaccination", medicine: "DHPP Vaccine", vetName: "Dr. Davis", notes: "Booster shot" }
      ]
    }
  ];

  const [selectedDog, setSelectedDog] = useState(null);
  const [dogs, setDogs] = useState(sampleDogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRecord, setNewRecord] = useState({
    date: '',
    type: '',
    description: '',
    medicine: '',
    vetName: '',
    file: null
  });

  // Filter dogs based on search term
  const filteredDogs = dogs.filter(dog => 
    dog.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    dog.id.toString().includes(searchTerm)
  );

  const handleSelectDog = (dog) => {
    setSelectedDog(dog);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecord({
      ...newRecord,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setNewRecord({
      ...newRecord,
      file: e.target.files[0]
    });
  };

  const handleSubmitRecord = (e) => {
    e.preventDefault();
    if (!selectedDog) return;
    
    const updatedRecord = {
      id: selectedDog.medicalHistory.length + 1,
      date: newRecord.date,
      type: newRecord.type,
      medicine: newRecord.medicine,
      vetName: newRecord.vetName,
      notes: newRecord.description
    };

    const updatedDogs = dogs.map(dog => {
      if (dog.id === selectedDog.id) {
        return {
          ...dog,
          medicalHistory: [...dog.medicalHistory, updatedRecord]
        };
      }
      return dog;
    });

    setDogs(updatedDogs);
    setSelectedDog(updatedDogs.find(dog => dog.id === selectedDog.id));
    
    // Reset form
    setNewRecord({
      date: '',
      type: '',
      description: '',
      medicine: '',
      vetName: '',
      file: null
    });
  };

  const handleDeleteRecord = (recordId) => {
    const updatedDogs = dogs.map(dog => {
      if (dog.id === selectedDog.id) {
        return {
          ...dog,
          medicalHistory: dog.medicalHistory.filter(record => record.id !== recordId)
        };
      }
      return dog;
    });

    setDogs(updatedDogs);
    setSelectedDog(updatedDogs.find(dog => dog.id === selectedDog.id));
  };

  const handleDownloadReport = () => {
    if (!selectedDog) return;
    
    // In a real application, this would generate a PDF
    alert(`Downloading medical report for ${selectedDog.name}`);
  };

  return (
    <div className="med-records">
      {/* Header Section */}
      <header className="med-header">
        <h1>Medical Records Management</h1>
        <p>Add, view, and manage vaccination and treatment history of rescued dogs.</p>
      </header>

      {/* Dog Selector Section */}
      <section className="med-dog-selector">
        <div className="med-search-container">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search by Dog ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="med-dog-list">
          {filteredDogs.map(dog => (
            <div 
              key={dog.id} 
              className={`med-dog-item ${selectedDog?.id === dog.id ? 'selected' : ''}`}
              onClick={() => handleSelectDog(dog)}
            >
              <img src={dog.photo} alt={dog.name} />
              <div className="med-dog-info">
                <span className="med-dog-name">{dog.name}</span>
                <span className="med-dog-id">ID: {dog.id}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedDog && (
        <>
          {/* Dog Info Card */}
          <section className="med-dog-info-card">
            <div className="med-dog-photo">
              <img src={selectedDog.photo} alt={selectedDog.name} />
            </div>
            <div className="med-dog-details">
              <h2>{selectedDog.name}</h2>
              <div className="med-dog-stats">
                <p><span>Breed:</span> {selectedDog.breed}</p>
                <p><span>Age:</span> {selectedDog.age} years</p>
                <p><span>Gender:</span> {selectedDog.gender}</p>
              </div>
              <div className="med-status-badges">
                <span className={`med-status-badge ${selectedDog.status.toLowerCase().replace(' ', '-')}`}>
                  {selectedDog.status}
                </span>
                <span className={`med-health-badge ${selectedDog.healthStatus.toLowerCase().replace(' ', '-')}`}>
                  {selectedDog.healthStatus}
                </span>
              </div>
            </div>
            <div className="med-vaccination-status">
              <h3>Vaccination Status</h3>
              <div className={`med-vax-badge ${selectedDog.vaccinationStatus.toLowerCase().replace(' ', '-')}`}>
                {selectedDog.vaccinationStatus === "Fully Vaccinated" && <><i className="fas fa-check-circle"></i> Fully Vaccinated</>}
                {selectedDog.vaccinationStatus === "Partially Vaccinated" && <><i className="fas fa-exclamation-triangle"></i> Partially Vaccinated</>}
                {selectedDog.vaccinationStatus === "Not Vaccinated" && <><i className="fas fa-times-circle"></i> Not Vaccinated</>}
              </div>
              <button className="med-download-btn" onClick={handleDownloadReport}>
                <i className="fas fa-download"></i> Download Medical Report
              </button>
            </div>
          </section>

          {/* Add New Record Form */}
          <section className="med-add-record-form">
            <h3>Add New Medical Record</h3>
            <form onSubmit={handleSubmitRecord}>
              <div className="med-form-row">
                <div className="med-form-group">
                  <label>Date of Treatment</label>
                  <input
                    type="date"
                    name="date"
                    value={newRecord.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="med-form-group">
                  <label>Type of Record</label>
                  <select
                    name="type"
                    value={newRecord.type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Check-up">Check-up</option>
                    <option value="Treatment">Treatment</option>
                  </select>
                </div>
              </div>
              
              <div className="med-form-group">
                <label>Description / Notes</label>
                <textarea
                  name="description"
                  value={newRecord.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="med-form-row">
                <div className="med-form-group">
                  <label>Medicine / Vaccine Name</label>
                  <input
                    type="text"
                    name="medicine"
                    value={newRecord.medicine}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="med-form-group">
                  <label>Vet Name</label>
                  <input
                    type="text"
                    name="vetName"
                    value={newRecord.vetName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="med-form-group">
                <label>Upload File (Optional)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
              
              <button type="submit" className="med-save-btn">
                <i className="fas fa-save"></i> Save Record
              </button>
            </form>
          </section>

          {/* Medical History Table */}
          <section className="med-history">
            <h3>Medical History</h3>
            {selectedDog.medicalHistory.length > 0 ? (
              <table className="med-records-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Record Type</th>
                    <th>Medicine</th>
                    <th>Vet Name</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDog.medicalHistory.map(record => (
                    <tr key={record.id}>
                      <td>{record.date}</td>
                      <td>
                        <span className={`med-record-type ${record.type.toLowerCase()}`}>
                          {record.type}
                        </span>
                      </td>
                      <td>{record.medicine}</td>
                      <td>{record.vetName}</td>
                      <td>{record.notes}</td>
                      <td>
                        <button className="med-edit-btn">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="med-delete-btn"
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="med-no-records">No medical records found for {selectedDog.name}.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default MedicalRecords;