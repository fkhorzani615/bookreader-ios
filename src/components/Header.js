import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  BookOpen, 
  User, 
  LogIn, 
  UserPlus, 
  LogOut,
  Menu,
  X,
  Crown,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from './LanguageSelector';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <Play size={32} className="logo-icon" />
            <span className="logo-text">StreamFlow</span>
          </Link>
        </div>
        
        <nav className={`nav ${isMobileMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/videos" className="nav-link">
            <Play size={20} />
            <span>{t.videos}</span>
          </Link>
          <Link to="/books" className="nav-link">
            <BookOpen size={20} />
            <span>{t.books}</span>
          </Link>
          {currentUser && (
            <Link to="/upload" className="nav-link">
              <Upload size={20} />
              <span>{t.upload}</span>
            </Link>
          )}
        </nav>
        
        <div className="header-actions">
          <LanguageSelector />
          {currentUser ? (
            <div className="user-section">
              {currentUser?.subscription?.plan === 'premium' && (
                <div className="premium-badge">
                  <Crown size={16} />
                  <span>Premium</span>
                </div>
              )}
              <div className="user-menu">
                <button className="user-avatar" onClick={toggleMobileMenu}>
                  <span>{currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0)}</span>
                </button>
                <div className={`user-dropdown ${isMobileMenuOpen ? 'dropdown-open' : ''}`}>
                  <Link to="/profile" className="dropdown-item">
                    <User size={16} />
                    <span>{t.profile}</span>
                  </Link>
                  <Link to="/upload" className="dropdown-item">
                    <Upload size={16} />
                    <span>{t.upload}</span>
                  </Link>
                  <Link to="/subscription" className="dropdown-item">
                    <Crown size={16} />
                    <span>{t.subscription}</span>
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    <LogOut size={16} />
                    <span>{t.logout}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login-btn">
                <LogIn size={18} />
                <span>{t.login}</span>
              </Link>
              <Link to="/register" className="auth-btn register-btn">
                <UserPlus size={18} />
                <span>{t.register}</span>
              </Link>
            </div>
          )}
          
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>


    </header>
  );
};

export default Header;
