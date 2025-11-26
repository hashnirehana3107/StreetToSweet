import React, { useState, useEffect } from 'react';
import rescueRequestAPI from '../../api/rescueRequestAPI';
import './MyReports.css';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Fetch user's own reports from backend
    const fetchReports = async () => {
      try {
        setLoading(true);
        
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (token) {
          // Fetch real reports from API
          const response = await rescueRequestAPI.getMyRescueRequests();
          const apiReports = response.data || [];
          
          if (apiReports.length > 0) {
            setReports(apiReports);
          } else {
            // If no real reports, use mock data for demonstration
            setReports(getMockReports());
          }
        } else {
          // If not logged in, show mock data
          setReports(getMockReports());
        }
        
      } catch (error) {
        console.error('Error fetching reports:', error);
        // Fallback to mock data on error
        setReports(getMockReports());
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const getMockReports = () => {
    return [
      {
        id: 1,
        date: '2025-09-15T14:30:00Z',
        description: 'Injured dog near central park',
        location: '40.7829° N, 73.9654° W',
        status: 'completed',
        urgency: 'high',
        image: 'https://i.pinimg.com/736x/d6/53/b9/d653b9bb3a4b2639e74a6f467a220240.jpg',
        rescueTeam: 'Swift Responders',
        completedDate: '2025-09-15T16:45:00Z',
        additionalInfo: 'The dog had a deep cut on its left hind leg. It was hiding under a bench and seemed scared of people.',
        actionsTaken: 'Provided first aid, transported to veterinary clinic for stitches and antibiotics.',
        outcome: 'Dog recovered fully and was adopted by a local family two weeks later.',
        contactPerson: 'Dr. Sarah De Silva - 0776789123'
      },
      {
        id: 2,
        date: '2025-09-10T09:15:00Z',
        description: 'Stray dog looking malnourished',
        location: '40.7589° N, 73.9851° W',
        status: 'in-progress',
        urgency: 'medium',
        image: 'https://i.pinimg.com/736x/20/04/20/200420dd0d9d01911d004016284f53ab.jpg',
        rescueTeam: 'Rescue Rangers',
        completedDate: null,
        additionalInfo: 'The dog appears to be a stray for several weeks. Very skinny but approachable.',
        actionsTaken: 'Currently being fed regularly at the location while we monitor its health.',
        outcome: 'Pending assessment for possible adoption.',
        contactPerson: 'Officer Kamal Herath - 0775645345'
      },
      {
        id: 3,
        date: '2025-09-05T17:20:00Z',
        description: 'Aggressive dog in residential area',
        location: '40.7282° N, 73.9942° W',
        status: 'pending',
        urgency: 'high',
        image: 'https://i.pinimg.com/736x/f6/19/84/f61984c637533dd9062e08b371fd5035.jpg',
        rescueTeam: null,
        completedDate: null,
        additionalInfo: 'Dog has been barking aggressively at pedestrians. Appears to be guarding an abandoned building.',
        actionsTaken: 'Report has been logged and is awaiting assignment to a rescue team.',
        outcome: 'Pending',
        contactPerson: 'Not assigned yet'
      },
      {
        id: 4,
        date: '2025-09-01T11:45:00Z',
        description: 'Abandoned puppy in cardboard box',
        location: '40.7614° N, 73.9776° W',
        status: 'completed',
        urgency: 'medium',
        image: 'https://i.pinimg.com/736x/55/c3/0b/55c30b7185e5832278002ea72603caca.jpg',
        rescueTeam: 'Safe Haven Crew',
        completedDate: '2025-09-02T09:30:00Z',
        additionalInfo: 'A small puppy (approx. 8 weeks old) was found in a cardboard box near the theater district.',
        actionsTaken: 'Puppy was examined by a vet, given vaccinations, and placed in a foster home.',
        outcome: 'Puppy was healthy and adopted within one week.',
        contactPerson: 'Volunteer Asha Heshani - 0765645123'
      },
      {
        id: 5,
        date: '2025-09-28T16:20:00Z',
        description: 'Dog with injured leg near subway station',
        location: '40.7505° N, 73.9934° W',
        status: 'in-progress',
        urgency: 'high',
        image: 'https://i.pinimg.com/736x/8f/6c/54/8f6c54edceec2d3c35dc63c2f5d796c4.jpg',
        rescueTeam: 'Swift Responders',
        completedDate: null,
        additionalInfo: 'The dog is limping noticeably and appears to be in pain. It stays near the subway entrance but runs when approached.',
        actionsTaken: 'Rescue team is setting up a humane trap to safely capture the dog for treatment.',
        outcome: 'Pending successful capture and treatment.',
        contactPerson: 'Dr.Mahesh Elipitiya - 0775645231'
      },
      {
        id: 6,
        date: '2025-09-05T15:20:00Z',
        description: 'Injured stray near marketplace',
        location: '40.7484° N, 73.9857° W',
        status: 'completed',
        urgency: 'high',
        image: 'https://i.pinimg.com/736x/d9/5c/fe/d95cfefb2aae39272e926a0e01831e0b.jpg',
        rescueTeam: 'Paw Protectors',
        completedDate: '2025-09-06T13:15:00Z',
        additionalInfo: 'A stray dog was spotted limping with a visible wound on its back leg near the crowded marketplace.',
        actionsTaken: 'The dog was transported to the clinic, wound cleaned and stitched, antibiotics administered, and kept under observation.',
        outcome: 'Dog recovered within two weeks and later moved to the shelter for adoption.',
        contactPerson: 'Volunteer Kasun Perera - 0764567456'
      }
    ];
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

  const openReportModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="my-res-my-reports-loading">
        <div className="my-res-loading-spinner"></div>
        <p>Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="my-res-reports">
      <h1>My Rescue Reports</h1>
      <p className="my-res-reports-description">
        Track the status of your submitted animal rescue reports. See how your contributions are making a difference in animal welfare.
      </p>
      
      <div className="my-res-reports-filter">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          All Reports ({reports.length})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Pending ({reports.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={filter === 'in-progress' ? 'active' : ''} 
          onClick={() => setFilter('in-progress')}
        >
          In Progress ({reports.filter(r => r.status === 'in-progress').length})
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''} 
          onClick={() => setFilter('completed')}
        >
          Completed ({reports.filter(r => r.status === 'completed').length})
        </button>
      </div>

      {filteredReports.length === 0 ? (
        <div className="my-res-no-reports">
          <h3>No reports found</h3>
          <p>You haven't submitted any rescue reports yet.</p>
          <button 
            onClick={() => window.location.href = '/reportstray'}
            className="my-res-submit-report-btn"
          >
            Submit Your First Report
          </button>
        </div>
      ) : (
        <div className="my-res-reports-grid">
          {filteredReports.map(report => (
            <div key={report.id} className="my-res-report-card">
              <div className="my-res-report-image">
                {report.image ? (
                  <img src={report.image} alt="Animal" />
                ) : (
                  <div className="my-res-no-image">No Image</div>
                )}
              </div>
              <div className="my-res-report-content">
                <div className="my-res-report-header">
                  <h3>Report #{report.id}</h3>
                  <div className="badges">
                    {getStatusBadge(report.status)}
                    {getUrgencyBadge(report.urgency)}
                  </div>
                </div>
                <p className="my-res-report-description">{report.description}</p>
                <div className="my-res-report-details">
                  <div className="my-res-detail-item">
                    <strong>Location:</strong> {report.location}
                  </div>
                  <div className="my-res-detail-item">
                    <strong>Reported:</strong> {formatDate(report.date)}
                  </div>
                  {report.rescueTeam && (
                    <div className="my-res-detail-item">
                      <strong>Rescue Team:</strong> {report.rescueTeam}
                    </div>
                  )}
                  {report.completedDate && (
                    <div className="my-res-detail-item">
                      <strong>Completed:</strong> {formatDate(report.completedDate)}
                    </div>
                  )}
                </div>
                <button 
                  className="my-res-view-details-btn"
                  onClick={() => openReportModal(report)}
                >
                  View Full Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedReport && (
        <div className="my-res-modal-overlay">
          <div className="my-res-modal">
            <div className="my-res-modal-header">
              <h2>Report #{selectedReport.id} Details</h2>
              <button 
                className="my-res-close-btn"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="my-res-modal-body">
              <div className="my-res-modal-report-image">
                {selectedReport.image ? (
                  <img src={selectedReport.image} alt="Animal" />
                ) : (
                  <div className="my-res-no-image">No Image Available</div>
                )}
              </div>
              
              <div className="my-res-modal-details">
                <div className="my-res-detail-section">
                  <h3>Basic Information</h3>
                  <div className="my-res-detail-grid">
                    <div className="my-res-detail-item">
                      <strong>Description:</strong> {selectedReport.description}
                    </div>
                    <div className="my-res-detail-item">
                      <strong>Location:</strong> {selectedReport.location}
                    </div>
                    <div className="my-res-detail-item">
                      <strong>Urgency:</strong> {getUrgencyBadge(selectedReport.urgency)}
                    </div>
                    <div className="my-res-detail-item">
                      <strong>Status:</strong> {getStatusBadge(selectedReport.status)}
                    </div>
                    <div className="my-res-detail-item">
                      <strong>Date Reported:</strong> {formatDate(selectedReport.date)}
                    </div>
                    {selectedReport.completedDate && (
                      <div className="my-res-detail-item">
                        <strong>Date Completed:</strong> {formatDate(selectedReport.completedDate)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="my-res-detail-section">
                  <h3>Additional Information</h3>
                  <div className="my-res-detail-item">
                    <strong>Additional Details:</strong>
                    <p>{selectedReport.additionalInfo}</p>
                  </div>
                </div>

                <div className="my-res-detail-section">
                  <h3>Progress & Actions</h3>
                  <div className="my-res-detail-item">
                    <strong>Actions Taken:</strong>
                    <p>{selectedReport.actionsTaken}</p>
                  </div>
                  <div className="my-res-detail-item">
                    <strong>Current Outcome:</strong>
                    <p>{selectedReport.outcome}</p>
                  </div>
                  {selectedReport.rescueTeam && (
                    <div className="my-res-detail-item">
                      <strong>Assigned Rescue Team:</strong> {selectedReport.rescueTeam}
                    </div>
                  )}
                  <div className="my-res-detail-item">
                    <strong>Contact Person:</strong> {selectedReport.contactPerson}
                  </div>
                </div>
              </div>
            </div>
            <div className="my-res-modal-footer">
              <button 
                className="my-res-close-modal-btn"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;
