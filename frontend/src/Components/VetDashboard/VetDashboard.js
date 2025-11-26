// VetDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PawPrint,
  LogOut,
  Clock,
  Activity,
  FileText,
  Search,
  Filter,
  Stethoscope,
  Syringe,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Calendar,
  UserCheck,
  Heart,
  Users,
  Eye,
  Check,
  XCircle,
  Edit,
  Trash2,
  History
} from "lucide-react";
import "./VetDashboard.css";

const VetDashboard = () => {
  const navigate = useNavigate();
  const [vet, setVet] = useState({});
  const [dogs, setDogs] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [selectedDog, setSelectedDog] = useState(null);
  const [selectedAdoption, setSelectedAdoption] = useState(null);
  const [activeTab, setActiveTab] = useState("treatment");
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);
  const [showVaccinationForm, setShowVaccinationForm] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [showAdoptionDetails, setShowAdoptionDetails] = useState(false);
  const [showMedicalRecords, setShowMedicalRecords] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3000";
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordTypeFilter, setRecordTypeFilter] = useState("all");

  const [treatmentForm, setTreatmentForm] = useState({
    diagnosis: "",
    treatment: "",
    medication: "",
    dosage: "",
    notes: ""
  });

  const [vaccinationForm, setVaccinationForm] = useState({
    vaccineType: "",
    batchNumber: "",
    nextDueDate: "",
    notes: ""
  });

  const [certificationForm, setCertificationForm] = useState({
    healthStatus: "Healthy",
    approvalForAdoption: false,
    notes: ""
  });

  // Helper to attach auth header
  const authHeader = () => {
    const token = localStorage.getItem("authToken") || localStorage.getItem("token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format date for input fields
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get vet dashboard data
        const dash = await axios.get(`${API_BASE}/vet/dashboard`, authHeader());
        const v = dash.data?.data?.vetInfo || {};
        setVet({
          name: v.name || "Veterinarian",
          specialization: v.specialization || "Canine Health",
          experience: v.experience || "",
        });

        // Get dogs list
        const res = await axios.get(`${API_BASE}/vet/dogs`, authHeader());
        const list = res.data?.data?.dogs || [];
        setDogs(
          list.map((d) => ({
            _id: d._id,
            name: d.name,
            status: normalizeStatus(d.healthStatus),
            photo: d.photo ? `${API_BASE}/uploads/dogs/${d.photo}` : "https://placehold.co/300x300?text=Dog",
            breed: d.breed || "",
            age: d.age || "",
            lastCheckup: d.updatedAt,
            nextCheckup: d.nextCheckup,
            healthCertified: d.healthCertified || false,
            vaccinations: d.vaccinations || [],
            medicalHistory: d.medicalHistory || [],
          }))
        );

        // Fetch adoption requests pending vet approval
        let adoptionData = [];
        try {
          // Try the vet-specific endpoint first
          const adoptionRes = await axios.get(`${API_BASE}/adoption-requests/vet/pending`, authHeader());
          adoptionData = adoptionRes.data?.requests || adoptionRes.data || [];
        } catch (error) {
          console.log("Vet pending endpoint failed, trying alternative...");
          try {
            // Try the main pending endpoint
            const adoptionRes = await axios.get(`${API_BASE}/adoption-requests/pending`, authHeader());
            adoptionData = adoptionRes.data || [];
          } catch (secondError) {
            console.log("Alternative endpoint failed, trying direct query...");
            try {
              // Try getting all requests and filtering
              const allRes = await axios.get(`${API_BASE}/adoption-requests`, authHeader());
              adoptionData = allRes.data.filter(req => 
                req.vetReviewStatus === "pending" || 
                (req.requestStatus === "pending" && (!req.vetReviewStatus || req.vetReviewStatus === "pending"))
              );
            } catch (thirdError) {
              console.error("All adoption request endpoints failed:", thirdError);
            }
          }
        }

        console.log("Fetched adoption data:", adoptionData);
        
        // Enhance adoption data with dog information
        const enhancedAdoptions = adoptionData.map(adoption => {
          const dogInfo = adoption.dog || {};
          
          return {
            _id: adoption._id,
            dog: {
              _id: dogInfo._id,
              name: dogInfo.name || "Unknown Dog",
              breed: dogInfo.breed || "Unknown Breed",
              age: dogInfo.age || "Unknown Age",
              photo: dogInfo.photo ? `${API_BASE}/uploads/dogs/${dogInfo.photo}` : "https://placehold.co/300x300?text=Dog",
              healthStatus: dogInfo.healthStatus || "unknown"
            },
            user: adoption.applicantUser || {
              _id: adoption.userId,
              name: adoption.fullName || "Unknown User",
              email: adoption.email || "No email provided",
              phone: adoption.phone || "No phone provided",
              address: adoption.address || "No address provided"
            },
            status: adoption.requestStatus || "pending",
            vetReviewStatus: adoption.vetReviewStatus || "pending",
            createdAt: adoption.createdAt || new Date().toISOString(),
            notes: adoption.message || "",
            vetApproved: adoption.vetReviewStatus === "approved"
          };
        });

        console.log("Enhanced adoptions:", enhancedAdoptions);
        setAdoptionRequests(enhancedAdoptions);
        
      } catch (e) {
        console.error("Vet dashboard fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const normalizeStatus = (healthStatus) => {
    switch (healthStatus) {
      case "healthy":
      case "excellent":
        return "Healthy";
      case "monitoring":
        return "Recovering";
      case "needs_care":
      case "critical":
        return "Needs Attention";
      default:
        return "Needs Attention";
    }
  };

  // Fetch medical records for a dog
  const fetchMedicalRecords = async (dogId) => {
    try {
      const response = await axios.get(`${API_BASE}/vet/dogs/${dogId}/medical-records`, authHeader());
      setMedicalRecords(response.data?.data?.records || []);
      setShowMedicalRecords(true);
    } catch (error) {
      console.error("Failed to fetch medical records:", error);
      alert("Failed to load medical records");
    }
  };

  // Handle viewing medical records
  const handleViewMedicalRecords = (dog) => {
    setSelectedDog(dog);
    fetchMedicalRecords(dog._id);
  };

  // Handle editing a medical record
  const handleEditRecord = (record) => {
    setEditingRecord(record);
    if (record.recordType === "treatment") {
      setTreatmentForm({
        diagnosis: record.title || "",
        treatment: record.treatment?.procedure || "",
        medication: record.medications?.[0]?.name || "",
        dosage: record.medications?.[0]?.dosage || "",
        notes: record.description || ""
      });
      setShowTreatmentForm(true);
    } else if (record.recordType === "vaccination") {
      setVaccinationForm({
        vaccineType: record.vaccination?.name || "",
        batchNumber: record.vaccination?.batchNumber || "",
        nextDueDate: formatDateForInput(record.vaccination?.nextDueDate),
        notes: record.description || ""
      });
      setShowVaccinationForm(true);
    }
  };

  // Handle deleting a medical record
  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this medical record?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE}/vet/medical-records/${recordId}`, authHeader());
      // Refresh medical records
      if (selectedDog) {
        fetchMedicalRecords(selectedDog._id);
      }
      alert("Medical record deleted successfully");
    } catch (error) {
      console.error("Failed to delete medical record:", error);
      alert("Failed to delete medical record");
    }
  };

  // Update treatment submission to handle both create and edit
  const handleAddTreatment = async () => {
    if (!(treatmentForm.diagnosis && treatmentForm.treatment) || !selectedDog) return;
    
    try {
      if (editingRecord) {
        // Update existing treatment
        await axios.put(
          `${API_BASE}/vet/medical-records/${editingRecord._id}`,
          { 
            title: treatmentForm.diagnosis,
            description: treatmentForm.notes,
            treatment: { procedure: treatmentForm.treatment },
            medications: treatmentForm.medication ? [{ 
              name: treatmentForm.medication, 
              dosage: treatmentForm.dosage 
            }] : []
          },
          authHeader()
        );
        alert("Treatment updated successfully!");
      } else {
        // Create new treatment
        await axios.post(
          `${API_BASE}/vet/dogs/${selectedDog._id}/treatments`,
          { ...treatmentForm },
          authHeader()
        );
        alert("Treatment recorded successfully!");
      }

      // Refresh dogs data
      const res = await axios.get(`${API_BASE}/vet/dogs`, authHeader());
      const list = res.data?.data?.dogs || [];
      setDogs(
        list.map((d) => ({
          _id: d._id,
          name: d.name,
          status: normalizeStatus(d.healthStatus),
          photo: d.photo ? `${API_BASE}/uploads/dogs/${d.photo}` : "https://placehold.co/300x300?text=Dog",
          breed: d.breed || "",
          age: d.age || "",
          lastCheckup: d.updatedAt,
          nextCheckup: d.nextCheckup,
          healthCertified: d.healthCertified || false,
          vaccinations: d.vaccinations || [],
          medicalHistory: d.medicalHistory || [],
        }))
      );

      // Refresh medical records if viewing
      if (showMedicalRecords && selectedDog) {
        fetchMedicalRecords(selectedDog._id);
      }

      setShowTreatmentForm(false);
      setTreatmentForm({ diagnosis: "", treatment: "", medication: "", dosage: "", notes: "" });
      setEditingRecord(null);
    } catch (e) {
      console.error("Save treatment failed", e);
      alert("Failed to save treatment");
    }
  };

  // Update vaccination submission to handle both create and edit
  const handleAddVaccination = async () => {
    if (!(vaccinationForm.vaccineType && vaccinationForm.batchNumber) || !selectedDog) return;
    
    try {
      if (editingRecord) {
        // Update existing vaccination
        await axios.put(
          `${API_BASE}/vet/medical-records/${editingRecord._id}`,
          {
            title: `Vaccination - ${vaccinationForm.vaccineType}`,
            description: vaccinationForm.notes,
            vaccination: {
              name: vaccinationForm.vaccineType,
              batchNumber: vaccinationForm.batchNumber,
              nextDueDate: vaccinationForm.nextDueDate
            }
          },
          authHeader()
        );
        alert("Vaccination updated successfully!");
      } else {
        // Create new vaccination
        await axios.post(
          `${API_BASE}/vet/dogs/${selectedDog._id}/vaccinations`,
          {
            vaccineType: vaccinationForm.vaccineType,
            batchNumber: vaccinationForm.batchNumber,
            nextDueDate: vaccinationForm.nextDueDate,
            notes: vaccinationForm.notes,
          },
          authHeader()
        );
        alert("Vaccination recorded successfully!");
      }

      // Refresh dogs data
      const res = await axios.get(`${API_BASE}/vet/dogs`, authHeader());
      const list = res.data?.data?.dogs || [];
      setDogs(
        list.map((d) => ({
          _id: d._id,
          name: d.name,
          status: normalizeStatus(d.healthStatus),
          photo: d.photo ? `${API_BASE}/uploads/dogs/${d.photo}` : "https://placehold.co/300x300?text=Dog",
          breed: d.breed || "",
          age: d.age || "",
          lastCheckup: d.updatedAt,
          nextCheckup: d.nextCheckup,
          healthCertified: d.healthCertified || false,
          vaccinations: d.vaccinations || [],
          medicalHistory: d.medicalHistory || [],
        }))
      );

      // Refresh medical records if viewing
      if (showMedicalRecords && selectedDog) {
        fetchMedicalRecords(selectedDog._id);
      }

      setShowVaccinationForm(false);
      setVaccinationForm({ vaccineType: "", batchNumber: "", nextDueDate: "", notes: "" });
      setEditingRecord(null);
    } catch (e) {
      console.error("Save vaccination failed", e);
      alert("Failed to save vaccination");
    }
  };

  // Reset forms when modals close
  const handleCloseTreatmentForm = () => {
    setShowTreatmentForm(false);
    setTreatmentForm({ diagnosis: "", treatment: "", medication: "", dosage: "", notes: "" });
    setEditingRecord(null);
  };

  const handleCloseVaccinationForm = () => {
    setShowVaccinationForm(false);
    setVaccinationForm({ vaccineType: "", batchNumber: "", nextDueDate: "", notes: "" });
    setEditingRecord(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("vetId");
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    navigate("/");
  };

  // Filter for pending adoption requests
  const pendingAdoptions = adoptionRequests.filter(req => 
    req.vetReviewStatus === "pending" || req.status === "pending"
  );

  // Handle health certification for adoption requests - SINGLE FUNCTION
  const handleCertifyHealthForAdoption = async (dogId, adoptionId, isHealthy) => {
    try {
      // Update dog health certification status
      await axios.post(
        `${API_BASE}/vet/dogs/${dogId}/certify`,
        {
          healthStatus: isHealthy ? "Healthy" : "Needs Attention",
          approvalForAdoption: isHealthy,
          notes: isHealthy ? "Cleared for adoption - healthy" : "Not fit for adoption - requires treatment"
        },
        authHeader()
      );

      // Update adoption request vet review status
      await axios.post(
        `${API_BASE}/adoption-requests/${adoptionId}/vet-review`,
        {
          status: isHealthy ? "approved" : "rejected",
          note: isHealthy ? "Dog certified healthy for adoption" : "Dog requires medical attention"
        },
        authHeader()
      );

      // Update local state
      setDogs(prev => 
        prev.map(d => 
          d._id === dogId 
            ? { 
                ...d, 
                status: isHealthy ? "Healthy" : "Needs Attention",
                healthCertified: isHealthy 
              } 
            : d
        )
      );

      setAdoptionRequests(prev => 
        prev.filter(req => req._id !== adoptionId)
      );

      alert(`Dog ${isHealthy ? "certified healthy" : "marked as needing attention"}!`);
    } catch (e) {
      console.error("Health certification failed", e);
      alert("Failed to update health certification: " + (e.response?.data?.message || e.message));
    }
  };

  // Existing vet functions
  const handleCertifyHealth = async () => {
    if (!certificationForm.healthStatus || !selectedDog) return;
    try {
      await axios.post(
        `${API_BASE}/vet/dogs/${selectedDog._id}/certify`,
        {
          healthStatus: certificationForm.healthStatus,
          approvalForAdoption: certificationForm.approvalForAdoption,
          notes: certificationForm.notes,
        },
        authHeader()
      );

      // Reflect in UI
      setDogs((prev) =>
        prev.map((d) =>
          d._id === selectedDog._id
            ? {
                ...d,
                status: certificationForm.healthStatus,
                healthCertified: certificationForm.approvalForAdoption,
                certifiedDate: new Date().toISOString().split("T")[0],
                certifiedBy: vet.name,
              }
            : d
        )
      );
      setShowCertificationForm(false);
      setCertificationForm({ healthStatus: "Healthy", approvalForAdoption: false, notes: "" });
      alert("Health certification updated successfully!");
    } catch (e) {
      console.error("Certify health failed", e);
      alert("Failed to certify health");
    }
  };

  const handleDownloadReport = async (dog) => {
    try {
      const token = (localStorage.getItem('authToken') || localStorage.getItem('token')) || '';
      const res = await fetch(`${API_BASE}/vet/dogs/${dog._id}/report`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        method: 'GET',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Try get filename from headers
      const dispo = res.headers.get('Content-Disposition');
      let filename = `${dog.name || 'Dog'}_Medical_Report.pdf`;
      if (dispo) {
        const match = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(dispo);
        const fromHeader = decodeURIComponent(match?.[1] || match?.[2] || '');
        if (fromHeader) filename = fromHeader;
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download report failed', e);
    }
  };

  // New functions for adoption approval
  const handleViewAdoptionDetails = (adoption) => {
    setSelectedAdoption(adoption);
    setShowAdoptionDetails(true);
  };

  // Filter medical records by type
  const filteredMedicalRecords = medicalRecords.filter(record => {
    if (recordTypeFilter === "all") return true;
    return record.recordType === recordTypeFilter;
  });

  return (
    <div className="vet-dashboard">
      {/* Header */}
      <header className="vet-dashboard-header">
        <div className="vet-header-left">
          <div className="vet-logo">
            <Stethoscope size={28} />
            <h1>Veterinarian Dashboard</h1>
          </div>
        </div>
        <div className="vet-header-right">
          <div className="vet-user-info">
            <div className="vet-user-greeting">
              <span>Hello,</span>
              <strong>{vet.name || "Veterinarian"}</strong>
            </div>
            <div className="vet-user-specialization">
              <span>{vet.specialization || "Canine Health"}</span>
            </div>
          </div>
          <button className="vet-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="vet-tabs">
        <button 
          className={`vet-tab ${activeTab === "treatment" ? "active" : ""}`}
          onClick={() => setActiveTab("treatment")}
        >
          <Stethoscope size={18} />
          Dog Treatment
        </button>
        <button 
          className={`vet-tab ${activeTab === "adoptions" ? "active" : ""}`}
          onClick={() => setActiveTab("adoptions")}
        >
          <Heart size={18} />
          Adoption Approvals
          {pendingAdoptions.length > 0 && (
            <span className="vet-tab-badge">{pendingAdoptions.length}</span>
          )}
        </button>
      </div>

      {/* Dog Treatment Section */}
      {activeTab === "treatment" && (
        <div className="vet-dashboard-content">
          {/* Stats Overview */}
          <div className="vet-stats-grid">
            <div className="vet-stat-card">
              <div className="vet-stat-icon total">
                <PawPrint size={24} />
              </div>
              <div className="vet-stat-info">
                <h3>{dogs.length}</h3>
                <p>Total Dogs</p>
              </div>
            </div>
            <div className="vet-stat-card">
              <div className="vet-stat-icon attention">
                <AlertCircle size={24} />
              </div>
              <div className="vet-stat-info">
                <h3>{dogs.filter(dog => dog.status !== "Healthy").length}</h3>
                <p>Need Attention</p>
              </div>
            </div>
            <div className="vet-stat-card">
              <div className="vet-stat-icon certified">
                <CheckCircle size={24} />
              </div>
              <div className="vet-stat-info">
                <h3>{dogs.filter(d => d.healthCertified).length}</h3>
                <p>Health Certified</p>
              </div>
            </div>
            <div className="vet-stat-card">
              <div className="vet-stat-icon pending">
                <UserCheck size={24} />
              </div>
              <div className="vet-stat-info">
                <h3>{pendingAdoptions.length}</h3>
                <p>Pending Adoptions</p>
              </div>
            </div>
          </div>

          {/* Dogs List */}
          <div className="vet-content-section">
            <div className="vet-section-header">
              <h3>
                <PawPrint size={24} />
                Dogs Under Care
              </h3>
              <div className="vet-search-filter">
                <div className="vet-search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search dogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="healthy">Healthy</option>
                  <option value="needs attention">Needs Attention</option>
                  <option value="recovering">Recovering</option>
                </select>
              </div>
            </div>
            
            <div className="vet-dogs-grid">
              {dogs.filter(dog => {
                const matchesSearch = dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    dog.breed.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = statusFilter === "all" || dog.status.toLowerCase().includes(statusFilter.toLowerCase());
                return matchesSearch && matchesStatus;
              }).map((dog) => (
                <div key={dog._id} className="vet-dog-card">
                  <div className="vet-dog-image">
                    <img src={dog.photo} alt={dog.name} />
                    <div className={`vet-dog-status ${dog.status.toLowerCase().replace(" ", "-")}`}>
                      {dog.status}
                    </div>
                    {dog.healthCertified && (
                      <div className="vet-dog-certified">
                        <CheckCircle size={16} />
                        <span>Certified</span>
                      </div>
                    )}
                  </div>
                  <div className="vet-dog-info">
                    <h4>{dog.name}</h4>
                    <div className="vet-dog-details">
                      <p><strong>Breed:</strong> {dog.breed}</p>
                      <p><strong>Age:</strong> {dog.age}</p>
                      <p><strong>Last Checkup:</strong> {formatDate(dog.lastCheckup)}</p>
                      {dog.nextCheckup && (
                        <p><strong>Next Checkup:</strong> {formatDate(dog.nextCheckup)}</p>
                      )}
                    </div>
                    <div className="vet-dog-actions">
                      <button 
                        className="vet-btn primary"
                        onClick={() => {
                          setSelectedDog(dog);
                          setShowTreatmentForm(true);
                        }}
                      >
                        <Stethoscope size={16} />
                        Log Treatment
                      </button>
                      <button 
                        className="vet-btn secondary"
                        onClick={() => {
                          setSelectedDog(dog);
                          setShowVaccinationForm(true);
                        }}
                      >
                        <Syringe size={16} />
                        Add Vaccination
                      </button>
                      <button 
                        className="vet-btn secondary"
                        onClick={() => {
                          setSelectedDog(dog);
                          setShowCertificationForm(true);
                        }}
                      >
                        <UserCheck size={16} />
                        Certify Health
                      </button>
                      <button
                        className="vet-btn"
                        onClick={() => handleDownloadReport(dog)}
                        title="Download PDF Report"
                      >
                        <FileText size={16} />
                        Download Report
                      </button>
                      <button
                        className="vet-btn"
                        onClick={() => handleViewMedicalRecords(dog)}
                        title="View Medical History"
                      >
                        <History size={16} />
                        View Records
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Adoption Approvals Section */}
      {activeTab === "adoptions" && (
        <div className="vet-dashboard-content">
          <div className="vet-content-section">
            <div className="vet-section-header">
              <h3>
                <Heart size={24} />
                Pending Adoption Approvals
                <span className="vet-badge">{pendingAdoptions.length}</span>
              </h3>
              <div className="vet-search-filter">
                <div className="vet-search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search adoptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {pendingAdoptions.length === 0 ? (
              <div className="vet-empty-state">
                <Heart size={48} />
                <h4>No pending adoption approvals</h4>
                <p>All adoption requests have been processed.</p>
              </div>
            ) : (
              <div className="vet-adoptions-list">
                {pendingAdoptions.map(adoption => (
                  <div key={adoption._id} className="vet-adoption-card">
                    <div className="vet-adoption-header">
                      <div className="vet-adoption-dog">
                        <img 
                          src={adoption.dog?.photo} 
                          alt={adoption.dog?.name} 
                          onError={(e) => {
                            e.target.src = "https://placehold.co/300x300?text=Dog";
                          }}
                        />
                        <div className="vet-adoption-dog-info">
                          <h4>{adoption.dog?.name}</h4>
                          <p>{adoption.dog?.breed} • {adoption.dog?.age}</p>
                          <span className={`health-status ${adoption.dog?.healthStatus?.toLowerCase()}`}>
                            {adoption.dog?.healthStatus || "Health check needed"}
                          </span>
                        </div>
                      </div>
                      <div className="vet-adoption-status">
                        <span className="status-badge-pending">Pending Health Check</span>
                      </div>
                    </div>
                    
                    <div className="vet-adoption-details">
                      <div className="vet-adoption-user">
                        <Users size={16} />
                        <span><strong>Adopter:</strong> {adoption.user?.name}</span>
                      </div>
                      <div className="vet-adoption-contact">
                        <span><strong>Email:</strong> {adoption.user?.email}</span>
                        
                      </div>
                      <div className="vet-adoption-date">
                        <Calendar size={16} />
                        <span><strong>Request Date:</strong> {formatDate(adoption.createdAt)}</span>
                      </div>
                    </div>
                    
                    {adoption.notes && (
                      <div className="vet-adoption-message">
                        <strong>Adopter's Message:</strong>
                        <p>{adoption.notes}</p>
                      </div>
                    )}
                    
                    <div className="vet-adoption-actions">
                      <button 
                        className="vet-btn secondary"
                        onClick={() => handleViewAdoptionDetails(adoption)}
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button 
                        className="vet-btn success"
                        onClick={() => handleCertifyHealthForAdoption(adoption.dog._id, adoption._id, true)}
                      >
                        <CheckCircle size={16} />
                        Certify Healthy
                      </button>
                      <button 
                        className="vet-btn warning"
                        onClick={() => handleCertifyHealthForAdoption(adoption.dog._id, adoption._id, false)}
                      >
                        <AlertCircle size={16} />
                        Needs Attention
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medical Records Modal */}
      {showMedicalRecords && selectedDog && (
        <div className="vet-modal-overlay">
          <div className="vet-modal large">
            <div className="vet-modal-header">
              <h3>Medical Records - {selectedDog.name}</h3>
              <button className="vet-close-btn" onClick={() => setShowMedicalRecords(false)}>×</button>
            </div>
            <div className="vet-modal-content">
              <div className="vet-records-filter">
                <select
                  value={recordTypeFilter}
                  onChange={(e) => setRecordTypeFilter(e.target.value)}
                >
                  <option value="all">All Records</option>
                  <option value="treatment">Treatments</option>
                  <option value="vaccination">Vaccinations</option>
                  <option value="note">Notes</option>
                </select>
              </div>
              
              <div className="vet-records-list">
                {filteredMedicalRecords.length === 0 ? (
                  <div className="vet-empty-state">
                    <FileText size={32} />
                    <p>No medical records found</p>
                  </div>
                ) : (
                  filteredMedicalRecords.map(record => (
                    <div key={record._id} className="vet-record-item">
                      <div className="vet-record-header">
                        <div className="vet-record-title">
                          <h4>{record.title}</h4>
                          <span className={`vet-record-type ${record.recordType}`}>
                            {record.recordType}
                          </span>
                        </div>
                        <div className="vet-record-actions">
                          <button 
                            className="vet-btn-icon"
                            onClick={() => handleEditRecord(record)}
                            title="Edit Record"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="vet-btn-icon danger"
                            onClick={() => handleDeleteRecord(record._id)}
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="vet-record-details">
                        <p><strong>Date:</strong> {formatDate(record.createdAt)}</p>
                        <p><strong>Administered by:</strong> {record.administeredBy?.name || "Veterinarian"}</p>
                        
                        {record.description && (
                          <p><strong>Notes:</strong> {record.description}</p>
                        )}
                        
                        {record.recordType === "treatment" && record.treatment?.procedure && (
                          <p><strong>Treatment:</strong> {record.treatment.procedure}</p>
                        )}
                        
                        {record.recordType === "treatment" && record.medications?.length > 0 && (
                          <div>
                            <strong>Medications:</strong>
                            {record.medications.map((med, index) => (
                              <div key={index} className="vet-medication-item">
                                {med.name} {med.dosage && `- ${med.dosage}`}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {record.recordType === "vaccination" && record.vaccination && (
                          <div>
                            <p><strong>Batch Number:</strong> {record.vaccination.batchNumber}</p>
                            {record.vaccination.nextDueDate && (
                              <p><strong>Next Due:</strong> {formatDate(record.vaccination.nextDueDate)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="vet-modal-actions">
              <button className="vet-btn" onClick={() => setShowMedicalRecords(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Adoption Details Modal */}
      {showAdoptionDetails && selectedAdoption && (
        <div className="vet-modal-overlay">
          <div className="vet-modal large">
            <div className="vet-modal-header">
              <h3>Adoption Request Details</h3>
              <button className="vet-close-btn" onClick={() => setShowAdoptionDetails(false)}>×</button>
            </div>
            <div className="vet-modal-content">
              <div className="vet-adoption-detail-section">
                <h4>Dog Information</h4>
                <div className="vet-adoption-dog-detail">
                  <img 
                    src={selectedAdoption.dog?.photo} 
                    alt={selectedAdoption.dog?.name} 
                    onError={(e) => {
                      e.target.src = "https://placehold.co/300x300?text=Dog";
                    }}
                  />
                  <div className="vet-adoption-dog-detail-info">
                    <p><strong>Name:</strong> {selectedAdoption.dog?.name}</p>
                    <p><strong>Breed:</strong> {selectedAdoption.dog?.breed}</p>
                    <p><strong>Age:</strong> {selectedAdoption.dog?.age}</p>
                    <p><strong>Health Status:</strong> {selectedAdoption.dog?.healthStatus}</p>
                  </div>
                </div>
              </div>
              
              <div className="vet-adoption-detail-section">
                <h4>Adopter Information</h4>
                <div className="vet-adoption-user-detail">
                  <p><strong>Name:</strong> {selectedAdoption.user?.name}</p>
                  <p><strong>Email:</strong> {selectedAdoption.user?.email}</p>
                  
                </div>
              </div>
              
              <div className="vet-adoption-detail-section">
                <h4>Adoption Details</h4>
                <div className="vet-adoption-request-detail">
                  <p><strong>Request Date:</strong> {formatDate(selectedAdoption.createdAt)}</p>
                  <p><strong>Status:</strong> {selectedAdoption.status}</p>
                  <p><strong>Vet Review Status:</strong> {selectedAdoption.vetReviewStatus}</p>
                  {selectedAdoption.notes && (
                    <p><strong>Adopter's Message:</strong> {selectedAdoption.notes}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="vet-modal-actions">
              <button className="vet-btn" onClick={() => setShowAdoptionDetails(false)}>Close</button>
              <button 
                className="vet-btn success"
                onClick={() => handleCertifyHealthForAdoption(selectedAdoption.dog._id, selectedAdoption._id, true)}
              >
                Certify Healthy
              </button>
              <button 
                className="vet-btn warning"
                onClick={() => handleCertifyHealthForAdoption(selectedAdoption.dog._id, selectedAdoption._id, false)}
              >
                Needs Attention
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing modals for treatment, vaccination, and certification */}
      {showTreatmentForm && selectedDog && (
        <div className="vet-modal-overlay">
          <div className="vet-modal">
            <div className="vet-modal-header">
              <h3>{editingRecord ? "Edit Treatment" : "Log Treatment"} for {selectedDog.name}</h3>
              <button className="vet-close-btn" onClick={handleCloseTreatmentForm}>×</button>
            </div>
            <div className="vet-modal-content">
              <div className="vet-form-group">
                <label>Diagnosis *</label>
                <input
                  type="text"
                  value={treatmentForm.diagnosis}
                  onChange={(e) => setTreatmentForm({...treatmentForm, diagnosis: e.target.value})}
                  placeholder="Enter diagnosis"
                />
              </div>
              <div className="vet-form-group">
                <label>Treatment *</label>
                <textarea
                  value={treatmentForm.treatment}
                  onChange={(e) => setTreatmentForm({...treatmentForm, treatment: e.target.value})}
                  placeholder="Describe treatment"
                  rows="3"
                />
              </div>
              <div className="vet-form-row">
                <div className="vet-form-group">
                  <label>Medication</label>
                  <input
                    type="text"
                    value={treatmentForm.medication}
                    onChange={(e) => setTreatmentForm({...treatmentForm, medication: e.target.value})}
                    placeholder="Medication name"
                  />
                </div>
                <div className="vet-form-group">
                  <label>Dosage</label>
                  <input
                    type="text"
                    value={treatmentForm.dosage}
                    onChange={(e) => setTreatmentForm({...treatmentForm, dosage: e.target.value})}
                    placeholder="Dosage instructions"
                  />
                </div>
              </div>
              <div className="vet-form-group">
                <label>Notes</label>
                <textarea
                  value={treatmentForm.notes}
                  onChange={(e) => setTreatmentForm({...treatmentForm, notes: e.target.value})}
                  placeholder="Additional notes"
                  rows="2"
                />
              </div>
            </div>
            <div className="vet-modal-actions">
              <button className="vet-btn" onClick={handleCloseTreatmentForm}>Cancel</button>
              <button className="vet-btn primary" onClick={handleAddTreatment}>
                {editingRecord ? "Update Treatment" : "Save Treatment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showVaccinationForm && selectedDog && (
        <div className="vet-modal-overlay">
          <div className="vet-modal">
            <div className="vet-modal-header">
              <h3>{editingRecord ? "Edit Vaccination" : "Add Vaccination"} for {selectedDog.name}</h3>
              <button className="vet-close-btn" onClick={handleCloseVaccinationForm}>×</button>
            </div>
            <div className="vet-modal-content">
              <div className="vet-form-group">
                <label>Vaccine Type *</label>
                <select
                  value={vaccinationForm.vaccineType}
                  onChange={(e) => setVaccinationForm({...vaccinationForm, vaccineType: e.target.value})}
                >
                  <option value="">Select Vaccine Type</option>
                  <option value="Rabies">Rabies</option>
                  <option value="DHPP">DHPP (Distemper, Hepatitis, Parainfluenza, Parvovirus)</option>
                  <option value="Bordetella">Bordetella (Kennel Cough)</option>
                  <option value="Leptospirosis">Leptospirosis</option>
                  <option value="Lyme">Lyme Disease</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="vet-form-group">
                <label>Batch Number *</label>
                <input
                  type="text"
                  value={vaccinationForm.batchNumber}
                  onChange={(e) => setVaccinationForm({...vaccinationForm, batchNumber: e.target.value})}
                  placeholder="Enter batch number"
                />
              </div>
              <div className="vet-form-group">
                <label>Next Due Date</label>
                <input
                  type="date"
                  value={vaccinationForm.nextDueDate}
                  onChange={(e) => setVaccinationForm({...vaccinationForm, nextDueDate: e.target.value})}
                />
              </div>
              <div className="vet-form-group">
                <label>Notes</label>
                <textarea
                  value={vaccinationForm.notes}
                  onChange={(e) => setVaccinationForm({...vaccinationForm, notes: e.target.value})}
                  placeholder="Additional notes"
                  rows="2"
                />
              </div>
            </div>
            <div className="vet-modal-actions">
              <button className="vet-btn" onClick={handleCloseVaccinationForm}>Cancel</button>
              <button className="vet-btn primary" onClick={handleAddVaccination}>
                {editingRecord ? "Update Vaccination" : "Save Vaccination"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCertificationForm && selectedDog && (
        <div className="vet-modal-overlay">
          <div className="vet-modal">
            <div className="vet-modal-header">
              <h3>Certify Health for {selectedDog.name}</h3>
              <button className="vet-close-btn" onClick={() => setShowCertificationForm(false)}>×</button>
            </div>
            <div className="vet-modal-content">
              <div className="vet-form-group">
                <label>Health Status *</label>
                <select
                  value={certificationForm.healthStatus}
                  onChange={(e) => setCertificationForm({...certificationForm, healthStatus: e.target.value})}
                >
                  <option value="Healthy">Healthy</option>
                  <option value="Recovering">Recovering</option>
                  <option value="Needs Attention">Needs Attention</option>
                  <option value="Not Fit">Not Fit for Adoption</option>
                </select>
              </div>
              <div className="vet-form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={certificationForm.approvalForAdoption}
                    onChange={(e) => setCertificationForm({...certificationForm, approvalForAdoption: e.target.checked})}
                  />
                  Approve for Adoption
                </label>
              </div>
              <div className="vet-form-group">
                <label>Notes</label>
                <textarea
                  value={certificationForm.notes}
                  onChange={(e) => setCertificationForm({...certificationForm, notes: e.target.value})}
                  placeholder="Health assessment notes"
                  rows="3"
                />
              </div>
            </div>
            <div className="vet-modal-actions">
              <button className="vet-btn" onClick={() => setShowCertificationForm(false)}>Cancel</button>
              <button className="vet-btn primary" onClick={handleCertifyHealth}>Certify Health</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetDashboard;