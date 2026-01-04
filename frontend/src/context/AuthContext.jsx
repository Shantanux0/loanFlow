import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check auth status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const { data: isAuthenticated } = await api.get('/auth/is-authenticated');
            if (isAuthenticated) {
                // If authenticated, fetch profile
                const { data: profile } = await api.get('/auth/profile');
                // Normalize boolean field which might be serialized as accountVerified by Jackson
                const normalizedUser = {
                    ...profile,
                    isAccountVerified: profile.isAccountVerified ?? profile.accountVerified
                };
                setUser(normalizedUser);
            } else {
                setUser(null);
            }
        } catch (error) {
            // console.error("Auth check failed", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            await api.post('/auth/login', { email, password });
            await checkAuthStatus(); // Refresh user data
            toast.success("Welcome back!");
            return true;
        } catch (error) {
            console.error("Login error", error);
            const message = error.response?.data?.message || "Login failed";
            toast.error(message);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            await api.post('/auth/register', { name, email, password });
            // Auto-login after registration
            await login(email, password);
            // Note: OTP sending is handled by the UI/Component flow now if needed
            toast.success("Account created!");
            return true;
        } catch (error) {
            console.error("Registration error", error);
            const message = error.response?.data?.message || "Registration failed";
            toast.error(message);
            throw error;
        }
    };

    const registerAdmin = async (name, email, password) => {
        try {
            await api.post('/auth/register-admin', { name, email, password });
            toast.success("Admin Account created! Please login.");
            return true;
        } catch (error) {
            console.error("Admin Registration error", error);
            const message = error.response?.data?.message || "Admin Registration failed";
            toast.error(message);
            throw error;
        }
    };

    const sendVerifyOtp = async (email) => {
        try {
            await api.post(`/auth/send-otp?email=${email}`);
            toast.success("OTP sent to your email!");
            return true;
        } catch (error) {
            console.error("Send OTP error", error);
            // If conflict (409), it means already verified. Rearthrow to let component handle
            throw error;
        }
    };

    const verifyEmail = async (email, otp) => {
        try {
            await api.post('/auth/verify-otp', { email, otp });
            await checkAuthStatus(); // Refresh profile to show verified status
            toast.success("Email verified successfully!");
        } catch (error) {
            console.error("Verify OTP error", error);
            toast.error(error.response?.data?.message || "Verification failed");
            throw error;
        }
    };

    const sendResetOtp = async (email) => {
        try {
            await api.post(`/auth/send-reset-otp?email=${email}`);
            toast.success("Reset OTP sent to your email!");
            return true;
        } catch (error) {
            console.error("Send Reset OTP error", error);
            toast.error(error.response?.data?.message || "Failed to send OTP");
            throw error;
        }
    };

    const resetPassword = async (email, otp, newPassword) => {
        try {
            await api.post('/auth/reset-password', { email, otp, newPassword });
            toast.success("Password reset successfully! Please login.");
            return true;
        } catch (error) {
            console.error("Reset Password error", error);
            toast.error(error.response?.data?.message || "Failed to reset password");
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            toast.success("Logged out successfully");
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        registerAdmin,
        logout,
        checkAuthStatus,
        sendVerifyOtp,
        verifyEmail,
        sendResetOtp,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
