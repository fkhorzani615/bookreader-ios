import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import './Auth.css';

const registerSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the privacy policy and terms.' })
  }),
  ownershipConfirm: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm ownership and publicity of your information.' })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register = () => {
  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await signup(data.email, data.password, data.displayName, {
        phone: data.phone || '',
        location: data.location || ''
      });
      toast.success('Account created successfully! Welcome to StreamFlow!');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{t.createAccount}</h1>
          <p>{t.joinStreamFlow}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="displayName">{t.fullName}</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                type="text"
                id="displayName"
                placeholder={t.enterYourFullName}
                {...register('displayName')}
                className={errors.displayName ? 'input-error' : ''}
              />
            </div>
            {errors.displayName && (
              <span className="error-message">{errors.displayName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">{t.emailAddress}</label>
            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder={t.enterYourEmail}
                {...register('email')}
                className={errors.email ? 'input-error' : ''}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">{t.phoneNumberOptional}</label>
            <div className="input-wrapper">
              <Phone size={20} className="input-icon" />
              <input
                type="tel"
                id="phone"
                placeholder={t.enterYourPhoneNumber}
                {...register('phone')}
                className={errors.phone ? 'input-error' : ''}
              />
            </div>
            {errors.phone && (
              <span className="error-message">{errors.phone.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="location">{t.locationOptional}</label>
            <div className="input-wrapper">
              <MapPin size={20} className="input-icon" />
              <input
                type="text"
                id="location"
                placeholder={t.enterYourLocation}
                {...register('location')}
                className={errors.location ? 'input-error' : ''}
              />
            </div>
            {errors.location && (
              <span className="error-message">{errors.location.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">{t.password}</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder={t.createPassword}
                {...register('password')}
                className={errors.password ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t.confirmPassword}</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                placeholder={t.confirmYourPassword}
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                {...register('agreeToTerms')}
                className={errors.agreeToTerms ? 'input-error' : ''}
                style={{ width: 18, height: 18 }}
              />
              <span>
                I agree to the <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>. I will not upload nude or illegal content.
              </span>
            </label>
            {errors.agreeToTerms && (
              <span className="error-message">{errors.agreeToTerms.message}</span>
            )}
          </div>
          <div className="form-group">
            <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                {...register('ownershipConfirm')}
                className={errors.ownershipConfirm ? 'input-error' : ''}
                style={{ width: 18, height: 18 }}
              />
              <span>
                I confirm that all information and content I provide is my own, can be made public for everyone (including children), and does not belong to anyone else.
              </span>
            </label>
            {errors.ownershipConfirm && (
              <span className="error-message">{errors.ownershipConfirm.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                {t.createAccount}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {t.alreadyHaveAccount}{' '}
            <Link to="/login" className="auth-link">
              {t.signInHere}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 