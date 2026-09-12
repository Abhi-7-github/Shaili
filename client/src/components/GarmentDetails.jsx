import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import ColorSwatch from './ColorSwatch';
import { updateWardrobeItem, deleteWardrobeItem } from '../services/wardrobeApi';

export const GarmentDetails = ({
  item,
  onClose,
  onUpdate,
  onDeleteSuccess,
  onCreateOutfit,
  onMarkWorn,
}) => {
  if (!item) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...item });
  const [loading, setLoading] = useState(false);

  const handleSaveEdit = async () => {
    setLoading(true);
    try {
      const res = await updateWardrobeItem(item._id, formData);
      if (res.success && res.data) {
        if (onUpdate) onUpdate(res.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Update garment failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this garment from your wardrobe?')) return;
    setLoading(true);
    try {
      const res = await deleteWardrobeItem(item._id);
      if (res.success) {
        if (onDeleteSuccess) onDeleteSuccess(item._id);
        onClose();
      }
    } catch (err) {
      console.error('Delete garment failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkWornClick = async () => {
    setLoading(true);
    try {
      const updated = {
        timesWorn: (item.timesWorn || 0) + 1,
        lastWorn: new Date().toISOString(),
      };
      const res = await updateWardrobeItem(item._id, updated);
      if (res.success && res.data) {
        if (onUpdate) onUpdate(res.data);
        if (onMarkWorn) onMarkWorn(res.data);
      }
    } catch (err) {
      console.error('Mark worn failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const formattedLastWorn = item.lastWorn
    ? new Date(item.lastWorn).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Never logged';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2E2C]/75 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl bg-[#FAF4ED] rounded-3xl shadow-2xl overflow-hidden border border-[#F5DABF] my-8"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 bg-[#0A2E2C]/80 hover:bg-[#0A2E2C] text-[#FAF4ED] rounded-full transition-colors backdrop-blur-md shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Large Image Column */}
          <div className="md:col-span-6 bg-[#FAF4ED] relative aspect-3/4 md:aspect-auto min-h-[380px] border-b md:border-b-0 md:border-r border-[#F5DABF]">
            <img
              src={item.imageUrl || item.image}
              alt={item.title || item.garmentType}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-[#0A2E2C]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[#FAF4ED] text-xs font-bold uppercase tracking-wider shadow-sm">
              {item.category}
            </div>
          </div>

          {/* Details & Actions Column */}
          <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between space-y-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div>
                  <span className="text-xs uppercase font-mono tracking-widest text-[#6C151E] font-bold">
                    {item.style || 'Casual'} • {item.formality || 'Garment'}
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#0A2E2C] mt-1">
                    {item.title || `${item.primaryColor || ''} ${item.garmentType || 'Garment'}`}
                  </h2>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-[#F5DABF] text-xs shadow-xs">
                  <div>
                    <span className="text-[#6C151E] font-bold uppercase tracking-wider block mb-1">
                      Garment Type
                    </span>
                    <span className="font-bold text-[#0A2E2C] text-sm">
                      {item.garmentType || item.type || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6C151E] font-bold uppercase tracking-wider block mb-1">
                      Primary Color
                    </span>
                    <ColorSwatch colorName={item.primaryColor} size="md" />
                  </div>

                  <div>
                    <span className="text-[#6C151E] font-bold uppercase tracking-wider block mb-1">
                      Pattern
                    </span>
                    <span className="font-semibold text-[#0A2E2C]">
                      {item.pattern || 'Solid'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6C151E] font-bold uppercase tracking-wider block mb-1">
                      Material
                    </span>
                    <span className="font-semibold text-[#0A2E2C]">
                      {item.material || 'Cotton'}
                    </span>
                  </div>
                </div>

                {/* Tags (Seasons & Occasions) */}
                <div className="space-y-3">
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-[#0A2E2C] mb-1.5 block">
                      Seasons
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(item.season) ? item.season : [item.season || 'All-Season']).map(
                        (s) => (
                          <span
                            key={s}
                            className="px-3 py-1 rounded-full text-xs bg-[#FAF4ED] text-[#0A2E2C] border border-[#F5DABF] font-bold"
                          >
                            {s}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-[#0A2E2C] mb-1.5 block">
                      Occasions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(Array.isArray(item.occasions)
                        ? item.occasions
                        : [item.occasions || 'Casual']
                      ).map((occ) => (
                        <span
                          key={occ}
                          className="px-3 py-1 rounded-full text-xs bg-[#0F3D3A] text-[#FAF4ED] font-bold"
                        >
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Usage Stats Box */}
                <div className="bg-white border border-[#F5DABF] p-4 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                  <div>
                    <span className="text-[#6C151E] font-bold uppercase tracking-wider block">Times Worn</span>
                    <span className="font-serif text-3xl font-bold text-[#0A2E2C]">
                      {item.timesWorn || 0}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#6C151E] font-bold uppercase tracking-wider block">Last Worn</span>
                    <span className="font-bold text-[#0A2E2C]">
                      {formattedLastWorn}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Inline Edit Mode */
              <div className="space-y-4 text-xs">
                <h3 className="font-serif text-xl font-bold text-[#0A2E2C]">
                  Edit Garment Details
                </h3>

                <div>
                  <label className="block text-[#0A2E2C] font-bold mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#F5DABF] bg-white text-[#0A2E2C] font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#0A2E2C] font-bold mb-1">Garment Type</label>
                    <input
                      type="text"
                      value={formData.garmentType || ''}
                      onChange={(e) => setFormData({ ...formData, garmentType: e.target.value })}
                      className="w-full p-2 rounded-xl border border-[#F5DABF] bg-white text-[#0A2E2C] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0A2E2C] font-bold mb-1">Primary Color</label>
                    <input
                      type="text"
                      value={formData.primaryColor || ''}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full p-2 rounded-xl border border-[#F5DABF] bg-white text-[#0A2E2C] font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#0A2E2C] font-bold mb-1">Style</label>
                    <input
                      type="text"
                      value={formData.style || ''}
                      onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                      className="w-full p-2 rounded-xl border border-[#F5DABF] bg-white text-[#0A2E2C] font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0A2E2C] font-bold mb-1">Material</label>
                    <input
                      type="text"
                      value={formData.material || ''}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full p-2 rounded-xl border border-[#F5DABF] bg-white text-[#0A2E2C] font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl border border-[#F5DABF] text-[#0A2E2C] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={loading}
                    className="px-5 py-2 rounded-xl bg-[#0F3D3A] text-[#FAF4ED] font-bold uppercase tracking-wider"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons Bar */}
            {!isEditing && (
              <div className="space-y-3 pt-4 border-t border-[#F5DABF]">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (onCreateOutfit) onCreateOutfit(item);
                      onClose();
                    }}
                    className="w-full py-3 px-4 bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#F5DABF]" />
                    Create Outfit With This
                  </button>

                  <button
                    type="button"
                    onClick={handleMarkWornClick}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#FAF4ED] border border-[#F5DABF] hover:bg-[#F5DABF]/50 text-[#0A2E2C] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#0F3D3A]" />
                    Mark as Worn
                  </button>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold text-[#0A2E2C] hover:text-[#6C151E] flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#6C151E]" /> Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="text-xs font-bold text-[#6C151E] hover:text-[#541017] flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Garment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GarmentDetails;
