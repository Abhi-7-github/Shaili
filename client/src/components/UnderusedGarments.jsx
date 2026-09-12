import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';
import { getUnderusedItems } from '../services/wardrobeApi';
import ColorSwatch from './ColorSwatch';

export const UnderusedGarments = ({ onStyleWithItem }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUnderused = async () => {
      setLoading(true);
      try {
        const res = await getUnderusedItems();
        if (res.success && Array.isArray(res.data)) {
          setItems(res.data);
        }
      } catch (err) {
        console.error('Fetch underused items error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUnderused();
  }, []);

  if (loading) return null;
  if (!items || items.length === 0) return null;

  return (
    <section className="bg-[#FAF4ED] border border-[#F5DABF] rounded-3xl p-6 sm:p-8 shadow-md space-y-6 my-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5DABF] pb-4">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#6C151E] font-bold flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-[#6C151E]" /> Wardrobe Optimization
          </span>
          <h3 className="font-serif text-2xl sm:text-4xl font-bold text-[#0A2E2C] mt-1">
            Give Your Forgotten Pieces Another Look
          </h3>
        </div>
        <span className="text-xs text-[#0A2E2C]/70 font-mono font-bold">
          {items.length} items logged with low wear count
        </span>
      </div>

      {/* Grid of Underused Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.slice(0, 6).map((item) => {
          const timesWorn = item.timesWorn || 0;
          const pairSuggestion = item.pairingSuggestion || `Try pairing it with your neutral bottoms for a fresh smart-casual look.`;

          return (
            <motion.div
              key={item._id}
              whileHover={{ y: -3 }}
              className="bg-white border border-[#F5DABF] rounded-2xl p-4 shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="flex gap-4 items-start">
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-[#FAF4ED] flex-shrink-0 border border-[#F5DABF]">
                  <img
                    src={item.imageUrl || item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1.5 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6C151E] text-[#FAF4ED]">
                    Worn {timesWorn} {timesWorn === 1 ? 'time' : 'times'}
                  </span>
                  <h4 className="font-serif text-base font-bold text-[#0A2E2C]">
                    {item.title || `${item.primaryColor || ''} ${item.garmentType || 'Garment'}`}
                  </h4>
                  <ColorSwatch colorName={item.primaryColor} size="sm" />
                </div>
              </div>

              {/* Pairing Recommendation */}
              <div className="bg-[#FAF4ED] p-3 rounded-xl border border-[#F5DABF] text-xs text-[#0A2E2C] italic font-medium">
                "{pairSuggestion}"
              </div>

              {/* CTA */}
              <button
                type="button"
                onClick={() => onStyleWithItem && onStyleWithItem(item)}
                className="w-full py-2.5 px-3 bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F5DABF]" />
                Style This Item
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default UnderusedGarments;
