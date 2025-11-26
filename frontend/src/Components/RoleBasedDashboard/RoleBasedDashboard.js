import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserProfile from '../UserProfile/UserProfile';
import AdminDashboard from '../AdminDashboard/AdminDashboard';
import DriverDashboard from '../../DriverDashboard/DriverDashboard';
import VetDashboard from '../VetDashboard/VetDashboard';
import VolunteerDashboard from '../Volunteer/VolunteerDashboard';

const RoleBasedDashboard = () => {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Loading Dashboard...</h2>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                </div>
            </div>
        );
    }

    const renderDashboard = () => {
        switch (user.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'driver':
                return <DriverDashboard />;
            case 'vet':
                return <VetDashboard />;
            case 'volunteer':
                return <VolunteerDashboard />;
            case 'user':
            default:
                return <UserProfile />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Welcome, {user.name}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Role: <span className="capitalize font-medium">{user.role}</span>
                        </p>
                    </div>
                </div>
            </div>
            {renderDashboard()}
        </div>
    );
};

export default RoleBasedDashboard;
