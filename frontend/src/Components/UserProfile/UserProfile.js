import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  PawPrint,
  Users,
  Calendar,
  HeartHandshake,
  LogOut,
  Edit3,
  Save,
  X,
  MapPin,
  Phone,
  Mail,
  Crown,
  Award,
  Clock,
  Gift,
  Camera,
  Dog
} from 'lucide-react';
import './UserProfile.css';
import axios from 'axios';

const UserProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, updateProfile, loading } = useAuth();

  // State for user data and editing
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    membership: 'Standard Member',
    photo: '/default-avatar.png',
    adoptedDogs: 0,
    isVolunteer: false,
    volunteerHours: 0,
    eventsRegistered: 0,
    donationsMade: 0,
    joinedDate: ''
  });

  const [activeSection, setActiveSection] = useState("adoptions");
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState('');
  const [myEvents, setMyEvents] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [photoPreview, setPhotoPreview] = useState('/default-avatar.png');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [adoptedDogsList, setAdoptedDogsList] = useState([]);

  // Get user photo from localStorage
  const getStoredUserPhoto = () => {
    if (!user) return null;
    const storedPhotos = JSON.parse(localStorage.getItem('userProfilePhotos') || '{}');
    return storedPhotos[user.id] || storedPhotos[user.email] || null;
  };

  // Save user photo to localStorage
  const saveUserPhotoToStorage = (photoData) => {
    if (!user) return;
    const storedPhotos = JSON.parse(localStorage.getItem('userProfilePhotos') || '{}');
    const key = user.id || user.email;
    if (key) {
      storedPhotos[key] = photoData;
      localStorage.setItem('userProfilePhotos', JSON.stringify(storedPhotos));
    }
  };

  // Remove user photo from localStorage
  const removeUserPhotoFromStorage = () => {
    if (!user) return;
    const storedPhotos = JSON.parse(localStorage.getItem('userProfilePhotos') || '{}');
    const key = user.id || user.email;
    if (key && storedPhotos[key]) {
      delete storedPhotos[key];
      localStorage.setItem('userProfilePhotos', JSON.stringify(storedPhotos));
    }
  };

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Check for stored photo first
      const storedPhoto = getStoredUserPhoto();
      
      const userData = {
        name: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || user.mobile || '',
        location: user.location || '',
        membership: user.membership || 'Standard Member',
        photo: storedPhoto || user.profilePicture || '/default-avatar.png',
        adoptedDogs: user.adoptedDogs || 0,
        isVolunteer: user.role === 'volunteer' || user.isVolunteer || false,
        volunteerHours: user.volunteerHours || 0,
        eventsRegistered: user.eventsRegistered || 0,
        donationsMade: user.donationsMade || 0,
        joinedDate: user.createdAt || user.joinedDate || new Date().toISOString()
      };
      
      setUserProfile(userData);
      setEditData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        location: userData.location
      });
      
      // Set photo preview - prioritize stored photo
      if (storedPhoto) {
        setPhotoPreview(storedPhoto);
      } else if (user.profilePicture) {
        const fullPhotoUrl = user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : user.profilePicture.startsWith('/uploads/')
          ? `http://localhost:3000${user.profilePicture}`
          : `/uploads/profiles/${user.profilePicture}`;
        setPhotoPreview(fullPhotoUrl);
      } else {
        setPhotoPreview('/default-avatar.png');
      }
    }
  }, [user]);

  // Load user's adopted dogs
  useEffect(() => {
    if (!user) return;
    const loadAdoptedDogs = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const res = await axios.get('/adoption-requests/mine', { headers });
        const approvedRequests = res.data.filter(req => 
          req.requestStatus?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'approved'
        );
        
        const adoptedDogsWithPhotos = approvedRequests.map(req => ({
          id: req._id,
          name: req.dog?.name || 'Unknown Dog',
          breed: req.dog?.breed || 'Mixed Breed',
          age: req.dog?.age || 'Unknown',
          photo: req.dog?.photo 
            ? (req.dog.photo.startsWith('http') 
                ? req.dog.photo 
                : `http://localhost:3000/uploads/dogs/${req.dog.photo}`)
            : '/default-dog.jpg',
          adoptionDate: req.createdAt || new Date().toISOString(),
          status: req.requestStatus || req.status
        }));
        
        setAdoptedDogsList(adoptedDogsWithPhotos);
        setUserProfile(prev => ({ 
          ...prev, 
          adoptedDogs: adoptedDogsWithPhotos.length 
        }));
      } catch (e) {
        console.error('Failed to load adopted dogs', e);
      }
    };
    loadAdoptedDogs();
  }, [user]);

  // Load user's event registrations
  useEffect(() => {
    if (!user) return;
    const loadMyEvents = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const res = await axios.get('/events/mine', { headers });
        const list = res.data?.data?.events || res.data || [];
        setMyEvents(list);
        setUserProfile(prev => ({ ...prev, eventsRegistered: list.length }));
      } catch (e) {
        console.error('Failed to load my events', e);
      }
    };
    loadMyEvents();
  }, [user]);

  // Load user's donations
  useEffect(() => {
    if (!user) return;
    const loadMyDonations = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const res = await axios.get('/donations/mine', { headers });
        const list = res.data?.data?.donations || res.data || [];
        setMyDonations(list);
        setUserProfile(prev => ({ ...prev, donationsMade: list.length }));
      } catch (e) {
        console.error('Failed to load my donations', e);
      }
    };
    loadMyDonations();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // If navigated with a preferred section, activate it
  useEffect(() => {
    const target = location.state && location.state.section;
    if (target) {
      setActiveSection(target);
    }
  }, [location.state]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error('Logout error:', error);
      navigate("/login");
    }
  };

  // Handle photo upload - Local storage version
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF)');
      return;
    }

    if (file.size > maxSize) {
      setError('Image size should be less than 5MB');
      return;
    }

    try {
      setPhotoUploading(true);
      setError('');

      // Create temporary preview
      const tempPreview = URL.createObjectURL(file);
      setPhotoPreview(tempPreview);

      // Convert file to base64 for localStorage
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Image = event.target.result;
        
        // Save to localStorage
        saveUserPhotoToStorage(base64Image);
        
        // Update local state
        setUserProfile(prev => ({
          ...prev,
          photo: base64Image
        }));

        // Update auth context
        updateProfile({ profilePicture: base64Image });

        // Clean up temporary URL
        URL.revokeObjectURL(tempPreview);
        
        setPhotoUploading(false);
      };

      reader.onerror = () => {
        setError('Failed to read the image file');
        setPhotoUploading(false);
        // Revert to previous photo on error
        const previousPhoto = getStoredUserPhoto() || '/default-avatar.png';
        setPhotoPreview(previousPhoto);
      };

      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Photo upload error:', error);
      setError('Failed to upload photo: ' + error.message);
      setPhotoUploading(false);
      
      // Revert to previous photo on error
      const previousPhoto = getStoredUserPhoto() || '/default-avatar.png';
      setPhotoPreview(previousPhoto);
    }
  };

  // Remove current photo
  const handleRemovePhoto = () => {
    removeUserPhotoFromStorage();
    setPhotoPreview('/default-avatar.png');
    setUserProfile(prev => ({
      ...prev,
      photo: '/default-avatar.png'
    }));
    updateProfile({ profilePicture: null });
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setUpdateLoading(true);
    setError('');
    
    try {
      // Update profile through AuthContext
      await updateProfile(editData);
      
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        ...editData
      }));
      
      setIsEditing(false);
    } catch (error) {
      setError(error.message || 'Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-header">
          <h1>My Profile</h1>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show error if user not found
  if (!user) {
    return (
      <div className="user-profile-container">
        <div className="user-profile-header">
          <h1>Profile Not Found</h1>
          <p>Please log in to view your profile.</p>
          <button 
            className="user-profile-btn primary"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <h1>My Profile</h1>
        <p>Welcome back, {userProfile.name || 'User'}! <Dog size={30} color="#0d5344ff"/></p>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      <div className="user-profile-content">
        {/* Personal Info */}
        <div className="user-profile-card">
          <div className="profile-header">
            <div className="avatar-section">
              <div className="photo-container">
                <img src={photoPreview} alt="User" className="user-profile-photo" />
                {photoUploading && (
                  <div className="photo-upload-overlay">
                    <div className="spinner"></div>
                    <span className="uploading-text">Uploading...</span>
                  </div>
                )}
                {isEditing && !photoUploading && (
                  <>
                    <label htmlFor="photo-upload" className="camera-icon">
                      <Camera size={20} /><br />
                    </label><br />
                    {photoPreview !== '/default-avatar.png' && (
                      <button 
                        className="remove-photo-btn"
                        onClick={handleRemovePhoto}
                        type="button"
                        title="Remove photo"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
              
              {userProfile.membership.includes("Gold") && (
                <div className="premium-badge">
                  <Crown size={14} />
                  <span>Premium</span>
                </div>
              )}

              {isEditing && (
                <div className="photo-upload-section">
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    disabled={photoUploading}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-info">
                    <p>Click the camera icon to upload a new photo</p>
                    <small>JPEG, PNG, GIF up to 5MB</small>
                    {photoPreview !== '/default-avatar.png' && (
                      <small>Click the X icon to remove current photo</small>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="user-profile-info">
              {isEditing ? (
                <div className="edit-fields">
                  <div className="input-group">
                    <label>Full Name</label>
                    <div className="input-with-icon">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="edit-input"
                      placeholder="Enter your full name"
                    />
                  </div>
                   </div>
                  <div className="input-group">
                    <label> <Mail size={16} /> Email Address</label>
                    <div className="input-with-icon">
                     
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="edit-input"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label><Phone size={16} /> Phone Number</label>
                    <div className="input-with-icon">
                      
                      <input
                        type="text"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="edit-input"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                 
                </div>
              ) : (
                <>
                  <h2>{userProfile.name || 'User'}</h2>
                 <div className="user-detail" > 
                    <Mail size={16} />
                    <span>{userProfile.email || 'No email provided'}</span>
                  </div>
                  <div className="user-detail">
                    <Phone size={16} />
                    <span>{userProfile.phone || 'No phone provided'}</span>
                  </div>
                  
                  <div className="membership-badge">
                    <Award size={16} />
                    <span>{userProfile.membership}</span>
                  </div>
                  <div className="join-date">
                    <Clock size={14} />
                    <span>Member since {formatDate(userProfile.joinedDate)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Buttons aligned right */}
            <div className="user-profile-buttons">
              {isEditing ? (
                <>
                  <button
                    className="user-profile-btn save"
                    onClick={handleSaveProfile}
                    disabled={updateLoading || photoUploading}
                  >
                    <Save size={16} /> {updateLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    className="user-profile-btn cancel"
                    onClick={() => {
                      setIsEditing(false);
                      setError('');
                      setEditData({
                        name: userProfile.name,
                        email: userProfile.email,
                        phone: userProfile.phone,
                        
                      });
                      // Reset photo preview to stored photo
                      const storedPhoto = getStoredUserPhoto();
                      setPhotoPreview(storedPhoto || '/default-avatar.png');
                    }}
                    disabled={updateLoading || photoUploading}
                  >
                    <X size={16} /> Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="user-profile-btn edit"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 size={16} /> Edit Profile
                  </button>
                  <button
                    className="user-profile-btn logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Summary Row */}
        <div className="user-profile-summary">
          <div 
            className={`user-profile-summary-card ${activeSection === "adoptions" ? "active" : ""}`} 
            onClick={() => setActiveSection("adoptions")}
          >
            <div className="card-icon adoptions">
              <PawPrint size={24} />
            </div>
            <h3>{userProfile.adoptedDogs}</h3>
            <p>Adoptions</p>
          </div>
          
          <div 
            className={`user-profile-summary-card ${activeSection === "volunteer" ? "active" : ""}`}
            onClick={() => {
              if(userProfile.isVolunteer) {
                setActiveSection("volunteer");
              } else {
                setShowVolunteerModal(true);
              }
            }}
          >
            <div className="card-icon volunteer">
              <Users size={24} />
            </div><br></br><br></br><br></br><br></br>
            {userProfile.isVolunteer ? (
              <>
                {userProfile.volunteerHours > 0 && <h3>{userProfile.volunteerHours}</h3>}
                <p>Volunteer Contribution</p>
              </>
            ) : (
              <>
                <p>Become a Volunteer</p>
              </>
            )}
          </div>

          
          
          <div 
            className={`user-profile-summary-card ${activeSection === "events" ? "active" : ""}`} 
            onClick={() => setActiveSection("events")}
          >
            <div className="card-icon events">
              <Calendar size={24} />
            </div>
            <h3>{userProfile.eventsRegistered}</h3>
            <p>Events</p>
          </div>
          
          <div 
            className={`user-profile-summary-card ${activeSection === "donations" ? "active" : ""}`} 
            onClick={() => setActiveSection("donations")}
          >
            <div className="card-icon donations">
              <Gift size={24} />
            </div>
            <h3>{userProfile.donationsMade}</h3>
            <p>Donations</p>
          </div>
        </div>

        {/* Section Details */}
        <div className="user-profile-details">
          {activeSection === "adoptions" && (
            <div className="user-profile-section-card">
              <div className="section-header">
                <h3><PawPrint size={24} /> Your Adoption History</h3>
                {(userProfile.adoptedDogs > 0 || adoptedDogsList.length > 0) && (
                  <button
                    className="user-profile-btn primary"
                    onClick={() => navigate('/adoptiondashboard')}
                  >
                    View Adoption Dashboard
                  </button>
                )}
              </div>
              
              {adoptedDogsList.length > 0 ? (
                <div className="adoptions-content">
                  <p className="adoption-success-message">
                    You've given a forever home to <strong>{adoptedDogsList.length} dogs</strong>! 
                    Thank you for being an amazing Dog parent! 
                  </p>
                  
                  {/* Display adopted dogs with photos */}
                  <div className="adopted-dogs-grid">
                    {adoptedDogsList.map(dog => (
                      <div key={dog.id} className="adopted-dog-card">
                        <div className="dog-photo-container">
                          <img 
                            src={dog.photo} 
                            alt={dog.name}
                            className="adopted-dog-photo"
                            onError={(e) => {
                              e.target.src = '/default-dog.jpg';
                            }}
                          />
                        </div>
                        <div className="adopted-dog-info">
                          <h4>{dog.name}</h4>
                          <p className="dog-breed">{dog.breed}</p>
                          <p className="dog-age">{dog.age}</p>
                          <small className="adoption-date">Adopted on {formatDate(dog.adoptionDate)}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="achievement-badge">
                    <Award size={18} />
                    <span>Canine Guardian</span>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <PawPrint size={48} />
                  <p>No adoptions yet</p>
                  <p className="empty-state-description">
                    Start your adoption journey and give a furry friend their forever home!
                  </p>
                  <button
                    className="user-profile-btn primary"
                    onClick={() => navigate('/adoptiondashboard')}
                  >
                    Browse Adoptable Dogs
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "volunteer" && userProfile.isVolunteer && (
  <div className="user-profile-section-card">
    <div className="section-header">
      <h3><Users size={24} /> Volunteer Dashboard</h3>
      <button
        className="user-profile-btn primary"
        onClick={() => navigate('/volunteer/dashboard')}
      >
        Go to Volunteer Hub
      </button>
    </div>
    
    <div className="volunteer-content">
      <div className="volunteer-welcome">
        <h4>Thank You for Being a Volunteer!</h4>
        <p>
          Your dedication and compassion make a real difference in the lives of our rescue dogs. 
          As a volunteer, you're an essential part of our mission to provide love, care, and 
          second chances to dogs in need.
        </p>
      </div>
      
      {userProfile.volunteerHours > 0 && (
        <div className="volunteer-stats">
          <div className="volunteer-stat-card">
            <h4>{userProfile.volunteerHours}</h4>
            <p>Hours Contributed</p>
          </div>
        </div>
      )}
      
      <div className="volunteer-message">
        <p>
          <strong>Your impact matters:</strong> Every hour you spend with our dogs helps socialize them, 
          build their confidence, and prepare them for their forever homes. Whether you're walking dogs, 
          assisting with feeding, helping with cleaning, or simply providing companionship, you're 
          contributing to their wellbeing and adoption success.
        </p>
        
        <div className="volunteer-reminder">
          <h5>Ready to make a difference today?</h5>
          <p>
            Check the Volunteer Hub to see available shifts, upcoming events, and current needs. 
            Your continued support helps us save more lives every day!
          </p>
        </div>
      </div>
    </div>
  </div>
)}

          {activeSection === "events" && (
            <div className="user-profile-section-card">
              <div className="section-header">
                <h3><Calendar size={24} /> Your Registered Events</h3>
                <button
                  className="user-profile-btn primary"
                  onClick={() => navigate('/events')}
                >
                  Browse All Events
                </button>
              </div>
              {myEvents.length > 0 ? (
                <div className="events-list">
                  {myEvents.map(ev => (
                    <div key={ev._id || ev.id} className="event-list-item">
                      <div className="event-thumb">
                        {ev.photos && ev.photos[0] ? (
                          <img 
                            src={ev.photos[0].startsWith('http') ? ev.photos[0] : `http://localhost:3000${ev.photos[0]}`} 
                            alt={ev.title}
                            className="event-photo"
                          />
                        ) : (
                          <div className="event-thumb-placeholder">
                            <Calendar size={20} />
                          </div>
                        )}
                      </div>
                      <div className="event-info">
                        <h4>{ev.title}</h4>
                        <p className="event-date">
                          <Calendar size={14} /> {ev.date ? new Date(ev.date).toLocaleDateString() : ''}
                          {' '}• {ev.startTime || ''}
                        </p>
                        <p className="event-location">
                          <MapPin size={14} /> {ev.location || 'Location not specified'}
                        </p>
                      </div>
                      <div className="event-actions">
                        <span className={`status-badge ${ev.status?.toLowerCase() || 'registered'}`}>
                          {ev.status || 'Registered'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Calendar size={48} />
                  <p>No events registered yet</p>
                  <p className="empty-state-description">
                    Discover and join our upcoming events to connect with other pet lovers!
                  </p>
                  <button
                    className="user-profile-btn primary"
                    onClick={() => navigate('/events')}
                  >
                    View Upcoming Events
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "donations" && (
            <div className="user-profile-section-card">
              <div className="section-header">
                <h3><Gift size={24} /> Your Donations</h3>
                <button
                  className="user-profile-btn primary"
                  onClick={() => navigate('/donate')}
                >
                  Make Another Donation
                </button>
              </div>
              
              {myDonations.length > 0 ? (
                <div className="donations-content">
                  <p className="donations-summary">
                    You've made <strong>{myDonations.length} donations</strong> to support our furry friends! 
                    Your generosity makes a real difference. 
                  </p>
                  <div className="donations-list">
                    {myDonations.map(d => (
                      <div key={d._id || d.id} className="donation-item">
                        <div className="donation-main">
                          <div className="donation-amount">LKR {Number(d.amount).toLocaleString()}</div>
                          <div className="donation-meta">
                            <span className="donation-method">{d.paymentMethod}</span>
                            {d.cardLast4 && <span> • Card •••• {d.cardLast4}</span>}
                            {d.bankName && <span> • {d.bankName}</span>}
                            {d.reference && <span> • Ref: {d.reference}</span>}
                          </div>
                        </div>
                        <div className="donation-side">
                          <span className="donation-date">{new Date(d.createdAt).toLocaleDateString()}</span>
                          <span className={`donation-frequency ${d.frequency?.toLowerCase()}`}>
                            {d.frequency || 'One-time'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <Gift size={48} />
                  <p>No donations yet</p>
                  <p className="empty-state-description">
                    Your support helps us provide care, food, and medical treatment for rescue dogs.
                  </p>
                  <button
                    className="user-profile-btn primary"
                    onClick={() => navigate('/donate')}
                  >
                    Make Your First Donation
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Volunteer Modal */}
      {showVolunteerModal && (
        <div className="user-profile-modal-overlay">
          <div className="user-profile-modal">
            <div className="modal-icon">
              <Users size={32} />
            </div>
            <h3>Join Our Volunteer Team</h3>
            <p>Make a pawsitive impact by helping care for our rescue dogs. Volunteers assist with walking, feeding, and providing love to our furry friends.</p>
            <div className="user-profile-modal-actions">
              <button
                className="user-profile-btn primary"
                onClick={() => {
                  setShowVolunteerModal(false);
                  navigate('/volunteerregister');
                }}
              >
                Register as Volunteer
              </button>
              <button
                className="user-profile-btn cancel"
                onClick={() => setShowVolunteerModal(false)}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;