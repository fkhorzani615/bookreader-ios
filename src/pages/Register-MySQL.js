import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMySQLAuth } from '../context/MySQLAuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, error, clearError } = useMySQLAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert(t('register.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.displayName
      );
      
      if (result.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.displayName &&
      formData.password === formData.confirmPassword &&
      formData.password.length >= 6
    );
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t('register.title')}</h1>
          <p>{t('register.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="displayName">{t('register.displayName')}</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder={t('register.displayNamePlaceholder')}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('register.email')}</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('register.emailPlaceholder')}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('register.password')}</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('register.passwordPlaceholder')}
                required
                minLength={6}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('register.confirmPassword')}</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('register.confirmPasswordPlaceholder')}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{t('register.passwordMismatch')}</span>
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? t('register.creatingAccount') : t('register.createAccount')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('register.haveAccount')}{' '}
            <Link to="/login" className="auth-link">
              {t('register.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
