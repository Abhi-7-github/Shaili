import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: 'women',
  });

  const [formError, setFormError] = useState('');
  const { signup, login, setError } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
  };

  const toggleMode = (signUpState) => {
    setIsSignUp(signUpState);
    setFormError('');
    setError(null);
    setFormData({ name: '', email: '', password: '', confirmPassword: '', gender: 'women' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client side validation
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (isSignUp) {
      if (!formData.name) {
        setFormError('Please enter your full name');
        return;
      }
      if (formData.password.length < 6) {
        setFormError('Password must be at least 6 characters long');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let res;
      if (isSignUp) {
        res = await signup(formData.name, formData.email, formData.password, formData.gender);
      } else {
        res = await login(formData.email, formData.password);
      }

      if (!res.success) {
        setFormError(res.message || 'Authentication failed');
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Dynamic Background Elements */}
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      <div className="gradient-orb orb-3"></div>

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="brand-logo">
            <Sparkles className="brand-icon" />
            <span>SHAILI</span>
          </div>
          <h2>{isSignUp ? 'Create your Account' : 'Welcome Back'}</h2>
          <p>
            {isSignUp
              ? 'Join Shaili to experience personalized AI styling & memory vault'
              : 'Enter your credentials to access your portal'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`tab-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => toggleMode(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`tab-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => toggleMode(true)}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="error-alert">
            <AlertCircle className="alert-icon" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required={isSignUp}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Gender Selection during Sign Up */}
          {isSignUp && (
            <div className="input-group">
              <label><UserCheck size={14} style={{ display: 'inline', marginRight: 4 }} /> Select Gender Profile</label>
              <div className="gender-auth-radio-group">
                <label className={`gender-auth-chip ${formData.gender === 'women' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="women"
                    checked={formData.gender === 'women'}
                    onChange={handleChange}
                  />
                  <span>Women</span>
                </label>
                <label className={`gender-auth-chip ${formData.gender === 'men' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="men"
                    checked={formData.gender === 'men'}
                    onChange={handleChange}
                  />
                  <span>Men</span>
                </label>
                <label className={`gender-auth-chip ${formData.gender === 'unisex' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="unisex"
                    checked={formData.gender === 'unisex'}
                    onChange={handleChange}
                  />
                  <span>Unisex</span>
                </label>
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={isSignUp}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer Toggle Link */}
        <div className="auth-footer">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button type="button" onClick={() => toggleMode(false)} className="link-btn">
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button type="button" onClick={() => toggleMode(true)} className="link-btn">
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
