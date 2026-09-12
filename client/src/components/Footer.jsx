import React from "react";
import { Logo } from "./Logo";
import "./Footer.css";

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
    } else {
      onTabChange(id);
    }
  };

  return (
    <footer className="shaili-footer">
      <div className="shaili-footer-container">
        {/* MAIN FOOTER */}
        <div className="shaili-footer-content">
          {/* BRAND */}
          <div className="shaili-footer-brand">
            <Logo variant="dark" size="medium" />

            <p className="shaili-footer-tagline">
              Where Indian Culture Meets AI in Fashion.
            </p>

            <p className="shaili-footer-description">
              Intelligent wardrobe curation and personalized outfit
              recommendations built around what you already own.
            </p>
          </div>

          {/* NAVIGATION */}
          <div className="shaili-footer-navigation">
            <h3 className="shaili-footer-heading">Editorial Suite</h3>

            <div className="shaili-footer-links">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigation(item.id)}
                  className={`shaili-footer-link ${
                    activeTab === item.id ? "active" : ""
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* NEWSLETTER */}
          <div className="shaili-footer-newsletter">
            <h3 className="shaili-footer-heading">The ShAili Edit</h3>

            <p className="shaili-footer-newsletter-text">
              Stay inspired with curated styling insights and contemporary
              Indian fashion stories.
            </p>

            <form
              className="shaili-footer-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="shaili-footer-input"
              />

              <button type="submit" className="shaili-footer-subscribe">
                Subscribe →
              </button>
            </form>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="shaili-footer-bottom">
          <div className="shaili-footer-copyright">
            © 2026 SHAILI FASHION TECH
            <span> • </span>
            All Rights Reserved
          </div>

          <div className="shaili-footer-legal">
            <button type="button">Privacy Protocol</button>
            <span>·</span>
            <button type="button">Terms of Service</button>
            <span>·</span>
            <button type="button">Security Overview</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
