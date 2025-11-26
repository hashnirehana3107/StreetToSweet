import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Base URL for API calls
const API_BASE_URL = 'http://localhost:3000';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Set up axios interceptor for authentication
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Verify token validity
            verifyToken();
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async () => {
        try {
            const response = await axios.get('/auth/profile');
            setUser(response.data.data.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Token verification failed:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post('/auth/login', { email, password });
            const { token, user: userData, redirectTo } = response.data.data;
            
            // Store token
            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', userData.role);
            
            // Set axios header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Update state
            setUser(userData);
            setIsAuthenticated(true);
            
            // Dispatch custom event to notify Nav component
            window.dispatchEvent(new Event("authStateChanged"));
            
            return { success: true, user: userData, redirectTo };
        } catch (error) {
            console.error('Login failed:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/auth/register', userData);
            const { token, user: newUser, redirectTo } = response.data.data;
            
            // Store token
            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', newUser.role);
            
            // Set axios header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Update state
            setUser(newUser);
            setIsAuthenticated(true);
            
            // Dispatch custom event to notify Nav component
            window.dispatchEvent(new Event("authStateChanged"));
            
            return { success: true, user: newUser, redirectTo };
        } catch (error) {
            console.error('Registration failed:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const logout = () => {
        // Clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        
        // Clear axios header
        delete axios.defaults.headers.common['Authorization'];
        
        // Update state
        setUser(null);
        setIsAuthenticated(false);
        
        // Dispatch custom event to notify Nav component
        window.dispatchEvent(new Event("authStateChanged"));
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put('/auth/profile', profileData);
            setUser(response.data.data.user);
            return { success: true };
        } catch (error) {
            console.error('Profile update failed:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Profile update failed' 
            };
        }
    };

    const changePassword = async (currentPassword, newPassword) => {
        try {
            await axios.put('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return { success: true };
        } catch (error) {
            console.error('Password change failed:', error);
            return { 
                success: false, 
                error: error.response?.data?.message || 'Password change failed' 
            };
        }
    };

    const getDashboardUrl = (role) => {
        const dashboardMap = {
            'user': '/profile',
            'admin': '/admin/dashboard',
            'driver': '/driver/dashboard',
            'vet': '/vet/dashboard',
            'volunteer': '/volunteer/dashboard'
        };
        return dashboardMap[role] || '/profile';
    };

    const hasRole = (requiredRole) => {
        if (!user) return false;
        if (user.role === 'admin') return true; // Admin can access everything
        return user.role === requiredRole;
    };

    const hasAnyRole = (roles) => {
        if (!user) return false;
        if (user.role === 'admin') return true; // Admin can access everything
        return roles.includes(user.role);
    };

    const updateUser = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        getDashboardUrl,
        hasRole,
        hasAnyRole,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
