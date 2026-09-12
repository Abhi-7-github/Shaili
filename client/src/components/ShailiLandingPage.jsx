import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { OpeningAnimation } from './OpeningAnimation';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { PageTransition } from './PageTransition';
import { AiAssistant } from './AiAssistant';

// Full pages & components
import Home from '../pages/Home';
import WardrobeGrid from './WardrobeGrid';
import Stylist from '../pages/Stylist';
import OutfitBuilder from './OutfitBuilder';
import Insights from './InsightsCard';
import OutfitHistory from './OutfitHistory';
import UserProfile from './UserProfile';

export const ShailiLandingPage = () => {
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // State for cross-tab garment passing
  const [prioritizedGarment, setPrioritizedGarment] = useState(null);
  const [studioItems, setStudioItems] = useState([]);

  // Map URL pathname to activeTab name
  const getTabFromPath = (path) => {
    const p = path.toLowerCase();
    if (p.includes('/aistyle') || p.includes('/aistylist') || p.includes('/stylist')) return 'stylist';
    if (p.includes('/wardrobe') || p.includes('/mywardrobe')) return 'wardrobe';
    if (p.includes('/studio') || p.includes('/outfitstudio')) return 'studio';
    if (p.includes('/insights') || p.includes('/styleinsights')) return 'insights';
    if (p.includes('/history')) return 'history';
    if (p.includes('/profile')) return 'profile';
    return 'home';
  };

  const getPathFromTab = (tab) => {
    switch (tab) {
      case 'stylist': return '/aistyle';
      case 'wardrobe': return '/wardrobe';
      case 'studio': return '/studio';
      case 'insights': return '/insights';
      case 'history': return '/history';
      case 'profile': return '/profile';
      default: return '/home';
    }
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleTabChange = (tab) => {
    const targetPath = getPathFromTab(tab);
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
    if (tab !== 'stylist') setPrioritizedGarment(null);
  };

  const handleAnimationComplete = () => {
    setShowOpeningAnimation(false);
  };

  const handleReplayIntro = () => {
    setShowOpeningAnimation(true);
  };

  const handleOpenStylistWithGarment = (garment) => {
    setPrioritizedGarment(garment);
    navigate('/aistyle');
  };

  const handleOpenStudioWithOutfit = (outfit) => {
    const items = outfit.items || outfit.garmentIds || outfit.garments || [];
    setStudioItems(items);
    navigate('/studio');
  };

  return (
    <div className="min-h-screen bg-[#FAF4ED] text-[#0A2E2C] font-sans selection:bg-[#6C151E]/20 relative overflow-x-hidden flex flex-col justify-between">
      {/* 1. Fullscreen Opening Animation */}
      <AnimatePresence mode="wait">
        {showOpeningAnimation && (
          <OpeningAnimation key="opening" onComplete={handleAnimationComplete} />
        )}
      </AnimatePresence>

      {/* 2. Main Web Application Content */}
      {!showOpeningAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="min-h-screen flex flex-col justify-between w-full"
        >
          {/* Top Navbar */}
          <Navbar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onReplayIntro={handleReplayIntro}
            onOpenStudio={() => navigate('/studio')}
            onOpenProfile={() => navigate('/profile')}
          />

          {/* Unified Container Main View */}
          <main className="flex-grow pt-4 pb-12 w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <PageTransition key="home-view">
                  <Home
                    onNavigate={handleTabChange}
                    onOpenStylistWithGarment={handleOpenStylistWithGarment}
                  />
                </PageTransition>
              )}

              {activeTab === 'wardrobe' && (
                <PageTransition key="wardrobe-view">
                  <WardrobeGrid
                    onOpenStylistWithGarment={handleOpenStylistWithGarment}
                  />
                </PageTransition>
              )}

              {activeTab === 'stylist' && (
                <PageTransition key="stylist-view">
                  <Stylist
                    initialGarment={prioritizedGarment}
                    onOpenStudioWithOutfit={handleOpenStudioWithOutfit}
                  />
                </PageTransition>
              )}

              {activeTab === 'studio' && (
                <PageTransition key="studio-view">
                  <OutfitBuilder initialItems={studioItems} />
                </PageTransition>
              )}

              {activeTab === 'insights' && (
                <PageTransition key="insights-view">
                  <Insights />
                </PageTransition>
              )}

              {activeTab === 'history' && (
                <PageTransition key="history-view">
                  <OutfitHistory
                    onOpenStudio={(items) => {
                      setStudioItems(items);
                      navigate('/studio');
                    }}
                  />
                </PageTransition>
              )}

              {activeTab === 'profile' && (
                <PageTransition key="profile-view">
                  <UserProfile />
                </PageTransition>
              )}
            </AnimatePresence>
          </main>

          {/* Footer */}
          <Footer
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onOpenStudio={() => navigate('/studio')}
          />
        </motion.div>
      )}

      {/* Floating AI Assistant Chatbot */}
      <AiAssistant />
    </div>
  );
};

export default ShailiLandingPage;
