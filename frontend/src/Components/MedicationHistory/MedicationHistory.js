import React, { useState } from 'react';
import './MedicationHistory.css';

const MedicationHistory = () => {
  // Sample data for demonstration
  const sampleDog = {
    id: 123,
    name: "Buddy",
    breed: "Golden Retriever",
    age: 3,
    status: "Under Treatment",
    photo: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=150&h=150&fit=crop&crop=face",
    medicalHistory: [
      { 
        id: 1, 
        date: "2023-05-15", 
        medication: "Rabies Vaccine", 
        notes: "Annual vaccination, no adverse reactions", 
        vet: "Dr. Smith", 
        nextCheckup: "2024-05-15" 
      },
      { 
        id: 2, 
        date: "2023-03-10", 
        medication: "Deworming Treatment", 
        notes: "Routine deworming, administered orally", 
        vet: "Dr. Johnson", 
        nextCheckup: "" 
      },
      { 
        id: 3, 
        date: "2023-01-12", 
        medication: "DHPP Vaccine", 
        notes: "Booster shot, mild lethargy observed for 24 hours", 
        vet: "Dr. Davis", 
        nextCheckup: "" 
      },
      { 
        id: 4, 
        date: "2022-11-05", 
        medication: "Antibiotics", 
        notes: "Skin infection treatment, 10-day course completed", 
        vet: "Dr. Wilson", 
        nextCheckup: "2022-11-15" 
      }
    ]
  };

  const [dog] = useState(sampleDog);
  const [medicalHistory, setMedicalHistory] = useState(sampleDog.medicalHistory);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    medication: '',
    vet: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'descending'
  });
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    medication: '',
    notes: '',
    vet: 'Dr. Smith',
    nextCheckup: ''
  });

  // Request sort for a specific column
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Sort medical history based on sortConfig
  const sortedHistory = React.useMemo(() => {
    let sortableItems = [...medicalHistory];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [medicalHistory, sortConfig]);

  // Filter medical history based on filters
  const filteredHistory = sortedHistory.filter(record => {
    const matchesDate = !filters.date || record.date.includes(filters.date);
    const matchesMedication = !filters.medication || 
      record.medication.toLowerCase().includes(filters.medication.toLowerCase());
    const matchesVet = !filters.vet || 
      record.vet.toLowerCase().includes(filters.vet.toLowerCase());
    
    return matchesDate && matchesMedication && matchesVet;
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
    if (editingRecord) {
      setEditingRecord({
        ...editingRecord,
        [name]: value
      });
    } else {
      setNewRecord({
        ...newRecord,
        [name]: value
      });
    }
  };

  const handleAddRecord = (e) => {
    e.preventDefault();
    
    const newRecordObj = {
      id: Math.max(...medicalHistory.map(r => r.id)) + 1,
      date: newRecord.date,
      medication: newRecord.medication,
      notes: newRecord.notes,
      vet: newRecord.vet,
      nextCheckup: newRecord.nextCheckup
    };
    
    setMedicalHistory([newRecordObj, ...medicalHistory]);
    
    // Reset form
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      medication: '',
      notes: '',
      vet: 'Dr. Smith',
      nextCheckup: ''
    });
    
    setShowAddForm(false);
  };

  const handleEditRecord = (record) => {
    setEditingRecord({...record});
    setShowAddForm(true);
  };

  const handleUpdateRecord = (e) => {
    e.preventDefault();
    
    setMedicalHistory(medicalHistory.map(record => 
      record.id === editingRecord.id ? editingRecord : record
    ));
    
    setEditingRecord(null);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setShowAddForm(false);
  };

  const handleDeleteRecord = (recordId) => {
    if (window.confirm("Are you sure you want to delete this medical record?")) {
      setMedicalHistory(medicalHistory.filter(record => record.id !== recordId));
    }
  };

  const handleDownloadPDF = () => {
    // In a real application, this would generate a PDF
    alert(`Downloading medical history for ${dog.name}`);
  };

  // Check if a date is upcoming (within next 30 days)
  const isUpcoming = (dateString) => {
    if (!dateString) return false;
    
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 30 && diffDays >= 0;
  };

  // Check if a date is overdue
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    
    const dueDate = new Date(dateString);
    const today = new Date();
    return dueDate < today;
  };

  // Check if next vaccination is due soon
  const nextVaccinationDue = () => {
    const vaccination = medicalHistory.find(record => 
      record.medication.toLowerCase().includes('vaccine') && 
      record.nextCheckup
    );
    
    if (vaccination) {
      const dueDate = new Date(vaccination.nextCheckup);
      const today = new Date();
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 30) {
        return {
          message: `Next vaccination (${vaccination.medication}) due in ${diffDays} days`,
          isOverdue: diffDays < 0
        };
      }
    }
    
    return null;
  };

  const vaccinationReminder = nextVaccinationDue();

  return (
    <div className="med-history">
      {/* Page Header */}
      <header className="med-history-header">
        <div className="med-history-dog-info">
          <img src={dog.photo} alt={dog.name} className="med-history-dog-photo" />
          <div className="med-history-dog-details">
            <h1>{dog.name}</h1>
            <p>ID: {dog.id} | {dog.breed}, {dog.age} years old</p>
          </div>
        </div>
        <div className={`med-history-status ${dog.status.toLowerCase().replace(' ', '-')}`}>
          {dog.status}
        </div>
      </header>

      {/* Action Buttons */}
      <section className="med-history-actions">
        <button className="med-history-btn-primary" onClick={handleDownloadPDF}>
          <i className="fas fa-download"></i> Download Medical History
        </button>
        <button 
          className="med-history-btn-secondary" 
          onClick={() => {
            setEditingRecord(null);
            setShowAddForm(!showAddForm);
          }}
        >
          <i className="fas fa-plus"></i> {editingRecord ? 'Edit Record' : 'Add New Record'}
        </button>
      </section>

      {/* Filters Section */}
      <section className="med-history-filters">
        <h3>Filter Records</h3>
        <div className="med-history-filter-group">
          <div className="med-history-filter">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="med-history-filter">
            <label>Medication</label>
            <input
              type="text"
              name="medication"
              placeholder="Search medication..."
              value={filters.medication}
              onChange={handleFilterChange}
            />
          </div>
          <div className="med-history-filter">
            <label>Vet</label>
            <input
              type="text"
              name="vet"
              placeholder="Search vet..."
              value={filters.vet}
              onChange={handleFilterChange}
            />
          </div>
          <div className="med-history-filter">
            <label>Reset Filters</label>
            <button 
              className="med-history-btn-secondary"
              onClick={() => setFilters({ date: '', medication: '', vet: '' })}
              style={{ padding: '10px' }}
            >
              Clear All
            </button>
          </div>
        </div>
      </section>

      {/* Add/Edit Record Form */}
      {showAddForm && (
        <section className="med-history-add-form">
          <h3>{editingRecord ? 'Edit Medical Record' : 'Add New Medical Record'}</h3>
          <form onSubmit={editingRecord ? handleUpdateRecord : handleAddRecord}>
            <div className="med-history-form-row">
              <div className="med-history-form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={editingRecord ? editingRecord.date : newRecord.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="med-history-form-group">
                <label>Vet Name</label>
                <select
                  name="vet"
                  value={editingRecord ? editingRecord.vet : newRecord.vet}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Dr. Smith">Dr. Smith</option>
                  <option value="Dr. Johnson">Dr. Johnson</option>
                  <option value="Dr. Wilson">Dr. Wilson</option>
                  <option value="Dr. Brown">Dr. Brown</option>
                  <option value="Dr. Davis">Dr. Davis</option>
                </select>
              </div>
            </div>
            
            <div className="med-history-form-group">
              <label>Medication / Treatment</label>
              <input
                type="text"
                name="medication"
                placeholder="Enter medication or treatment name"
                value={editingRecord ? editingRecord.medication : newRecord.medication}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="med-history-form-group">
              <label>Notes / Comments</label>
              <textarea
                name="notes"
                placeholder="Enter observations or instructions"
                value={editingRecord ? editingRecord.notes : newRecord.notes}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>
            
            <div className="med-history-form-group">
              <label>Next Check-up Date (Optional)</label>
              <input
                type="date"
                name="nextCheckup"
                value={editingRecord ? editingRecord.nextCheckup : newRecord.nextCheckup}
                onChange={handleInputChange}
              />
              {editingRecord && editingRecord.nextCheckup && (
                <div className="med-history-date-status">
                  {isOverdue(editingRecord.nextCheckup) && (
                    <span className="status-overdue">Overdue</span>
                  )}
                  {isUpcoming(editingRecord.nextCheckup) && (
                    <span className="status-upcoming">Upcoming</span>
                  )}
                </div>
              )}
            </div>
            
            <div className="med-history-form-actions">
              <button type="submit" className="med-history-btn-primary">
                <i className="fas fa-save"></i> {editingRecord ? 'Update Record' : 'Save Record'}
              </button>
              <button 
                type="button" 
                className="med-history-btn-secondary" 
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Medical History Table */}
      <section className="med-history-table-section">
        <h2>Medical History</h2>
        
        {filteredHistory.length > 0 ? (
          <div className="med-history-table-container">
            <table className="med-history-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('date')}>
                    Date {sortConfig.key === 'date' && (
                      <i className={`fas fa-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                    )}
                  </th>
                  <th onClick={() => requestSort('medication')}>
                    Medication / Treatment {sortConfig.key === 'medication' && (
                      <i className={`fas fa-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                    )}
                  </th>
                  <th>Notes</th>
                  <th onClick={() => requestSort('vet')}>
                    Vet {sortConfig.key === 'vet' && (
                      <i className={`fas fa-arrow-${sortConfig.direction === 'ascending' ? 'up' : 'down'}`}></i>
                    )}
                  </th>
                  <th>Next Check-up</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(record => (
                  <tr key={record.id} className={isUpcoming(record.nextCheckup) ? 'upcoming' : ''}>
                    <td>{record.date}</td>
                    <td>{record.medication}</td>
                    <td>{record.notes}</td>
                    <td>{record.vet}</td>
                    <td>
                      {record.nextCheckup || '-'}
                      {record.nextCheckup && (
                        <div className="med-history-date-status">
                          {isOverdue(record.nextCheckup) && (
                            <span className="status-overdue">Overdue</span>
                          )}
                          {isUpcoming(record.nextCheckup) && (
                            <span className="status-upcoming">Upcoming</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="med-history-record-actions">
                        <button 
                          className="med-history-btn-edit" 
                          onClick={() => handleEditRecord(record)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="med-history-btn-delete" 
                          onClick={() => handleDeleteRecord(record.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="med-history-no-records">No medical records found for {dog.name} with the current filters.</p>
        )}
      </section>

      {/* Footer with Reminders */}
      <footer className="med-history-footer">
        {vaccinationReminder && (
          <div className={`med-history-reminder ${vaccinationReminder.isOverdue ? 'overdue' : ''}`}>
            <i className="fas fa-bell"></i> {vaccinationReminder.message}
          </div>
        )}
        <p>Medical records last updated: {new Date().toLocaleDateString()}</p>
      </footer>
    </div>
  );
};

export default MedicationHistory;