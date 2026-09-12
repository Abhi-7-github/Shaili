import React from "react";
import { Logo } from "./Logo";

export const Footer = ({
  activeTab = "home",
  onTabChange = () => {},
  onOpenStudio = () => {},
}) => {
  const navigation = [
    { id: "home", label: "Home" },
    { id: "wardrobe", label: "My Wardrobe" },
    { id: "stylist", label: "AI Stylist" },
    { id: "studio", label: "Outfit Studio" },
    { id: "insights", label: "Style Insights" },
  ];

  const handleNavigation = (id) => {
    if (id === "studio") {
      onOpenStudio();
    }
    onTabChange(id);
  };

  return (
    <footer className="bg-[#0A2E2C] text-[#FAF4ED] border-t border-[#F5DABF]/30 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 mt-16 select-none">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* MAIN FOOTER CONTENT */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">
          
          {/* BRAND */}
          <div className="md:col-span-5 space-y-4">
            <Logo variant="dark" size="medium" />

            <p className="font-serif text-lg font-bold text-[#F5DABF] tracking-tight">
              Where Indian Culture Meets AI in Fashion.
            </p>

            <p className="text-xs text-[#FAF4ED]/80 leading-relaxed max-w-sm font-medium">
              Intelligent wardrobe curation and personalized outfit recommendations built around what you already own.
            </p>
          </div>

          {/* NAVIGATION LINKS */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#F5DABF]">
              Editorial Suite
            </h3>

            <div className="flex flex-col space-y-2 text-xs font-semibold">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigation(item.id)}
                  className={`text-left transition-colors cursor-pointer py-1 ${
                    activeTab === item.id
                      ? "text-[#F5DABF] font-bold"
                      : "text-[#FAF4ED]/70 hover:text-[#FAF4ED]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* NEWSLETTER */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#F5DABF]">
              The ShAili Edit
            </h3>

            <p className="text-xs text-[#FAF4ED]/80 leading-relaxed font-medium">
              Stay inspired with curated styling insights and contemporary Indian fashion stories.
            </p>

            <form
              className="flex gap-2 pt-1"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F5DABF]/40 bg-[#0F3D3A] text-xs text-[#FAF4ED] placeholder-[#FAF4ED]/50 focus:outline-none focus:ring-2 focus:ring-[#F5DABF]"
              />

              <button
                type="submit"
                className="px-4 py-2.5 bg-[#6C151E] hover:bg-[#541017] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex-shrink-0 cursor-pointer"
              >
                Subscribe →
              </button>
            </form>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="pt-8 border-t border-[#F5DABF]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#FAF4ED]/60 font-mono">
          <div>
            © 2026 SHAILI FASHION TECH <span className="text-[#6C151E]"> • </span> All Rights Reserved
          </div>

          <div className="flex gap-4">
            <button type="button" className="hover:text-[#FAF4ED] transition-colors cursor-pointer">
              Privacy Protocol
            </button>
            <span>·</span>
            <button type="button" className="hover:text-[#FAF4ED] transition-colors cursor-pointer">
              Terms of Service
            </button>
            <span>·</span>
            <button type="button" className="hover:text-[#FAF4ED] transition-colors cursor-pointer">
              Security Overview
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
