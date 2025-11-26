import React, { useState, useEffect } from 'react';
import rescueRequestAPI from '../../api/rescueRequestAPI';
import './RescueDashboard.css';
import { Ambulance, Edit, Eye, Trash2 } from 'lucide-react';

const RescueDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({});

  // Street dog images for variety
  const streetDogImages = [
    'https://images.unsplash.com/photo-1554692918-08fa0fdc9db3?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1517423568366-8b83523034fd?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1583512603806-077998240c7a?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop'
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fetch reports from API
      const response = await rescueRequestAPI.getAllRescueRequests({ excludeEmergency: true });
      const apiReports = response.data || [];
      // Exclude emergency reports from dashboard view
      const nonEmergencyReports = apiReports.filter(r => (r.urgency || '').toLowerCase() !== 'emergency');
      
      // If API has no reports at all, use mock data for demonstration
      if (apiReports.length === 0) {
        // Keep existing mock data for demonstration
        const mockReports = [
          {
            id: 1,
            date: '2025-05-15T14:30:00Z',
            description: 'Injured dog near central park',
            location: '40.7829° N, 73.9654° W',
            status: 'completed',
            urgency: 'high',
            image: 'https://i.pinimg.com/736x/d6/53/b9/d653b9bb3a4b2639e74a6f467a220240.jpg',
            reporter: 'Achala Eranga',
            reporterContact: '0765645123',
            rescueTeam: 'Safe Haven Crew',
            assignedTo: 'sunil.wijesinghe.435@gmail.com',
            completedDate: '2025-05-15T16:45:00Z'
          },
          {
            id: 2,
            date: '2025-09-10T09:15:00Z',
            description: 'Stray dog looking malnourished',
            location: '40.7589° N, 73.9851° W',
            status: 'in-progress',
            urgency: 'medium',
            image: 'https://i.pinimg.com/736x/20/04/20/200420dd0d9d01911d004016284f53ab.jpg',
            reporter: 'Sanduni Silva',
            reporterContact: '0771234567',
            rescueTeam: 'Paw Protectors',
            assignedTo: 'nadeesha.fernando.456@gmail.com',
            completedDate: null
          },
          {
            id: 3,
            date: '2025-09-05T17:20:00Z',
            description: 'Aggressive dog in residential area',
            location: '40.7282° N, 73.9942° W',
            status: 'pending',
            urgency: 'high',
            image: 'https://i.pinimg.com/736x/f6/19/84/f61984c637533dd9062e08b371fd5035.jpg',
            reporter: 'Thaththya De Silva',
            reporterContact: '0712345674',
            rescueTeam: null,
            assignedTo: null,
            completedDate: null
          },
          {
            id: 4,
            date: '2025-09-03T11:45:00Z',
            description: 'Puppies abandoned in box',
            location: '40.7614° N, 73.9776° W',
            status: 'pending',
            urgency: 'medium',
            image: 'https://i.pinimg.com/736x/55/c3/0b/55c30b7185e5832278002ea72603caca.jpg',
            reporter: 'Dinesh Gamage',
            reporterContact: '0756789123',
            rescueTeam: null,
            assignedTo: null,
            completedDate: null
          },
          {
            id: 5,
            date: '2025-09-01T08:20:00Z',
            description: 'Dog with injured leg',
            location: '40.7505° N, 73.9934° W',
            status: 'pending',
            urgency: 'high',
            image: 'https://i.pinimg.com/736x/8f/6c/54/8f6c54edceec2d3c35dc63c2f5d796c4.jpg',
            reporter: 'Chamika Karunarathne',
            reporterContact: '0712378956',
            rescueTeam: null,
            assignedTo: null,
            completedDate: null
          }
        ];
        setReports(mockReports);
      } else {
        // Use real data from API (excluding emergency)
        setReports(nonEmergencyReports);
      }
      
      // Calculate stats from the data being displayed
      const baseForStats = apiReports.length > 0 ? nonEmergencyReports : [
        ...Array(5).fill().map((_, i) => ({ status: i < 2 ? 'pending' : i < 4 ? 'in-progress' : 'completed' }))
      ];
      
      setStats({
        total: baseForStats.length,
        pending: baseForStats.filter(r => r.status === 'pending').length,
        inProgress: baseForStats.filter(r => r.status === 'in-progress').length,
        completed: baseForStats.filter(r => r.status === 'completed').length
      });

      // Fetch drivers from API
      try {
        const driversResponse = await rescueRequestAPI.getAvailableDrivers();
        if (driversResponse.success) {
          setDrivers(driversResponse.data);
        } else {
          console.error('Failed to fetch drivers:', driversResponse.message);
          // Fallback to mock data
          const mockDrivers = [
            { id: 'driver1', name: 'Achala Perera', email: 'achala.perera.123@gmail.com', team: 'Rescue Rangers', available: true },
            { id: 'driver2', name: 'Nadeesha Fernando', email: 'nadeesha.fernando.456@gmail.com', team: 'Paw Protectors', available: false },
            { id: 'driver3', name: 'Chaminda Silva', email: 'chaminda.silva.789@gmail.com', team: 'Swift Responders', available: true },
            { id: 'driver4', name: 'Sunil Wijesinghe', email: 'sunil.wijesinghe.435@gmail.com', team: 'Safe Haven Crew', available: true }
          ];
          setDrivers(mockDrivers);
        }
      } catch (error) {
        console.error('Error fetching drivers:', error);
        // Fallback to mock data on error
        const mockDrivers = [
          { id: 'driver1', name: 'Achala Perera', email: 'achala.perera.123@gmail.com', team: 'Rescue Rangers', available: true },
          { id: 'driver2', name: 'Nadeesha Fernando', email: 'nadeesha.fernando.456@gmail.com', team: 'Paw Protectors', available: false },
          { id: 'driver3', name: 'Chaminda Silva', email: 'chaminda.silva.789@gmail.com', team: 'Swift Responders', available: true },
          { id: 'driver4', name: 'Sunil Wijesinghe', email: 'sunil.wijesinghe.435@gmail.com', team: 'Safe Haven Crew', available: true }
        ];
        setDrivers(mockDrivers);
      }
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Fallback to mock data on error
      const mockReports = [
        {
          id: 1,
          date: '2025-05-15T14:30:00Z',
          description: 'Injured dog near central park',
          location: '40.7829° N, 73.9654° W',
          status: 'completed',
          urgency: 'high',
          image: 'https://i.pinimg.com/736x/d6/53/b9/d653b9bb3a4b2639e74a6f467a220240.jpg',
          reporter: 'Achala Eranga',
          reporterContact: '0765645123',
          rescueTeam: 'Safe Haven Crew',
          assignedTo: 'sunil.wijesinghe.435@gmail.com',
          completedDate: '2025-05-15T16:45:00Z'
        }
      ];
      setReports(mockReports);
      setStats({ total: 1, pending: 0, inProgress: 0, completed: 1 });
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(report => report.status === filter);

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Pending' },
      'in-progress': { class: 'status-in-progress', text: 'In Progress' },
      completed: { class: 'status-completed', text: 'Completed' }
    };
    
    const config = statusConfig[status] || { class: 'status-unknown', text: 'Unknown' };
    return <span className={`status-badge ${config.class}`}>{config.text}</span>;
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      low: { class: 'urgency-low', text: 'Low' },
      medium: { class: 'urgency-medium', text: 'Medium' },
      high: { class: 'urgency-high', text: 'High' }
    };
    
    const config = urgencyConfig[urgency] || { class: 'urgency-unknown', text: 'Unknown' };
    return <span className={`urgency-badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openAssignModal = (report) => {
    setSelectedReport(report);
    setSelectedDriver('');
    setShowAssignModal(true);
  };

  const assignDriver = async () => {
    if (!selectedDriver) return;
    
    try {
      const driver = drivers.find(d => d.id === selectedDriver);
      
      // Call API to assign driver
      await rescueRequestAPI.assignDriverToRequest(
        selectedReport.id,
        driver.id,
        driver.name
      );
      
      // Update local state
      const updatedReports = reports.map(report => {
        if (report.id === selectedReport.id) {
          return {
            ...report,
            status: 'in-progress',
            assignedTo: driver.email,
            rescueTeam: driver.team
          };
        }
        return report;
      });
      
      setReports(updatedReports);
      
      // Update stats
      setStats({
        total: updatedReports.length,
        pending: updatedReports.filter(r => r.status === 'pending').length,
        inProgress: updatedReports.filter(r => r.status === 'in-progress').length,
        completed: updatedReports.filter(r => r.status === 'completed').length
      });
      
      setShowAssignModal(false);
      alert('Driver assigned successfully!');
      
    } catch (error) {
      console.error('Error assigning driver:', error);
      alert('Failed to assign driver. Please try again.');
    }
  };

  const completeRescue = async (reportId) => {
    try {
      // Call API to complete rescue
      await rescueRequestAPI.updateRescueRequestStatus(reportId, 'Rescued', 'Rescue completed successfully');
      
      // Update local state
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            status: 'completed',
            completedDate: new Date().toISOString()
          };
        }
        return report;
      });
      
      setReports(updatedReports);
      
      // Update stats
      setStats({
        total: updatedReports.length,
        pending: updatedReports.filter(r => r.status === 'pending').length,
        inProgress: updatedReports.filter(r => r.status === 'in-progress').length,
        completed: updatedReports.filter(r => r.status === 'completed').length
      });
      
      alert('Rescue marked as completed!');
      
    } catch (error) {
      console.error('Error completing rescue:', error);
      alert('Failed to complete rescue. Please try again.');
    }
  };

  // View report details
  const viewReport = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  // Open update modal
  const openUpdateModal = (report) => {
    setSelectedReport(report);
    setUpdateFormData({
      description: report.description || '',
      location: report.location || '',
      urgency: report.urgency || 'medium',
      status: report.status || 'pending',
      assignedTo: report.assignedTo || ''
    });
    setShowUpdateModal(true);
  };

  // Handle update form changes
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Update report
  const updateReport = async () => {
    try {
      // Call API to update report
      await rescueRequestAPI.updateRescueRequest(selectedReport.id, updateFormData);
      
      // Update local state
      const updatedReports = reports.map(report => {
        if (report.id === selectedReport.id) {
          return {
            ...report,
            ...updateFormData
          };
        }
        return report;
      });
      
      setReports(updatedReports);
      
      // Update stats
      setStats({
        total: updatedReports.length,
        pending: updatedReports.filter(r => r.status === 'pending').length,
        inProgress: updatedReports.filter(r => r.status === 'in-progress').length,
        completed: updatedReports.filter(r => r.status === 'completed').length
      });
      
      setShowUpdateModal(false);
      alert('Report updated successfully!');
      
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report. Please try again.');
    }
  };

  // Delete report
  const deleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        // Call API to delete report
        await rescueRequestAPI.deleteRescueRequest(reportId);
        
        // Update local state
        const updatedReports = reports.filter(report => report.id !== reportId);
        setReports(updatedReports);
        
        // Update stats
        setStats({
          total: updatedReports.length,
          pending: updatedReports.filter(r => r.status === 'pending').length,
          inProgress: updatedReports.filter(r => r.status === 'in-progress').length,
          completed: updatedReports.filter(r => r.status === 'completed').length
        });
        
        alert('Report deleted successfully!');
        
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Failed to delete report. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="rescue-dashboard">
      <h1>Rescue Management Dashboard</h1>
     
      
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.completed}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>
      
      <div className="dashboard-controls">
        <div className="reports-filter">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Reports
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button 
            className={filter === 'in-progress' ? 'active' : ''} 
            onClick={() => setFilter('in-progress')}
          >
            In Progress ({stats.inProgress})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Completed ({stats.completed})
          </button>
        </div>
        
        {/* Export Reports button removed as requested */}
      </div>
      
      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Description</th>
              <th>Reporter</th>
              <th>Location</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Date Reported</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map(report => (
              <tr key={report.id}>
                <td>#{report.id}</td>
                <td className="description-cell">
                  <div className="description-text">{report.description}</div>
                  {report.image && (
                    <div className="image-thumbnail">
                      <img src={`http://localhost:3000${report.image}`} alt="Report" />
                    </div>
                  )}
                </td>
                <td>
                  <div>{report.reporter}</div>
                  <div className="contact-info">{report.reporterContact}</div>
                </td>
                <td>{report.location}</td>
                <td>{getUrgencyBadge(report.urgency)}</td>
                <td>{getStatusBadge(report.status)}</td>
                <td>
                  {report.assignedTo 
                    ? drivers.find(d => d.email === report.assignedTo)?.name || report.assignedTo 
                    : 'Not assigned'}
                </td>
                <td>{formatDate(report.date)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="view-btn"
                      onClick={() => viewReport(report)}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="update-btn"
                      onClick={() => openUpdateModal(report)}
                    >
                       <Edit size={16} />
                    </button>
                    {report.status === 'pending' && (
                      <button 
                        className="assign-btn"
                        onClick={() => openAssignModal(report)}
                      >
                       <Ambulance size={16} />
                      </button>
                    )}
                    {report.status === 'in-progress' && (
                      <button 
                        className="complete-btn"
                        onClick={() => completeRescue(report.id)}
                      >
                        Complete
                      </button>
                    )}
                    <button 
                      className="delete-btn"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Assign Rescue Team</h2>
              <button 
                className="close-btn"
                onClick={() => setShowAssignModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Assign a driver to report #{selectedReport.id}: {selectedReport.description}</p>
              
              <div className="form-group">
                <label htmlFor="driver-select">Select Driver:</label>
                <select 
                  id="driver-select"
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                >
                  <option value="">Choose a driver</option>
                  {drivers
                    .filter(driver => driver.available)
                    .map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} ({driver.team}) - {driver.available ? 'Available' : 'Unavailable'}
                      </option>
                    ))
                  }
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowAssignModal(false)}
              >
                Cancel
              </button>
              <button 
                className="assign-confirm-btn"
                onClick={assignDriver}
                disabled={!selectedDriver}
              >
                Assign Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {showViewModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Report Details</h2>
              <button 
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="report-details">
                <div className="detail-row">
                  <label>ID:</label>
                  <span>#{selectedReport.id}</span>
                </div>
                <div className="detail-row">
                  <label>Description:</label>
                  <span>{selectedReport.description}</span>
                </div>
                <div className="detail-row">
                  <label>Reporter:</label>
                  <span>{selectedReport.reporter}</span>
                </div>
                <div className="detail-row">
                  <label>Contact:</label>
                  <span>{selectedReport.reporterContact}</span>
                </div>
                <div className="detail-row">
                  <label>Location:</label>
                  <span>{selectedReport.location}</span>
                </div>
                <div className="detail-row">
                  <label>Urgency:</label>
                  <span>{getUrgencyBadge(selectedReport.urgency)}</span>
                </div>
                <div className="detail-row">
                  <label>Status:</label>
                  <span>{getStatusBadge(selectedReport.status)}</span>
                </div>
                <div className="detail-row">
                  <label>Assigned To:</label>
                  <span>
                    {selectedReport.assignedTo 
                      ? drivers.find(d => d.email === selectedReport.assignedTo)?.name || selectedReport.assignedTo 
                      : 'Not assigned'}
                  </span>
                </div>
                <div className="detail-row">
                  <label>Date Reported:</label>
                  <span>{formatDate(selectedReport.date)}</span>
                </div>
                {selectedReport.completedDate && (
                  <div className="detail-row">
                    <label>Completed Date:</label>
                    <span>{formatDate(selectedReport.completedDate)}</span>
                  </div>
                )}
                {selectedReport.image && (
                  <div className="detail-row">
                    <label>Image:</label>
                    <div className="image-preview">
                      <img src={`http://localhost:3000${selectedReport.image}`} alt="Report" />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="close-btn"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Report Modal */}
      {showUpdateModal && selectedReport && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Report</h2>
              <button 
                className="close-btn"
                onClick={() => setShowUpdateModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="description">Description:</label>
                <textarea
                  id="description"
                  name="description"
                  value={updateFormData.description}
                  onChange={handleUpdateChange}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={updateFormData.location}
                  onChange={handleUpdateChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="urgency">Urgency:</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={updateFormData.urgency}
                  onChange={handleUpdateChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="status">Status:</label>
                <select
                  id="status"
                  name="status"
                  value={updateFormData.status}
                  onChange={handleUpdateChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="assignedTo">Assigned To:</label>
                <input
                  type="text"
                  id="assignedTo"
                  name="assignedTo"
                  value={updateFormData.assignedTo}
                  onChange={handleUpdateChange}
                  placeholder="Driver email or name"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="update-confirm-btn"
                onClick={updateReport}
              >
                Update Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RescueDashboard;