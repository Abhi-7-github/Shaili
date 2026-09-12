import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Shirt, Sparkles, Sliders, BarChart3, User, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";

export const NAV_ITEMS = [
  { id: "home", label: "Home", icon: Home },
  { id: "wardrobe", label: "My Wardrobe", icon: Shirt },
  { id: "stylist", label: "AI Stylist", icon: Sparkles },
  { id: "studio", label: "Outfit Studio", icon: Sliders },
  { id: "insights", label: "Style Insights", icon: BarChart3 },
];

export const Navbar = ({
  activeTab = "home",
  onTabChange = () => {},
  onReplayIntro,
  onOpenStudio = () => {},
  onOpenProfile = () => {},
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const handleNavigation = (id) => {
    if (id === "studio") {
      onOpenStudio();
    }
    onTabChange(id);
    setMobileMenuOpen(false);
  };

  const displayName = user?.name || "Profile";
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : null;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF4ED]/95 backdrop-blur-md border-b border-[#F5DABF]/80 py-2.5 px-4 sm:px-6 lg:px-8 select-none shadow-xs">
      <div className="max-w-7xl mx-auto h-14 bg-[#0F3D3A] rounded-2xl px-4 sm:px-6 shadow-xl border border-[#F5DABF]/40 flex items-center justify-between">
        
        {/* LOGO */}
        <button
          type="button"
          onClick={() => handleNavigation("home")}
          className="flex items-center gap-2 cursor-pointer bg-transparent border-0"
          aria-label="ShAili Home"
        >
          <Logo variant="dark" size="small" showTagline={false} />
        </button>

        {/* DESKTOP NAVIGATION TABS */}
        <nav className="hidden md:flex items-center gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-[#6C151E] text-[#FAF4ED] shadow-md"
                    : "text-[#FAF4ED]/80 hover:text-[#FAF4ED] hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#F5DABF]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">
          {/* User Profile Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenProfile) onOpenProfile();
              else onTabChange("profile");
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#F5DABF]/40 bg-white/10 hover:bg-white/20 text-[#FAF4ED] text-xs font-bold transition-all cursor-pointer"
            title="User Profile"
          >
            <div className="w-6.5 h-6.5 rounded-full bg-[#6C151E] text-[#F5DABF] flex items-center justify-center font-bold text-[11px] overflow-hidden border border-[#F5DABF]/40">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : userInitial ? (
                <span>{userInitial}</span>
              ) : (
                <User className="w-3.5 h-3.5 text-[#F5DABF]" />
              )}
            </div>
            <span className="hidden sm:inline-block truncate max-w-[100px]">{displayName}</span>
          </button>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            className="md:hidden p-2 text-[#FAF4ED] hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            onClick={() => setMobileMenuOpen((previous) => !previous)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden max-w-7xl mx-auto mt-2"
          >
            <div className="p-3 rounded-2xl bg-[#0F3D3A] border border-[#F5DABF]/40 shadow-2xl space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-[#6C151E] text-[#FAF4ED]"
                        : "text-[#FAF4ED]/80 hover:bg-white/10 hover:text-[#FAF4ED]"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-[#F5DABF]" />
                      <span>{item.label}</span>
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#F5DABF]" />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                  else onTabChange("profile");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-xs font-bold text-[#FAF4ED]/80 hover:bg-white/10 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#6C151E] text-[#F5DABF] flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-3 h-3 text-[#F5DABF]" />
                  )}
                </div>
                <span>Profile ({displayName})</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
