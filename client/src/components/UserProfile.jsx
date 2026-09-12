import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Camera, 
  LogOut, 
  Sparkles, 
  ShieldCheck, 
  Shirt, 
  Sliders, 
  Heart, 
  Trash2, 
  Check, 
  Upload, 
  UserCheck 
} from 'lucide-react';

export const UserProfile = () => {
  const { user, logout, updateProfilePhoto } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const userId = user?._id || user?.id || 'guest';
  const currentAvatar = user?.avatar || null;

  // Handle Photo Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    // Limit file size (5MB max before compression)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result;
      if (base64Url && updateProfilePhoto) {
        updateProfilePhoto(base64Url);
        setSuccessMsg('Profile photo updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
      setIsUploading(false);
    };

    reader.onerror = () => {
      setErrorMsg('Failed to process image. Please try again.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (updateProfilePhoto) {
      updateProfilePhoto(null);
      setSuccessMsg('Profile photo removed.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8 select-none">
      
      {/* Top Header Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0F3D3A] via-[#0A2E2C] to-[#0F3D3A] p-8 text-[#FAF4ED] shadow-2xl border border-[#F5DABF]/40 overflow-hidden">
        {/* Glow Accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#F5DABF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#6C151E]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          
          {/* Avatar Container with Upload Overlay */}
          <div className="relative group">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-[#F5DABF] bg-[#6C151E] shadow-xl overflow-hidden flex items-center justify-center relative">
              {currentAvatar ? (
                <img 
                  src={currentAvatar} 
                  alt={user?.name || 'User Profile'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif text-4xl sm:text-5xl font-bold text-[#F5DABF]">
                  {userInitial}
                </span>
              )}

              {/* Uploading Spinner overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-xs">
                  <div className="w-8 h-8 border-3 border-[#F5DABF] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Quick Camera Trigger Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 bg-[#F5DABF] text-[#0F3D3A] rounded-full shadow-lg border-2 border-[#0F3D3A] hover:bg-white transition-all transform hover:scale-105 cursor-pointer"
              title="Upload Profile Photo"
            >
              <Camera className="w-4 h-4 font-bold" />
            </button>
          </div>

          {/* User Basic Info Header */}
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF4ED]/10 border border-[#F5DABF]/30 text-xs text-[#F5DABF] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5DABF]" />
              <span>ShAili VIP Member</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">
              {user?.name || 'Valued User'}
            </h1>
            <p className="text-sm text-[#FAF4ED]/80 flex items-center justify-center md:justify-start gap-1.5 font-medium">
              <Mail className="w-4 h-4 text-[#F5DABF]" />
              <span>{user?.email || 'user@shaili.com'}</span>
            </p>
          </div>

          {/* Logout Button (Desktop View Top Right) */}
          <div className="mt-4 md:mt-0">
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-2xl bg-[#6C151E] hover:bg-[#521017] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider shadow-lg border border-[#F5DABF]/30 flex items-center gap-2 transition-all cursor-pointer hover:shadow-xl active:scale-95"
            >
              <LogOut className="w-4 h-4 text-[#F5DABF]" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-[#0F3D3A]/10 border border-[#0F3D3A]/30 text-[#0F3D3A] text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-[#0F3D3A]" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#6C151E]/10 border border-[#6C151E]/30 text-[#6C151E] text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Trash2 className="w-4 h-4 text-[#6C151E]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Photo Upload Actions & Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Photo Upload Control Center */}
        <div className="md:col-span-1 bg-white border border-[#F5DABF] rounded-3xl p-6 shadow-xl space-y-5">
          <h2 className="font-serif text-lg font-bold text-[#0A2E2C] flex items-center gap-2 border-b border-[#F5DABF]/50 pb-3">
            <Camera className="w-4 h-4 text-[#6C151E]" />
            <span>Profile Photo</span>
          </h2>

          <p className="text-xs text-[#0A2E2C]/70 leading-relaxed font-medium">
            Personalize your luxury digital wardrobe. Upload a clear portrait photo to enhance your style recommendations.
          </p>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#F5DABF]" />
              <span>Upload New Photo</span>
            </button>

            {currentAvatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="w-full py-2.5 px-4 rounded-xl bg-[#FAF4ED] hover:bg-[#6C151E]/10 text-[#6C151E] border border-[#6C151E]/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: User Account Details & Preferences */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Account Information Card */}
          <div className="bg-white border border-[#F5DABF] rounded-3xl p-6 shadow-xl space-y-5">
            <h2 className="font-serif text-lg font-bold text-[#0A2E2C] flex items-center gap-2 border-b border-[#F5DABF]/50 pb-3">
              <User className="w-4 h-4 text-[#0F3D3A]" />
              <span>Account Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-[#FAF4ED] border border-[#F5DABF]/60">
                <span className="block text-[10px] font-bold text-[#0A2E2C]/50 uppercase tracking-wider mb-0.5">
                  Full Name
                </span>
                <span className="text-xs font-bold text-[#0A2E2C]">
                  {user?.name || 'Not provided'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF4ED] border border-[#F5DABF]/60">
                <span className="block text-[10px] font-bold text-[#0A2E2C]/50 uppercase tracking-wider mb-0.5">
                  Email Address
                </span>
                <span className="text-xs font-bold text-[#0A2E2C]">
                  {user?.email || 'Not provided'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF4ED] border border-[#F5DABF]/60">
                <span className="block text-[10px] font-bold text-[#0A2E2C]/50 uppercase tracking-wider mb-0.5">
                  Style Preference Gender
                </span>
                <span className="text-xs font-bold text-[#0A2E2C] capitalize flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#6C151E]" />
                  {user?.gender || 'Women'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF4ED] border border-[#F5DABF]/60">
                <span className="block text-[10px] font-bold text-[#0A2E2C]/50 uppercase tracking-wider mb-0.5">
                  Account Status
                </span>
                <span className="text-xs font-bold text-[#0F3D3A] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#6C151E]" />
                  Active & Verified
                </span>
              </div>
            </div>
          </div>

          {/* Quick Features & Direct Actions Card */}
          <div className="bg-white border border-[#F5DABF] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-base font-bold text-[#0A2E2C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6C151E]" />
              <span>Quick Actions</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => navigate('/wardrobe')}
                className="p-3.5 rounded-2xl bg-[#FAF4ED] hover:bg-[#F5DABF]/40 border border-[#F5DABF] flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
              >
                <Shirt className="w-5 h-5 text-[#0F3D3A]" />
                <span className="text-[11px] font-bold text-[#0A2E2C]">My Wardrobe</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/studio')}
                className="p-3.5 rounded-2xl bg-[#FAF4ED] hover:bg-[#F5DABF]/40 border border-[#F5DABF] flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
              >
                <Sliders className="w-5 h-5 text-[#0F3D3A]" />
                <span className="text-[11px] font-bold text-[#0A2E2C]">Outfit Studio</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/aistyle')}
                className="p-3.5 rounded-2xl bg-[#FAF4ED] hover:bg-[#F5DABF]/40 border border-[#F5DABF] flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#6C151E]" />
                <span className="text-[11px] font-bold text-[#0A2E2C]">AI Stylist</span>
              </button>
            </div>

            {/* Direct Mobile Logout Button */}
            <div className="pt-2 md:hidden">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 rounded-xl bg-[#6C151E] hover:bg-[#521017] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-[#F5DABF]" />
                <span>Logout from ShAili</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default UserProfile;
