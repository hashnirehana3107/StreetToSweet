import React, { useState, useEffect } from 'react';
import {
  Bell,
  User,
  Clock,
  PawPrint,
  MapPin,
  Calendar,
  Edit3,
  BarChart3,
  Heart,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  LogOut,
  Plus,
  TrendingUp,
  Award,
  Mail,
  Phone,
  Upload,
  Save,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  CalendarDays,
  ClipboardList,
  Users,
  Eye,
  Edit,
  FileText,
  Activity
} from 'lucide-react';
import './VolunteerDashboard.css';
import VolunteerDashboardAPI from '../../api/volunteerDashboardAPI';

const VolunteerDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  // API instance
  const [api] = useState(() => new VolunteerDashboardAPI());
  
  // Data states
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [availableDogs, setAvailableDogs] = useState([]);
  const [healthReports, setHealthReports] = useState([]);
  const [walkingData, setWalkingData] = useState({ 
    walks: [], 
    statistics: {},
    totalDistance: 0,
    totalDuration: '0h 0m',
    uniqueDogs: 0,
    recentWalks: []
  });
  const [events, setEvents] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Form states
  const [newBlogPost, setNewBlogPost] = useState({
    title: '',
    content: ''
  });

  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [walkLog, setWalkLog] = useState({
    dogId: '',
    distance: '',
    duration: '',
    activities: [],
    walkDate: new Date().toISOString().split('T')[0],
    walkTime: new Date().toTimeString().slice(0, 5),
    route: '',
    notes: '',
    weather: '',
    walkQuality: 'good',
    dogBehavior: 'calm',
    startTime: '',
    endTime: ''
  });

  const [healthReport, setHealthReport] = useState({
    dogId: '',
    eatingHabits: 'normal',
    mood: 'normal',
    weight: '',
    observations: '',
    photos: []
  });

  // Modal states
  const [showHealthReportModal, setShowHealthReportModal] = useState(false);
  const [selectedDogForModal, setSelectedDogForModal] = useState(null);
  const [modalHealthReport, setModalHealthReport] = useState({
    dogId: '',
    eatingHabits: 'normal',
    mood: 'normal',
    weight: '',
    observations: '',
    photos: []
  });

  // Volunteer Management States
  const [assignedDogs, setAssignedDogs] = useState([]);
  const [volunteerTasks, setVolunteerTasks] = useState([]);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // NEW: Health Report View States
  const [showHealthReportsModal, setShowHealthReportsModal] = useState(false);
  const [selectedDogHealthReports, setSelectedDogHealthReports] = useState([]);
  const [selectedDogForHealthReports, setSelectedDogForHealthReports] = useState(null);

  // NEW: Quick Walk Log States
  const [showQuickWalkModal, setShowQuickWalkModal] = useState(false);
  const [selectedDogForWalk, setSelectedDogForWalk] = useState(null);
  const [quickWalkLog, setQuickWalkLog] = useState({
    distance: '',
    duration: '',
    activities: [],
    walkDate: new Date().toISOString().split('T')[0],
    walkTime: new Date().toTimeString().slice(0, 5),
    route: '',
    notes: '',
    weather: '',
    walkQuality: 'good',
    dogBehavior: 'calm'
  });


  const [showWalkDetailsModal, setShowWalkDetailsModal] = useState(false);
const [selectedWalk, setSelectedWalk] = useState(null);

// Add this function to load walk details (add it with the other load functions)
const loadWalkDetails = async (walkId) => {
  try {
    const response = await api.getWalkDetails(walkId);
    return response.data;
  } catch (error) {
    console.error('Error loading walk details:', error);
    return null;
  }
};

const openWalkDetailsModal = async (walk) => {
  setSelectedWalk(walk);
  setShowWalkDetailsModal(true);
};

// Add this function to close walk details modal
const closeWalkDetailsModal = () => {
  setShowWalkDetailsModal(false);
  setSelectedWalk(null);
};

