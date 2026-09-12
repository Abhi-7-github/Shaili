import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, UserCheck } from 'lucide-react';
import { Logo } from './Logo';

export const AuthForm = ({ initialSignUp = false }) => {
  const [isSignUp, setIsSignUp] = useState(initialSignUp);
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#FAF4ED] relative overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0F3D3A]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#6C151E]/10 blur-3xl pointer-events-none" />

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white border border-[#F5DABF] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <Logo variant="dark" size="small" showTagline={false} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#0A2E2C]">
            {isSignUp ? 'Create your Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-[#0A2E2C]/80 font-medium">
            {isSignUp
              ? 'Join ShAili for personalized AI styling & smart wardrobe curation'
              : 'Enter your credentials to access your digital wardrobe'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[#FAF4ED] rounded-2xl border border-[#F5DABF]">
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isSignUp ? 'bg-[#0F3D3A] text-[#FAF4ED] shadow-sm' : 'text-[#0A2E2C]/70 hover:text-[#0A2E2C]'
            }`}
            onClick={() => toggleMode(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isSignUp ? 'bg-[#0F3D3A] text-[#FAF4ED] shadow-sm' : 'text-[#0A2E2C]/70 hover:text-[#0A2E2C]'
            }`}
            onClick={() => toggleMode(true)}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3.5 rounded-xl bg-[#6C151E]/10 text-[#6C151E] border border-[#6C151E]/30 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A2E2C]/50" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required={isSignUp}
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-xs text-[#0A2E2C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A2E2C]/50" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-xs text-[#0A2E2C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
              />
            </div>
          </div>

          {/* Gender Selection */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#6C151E]" /> Style Profile Gender
              </label>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['women', 'men', 'unisex'].map((g) => (
                  <label
                    key={g}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center capitalize cursor-pointer transition-all ${
                      formData.gender === g
                        ? 'bg-[#6C151E] text-[#FAF4ED] border-[#6C151E]'
                        : 'bg-[#FAF4ED] text-[#0A2E2C] border-[#F5DABF]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={g}
                      checked={formData.gender === g}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span>{g}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A2E2C]/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-xs text-[#0A2E2C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A2E2C]/50 hover:text-[#0A2E2C]"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A2E2C]/50" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={isSignUp}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-xs text-[#0A2E2C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A2E2C]/50 hover:text-[#0A2E2C]"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4 text-[#F5DABF]" />
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="text-center text-xs text-[#0A2E2C]/80 pt-2 font-medium">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => toggleMode(false)}
                className="font-bold text-[#6C151E] hover:underline cursor-pointer ml-1"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => toggleMode(true)}
                className="font-bold text-[#6C151E] hover:underline cursor-pointer ml-1"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
