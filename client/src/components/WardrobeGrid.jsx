import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, RefreshCw } from 'lucide-react';
import WardrobeCard from './WardrobeCard';
import GarmentDetails from './GarmentDetails';
import UploadWardrobe from './UploadWardrobe';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import { getWardrobe, deleteWardrobeItem } from '../services/wardrobeApi';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories'];
const COLOR_OPTIONS = ['All', 'White', 'Black', 'Blue', 'Navy', 'Green', 'Brown', 'Beige', 'Grey', 'Red'];
const STYLES = ['All', 'Casual', 'Smart Casual', 'Formal', 'Streetwear', 'Ethnic', 'Minimal', 'Party'];
const SEASONS = ['All', 'Summer', 'Winter', 'Spring', 'Autumn', 'All-Season'];

export const WardrobeGrid = ({ onOpenStylistWithGarment }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('All');

  // Modals state
  const [selectedItem, setSelectedItem] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchWardrobe = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {};
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      if (selectedColor !== 'All') filters.color = selectedColor;
      if (selectedStyle !== 'All') filters.style = selectedStyle;
      if (selectedSeason !== 'All' && selectedSeason !== 'All-Season') filters.season = selectedSeason;

      const res = await getWardrobe(filters);
      if (res.success && Array.isArray(res.data)) {
        setItems(res.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Fetch wardrobe failed:', err);
      setError(err.message || 'Failed to load wardrobe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardrobe();
  }, [selectedCategory, selectedColor, selectedStyle, selectedSeason]);

  // Client-side search filtering
  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.garmentType && item.garmentType.toLowerCase().includes(q)) ||
      (item.type && item.type.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.primaryColor && item.primaryColor.toLowerCase().includes(q)) ||
      (item.secondaryColor && item.secondaryColor.toLowerCase().includes(q)) ||
      (item.style && item.style.toLowerCase().includes(q)) ||
      (item.material && item.material.toLowerCase().includes(q)) ||
      (item.pattern && item.pattern.toLowerCase().includes(q))
    );
  });

  const handleUpdateItem = (updated) => {
    setItems((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    if (selectedItem && selectedItem._id === updated._id) {
      setSelectedItem(updated);
    }
  };

  const handleDeleteItem = async (id, skipApi = false) => {
    if (!id) return;
    if (!skipApi) {
      if (!window.confirm('Are you sure you want to delete this garment from your wardrobe?')) {
        return;
      }
      try {
        await deleteWardrobeItem(id);
      } catch (err) {
        console.error('Delete garment failed:', err);
        alert(err.message || 'Failed to delete garment.');
        return;
      }
    }
    setItems((prev) => prev.filter((i) => i._id !== id));
    if (selectedItem && selectedItem._id === id) {
      setSelectedItem(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#F5DABF] pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#6C151E] font-bold">
            Collection Overview
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A2E2C] mt-1">
            My Wardrobe
          </h1>
          <p className="text-xs text-[#0A2E2C]/70 mt-1 font-medium">
            {filteredItems.length} {filteredItems.length === 1 ? 'garment' : 'garments'} cataloged in your wardrobe
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="px-6 py-3 bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#F5DABF]" />
          <span>Upload New Garment</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="space-y-4 bg-white p-5 rounded-3xl border border-[#F5DABF] shadow-sm">
        {/* Top Row: Search & Category Pills */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0A2E2C]/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wardrobe by title, color, style..."
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-xs text-[#0A2E2C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A2E2C]/50 hover:text-[#0A2E2C] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#0F3D3A] text-[#FAF4ED] shadow-sm'
                      : 'bg-[#FAF4ED] text-[#0A2E2C] border border-[#F5DABF] hover:bg-[#F5DABF]/50'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Filter Selects */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-3 border-t border-[#F5DABF]/60 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-[#6C151E] uppercase tracking-wider mb-1">
              Color Filter
            </label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
            >
              {COLOR_OPTIONS.map((col) => (
                <option key={col} value={col}>
                  {col === 'All' ? 'All Colors' : col}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#6C151E] uppercase tracking-wider mb-1">
              Style Filter
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
            >
              {STYLES.map((st) => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Styles' : st}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#6C151E] uppercase tracking-wider mb-1">
              Season Filter
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
            >
              {SEASONS.map((sea) => (
                <option key={sea} value={sea}>
                  {sea === 'All' ? 'All Seasons' : sea}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('All');
                setSelectedColor('All');
                setSelectedStyle('All');
                setSelectedSeason('All');
                setSearch('');
              }}
              className="w-full py-2 px-3 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] hover:bg-[#F5DABF]/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#6C151E]" /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <LoadingState message="Loading your wardrobe collection..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="Your wardrobe is waiting."
          description={
            items.length === 0
              ? 'Upload your first piece and let ShAili start styling.'
              : 'No items match your active search and filters.'
          }
          actionLabel="Upload First Garment"
          onAction={() => setShowUploadModal(true)}
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 items-stretch"
        >
          {filteredItems.map((item) => (
            <WardrobeCard
              key={item._id}
              item={item}
              onSelect={setSelectedItem}
              onEdit={setSelectedItem}
              onDelete={() => handleDeleteItem(item._id)}
              onStyleWithItem={(garment) => {
                if (onOpenStylistWithGarment) onOpenStylistWithGarment(garment);
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Garment Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <GarmentDetails
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onUpdate={handleUpdateItem}
            onDeleteSuccess={(id) => handleDeleteItem(id, true)}
            onCreateOutfit={(item) => {
              if (onOpenStylistWithGarment) onOpenStylistWithGarment(item);
            }}
          />
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2E2C]/75 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl my-8"
            >
              <UploadWardrobe
                onUploadSuccess={(newItem) => {
                  setItems((prev) => [newItem, ...prev]);
                  setShowUploadModal(false);
                }}
                onClose={() => setShowUploadModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardrobeGrid;
