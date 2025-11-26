import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaPaw,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaDownload,
  FaTrash,
  FaBell,
  FaCheck,
  FaFilter,
  FaChevronDown,
  FaTimes,
  FaEye,
  FaFile,
  FaFileWord,
  FaFileExcel,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";
import { Clipboard, BellRing, Dog, PawPrint, ShieldCheck, X } from "lucide-react";
import "./MyAdoptionDashboard.css";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

function MyAdoptionDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [requests, setRequests] = useState([]);
  const [followupSummaries, setFollowupSummaries] = useState({});
  const [filter, setFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");
  const [followupReports, setFollowupReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentReportIndex, setCurrentReportIndex] = useState(0);
  
  const [adopterForm, setAdopterForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    adopterStatus: "",
    homeType: "",
    hasPets: false,
    agree: false,
  });

  // Sync adopterForm when a request is selected
  useEffect(() => {
    if (selectedRequest) {
      setAdopterForm({
        name: selectedRequest.adopter.name,
        email: selectedRequest.adopter.email,
        phone: selectedRequest.adopter.phone,
        address: selectedRequest.adopter.address,
        adopterStatus: selectedRequest.adopterStatus,
        homeType: selectedRequest.homeType,
        hasPets: selectedRequest.hasPets,
        agree: selectedRequest.agree,
      });
    }
  }, [selectedRequest]);

  useEffect(() => {
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  // Fetch all follow-up reports for the current user
  const fetchAllFollowupReports = async () => {
    try {
      setLoadingReports(true);
      const token = localStorage.getItem('authToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // Fetch reports for all approved adoption requests
      const approvedRequests = requests.filter(req => req.status === "Approved");
      const allReports = [];
      
      for (const request of approvedRequests) {
        try {
          const response = await axios.get(`/follow-up-reports/${request.id}`, { headers });
          if (response.data && response.data.length > 0) {
            // Add dog info to each report
            const reportsWithDogInfo = response.data.map(report => ({
              ...report,
              dog: request.dog,
              adoptionRequestId: request.id
            }));
            allReports.push(...reportsWithDogInfo);
          }
        } catch (err) {
          console.error(`Error fetching reports for request ${request.id}:`, err);
        }
      }
      
      // Sort reports by date (newest first)
      allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFollowupReports(allReports);
    } catch (err) {
      console.error("Error fetching follow-up reports:", err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch adoption requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        // Fetch only the current user's adoption requests
        const res = await axios.get("/adoption-requests/mine");

        const formattedRequests = res.data.map((r) => ({
          id: r._id,
          dog: {
            ...r.dog,
            photo: r.dog?.photo
              ? `http://localhost:3000/uploads/dogs/${r.dog.photo}`
              : "/placeholder.jpg",
          },
          adopter: {
            name: r.fullName,
            email: r.email,
            phone: r.phone,
            address: r.address,
            _id: r._id,
          },
          adopterStatus: r.status,
          homeType: r.homeType,
          hasPets: r.hasPets,
          agree: r.agree,
          status: r.requestStatus.charAt(0).toUpperCase() + r.requestStatus.slice(1),
          vetClearance: (r.vetReviewStatus || 'pending').charAt(0).toUpperCase() + (r.vetReviewStatus || 'pending').slice(1),
          date: new Date(r.createdAt).toLocaleDateString(),
        }));

        setRequests(formattedRequests);

        const notes = formattedRequests
          .map((r) => {
            if (r.status === "Pending")
              return ` ${r.dog.name}’s request is pending vet clearance.`;
            if (r.status === "Approved")
              return `✅ ${r.dog.name}’s adoption is approved. Certificate ready!`;
            if (r.status === "Rejected")
              return `❌ ${r.dog.name}’s adoption request was rejected.`;
            return null;
          })
          .filter(Boolean);

        setNotifications(notes);

        // Fetch follow-up summaries for approved requests
        const approved = formattedRequests.filter(r => r.status === "Approved");
        if (approved.length) {
          const token = localStorage.getItem('authToken');
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const promises = approved.map(r => 
            axios.get(`/follow-up-reports/${r.id}/summary`, { headers })
              .then(res => ({ id: r.id, summary: res.data }))
              .catch(() => ({ id: r.id, summary: { completed: 0, totalRequired: 4, nextDueWeek: 1 } }))
          );
          Promise.all(promises).then(results => {
            const map = {};
            results.forEach(({ id, summary }) => { map[id] = summary; });
            setFollowupSummaries(map);
          });
        }
      } catch (err) {
        console.error("Error fetching adoption requests:", err);
      }
    };

    fetchRequests();

    const handleNewRequest = () => fetchRequests();
    window.addEventListener("adoptionRequestSubmitted", handleNewRequest);
    return () =>
      window.removeEventListener("adoptionRequestSubmitted", handleNewRequest);
  }, []);

  // Fetch reports when component mounts and when requests change
  useEffect(() => {
    if (requests.length > 0) {
      fetchAllFollowupReports();
    }
  }, [requests]);

  // Also fetch when switching to followup tab
  useEffect(() => {
    if (activeTab === "followup") {
      fetchAllFollowupReports();
    }
  }, [activeTab]);

  // Handle form input changes
  const handleAdopterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAdopterForm({
      ...adopterForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Save edited adopter info
  const handleSaveAdopter = async () => {
    try {
      await axios.put(
        `/adoption-requests/${selectedRequest.id}`,
        {
          fullName: adopterForm.name,
          email: adopterForm.email,
          phone: adopterForm.phone,
          address: adopterForm.address,
          status: adopterForm.adopterStatus,
          homeType: adopterForm.homeType,
          hasPets: adopterForm.hasPets,
          agree: adopterForm.agree,
        }
      );

      setRequests(
        requests.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                adopter: { ...adopterForm },
                adopterStatus: adopterForm.adopterStatus,
                homeType: adopterForm.homeType,
                hasPets: adopterForm.hasPets,
                agree: adopterForm.agree,
              }
            : req
        )
      );

      setSelectedRequest((prev) => ({
        ...prev,
        adopter: { ...adopterForm },
        adopterStatus: adopterForm.adopterStatus,
        homeType: adopterForm.homeType,
        hasPets: adopterForm.hasPets,
        agree: adopterForm.agree,
      }));

      setIsEditing(false);
      alert("Adopter info updated successfully!");
    } catch (err) {
      console.error("Error updating adopter info:", err);
      alert("Failed to update adopter info.");
    }
  };

  // Delete request
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await axios.delete(`/adoption-requests/${id}`);
        setRequests(requests.filter((req) => req.id !== id));
      } catch (err) {
        console.error("Error deleting request:", err);
        alert("Failed to delete request.");
      }
    }
  };

  // Download certificate
  const handleDownloadPDF = (req) => {
    if (!req) return;
    const doc = new jsPDF();
    doc.text(`Adoption Certificate for ${req.dog.name}`, 10, 10);
    doc.text(`Adopter: ${req.adopter.name}`, 10, 20);
    doc.text(`Adoption Date: ${req.date}`, 10, 30);
    doc.save(`Certificate_${req.dog.name}.pdf`);
  };

  const handleDownloadWord = (req) => {
    if (!req) return;
    const blob = new Blob(
      [
        `Adoption Certificate\n\nDog: ${req.dog.name}\nAdopter: ${req.adopter.name}\nAdoption Date: ${req.date}`,
      ],
      { type: "application/msword" }
    );
    saveAs(blob, `Certificate_${req.dog.name}.doc`);
  };

  const handleDownloadExcel = (req) => {
    if (!req) return;
    const worksheet = XLSX.utils.json_to_sheet([
      {
        Dog: req.dog.name,
        Adopter: req.adopter.name,
        "Adoption Date": req.date,
      },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Certificate");
    XLSX.writeFile(workbook, `Certificate_${req.dog.name}.xlsx`);
  };

  // View detailed report in modal
  const viewDetailedReport = (report, index) => {
    setSelectedReport(report);
    setCurrentReportIndex(index);
  };

  // Navigate between reports
  const navigateReports = (direction) => {
    let newIndex;
    if (direction === 'next') {
      newIndex = currentReportIndex < followupReports.length - 1 ? currentReportIndex + 1 : 0;
    } else {
      newIndex = currentReportIndex > 0 ? currentReportIndex - 1 : followupReports.length - 1;
    }
    setCurrentReportIndex(newIndex);
    setSelectedReport(followupReports[newIndex]);
  };

  // Close report modal
  const closeReportModal = () => {
    setSelectedReport(null);
    setCurrentReportIndex(0);
  };

  // Download report as PDF
  const downloadReportPDF = (report) => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(16);
    doc.text(`Follow-Up Report - Week ${report.week}`, 20, 20);
    doc.setFontSize(12);
    
    // Dog Information
    doc.text(`Dog: ${report.dog?.name}`, 20, 40);
    doc.text(`Adoption Request ID: ${report.adoptionRequestId}`, 20, 50);
    doc.text(`Report Date: ${new Date(report.createdAt).toLocaleDateString()}`, 20, 60);
    
    // Health Condition
    doc.text(`Health Condition: ${report.healthCondition}`, 20, 80);
    
    // Feeding Status
    doc.text(`Feeding Status: ${report.feedingStatus}`, 20, 95);
    if (report.feedingNotes) {
      doc.text(`Feeding Notes: ${report.feedingNotes}`, 20, 105);
    }
    
    // Behavior
    doc.text(`Behavior: ${report.behaviorChecklist?.join(', ') || 'No behavior notes'}`, 20, 120);
    if (report.behaviorNotes) {
      doc.text(`Behavior Notes: ${report.behaviorNotes}`, 20, 130);
    }
    
    // Environment Check
    if (report.environmentCheck) {
      doc.text(`Environment Check: ${report.environmentCheck}`, 20, 145);
    }
    
    // Additional Notes
    if (report.optionalNotes) {
      doc.text(`Additional Notes: ${report.optionalNotes}`, 20, 160);
    }
    
    doc.save(`FollowUp_Report_${report.dog?.name}_Week_${report.week}.pdf`);
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status.toLowerCase() === filter.toLowerCase());

  const metrics = {
    pending: requests.filter((r) => r.status === "Pending").length,
    approved: requests.filter((r) => r.status === "Approved").length,
    rejected: requests.filter((r) => r.status === "Rejected").length,
  };

  return (
    <div className="my-ad-dashboard">
      {/* Hero Section */}
      <div className="my-ad-dashboard-hero">
        <h1> <Dog size={100} /> My Adoption Dashboard</h1>
        <p>Track your adoption requests, certificates & journey with us</p>
        <button
          className="my-ad-btn primary"
          onClick={() => (window.location.href = "/adoptdogspage")}
        >
          + New Adoption Request
        </button>
      </div>

      {/* Dashboard Tabs */}
      <div className="ad-d-dashboard-tabs">
        <button
          className={activeTab === "requests" ? "tab-active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          <FaPaw size={18} /> My Requests
        </button>
        <button
          className={activeTab === "notifications" ? "tab-active" : ""}
          onClick={() => setActiveTab("notifications")}
        >
          <BellRing size={18} /> Notifications
        </button>
        <button
          className={activeTab === "followup" ? "tab-active" : ""}
          onClick={() => setActiveTab("followup")}
        >
          <Clipboard size={18} /> Follow-Ups
        </button>
      </div>

      {/* Requests Tab */}
      {activeTab === "requests" && (
        <>
          {/* Enhanced Metrics */}
          <div className="my-ad-metrics-enhanced">
            <div className="my-ad-metric-card-enhanced pending">
              <div className="metric-icon">
                <FaHourglassHalf />
              </div>
              <div className="metric-content">
                <span className="metric-value">{metrics.pending}</span>
                <span className="metric-label">Pending Requests</span>
              </div>
            </div>
            
            <div className="my-ad-metric-card-enhanced approved">
              <div className="metric-icon">
                <FaCheckCircle />
              </div>
              <div className="metric-content">
                <span className="metric-value">{metrics.approved}</span>
                <span className="metric-label">Approved</span>
              </div>
            </div>
            
            <div className="my-ad-metric-card-enhanced rejected">
              <div className="metric-icon">
                <FaTimesCircle />
              </div>
              <div className="metric-content">
                <span className="metric-value">{metrics.rejected}</span>
                <span className="metric-label">Rejected</span>
              </div>
            </div>
            
            <div className="my-ad-metric-card-enhanced total">
              <div className="metric-icon">
                <FaPaw />
              </div>
              <div className="metric-content">
                <span className="metric-value">{requests.length}</span>
                <span className="metric-label">Total Requests</span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Filters */}
          <div className="my-ad-filters-enhanced">
            <div className="filter-header">
              <div className="filter-title">
                <FaFilter className="filter-icon" />
                <h3>Filter Requests</h3>
              </div>
              <span className="filter-results">Showing {filteredRequests.length} of {requests.length} requests</span>
            </div>
            
            <div className="filter-controls">
              {/* Custom Dropdown Filter */}
              <div className="custom-filter-dropdown">
                <div className="dropdown-trigger" onClick={() => {
                  const options = document.querySelector('.dropdown-options');
                  if (options) options.classList.toggle('show');
                }}>
                  <span className="dropdown-label">Status: {filter.charAt(0).toUpperCase() + filter.slice(1)}</span>
                  <FaChevronDown className="dropdown-arrow" />
                </div>
                
                <div className="dropdown-options">
                  <div 
                    className={`dropdown-option ${filter === 'all' ? 'selected' : ''}`}
                    onClick={() => setFilter('all')}
                  >
                    <div className="option-content">
                      <div className="option-check">
                        {filter === 'all' && <FaCheck />}
                      </div>
                      <span className="option-text">All Requests</span>
                      <span className="option-count">{requests.length}</span>
                    </div>
                    <div className="option-description">Show all adoption requests</div>
                  </div>
                  
                  <div 
                    className={`dropdown-option ${filter === 'pending' ? 'selected' : ''}`}
                    onClick={() => setFilter('pending')}
                  >
                    <div className="option-content">
                      <div className="option-check">
                        {filter === 'pending' && <FaCheck />}
                      </div>
                      <span className="option-text">Pending</span>
                      <span className="option-count pending-count">{metrics.pending}</span>
                    </div>
                    <div className="option-description">Requests awaiting approval</div>
                  </div>
                  
                  <div 
                    className={`dropdown-option ${filter === 'approved' ? 'selected' : ''}`}
                    onClick={() => setFilter('approved')}
                  >
                    <div className="option-content">
                      <div className="option-check">
                        {filter === 'approved' && <FaCheck />}
                      </div>
                      <span className="option-text">Approved</span>
                      <span className="option-count approved-count">{metrics.approved}</span>
                    </div>
                    <div className="option-description">Successfully approved requests</div>
                  </div>
                  
                  <div 
                    className={`dropdown-option ${filter === 'rejected' ? 'selected' : ''}`}
                    onClick={() => setFilter('rejected')}
                  >
                    <div className="option-content">
                      <div className="option-check">
                        {filter === 'rejected' && <FaCheck />}
                      </div>
                      <span className="option-text">Rejected</span>
                      <span className="option-count rejected-count">{metrics.rejected}</span>
                    </div>
                    <div className="option-description">Requests that were declined</div>
                  </div>
                </div>
              </div>

              {/* Filter Chips */}
              <div className="filter-chips">
                <div className={`filter-chip ${filter !== 'all' ? 'active' : ''}`}>
                  <span className="chip-label">Status: {filter}</span>
                  {filter !== 'all' && (
                    <button 
                      className="chip-remove"
                      onClick={() => setFilter('all')}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <table className="my-ad-requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Dog</th>
                <th>Status</th>
                <th>Vet</th>
                <th>Follow-Ups</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>
                    <div className="a-dash-small-photo">
                      <img
                        src={req.dog.photo}
                        alt={req.dog.name}
                        className="dog-photo-small"
                      />
                      {req.dog.name}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${req.status.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>{req.vetClearance}</td>
                  <td>
                    {followupSummaries[req.id] ? (
                      <span>{followupSummaries[req.id].completed || 0}/4</span>
                    ) : (
                      req.status === "Approved" ? '—' : 'N/A'
                    )}
                  </td>
                  <td>{req.date}</td>
                  <td>
                    {/* View Details Button */}
                    <button
                      className="my-ad-btn small"
                      onClick={() => setSelectedRequest(req)}
                    >
                      <FaEye/>
                    </button>

                    {/* Delete Button if Pending */}
                    {req.status === "Pending" && (
                      <button
                        className="my-ad-btn small danger"
                        onClick={() => handleDelete(req.id)}
                      >
                        <FaTrash /> 
                      </button>
                    )}

                    {/* Certificate Button if Approved */}
                    {req.status === "Approved" && (
                      <button
                        className="my-ad-btn small primary"
                        onClick={() => navigate(`/adoption-certificate/${req.id}`)}
                      >
                        <FaDownload /> Download Certificate
                      </button>
                    )}

                    {/* Follow-Up Button */}
                    <button
                      className="my-ad-btn small primary"
                      disabled={!(req.status === "Approved") || (followupSummaries[req.id]?.completed >= 4)}
                      title={req.status !== "Approved" ? 'Follow-ups available after approval' : (followupSummaries[req.id]?.completed >= 4 ? 'All 4 weekly reports submitted' : 'Submit weekly follow-up')}
                      onClick={() => {
                        if (!req || !req.dog || !req.adopter) {
                          alert("Please select a valid request!");
                          return;
                        }
                        navigate("/followup", {
                          state: {
                            adoptionRequest: { _id: req.id },
                            dog: req.dog,
                            user: { 
                              _id: req.adopter._id, 
                              name: req.adopter.name, 
                              email: req.adopter.email, 
                              phone: req.adopter.phone 
                            },
                          },
                        });
                      }}
                    >
                      <FaFile/> Follow-Up
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="my-ad-notifications">
          <h2>
            <FaBell size={50}/> Notifications
          </h2>
          <ul>
            {notifications.map((n, i) => (
              <li key={i}> <PawPrint size={20} /> {n}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow-Up Tab */}
      {activeTab === "followup" && (
        <div className="followup-section">
          <h4><Clipboard size={50} /> Weekly Follow-Up Reports</h4>
          
          {/* Progress Summary */}
          <div className="followup-progress-summary">
            <h3>Your Follow-Up Progress</h3><br></br>
            <div className="progress-stats">
              <div className="progress-stat">
                <span className="stat-number">{followupReports.length}</span>
                <span className="stat-label">Total Reports Submitted</span>
              </div>
              <div className="progress-stat">
                <span className="stat-number">
                  {Array.from(new Set(followupReports.map(r => r.adoptionRequestId))).length}
                </span>
                <span className="stat-label">Dogs with Reports</span>
              </div>
              <div className="progress-stat">
                <span className="stat-number">
                  {Math.max(...followupReports.map(r => r.week), 0)}
                </span>
                <span className="stat-label">Highest Week Completed</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="followup-instructions">
            <p>
              <strong>All your submitted follow-up reports are automatically displayed below.</strong> <br></br>
              Keep track of your adopted dog's progress with weekly reports.
            </p>
          </div>

          {/* Automatically Displayed Reports */}
          <div className="auto-reports-section">
            <h3>Your Submitted Follow-Up Reports</h3>
            
            {loadingReports ? (
              <div className="loading-reports">Loading your reports...</div>
            ) : followupReports.length > 0 ? (
              <div className="reports-grid">
                {followupReports.map((report, index) => (
                  <div key={report._id || index} className="report-card-auto">
                    <div className="report-card-header">
                      <div className="dog-info">
                        <img 
                          src={report.dog?.photo || "/placeholder.jpg"} 
                          alt={report.dog?.name}
                          className="dog-photo-report"
                        />
                        <div className="dog-details">
                          <h4>{report.dog?.name}</h4>
                         
                          <span className="week-badge">Week {report.week}</span>
                        </div>
                      </div>
                      <div className="report-date">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="report-summary-auto">
                      <div className="summary-item">
                        <label>Health:</label>
                        <span className={`health-status ${report.healthCondition?.toLowerCase()}`}>
                          {report.healthCondition}
                        </span>
                      </div>
                      <div className="summary-item">
                        <label>Feeding:</label>
                        <span>{report.feedingStatus}</span>
                      </div>
                      <div className="summary-item">
                        <label>Behavior:</label>
                        <span>{report.behaviorChecklist?.slice(0, 2).join(', ') || 'No notes'}</span>
                      </div>
                    </div>
                    
                    <div className="report-actions">
                      <button 
                        className="my-ad-btn small primary"
                        onClick={() => viewDetailedReport(report, index)}
                      >
                        View Full Report
                      </button>
                      {report.photos && report.photos.length > 0 && (
                        <span className="photo-indicator">📷 {report.photos.length} photos</span>
                      )}
                      {report.vetReport && (
                        <span className="vet-indicator">📋 Vet report</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reports">
                <div className="no-reports-icon">📋</div>
                <h4>No Follow-Up Reports Yet</h4>
                <p>You haven't submitted any follow-up reports yet. Submit your first report using the Follow-Up button in your approved requests.</p>
                <button 
                  className="my-ad-btn primary"
                  onClick={() => setActiveTab("requests")}
                >
                  Go to My Requests
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="followup-quick-actions">
            <h4>Quick Actions</h4>
            <div className="action-buttons">
              <button 
                className="my-ad-btn"
                onClick={() => setActiveTab("requests")}
              >
                Submit New Follow-Up Report
              </button>
              <button 
                className="my-ad-btn secondary"
                onClick={fetchAllFollowupReports}
              >
                Refresh Reports
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div
          className="my-ad-modal-overlay"
          onClick={() => setSelectedRequest(null)}
        >
          <div className="my-ad-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Request Details</h2>
            <img src={selectedRequest.dog.photo} alt={selectedRequest.dog.name} />
            <h3>
              {selectedRequest.dog.name} ({selectedRequest.dog.breed})
            </h3>
            <div className="d-display-info">
              <p>
                <span>Age: </span>
                {selectedRequest.dog.age}
              </p>
              <p>
                <span>Status: </span>
                {selectedRequest.status}
              </p>
              <p>
                <span>Vet Clearance: </span>
                {selectedRequest.vetClearance}
              </p>
              <p>
                <span>Adoption Date: </span>
                {selectedRequest.date}
              </p>
            </div>
            <br />

            <h4>Adopter Info</h4>

            {isEditing ? (
              <div className="adopter-edit-form">
                <label>
                  Name:
                  <input
                    type="text"
                    name="name"
                    value={adopterForm.name}
                    onChange={handleAdopterChange}
                  />
                </label>
                <label>
                  Email:
                  <input
                    type="email"
                    name="email"
                    value={adopterForm.email}
                    onChange={handleAdopterChange}
                  />
                </label>
                <label>
                  Phone:
                  <input
                    type="text"
                    name="phone"
                    value={adopterForm.phone}
                    onChange={handleAdopterChange}
                  />
                </label>
                <label>
                  Address:
                  <textarea
                    name="address"
                    value={adopterForm.address}
                    onChange={handleAdopterChange}
                  />
                </label>
                <label>
                  Adopter Status:
                  <select
                    name="adopterStatus"
                    value={adopterForm.adopterStatus}
                    onChange={handleAdopterChange}
                  >
                    <option value="student">Student</option>
                    <option value="employed">Employed</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="retired">Retired</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  Home Type:
                  <select
                    name="homeType"
                    value={adopterForm.homeType}
                    onChange={handleAdopterChange}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="house">House with Yard</option>
                    <option value="farm">Farm</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <br></br>
                <label>
                  Has Other Pets:
                  <input
                    type="checkbox"
                    name="hasPets"
                    checked={adopterForm.hasPets}
                    onChange={handleAdopterChange}
                  />
                </label>
                <label>
                  Agreed to Care:
                  <input
                    type="checkbox"
                    name="agree"
                    checked={adopterForm.agree}
                    onChange={handleAdopterChange}
                  />
                </label>
                <button
                  className="my-ad-btn small primary"
                  onClick={handleSaveAdopter}
                >
                  Save
                </button>
                <button
                  className="my-ad-btn small"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="adopter-info">
                <p>
                  <span>Name: </span>
                  {selectedRequest.adopter.name}
                </p>
                <p>
                  <span>Email: </span>
                  {selectedRequest.adopter.email}
                </p>
                <p>
                  <span>Phone: </span>
                  {selectedRequest.adopter.phone}
                </p>
                <p>
                  <span>Address: </span>
                  {selectedRequest.adopter.address}
                </p>
                <p>
                  <span>Adopter Status: </span>
                  {selectedRequest.adopterStatus}
                </p>
                <p>
                  <span>Home Type: </span>
                  {selectedRequest.homeType}
                </p>
                <p>
                  <span>Has Other Pets: </span>
                  {selectedRequest.hasPets ? "Yes" : "No"}
                </p>
                <p>
                  <span>Agreed to Care: </span>
                  {selectedRequest.agree ? "Yes" : "No"}
                </p>
                <button
                  className="my-ad-btn small primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>

                <button
                  className="my-ad-btn"
                  onClick={() => setSelectedRequest(null)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="my-ad-modal-overlay" onClick={closeReportModal}>
          <div className="report-detail-modal" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="report-modal-header">
              <div className="report-modal-title">
                <h2>Follow-Up Report Details</h2>
                <span className="report-week">Week {selectedReport.week}</span>
              </div>
              <button className="modal-close-btn" onClick={closeReportModal}>
                <X size={24} />
              </button>
            </div>

            {/* Navigation Controls */}
            {followupReports.length > 1 && (
              <div className="report-navigation">
                <button 
                  className="nav-btn prev"
                  onClick={() => navigateReports('prev')}
                >
                  <FaArrowLeft /> Previous
                </button>
                <span className="report-counter">
                  {currentReportIndex + 1} of {followupReports.length}
                </span>
                <button 
                  className="nav-btn next"
                  onClick={() => navigateReports('next')}
                >
                  Next <FaArrowRight />
                </button>
              </div>
            )}

            {/* Dog Information */}
            <div className="report-dog-info">
              <div className="dog-photo-section">
                <img 
                  src={selectedReport.dog?.photo || "/placeholder.jpg"} 
                  alt={selectedReport.dog?.name}
                  className="dog-photo-large"
                />
              </div>
              <div className="dog-details-section">
                <h3>{selectedReport.dog?.name}</h3>
                <p><strong>Breed:</strong> {selectedReport.dog?.breed || 'N/A'}</p>
                <p><strong>Age:</strong> {selectedReport.dog?.age || 'N/A'}</p>
                <p><strong>Adoption Request ID:</strong> {selectedReport.adoptionRequestId}</p>
                <p><strong>Report Date:</strong> {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Report Details */}
            <div className="report-details-grid">
              {/* Health Condition */}
              <div className="report-detail-card health">
                <h4>Health Condition</h4>
                <div className={`health-status-badge ${selectedReport.healthCondition?.toLowerCase()}`}>
                  {selectedReport.healthCondition}
                </div>
                {selectedReport.healthNotes && (
                  <p className="detail-notes">{selectedReport.healthNotes}</p>
                )}
              </div>

              {/* Feeding Status */}
              <div className="report-detail-card feeding">
                <h4>Feeding Status</h4>
                <p className="feeding-status">{selectedReport.feedingStatus}</p>
                {selectedReport.feedingNotes && (
                  <div className="detail-notes">
                    <strong>Notes:</strong> {selectedReport.feedingNotes}
                  </div>
                )}
              </div>

              {/* Behavior */}
              <div className="report-detail-card behavior">
                <h4>Behavior Assessment</h4>
                {selectedReport.behaviorChecklist && selectedReport.behaviorChecklist.length > 0 ? (
                  <div className="behavior-checklist">
                    {selectedReport.behaviorChecklist.map((behavior, index) => (
                      <span key={index} className="behavior-tag">{behavior}</span>
                    ))}
                  </div>
                ) : (
                  <p>No behavior notes recorded</p>
                )}
                {selectedReport.behaviorNotes && (
                  <div className="detail-notes">
                    <strong>Additional Notes:</strong> {selectedReport.behaviorNotes}
                  </div>
                )}
              </div>

              {/* Environment Check */}
              {selectedReport.environmentCheck && (
                <div className="report-detail-card environment">
                  <h4>Environment Check</h4>
                  <p>{selectedReport.environmentCheck}</p>
                </div>
              )}

              {/* Additional Notes */}
              {selectedReport.optionalNotes && (
                <div className="report-detail-card notes">
                  <h4>Additional Notes</h4>
                  <p>{selectedReport.optionalNotes}</p>
                </div>
              )}

              {/* Media Indicators */}
              <div className="report-detail-card media">
                <h4>Attachments</h4>
                <div className="media-indicators">
                  {selectedReport.photos && selectedReport.photos.length > 0 && (
                    <span className="media-indicator photo">
                      📷 {selectedReport.photos.length} Photos
                    </span>
                  )}
                  
                  {(!selectedReport.photos || selectedReport.photos.length === 0) && !selectedReport.vetReport && (
                    <p>No attachments</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="report-modal-actions">
              <button 
                className="my-ad-btn secondary"
                onClick={() => downloadReportPDF(selectedReport)}
              >
                <FaDownload /> Download PDF
              </button>
              <button 
                className="my-ad-btn"
                onClick={closeReportModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyAdoptionDashboard;