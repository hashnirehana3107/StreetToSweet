import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Users,
  LogOut,
  PawPrint,
  Home,
  Calendar,
  AlertTriangle,
  Stethoscope,
  BarChart3,
  Settings,
  Bell,
  UserPlus,
  FileText,
  ClipboardList,
  MapPin,
  Heart,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  MoreVertical,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Map,
  Truck,
  Shield,
  FileCheck,
  Activity,
  Clock,
  AlertCircle
} from "lucide-react";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingActions, setPendingActions] = useState([]);
  const [users, setUsers] = useState([]);
  const [dogs, setDogs] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const [rescueReports, setRescueReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);
  const [showAddRescueModal, setShowAddRescueModal] = useState(false);
  const [showAddDogModal, setShowAddDogModal] = useState(false);
  const [showEmergencyMap, setShowEmergencyMap] = useState(false);
  const [selectedRescue, setSelectedRescue] = useState(null);
  
  // New states for volunteer management
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [showAssignDogsModal, setShowAssignDogsModal] = useState(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [availableDogs, setAvailableDogs] = useState([]);
  const [selectedDogs, setSelectedDogs] = useState([]);
  const [volunteersData, setVolunteersData] = useState([]);
  
  // New states for view and edit functionality
  const [selectedItem, setSelectedItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);

  // Validation states
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "adopter",
    status: "active"
  });
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    location: "",
    attendees: 0,
    photo: null
  });
  const [newRescue, setNewRescue] = useState({
    location: "",
    reportedBy: "",
    status: "pending",
    urgency: "medium"
  });
  const [newDog, setNewDog] = useState({
    name: "",
    breed: "",
    age: "",
    color: "",
    tagColor: "blue",
    status: "rescue",
    healthStatus: "good",
    photo: null
  });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateRequired = (value, fieldName) => {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`;
    }
    return '';
  };

  const validateFile = (file, maxSizeMB = 5, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) => {
    if (!file) return '';
    
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'File must be an image (JPEG, PNG, GIF, WEBP)';
    }
    
    return '';
  };

  const validateDate = (date, fieldName) => {
    if (!date) return `${fieldName} is required`;
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return `${fieldName} cannot be in the past`;
    }
    
    return '';
  };

  const validateNumber = (value, fieldName, min = 0, max = 10000) => {
    if (value === '' || value === null || value === undefined) {
      return `${fieldName} is required`;
    }
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return `${fieldName} must be a number`;
    }
    
    if (numValue < min) {
      return `${fieldName} must be at least ${min}`;
    }
    
    if (numValue > max) {
      return `${fieldName} cannot exceed ${max}`;
    }
    
    return '';
  };

  // Form-specific validation functions
  const validateUserForm = (userData) => {
    const errors = {};
    
    errors.name = validateRequired(userData.name, 'Name');
    errors.email = validateRequired(userData.email, 'Email');
    
    if (!errors.email && !validateEmail(userData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    return errors;
  };

  const validateEventForm = (eventData) => {
    const errors = {};
    
    errors.title = validateRequired(eventData.title, 'Event title');
    errors.date = validateDate(eventData.date, 'Event date');
    errors.location = validateRequired(eventData.location, 'Event location');
    errors.attendees = validateNumber(eventData.attendees, 'Attendees', 0, 1000);
    
    if (eventData.photo) {
      errors.photo = validateFile(eventData.photo);
    }
    
    return errors;
  };

  const validateDogForm = (dogData) => {
    const errors = {};
    
    errors.name = validateRequired(dogData.name, 'Dog name');
    errors.breed = validateRequired(dogData.breed, 'Breed');
    errors.age = validateRequired(dogData.age, 'Age');
    
    if (dogData.photo) {
      errors.photo = validateFile(dogData.photo);
    }
    
    return errors;
  };

  const validateRescueForm = (rescueData) => {
    const errors = {};
    
    errors.location = validateRequired(rescueData.location, 'Location');
    errors.reportedBy = validateRequired(rescueData.reportedBy, 'Reporter name');
    
    return errors;
  };

  const validateTaskForm = (taskData) => {
    const errors = {};
    
    errors.taskDescription = validateRequired(taskData.taskDescription, 'Task description');
    errors.scheduledTime = validateRequired(taskData.scheduledTime, 'Scheduled time');
    
    if (!taskData.scheduledTime) {
      errors.scheduledTime = 'Scheduled time is required';
    } else {
      const scheduledTime = new Date(taskData.scheduledTime);
      const now = new Date();
      if (scheduledTime < now) {
        errors.scheduledTime = 'Scheduled time cannot be in the past';
      }
    }
    
    errors.estimatedDuration = validateNumber(taskData.estimatedDuration, 'Estimated duration', 5, 480);
    
    return errors;
  };

  // Clear form errors for a specific field
  const clearFieldError = (fieldName) => {
    setFormErrors(prev => ({
      ...prev,
      [fieldName]: ''
    }));
  };

  // Check if form has errors
  const hasFormErrors = (errors) => {
    return Object.values(errors).some(error => error !== '');
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchDashboardData();
    fetchVolunteersData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, usersRes, dogsRes, adoptionsRes, eventsRes, emergencyRes] = await Promise.all([
        axios.get('/admin/dashboard'),
        axios.get('/admin/users', { params: { page: 1, limit: 50 } }),
        axios.get('/dogs'),
        axios.get('/adoption-requests'),
        axios.get('/admin/events', { params: { page: 1, limit: 50 } }),
        axios.get('/emergency-reports', { params: { limit: 100 } })
      ]);

      const overview = dashRes.data?.data?.overview || {};
      const adoptionStats = dashRes.data?.data?.adoptionStats || {};

      const mappedEmergency = (emergencyRes.data?.data || []).map(er => ({
        id: er.id,
        location: er.address,
        reportedBy: er.reportedBy || 'Unknown',
        date: er.timestamp ? new Date(er.timestamp).toISOString().split('T')[0] : '',
        status: er.status,
        urgency: (er.priority === 'Emergency' || er.priority === 'High') ? 'high' : (er.priority === 'Normal' ? 'low' : 'medium')
      }));
      setRescueReports(mappedEmergency);

      const mappedDogs = (dogsRes.data || []).map(d => ({
        id: d._id,
        uniqueCode: d.id || d._id,
        name: d.name,
        breed: d.breed || 'Mixed',
        age: d.age || 'Unknown',
        tagColor: (d.badges && d.badges[0]) || 'blue',
        status: d.status === 'treatment' ? 'treatment' : (d.status === 'adoption' ? 'adoption' : (d.status === 'adopted' ? 'adopted' : 'rescue')),
         healthStatus: d.healthStatus || d.health || 'good',
        vaccinations: [],
        photo: d.photo || null
      }));
      setDogs(mappedDogs);

      const activeRescueCount = mappedEmergency.filter(r => r.status !== 'rescued' && r.status !== 'cancelled').length;
      const emergencyCount = mappedEmergency.filter(r => r.urgency === 'high').length;
      const adoptedDogsCount = mappedDogs.filter(d => d.status === 'adopted').length;
      const dogsInShelterCount = mappedDogs.filter(d => d.status === 'adoption' || d.status === 'treatment').length;

      setStats({
        totalDogs: overview.totalDogs || mappedDogs.length,
        adoptedDogs: adoptionStats.approved || adoptedDogsCount,
        dogsInShelter: dogsInShelterCount,
        totalVolunteers: overview.totalVolunteers || 0,
        activeRescues: activeRescueCount,
        pendingAdoptions: adoptionStats.pending || 0,
        upcomingEvents: overview.upcomingEvents || (eventsRes.data?.data?.pagination?.total || 0),
        newMessages: 0,
        totalDonations: 0,
        emergencyAlerts: emergencyCount
      });

      const mappedUsers = (usersRes.data?.data?.users || []).map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role === 'user' ? 'adopter' : u.role,
        status: u.isActive ? 'active' : 'suspended',
        joinDate: u.createdAt ? u.createdAt.split('T')[0] : ''
      }));
      setUsers(mappedUsers);

      // Fetch volunteers data
      try {
        const volunteersRes = await axios.get('/admin/volunteers');
        setVolunteersData(volunteersRes.data.data || []);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
        // Fallback to mapped volunteers from users
        const mappedVolunteers = mappedUsers.filter(u => u.role === 'volunteer').map(v => ({ 
          ...v, 
          tasks: 0, 
          completed: 0,
          assignedDogs: []
        }));
        setVolunteersData(mappedVolunteers);
      }

      const mappedAdoptions = (adoptionsRes.data || []).map(a => ({
        id: a._id,
        dogName: a.dog?.name || 'Unknown',
        userName: a.fullName,
        date: a.createdAt ? a.createdAt.split('T')[0] : '',
        status: a.requestStatus
      }));
      setAdoptionRequests(mappedAdoptions);

      const mappedEvents = (eventsRes.data?.data?.events || []).map(e => ({
        id: e._id,
        title: e.title,
        date: e.date ? e.date.split('T')[0] : '',
        location: e.location,
        attendees: e.registeredVolunteers ? e.registeredVolunteers.length : 0,
        status: e.status || 'upcoming',
        photo: (e.photos && e.photos[0]) || null
      }));
      setEvents(mappedEvents);

      const activities = [];
      mappedAdoptions.slice(0, 3).forEach((r, i) => activities.push({ id: `adopt-${i}`, type: 'adoption', message: `Adoption ${r.status} for ${r.dogName}`, time: r.date, user: r.userName }));
      mappedEmergency.slice(0, 3).forEach((r, i) => activities.push({ id: `rescue-${i}`, type: 'rescue', message: `Emergency ${r.status} in ${r.location}`, time: r.date, user: r.reportedBy }));
      setRecentActivities(activities);

      const pending = [];
      if ((adoptionStats.pending || 0) > 0) pending.push({ id: 1, type: 'adoption', title: 'Adoption Request Approval', description: `${adoptionStats.pending} requests pending review`, priority: 'high' });
      if (activeRescueCount > 0) pending.push({ id: 2, type: 'rescue', title: 'Rescue Assignment', description: `${activeRescueCount} active emergencies`, priority: 'medium' });
      setPendingActions(pending);

      const alerts = mappedEmergency.filter(r => r.urgency === 'high').map((r, i) => ({ id: r.id || i, type: 'injured', location: r.location, reportedBy: r.reportedBy, time: r.date, status: r.assignedTo ? 'assigned' : 'new' }));
      setEmergencyAlerts(alerts);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  // Volunteer Management Functions
  // Update fetchVolunteersData function
const fetchVolunteersData = async () => {
  try {
    const response = await axios.get('/admin/volunteers');
    if (response.data && response.data.data) {
      setVolunteersData(response.data.data);
    } else {
      setVolunteersData([]);
    }
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    // Fallback: try to get volunteers from users
    try {
      const usersResponse = await axios.get('/admin/users', { 
        params: { limit: 100, role: 'volunteer' } 
      });
      
      const users = usersResponse.data?.data?.users || [];
      const volunteerUsers = users.map(user => ({
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || 'Not provided',
        role: user.role,
        status: user.status || (user.isActive ? 'active' : 'inactive'),
        assignedDogs: [],
        assignedTasks: [],
        completedTasks: 0,
        joinDate: user.createdAt ? user.createdAt.split('T')[0] : ''
      }));

      setVolunteersData(volunteerUsers);
    } catch (usersError) {
      console.error('Both volunteer endpoints failed:', usersError);
      setVolunteersData([]);
    }
  }
  };

  const fetchAvailableDogs = async () => {
    try {
      let res;
      try {
        res = await axios.get('/admin/volunteers/available/dogs');
      } catch (error) {
        // Fallback to regular dogs endpoint
        res = await axios.get('/dogs');
      }
      
      const dogs = res.data?.data || res.data || [];

      // Transform dogs for selection - only show dogs that are in shelter
      const transformedDogs = dogs
        .filter(dog => dog.status === 'treatment' || dog.status === 'adoption')
        .map(dog => ({
          _id: dog._id,
          id: dog._id,
          name: dog.name,
          breed: dog.breed || 'Mixed',
          age: dog.age || 'Unknown',
          healthStatus: dog.healthStatus || 'good',
          status: dog.status,
          photo: dog.photo
        }));

      setAvailableDogs(transformedDogs);
    } catch (error) {
      console.error('Error fetching available dogs:', error);
      // Fallback to shelter dogs from local state
      const shelterDogs = dogs.filter(d => 
        d.status === 'treatment' || d.status === 'adoption'
      );
      setAvailableDogs(shelterDogs);
    }
  };

  const handleAssignDogs = async (volunteerId) => {
    try {
      if (selectedDogs.length === 0) {
        alert('Please select at least one dog to assign');
        return;
      }

      console.log('Assigning dogs to volunteer:', volunteerId);
      console.log('Selected dogs:', selectedDogs);
      console.log('Available dogs:', availableDogs);

      // Prepare dog assignment data
      const assignmentData = {
        dogIds: selectedDogs,
        assignmentDate: new Date().toISOString()
      };

      // Try API call
      let apiSuccess = false;
      try {
        await axios.post(`/admin/volunteers/${volunteerId}/assign-dogs`, assignmentData);
        apiSuccess = true;
        console.log('API dog assignment successful');
      } catch (apiError) {
        console.log('API call failed, using local state only:', apiError);
      }

      // Update local state
      const updatedVolunteers = volunteersData.map(volunteer => {
        if (volunteer._id === volunteerId || volunteer.id === volunteerId) {
          const assignedDogObjects = availableDogs
            .filter(dog => selectedDogs.includes(dog._id || dog.id))
            .map(dog => ({
              dogId: {
                _id: dog._id || dog.id,
                name: dog.name,
                breed: dog.breed,
                photo: dog.photo,
                // Add fields needed for volunteer dashboard
                healthStatus: dog.healthStatus,
                status: dog.status
              },
              assignmentDate: new Date().toISOString()
            }));
          
          // Merge with existing assigned dogs, avoiding duplicates
          const existingDogIds = new Set((volunteer.assignedDogs || []).map(ad => 
            ad.dogId?._id || ad.dogId
          ));
          
          const newDogs = assignedDogObjects.filter(ad => 
            !existingDogIds.has(ad.dogId._id || ad.dogId)
          );

          return {
            ...volunteer,
            assignedDogs: [...(volunteer.assignedDogs || []), ...newDogs]
          };
        }
        return volunteer;
      });

      setVolunteersData(updatedVolunteers);
      setShowAssignDogsModal(false);
      setSelectedDogs([]);
      
      alert(`Dogs assigned successfully! ${apiSuccess ? '' : '(Local update)'}`);
      
    } catch (error) {
      console.error('Error assigning dogs:', error);
      alert('Failed to assign dogs. Please try again.');
    }
  };

  const handleAssignTask = async (taskData) => {
    if (!selectedVolunteer) {
      alert('No volunteer selected');
      return;
    }

    // Validate task data
    const errors = validateTaskForm(taskData);
    if (hasFormErrors(errors)) {
      setFormErrors(errors);
      alert('Please fix the validation errors before assigning the task.');
      return;
    }

    try {
      // Create complete task data with proper volunteer reference
      const completeTaskData = {
        dogId: taskData.dogId || (selectedVolunteer.assignedDogs?.[0]?.dogId?._id || selectedVolunteer.assignedDogs?.[0]?.dogId),
        taskType: taskData.taskType,
        taskDescription: taskData.taskDescription,
        scheduledTime: taskData.scheduledTime,
        priority: taskData.priority,
        estimatedDuration: parseInt(taskData.estimatedDuration) || 30,
        status: 'assigned',
        volunteerId: selectedVolunteer._id || selectedVolunteer.id,
        volunteerName: selectedVolunteer.name
      };

      console.log('Assigning task with data:', completeTaskData);

      // Try API call first
      let apiSuccess = false;
      try {
        const response = await axios.post(
          `/admin/volunteers/${selectedVolunteer._id || selectedVolunteer.id}/tasks`,
          completeTaskData
        );
        console.log('API task assignment successful:', response.data);
        apiSuccess = true;
      } catch (apiError) {
        console.log('API call failed, using local state only:', apiError);
      }

      // Update local state regardless of API success
      const updatedVolunteers = volunteersData.map(volunteer => {
        const isTargetVolunteer = 
          (volunteer._id && selectedVolunteer._id && volunteer._id === selectedVolunteer._id) ||
          (volunteer.id && selectedVolunteer.id && volunteer.id === selectedVolunteer.id);
        
        if (isTargetVolunteer) {
          const newTask = {
            _id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...completeTaskData,
            assignedDate: new Date().toISOString(),
            // Ensure these fields are properly set for volunteer dashboard
            volunteerId: selectedVolunteer._id || selectedVolunteer.id,
            volunteerName: selectedVolunteer.name,
            dog: selectedVolunteer.assignedDogs?.find(d => 
              d.dogId?._id === completeTaskData.dogId || d.dogId === completeTaskData.dogId
            )?.dogId || null
          };

          return {
            ...volunteer,
            assignedTasks: [...(volunteer.assignedTasks || []), newTask]
          };
        }
        return volunteer;
      });

      setVolunteersData(updatedVolunteers);
      setShowAssignTaskModal(false);
      setSelectedVolunteer(null);
      setFormErrors({});
      
      alert(`Task assigned successfully to ${selectedVolunteer.name}! ${apiSuccess ? '' : '(Local update)'}`);
      
    } catch (error) {
      console.error('Error assigning task:', error);
      alert(`Failed to assign task: ${error.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  // View and Edit Handlers
  const handleViewDetails = (item, type) => {
    setSelectedItem(item);
    setEditingType(type);
    setShowViewModal(true);
  };

  // Update the handleEdit function for volunteers
  const handleEdit = (item, type) => {
    if (type === 'user') {
      setNewUser({
        name: item.name,
        email: item.email,
        role: item.role,
        status: item.status
      });
      setEditingItem(item);
      setEditingType(type);
      setShowAddUserModal(true);
    } else if (type === 'dog') {
      setNewDog({
        name: item.name,
        breed: item.breed,
        age: item.age,
        color: item.color || '',
        tagColor: item.tagColor || 'blue',
        status: item.status,
        healthStatus: item.healthStatus,
        photo: null // Reset photo for edit
      });
      setEditingItem(item);
      setEditingType(type);
      setShowAddDogModal(true);
    } else if (type === 'event') {
      setEditingEvent({
        ...item,
        newPhoto: null // Add newPhoto field for potential new file
      });
      setEditingType(type);
      setShowEditEventModal(true);
    } else if (type === 'adoption') {
      // Set up adoption request for editing
      setEditingItem({...item});
      setEditingType(type);
      setShowEditModal(true);
    } else if (type === 'volunteer') {
      // Set up volunteer for editing
      setEditingItem({...item});
      setEditingType(type);
      setShowEditModal(true);
    } else {
      setEditingItem({...item});
      setEditingType(type);
      setShowEditModal(true);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsSubmitting(true);
      
      if (editingType === 'user') {
        // Validate user data
        const errors = validateUserForm(editingItem);
        if (hasFormErrors(errors)) {
          setFormErrors(errors);
          setIsSubmitting(false);
          return;
        }

        // Update user - match your backend API
        await axios.put(`/admin/users/${editingItem.id}`, {
          name: editingItem.name,
          email: editingItem.email,
          role: editingItem.role === 'adopter' ? 'user' : editingItem.role,
          isActive: editingItem.status === 'active'
        });
        setUsers(prev => prev.map(u => u.id === editingItem.id ? editingItem : u));
      } else if (editingType === 'event') {
        // Validate event data
        const errors = validateEventForm(editingItem);
        if (hasFormErrors(errors)) {
          setFormErrors(errors);
          setIsSubmitting(false);
          return;
        }

        // Update event - use the correct endpoint structure
        await axios.put(`/admin/events/${editingItem.id}`, {
          title: editingItem.title,
          date: editingItem.date,
          location: editingItem.location,
          attendees: editingItem.attendees,
          status: editingItem.status
        });
        setEvents(prev => prev.map(e => e.id === editingItem.id ? editingItem : e));
      } else if (editingType === 'rescue') {
        // Validate rescue data
        const errors = validateRescueForm(editingItem);
        if (hasFormErrors(errors)) {
          setFormErrors(errors);
          setIsSubmitting(false);
          return;
        }

        // Update rescue report - use status endpoint
        await axios.put(`/emergency-reports/${editingItem.id}/status`, {
          status: editingItem.status,
          urgency: editingItem.urgency
        });
        setRescueReports(prev => prev.map(r => r.id === editingItem.id ? editingItem : r));
      } else if (editingType === 'dog') {
        // Validate dog data
        const errors = validateDogForm(editingItem);
        if (hasFormErrors(errors)) {
          setFormErrors(errors);
          setIsSubmitting(false);
          return;
        }

        // Update dog - CORRECTED: Use FormData for potential photo upload
        const formData = new FormData();
        formData.append('name', editingItem.name);
        formData.append('breed', editingItem.breed);
        formData.append('age', editingItem.age);
        formData.append('status', editingItem.status);
        formData.append('healthStatus', editingItem.healthStatus);
        formData.append('badges', JSON.stringify([editingItem.tagColor]));
        
        // If there's a new photo file, append it
        if (editingItem.newPhoto instanceof File) {
          formData.append('photo', editingItem.newPhoto);
        }

        const res = await axios.put(`/dogs/${editingItem.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        const updatedDog = res.data?.data || res.data;
        const mapped = {
          ...editingItem,
          name: updatedDog.name || editingItem.name,
          breed: updatedDog.breed || editingItem.breed,
          age: updatedDog.age || editingItem.age,
          status: updatedDog.status || editingItem.status,
          healthStatus: updatedDog.healthStatus || editingItem.healthStatus,
          tagColor: (updatedDog.badges && updatedDog.badges[0]) || editingItem.tagColor,
          photo: updatedDog.photo || editingItem.photo
        };

        setDogs(prev => prev.map(d => d.id === editingItem.id ? mapped : d));
      } else if (editingType === 'adoption') {
        // Update adoption request - FIXED BACKEND CALL
        const updateData = {
          requestStatus: editingItem.status,
          fullName: editingItem.userName,
          // Include the dog ID if available
          dog: editingItem.dogId || editingItem.dog?._id,
          // Include other fields that might be needed
          email: editingItem.email,
          phone: editingItem.phone,
          address: editingItem.address
        };

        console.log('Updating adoption request with data:', updateData);

        // Use the correct endpoint for updating adoption requests
        const response = await axios.put(`/adoption-requests/${editingItem.id}`, updateData);
        
        const updatedRequest = response.data;
        
        // Update local state with the response data
        const mapped = {
          ...editingItem,
          status: updatedRequest.requestStatus,
          userName: updatedRequest.fullName,
          dogName: updatedRequest.dog?.name || editingItem.dogName,
          date: updatedRequest.createdAt ? updatedRequest.createdAt.split('T')[0] : editingItem.date
        };

        setAdoptionRequests(prev => prev.map(a => a.id === editingItem.id ? mapped : a));
        
        alert('Adoption request updated successfully!');
        
      } else if (editingType === 'volunteer') {
        // Validate volunteer data
        const errors = {};
        errors.name = validateRequired(editingItem.name, 'Name');
        errors.email = validateRequired(editingItem.email, 'Email');
        
        if (!errors.email && !validateEmail(editingItem.email)) {
          errors.email = 'Please enter a valid email address';
        }

        if (hasFormErrors(errors)) {
          setFormErrors(errors);
          setIsSubmitting(false);
          return;
        }

        // Update volunteer with backend connection
       const updateData = {
        name: editingItem.name,
        email: editingItem.email,
        phone: editingItem.phone,
        status: editingItem.status,
        completedTasks: parseInt(editingItem.completedTasks) || 0,
        // Optional: include current assigned ids to prevent accidental overwrite
        assignedDogIds: (editingItem.assignedDogs || []).map(d => d.dogId?._id || d.dogId).filter(Boolean),
        assignedTaskIds: (editingItem.assignedTasks || []).map(t => t.taskId?._id || t.taskId || t._id).filter(Boolean)
      };

      console.log('Updating volunteer with data:', updateData);

      // Use the correct endpoint for updating volunteers
      const response = await axios.put(`/admin/volunteers/${editingItem._id || editingItem.id}`, updateData);
      
      const updatedVolunteer = response.data?.data?.volunteer || response.data;
      
      // Update local state with the response data
      const mapped = {
        ...editingItem,
        name: updatedVolunteer.name || editingItem.name,
        email: updatedVolunteer.email || editingItem.email,
        phone: updatedVolunteer.phone || editingItem.phone,
        status: updatedVolunteer.status || editingItem.status,
        assignedDogs: updatedVolunteer.assignedDogs || editingItem.assignedDogs,
        assignedTasks: updatedVolunteer.assignedTasks || editingItem.assignedTasks,
        completedTasks: updatedVolunteer.completedTasks || editingItem.completedTasks
      };

      setVolunteersData(prev => prev.map(v => 
        (v._id === editingItem._id || v.id === editingItem.id) ? mapped : v
      ));
      
      alert('Volunteer updated successfully!');
    }
    
    setShowEditModal(false);
    setEditingItem(null);
    setEditingType('');
    setFormErrors({});
    
    // Refresh data to ensure consistency
    fetchDashboardData();
    
  } catch (error) {
    console.error('Update failed:', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to update item';
    
    alert(`Update failed: ${errorMessage}`);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleUpdateRescueStatus = async (id, newStatus) => {
    try {
      await axios.put(`/emergency-reports/${id}/status`, { 
        status: newStatus 
      });
      
      // Update local state
      setRescueReports(prev => prev.map(report => 
        report.id === id ? { ...report, status: newStatus } : report
      ));
      
      // Show success message
      alert(`Rescue report status updated to ${newStatus}`);
      
      // Refresh dashboard data
      fetchDashboardData();
      
    } catch (error) {
      console.error('Update rescue status failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update status';
      alert(`Update failed: ${errorMessage}`);
    }
  };

  const handleApprove = async (id, type) => {
    if (type !== 'adoption') return;
    try {
      const res = await axios.post(`/adoption-requests/${id}/approve`, { note: '' });
      const updated = res.data;
      setAdoptionRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      setStats(prev => ({
        ...prev,
        pendingAdoptions: Math.max(0, (prev.pendingAdoptions || 0) - 1),
        adoptedDogs: (prev.adoptedDogs || 0) + 1
      }));
      fetchDashboardData();
    } catch (e) {
      console.error('Approve adoption failed', e);
      const msg = e.response?.data?.message || e.response?.data?.error || e.message;
      alert(`Approve failed: ${msg}`);
    }
  };

  const handleReject = async (id, type) => {
    if (type !== 'adoption') return;
    try {
      const res = await axios.post(`/adoption-requests/${id}/reject`, { note: '' });
      const updated = res.data;
      setAdoptionRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      setStats(prev => ({
        ...prev,
        pendingAdoptions: Math.max(0, (prev.pendingAdoptions || 0) - 1)
      }));
      fetchDashboardData();
    } catch (e) {
      console.error('Reject adoption failed', e);
      const msg = e.response?.data?.message || e.response?.data?.error || e.message;
      alert(`Reject failed: ${msg}`);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'user') {
        await axios.delete(`/admin/users/${id}`);
        setUsers(prev => prev.filter(user => user.id !== id));
        setVolunteersData(prev => prev.filter(v => v.id !== id));
      } else if (type === 'event') {
        await axios.delete(`/admin/events/${id}`);
        setEvents(prev => prev.filter(event => event.id !== id));
      } else if (type === 'rescue') {
        await axios.delete(`/emergency-reports/${id}`);
        setRescueReports(prev => prev.filter(report => report.id !== id));
      } else if (type === 'dog') {
        await axios.delete(`/dogs/${id}`);
        setDogs(prev => prev.filter(dog => dog.id !== id));
      } else if (type === 'alert') {
        setEmergencyAlerts(prev => prev.filter(alert => alert.id !== id));
      } else if (type === 'adoption') {
        await axios.delete(`/adoption-requests/${id}`);
        setAdoptionRequests(prev => prev.filter(req => req.id !== id));
      } else if (type === 'volunteer') {
        await axios.delete(`/admin/volunteers/${id}`);
        setVolunteersData(prev => prev.filter(vol => vol.id !== id));
        setUsers(prev => prev.filter(user => user.id !== id));
      }
    } catch (e) {
      console.error('Delete failed', e);
      const msg = e.response?.data?.message || e.response?.data?.error || e.message;
      alert(`Delete failed: ${msg}`);
    }
  };

  const handleAssignEmergency = async (id) => {
    try {
      await axios.put(`/emergency-reports/${id}/status`, { 
        status: 'assigned' 
      });
      
      setRescueReports(prev => prev.map(r => 
        r.id === id ? { ...r, status: 'assigned' } : r
      ));
      
      alert('Rescue report assigned successfully!');
      
    } catch (error) {
      console.error('Assign emergency failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign report';
      alert(`Assignment failed: ${errorMessage}`);
    }
  };

  const handleMarkAdoptionReady = async (id) => {
    try {
      await axios.put(`/dogs/${id}`, { status: 'adoption' });
      setDogs(prev => prev.map(d => d.id === id ? { ...d, status: 'adoption' } : d));
    } catch (e) {
      console.error('Update dog failed', e);
    }
  };

  const handleGenerateCertificate = (id) => {
    navigate(`/adoption-certificate/${id}`);
  };

  const handleAddUser = async () => {
  try {
    // Validate form
    const errors = validateUserForm(newUser);
    setFormErrors(errors);
    
    if (hasFormErrors(errors)) {
      alert('Please fix the validation errors before submitting.');
      return;
    }

    setIsSubmitting(true);

    if (editingItem && editingType === 'user') {
      // Update existing user - CORRECTED BACKEND CALL
      const payload = { 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role === 'adopter' ? 'user' : newUser.role, 
        isActive: newUser.status === 'active' 
      };
      
      console.log('Updating user with data:', payload);
      
      const res = await axios.put(`/admin/users/${editingItem.id}`, payload);
      
      // Handle response based on your backend structure
      const updatedUser = res.data?.data?.user || res.data;
      
      const mapped = {
        id: updatedUser._id || editingItem.id,
        name: updatedUser.name || newUser.name,
        email: updatedUser.email || newUser.email,
        role: updatedUser.role === 'user' ? 'adopter' : updatedUser.role,
        status: updatedUser.isActive ? 'active' : 'suspended',
        joinDate: updatedUser.createdAt ? updatedUser.createdAt.split('T')[0] : editingItem.joinDate
      };
      
      setUsers(prev => prev.map(user => user.id === editingItem.id ? mapped : user));
      setShowAddUserModal(false);
      setNewUser({ name: "", email: "", role: "adopter", status: "active" });
      setEditingItem(null);
      setEditingType('');
      setFormErrors({});
      alert('User updated successfully!');
      
    } else {
      // Add new user - CORRECTED BACKEND CALL
      const payload = { 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role === 'adopter' ? 'user' : newUser.role, 
        isActive: newUser.status === 'active' 
      };
      
      console.log('Creating user with data:', payload);
      
      const res = await axios.post('/admin/users', payload);
      
      // Handle response based on your backend structure
      const newUserData = res.data?.data?.user || res.data;
      
      const mapped = {
        id: newUserData._id,
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role === 'user' ? 'adopter' : newUserData.role,
        status: newUserData.isActive ? 'active' : 'suspended',
        joinDate: newUserData.createdAt ? newUserData.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
      };
      
      setUsers(prev => [mapped, ...prev]);
      setShowAddUserModal(false);
      setNewUser({ name: "", email: "", role: "adopter", status: "active" });
      setFormErrors({});
      alert('User added successfully!');
    }
  } catch (error) {
    console.error('Add/Update user failed', error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'Failed to save user';
    alert(`Operation failed: ${errorMessage}`);
  } finally {
    setIsSubmitting(false);
  }
};

  const navigateToEmergencyDashboard = () => {
    navigate('/emergency-dashboard');
  };

  const navigateToRescueDashboard = () => {
    navigate('/rescue-dashboard');
  };

  const handleAddEvent = async () => {
    try {
      // Validate form
      const errors = validateEventForm(newEvent);
      setFormErrors(errors);
      
      if (hasFormErrors(errors)) {
        alert('Please fix the validation errors before submitting.');
        return;
      }

      setIsSubmitting(true);

      let res;
      if (newEvent.photo) {
        const form = new FormData();
        form.append('title', newEvent.title);
        form.append('date', newEvent.date);
        form.append('location', newEvent.location);
        form.append('description', 'N/A');
        form.append('eventType', 'other');
        form.append('startTime', '09:00');
        form.append('endTime', '17:00');
        form.append('maxVolunteers', '10');
        form.append('requirements', '');
        form.append('photo', newEvent.photo);
        res = await axios.post('/admin/events', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        const payload = { 
          title: newEvent.title, 
          date: newEvent.date, 
          location: newEvent.location,
          description: 'N/A',
          eventType: 'other',
          startTime: '09:00',
          endTime: '17:00',
          maxVolunteers: 10,
          requirements: ''
        };
        res = await axios.post('/admin/events', payload);
      }
      const e = res.data?.data?.event || res.data?.data;
      const cover = (e.photos && e.photos[0]) || null;
      const mapped = { id: e._id, title: e.title, date: e.date ? e.date.split('T')[0] : newEvent.date, location: e.location, attendees: e.registeredVolunteers?.length || 0, status: e.status || 'upcoming', photo: cover };
      setEvents(prev => [mapped, ...prev]);
      setShowAddEventModal(false);
      setNewEvent({ title: "", date: "", location: "", attendees: 0, photo: null });
      setFormErrors({});
    } catch (e) {
      console.error('Add event failed', e);
      const msg = e.response?.data?.message || e.message || 'Failed to add event';
      alert(`Add event failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Event Handler
  const handleUpdateEvent = async () => {
    try {
      if (!editingEvent) return;

      // Validate form
      const errors = validateEventForm(editingEvent);
      setFormErrors(errors);
      
      if (hasFormErrors(errors)) {
        alert('Please fix the validation errors before submitting.');
        return;
      }

      setIsSubmitting(true);

      let res;
       if (editingEvent.newPhoto instanceof File) {
        // Handle file upload for update
      const form = new FormData();
      form.append('title', editingEvent.title);
      form.append('date', editingEvent.date);
      form.append('location', editingEvent.location);
      form.append('attendees', editingEvent.attendees);
      form.append('status', editingEvent.status);
      form.append('photo', editingEvent.newPhoto); // Use newPhoto for file upload
      
      res = await axios.put(`/admin/events/${editingEvent.id}`, form, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      } else {
        // Regular update without file change
      const payload = { 
        title: editingEvent.title, 
        date: editingEvent.date, 
        location: editingEvent.location,
        attendees: editingEvent.attendees,
        status: editingEvent.status
      };
      res = await axios.put(`/admin/events/${editingEvent.id}`, payload);
    }

      // Update local state with the response data
    const updatedEvent = res.data?.data?.event || res.data?.data;
    if (updatedEvent) {
      const mappedEvent = {
        id: updatedEvent._id || editingEvent.id,
        title: updatedEvent.title,
        date: updatedEvent.date ? updatedEvent.date.split('T')[0] : editingEvent.date,
        location: updatedEvent.location,
        attendees: updatedEvent.registeredVolunteers?.length || updatedEvent.attendees || editingEvent.attendees,
        status: updatedEvent.status || editingEvent.status,
        photo: (updatedEvent.photos && updatedEvent.photos[0]) || editingEvent.photo
      };
      
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? mappedEvent : e));
    } else {
      // Fallback: update with local data
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? {
        ...editingEvent,
        photo: editingEvent.newPhoto ? URL.createObjectURL(editingEvent.newPhoto) : editingEvent.photo
      } : e));
    }

    setShowEditEventModal(false);
    setEditingEvent(null);
    setFormErrors({});
    
    alert('Event updated successfully!');
    fetchDashboardData(); // Refresh data
    
  } catch (error) {
    console.error('Update event failed:', error);
    const msg = error.response?.data?.message || error.message || 'Failed to update event';
    alert(`Update event failed: ${msg}`);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleAddRescue = async () => {
    try {
      // Validate form
      const errors = validateRescueForm(newRescue);
      setFormErrors(errors);
      
      if (hasFormErrors(errors)) {
        alert('Please fix the validation errors before submitting.');
        return;
      }

      setIsSubmitting(true);

      const payload = { description: 'Admin created rescue', location: newRescue.location, urgency: newRescue.urgency, reporterName: newRescue.reportedBy || 'Admin', reporterPhone: 'Not provided' };
      const res = await axios.post('/rescue-requests', payload);
      const r = res.data?.data;
      const mapped = { id: r._id, location: r.location?.address || newRescue.location, reportedBy: r.reporter?.name || newRescue.reportedBy, date: r.createdAt ? r.createdAt.split('T')[0] : new Date().toISOString().split('T')[0], status: 'pending', urgency: (newRescue.urgency || 'medium'), assignedTo: '' };
      setRescueReports(prev => [mapped, ...prev]);
      setShowAddRescueModal(false);
      setNewRescue({ location: "", reportedBy: "", status: "pending", urgency: "medium" });
      setFormErrors({});
    } catch (e) {
      console.error('Add rescue failed', e);
      alert('Failed to add rescue report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CORRECTED: Dog Management Functions
  const handleAddDog = async () => {
    try {
      // Validate form
      const errors = validateDogForm(newDog);
      setFormErrors(errors);
      
      if (hasFormErrors(errors)) {
        alert('Please fix the validation errors before submitting.');
        return;
      }

      setIsSubmitting(true);

      if (editingItem && editingType === 'dog') {
        // Update existing dog - CORRECTED: Use FormData for photo upload
        const formData = new FormData();
        formData.append('name', newDog.name);
        formData.append('breed', newDog.breed);
        formData.append('age', newDog.age);
        formData.append('status', newDog.status);
        formData.append('healthStatus', newDog.healthStatus);
        formData.append('badges', JSON.stringify([newDog.tagColor]));
        
        // Append photo if a new one is selected
        if (newDog.photo instanceof File) {
          formData.append('photo', newDog.photo);
        }

        const res = await axios.put(`/dogs/${editingItem.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        const updatedDog = res.data?.data || res.data;
        
        // Update local state with the response data
        const mapped = {
          id: updatedDog._id || editingItem.id,
          uniqueCode: updatedDog.id || updatedDog._id || editingItem.uniqueCode,
          name: updatedDog.name || newDog.name,
          breed: updatedDog.breed || newDog.breed,
          age: updatedDog.age || newDog.age,
          tagColor: (updatedDog.badges && updatedDog.badges[0]) || newDog.tagColor,
          status: updatedDog.status || newDog.status,
          healthStatus: updatedDog.healthStatus || newDog.healthStatus,
          photo: updatedDog.photo || editingItem.photo // Keep old photo if no new one
        };
        
        setDogs(prev => prev.map(dog => dog.id === editingItem.id ? mapped : dog));
        setShowAddDogModal(false);
        setNewDog({ name: "", breed: "", age: "", color: "", tagColor: "blue", status: "rescue", healthStatus: "good", photo: null });
        setEditingItem(null);
        setEditingType('');
        setFormErrors({});
        alert('Dog updated successfully!');
        
      } else {
        // Add new dog
        const uniqueCode = `DOG-${Math.floor(1000 + Math.random() * 9000)}`;
        const status = newDog.status === 'treatment' ? 'treatment' : 
                      (newDog.status === 'adoption' ? 'adoption' : 
                      (newDog.status === 'adopted' ? 'adopted' : 'treatment'));

        if (newDog.photo) {
          // Use multipart form data for image upload
          const formData = new FormData();
          formData.append('id', uniqueCode);
          formData.append('name', newDog.name);
          formData.append('age', newDog.age);
          formData.append('breed', newDog.breed);
          formData.append('status', status);
          formData.append('healthStatus', newDog.healthStatus);
          formData.append('badges', JSON.stringify([newDog.tagColor]));
          formData.append('photo', newDog.photo);

          const res = await axios.post('/dogs/with-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          const newDogData = res.data?.data || res.data;
          const mapped = {
            id: newDogData._id,
            uniqueCode: newDogData.id || uniqueCode,
            name: newDogData.name,
            breed: newDogData.breed || 'Mixed',
            age: newDogData.age || 'Unknown',
            tagColor: (newDogData.badges && newDogData.badges[0]) || newDog.tagColor,
            status: newDogData.status,
            healthStatus: newDogData.healthStatus ? newDogData.healthStatus.toLowerCase() : 'good',
            photo: newDogData.photo || null
          };
          
          setDogs(prev => [mapped, ...prev]);
          
        } else {
          // No photo - use regular JSON endpoint
          const payload = {
            id: uniqueCode,
            name: newDog.name,
            age: newDog.age,
            breed: newDog.breed,
            status: status,
            healthStatus: newDog.healthStatus,
            badges: [newDog.tagColor]
          };
          
          const res = await axios.post('/dogs', payload);
          const newDogData = res.data?.data || res.data;
          const mapped = {
            id: newDogData._id,
            uniqueCode: newDogData.id || uniqueCode,
            name: newDogData.name,
            breed: newDogData.breed || 'Mixed',
            age: newDogData.age || 'Unknown',
            tagColor: (newDogData.badges && newDogData.badges[0]) || newDog.tagColor,
            status: newDogData.status,
            healthStatus: newDogData.healthStatus ? newDogData.healthStatus.toLowerCase() : 'good',
            photo: newDogData.photo || null
          };
          
          setDogs(prev => [mapped, ...prev]);
        }
        
        setShowAddDogModal(false);
        setNewDog({ name: "", breed: "", age: "", color: "", tagColor: "blue", status: "rescue", healthStatus: "good", photo: null });
        setFormErrors({});
        alert('Dog registered successfully!');
      }
    } catch (error) {
      console.error('Add/Update dog failed', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to save dog';
      alert(`Operation failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update the existing handleCompleteEmergency function to be more consistent
const handleCompleteEmergency = async (id) => {
  try {
    await axios.put(`/emergency-reports/${id}/status`, { 
      status: 'rescued' 
    });
    
    setRescueReports(prev => prev.map(report => 
      report.id === id ? { ...report, status: 'rescued' } : report
    ));
    
    alert('Rescue marked as completed!');
    fetchDashboardData();
    
  } catch (error) {
    console.error('Complete emergency failed:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to mark as completed';
    alert(`Operation failed: ${errorMessage}`);
  }
};

// Modal Render Functions
const renderAddUserModal = () => (
  <div className="admin-modal-overlay">
    <div className="admin-modal">
      <div className="admin-modal-header">
          <h3>{editingItem && editingType === 'user' ? 'Edit User' : 'Add New User'}</h3>
          <button onClick={() => {
            setShowAddUserModal(false);
            setEditingItem(null);
            setEditingType('');
            setNewUser({ name: "", email: "", role: "adopter", status: "active" });
            setFormErrors({});
          }}>×</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Name *</label>
            <input 
              type="text" 
              value={newUser.name}
              onChange={(e) => {
                setNewUser({...newUser, name: e.target.value});
                clearFieldError('name');
              }}
              placeholder="Enter user name"
              className={formErrors.name ? 'error' : ''}
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>
          <div className="admin-form-group">
            <label>Email *</label>
            <input 
              type="email" 
              value={newUser.email}
              onChange={(e) => {
                setNewUser({...newUser, email: e.target.value});
                clearFieldError('email');
              }}
              placeholder="Enter user email"
              className={formErrors.email ? 'error' : ''}
            />
            {formErrors.email && <span className="error-message">{formErrors.email}</span>}
          </div>
          <div className="admin-form-group">
            <label>Role</label>
            <select 
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            >
              <option value="adopter">Adopter</option>
              <option value="volunteer">Volunteer</option>
              <option value="vet">Veterinarian</option>
              <option value="driver">Rescue Driver</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Status</label>
            <select 
              value={newUser.status}
              onChange={(e) => setNewUser({...newUser, status: e.target.value})}
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => {
            setShowAddUserModal(false);
            setEditingItem(null);
            setEditingType('');
            setNewUser({ name: "", email: "", role: "adopter", status: "active" });
            setFormErrors({});
          }} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="admin-btn primary" onClick={handleAddUser} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (editingItem && editingType === 'user' ? 'Update User' : 'Add User')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAddEventModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>Add New Event</h3>
          <button onClick={() => {
            setShowAddEventModal(false);
            setFormErrors({});
          }}>×</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Event Title *</label>
            <input 
              type="text" 
              value={newEvent.title}
              onChange={(e) => {
                setNewEvent({...newEvent, title: e.target.value});
                clearFieldError('title');
              }}
              placeholder="Enter event title"
              className={formErrors.title ? 'error' : ''}
            />
            {formErrors.title && <span className="error-message">{formErrors.title}</span>}
          </div>
          <div className="admin-form-group">
            <label>Date *</label>
            <input 
              type="date" 
              value={newEvent.date}
              onChange={(e) => {
                setNewEvent({...newEvent, date: e.target.value});
                clearFieldError('date');
              }}
              className={formErrors.date ? 'error' : ''}
            />
            {formErrors.date && <span className="error-message">{formErrors.date}</span>}
          </div>
          <div className="admin-form-group">
            <label>Location *</label>
            <input 
              type="text" 
              value={newEvent.location}
              onChange={(e) => {
                setNewEvent({...newEvent, location: e.target.value});
                clearFieldError('location');
              }}
              placeholder="Enter event location"
              className={formErrors.location ? 'error' : ''}
            />
            {formErrors.location && <span className="error-message">{formErrors.location}</span>}
          </div>
          <div className="admin-form-group">
            <label>Expected Attendees</label>
            <input 
              type="number" 
              value={newEvent.attendees}
              onChange={(e) => {
                setNewEvent({...newEvent, attendees: parseInt(e.target.value) || 0});
                clearFieldError('attendees');
              }}
              placeholder="Enter number of attendees"
              className={formErrors.attendees ? 'error' : ''}
              min="0"
              max="1000"
            />
            {formErrors.attendees && <span className="error-message">{formErrors.attendees}</span>}
          </div>
          <div className="admin-form-group">
            <label>Event Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                setNewEvent({ ...newEvent, photo: file });
                if (file) {
                  const error = validateFile(file);
                  if (error) {
                    setFormErrors({...formErrors, photo: error});
                  } else {
                    clearFieldError('photo');
                  }
                }
              }}
              className={formErrors.photo ? 'error' : ''}
            />
            {formErrors.photo && <span className="error-message">{formErrors.photo}</span>}
            {newEvent.photo && (
              <div className="image-preview" style={{ marginTop: '10px' }}>
                <img
                  src={URL.createObjectURL(newEvent.photo)}
                  alt="Event preview"
                  style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => {
            setShowAddEventModal(false);
            setFormErrors({});
          }} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="admin-btn primary" onClick={handleAddEvent} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  );

  // Edit Event Modal - Reuses the same form structure
 const renderEditEventModal = () => (
  <div className="admin-modal-overlay">
    <div className="admin-modal">
      <div className="admin-modal-header">
        <h3>Edit Event</h3>
        <button onClick={() => {
          setShowEditEventModal(false);
          setFormErrors({});
        }}>×</button>
      </div>
      <div className="admin-modal-body">
        <div className="admin-form-group">
          <label>Event Title *</label>
          <input 
            type="text" 
            value={editingEvent?.title || ''}
            onChange={(e) => {
              setEditingEvent({...editingEvent, title: e.target.value});
              clearFieldError('title');
            }}
            placeholder="Enter event title"
            className={formErrors.title ? 'error' : ''}
            required
          />
          {formErrors.title && <span className="error-message">{formErrors.title}</span>}
        </div>
        <div className="admin-form-group">
          <label>Date *</label>
          <input 
            type="date" 
            value={editingEvent?.date || ''}
            onChange={(e) => {
              setEditingEvent({...editingEvent, date: e.target.value});
              clearFieldError('date');
            }}
            className={formErrors.date ? 'error' : ''}
            required
          />
          {formErrors.date && <span className="error-message">{formErrors.date}</span>}
        </div>
        <div className="admin-form-group">
          <label>Location *</label>
          <input 
            type="text" 
            value={editingEvent?.location || ''}
            onChange={(e) => {
              setEditingEvent({...editingEvent, location: e.target.value});
              clearFieldError('location');
            }}
            placeholder="Enter event location"
            className={formErrors.location ? 'error' : ''}
            required
          />
          {formErrors.location && <span className="error-message">{formErrors.location}</span>}
        </div>
        <div className="admin-form-group">
          <label>Expected Attendees</label>
          <input 
            type="number" 
            value={editingEvent?.attendees || 0}
            onChange={(e) => {
              setEditingEvent({...editingEvent, attendees: parseInt(e.target.value) || 0});
              clearFieldError('attendees');
            }}
            placeholder="Enter number of attendees"
            className={formErrors.attendees ? 'error' : ''}
            min="0"
            max="1000"
          />
          {formErrors.attendees && <span className="error-message">{formErrors.attendees}</span>}
        </div>
        <div className="admin-form-group">
          <label>Status</label>
          <select 
            value={editingEvent?.status || 'upcoming'}
            onChange={(e) => setEditingEvent({...editingEvent, status: e.target.value})}
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="admin-form-group">
          <label>Event Cover Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0];
              setEditingEvent({ 
                ...editingEvent, 
                newPhoto: file 
              });
              if (file) {
                const error = validateFile(file);
                if (error) {
                  setFormErrors({...formErrors, photo: error});
                } else {
                  clearFieldError('photo');
                }
              }
            }}
            className={formErrors.photo ? 'error' : ''}
          />
          {formErrors.photo && <span className="error-message">{formErrors.photo}</span>}
          <div className="image-preview-container" style={{ marginTop: '10px' }}>
            {editingEvent?.newPhoto ? (
              <div className="image-preview">
                <p>New Image Preview:</p>
                <img
                  src={URL.createObjectURL(editingEvent.newPhoto)}
                  alt="New event preview"
                  style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            ) : editingEvent?.photo ? (
              <div className="image-preview">
                <p>Current Image:</p>
                <img
                  src={editingEvent.photo.startsWith('http') ? editingEvent.photo : `http://localhost:3000${editingEvent.photo}`}
                  alt="Current event"
                  style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }}
                />
              </div>
            ) : (
              <p style={{ color: '#666', fontSize: '14px' }}>No image selected</p>
            )}
          </div>
          {editingEvent?.newPhoto && (
            <button 
              type="button"
              className="admin-btn secondary"
              onClick={() => setEditingEvent({ ...editingEvent, newPhoto: null })}
              style={{ marginTop: '5px', fontSize: '12px', padding: '5px 10px' }}
            >
              Remove New Image
            </button>
          )}
        </div>
      </div>
      <div className="admin-modal-footer">
        <button className="admin-btn" onClick={() => {
          setShowEditEventModal(false);
          setFormErrors({});
        }} disabled={isSubmitting}>
          Cancel
        </button>
        <button 
          className="admin-btn primary" 
          onClick={handleUpdateEvent}
          disabled={!editingEvent?.title || !editingEvent?.date || !editingEvent?.location || isSubmitting}
        >
          {isSubmitting ? 'Updating...' : 'Update Event'}
        </button>
      </div>
    </div>
  </div>
);

  const renderAddRescueModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>Add New Rescue Report</h3>
          <button onClick={() => {
            setShowAddRescueModal(false);
            setFormErrors({});
          }}>×</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Location *</label>
            <input 
              type="text" 
              value={newRescue.location}
              onChange={(e) => {
                setNewRescue({...newRescue, location: e.target.value});
                clearFieldError('location');
              }}
              placeholder="Enter rescue location"
              className={formErrors.location ? 'error' : ''}
            />
            {formErrors.location && <span className="error-message">{formErrors.location}</span>}
          </div>
          <div className="admin-form-group">
            <label>Reported By *</label>
            <input 
              type="text" 
              value={newRescue.reportedBy}
              onChange={(e) => {
                setNewRescue({...newRescue, reportedBy: e.target.value});
                clearFieldError('reportedBy');
              }}
              placeholder="Enter reporter name"
              className={formErrors.reportedBy ? 'error' : ''}
            />
            {formErrors.reportedBy && <span className="error-message">{formErrors.reportedBy}</span>}
          </div>
          <div className="admin-form-group">
            <label>Urgency</label>
            <select 
              value={newRescue.urgency}
              onChange={(e) => setNewRescue({...newRescue, urgency: e.target.value})}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Status</label>
            <select 
              value={newRescue.status}
              onChange={(e) => setNewRescue({...newRescue, status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => {
            setShowAddRescueModal(false);
            setFormErrors({});
          }} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="admin-btn primary" onClick={handleAddRescue} disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Rescue Report'}
          </button>
        </div>
      </div>
    </div>
  );

  // CORRECTED: Add/Edit Dog Modal with proper photo handling and validation
  const renderAddDogModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>{editingItem && editingType === 'dog' ? 'Edit Dog' : 'Register New Rescued Dog'}</h3>
          <button onClick={() => {
            setShowAddDogModal(false);
            setEditingItem(null);
            setEditingType('');
            setNewDog({ name: "", breed: "", age: "", color: "", tagColor: "blue", status: "rescue", healthStatus: "good", photo: null });
            setFormErrors({});
          }}>×</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Name *</label>
            <input 
              type="text" 
              value={newDog.name}
              onChange={(e) => {
                setNewDog({...newDog, name: e.target.value});
                clearFieldError('name');
              }}
              placeholder="Enter dog name"
              className={formErrors.name ? 'error' : ''}
              required
            />
            {formErrors.name && <span className="error-message">{formErrors.name}</span>}
          </div>
          <div className="admin-form-group">
            <label>Breed *</label>
            <input 
              type="text" 
              value={newDog.breed}
              onChange={(e) => {
                setNewDog({...newDog, breed: e.target.value});
                clearFieldError('breed');
              }}
              placeholder="Enter breed"
              className={formErrors.breed ? 'error' : ''}
              required
            />
            {formErrors.breed && <span className="error-message">{formErrors.breed}</span>}
          </div>
          <div className="admin-form-group">
            <label>Age *</label>
            <input 
              type="text" 
              value={newDog.age}
              onChange={(e) => {
                setNewDog({...newDog, age: e.target.value});
                clearFieldError('age');
              }}
              placeholder="Enter age (e.g., 2 years, 5 months)"
              className={formErrors.age ? 'error' : ''}
              required
            />
            {formErrors.age && <span className="error-message">{formErrors.age}</span>}
          </div>
          <div className="admin-form-group">
            <label>Tag Color</label>
            <select 
              value={newDog.tagColor}
              onChange={(e) => setNewDog({...newDog, tagColor: e.target.value})}
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
              <option value="purple">Purple</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Health Status</label>
            <select 
              value={newDog.healthStatus}
              onChange={(e) => setNewDog({...newDog, healthStatus: e.target.value})}
            >
              <option value="poor">Poor</option>
              <option value="fair">Fair</option>
              <option value="good">Good</option>
              <option value="excellent">Excellent</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Status</label>
            <select 
              value={newDog.status}
              onChange={(e) => setNewDog({...newDog, status: e.target.value})}
              >
              <option value="rescue">Rescue</option>
              <option value="treatment">Treatment</option>
              <option value="adoption">Adoption Ready</option>
              <option value="adopted">Adopted</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Dog Photo</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Validate file
                  const error = validateFile(file);
                  if (error) {
                    setFormErrors({...formErrors, photo: error});
                    e.target.value = '';
                    return;
                  }
                  setNewDog({...newDog, photo: file});
                  clearFieldError('photo');
                }
              }}
              className={formErrors.photo ? 'error' : ''}
            />
            {formErrors.photo && <span className="error-message">{formErrors.photo}</span>}
            <small>Supported formats: JPG, PNG, GIF, WEBP. Max size: 5MB</small>
            
            {/* Photo preview */}
            {newDog.photo && (
              <div className="image-preview" style={{ marginTop: '10px' }}>
                <p>New Photo Preview:</p>
                <img 
                  src={URL.createObjectURL(newDog.photo)} 
                  alt="Dog preview" 
                  style={{
                    width: '120px', 
                    height: '120px', 
                    objectFit: 'cover', 
                    marginTop: '5px', 
                    borderRadius: '8px',
                    border: '2px solid #ddd'
                  }}
                />
                <button 
                  type="button"
                  className="admin-btn secondary"
                  onClick={() => {
                    setNewDog({...newDog, photo: null});
                    clearFieldError('photo');
                  }}
                  style={{ marginTop: '5px', fontSize: '12px', padding: '5px 10px' }}
                >
                  Remove Photo
                </button>
              </div>
            )}
            
            {/* Show current photo when editing */}
            {editingItem && editingType === 'dog' && editingItem.photo && !newDog.photo && (
              <div className="image-preview" style={{ marginTop: '10px' }}>
                <p>Current Photo:</p>
                <img 
                  src={editingItem.photo.startsWith('http') ? 
                    editingItem.photo : 
                    `http://localhost:3000/uploads/dogs/${editingItem.photo}`} 
                  alt="Current dog" 
                  style={{
                    width: '120px', 
                    height: '120px', 
                    objectFit: 'cover', 
                    marginTop: '5px', 
                    borderRadius: '8px',
                    border: '2px solid #ddd'
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => {
            setShowAddDogModal(false);
            setEditingItem(null);
            setEditingType('');
            setNewDog({ name: "", breed: "", age: "", color: "", tagColor: "blue", status: "rescue", healthStatus: "good", photo: null });
            setFormErrors({});
          }} disabled={isSubmitting}>
            Cancel
          </button>
          <button 
            className="admin-btn primary" 
            onClick={handleAddDog}
            disabled={!newDog.name || !newDog.breed || !newDog.age || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (editingItem && editingType === 'dog' ? 'Update Dog' : 'Register Dog')}
          </button>
        </div>
      </div>
    </div>
  );

  // Volunteer Management Modals
  const renderAssignDogsModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal large">
        <div className="admin-modal-header">
          <h3>Assign Dogs to {selectedVolunteer?.name}</h3>
          <button onClick={() => setShowAssignDogsModal(false)}>×</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Select Dogs to Assign *</label>
            {availableDogs.length === 0 && (
              <div className="no-dogs-available">
                <p>No available dogs found for assignment.</p>
              </div>
            )}
            <div className="dogs-selection-grid">
              {availableDogs.map(dog => (
                <div key={dog._id || dog.id} className="dog-selection-card">
                  <input
                    type="checkbox"
                    id={`dog-${dog._id || dog.id}`}
                    checked={selectedDogs.includes(dog._id || dog.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDogs([...selectedDogs, dog._id || dog.id]);
                      } else {
                        setSelectedDogs(selectedDogs.filter(id => id !== (dog._id || dog.id)));
                      }
                    }}
                  />
                  <label htmlFor={`dog-${dog._id || dog.id}`} className="dog-selection-label">
                    <img 
                      src={dog.photo ? `http://localhost:3000/uploads/dogs/${dog.photo}` : 'https://placedog.net/300/300?id=1'} 
                      alt={dog.name}
                      style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}}
                    />
                    <div className="dog-info">
                      <h4>{dog.name}</h4>
                      <p>{dog.breed} • {dog.age}</p>
                      <span className={`status-badge ${dog.healthStatus}`}>
                        {dog.healthStatus}
                      </span>
                      <span className={`status-badge ${dog.status}`}>
                        {dog.status}
                      </span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => setShowAssignDogsModal(false)}>
            Cancel
          </button>
          <button 
            className="admin-btn primary" 
            onClick={() => handleAssignDogs(selectedVolunteer._id || selectedVolunteer.id)}
            disabled={selectedDogs.length === 0}
          >
            Assign Selected Dogs ({selectedDogs.length})
          </button>
        </div>
      </div>
    </div>
  );

  const renderAssignTaskModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>Assign Task to {selectedVolunteer?.name}</h3>
          <button onClick={() => {
            setShowAssignTaskModal(false);
            setFormErrors({});
          }}>×</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-group">
            <label>Selected Volunteer</label>
            <div className="selected-volunteer-info">
              <strong>{selectedVolunteer?.name}</strong> ({selectedVolunteer?.email})
            </div>
          </div>
          <div className="admin-form-group">
            <label>Select Dog (Optional)</label>
            <select id="taskDogId">
              <option value="">No specific dog</option>
              {selectedVolunteer?.assignedDogs?.map(dog => (
                <option key={dog.dogId?._id || dog.dogId} value={dog.dogId?._id || dog.dogId}>
                  {dog.dogId?.name || 'Unknown Dog'}
                </option>
              ))}
            </select>
          </div>
          <div className="admin-form-group">
            <label>Task Type *</label>
            <select id="taskType" required>
              <option value="">Select task type</option>
              <option value="feeding">Feeding</option>
              <option value="walking">Walking</option>
              <option value="grooming">Grooming</option>
              <option value="medication">Medication</option>
              <option value="training">Training</option>
              <option value="cleaning">Cleaning</option>
              <option value="socialization">Socialization</option>
              <option value="health_check">Health Check</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Description *</label>
            <textarea 
              id="taskDescription" 
              placeholder="Describe the task..."
              className={formErrors.taskDescription ? 'error' : ''}
              required
            ></textarea>
            {formErrors.taskDescription && <span className="error-message">{formErrors.taskDescription}</span>}
          </div>
          <div className="admin-form-group">
            <label>Scheduled Time *</label>
            <input 
              type="datetime-local" 
              id="taskScheduledTime" 
              className={formErrors.scheduledTime ? 'error' : ''}
              required
            />
            {formErrors.scheduledTime && <span className="error-message">{formErrors.scheduledTime}</span>}
          </div>
          <div className="admin-form-group">
            <label>Priority</label>
            <select id="taskPriority" required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label>Estimated Duration (minutes) *</label>
            <input 
              type="number" 
              id="taskDuration" 
              defaultValue="30" 
              min="5" 
              max="480" 
              className={formErrors.estimatedDuration ? 'error' : ''}
              required
            />
            {formErrors.estimatedDuration && <span className="error-message">{formErrors.estimatedDuration}</span>}
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => {
            setShowAssignTaskModal(false);
            setFormErrors({});
          }}>
            Cancel
          </button>
          <button className="admin-btn primary" onClick={() => {
            const taskData = {
              dogId: document.getElementById('taskDogId').value,
              taskType: document.getElementById('taskType').value,
              taskDescription: document.getElementById('taskDescription').value,
              scheduledTime: document.getElementById('taskScheduledTime').value,
              priority: document.getElementById('taskPriority').value,
              estimatedDuration: document.getElementById('taskDuration').value
            };
            handleAssignTask(taskData);
          }}>
            Assign Task to {selectedVolunteer?.name}
          </button>
        </div>
      </div>
    </div>
  );

  const renderViewModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal large">
        <div className="admin-modal-header">
          <h3>View {editingType} Details</h3>
          <button onClick={() => setShowViewModal(false)}>×</button>
        </div>
        <div className="admin-modal-body">
          {selectedItem && editingType === 'user' && (
            <div className="view-details">
              <div className="detail-row">
                <label>Name:</label>
                <span>{selectedItem.name}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedItem.email}</span>
              </div>
              <div className="detail-row">
                <label>Role:</label>
                <span className={`admin-role-badge ${selectedItem.role}`}>{selectedItem.role}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`admin-status-badge ${selectedItem.status}`}>{selectedItem.status}</span>
              </div>
              <div className="detail-row">
                <label>Join Date:</label>
                <span>{selectedItem.joinDate}</span>
              </div>
            </div>
          )}
          
          {selectedItem && editingType === 'event' && (
            <div className="view-details">
              <div className="detail-row">
                <label>Title:</label>
                <span>{selectedItem.title}</span>
              </div>
              <div className="detail-row">
                <label>Date:</label>
                <span>{selectedItem.date}</span>
              </div>
              <div className="detail-row">
                <label>Location:</label>
                <span>{selectedItem.location}</span>
              </div>
              <div className="detail-row">
                <label>Attendees:</label>
                <span>{selectedItem.attendees}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`admin-status-badge ${selectedItem.status}`}>{selectedItem.status}</span>
              </div>
              {selectedItem.photo && (
                <div className="detail-row">
                  <label>Image:</label>
                  <img src={selectedItem.photo} alt="Event" style={{width: '200px', borderRadius: '8px'}} />
                </div>
              )}
            </div>
          )}
          
          {selectedItem && editingType === 'dog' && (
            <div className="view-details">
              <div className="detail-row">
                <label>ID:</label>
                <span>{selectedItem.uniqueCode}</span>
              </div>
              <div className="detail-row">
                <label>Name:</label>
                <span>{selectedItem.name}</span>
              </div>
              <div className="detail-row">
                <label>Breed:</label>
                <span>{selectedItem.breed}</span>
              </div>
              <div className="detail-row">
                <label>Age:</label>
                <span>{selectedItem.age}</span>
              </div>
              <div className="detail-row">
                <label>Health Status:</label>
                <span className={`admin-health-badge ${selectedItem.healthStatus}`}>{selectedItem.healthStatus}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`admin-status-badge ${selectedItem.status}`}>{selectedItem.status}</span>
              </div>
              <div className="detail-row">
                <label>Tag Color:</label>
                <span className={`admin-tag-badge ${selectedItem.tagColor}`}>{selectedItem.tagColor}</span>
              </div>
              {selectedItem.photo && (
                <div className="detail-row">
                  <label>Photo:</label>
                  <img src={`http://localhost:3000/uploads/dogs/${selectedItem.photo}`} alt={selectedItem.name} style={{width: '200px', borderRadius: '8px'}} />
                </div>
              )}
            </div>
          )}
          
          {selectedItem && editingType === 'rescue' && (
            <div className="view-details">
              <div className="detail-row">
                <label>ID:</label>
                <span>#{selectedItem.id}</span>
              </div>
              <div className="detail-row">
                <label>Location:</label>
                <span>{selectedItem.location}</span>
              </div>
              <div className="detail-row">
                <label>Reported By:</label>
                <span>{selectedItem.reportedBy}</span>
              </div>
              <div className="detail-row">
                <label>Date:</label>
                <span>{selectedItem.date}</span>
              </div>
              <div className="detail-row">
                <label>Urgency:</label>
                <span className={`admin-urgency-badge ${selectedItem.urgency}`}>{selectedItem.urgency}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`admin-status-badge ${selectedItem.status}`}>{selectedItem.status}</span>
              </div>
            </div>
          )}
          
          {selectedItem && editingType === 'adoption' && (
            <div className="view-details">
              <div className="detail-row">
                <label>ID:</label>
                <span>#{selectedItem.id}</span>
              </div>
              <div className="detail-row">
                <label>Dog Name:</label>
                <span>{selectedItem.dogName}</span>
              </div>
              <div className="detail-row">
                <label>User Name:</label>
                <span>{selectedItem.userName}</span>
              </div>
              <div className="detail-row">
                <label>Date:</label>
                <span>{selectedItem.date}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`admin-status-badge ${selectedItem.status}`}>{selectedItem.status}</span>
              </div>
            </div>
          )}
          
          {selectedItem && editingType === 'volunteer' && (
            <div className="view-details">
              <div className="detail-row">
                <label>Name:</label>
                <span>{selectedItem.name}</span>
              </div>
              <div className="detail-row">
                <label>Email:</label>
                <span>{selectedItem.email}</span>
              </div>
              <div className="detail-row">
                <label>Phone:</label>
                <span>{selectedItem.phone || 'Not provided'}</span>
              </div>
              <div className="detail-row">
                <label>Assigned Dogs:</label>
                <span>{selectedItem.assignedDogs?.length || 0}</span>
              </div>
              <div className="detail-row">
                <label>Tasks Assigned:</label>
                <span>{selectedItem.assignedTasks?.length || 0}</span>
              </div>
              <div className="detail-row">
                <label>Tasks Completed:</label>
                <span>{selectedItem.completedTasks || 0}</span>
              </div>
              <div className="detail-row">
                <label>Status:</label>
                <span className={`admin-status-badge ${selectedItem.status}`}>{selectedItem.status}</span>
              </div>
            </div>
          )}
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => setShowViewModal(false)}>Close</button>
          <button className="admin-btn primary" onClick={() => {
            setShowViewModal(false);
            handleEdit(selectedItem, editingType);
          }}>Edit</button>
        </div>
      </div>
    </div>
  );

  const renderEditModal = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal large">
        <div className="admin-modal-header">
          <h3>Edit {editingType}</h3>
          <button onClick={() => {
            setShowEditModal(false);
            setFormErrors({});
          }}>×</button>
        </div>
        <div className="admin-modal-body">
          {editingItem && editingType === 'user' && (
            <div className="admin-form-group">
              <label>Name *</label>
              <input 
                type="text" 
                value={editingItem.name || ''}
                onChange={(e) => {
                  setEditingItem({...editingItem, name: e.target.value});
                  clearFieldError('name');
                }}
                className={formErrors.name ? 'error' : ''}
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              
              <label>Email *</label>
              <input 
                type="email" 
                value={editingItem.email || ''}
                onChange={(e) => {
                  setEditingItem({...editingItem, email: e.target.value});
                  clearFieldError('email');
                }}
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              
              <label>Role</label>
              <select 
                value={editingItem.role || ''}
                onChange={(e) => setEditingItem({...editingItem, role: e.target.value})}
              >
                <option value="adopter">Adopter</option>
                <option value="volunteer">Volunteer</option>
                <option value="vet">Veterinarian</option>
                <option value="driver">Rescue Driver</option>
              </select>
              
              <label>Status</label>
              <select 
                value={editingItem.status || ''}
                onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          )}
          
          {editingItem && editingType === 'rescue' && (
            <div className="admin-form-group">
              <label>Location *</label>
              <input 
                type="text" 
                value={editingItem.location || ''}
                onChange={(e) => {
                  setEditingItem({...editingItem, location: e.target.value});
                  clearFieldError('location');
                }}
                className={formErrors.location ? 'error' : ''}
              />
              {formErrors.location && <span className="error-message">{formErrors.location}</span>}
              
              <label>Reported By *</label>
              <input 
                type="text" 
                value={editingItem.reportedBy || ''}
                onChange={(e) => {
                  setEditingItem({...editingItem, reportedBy: e.target.value});
                  clearFieldError('reportedBy');
                }}
                className={formErrors.reportedBy ? 'error' : ''}
              />
              {formErrors.reportedBy && <span className="error-message">{formErrors.reportedBy}</span>}
              
              <label>Urgency</label>
              <select 
                value={editingItem.urgency || ''}
                onChange={(e) => setEditingItem({...editingItem, urgency: e.target.value})}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              
              <label>Status</label>
              <select 
                value={editingItem.status || ''}
                onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="rescued">Rescued</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          
          {editingItem && editingType === 'dog' && (
            <div className="admin-form-group">
              <label>Name *</label>
              <input 
                type="text" 
                value={editingItem.name || ''}
                onChange={(e) => {
                  setEditingItem({...editingItem, name: e.target.value});
                  clearFieldError('name');
                }}
                className={formErrors.name ? 'error' : ''}
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              
              <label>Breed *</label>
              <input 
                type="text" 
                value={editingItem.breed || ''}
                onChange={(e) => {
                  setEditingItem({...editingItem, breed: e.target.value});
                  clearFieldError('breed');
                }}
                className={formErrors.breed ? 'error' : ''}
              />
              {formErrors.breed && <span className="error-message">{formErrors.breed}</span>}
              
              <label>Age *</label>
              <input 
                type="text" 
                value={editingItem.age || ''}
                onChange={(e) => {
                  setEditingItem({...editingItem, age: e.target.value});
                  clearFieldError('age');
                }}
                className={formErrors.age ? 'error' : ''}
              />
              {formErrors.age && <span className="error-message">{formErrors.age}</span>}
              
              <label>Health Status</label>
              <select 
                value={editingItem.healthStatus || ''}
                onChange={(e) => setEditingItem({...editingItem, healthStatus: e.target.value})}
              >
                <option value="poor">Poor</option>
                <option value="fair">Fair</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
              
              <label>Status</label>
              <select 
                value={editingItem.status || ''}
                onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
              >
                <option value="rescue">Rescue</option>
                <option value="treatment">Treatment</option>
                <option value="adoption">Adoption Ready</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>
          )}
          
          {editingItem && editingType === 'adoption' && (
            <div className="admin-form-group">
              <label>User Name</label>
              <input 
                type="text" 
                value={editingItem.userName || ''}
                onChange={(e) => setEditingItem({...editingItem, userName: e.target.value})}
              />
              <label>Dog Name</label>
              <input 
                type="text" 
                value={editingItem.dogName || ''}
                onChange={(e) => setEditingItem({...editingItem, dogName: e.target.value})}
                
              />
              {/* Add dog selection dropdown if you want to change the actual dog */}
    <label>Select Dog</label>
    <select 
      value={editingItem.dogId || ''}
      onChange={(e) => {
        const selectedDogId = e.target.value;
        const selectedDog = dogs.find(dog => dog.id === selectedDogId);
        setEditingItem({
          ...editingItem, 
          dogId: selectedDogId,
          dogName: selectedDog ? selectedDog.name : editingItem.dogName
        });
      }}
    >
      <option value="">Select a dog</option>
      {dogs
        .filter(dog => dog.status === 'adoption' || dog.id === editingItem.dogId)
        .map(dog => (
          <option key={dog.id} value={dog.id}>
            {dog.name} ({dog.breed})
          </option>
        ))
      }
    </select>


              <label>Status</label>
              <select 
                value={editingItem.status || ''}
                onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                
              </select>
            </div>
          )}
          
          {editingItem && editingType === 'volunteer' && (
            <div className="admin-form-group">
              <label>Name *</label>
              <input 
                type="text" 
                value={editingItem.name || ''}
                onChange={(e) => {
                  setEditingItem({...editingItem, name: e.target.value});
                  clearFieldError('name');
                }}
                className={formErrors.name ? 'error' : ''}
              />
              {formErrors.name && <span className="error-message">{formErrors.name}</span>}
              
              <label>Email *</label>
              <input 
                type="email" 
                value={editingItem.email || ''}
                onChange={(e) => {
                  setEditingItem({...editingItem, email: e.target.value});
                  clearFieldError('email');
                }}
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && <span className="error-message">{formErrors.email}</span>}
              
              <label>Phone</label>
              <input 
                type="text" 
                value={editingItem.phone || ''}
                onChange={(e) => setEditingItem({...editingItem, phone: e.target.value})}
                placeholder="Enter phone number"
              />
              
              <label>Status</label>
              <select 
                value={editingItem.status || ''}
                onChange={(e) => setEditingItem({...editingItem, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
              
              <label>Completed Tasks</label>
              <input 
                type="number" 
                value={editingItem.completedTasks || 0}
                onChange={(e) => setEditingItem({...editingItem, completedTasks: parseInt(e.target.value) || 0})}
                min="0"
              />
              
              <div className="assigned-items-section">
                <label>Assigned Dogs ({editingItem.assignedDogs?.length || 0})</label>
                <div className="assigned-items-list">
                  {editingItem.assignedDogs?.map((dog, index) => (
                    <div key={index} className="assigned-item">
                      <span>{dog.dogId?.name || dog.name || 'Unknown Dog'}</span>
                      <button 
                        type="button"
                        className="remove-item-btn"
                        onClick={async () => {
                          try {
                            const volunteerId = editingItem._id || editingItem.id;
                            const dogId = dog.dogId?._id || dog.dogId || dog.id;
                            if (volunteerId && dogId) {
                              await axios.delete(`/admin/volunteers/${volunteerId}/assigned-dogs/${dogId}`);
                            }
                          } catch (e) {
                            console.error('Failed to unassign dog', e);
                          } finally {
                            const updatedDogs = [...(editingItem.assignedDogs || [])];
                            updatedDogs.splice(index, 1);
                            setEditingItem({...editingItem, assignedDogs: updatedDogs});
                            // also reflect in list
                            setVolunteersData(prev => prev.map(v => (v._id === (editingItem._id||editingItem.id) || v.id === (editingItem._id||editingItem.id)) ? { ...v, assignedDogs: updatedDogs } : v));
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="assigned-items-section">
                <label>Assigned Tasks ({editingItem.assignedTasks?.length || 0})</label>
                <div className="assigned-items-list">
                  {editingItem.assignedTasks?.map((task, index) => (
                    <div key={index} className="assigned-item">
                      <span>{task.taskType} - {task.taskDescription}</span>
                      <button 
                        type="button"
                        className="remove-item-btn"
                        onClick={async () => {
                          try {
                            const volunteerId = editingItem._id || editingItem.id;
                            const taskId = task.taskId?._id || task.taskId || task._id || task.id;
                            if (volunteerId && taskId) {
                              await axios.delete(`/admin/volunteers/${volunteerId}/assigned-tasks/${taskId}`);
                            }
                          } catch (e) {
                            console.error('Failed to unassign task', e);
                          } finally {
                            const updatedTasks = [...(editingItem.assignedTasks || [])];
                            updatedTasks.splice(index, 1);
                            setEditingItem({...editingItem, assignedTasks: updatedTasks});
                            setVolunteersData(prev => prev.map(v => (v._id === (editingItem._id||editingItem.id) || v.id === (editingItem._id||editingItem.id)) ? { ...v, assignedTasks: updatedTasks } : v));
                          }
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => {
            setShowEditModal(false);
            setFormErrors({});
          }} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="admin-btn primary" onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderEmergencyMap = () => (
    <div className="admin-modal-overlay">
      <div className="admin-modal large">
        <div className="admin-modal-header">
          <h3>Emergency Map View</h3>
          <button onClick={() => setShowEmergencyMap(false)}>×</button>
        </div>
        <div className="admin-modal-body">
          <div className="map-container">
            <div className="map-placeholder">
              <Map size={48} />
              <p>Interactive Map with GPS Pins</p>
              <div className="map-legend">
                <div className="legend-item">
                  <span className="pin high"></span>
                  <span>High Urgency</span>
                </div>
                <div className="legend-item">
                  <span className="pin medium"></span>
                  <span>Medium Urgency</span>
                </div>
                <div className="legend-item">
                  <span className="pin low"></span>
                  <span>Low Urgency</span>
                </div>
              </div>
            </div>
          </div>
          <div className="rescue-list">
            <h4>Active Rescue Reports</h4>
            {rescueReports.filter(r => r.status !== 'rescued').map(report => (
              <div key={report.id} className={`rescue-item ${report.urgency}`}>
                <div className="rescue-info">
                  <h4>Report #{report.id}</h4>
                  <p><MapPin size={14} /> {report.location}</p>
                  <p>Reported by: {report.reportedBy}</p>
                  <p>Status: <span className={`status ${report.status}`}>{report.status}</span></p>
                </div>
                <div className="rescue-actions">
                  <button className="admin-btn primary" onClick={() => handleAssignEmergency(report.id)}>
                    Assign to Driver
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn" onClick={() => setShowEmergencyMap(false)}>Close</button>
        </div>
      </div>
    </div>
  );

  // Section Render Functions
  const renderOverview = () => (
    <div className="admin-overview">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon total-dogs">
            <PawPrint size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.totalDogs}</h3>
            <p>Total Dogs</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon adopted">
            <Heart size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.adoptedDogs}</h3>
            <p>Adopted Dogs</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon in-shelter">
            <Home size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.dogsInShelter}</h3>
            <p>Dogs in Shelter</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon volunteers">
            <Users size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.totalVolunteers}</h3>
            <p>Volunteers</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon rescues">
            <AlertTriangle size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.activeRescues}</h3>
            <p>Active Rescues</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon adoptions">
            <FileText size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.pendingAdoptions}</h3>
            <p>Pending Adoptions</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon events">
            <Calendar size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>{stats.upcomingEvents}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon donations">
            <Activity size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>${stats.totalDonations}</h3>
            <p>Total Donations</p>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-content">
        <div className="admin-content-row">
          <div className="admin-content-col">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Emergency Alerts</h3>
                <span>View All</span>
              </div>
              <div className="admin-card-body">
                <div className="admin-alerts-list">
                  {emergencyAlerts.map(alert => (
                    <div key={alert.id} className={`admin-alert-item ${alert.status}`}>
                      <div className="admin-alert-icon">
                        <AlertCircle size={16} />
                      </div>
                      <div className="admin-alert-content">
                        <p>{alert.type.toUpperCase()} alert in {alert.location}</p>
                        <span>Reported by {alert.reportedBy} • {alert.time}</span>
                      </div>
                      <div className="admin-alert-actions">
                        <button className="admin-icon-btn" onClick={() => handleDelete(alert.id, 'alert')}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-content-col">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Pending Actions</h3>
                <span>View All</span>
              </div>
              <div className="admin-card-body">
                <div className="admin-actions-list">
                  {pendingActions.map(action => (
                    <div key={action.id} className={`admin-action-item ${action.priority}`}>
                      <div className="admin-action-content">
                        <h4>{action.title}</h4>
                        <p>{action.description}</p>
                      </div>
                      <button className="admin-btn primary">Review</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-content-row">
          <div className="admin-content-col">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Recent Activities</h3>
                <span>View All</span>
              </div>
              <div className="admin-card-body">
                <div className="admin-activity-list">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className={`admin-activity-item ${activity.type}`}>
                      <div className={`admin-activity-icon ${activity.type}`}>
                        {activity.type === 'adoption' && <FileText size={16} />}
                        {activity.type === 'rescue' && <AlertTriangle size={16} />}
                        {activity.type === 'user' && <UserPlus size={16} />}
                        {activity.type === 'event' && <Calendar size={16} />}
                        {activity.type === 'medical' && <Stethoscope size={16} />}
                      </div>
                      <div className="admin-activity-content">
                        <p>{activity.message}</p>
                        <span>By {activity.user} • {activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-content-col">
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Upcoming Events</h3>
                <span>View All</span>
              </div>
              <div className="admin-card-body">
                <div className="admin-events-list">
                  {events.filter(event => event.status === 'upcoming').slice(0, 3).map(event => (
                    <div key={event.id} className="admin-event-item">
                      <div className="admin-event-date">
                        <Calendar size={16} />
                        <span>{event.date}</span>
                      </div>
                      <div className="admin-event-content">
                        <h4>{event.title}</h4>
                        <p><MapPin size={14} /> {event.location}</p>
                      </div>
                      <div className="admin-event-actions">
                        <button className="admin-icon-btn" onClick={() => handleViewDetails(event, 'event')}>
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>User Management</h3>
        <div className="admin-search-filter">
          <div className="admin-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="admin-btn primary" onClick={() => {
            setEditingItem(null);
            setEditingType('');
            setNewUser({ name: "", email: "", role: "adopter", status: "active" });
            setShowAddUserModal(true);
          }}>
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Join Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="admin-user-info">
                    <div className="admin-user-avatar">
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`admin-role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`admin-status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.joinDate}</td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-icon-btn" onClick={() => handleViewDetails(user, 'user')}>
                      <Eye size={16} />
                    </button>
                    <button className="admin-icon-btn" onClick={() => handleEdit(user, 'user')}>
                      <Edit size={16} />
                    </button>
                    <button className="admin-icon-btn" onClick={() => handleDelete(user.id, 'user')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Event Management</h3>
        <div className="admin-search-filter">
          <div className="admin-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="admin-btn primary" onClick={() => setShowAddEventModal(true)}>
            <Plus size={16} />
            New Event
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Date</th>
              <th>Location</th>
              <th>Attendees</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>
                  <div className="admin-event-photo">
                    {event.photo ? (
                      <img
                        src={event.photo.startsWith('http') ? event.photo : `http://localhost:3000${event.photo}`}
                        alt={event.title}
                        style={{ width: '56px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e1e1e1' }}
                      />
                    ) : (
                      <div style={{ width: '56px', height: '40px', borderRadius: '6px', background: '#f3f4f6', border: '1px solid #e1e1e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '10px' }}>
                        No Image
                      </div>
                    )}
                  </div>
                </td>
                <td>{event.title}</td>
                <td>{event.date}</td>
                <td>{event.location}</td>
                <td>{event.attendees}</td>
                <td>
                  <span className={`admin-status-badge ${event.status}`}>
                    {event.status}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-icon-btn" onClick={() => handleViewDetails(event, 'event')}>
                      <Eye size={16} />
                    </button>
                    <button className="admin-icon-btn" onClick={() => handleEdit(event, 'event')}>
                      <Edit size={16} />
                    </button>
                    <button className="admin-icon-btn" onClick={() => handleDelete(event.id, 'event')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEmergencyManagement = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Emergency & Rescue Management</h3>
        <div className="admin-search-filter">
          <div className="admin-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search rescue reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="rescued">Rescued</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="admin-btn secondary" onClick={() => setShowEmergencyMap(true)}>
            <Map size={16} />
            Map View
          </button>
        </div>
      </div>

      <div className="dashboard-navigation">
        <button className="dd-nav-button" onClick={navigateToEmergencyDashboard}>🚑 Emergency Dashboard</button>
        <button className="dd-nav-button" onClick={navigateToRescueDashboard}>🐾 Rescue Dashboard</button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Reported By</th>
              <th>Date</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rescueReports
              .filter(report => {
                // Filter by search term
                if (searchTerm && !report.location.toLowerCase().includes(searchTerm.toLowerCase()) && 
                    !report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase())) {
                  return false;
                }
                // Filter by status
                if (statusFilter !== 'all' && report.status !== statusFilter) {
                  return false;
                }
                return true;
              })
              .map(report => (
              <tr key={report.id}>
                <td className="report-id">#{report.id}</td>
                <td>
                  <div className="admin-location-info">
                    <MapPin size={16} />
                    <span>{report.location}</span>
                  </div>
                </td>
                <td>{report.reportedBy}</td>
                <td>{new Date(report.date).toLocaleDateString()}</td>
                <td>
                  <span className={`admin-urgency-badge ${report.urgency}`}>
                    {report.urgency.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`admin-status-badge ${report.status}`}>
                    {report.status.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className="admin-icon-btn" 
                      onClick={() => handleViewDetails(report, 'rescue')}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      className="admin-icon-btn" 
                      onClick={() => handleEdit(report, 'rescue')}
                      title="Edit Report"
                    >
                      <Edit size={16} />
                    </button>
                    
                    {/* Status Management Actions */}
                    {report.status === 'pending' && (
                      <button 
                        className="admin-icon-btn success" 
                        onClick={() => handleAssignEmergency(report.id)}
                        title="Assign to Driver"
                      >
                        <Truck size={16} />
                      </button>
                    )}
                    
                    {report.status === 'assigned' && (
                      <button 
                        className="admin-icon-btn primary" 
                        onClick={() => handleUpdateRescueStatus(report.id, 'in-progress')}
                        title="Mark as In Progress"
                      >
                        <Clock size={16} />
                      </button>
                    )}
                    
                    {report.status === 'in-progress' && (
                      <button 
                        className="admin-icon-btn success" 
                        onClick={() => handleCompleteEmergency(report.id)}
                        title="Mark as Completed"
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    
                    {(report.status === 'pending' || report.status === 'assigned') && (
                      <button 
                        className="admin-icon-btn warning" 
                        onClick={() => handleUpdateRescueStatus(report.id, 'cancelled')}
                        title="Cancel Report"
                      >
                        <XCircle size={16} />
                      </button>
                    )}
                    
                    <button 
                      className="admin-icon-btn danger" 
                      onClick={() => handleDelete(report.id, 'rescue')}
                      title="Delete Report"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {rescueReports.length === 0 && (
          <div className="admin-empty-state">
            <AlertTriangle size={48} />
            <h3>No Rescue Reports</h3>
            <p>There are no emergency rescue reports in the system.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDogManagement = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Dog Management</h3>
        <div className="admin-search-filter">
          <div className="admin-search-box">
            <Search size={18} />
            <input type="text" placeholder="Search dogs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Dogs</option>
            <option value="rescue">Rescue</option>
            <option value="treatment">Treatment</option>
            <option value="adoption">Adoption Ready</option>
            <option value="adopted">Adopted</option>
          </select>
          <button className="admin-btn primary" onClick={() => {
            setEditingItem(null);
            setEditingType('');
            setNewDog({ name: "", breed: "", age: "", color: "", tagColor: "blue", status: "rescue", healthStatus: "good", photo: null });
            setShowAddDogModal(true);
          }}>
            <Plus size={16} />
            Register Dog
          </button>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Breed</th>
              <th>Age</th>
              <th>Tag Color</th>
              <th>Health Status</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dogs.map(dog => (
              <tr key={dog.id}>
                <td>{dog.uniqueCode}</td>
                <td>
                  <div className="admin-dog-photo">
                    {dog.photo ? (
                      <img src={`http://localhost:3000/uploads/dogs/${dog.photo}`} alt={dog.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ddd' }}>
                        <PawPrint size={20} color="#999" />
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="admin-dog-info"><PawPrint size={16} /><span>{dog.name}</span></div>
                </td>
                <td>{dog.breed}</td>
                <td>{dog.age}</td>
                <td><span className={`admin-tag-badge ${dog.tagColor}`}>{dog.tagColor}</span></td>
                <td><span className={`admin-health-badge ${dog.healthStatus}`}>{dog.healthStatus}</span></td>
                <td><span className={`admin-status-badge ${dog.status}`}>{dog.status}</span></td>
                <td>
                  <div className="admin-actions">
                    <button className="admin-icon-btn" onClick={() => handleViewDetails(dog, 'dog')}>
                      <Eye size={16} />
                    </button>
                    <button className="admin-icon-btn" onClick={() => handleEdit(dog, 'dog')}>
                      <Edit size={16} />
                    </button>
                    {dog.status === 'treatment' && (
                      <button className="admin-icon-btn success" onClick={() => handleMarkAdoptionReady(dog.id)}>
                        <Shield size={16} />
                      </button>
                    )}
                    {dog.status === 'adopted' && (
                      <span className="admin-adopted-label" style={{color: '#10b981', fontSize: '12px', fontWeight: 'bold'}}>✓ Adopted</span>
                    )}
                    <button className="admin-icon-btn" onClick={() => handleDelete(dog.id, 'dog')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdoptionManagement = () => (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>Adoption Management</h3>
        <div className="admin-search-filter">
          <div className="admin-search-box">
            <Search size={18} />
            <input type="text" placeholder="Search adoption requests..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Dog</th>
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adoptionRequests.map(request => (
              <tr key={request.id}>
                <td>#{request.id}</td>
                <td>
                  <div className="admin-dog-info"><PawPrint size={16} /><span>{request.dogName}</span></div>
                </td>
                <td>{request.userName}</td>
                <td>{request.date}</td>
                <td>
                  <span className={`admin-status-badge ${request.status}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    {request.status === 'pending' && (
                      <>
                        <button className="admin-icon-btn success" onClick={() => handleApprove(request.id, 'adoption')}>
                          <CheckCircle size={16} />
                        </button>
                        <button className="admin-icon-btn danger" onClick={() => handleReject(request.id, 'adoption')}>
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <button className="admin-icon-btn primary" onClick={() => handleGenerateCertificate(request.id)}>
                        <FileCheck size={16} />
                      </button>
                    )}
                    <button className="admin-icon-btn" onClick={() => handleViewDetails(request, 'adoption')}>
                      <Eye size={16} />
                    </button>
                    <button className="admin-icon-btn" onClick={() => handleEdit(request, 'adoption')}>
                      <Edit size={16} />
                    </button>
                    <button className="admin-icon-btn danger" onClick={() => handleDelete(request.id, 'adoption')}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVolunteerManagement = () => (
  <div className="admin-section">
    <div className="admin-section-header">
      <h3>Volunteer Management</h3>
      <div className="admin-search-filter">
        <div className="admin-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search volunteers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Volunteers</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        
      </div>
    </div>

    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Availability</th>
            <th>Assigned Dogs</th>
            <th>Tasks</th>
            <th>Completed Tasks</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {volunteersData
            .filter(volunteer => {
              if (statusFilter === 'all') return true;
              return volunteer.status === statusFilter;
            })
            .filter(volunteer => 
              volunteer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              volunteer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (volunteer.phone && volunteer.phone.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map(volunteer => (
            <tr key={volunteer._id || volunteer.id}>
              <td>
                <div className="admin-user-info">
                  <div className="admin-user-avatar">
                    {volunteer.name?.charAt(0) || 'V'}
                  </div>
                  <span>{volunteer.name}</span>
                </div>
              </td>
              <td>{volunteer.email}</td>
              <td>{volunteer.phone || 'Not provided'}</td>
              <td>{volunteer.availability || 'Not specified'}</td>
              <td>
                <div className="assigned-dogs">
                  {volunteer.assignedDogs && volunteer.assignedDogs.length > 0 ? (
                    <div className="dogs-list">
                      {volunteer.assignedDogs.slice(0, 3).map((assignment, index) => (
                        <span key={index} className="dog-tag">
                          {assignment.dogId?.name || assignment.name || 'Unknown Dog'}
                        </span>
                      ))}
                      {volunteer.assignedDogs.length > 3 && (
                        <span className="dog-tag-more">
                          +{volunteer.assignedDogs.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="no-dogs">No dogs assigned</span>
                  )}
                </div>
              </td>
              <td>
                <div className="task-stats">
                  <span className="task-count">
                    {volunteer.assignedTasks?.length || 0}
                  </span>
                </div>
              </td>
              <td>
                <span className="completed-tasks">
                  {volunteer.completedTasks || 0}
                </span>
              </td>
              <td>
                <span className={`admin-status-badge ${volunteer.status}`}>
                  {volunteer.status}
                </span>
              </td>
              <td>
                <div className="admin-actions">
                  <button 
                    className="admin-icon-btn primary" 
                    onClick={() => {
                      setSelectedVolunteer(volunteer);
                      fetchAvailableDogs();
                      setSelectedDogs([]);
                      setShowAssignDogsModal(true);
                    }}
                    title="Assign Dogs"
                  >
                    <PawPrint size={16} />
                  </button>
                  <button 
                    className="admin-icon-btn success" 
                    onClick={() => {
                      setSelectedVolunteer(volunteer);
                      setShowAssignTaskModal(true);
                    }}
                    title="Assign Task"
                  >
                    <ClipboardList size={16} />
                  </button>
                  <button 
                    className="admin-icon-btn" 
                    onClick={() => handleViewDetails(volunteer, 'volunteer')}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    className="admin-icon-btn" 
                    onClick={() => handleEdit(volunteer, 'volunteer')}
                    title="Edit Volunteer"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    className="admin-icon-btn danger" 
                    onClick={() => handleDelete(volunteer._id || volunteer.id, 'volunteer')}
                    title="Delete Volunteer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {volunteersData.length === 0 && (
        <div className="admin-empty-state">
          <Users size={48} />
          <h3>No Volunteers Found</h3>
          <p>There are no volunteers in the system yet.</p>
        </div>
      )}
    </div>
  </div>
);

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "emergency":
        return renderEmergencyManagement();
      case "dogs":
        return renderDogManagement();
      case "adoptions":
        return renderAdoptionManagement();
      case "volunteers":
        return renderVolunteerManagement();
      case "users":
        return renderUsers();
      case "events":
        return renderEvents();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo">
            <PawPrint size={28} />
            <h1>Street Dog Shelter Admin</h1>
          </div>
        </div>
        <div className="admin-header-right">
          <div className="admin-notifications">
            <Bell size={20} />
            <span className="admin-notification-badge">3</span>
          </div>
          <div className="admin-user">
            <div className="admin-user-avatar">A</div>
            <div className="admin-user-info">
              <span className="admin-user-name">Admin User</span>
              <span className="admin-user-role">Administrator</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="admin-dashboard-content">
        <div className="admin-sidebar">
          <div className="admin-sidebar-nav">
            <button 
              className={`admin-nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <BarChart3 size={20} />
              <span>Overview</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "emergency" ? "active" : ""}`}
              onClick={() => setActiveTab("emergency")}
            >
              <AlertTriangle size={20} />
              <span>Emergency Mgmt</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "dogs" ? "active" : ""}`}
              onClick={() => setActiveTab("dogs")}
            >
              <PawPrint size={20} />
              <span>Dog Management</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "adoptions" ? "active" : ""}`}
              onClick={() => setActiveTab("adoptions")}
            >
              <Heart size={20} />
              <span>Adoptions</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "volunteers" ? "active" : ""}`}
              onClick={() => setActiveTab("volunteers")}
            >
              <Users size={20} />
              <span>Volunteers</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              <UserPlus size={20} />
              <span>Users</span>
            </button>
            <button 
              className={`admin-nav-item ${activeTab === "events" ? "active" : ""}`}
              onClick={() => setActiveTab("events")}
            >
              <Calendar size={20} />
              <span>Events</span>
            </button>
            {/* Removed Reports and Settings tabs */}
          </div>
        </div>

        <div className="admin-main-content">
          {renderContent()}
        </div>
      </div>

      {/* Modals */}
      {showAddUserModal && renderAddUserModal()}
      {showAddEventModal && renderAddEventModal()}
      {showEditEventModal && renderEditEventModal()}
      {showAddRescueModal && renderAddRescueModal()}
      {showAddDogModal && renderAddDogModal()}
      {showEmergencyMap && renderEmergencyMap()}
      {showViewModal && renderViewModal()}
      {showEditModal && renderEditModal()}
      {showAssignDogsModal && renderAssignDogsModal()}
      {showAssignTaskModal && renderAssignTaskModal()}
    </div>
  );
};           

export default AdminDashboard;