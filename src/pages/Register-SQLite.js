import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone, MapPin } from 'lucide-react';
import { useSQLiteAuth } from '../context/SQLiteAuthContext';
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
  const { signup } = useSQLiteAuth();
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
      
      if (error.message.includes('already exists')) {
        errorMessage = 'An account with this email already exists.';
      } else {
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
          <h1>Create Account</h1>
          <p>Join StreamFlow and start your learning journey</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="displayName">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" />
              <input
                id="displayName"
                type="text"
                placeholder="Enter your full name"
                {...register('displayName')}
                className={errors.displayName ? 'error' : ''}
              />
            </div>
            {errors.displayName && (
              <span className="error-message">{errors.displayName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && (
              <span className="error-message">{errors.email.message}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <div className="input-wrapper">
                <Phone className="input-icon" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone"
                  {...register('phone')}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location (Optional)</label>
              <div className="input-wrapper">
                <MapPin className="input-icon" />
                <input
                  id="location"
                  type="text"
                  placeholder="Enter your location"
                  {...register('location')}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                {...register('password')}
                className={errors.password ? 'error' : ''}
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
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'error' : ''}
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

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('agreeToTerms')}
                className="checkbox-input"
              />
              <span className="checkmark"></span>
              I agree to the{' '}
              <a href="/terms" className="link">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="link">
                Privacy Policy
              </a>
            </label>
            {errors.agreeToTerms && (
              <span className="error-message">{errors.agreeToTerms.message}</span>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                {...register('ownershipConfirm')}
                className="checkbox-input"
              />
              <span className="checkmark"></span>
              I confirm that I own the rights to any content I upload and agree to make it publicly available
            </label>
            {errors.ownershipConfirm && (
              <span className="error-message">{errors.ownershipConfirm.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              <>
                Create Account
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
