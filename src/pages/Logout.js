import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield } from 'lucide-react';
import './Logout.css';

const Logout = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        // Redirect to login page after successful logout
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'You have been successfully logged out.' 
            } 
          });
        }, 2000);
      } catch (error) {
        console.error('Logout error:', error);
        // Still redirect even if there's an error
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    if (currentUser) {
      performLogout();
    } else {
      // If no user is logged in, redirect to login
      navigate('/login');
    }
  }, [logout, navigate, currentUser]);

  return (
    <div className="logout-page">
      <div className="logout-container">
        <div className="logout-content">
          <Shield size={64} className="logout-icon" />
          <h2>🔒 Secure Logout</h2>
          <p>Logging you out securely...</p>
          <div className="logout-spinner"></div>
          <div className="logout-message">
            <LogOut size={20} />
            <span>Clearing your session and redirecting to login</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
