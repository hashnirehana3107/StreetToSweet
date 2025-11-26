import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute/ProtectedRoute";
import RoleBasedDashboard from "./Components/RoleBasedDashboard/RoleBasedDashboard";
import Home from "./Components/Home/Home";
import ReportStray from "./Components/ReportStray/ReportStray";
import Adoption from "./Components/Adoption/Adoption";
import Events from "./Components/Events/Events";
import Donate from "./Components/Donate/Donate";
import ContactUs from "./Components/ContactUs/ContactUs";
import AboutUs from "./Components/AboutUs/AboutUs";
import Register from "./Components/Register/Register";
import Login from "./Components/Login/Login";
import LostFound from "./Components/LostFound/LostFound";
import AdoptionRequestForm from "./Components/AdoptionRequestForm/AdoptionRequestForm";
import MyAdoptionDashboard from "./Components/MyAdoptionDashboard/MyAdoptionDashboard";
import AdoptionPage from "./Components/AdoptionPage/AdoptionPage";
import DogCard from "./Components/DogCard/DogCard";
import VolunteerRegister from "./Components/Volunteer/VolunteerRegister";
import UserProfile from "./Components/UserProfile/UserProfile";
import Nav from "./Components/Nav/Nav";
import EventPage from "./Components/EventPage/EventPage";
import EventDetails from "./Components/EventDetails/EventDetails";
import EventRegistration from "./Components/EventRegistration/EventRegistration";
import BlogNews from "./Components/BlogNews/BlogNews";
import FollowUpReport from "./Components/FollowUpReport/FollowUpReport";
import FollowUpPage from "./Components/FollowUpPage/FollowUpPage";
import AdoptionCertificate from "./Components/AdoptionCertificate/AdoptionCertificate";
import VolunteerDashboard from "./Components/Volunteer/VolunteerDashboard";
import DonateQR from "./Components/DonateQR/DonateQR";
import VetDashboard from "./Components/VetDashboard/VetDashboard";
import AdminDashboard from "./Components/AdminDashboard/AdminDashboard";
import AllsysDogs from "./Components/AllsysDogs/AllsysDogs";
import AllsysDogCard from "./Components/AllsysDogs/AllsysDogCard";
import SysDogProfile from "./Components/SysDogProfile/SysDogProfile";
import MedicalRecords from "./Components/MedicalRecords/MedicalRecords";
import TreatmentDashboard from "./Components/TreatmentDashboard/TreatmentDashboard";
import MedicationHistory from "./Components/MedicationHistory/MedicationHistory";
import EventListing from "./Components/EventListing/EventListing";
import EventConfirm from "./Components/EventConfirm/EventConfirm";
import DriverDashboard from "./DriverDashboard/DriverDashboard";
import EmergencyDashboard from './EmergencyDashboard/EmergencyDashboard';
import RescueDashboard from './Components/RescueDashboard/RescueDashboard';
import MyReports from './Components/MyReports/MyReports';
import { EmergencyProvider } from './EmergencyContext/EmergencyContext';

// Unauthorized component
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
      <button 
        onClick={() => window.history.back()} 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  const location = useLocation();

  // ✅ Track login status (backward compatibility)
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("authToken"));

  // ✅ Hide navbar only on login/register pages
  const hideNav = location.pathname === "/login" || location.pathname === "/register";

  return (
    <AuthProvider>
      <div>
        {!hideNav && (
          <Nav isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        )}

        <EmergencyProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/mainhome" element={<Home />} />
            <Route path="/reportstray" element={<ReportStray />} />
            <Route path="/adoption" element={<Adoption />} />
            <Route path="/events" element={<Events />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/blognews" element={<BlogNews />} />
            <Route path="/lostfound" element={<LostFound />} />
            <Route path="/donateqr" element={<DonateQR />} />
            <Route path="/adoptdogspage" element={<AdoptionPage />} />
            <Route path="/dogcard" element={<DogCard />} />
            <Route path="/eventpage" element={<EventPage />} />
            <Route path="/eventdetails" element={<EventDetails />} />
            <Route path="/eventregistration" element={<EventRegistration />} />
            <Route path="/eventlisting" element={<EventListing />} />
            <Route path="/eventconfirm" element={<EventConfirm />} />
            
            {/* Authentication Routes */}
            <Route
              path="/register"
              element={<Register setIsLoggedIn={setIsLoggedIn} />}
            />
            <Route
              path="/login"
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
            />
            
            {/* Role-based Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <RoleBasedDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Driver Routes */}
            <Route
              path="/driver/dashboard"
              element={
                <ProtectedRoute requiredRole="driver">
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Vet Routes */}
            <Route
              path="/vet/dashboard"
              element={
                <ProtectedRoute requiredRole="vet">
                  <VetDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Volunteer Routes */}
            <Route
              path="/volunteer/dashboard"
              element={
                <ProtectedRoute requiredRole="volunteer">
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Protected User Routes */}
            <Route
              path="/adoptionrequest"
              element={
                <ProtectedRoute>
                  <AdoptionRequestForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adoptiondashboard"
              element={
                <ProtectedRoute>
                  <MyAdoptionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/followup"
              element={
                <ProtectedRoute>
                  <FollowUpReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/followup/:id"
              element={
                <ProtectedRoute>
                  <FollowUpPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adoptioncertificate"
              element={
                <ProtectedRoute>
                  <AdoptionCertificate />
                </ProtectedRoute>
              }
            />
            <Route
              path="/adoption-certificate/:requestId"
              element={
                <ProtectedRoute>
                  <AdoptionCertificate />
                </ProtectedRoute>
              }
            />
            
            {/* Admin/Vet Protected Routes */}
            <Route
              path="/allsysdogs"
              element={
                <ProtectedRoute requiredRoles={["admin", "vet"]}>
                  <AllsysDogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/allsysdog-card"
              element={
                <ProtectedRoute requiredRoles={["admin", "vet"]}>
                  <AllsysDogCard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sysdogprofile"
              element={
                <ProtectedRoute requiredRoles={["admin", "vet"]}>
                  <SysDogProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medicalrecords"
              element={
                <ProtectedRoute requiredRoles={["admin", "vet"]}>
                  <MedicalRecords />
                </ProtectedRoute>
              }
            />
            <Route
              path="/treatmentdashboard"
              element={
                <ProtectedRoute requiredRoles={["admin", "vet"]}>
                  <TreatmentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/medicationhistory"
              element={
                <ProtectedRoute requiredRoles={["admin", "vet"]}>
                  <MedicationHistory />
                </ProtectedRoute>
              }
            />
            
            {/* Other Routes */}
            <Route path="/volunteerregister" element={<VolunteerRegister />} />
            <Route path="/userprofile" element={<UserProfile />} />
            <Route path="/emergency-dashboard" element={<EmergencyDashboard />} />
            <Route path="/rescue-dashboard" element={<RescueDashboard />} />
            <Route path="/myreports" element={<MyReports />} />
            
            {/* Deprecated routes for backward compatibility */}
            <Route path="/volunteerdashboard" element={<VolunteerDashboard />} />
            <Route path="/vetdashboard" element={<VetDashboard />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            
            {/* Unauthorized page */}
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </EmergencyProvider>
      </div>
    </AuthProvider>
  );
}

export default App;