// NEW: Recent Walks Modal States
const [showRecentWalksModal, setShowRecentWalksModal] = useState(false);
const [selectedDogRecentWalks, setSelectedDogRecentWalks] = useState([]);
const [selectedDogForRecentWalks, setSelectedDogForRecentWalks] = useState(null);


  // NEW: Walk Log Modal State
  const [showWalkLogModal, setShowWalkLogModal] = useState(false);
  const [selectedDogForWalkLog, setSelectedDogForWalkLog] = useState(null);

  // Form validation states
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated and load data if valid token exists
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No token found, user needs to login');
      setError('Please login to access the volunteer dashboard.');
      setLoading(false);
      return;
    }
    loadDashboardData();
    loadVolunteerManagementData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load dashboard overview
      const overviewData = await api.getDashboardOverview();
      setDashboardData(overviewData?.data || null);
      setUserData(overviewData?.data?.volunteerInfo || null);

      // Load assigned tasks
      const tasksData = await api.getAssignedTasks();
      setAssignedTasks(tasksData?.data?.tasksByDog || []);

      // Load available dogs for walking
      const dogsData = await api.getAvailableDogs();
      setAvailableDogs(dogsData?.data?.dogs || []);

      // Load walking data
      const walkData = await api.getWalkingData();
      setWalkingData(walkData?.data || { 
        walks: [], 
        statistics: {},
        totalDistance: 0,
        totalDuration: '0h 0m',
        uniqueDogs: 0,
        recentWalks: []
      });

      // Load events
      const eventsData = await api.getUpcomingEvents();
      setEvents(eventsData?.data?.events || []);

      // Load blog posts
      try {
        const blogData = await api.getBlogPosts();
        setBlogPosts(Array.isArray(blogData?.data?.posts) ? blogData.data.posts : []);
      } catch (blogError) {
        console.error('Failed to load blog posts:', blogError);
        setBlogPosts([]);
      }

      // Load health reports
      const healthData = await api.getHealthReports();
      setHealthReports(healthData?.data?.reports || []);

    } catch (error) {
      setError('Failed to load dashboard data: ' + (error.message || 'Unknown error'));
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load volunteer management data
  const loadVolunteerManagementData = async () => {
    try {
      console.log('Loading volunteer management data...');
      
      // Load assigned dogs for this volunteer
      const assignedDogsResponse = await api.getAssignedDogs();
      console.log('Assigned dogs response:', assignedDogsResponse);
      setAssignedDogs(assignedDogsResponse?.data || []);

      // Fetch volunteer tasks
      const tasksResponse = await api.getVolunteerTasks();
      console.log('Volunteer tasks response:', tasksResponse);
      setVolunteerTasks(tasksResponse?.data || []);

    } catch (error) {
      console.error('Error loading volunteer management data:', error);
      
      // Fallback: Try to get data from the dashboard overview
      if (dashboardData?.assignedDogs) {
        console.log('Using fallback data from dashboard');
        setAssignedDogs(dashboardData.assignedDogs);
      }
      
      // Set empty arrays as fallback
      if (assignedDogs.length === 0) {
        setAssignedDogs([]);
      }
      if (volunteerTasks.length === 0) {
        setVolunteerTasks([]);
      }
    }
  };

  // Load health reports for a specific dog
  const loadDogHealthReports = async (dogId) => {
    try {
      const allReports = healthReports.filter(report => getReportDogId(report) === dogId);
      setSelectedDogHealthReports(allReports);
    } catch (error) {
      console.error('Error loading dog health reports:', error);
      setSelectedDogHealthReports([]);
    }
  };

  // Load recent walks for a specific dog
  const loadDogRecentWalks = async (dogId) => {
    try {
      // Filter walks from walkingData for the specific dog
      const allWalks = walkingData.walks || walkingData.recentWalks || [];
      const dogWalks = allWalks.filter(walk => {
        const walkDogId = walk.dogId?._id || walk.dogId || walk.dog?._id || walk.dog;
        return walkDogId === dogId;
      });
      
      // Sort by date, most recent first
      const sortedWalks = dogWalks.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      setSelectedDogRecentWalks(sortedWalks);
    } catch (error) {
      console.error('Error loading dog recent walks:', error);
      setSelectedDogRecentWalks([]);
    }
  };

  // Form validation functions
  const validateHealthReport = (reportData) => {
    const errors = {};
    
    if (!reportData.dogId) {
      errors.dogId = 'Please select a dog';
    }
    
    if (!reportData.eatingHabits) {
      errors.eatingHabits = 'Please specify eating habits';
    }
    
    if (!reportData.mood) {
      errors.mood = 'Please specify mood/behavior';
    }
    
    if (reportData.weight && (parseFloat(reportData.weight) <= 0 || parseFloat(reportData.weight) > 100)) {
      errors.weight = 'Please enter a valid weight (0.1 - 100 kg)';
    }
    
    if (!reportData.observations || reportData.observations.trim().length < 10) {
      errors.observations = 'Please provide detailed observations (minimum 10 characters)';
    }
    
    return errors;
  };

  const validateWalkLog = (walkData) => {
    const errors = {};
    
    if (!walkData.dogId) {
      errors.dogId = 'Please select a dog';
    }
    
    if (!walkData.distance || parseFloat(walkData.distance) <= 0) {
      errors.distance = 'Please enter a valid distance (greater than 0 km)';
    }
    
    if (!walkData.duration || parseInt(walkData.duration) <= 0) {
      errors.duration = 'Please enter a valid duration (greater than 0 minutes)';
    }
    
    if (!walkData.walkDate) {
      errors.walkDate = 'Please select a date';
    }
    
    if (!walkData.walkTime) {
      errors.walkTime = 'Please select a time';
    }
    
    if (walkData.activities.length === 0) {
      errors.activities = 'Please select at least one activity';
    }
    
    return errors;
  };

  const validateBlogPost = (postData) => {
    const errors = {};
    
    if (!postData.title || postData.title.trim().length < 5) {
      errors.title = 'Title must be at least 5 characters long';
    }
    
    if (!postData.content || postData.content.trim().length < 50) {
      errors.content = 'Content must be at least 50 characters long';
    }
    
    return errors;
  };

  // Open health reports modal
  const openHealthReportsModal = async (dog) => {
    setSelectedDogForHealthReports(dog);
    await loadDogHealthReports(dog._id);
    setShowHealthReportsModal(true);
  };

  // Close health reports modal
  const closeHealthReportsModal = () => {
    setShowHealthReportsModal(false);
    setSelectedDogForHealthReports(null);
    setSelectedDogHealthReports([]);
  };

  // Open recent walks modal
  const openRecentWalksModal = async (dog) => {
    setSelectedDogForRecentWalks(dog);
    await loadDogRecentWalks(dog._id);
    setShowRecentWalksModal(true);
  };

  // Close recent walks modal
  const closeRecentWalksModal = () => {
    setShowRecentWalksModal(false);
    setSelectedDogForRecentWalks(null);
    setSelectedDogRecentWalks([]);
  };

  // Open quick walk modal
  const openQuickWalkModal = (dog) => {
    setSelectedDogForWalk(dog);
    setQuickWalkLog({
      distance: '',
      duration: '',
      activities: [],
      walkDate: new Date().toISOString().split('T')[0],
      walkTime: new Date().toTimeString().slice(0, 5),
      route: '',
      notes: '',
      weather: '',
      walkQuality: 'good',
      dogBehavior: 'calm'
    });
    setShowQuickWalkModal(true);
  };

  // Close quick walk modal
  const closeQuickWalkModal = () => {
    setShowQuickWalkModal(false);
    setSelectedDogForWalk(null);
    setQuickWalkLog({
      distance: '',
      duration: '',
      activities: [],
      walkDate: new Date().toISOString().split('T')[0],
      walkTime: new Date().toTimeString().slice(0, 5),
      route: '',
      notes: '',
      weather: '',
      walkQuality: 'good',
      dogBehavior: 'calm'
    });
    setFormErrors({});
  };

  // NEW: Open walk log modal
  const openWalkLogModal = (dog) => {
    setSelectedDogForWalkLog(dog);
    setWalkLog({
      dogId: dog._id,
      distance: '',
      duration: '',
      activities: [],
      walkDate: new Date().toISOString().split('T')[0],
      walkTime: new Date().toTimeString().slice(0, 5),
      route: '',
      notes: '',
      weather: '',
      walkQuality: 'good',
      dogBehavior: 'calm',
      startTime: '',
      endTime: ''
    });
    setShowWalkLogModal(true);
    setFormErrors({});
  };

  // NEW: Close walk log modal
  const closeWalkLogModal = () => {
    setShowWalkLogModal(false);
    setSelectedDogForWalkLog(null);
    setWalkLog({
      dogId: '',
      distance: '',
      duration: '',
      activities: [],
      walkDate: new Date().toISOString().split('T')[0],
      walkTime: new Date().toTimeString().slice(0, 5),
      route: '',
      notes: '',
      weather: '',
      walkQuality: 'good',
      dogBehavior: 'calm',
      startTime: '',
      endTime: ''
    });
    setFormErrors({});
  };

  // Handle quick walk submission
  const handleQuickWalkSubmit = async () => {
    const errors = validateWalkLog({
      ...quickWalkLog,
      dogId: selectedDogForWalk?._id
    });
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      if (!selectedDogForWalk) {
        alert('No dog selected for walk');
        return;
      }

      const walkData = {
        dogId: selectedDogForWalk._id,
        distance: parseFloat(quickWalkLog.distance),
        duration: parseInt(quickWalkLog.duration),
        activities: quickWalkLog.activities,
        walkDate: quickWalkLog.walkDate,
        walkTime: quickWalkLog.walkTime,
        route: quickWalkLog.route || '',
        notes: quickWalkLog.notes || '',
        weather: quickWalkLog.weather || '',
        walkQuality: quickWalkLog.walkQuality || 'good',
        dogBehavior: quickWalkLog.dogBehavior || 'calm',
        startTime: new Date(`${quickWalkLog.walkDate}T${quickWalkLog.walkTime}`).toISOString(),
        endTime: new Date(new Date(`${quickWalkLog.walkDate}T${quickWalkLog.walkTime}`).getTime() + parseInt(quickWalkLog.duration) * 60000).toISOString()
      };

      const formData = api.createWalkFormData(walkData);
      await api.logWalk(formData);
      
      // Close modal and reload data
      closeQuickWalkModal();
      
      // Reload walking data
      const walkDataUpdated = await api.getWalkingData();
      setWalkingData(walkDataUpdated?.data || { 
        walks: [], 
        statistics: {},
        totalDistance: 0,
        totalDuration: '0h 0m',
        uniqueDogs: 0,
        recentWalks: []
      });
      
      alert('Walk logged successfully!');
    } catch (error) {
      console.error('Error logging quick walk:', error);
      let errorMessage = 'Failed to log walk';
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error: Could not connect to server';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Monitor state changes
  useEffect(() => {
    console.log('=== STATE UPDATES ===');
    console.log('User Data:', userData);
    console.log('Assigned Dogs:', assignedDogs);
    console.log('Volunteer Tasks:', volunteerTasks);
    console.log('Dashboard Data:', dashboardData);
    console.log('=====================');
  }, [userData, assignedDogs, volunteerTasks, dashboardData]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('No token found, user needs to login');
      setError('Please login to access the volunteer dashboard.');
      setLoading(false);
      return;
    }
    loadDashboardData();
  }, []);

  // Load volunteer management data when dashboard data is loaded
  useEffect(() => {
    if (dashboardData && userData) {
      loadVolunteerManagementData();
    }
  }, [dashboardData, userData]);

  // Task management functions
  const handleViewTaskDetails = (task) => {
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      console.log('Updating task status:', taskId, status);
      
      const response = await api.updateTaskStatus(taskId, status);
      console.log('Task status update response:', response);
      
      // Reload tasks
      const tasksResponse = await api.getVolunteerTasks();
      setVolunteerTasks(tasksResponse?.data || []);
      
      // Show success message
      alert(`Task marked as ${status}`);
      
    } catch (error) {
      console.error('Error updating task status:', error);
      
      let errorMessage = 'Failed to update task status';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      alert(errorMessage);
    }
  };

  

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const toggleEventRSVP = async (eventId) => {
    try {
      const event = events.find(e => e._id === eventId);
      if (!event) return;

      if (event.isRegistered) {
        await api.cancelEventRegistration(eventId);
      } else {
        await api.registerForEvent(eventId);
      }
      
      // Reload events data
      const eventsData = await api.getUpcomingEvents();
      setEvents(eventsData?.data?.events || []);
    } catch (error) {
      console.error('Error toggling event RSVP:', error);
      setError('Failed to update event registration');
    }
  };

  const markTaskComplete = async (taskId) => {
    try {
      await api.completeTask(taskId, 'Task completed successfully');
      
      // Reload tasks and dashboard data
      const tasksData = await api.getAssignedTasks();
      setAssignedTasks(tasksData?.data?.tasksByDog || []);
      
      const overviewData = await api.getDashboardOverview();
      setDashboardData(overviewData?.data || null);
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task');
    }
  };

  

  // Open health report modal
  const openHealthReportModal = (dog) => {
    setSelectedDogForModal(dog);
    setModalHealthReport({
      dogId: dog._id,
      eatingHabits: 'normal',
      mood: 'normal',
      weight: '',
      observations: '',
      photos: []
    });
    setShowHealthReportModal(true);
    setFormErrors({});
  };

  // Close health report modal
  const closeHealthReportModal = () => {
    setShowHealthReportModal(false);
    setSelectedDogForModal(null);
    setModalHealthReport({
      dogId: '',
      eatingHabits: 'normal',
      mood: 'normal',
      weight: '',
      observations: '',
      photos: []
    });
    setFormErrors({});
  };

  // Handle health report submission from modal
  const handleModalHealthReportSubmit = async () => {
    const errors = validateHealthReport(modalHealthReport);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      if (!modalHealthReport.dogId) {
        alert('Please select a dog');
        return;
      }

      const formData = api.createHealthReportFormData(modalHealthReport, modalHealthReport.photos || []);
      await api.submitHealthReport(formData);
      
      // Close modal and reload data
      closeHealthReportModal();
      
      const healthData = await api.getHealthReports();
      setHealthReports(healthData?.data?.reports || []);
      
      const overviewData = await api.getDashboardOverview();
      setDashboardData(overviewData?.data || null);
      
      alert('Health report submitted successfully!');
    } catch (error) {
      console.error('Error submitting health report:', error);
      setError('Failed to submit health report');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Original health report handler
  const handleHealthReportSubmit = async (dogId, reportData = null) => {
    const data = reportData || healthReport;
    const errors = validateHealthReport(data);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      const finalData = { ...data };
      
      if (!finalData.dogId && dogId) {
        finalData.dogId = dogId;
      }

      if (!finalData.dogId) {
        alert('Please select a dog');
        return;
      }

      const formData = api.createHealthReportFormData(finalData, finalData.photos || []);
      await api.submitHealthReport(formData);
      
      // Reset form and reload data
      setHealthReport({
        dogId: '',
        eatingHabits: 'normal',
        mood: 'normal',
        weight: '',
        observations: '',
        photos: []
      });
      
      const healthData = await api.getHealthReports();
      setHealthReports(healthData?.data?.reports || []);
      
      const overviewData = await api.getDashboardOverview();
      setDashboardData(overviewData?.data || null);
      
      alert('Health report submitted successfully!');
    } catch (error) {
      console.error('Error submitting health report:', error);
      setError('Failed to submit health report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewBlogPost = async () => {
    const errors = validateBlogPost(newBlogPost);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      if (!newBlogPost.title || !newBlogPost.content) {
        alert('Please fill in both title and content');
        return;
      }

      const formData = api.createBlogPostFormData(newBlogPost);
      await api.createBlogPost(formData);
      
      // Reset form and reload data
      setNewBlogPost({ title: '', content: '' });
      setShowNewPostForm(false);
      
      try {
        const blogData = await api.getBlogPosts();
        setBlogPosts(Array.isArray(blogData?.data?.posts) ? blogData.data.posts : []);
      } catch (reloadError) {
        console.error('Failed to reload blog posts after creation:', reloadError);
      }
      
      alert('Blog post submitted successfully!');
    } catch (error) {
      console.error('Error creating blog post:', error);
      setError('Failed to create blog post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWalkLog = async () => {
    const errors = validateWalkLog(walkLog);
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      if (!walkLog.dogId) {
        alert('Please select a dog');
        return;
      }

      console.log('Submitting walk data:', walkLog);

      const walkData = {
        dogId: walkLog.dogId,
        distance: parseFloat(walkLog.distance),
        duration: parseInt(walkLog.duration),
        activities: walkLog.activities,
        walkDate: walkLog.walkDate,
        walkTime: walkLog.walkTime,
        route: walkLog.route || '',
        notes: walkLog.notes || '',
        weather: walkLog.weather || '',
        walkQuality: walkLog.walkQuality || 'good',
        dogBehavior: walkLog.dogBehavior || 'calm',
        startTime: new Date(`${walkLog.walkDate}T${walkLog.walkTime}`).toISOString(),
        endTime: new Date(new Date(`${walkLog.walkDate}T${walkLog.walkTime}`).getTime() + parseInt(walkLog.duration) * 60000).toISOString()
      };

      console.log('Processed walk data:', walkData);

      const formData = api.createWalkFormData(walkData);
      
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      await api.logWalk(formData);
      
      // Reset form and reload data
      setWalkLog({
        dogId: '',
        distance: '',
        duration: '',
        activities: [],
        walkDate: new Date().toISOString().split('T')[0],
        walkTime: new Date().toTimeString().slice(0, 5),
        route: '',
        notes: '',
        weather: '',
        walkQuality: 'good',
        dogBehavior: 'calm',
        startTime: '',
        endTime: ''
      });
      
      // Reload walking data
      const walkDataUpdated = await api.getWalkingData();
      setWalkingData(walkDataUpdated?.data || { 
        walks: [], 
        statistics: {},
        totalDistance: 0,
        totalDuration: '0h 0m',
        uniqueDogs: 0,
        recentWalks: []
      });
      
      // Reload dashboard data
      const overviewData = await api.getDashboardOverview();
      setDashboardData(overviewData?.data || null);
      
      alert('Walk logged successfully!');
    } catch (error) {
      console.error('Error logging walk:', error);
      
      let errorMessage = 'Failed to log walk';
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error: Could not connect to server';
      } else {
        errorMessage = error.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBlogPost = async (postId) => {
    try {
      const postToEdit = blogPosts.find(post => post._id === postId);
      if (postToEdit) {
        setNewBlogPost({
          title: postToEdit.title || '',
          content: postToEdit.content || ''
        });
        setShowNewPostForm(true);
        
        // Scroll to the form
        setTimeout(() => {
          document.querySelector('.v-dash-new-post-form')?.scrollIntoView({ 
            behavior: 'smooth' 
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error preparing blog post for edit:', error);
      setError('Failed to load blog post for editing');
    }
  };

  const handleDeleteBlogPost = async (postId) => {
    try {
      if (window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
        await api.deleteBlogPost(postId);
        
        // Remove from local state immediately for better UX
        setBlogPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
        
        alert('Blog post deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      
      let errorMessage = 'Failed to delete blog post';
      if (error.message) {
        if (error.message.includes('Cannot delete blog post with status')) {
          errorMessage = 'Cannot delete published blog posts';
        } else if (error.message.includes('not found or you do not have permission')) {
          errorMessage = 'Blog post not found or you do not have permission to delete it';
        } else if (error.message.includes('Blog post not found')) {
          errorMessage = 'Blog post not found';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
      setError(errorMessage);
      
      // Reload blog posts to ensure consistency
      try {
        const blogData = await api.getBlogPosts();
        setBlogPosts(Array.isArray(blogData?.data?.posts) ? blogData.data.posts : []);
      } catch (reloadError) {
        console.error('Failed to reload blog posts:', reloadError);
      }
    }
  };

  // Update the handleDeleteHealthReport function
const handleDeleteHealthReport = async (reportId) => {
  try {
    if (window.confirm('Are you sure you want to delete this health report? This action cannot be undone.')) {
      await api.deleteHealthReport(reportId);
      
      // Remove from local state immediately for better UX
      setHealthReports(prevReports => prevReports.filter(report => report._id !== reportId));
      setSelectedDogHealthReports(prevReports => prevReports.filter(report => report._id !== reportId));
      
      // Reload health reports to ensure consistency
      const healthData = await api.getHealthReports();
      setHealthReports(healthData?.data?.reports || []);
      
      alert('Health report deleted successfully!');
    }
  } catch (error) {
    console.error('Error deleting health report:', error);
    let errorMessage = 'Failed to delete health report';
    
    if (error.message) {
      if (error.message.includes('not found')) {
        errorMessage = 'Health report not found or already deleted';
      } else if (error.message.includes('permission')) {
        errorMessage = 'You do not have permission to delete this health report';
      } else {
        errorMessage = error.message;
      }
    }
    
    alert(errorMessage);
    
    // Reload health reports to ensure consistency
    try {
      const healthData = await api.getHealthReports();
      setHealthReports(healthData?.data?.reports || []);
    } catch (reloadError) {
      console.error('Failed to reload health reports:', reloadError);
    }
  }
};

// Update the handleDeleteWalkLog function
const handleDeleteWalkLog = async (walkId) => {
  try {
    if (window.confirm('Are you sure you want to delete this walk log? This action cannot be undone.')) {
      await api.deleteWalkLog(walkId);
      
      // Remove from local state immediately for better UX
      setWalkingData(prevData => ({
        ...prevData,
        walks: (prevData.walks || []).filter(walk => walk._id !== walkId),
        recentWalks: (prevData.recentWalks || []).filter(walk => walk._id !== walkId)
      }));
      setSelectedDogRecentWalks(prevWalks => prevWalks.filter(walk => walk._id !== walkId));
      
      // Reload walking data to ensure consistency
      const walkDataUpdated = await api.getWalkingData();
      setWalkingData(walkDataUpdated?.data || { 
        walks: [], 
        statistics: {},
        totalDistance: 0,
        totalDuration: '0h 0m',
        uniqueDogs: 0,
        recentWalks: []
      });
      
      alert('Walk log deleted successfully!');
    }
  } catch (error) {
    console.error('Error deleting walk log:', error);
    let errorMessage = 'Failed to delete walk log';
    
    if (error.message) {
      if (error.message.includes('not found')) {
        errorMessage = 'Walk log not found or already deleted';
      } else if (error.message.includes('permission')) {
        errorMessage = 'You do not have permission to delete this walk log';
      } else {
        errorMessage = error.message;
      }
    }
    
    alert(errorMessage);
    
    // Reload walking data to ensure consistency
    try {
      const walkDataUpdated = await api.getWalkingData();
      setWalkingData(walkDataUpdated?.data || { 
        walks: [], 
        statistics: {},
        totalDistance: 0,
        totalDuration: '0h 0m',
        uniqueDogs: 0,
        recentWalks: []
      });
    } catch (reloadError) {
      console.error('Failed to reload walking data:', reloadError);
    }
  }
};

  const calculateTotalTime = (currentTime, newDuration) => {
    try {
      const [currentHours, currentMins] = currentTime.split('h ');
      const [newHours, newMins] = newDuration.split(':');
      
      const totalHours = parseInt(currentHours || 0) + parseInt(newHours || 0);
      const totalMins = parseInt(currentMins || 0) + parseInt(newMins || 0);
      
      return `${totalHours}h ${totalMins}m`;
    } catch (error) {
      console.error('Error calculating total time:', error);
      return currentTime;
    }
  };

  // Helper: robustly extract the dog id from a health report
  const getReportDogId = (report) => {
    if (!report) return '';
    if (report.dogId) {
      if (typeof report.dogId === 'string') return report.dogId;
      if (typeof report.dogId === 'object' && report.dogId._id) return report.dogId._id;
    }
    if (report.dog) {
      if (typeof report.dog === 'string') return report.dog;
      if (typeof report.dog === 'object' && (report.dog._id || report.dog.id)) return report.dog._id || report.dog.id;
    }
    return report.dog_id || report.dogID || '';
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
  };

  const handleDownloadReport = () => {
    alert('Downloading volunteer report...');
  };

  // Calculate assigned dogs health reports count
  const getAssignedDogsHealthReportsCount = () => {
    if (!assignedDogs.length || !healthReports.length) return 0;
    
    let count = 0;
    assignedDogs.forEach(assignment => {
      const dog = assignment.dogId || assignment;
      const dogReports = healthReports.filter(report => getReportDogId(report) === dog._id);
      count += dogReports.length;
    });
    
    return count;
  };

  // Calculate total volunteer hours from walks and tasks
  const calculateTotalVolunteerHours = () => {
    let totalHours = 0;
    
    // Calculate hours from walks
    const allWalks = walkingData.walks || walkingData.recentWalks || [];
    allWalks.forEach(walk => {
      if (walk.duration) {
        // Parse duration - could be in format like "30m", "1h", "1h 30m", etc.
        const duration = walk.duration.toString();
        
        // Handle different duration formats
        if (duration.includes('h') || duration.includes('m')) {
          // Format like "1h 30m"
          const hoursMatch = duration.match(/(\d+)h/);
          const minutesMatch = duration.match(/(\d+)m/);
          
          const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
          const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
          
          totalHours += hours + (minutes / 60);
        } else {
          // Assume it's just minutes
          totalHours += parseInt(duration) / 60;
        }
      }
    });
    
    // Add hours from completed tasks (assuming each task takes some time)
    const completedTasks = volunteerTasks.filter(task => task.status === 'completed');
    totalHours += completedTasks.length * 0.5; // Assume 30 minutes per task
    
    return Math.round(totalHours * 10) / 10; // Round to 1 decimal place
  };

  // Enhanced Statistics Display Component
  const StatisticsDisplay = () => {
    const totalVolunteerHours = calculateTotalVolunteerHours();
    const completedTasksCount = volunteerTasks.filter(task => task.status === 'completed').length;
    const totalDistance = dashboardData?.statistics?.totalDistance?.toFixed(1) || walkingData?.totalDistance?.toFixed(1) || 0;
    
    const stats = [
      {
        label: 'Total Volunteered',
        value: totalVolunteerHours,
        unit: 'hours',
        icon: <Clock size={24} />,
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      {
        label: 'Under Your Care',
        value: assignedDogs.length || 0,
        unit: 'dogs',
        icon: <PawPrint size={24} />,
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      {
        label: 'Completed This Month',
        value: completedTasksCount,
        unit: 'tasks',
        icon: <CheckCircle size={24} />,
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      },
      {
        label: 'Total Walked',
        value: totalDistance,
        unit: 'km',
        icon: <TrendingUp size={24} />,
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      }
    ];

    return (
      <div className="v-dash-stats-grid-enhanced">
        {stats.map((stat, index) => (
          <div key={index} className="v-dash-stat-card-enhanced">
            <div 
              className="v-dash-stat-icon-enhanced"
              style={{ background: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="v-dash-stat-info-enhanced">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
              <span className="v-dash-stat-unit">{stat.unit}</span>
            </div>
            <div className="v-dash-stat-progress">
              <div 
                className="v-dash-progress-bar"
                style={{ 
                  width: `${Math.min((stat.value / (stat.unit === 'hours' ? 100 : stat.unit === 'dogs' ? 10 : stat.unit === 'tasks' ? 50 : 100)) * 100, 100)}%`,
                  background: stat.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Activity Chart Component
  const ActivityChart = () => {
    const activities = [
      { name: 'Health Reports', count: getAssignedDogsHealthReportsCount(), color: '#3b82f6' },
      { name: 'Blog Posts', count: blogPosts.length, color: '#10b981' },
      { name: 'Walks Logged', count: walkingData?.statistics?.totalWalks || walkingData?.walks?.length || 0, color: '#f59e0b' }
    ];

    return (
      <div className="v-dash-activity-chart">
        <h3>Your Activity Overview</h3>
        <div className="v-dash-chart-container">
          {activities.map((activity, index) => (
            <div key={index} className="v-dash-chart-item">
              <div className="v-dash-chart-bar-container">
                <div 
                  className="v-dash-chart-bar"
                  style={{ 
                    height: `${Math.min((activity.count / 20) * 100, 100)}%`,
                    backgroundColor: activity.color
                  }}
                ></div>
              </div>
              <div className="v-dash-chart-label">
                <span>{activity.name}</span>
                <strong>{activity.count}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Recent Activity Component
  const RecentActivity = () => {
    const recentActivities = [
      ...(walkingData?.recentWalks?.slice(0, 3).map(walk => ({
        type: 'walk',
        title: `Walked ${walk.dog?.name || 'a dog'}`,
        description: `${typeof walk.distance === 'number' ? walk.distance.toFixed(1) : walk.distance} km • ${walk.duration}`,
        
        icon: <MapPin size={16} />,
        color: '#10b981'
      })) || []),
      ...(healthReports.slice(0, 2).map(report => ({
        type: 'health',
        title: 'Health Report Submitted',
        description: `For ${report.dogId?.name || 'a dog'}`,
        time: new Date(report.date || report.createdAt).toLocaleDateString(),
        icon: <Heart size={16} />,
        color: '#3b82f6'
      }))),
      ...(blogPosts.slice(0, 2).map(post => ({
        type: 'blog',
        title: 'Blog Post Created',
        description: post.title,
        time: new Date(post.createdAt).toLocaleDateString(),
        icon: <Edit3 size={16} />,
        color: '#f59e0b'
      })))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    return (
      <div className="v-dash-recent-activity">
        <h3>Recent Activity</h3>
        <div className="v-dash-activity-list">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="v-dash-activity-item">
                <div 
                  className="v-dash-activity-icon"
                  style={{ backgroundColor: activity.color }}
                >
                  {activity.icon}
                </div>
                <div className="v-dash-activity-content">
                  <h4>{activity.title}</h4>
                  <p>{activity.description}</p>
                  <span className="v-dash-activity-time">{activity.time}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="v-dash-no-activity">No recent activity to display</p>
          )}
        </div>
      </div>
    );
  };

  // Render Health Reports Modal
  const renderHealthReportsModal = () => (
    showHealthReportsModal && selectedDogForHealthReports && (
      <div className="v-dash-modal-overlay">
        <div className="v-dash-modal" style={{ maxWidth: '800px', maxHeight: '90vh' }}>
          <div className="v-dash-modal-header">
            <h3>Health Reports for {selectedDogForHealthReports.name}</h3>
            <button 
              className="v-dash-modal-close"
              onClick={closeHealthReportsModal}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="v-dash-modal-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {selectedDogHealthReports.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedDogHealthReports
                  .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
                  .map((report, index) => (
                  <div 
                    key={report._id || index}
                    style={{
                      padding: '16px',
                      border: '1px solid #c58d16ff',
                      borderRadius: '12px',
                      backgroundColor: '#fcfaf5ff',
                      position: 'relative'
                    }}
                  >
                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDeleteHealthReport(report._id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      title="Delete this health report"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                      paddingRight: '40px'
                    }}>
                      <h4 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        Report from {new Date(report.date || report.createdAt).toLocaleDateString()}
                      </h4>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#dbeafe',
                        color: '#3b82f6',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {report.status || 'Submitted'}
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <strong style={{ color: '#0f958aff', fontSize: '0.875rem' }}>Eating Habits:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#1f2937' }}>
                          {report.eatingHabits || 'Not specified'}
                        </p>
                      </div>
                      
                      <div>
                        <strong style={{ color: '#0f958aff', fontSize: '0.875rem' }}>Mood:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#1f2937' }}>
                          {report.mood || 'Not specified'}
                        </p>
                      </div>
                      
                      {report.weight && (
                        <div>
                          <strong style={{ color: '#0f958aff', fontSize: '0.875rem' }}>Weight:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#1f2937' }}>
                            {report.weight} kg
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {report.observations && (
                      <div>
                        <strong style={{ color: '#0f958aff', fontSize: '0.875rem' }}>Observations:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#1f2937', lineHeight: '1.5' }}>
                          {report.observations}
                        </p>
                      </div>
                    )}
                    
                    {report.photos && report.photos.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        <strong style={{ color: '#0f958aff', fontSize: '0.875rem' }}>Photos:</strong>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                          {report.photos.map((photo, photoIndex) => (
                            <img 
                              key={photoIndex}
                              src={typeof photo === 'string' ? `http://localhost:3000/uploads/health-reports/${photo}` : URL.createObjectURL(photo)}
                              alt={`Health report ${index + 1}`}
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid #1e714aff'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#0f958aff'
              }}>
                <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h4 style={{ margin: '0 0 8px 0', color: '#0f958aff' }}>No Health Reports</h4>
                <p style={{ margin: 0 }}>No health reports have been submitted for this dog yet.</p>
              </div>
            )}
          </div>
          
          <div className="v-dash-modal-actions">
            <button 
              className="v-dash-secondary-btn"
              onClick={closeHealthReportsModal}
            >
              Close
            </button>
            <button 
              className="v-dash-primary-btn"
              onClick={() => {
                closeHealthReportsModal();
                openHealthReportModal(selectedDogForHealthReports);
              }}
            >
              Submit New Report
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render Recent Walks Modal
  const renderRecentWalksModal = () => (
    showRecentWalksModal && selectedDogForRecentWalks && (
      <div className="v-dash-modal-overlay">
        <div className="v-dash-modal" style={{ maxWidth: '800px', maxHeight: '90vh' }}>
          <div className="v-dash-modal-header">
            <h3>Recent Walks for {selectedDogForRecentWalks.name}</h3>
            <button 
              className="v-dash-modal-close"
              onClick={closeRecentWalksModal}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="v-dash-modal-content" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {selectedDogRecentWalks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedDogRecentWalks.map((walk, index) => (
                  <div 
                    key={walk._id || index}
                    style={{
                      padding: '16px',
                      border: '1px solid #083d83ff',
                      borderRadius: '12px',
                      backgroundColor: '#f0f7feff',
                      position: 'relative'
                    }}
                  >
                    {/* Delete Button */}
                    <button 
                      onClick={() => handleDeleteWalkLog(walk._id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      title="Delete this walk log"
                    >
                      <Trash2 size={14} />
                    </button>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                      paddingRight: '40px'
                    }}>
                      <h4 style={{ 
                        fontSize: '1.1rem', 
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0
                      }}>
                        Walk on {new Date(walk.date || walk.createdAt).toLocaleDateString()}
                      </h4>
                      <span style={{
                        padding: '4px 8px',
                        backgroundColor: '#dcfce7',
                        color: '#163065ff',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {typeof walk.distance === 'number' ? walk.distance.toFixed(1) : walk.distance} km
                      </span>
                    </div>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <strong style={{ color: '#158d7dff', fontSize: '0.875rem' }}>Duration:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#1f2937' }}>
                          {walk.duration || 'Not specified'}
                        </p>
                      </div>
                      
                      <div>
                        <strong style={{ color: '#158d7dff', fontSize: '0.875rem' }}>Route:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#1f2937' }}>
                          {walk.route || 'Not specified'}
                        </p>
                      </div>
                      
                      {walk.weather && (
                        <div>
                          <strong style={{ color: '#158d7dff', fontSize: '0.875rem' }}>Weather:</strong>
                          <p style={{ margin: '4px 0 0 0', color: '#1f2937' }}>
                            {walk.weather}
                          </p>
                        </div>
                      )}
                    </div>

                    {walk.walkQuality && (
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#158d7dff', fontSize: '0.875rem' }}>Walk Quality:</strong>
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          backgroundColor: 
                            walk.walkQuality === 'excellent' ? '#dcfce7' : 
                            walk.walkQuality === 'good' ? '#dbeafe' : 
                            walk.walkQuality === 'fair' ? '#fef3c7' : 
                            '#fef2f2',
                          color: 
                            walk.walkQuality === 'excellent' ? '#166534' : 
                            walk.walkQuality === 'good' ? '#1e40af' : 
                            walk.walkQuality === 'fair' ? '#92400e' : 
                            '#dc2626',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {walk.walkQuality}
                        </span>
                      </div>
                    )}
                    <br></br>

                    {walk.dogBehavior && (
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#158d7dff', fontSize: '0.875rem' }}>Dog Behavior:</strong>
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          backgroundColor: '#f3e8ff',
                          color: '#7c3aed',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {walk.dogBehavior}
                        </span>
                      </div>
                    )}
                    <br></br>

                    {walk.activities && walk.activities.length > 0 && (
                      <div style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#158d7dff', fontSize: '0.875rem' }}>Activities:</strong>
                        <div style={{ display: 'flex', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {walk.activities.map((activity, activityIndex) => (
                            <span 
                              key={activityIndex}
                              style={{
                                padding: '2px 6px',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: '500'
                              }}
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}<br></br>
                    
                    {walk.notes && (
                      <div>
                        <strong style={{ color: '#158d7dff', fontSize: '0.875rem' }}>Notes:</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#1f2937', lineHeight: '1.5' }}>
                          {walk.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px 20px',
                color: '#64748b'
              }}>
                <MapPin size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h4 style={{ margin: '0 0 8px 0', color: '#64748b' }}>No Recent Walks</h4>
                <p style={{ margin: 0 }}>No walks have been logged for this dog yet.</p>
              </div>
            )}
          </div>
          
          <div className="v-dash-modal-actions">
            <button 
              className="v-dash-secondary-btn"
              onClick={closeRecentWalksModal}
            >
              Close
            </button>
            <button 
              className="v-dash-primary-btn"
              onClick={() => {
                closeRecentWalksModal();
                openWalkLogModal(selectedDogForRecentWalks);
              }}
            >
              Log New Walk
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render Quick Walk Modal
  const renderQuickWalkModal = () => (
    showQuickWalkModal && selectedDogForWalk && (
      <div className="v-dash-modal-overlay">
        <div className="v-dash-modal" style={{ maxWidth: '600px' }}>
          <div className="v-dash-modal-header">
            <h3>Log Walk for {selectedDogForWalk.name}</h3>
            <button 
              className="v-dash-modal-close"
              onClick={closeQuickWalkModal}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="v-dash-modal-content">
            <div className="v-dash-modal-dog-info">
              <img 
                src={selectedDogForWalk.photo ? `http://localhost:3000/uploads/dogs/${selectedDogForWalk.photo}` : 'https://placedog.net/300/300?id=1'} 
                alt={selectedDogForWalk.name}
              />
              <div>
                <h4>{selectedDogForWalk.name}</h4>
                <p>{selectedDogForWalk.breed || 'Mixed Breed'} • {selectedDogForWalk.age || 'Unknown age'}</p>
              </div>
            </div>
            
            <div className="v-dash-form-row">
              <div className="v-dash-form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={quickWalkLog.walkDate}
                  onChange={(e) => setQuickWalkLog({...quickWalkLog, walkDate: e.target.value})}
                />
                {formErrors.walkDate && <span className="v-dash-form-error">{formErrors.walkDate}</span>}
              </div>
              
              <div className="v-dash-form-group">
                <label>Time</label>
                <input 
                  type="time" 
                  value={quickWalkLog.walkTime}
                  onChange={(e) => setQuickWalkLog({...quickWalkLog, walkTime: e.target.value})}
                />
                {formErrors.walkTime && <span className="v-dash-form-error">{formErrors.walkTime}</span>}
              </div>
            </div>
            
            <div className="v-dash-form-row">
              <div className="v-dash-form-group">
                <label>Distance (km)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={quickWalkLog.distance}
                  onChange={(e) => setQuickWalkLog({...quickWalkLog, distance: e.target.value})}
                  placeholder="0.0"
                />
                {formErrors.distance && <span className="v-dash-form-error">{formErrors.distance}</span>}
              </div>
              
              <div className="v-dash-form-group">
                <label>Duration (minutes)</label>
                <input 
                  type="number" 
                  value={quickWalkLog.duration}
                  onChange={(e) => setQuickWalkLog({...quickWalkLog, duration: e.target.value})}
                  placeholder="30"
                />
                {formErrors.duration && <span className="v-dash-form-error">{formErrors.duration}</span>}
              </div>
            </div>

            <div className="v-dash-form-group">
              <label>Route/Location</label>
              <input 
                type="text" 
                value={quickWalkLog.route}
                onChange={(e) => setQuickWalkLog({...quickWalkLog, route: e.target.value})}
                placeholder="e.g., Park trail, neighborhood streets..."
              />
            </div>

            <div className="v-dash-form-group">
              <label>Activities</label>
              {formErrors.activities && <span className="v-dash-form-error">{formErrors.activities}</span>}
              <div className="v-dash-checkbox-group">
                <label className="v-dash-checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={quickWalkLog.activities.includes('exercise')}
                    onChange={(e) => {
                      const activities = [...quickWalkLog.activities];
                      if (e.target.checked) {
                        activities.push('exercise');
                      } else {
                        const index = activities.indexOf('exercise');
                        if (index > -1) activities.splice(index, 1);
                      }
                      setQuickWalkLog({...quickWalkLog, activities});
                    }}
                  />
                  <span>Exercise</span>
                </label>
                
                <label className="v-dash-checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={quickWalkLog.activities.includes('play')}
                    onChange={(e) => {
                      const activities = [...quickWalkLog.activities];
                      if (e.target.checked) {
                        activities.push('play');
                      } else {
                        const index = activities.indexOf('play');
                        if (index > -1) activities.splice(index, 1);
                      }
                      setQuickWalkLog({...quickWalkLog, activities});
                    }}
                  />
                  <span>Play</span>
                </label>
                
                <label className="v-dash-checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={quickWalkLog.activities.includes('training')}
                    onChange={(e) => {
                      const activities = [...quickWalkLog.activities];
                      if (e.target.checked) {
                        activities.push('training');
                      } else {
                        const index = activities.indexOf('training');
                        if (index > -1) activities.splice(index, 1);
                      }
                      setQuickWalkLog({...quickWalkLog, activities});
                    }}
                  />
                  <span>Training</span>
                </label>
              </div>
            </div>
            
            <div className="v-dash-form-group">
              <label>Notes</label>
              <textarea 
                value={quickWalkLog.notes}
                onChange={(e) => setQuickWalkLog({...quickWalkLog, notes: e.target.value})}
                placeholder="Any observations during the walk..."
                rows="3"
              ></textarea>
            </div>
          </div>
          
          <div className="v-dash-modal-actions">
            <button 
              className="v-dash-secondary-btn"
              onClick={closeQuickWalkModal}
            >
              Cancel
            </button>
            <button 
              className="v-dash-primary-btn"
              onClick={handleQuickWalkSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging...' : 'Log Walk'}
            </button>
          </div>
        </div>
      </div>
    )
  );

  // NEW: Render Walk Log Modal
  const renderWalkLogModal = () => (
    showWalkLogModal && selectedDogForWalkLog && (
      <div className="v-dash-modal-overlay">
        <div className="v-dash-modal" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="v-dash-modal-header">
            <h3>Log Walk for {selectedDogForWalkLog.name}</h3>
            <button 
              className="v-dash-modal-close"
              onClick={closeWalkLogModal}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="v-dash-modal-content">
            <div className="v-dash-modal-dog-info">
              <img 
                src={selectedDogForWalkLog.photo ? `http://localhost:3000/uploads/dogs/${selectedDogForWalkLog.photo}` : 'https://placedog.net/300/300?id=1'} 
                alt={selectedDogForWalkLog.name}
              />
              <div>
                <h4>{selectedDogForWalkLog.name}</h4>
                <p>{selectedDogForWalkLog.breed || 'Mixed Breed'} • {selectedDogForWalkLog.age || 'Unknown age'}</p>
              </div>
            </div>
            
            <div className="v-dash-walk-form">
              <div className="v-dash-form-row">
                <div className="v-dash-form-group">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={walkLog.walkDate}
                    onChange={(e) => setWalkLog({...walkLog, walkDate: e.target.value})}
                  />
                  {formErrors.walkDate && <span className="v-dash-form-error">{formErrors.walkDate}</span>}
                </div>
                
                <div className="v-dash-form-group">
                  <label>Time</label>
                  <input 
                    type="time" 
                    value={walkLog.walkTime}
                    onChange={(e) => setWalkLog({...walkLog, walkTime: e.target.value})}
                  />
                  {formErrors.walkTime && <span className="v-dash-form-error">{formErrors.walkTime}</span>}
                </div>
              </div>
              
              <div className="v-dash-form-row">
                <div className="v-dash-form-group">
                  <label>Distance (km)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={walkLog.distance}
                    onChange={(e) => setWalkLog({...walkLog, distance: e.target.value})}
                    placeholder="0.0"
                  />
                  {formErrors.distance && <span className="v-dash-form-error">{formErrors.distance}</span>}
                </div>
                
                <div className="v-dash-form-group">
                  <label>Duration (minutes)</label>
                  <input 
                    type="number" 
                    value={walkLog.duration}
                    onChange={(e) => setWalkLog({...walkLog, duration: e.target.value})}
                    placeholder="30"
                  />
                  {formErrors.duration && <span className="v-dash-form-error">{formErrors.duration}</span>}
                </div>
              </div>

              <div className="v-dash-form-group">
                <label>Route/Location</label>
                <input 
                  type="text" 
                  value={walkLog.route}
                  onChange={(e) => setWalkLog({...walkLog, route: e.target.value})}
                  placeholder="e.g., Park trail, neighborhood streets..."
                />
              </div>

              <div className="v-dash-form-row">
                <div className="v-dash-form-group">
                  <label>Weather</label>
                  <select 
                    value={walkLog.weather}
                    onChange={(e) => setWalkLog({...walkLog, weather: e.target.value})}
                  >
                    <option value="">Select weather</option>
                    <option value="sunny">Sunny</option>
                    <option value="cloudy">Cloudy</option>
                    <option value="rainy">Rainy</option>
                    <option value="snowy">Snowy</option>
                    <option value="windy">Windy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="v-dash-form-group">
                  <label>Walk Quality</label>
                  <select 
                    value={walkLog.walkQuality}
                    onChange={(e) => setWalkLog({...walkLog, walkQuality: e.target.value})}
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="v-dash-form-group">
                <label>Dog Behavior</label>
                <select 
                  value={walkLog.dogBehavior}
                  onChange={(e) => setWalkLog({...walkLog, dogBehavior: e.target.value})}
                >
                  <option value="calm">Calm</option>
                  <option value="excited">Excited</option>
                  <option value="anxious">Anxious</option>
                  <option value="aggressive">Aggressive</option>
                  <option value="playful">Playful</option>
                  <option value="tired">Tired</option>
                </select>
              </div>
              
              <div className="v-dash-form-group">
                <label>Activities</label>
                {formErrors.activities && <span className="v-dash-form-error">{formErrors.activities}</span>}
                <div className="v-dash-checkbox-group">
                  <label className="v-dash-checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={walkLog.activities.includes('exercise')}
                      onChange={(e) => {
                        const activities = [...walkLog.activities];
                        if (e.target.checked) {
                          activities.push('exercise');
                        } else {
                          const index = activities.indexOf('exercise');
                          if (index > -1) activities.splice(index, 1);
                        }
                        setWalkLog({...walkLog, activities});
                      }}
                    />
                    <span>Exercise</span>
                  </label>
                  
                  <label className="v-dash-checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={walkLog.activities.includes('play')}
                      onChange={(e) => {
                        const activities = [...walkLog.activities];
                        if (e.target.checked) {
                          activities.push('play');
                        } else {
                          const index = activities.indexOf('play');
                          if (index > -1) activities.splice(index, 1);
                        }
                        setWalkLog({...walkLog, activities});
                      }}
                    />
                    <span>Play</span>
                  </label>
                  
                  <label className="v-dash-checkbox-item">
                    <input 
                      type="checkbox" 
                      checked={walkLog.activities.includes('training')}
                      onChange={(e) => {
                        const activities = [...walkLog.activities];
                        if (e.target.checked) {
                          activities.push('training');
                        } else {
                          const index = activities.indexOf('training');
                          if (index > -1) activities.splice(index, 1);
                        }
                        setWalkLog({...walkLog, activities});
                      }}
                    />
                    <span>Training</span>
                  </label>
                </div>
              </div>
              
              <div className="v-dash-form-group">
                <label>Notes</label>
                <textarea 
                  value={walkLog.notes}
                  onChange={(e) => setWalkLog({...walkLog, notes: e.target.value})}
                  placeholder="Any observations during the walk..."
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="v-dash-modal-actions">
            <button 
              className="v-dash-secondary-btn"
              onClick={closeWalkLogModal}
            >
              Cancel
            </button>
            <button 
              className="v-dash-primary-btn"
              onClick={handleWalkLog}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging...' : 'Log Walk'}
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Render Task Details Modal
  const renderTaskDetailsModal = () => (
    showTaskDetails && selectedTask && (
      <div className="v-dash-modal-overlay">
        <div className="v-dash-modal">
          <div className="v-dash-modal-header">
            <h3>Task Details</h3>
            <button 
              className="v-dash-modal-close"
              onClick={() => setShowTaskDetails(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="v-dash-modal-content">
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                {selectedTask.taskType}
              </h4>
              <span style={{
                padding: '4px 12px',
                backgroundColor: 
                  selectedTask.status === 'completed' ? '#dcfce7' : 
                  selectedTask.status === 'in-progress' ? '#dbeafe' : 
                  '#fef3c7',
                color: 
                  selectedTask.status === 'completed' ? '#166534' : 
                  selectedTask.status === 'in-progress' ? '#1e40af' : 
                  '#92400e',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {selectedTask.status}
              </span>
            </div>
            
            {selectedTask.taskDescription && (
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#07869dff',
                  marginBottom: '8px'
                }}>
                  Description:
                </h5>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0',
                  lineHeight: '1.5'
                }}>
                  {selectedTask.taskDescription}
                </p>
              </div>
            )}<br></br>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <h5 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#07869dff',
                  marginBottom: '4px'
                }}>
                  Scheduled Time:
                </h5>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {selectedTask.scheduledTime ? new Date(selectedTask.scheduledTime).toLocaleString() : 'Not scheduled'}
                </p>
              </div><br></br><br></br><br></br>
              
              <div>
                <h5 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#07869dff',
                  marginBottom: '4px'
                }}>
                  Priority:
                </h5>
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: 
                    selectedTask.priority === 'high' ? '#fef2f2' : 
                    selectedTask.priority === 'medium' ? '#fffbeb' : 
                    '#f0fdf4',
                  color: 
                    selectedTask.priority === 'high' ? '#dc2626' : 
                    selectedTask.priority === 'medium' ? '#d97706' : 
                    '#16a34a',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {selectedTask.priority || 'Normal'}
                </span>
              </div>
            </div><br></br>
            
            {selectedTask.estimatedDuration && (
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#07869dff',
                  marginBottom: '4px'
                }}>
                  Estimated Duration:
                </h5>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {selectedTask.estimatedDuration} minutes
                </p>
              </div>
            )}
            
            {selectedTask.assignedDate && (
              <div>
                <h5 style={{ 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '4px'
                }}>
                  Assigned Date
                </h5>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0'
                }}>
                  {new Date(selectedTask.assignedDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          
          <div className="v-dash-modal-actions">
            <button 
              className="v-dash-secondary-btn"
              onClick={() => setShowTaskDetails(false)}
            >
              Close
            </button>
            {selectedTask.status !== 'completed' && (
              <button 
                className="v-dash-primary-btn"
                onClick={() => {
                  handleUpdateTaskStatus(selectedTask._id, 'completed');
                  setShowTaskDetails(false);
                }}
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );

  // Render Volunteer Management Section
  const renderVolunteerManagement = () => {
    return (
      <section className="v-dash-section">
        <div className="v-dash-section-header">
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            background: 'linear-gradient(135deg, #7a8bd9ff 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            👥 My Assignments
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#64748b',
            fontWeight: '400'
          }}>
            Manage your assigned dogs and tasks
          </p>
        </div><br></br>

        {/* Assigned Dogs Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    fontSize: '1.9rem',
    fontWeight: 700,
    marginBottom: '28px',
    color: '#1f2937',
    position: 'relative',
    letterSpacing: '-0.5px',
    padding: '14px 0',
    background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
     WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 2px 8px rgba(37, 117, 252, 0.25)',
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48px',
      height: '48px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      boxShadow: '0 6px 14px rgba(37, 117, 252, 0.4)',
      transform: 'rotate(-5deg)',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)')}
    onMouseLeave={(e) => (e.currentTarget.style.transform = 'rotate(-5deg)')}
  >
    <PawPrint size={26} color="white" />
  </div>

  <span
    style={{
      flexGrow: 1,
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '6px',
      
      borderRadius: '4px',
    }}
  >
    My Assigned Dogs
  </span>
</h3>

          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '20px'
          }}>
            {assignedDogs.length > 0 ? assignedDogs.map((assignment) => {
              const dog = assignment.dogId || assignment;
              return (
                <div 
                  key={dog._id}
                  style={{
                    background: 'linear-gradient(145deg, #ffffffff 0%, #ffffffff 100%)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    border: 'black'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    padding: '4px 12px',
                    backgroundColor: '#dbeafe',
                    color: '#3b82f6',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Assigned
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <img 
                      src={dog.photo ? `http://localhost:3000/uploads/dogs/${dog.photo}` : 'https://placedog.net/300/300?id=1'} 
                      alt={dog.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #ffffff',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700',
                        color: '#1f2937',
                        margin: '0 0 4px 0'
                      }}>
                        {dog.name}
                      </h4>
                      <p style={{ 
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        margin: '0 0 8px 0'
                      }}>
                        {dog.breed || 'Mixed Breed'} • {dog.age || 'Unknown age'}
                      </p>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        backgroundColor: dog.healthStatus?.toLowerCase() === 'healthy' ? '#dcfce7' : '#fef3c7',
                        color: dog.healthStatus?.toLowerCase() === 'healthy' ? '#166534' : '#d97706',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: dog.healthStatus?.toLowerCase() === 'healthy' ? '#10b981' : '#f59e0b'
                        }} />
                        {dog.healthStatus || 'Unknown Health'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <button 
                      onClick={() => openHealthReportModal(dog)}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#3876dbff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
                    >
                      <Plus size={14} />
                      Health Report
                    </button>
                    
                    <button 
                      onClick={() => openWalkLogModal(dog)}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#0da371ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      <MapPin size={14} />
                      Log Walk
                    </button>
                  </div>

                  {/* View Reports and Walks Buttons */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <button 
                      onClick={() => openHealthReportsModal(dog)}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'transparent',
                        color: '#4d5971ff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.color = '#374151';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                      }}
                    >
                      <FileText size={14} />
                      View Health Reports
                    </button>

                    <button 
                      onClick={() => openRecentWalksModal(dog)}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'transparent',
                        color: '#475063ff',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f9fafb';
                        e.target.style.color = '#374151';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#6b7280';
                      }}
                    >
                      <MapPin size={14} />
                      View Recent Walks
                    </button>
                  </div>

                  {/* Recent Health Summary */}
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ 
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        color: '#374151'
                      }}>
                        Recent Health
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        {healthReports.filter(r => getReportDogId(r) === dog._id).length} reports
                      </span>
                    </div>
                    
                    {healthReports.filter(r => getReportDogId(r) === dog._id).length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {healthReports
                          .filter(r => getReportDogId(r) === dog._id)
                          .sort((a,b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
                          .slice(0, 2)
                          .map((report, index) => (
                          <div 
                            key={report._id || index}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '6px 8px',
                              backgroundColor: '#f0f7ffff',
                              borderRadius: '6px',
                              fontSize: '0.75rem'
                            }}
                          >
                            <span style={{ color: '#64748b' }}>
                              {new Date(report.date || report.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              {report.eatingHabits && (
                                <span style={{
                                  padding: '2px 4px',
                                  backgroundColor: '#dbeafe',
                                  color: '#3b82f6',
                                  borderRadius: '4px',
                                  fontSize: '0.6rem'
                                }}>
                                  E: {report.eatingHabits.charAt(0)}
                                </span>
                              )}
                              {report.mood && (
                                <span style={{
                                  padding: '2px 4px',
                                  backgroundColor: '#fef3c7',
                                  color: '#f59e0b',
                                  borderRadius: '4px',
                                  fontSize: '0.6rem'
                                }}>
                                  M: {report.mood.charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ 
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        margin: 0,
                        fontStyle: 'italic',
                        textAlign: 'center'
                      }}>
                        No health reports yet
                      </p>
                    )}
                  </div>

{/* Recent Walks Summary */}
<div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #215b96ff' }}>
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  }}>
    <span style={{ 
      fontSize: '0.8rem',
      fontWeight: '600',
      color: '#102a52ff'
    }}>
      Recent Walks
    </span>
    <span style={{ 
      fontSize: '0.75rem',
      color: '#6b7280'
    }}>
      {/* Get walks for this specific dog from walkingData */}
      {(walkingData.walks || walkingData.recentWalks || []).filter(walk => {
        const walkDogId = walk.dogId?._id || walk.dogId || walk.dog?._id || walk.dog;
        return walkDogId === dog._id;
      }).length} walks
    </span>
  </div>
  
  {/* Get walks for this specific dog from walkingData */}
  {(walkingData.walks || walkingData.recentWalks || []).filter(walk => {
    const walkDogId = walk.dogId?._id || walk.dogId || walk.dog?._id || walk.dog;
    return walkDogId === dog._id;
  }).length > 0 ? (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {(walkingData.walks || walkingData.recentWalks || [])
        .filter(walk => {
          const walkDogId = walk.dogId?._id || walk.dogId || walk.dog?._id || walk.dog;
          return walkDogId === dog._id;
        })
        .sort((a,b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
        .slice(0, 2)
        .map((walk, index) => (
        <div 
          key={walk._id || index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 8px',
            backgroundColor: '#e0fbe8ff',
            borderRadius: '6px',
            fontSize: '0.75rem'
          }}
        >
          <span style={{ color: '#64748b' }}>
            {new Date(walk.date || walk.createdAt || Date.now()).toLocaleDateString()}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={{
              padding: '2px 4px',
              backgroundColor: '#dbeafe',
              color: '#3b82f6',
              borderRadius: '4px',
              fontSize: '0.6rem',
              fontWeight: '600'
            }}>
              {typeof walk.distance === 'number' ? walk.distance.toFixed(1) : walk.distance}km
            </span>
            <span style={{
              padding: '2px 4px',
              backgroundColor: '#fef3c7',
              color: '#f59e0b',
              borderRadius: '4px',
              fontSize: '0.6rem'
            }}>
              {walk.duration}
            </span>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p style={{ 
      fontSize: '0.75rem',
      color: '#9ca3af',
      margin: 0,
      fontStyle: 'italic',
      textAlign: 'center'
    }}>
      No recent walks yet
    </p>
  )}
</div>
                </div>
              );
            }) : (
              <div style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                border: '2px dashed #e5e7eb',
                gridColumn: '1 / -1'
              }}>
                <PawPrint size={48} color="#9ca3af" />
                <h4 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600',
                  color: '#6b7280',
                  margin: '16px 0 8px 0'
                }}>
                  No Dogs Assigned
                </h4>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#9ca3af',
                  margin: '0'
                }}>
                  You haven't been assigned any dogs yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div>
         <h3
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    fontSize: '1.9rem',
    fontWeight: 700,
    marginBottom: '28px',
    color: '#1f2937',
    position: 'relative',
    letterSpacing: '-0.5px',
    padding: '14px 0',
    background: 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    textShadow: '0 2px 8px rgba(37, 117, 252, 0.25)',
  }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '44px',
      borderRadius: '12px',
       background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
      boxShadow: '0 4px 10px rgba(59, 130, 246, 0.35)',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.07) rotate(3deg)')}
    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1) rotate(0deg)')}
  >
    <ClipboardList size={24} color="white" />
  </div>
  My Tasks
</h3>

          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '20px'
          }}>
            {volunteerTasks.length > 0 ? volunteerTasks.map((task) => (
              <div 
                key={task._id}
                style={{
                  background: 'linear-gradient(145deg, #eafffdff 0%, #f8fafc 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease',
                  borderLeft: `4px solid ${
                    task.status === 'completed' ? '#10b981' : 
                    task.status === 'in-progress' ? '#3b82f6' : 
                    '#f59e0b'
                  }`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <h4 style={{ 
                    fontSize: '1.125rem', 
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0'
                  }}>
                    {task.taskType}
                  </h4>
                  <span style={{
                    padding: '4px 12px',
                    backgroundColor: 
                      task.status === 'completed' ? '#dcfce7' : 
                      task.status === 'in-progress' ? '#dbeafe' : 
                      '#fef3c7',
                    color: 
                      task.status === 'completed' ? '#166534' : 
                      task.status === 'in-progress' ? '#1e40af' : 
                      '#92400e',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {task.status}
                  </span>
                </div>
                
                {task.taskDescription && (
                  <p style={{ 
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    marginBottom: '12px',
                    lineHeight: '1.4'
                  }}>
                    {task.taskDescription}
                  </p>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div>
                    <p style={{ 
                      fontSize: '0.75rem',
                      color: '#9ca3af',
                      margin: '0 0 4px 0'
                    }}>
                      Scheduled
                    </p>
                    <p style={{ 
                      fontSize: '0.875rem',
                      color: '#374151',
                      margin: '0',
                      fontWeight: '500'
                    }}>
                      {task.scheduledTime ? new Date(task.scheduledTime).toLocaleString() : 'Not scheduled'}
                    </p>
                  </div>
                  
                  {task.priority && (
                    <div>
                      <p style={{ 
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        margin: '0 0 4px 0',
                        textAlign: 'right'
                      }}>
                        Priority
                      </p>
                      <span style={{
                        padding: '2px 8px',
                        backgroundColor: 
                          task.priority === 'high' ? '#fef2f2' : 
                          task.priority === 'medium' ? '#fffbeb' : 
                          '#f0fdf4',
                        color: 
                          task.priority === 'high' ? '#dc2626' : 
                          task.priority === 'medium' ? '#d97706' : 
                          '#16a34a',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {task.priority}
                      </span>
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  justifyContent: 'flex-end'
                }}>
                  <button 
                    onClick={() => handleViewTaskDetails(task)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.color = '#374151';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#6b7280';
                    }}
                  >
                    <Eye size={12} style={{ marginRight: '4px' }} />
                    Details
                  </button>
                  
                  {task.status !== 'completed' && (
                    <button 
                      onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                border: '2px dashed #e5e7eb'
              }}>
                <ClipboardList size={48} color="#9ca3af" />
                <h4 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600',
                  color: '#6b7280',
                  margin: '16px 0 8px 0'
                }}>
                  No Tasks Assigned
                </h4>
                <p style={{ 
                  fontSize: '0.875rem',
                  color: '#9ca3af',
                  margin: '0'
                }}>
                  You don't have any tasks assigned at the moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="v-dash-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="v-dash-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Error: {error}</p>
          <button onClick={loadDashboardData}>Retry</button>
        </div>
      </div>
    );
  }

  // Show login message if no user data
  if (!userData) {
    return (
      <div className="v-dash-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Please login to access the volunteer dashboard.</div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="v-dash-container">
      {/* Health Report Modal */}
      {showHealthReportModal && (
        <div className="v-dash-modal-overlay">
          <div className="v-dash-modal">
            <div className="v-dash-modal-header">
              <h3>Submit Health Report</h3>
              <button 
                className="v-dash-modal-close"
                onClick={closeHealthReportModal}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="v-dash-modal-content">
              {selectedDogForModal && (
                <div className="v-dash-modal-dog-info">
                  <img 
                    src={selectedDogForModal.photo ? `http://localhost:3000/uploads/dogs/${selectedDogForModal.photo}` : 'https://placedog.net/300/300?id=1'} 
                    alt={selectedDogForModal.name}
                  />
                  <div>
                    <h4>{selectedDogForModal.name}</h4>
                    <p>Health Status: {selectedDogForModal.healthStatus || 'Unknown'}</p>
                  </div>
                </div>
              )}
              
              <div className="v-dash-form-group">
                <label>Eating Habits</label>
                <select 
                  value={modalHealthReport.eatingHabits}
                  onChange={(e) => setModalHealthReport({...modalHealthReport, eatingHabits: e.target.value})}
                >
                  <option value="normal">Normal</option>
                  <option value="reduced">Reduced</option>
                  <option value="increased">Increased</option>
                  <option value="none">None</option>
                </select>
                {formErrors.eatingHabits && <span className="v-dash-form-error">{formErrors.eatingHabits}</span>}
              </div>
              
              <div className="v-dash-form-group">
                <label>Mood/Behavior</label>
                <select 
                  value={modalHealthReport.mood}
                  onChange={(e) => setModalHealthReport({...modalHealthReport, mood: e.target.value})}
                >
                  <option value="playful">Playful</option>
                  <option value="quiet">Quiet</option>
                  <option value="anxious">Anxious</option>
                  <option value="aggressive">Aggressive</option>
                  <option value="depressed">Depressed</option>
                  <option value="normal">Normal</option>
                </select>
                {formErrors.mood && <span className="v-dash-form-error">{formErrors.mood}</span>}
              </div>
              
              <div className="v-dash-form-group">
                <label>Weight (kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={modalHealthReport.weight}
                  onChange={(e) => setModalHealthReport({...modalHealthReport, weight: e.target.value})}
                  placeholder="Enter weight"
                />
                {formErrors.weight && <span className="v-dash-form-error">{formErrors.weight}</span>}
              </div>
              
              <div className="v-dash-form-group">
                <label>Observations</label>
                <textarea 
                  value={modalHealthReport.observations}
                  onChange={(e) => setModalHealthReport({...modalHealthReport, observations: e.target.value})}
                  placeholder="Enter any observations here..."
                  rows="3"
                />
                {formErrors.observations && <span className="v-dash-form-error">{formErrors.observations}</span>}
              </div>
              
              <div className="v-dash-form-group">
                <label>Upload Photos</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    type="button"
                    className="v-dash-secondary-btn"
                    onClick={() => document.getElementById('modal-health-photo-input').click()}
                    style={{ 
                      padding: '12px 16px', 
                      border: '2px dashed #ccc', 
                      backgroundColor: '#f9f9f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <Upload size={18} />
                    <span>Choose Photos</span>
                  </button>
                  
                  <input 
                    id="modal-health-photo-input"
                    type="file" 
                    accept="image/*" 
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => setModalHealthReport({...modalHealthReport, photos: Array.from(e.target.files || [])})}
                  />
                  
                  {Array.isArray(modalHealthReport.photos) && modalHealthReport.photos.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
                        {modalHealthReport.photos.length} photo(s) selected:
                      </small>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {modalHealthReport.photos.map((file, index) => (
                          <span 
                            key={index} 
                            style={{ 
                              padding: '4px 8px', 
                              backgroundColor: '#e3f2fd', 
                              borderRadius: '4px', 
                              fontSize: '12px',
                              color: '#1976d2'
                            }}
                          >
                            {file.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="v-dash-modal-actions">
              <button 
                className="v-dash-secondary-btn"
                onClick={closeHealthReportModal}
              >
                Cancel
              </button>
              <button 
                className="v-dash-primary-btn"
                onClick={handleModalHealthReportSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Health Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Health Reports View Modal */}
      {renderHealthReportsModal()}

      {/* NEW: Recent Walks Modal */}
      {renderRecentWalksModal()}

      {/* NEW: Quick Walk Modal */}
      {renderQuickWalkModal()}

      {/* NEW: Walk Log Modal */}
      {renderWalkLogModal()}

      {/* Task Details Modal */}
      {renderTaskDetailsModal()}

      {/* Header */}
      <header className="v-dash-header">
        <div className="v-dash-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={24} />
        </div>
        
        <div className="v-dash-brand">
          <PawPrint size={28} />
          <h1>StreetToSweet Shelter</h1>
        </div>
        
        <div className="v-dash-header-actions">
          <div className="v-dash-notifications">
            <button 
              className="v-dash-notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="v-dash-notification-badge">{unreadNotifications}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="v-dash-notification-dropdown">
                <div className="v-dash-notification-header">
                  <h3>Notifications</h3>
                  <button 
                    className="v-dash-clear-btn"
                    onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  >
                    Mark all as read
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="v-dash-no-notifications">No notifications</p>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`v-dash-notification-item ${notif.read ? 'read' : 'unread'}`}
                      onClick={() => markNotificationRead(notif.id)}
                    >
                      <p>{notif.message}</p>
                      <span className="v-dash-notification-time">{notif.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="v-dash-user">
            <div className="v-dash-user-info">
              <span className="v-dash-user-name">{userData.name || 'User'}</span>
              <span className="v-dash-user-role">{userData.role || 'Volunteer'}</span>
            </div>
            <div 
              className="v-dash-user-avatar"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {userData.profilePic ? (
                <img src={userData.profilePic} alt={userData.name || 'User'} />
              ) : (
                <User size={32} />
              )}
              {showUserMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {showUserMenu && (
              <div className="v-dash-user-menu">
                <div className="v-dash-user-details">
                  <h4>{userData.name || 'User'}</h4>
                  <p>{userData.role || 'Volunteer'}</p>
                  <div className="v-dash-user-contact">
                    <Mail size={14} /> {userData.email || 'No email'}
                  </div>
                  <div className="v-dash-user-contact">
                    <Phone size={14} /> {userData.phone || 'No phone'}
                  </div>
                </div>
                <button className="v-dash-menu-item">
                  <User size={16} />
                  <span>Edit Profile</span>
                </button>
                <button className="v-dash-menu-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="v-dash-layout">
        {/* Sidebar Navigation */}
        <nav className={`v-dash-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="v-dash-nav-items">
            <button 
              className={`v-dash-nav-item ${activeSection === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('overview');
                setMobileMenuOpen(false);
              }}
            >
              <BarChart3 size={20} />
              <span>Overview</span>
            </button>
            
            {/* Volunteer Management Navigation Item */}
            <button 
              className={`v-dash-nav-item ${activeSection === 'volunteer-management' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('volunteer-management');
                setMobileMenuOpen(false);
              }}
            >
              <Users size={20} />
              <span>My Assignments</span>
            </button>
            
            <button 
              className={`v-dash-nav-item ${activeSection === 'events' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('events');
                setMobileMenuOpen(false);
              }}
            >
              <Calendar size={20} />
              <span>Events</span>
            </button>
            
            <button 
              className={`v-dash-nav-item ${activeSection === 'blog' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('blog');
                setMobileMenuOpen(false);
              }}
            >
              <Edit3 size={20} />
              <span>Blog & Stories</span>
            </button>
          </div>
          
          <div className="v-dash-sidebar-footer">
            <div className="v-dash-help-section">
              <h4>Need Help?</h4>
              <p>Contact shelter administration</p>
              <button className="v-dash-help-btn">Get Support</button>
            </div>
            <button className="v-dash-logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="v-dash-main">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <section className="v-dash-section">
              <div className="v-dash-section-header">
                <h2 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '700', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px'
                }}>
                  🎯 Dashboard Overview
                </h2>
                <p style={{ 
                  fontSize: '1.2rem', 
                  color: '#64748b',
                  fontWeight: '400'
                }}>
                  Welcome back, {userData.name || 'User'}! Here's what's happening today.
                </p>
              </div>
              
              {/* Enhanced Statistics */}
              <StatisticsDisplay />
              
              {/* Activity Overview */}
              <div className="v-dash-overview-content">
                <div className="v-dash-overview-left">
                  <ActivityChart />
                </div>
                <div className="v-dash-overview-right">
                  <RecentActivity />
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="v-dash-overview-actions">
                <h3>Quick Actions</h3>
                <div className="v-dash-action-buttons">
                  <button 
                    className="v-dash-action-btn"
                    onClick={() => {
                      setActiveSection('blog');
                      setShowNewPostForm(true);
                    }}
                  >
                    <Edit3 size={18} />
                    <span>Write Blog Post</span>
                  </button>
                  
                  <button 
                    className="v-dash-action-btn"
                    onClick={() => setActiveSection('volunteer-management')}
                  >
                    <Users size={18} />
                    <span>Manage Assignments</span>
                  </button>
                  
                  <button 
                    className="v-dash-action-btn"
                    onClick={() => setActiveSection('events')}
                  >
                    <Calendar size={18} />
                    <span>View Events</span>
                  </button>
                  
                  
                </div>
              </div>
            </section>
          )}

          {/* Volunteer Management Section */}
          {activeSection === 'volunteer-management' && renderVolunteerManagement()}
          
          {/* Events Section */}
          {activeSection === 'events' && (
            <section className="v-dash-section">
              <div className="v-dash-section-header">
                <h2>Upcoming Events</h2>
                <p>Participate in shelter events and activities</p>
              </div>
              
              <div className="v-dash-events-grid">
                {events.map(event => (
                  <div key={event._id} className="v-dash-event-card">
                    <div className="v-dash-event-header">
                      <h3>{event.title}</h3>
                      {/* Removed RSVP status display */}
                    </div>
                    
                    <div className="v-dash-event-details">
                      <p><Calendar size={16} /> {new Date(event.date).toLocaleDateString()}</p>
                      <p><Clock size={16} /> {new Date(event.date).toLocaleTimeString()}</p>
                      <p><MapPin size={16} /> {event.location}</p>
                     
                    </div>
                    
                    <div className="v-dash-event-actions">
                     
                      
                      <button 
                        className="v-dash-calendar-btn"
                        onClick={() => {
                          // Add event to calendar and navigate
                          const calendarEvent = {
                            id: event._id,
                            title: event.title,
                            date: event.date,
                            location: event.location,
                            type: event.eventType || 'shelter',
                            description: event.description || ''
                          };
                          
                          try {
                            // Get existing calendar events
                            const existingEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
                            
                            // Check if event is already in calendar
                            const isAlreadyAdded = existingEvents.some(e => e.id === event._id);
                            
                            if (!isAlreadyAdded) {
                              // Add new event to calendar
                              const updatedEvents = [...existingEvents, calendarEvent];
                              localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
                            }
                            
                            // Navigate to calendar
                            window.location.href = '/eventcalendar';
                            
                          } catch (error) {
                            console.error('Error adding event to calendar:', error);
                            alert('Added to calendar! Navigating...');
                            window.location.href = '/eventcalendar';
                          }
                        }}
                      >
                        <CalendarDays size={16} />
                        Add to Calendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {events.length === 0 && (
                <div className="v-dash-no-events">
                  <p>No upcoming events found.</p>
                  <button 
                    className="v-dash-primary-btn"
                    onClick={() => window.location.href = '/events'}
                  >
                    Browse All Events
                  </button>
                </div>
              )}
              
              <div className="v-dash-past-events">
                <h3>Past Events</h3>
                <div className="v-dash-past-events-list">
                  <div className="v-dash-past-event">
                    <h4>Charity Fundraiser</h4>
                    <p>October 5, 2023 • Raised $2,400</p>
                  </div>
                  <div className="v-dash-past-event">
                    <h4>Community Awareness Day</h4>
                    <p>September 18, 2023 • 120 attendees</p>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* Blog Section */}
          {activeSection === 'blog' && (
            <section className="v-dash-section">
              <div className="v-dash-section-header">
                <h2>Blog & Story Contributions</h2>
                <p>Share stories about your experiences with the shelter dogs</p>
              </div>
              
              <button 
                className="v-dash-primary-btn new-post-btn"
                onClick={() => {
                  setShowNewPostForm(!showNewPostForm);
                  setNewBlogPost({ title: '', content: '' }); // Reset form when opening
                  setFormErrors({});
                }}
              >
                <Plus size={18} />
                <span>{showNewPostForm ? 'Cancel' : 'New Blog Post'}</span>
              </button>
              
              {showNewPostForm && (
                <div className="v-dash-new-post-form">
                  <h3>Create New Blog Post</h3>
                  <div className="v-dash-form-group">
                    <label>Title</label>
                    <input 
                      type="text" 
                      value={newBlogPost.title}
                      onChange={(e) => setNewBlogPost({...newBlogPost, title: e.target.value})}
                      placeholder="Enter a title for your post"
                    />
                    {formErrors.title && <span className="v-dash-form-error">{formErrors.title}</span>}
                  </div>
                  
                  <div className="v-dash-form-group">
                    <label>Content</label>
                    <textarea 
                      value={newBlogPost.content}
                      onChange={(e) => setNewBlogPost({...newBlogPost, content: e.target.value})}
                      placeholder="Write your blog post here..."
                      rows="6"
                    ></textarea>
                    {formErrors.content && <span className="v-dash-form-error">{formErrors.content}</span>}
                  </div>
                  
                  <div className="v-dash-form-actions">
                    <button 
                      className="v-dash-secondary-btn"
                      onClick={() => {
                        setShowNewPostForm(false);
                        setNewBlogPost({ title: '', content: '' });
                        setFormErrors({});
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="v-dash-primary-btn"
                      onClick={handleNewBlogPost}
                      disabled={isSubmitting}
                    >
                      <Save size={16} />
                      {isSubmitting ? 'Submitting...' : 'Submit Post'}
                    </button>
                  </div>
                </div>
              )}
              
              <div className="v-dash-blog-posts">
                <h3>Your Submissions</h3>
                
                {!Array.isArray(blogPosts) || blogPosts.length === 0 ? (
                  <p className="v-dash-no-posts">You haven't submitted any blog posts yet.</p>
                ) : (
                  blogPosts.map(post => (
                    <div key={post._id} className="v-dash-blog-post">
                      <div className="v-dash-post-info">
                        <h4>{post.title}</h4>
                        <p>Submitted on {new Date(post.createdAt).toLocaleDateString()}</p>
                        <p className="v-dash-post-excerpt">
                          {post.content?.substring(0, 150) || 'No content available'}...
                        </p>
                      </div>
                      
                      <div className="v-dash-post-actions">
                        {/* Removed Edit button */}
                        <button 
                          className="v-dash-delete-btn"
                          onClick={() => handleDeleteBlogPost(post._id)}
                          disabled={post.status === 'published'}
                          title={
                            post.status === 'published' 
                              ? 'Published posts cannot be deleted' 
                              : 'Delete post'
                          }
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default VolunteerDashboard;