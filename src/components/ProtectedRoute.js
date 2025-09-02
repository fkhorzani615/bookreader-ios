import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock } from 'lucide-react';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-container">
          <Shield size={48} className="loading-icon" />
          <div className="loading-spinner"></div>
          <p>Verifying secure access...</p>
        </div>
      </div>
    );
  }

  // If authentication is required and user is not logged in
  if (requireAuth && !currentUser) {
    return (
      <div className="protected-route-unauthorized">
        <div className="unauthorized-container">
          <Lock size={64} className="unauthorized-icon" />
          <h2>🔒 Access Restricted</h2>
          <p>You need to be logged in to access this page.</p>
          <div className="unauthorized-actions">
            <Navigate 
              to="/login" 
              state={{ from: location }} 
              replace 
            />
          </div>
        </div>
      </div>
    );
  }

  // If user is logged in and trying to access login/register pages
  if (!requireAuth && currentUser) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated and can access the protected content
  return children;
};

export default ProtectedRoute; 