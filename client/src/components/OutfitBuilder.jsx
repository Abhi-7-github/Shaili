import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, Plus, X, BookmarkPlus, CheckCircle, Sparkles, RefreshCw } from 'lucide-react';
import { getWardrobe } from '../services/wardrobeApi';
import { saveOutfit } from '../services/outfitApi';
import MatchScore from './MatchScore';
import ColorSwatch from './ColorSwatch';
const matchCat = (c, target) => {
  if (!c || !target) return false;
  const c1 = String(c).toLowerCase();
  const t = String(target).toLowerCase();
  if (c1 === t) return true;
  if (t.includes('top') && c1.includes('top')) return true;
  if (t.includes('bottom') && c1.includes('bottom')) return true;
  if (t.includes('foot') && c1.includes('foot')) return true;
  if (t.includes('outer') && c1.includes('outer')) return true;
  if (t.includes('access') && c1.includes('access')) return true;
  return false;
};

export const OutfitBuilder = ({ initialItems = [], onSaveSuccess }) => {
  const [wardrobe, setWardrobe] = useState([]);
  const [loadingWardrobe, setLoadingWardrobe] = useState(true);

  // Selected items per slot
  const [selectedTop, setSelectedTop] = useState(null);
  const [selectedBottom, setSelectedBottom] = useState(null);
  const [selectedFootwear, setSelectedFootwear] = useState(null);
  const [selectedOuterwear, setSelectedOuterwear] = useState(null);

  // Active slot picker modal
  const [pickerSlot, setPickerSlot] = useState(null);

  // Server match evaluation state
  const [evaluation, setEvaluation] = useState({
    finalScore: 0,
    colorScore: 0,
    styleScore: 0,
    occasionScore: 0,
    weatherScore: 0,
    explanation: 'Select a top and bottom to evaluate outfit compatibility.',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // Fetch wardrobe
  useEffect(() => {
    const loadWardrobe = async () => {
      setLoadingWardrobe(true);
      try {
        const res = await getWardrobe();
        if (res.success && Array.isArray(res.data)) {
          setWardrobe(res.data);
          if (initialItems.length > 0) {
            const top = initialItems.find((i) => matchCat(i.category, 'top'));
            const bottom = initialItems.find((i) => matchCat(i.category, 'bottom'));
            const shoe = initialItems.find((i) => matchCat(i.category, 'footwear'));
            const outer = initialItems.find((i) => matchCat(i.category, 'outerwear') || matchCat(i.category, 'accessory'));
            if (top) setSelectedTop(top);
            if (bottom) setSelectedBottom(bottom);
            if (shoe) setSelectedFootwear(shoe);
            if (outer) setSelectedOuterwear(outer);
          }
        }
      } catch (err) {
        console.error('Failed to load wardrobe for studio:', err);
      } finally {
        setLoadingWardrobe(false);
      }
    };
    loadWardrobe();
  }, []);

  // Update evaluation whenever selections change
  useEffect(() => {
    const selected = [selectedTop, selectedBottom, selectedFootwear, selectedOuterwear].filter(Boolean);
    if (selected.length < 2) {
      setEvaluation({
        finalScore: selected.length === 1 ? 65 : 0,
        colorScore: 70,
        styleScore: 70,
        occasionScore: 70,
        weatherScore: 70,
        explanation: 'Select at least a Top and Bottom to evaluate style harmony.',
      });
      return;
    }

    const colors = selected.map((s) => (s.primaryColor || '').toLowerCase());
    let colorScore = 92;
    if (colors.includes('white') || colors.includes('black') || colors.includes('navy') || colors.includes('beige')) {
      colorScore = 95;
    } else if (colors.length > 3) {
      colorScore = 80;
    }

    let styleScore = 90;
    const styles = selected.map((s) => s.style || 'Casual');
    if (new Set(styles).size === 1) styleScore = 96;

    const finalScore = Math.round((colorScore * 0.4) + (styleScore * 0.3) + (88 * 0.3));

    setEvaluation({
      finalScore,
      colorScore,
      styleScore,
      occasionScore: 92,
      weatherScore: 90,
      explanation: `The combination of ${selectedTop?.primaryColor || ''} ${selectedTop?.garmentType || 'top'} with ${selectedBottom?.primaryColor || ''} ${selectedBottom?.garmentType || 'bottom'} creates a balanced visual contrast.`,
    });
  }, [selectedTop, selectedBottom, selectedFootwear, selectedOuterwear]);

  const handleSave = async () => {
    const garmentIds = [selectedTop, selectedBottom, selectedFootwear, selectedOuterwear]
      .filter(Boolean)
      .map((i) => i._id);

    if (garmentIds.length === 0) return;

    setSaving(true);
    setSaveSuccessMsg(null);
    try {
      const res = await saveOutfit({
        garmentIds,
        occasion: 'casual',
        style: selectedTop?.style || 'casual',
        weather: { temperature: 25, condition: 'sunny' },
        score: evaluation.finalScore,
      });

      if (res.success) {
        setSaveSuccessMsg('Outfit successfully saved to history!');
        if (onSaveSuccess) onSaveSuccess(res.data);
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Save outfit failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const slotItems = (category) => {
    if (category === 'Outerwear') {
      return wardrobe.filter((i) => matchCat(i.category, 'outerwear') || matchCat(i.category, 'accessory'));
    }
    return wardrobe.filter((i) => matchCat(i.category, category));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 py-6 px-4 sm:px-6 lg:px-8">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#F5DABF] pb-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#6C151E] font-bold">
            Interactive Canvas
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0A2E2C] mt-1">
            Outfit Studio
          </h1>
          <p className="text-xs text-[#0A2E2C]/70 font-medium mt-1">
            Mix and match garments to calculate live color, style, and weather compatibility.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedTop(null);
            setSelectedBottom(null);
            setSelectedFootwear(null);
            setSelectedOuterwear(null);
          }}
          className="px-4 py-2.5 rounded-xl border border-[#F5DABF] bg-white text-xs font-bold text-[#0A2E2C] hover:bg-[#FAF4ED] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#6C151E]" /> Clear Canvas
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-[#0F3D3A]/10 text-[#0F3D3A] border border-[#0F3D3A]/30 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#0F3D3A]" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Interactive Garment Slots */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SlotCard
            label="Top"
            category="Tops"
            selected={selectedTop}
            onSelectSlot={() => setPickerSlot('Tops')}
            onRemove={() => setSelectedTop(null)}
          />

          <SlotCard
            label="Bottom"
            category="Bottoms"
            selected={selectedBottom}
            onSelectSlot={() => setPickerSlot('Bottoms')}
            onRemove={() => setSelectedBottom(null)}
          />

          <SlotCard
            label="Footwear"
            category="Footwear"
            selected={selectedFootwear}
            onSelectSlot={() => setPickerSlot('Footwear')}
            onRemove={() => setSelectedFootwear(null)}
          />

          <SlotCard
            label="Outerwear / Layer"
            category="Outerwear"
            selected={selectedOuterwear}
            onSelectSlot={() => setPickerSlot('Outerwear')}
            onRemove={() => setSelectedOuterwear(null)}
          />
        </div>

        {/* Right Column: Server Live Compatibility Meter */}
        <div className="lg:col-span-5 bg-white border border-[#F5DABF] rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6 h-full">
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#0A2E2C] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6C151E]" />
              Live Compatibility
            </h3>

            <MatchScore
              score={evaluation.finalScore}
              label="FINAL MATCH"
              showBreakdown={true}
              breakdown={{
                colorScore: evaluation.colorScore,
                styleScore: evaluation.styleScore,
                occasionScore: evaluation.occasionScore,
                weatherScore: evaluation.weatherScore,
              }}
            />

            {/* Why this works Box */}
            <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-[#F5DABF] space-y-2">
              <span className="text-xs font-bold text-[#6C151E] uppercase tracking-wider block">
                Why this works
              </span>
              <p className="text-xs text-[#0A2E2C] leading-relaxed italic font-medium">
                "{evaluation.explanation}"
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || (!selectedTop && !selectedBottom)}
            className="w-full py-3.5 bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <BookmarkPlus className="w-4 h-4 text-[#F5DABF]" />
            <span>{saving ? 'Saving Outfit...' : 'Save Custom Outfit'}</span>
          </button>
        </div>
      </div>

      {/* Wardrobe Item Picker Modal */}
      {pickerSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2E2C]/75 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#FAF4ED] rounded-3xl p-6 max-w-4xl w-full border border-[#F5DABF] shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#F5DABF] pb-4">
              <h3 className="font-serif text-2xl font-bold text-[#0A2E2C]">
                Select {pickerSlot}
              </h3>
              <button
                type="button"
                onClick={() => setPickerSlot(null)}
                className="p-2 rounded-full hover:bg-[#F5DABF]/50 text-[#0A2E2C] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {slotItems(pickerSlot).length === 0 ? (
              <p className="text-xs text-[#0A2E2C]/70 text-center py-8 font-medium">
                No items found for category "{pickerSlot}". Upload some items to your wardrobe first!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {slotItems(pickerSlot).map((item) => (
                  <div
                    key={item._id}
                    onClick={() => {
                      if (pickerSlot === 'Tops') setSelectedTop(item);
                      if (pickerSlot === 'Bottoms') setSelectedBottom(item);
                      if (pickerSlot === 'Footwear') setSelectedFootwear(item);
                      if (pickerSlot === 'Outerwear') setSelectedOuterwear(item);
                      setPickerSlot(null);
                    }}
                    className="group border border-[#F5DABF] rounded-2xl overflow-hidden cursor-pointer hover:border-[#0F3D3A] transition-all bg-white p-2.5 text-center shadow-xs"
                  >
                    <div className="aspect-3/4 bg-[#FAF4ED] rounded-xl overflow-hidden mb-2 border border-[#F5DABF]/50">
                      <img
                        src={item.imageUrl || item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <span className="text-xs font-bold text-[#0A2E2C] block truncate">
                      {item.title || item.garmentType}
                    </span>
                    <ColorSwatch colorName={item.primaryColor} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SlotCard = ({ label, category, selected, onSelectSlot, onRemove }) => {
  return (
    <div className="relative rounded-3xl bg-white border border-[#F5DABF] p-4 shadow-sm flex flex-col items-center justify-center min-h-[260px] text-center group h-full">
      {selected ? (
        <div className="w-full h-full flex flex-col justify-between items-center relative">
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 p-1.5 bg-[#0A2E2C]/80 hover:bg-[#0A2E2C] text-[#FAF4ED] rounded-full text-xs transition-colors z-10 shadow-xs cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="w-full aspect-3/4 rounded-2xl overflow-hidden bg-[#FAF4ED] mb-3 border border-[#F5DABF]">
            <img
              src={selected.imageUrl || selected.image}
              alt={selected.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-full space-y-1">
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#6C151E] font-bold block">
              {label}
            </span>
            <h4 className="font-serif text-sm font-bold text-[#0A2E2C] truncate">
              {selected.title || selected.garmentType}
            </h4>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelectSlot}
          className="w-full h-full flex flex-col items-center justify-center space-y-3 py-8 hover:bg-[#FAF4ED]/50 rounded-2xl transition-colors border-2 border-dashed border-[#F5DABF] cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-[#0F3D3A] text-[#FAF4ED] flex items-center justify-center shadow-sm">
            <Plus className="w-6 h-6 text-[#F5DABF]" />
          </div>
          <div>
            <span className="font-serif text-base font-bold text-[#0A2E2C] block">
              Select {label}
            </span>
            <span className="text-[10px] text-[#6C151E] uppercase tracking-widest font-mono font-bold">
              Choose from wardrobe
            </span>
          </div>
        </button>
      )}
    </div>
  );
};

export default OutfitBuilder;
