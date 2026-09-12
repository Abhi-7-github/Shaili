import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Menu,
  X,
  Home,
  Shirt,
  Sparkles,
  Sliders,
  BarChart3,
} from "lucide-react";
import { Logo } from "./Logo";
import "./Navbar.css";

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
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (id) => {
    if (id === "studio") {
      onOpenStudio();
    } else {
      onTabChange(id);
    }

    setMobileMenuOpen(false);
  };

  return (
    <header className="shaili-navbar">

      {/* =========================
          NAVBAR CONTAINER
      ========================== */}
      <div className="shaili-navbar-container">

        {/* =========================
            LOGO
        ========================== */}
        <button
          type="button"
          className="shaili-navbar-logo"
          onClick={() => onTabChange("home")}
          aria-label="ShAili Home"
        >
          <Logo variant="dark" size="small" showTagline={false} />
        </button>


        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}
        <nav className="shaili-navbar-navigation">

          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item.id)}
                className={`shaili-navbar-link ${
                  isActive ? "active" : ""
                }`}
              >
                {item.label}

                {isActive && (
                  <motion.span
                    layoutId="shaili-navbar-active"
                    className="shaili-navbar-active-line"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 32,
                    }}
                  />
                )}
              </button>
            );
          })}

        </nav>


        {/* =========================
            RIGHT ACTIONS
        ========================== */}
        <div className="shaili-navbar-actions">

          {/* Replay */}
          {onReplayIntro && (
            <button
              type="button"
              onClick={onReplayIntro}
              className="shaili-navbar-replay"
              title="Replay Intro Animation"
            >
              <RotateCcw className="shaili-replay-icon" />

              <span>
                Replay
              </span>
            </button>
          )}


          {/* Outfit Studio */}
          <button
            type="button"
            onClick={onOpenStudio}
            className="shaili-navbar-studio"
          >
            <Sparkles className="shaili-studio-icon" />

            <span>
              Outfit Studio
            </span>

            <span className="shaili-studio-arrow">
              →
            </span>
          </button>


          {/* Mobile Menu */}
          <button
            type="button"
            className="shaili-navbar-menu"
            onClick={() =>
              setMobileMenuOpen((previous) => !previous)
            }
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X />
            ) : (
              <Menu />
            )}
          </button>

        </div>

      </div>


      {/* =========================
          MOBILE MENU
      ========================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="shaili-mobile-wrapper"
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -8,
            }}
            transition={{
              duration: 0.2,
            }}
          >

            <div className="shaili-mobile-menu">

              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigation(item.id)}
                    className={`shaili-mobile-link ${
                      isActive ? "active" : ""
                    }`}
                  >

                    <span className="shaili-mobile-link-left">

                      <Icon />

                      <span>
                        {item.label}
                      </span>

                    </span>

                    {isActive && (
                      <span className="shaili-mobile-active-dot" />
                    )}

                  </button>
                );
              })}


              {/* Mobile Replay */}
              {onReplayIntro && (
                <button
                  type="button"
                  onClick={() => {
                    onReplayIntro();
                    setMobileMenuOpen(false);
                  }}
                  className="shaili-mobile-replay"
                >
                  <RotateCcw />

                  <span>
                    Replay Intro
                  </span>
                </button>
              )}

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
};

export default Navbar;
