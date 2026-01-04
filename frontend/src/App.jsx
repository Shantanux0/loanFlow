import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import VerifyEmailModal from './components/VerifyEmailModal';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';

import './styles/index.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading, logout } = useAuth(); // Destructure logout to allow user to exit if they can't verify
  const [showVerifyModal, setShowVerifyModal] = React.useState(true); // Always show if unverified

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Enforce Mandatory Verification
  if (!user.isAccountVerified) {
    return (
      <div className="flex-center" style={{ height: '100vh', width: '100vw', position: 'relative' }}>
        {/* Show modal forced open */}
        <VerifyEmailModal
          onClose={() => { }} // No-op, can't close
          email={user.email}
          mandatory={true}
        />
        {/* Optional: Add a logout button behind or below if needed, but modal covers most. 
                For better UX, we might want to put a Logout button INSIDE the modal or accessible somewhere, 
                otherwise they are stuck. But user requested 'no cancellation'. 
                However, to switch accounts they need logout. 
                I will add a small logout trigger outside or rely on the fact they can't do anything else.
                Actually, let's keep it strict for now as requested.
             */}
      </div>
    );
  }

  return children;
};

// Admin Route Component (Simple check based on assumption/context)
// Since explicit role isn't in fetched User object yet, we might rely on backend 403s 
// or if we add role to context later. For now acting as standard protected route or checking explicit admin flag if available.
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (user && user.role === 'ADMIN') {
    return children;
  }

  return <Navigate to="/management/login" replace />;
};


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="management/login" element={<AdminLogin />} />
        <Route path="management/register" element={<AdminRegister />} />

        {/* Protected Routes */}
        <Route index element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="management/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  );
}

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-surface)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
              },
            }}
          />
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
