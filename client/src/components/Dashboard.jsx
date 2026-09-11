import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { AiAssistant } from './AiAssistant';
import { LogOut } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shaili-portal-wrapper">
      {/* Navigation Header */}
      <header className="main-navbar">
        <div className="nav-left">
          <Logo size="small" />
        </div>

        <div className="nav-right">
          <div className="user-account-pill">
            <div className="avatar-circle">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info-text">
              <span className="user-greeting">{user?.name || 'User'}</span>
              {user?.gender && <span className="gender-tag-badge">{user.gender.toUpperCase()}</span>}
            </div>
            <button onClick={handleLogout} className="quick-logout-btn" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Home Hero Section */}
      <main className="dashboard-main-content">
        <div className="dashboard-hero-container">
          <div className="hero-text-block">
            <span className="hero-chapter">HAUTE TECH &amp; STYLE</span>
            <h1 className="hero-title">
              Welcome to <span className="title-serif-italic">Shaili</span>
            </h1>
            <p className="hero-desc">
              Where generative artificial intelligence meets Parisian haute couture. Tailored style recommendations, bespoke color silhouettes, and memory photo retrieval explicitly personalized for <strong>{user?.gender || 'women'}</strong>.
            </p>
          </div>

          <div className="hero-image-showcase">
            <img
              src="/images/hero_fashion.png"
              alt="SHAILI Haute Couture Collection"
              className="featured-fashion-image"
            />
            <div className="image-overlay-badge">
              <span>{(user?.gender || 'women').toUpperCase()} COUTURE SELECTION</span>
            </div>
          </div>
        </div>
      </main>


      {/* Footer Section */}
      <footer className="shaili-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <Logo size="small" />
              <p className="brand-quote">"Your Style. Your Identity."</p>
              <p className="brand-copy">
                Merging high-performance AI neural networks with bespoke haute couture tailoring for your personalized aesthetic.
              </p>
            </div>

            <div className="footer-links-group">
              <div className="link-col">
                <h5>ATELIER</h5>
                <a href="#collections">F/W Collection</a>
                <a href="#bespoke">Bespoke Fit</a>
                <a href="#atelier">Private Concierge</a>
              </div>

              <div className="link-col">
                <h5>HOUSE &amp; DATA</h5>
                <a href="#studio">Style DNA Studio</a>
                <a href="#algorithms">Design Algorithms</a>
                <a href="#workshop">The Paris Workshop</a>
              </div>

              <div className="link-col newsletter-col">
                <h5>THE DIGITAL NEWSLETTER</h5>
                <p>Receive weekly algorithmic insights, runway trend predictions, and private collection catalogs.</p>
                <form onSubmit={(e) => e.preventDefault()} className="newsletter-form">
                  <input type="email" placeholder="Enter your email address" required />
                  <button type="submit" className="subscribe-btn">Subscribe ➔</button>
                </form>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} SHAILI Haute Tech &amp; Style. All Rights Reserved.</p>
            <div className="legal-links">
              <a href="#privacy">Privacy Protection</a>
              <a href="#terms">Algorithmic Ethics</a>
              <a href="#contact">Contact Atelier</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Circular AI Assistant Button & Drawer */}
      <AiAssistant />
    </div>
  );
};
