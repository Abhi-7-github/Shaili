import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, Sparkles, Check, X, Edit3, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { analyzeWardrobeItem, uploadWardrobeItem } from '../services/wardrobeApi';

const CATEGORIES = [
  { label: 'Tops', value: 'top' },
  { label: 'Bottoms', value: 'bottom' },
  { label: 'Outerwear', value: 'outerwear' },
  { label: 'Footwear', value: 'footwear' },
  { label: 'Accessories', value: 'accessory' },
  { label: 'Dresses & Ethnic', value: 'dress' },
];

const STYLES = [
  { label: 'Casual', value: 'casual' },
  { label: 'Smart Casual', value: 'smart-casual' },
  { label: 'Formal', value: 'formal' },
  { label: 'Streetwear', value: 'streetwear' },
  { label: 'Ethnic', value: 'ethnic' },
  { label: 'Sporty', value: 'sporty' },
  { label: 'Party', value: 'party' },
  { label: 'Traditional', value: 'traditional' },
];

const PATTERNS = [
  { label: 'Solid', value: 'solid' },
  { label: 'Striped', value: 'striped' },
  { label: 'Checked', value: 'checked' },
  { label: 'Printed', value: 'printed' },
  { label: 'Floral', value: 'floral' },
  { label: 'Textured', value: 'textured' },
  { label: 'Other', value: 'other' },
];

const MATERIALS = [
  { label: 'Cotton', value: 'cotton' },
  { label: 'Denim', value: 'denim' },
  { label: 'Wool', value: 'wool' },
  { label: 'Linen', value: 'linen' },
  { label: 'Silk', value: 'silk' },
  { label: 'Synthetic', value: 'synthetic' },
  { label: 'Leather', value: 'leather' },
  { label: 'Unknown', value: 'unknown' },
];

const SEASONS = [
  { label: 'Summer', value: 'summer' },
  { label: 'Winter', value: 'winter' },
  { label: 'Monsoon', value: 'monsoon' },
  { label: 'Spring', value: 'spring' },
  { label: 'Autumn', value: 'autumn' },
];

const OCCASIONS_LIST = [
  { label: 'Casual', value: 'casual' },
  { label: 'College', value: 'college' },
  { label: 'Office', value: 'office' },
  { label: 'Party', value: 'party' },
  { label: 'Wedding', value: 'wedding' },
  { label: 'Travel', value: 'travel' },
];

export const UploadWardrobe = ({ onUploadSuccess, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('select'); // 'select' | 'analyzed'

  const [metadata, setMetadata] = useState({
    title: '',
    category: 'top',
    garmentType: 'Shirt',
    primaryColor: 'white',
    secondaryColor: '',
    pattern: 'solid',
    material: 'cotton',
    style: 'casual',
    formality: 2,
    season: ['summer'],
    occasions: ['casual'],
  });

  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    handleAnalyze(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setError(null);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      handleAnalyze(file);
    }
  };

  const handleAnalyze = async (file) => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeWardrobeItem(file);
      if (res.success && res.data) {
        const d = res.data.metadata || res.data;
        setMetadata({
          title: d.title || `${d.primaryColor || ''} ${d.garmentType || d.type || 'Garment'}`.trim(),
          category: String(d.category || 'top').toLowerCase(),
          garmentType: d.garmentType || d.type || 'Shirt',
          primaryColor: String(d.primaryColor || 'white').toLowerCase(),
          secondaryColor: String(d.secondaryColor || '').toLowerCase(),
          pattern: String(d.pattern || 'solid').toLowerCase(),
          material: String(d.material || 'cotton').toLowerCase(),
          style: String(d.style || 'casual').toLowerCase(),
          formality: Number(d.formality) || 3,
          season: Array.isArray(d.seasons || d.season)
            ? (d.seasons || d.season).map((s) => String(s).toLowerCase())
            : [String(d.season || 'summer').toLowerCase()],
          occasions: Array.isArray(d.occasions)
            ? d.occasions.map((o) => String(o).toLowerCase())
            : [String(d.occasions || 'casual').toLowerCase()],
        });
        setStep('analyzed');
      } else {
        setStep('analyzed');
      }
    } catch (err) {
      console.error('Analyze failed, allowing manual entry:', err);
      setStep('analyzed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) {
      setError('Please select an image first.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...metadata,
        type: metadata.garmentType || 'Garment',
        seasons: metadata.season || ['summer'],
      };
      const res = await uploadWardrobeItem(selectedFile, payload);
      if (res.success) {
        if (onUploadSuccess) onUploadSuccess(res.data);
        if (onClose) onClose();
      } else {
        setError(res.error?.message || 'Failed to save item to wardrobe.');
      }
    } catch (err) {
      setError(err.message || 'Error saving item.');
    } finally {
      setSaving(false);
    }
  };

  const handleOccasionToggle = (occVal) => {
    setMetadata((prev) => {
      const current = prev.occasions || [];
      const updated = current.includes(occVal)
        ? current.filter((item) => item !== occVal)
        : [...current, occVal];
      return { ...prev, occasions: updated };
    });
  };

  const handleSeasonToggle = (seaVal) => {
    setMetadata((prev) => {
      const current = prev.season || [];
      const updated = current.includes(seaVal)
        ? current.filter((item) => item !== seaVal)
        : [...current, seaVal];
      return { ...prev, season: updated };
    });
  };

  return (
    <div className="bg-[#FAF4ED] rounded-3xl p-6 md:p-8 max-w-4xl mx-auto border border-[#F5DABF] shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#F5DABF] mb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-[#0A2E2C] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#6C151E]" />
            Add Garment to Wardrobe
          </h2>
          <p className="text-xs text-[#0A2E2C]/70 mt-1">
            Upload an image of your clothing. ShAili AI will auto-detect style & details.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F5DABF]/50 text-[#0A2E2C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-[#6C151E]/10 text-[#6C151E] text-xs font-semibold flex items-start gap-3 border border-[#6C151E]/30">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {step === 'select' && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#0F3D3A]/40 hover:border-[#0F3D3A] rounded-3xl p-12 text-center cursor-pointer transition-all bg-white/80 hover:bg-white flex flex-col items-center justify-center min-h-[320px] group shadow-xs"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="w-16 h-16 rounded-2xl bg-[#0F3D3A] text-[#F5DABF] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#0A2E2C] mb-1">
            Drag and drop your garment photo
          </h3>
          <p className="text-xs text-[#0A2E2C]/70 max-w-xs mb-4">
            Supports PNG, JPG, WEBP. Clear photos on neutral background give best AI results.
          </p>
          <span className="px-6 py-3 bg-[#0F3D3A] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#0A2E2C] transition-colors shadow-sm">
            Browse Files
          </span>
        </div>
      )}

      {analyzing && (
        <div className="py-16 text-center space-y-4">
          <Loader2 className="w-10 h-10 text-[#0F3D3A] animate-spin mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-[#0A2E2C]">
            Analyzing your garment...
          </h3>
          <p className="text-xs text-[#6C151E] font-mono font-bold uppercase tracking-widest">
            Extracting category, colors, patterns, and style attributes
          </p>
        </div>
      )}

      {step === 'analyzed' && !analyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Image Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-[#FAF4ED] border border-[#F5DABF] aspect-3/4 shadow-md">
              <img
                src={previewUrl}
                alt="Garment Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setStep('select');
                  setSelectedFile(null);
                  setPreviewUrl('');
                }}
                className="absolute top-3 right-3 p-2 bg-[#0A2E2C]/80 hover:bg-[#0A2E2C] text-[#FAF4ED] rounded-full text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1 shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Re-upload
              </button>
            </div>
            <p className="text-xs text-center text-[#6C151E] font-semibold italic">
              ✦ AI Analysis complete. You can refine any detected fields below.
            </p>
          </div>

          {/* Metadata Editor Form */}
          <div className="lg:col-span-7 space-y-5 bg-white p-6 rounded-3xl border border-[#F5DABF] shadow-sm">
            <h3 className="font-serif text-lg font-bold text-[#0A2E2C] flex items-center gap-2 border-b border-[#F5DABF] pb-3">
              <Edit3 className="w-4 h-4 text-[#6C151E]" />
              Detected Information
            </h3>

            {/* Title / Name */}
            <div>
              <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
                Item Title
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3D3A] font-semibold"
                placeholder="e.g. White Linen Casual Shirt"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={metadata.category}
                  onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Garment Type */}
              <div>
                <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
                  Garment Type
                </label>
                <input
                  type="text"
                  value={metadata.garmentType}
                  onChange={(e) => setMetadata({ ...metadata, garmentType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
                  placeholder="Shirt, Jeans, Kurta, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Primary Color */}
              <div>
                <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
                  Primary Color
                </label>
                <input
                  type="text"
                  value={metadata.primaryColor}
                  onChange={(e) => setMetadata({ ...metadata, primaryColor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
                />
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
                  Secondary Color
                </label>
                <input
                  type="text"
                  value={metadata.secondaryColor}
                  onChange={(e) => setMetadata({ ...metadata, secondaryColor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Pattern */}
              <div>
                <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
                  Pattern
                </label>
                <select
                  value={metadata.pattern}
                  onChange={(e) => setMetadata({ ...metadata, pattern: e.target.value })}
                  className="w-full px-2 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
                >
                  {PATTERNS.map((pat) => (
                    <option key={pat.value} value={pat.value}>
                      {pat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
                  Material
                </label>
                <select
                  value={metadata.material}
                  onChange={(e) => setMetadata({ ...metadata, material: e.target.value })}
                  className="w-full px-2 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
                >
                  {MATERIALS.map((mat) => (
                    <option key={mat.value} value={mat.value}>
                      {mat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Style */}
              <div>
                <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1">
                  Style
                </label>
                <select
                  value={metadata.style}
                  onChange={(e) => setMetadata({ ...metadata, style: e.target.value })}
                  className="w-full px-2 py-2 rounded-xl border border-[#F5DABF] bg-[#FAF4ED] text-[#0A2E2C] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F3D3A]"
                >
                  {STYLES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seasons */}
            <div>
              <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1.5">
                Season
              </label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((sea) => {
                  const isSelected = metadata.season?.includes(sea.value);
                  return (
                    <button
                      key={sea.value}
                      type="button"
                      onClick={() => handleSeasonToggle(sea.value)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#0F3D3A] text-[#FAF4ED]'
                          : 'bg-[#FAF4ED] text-[#0A2E2C] border border-[#F5DABF] hover:bg-[#F5DABF]/50'
                      }`}
                    >
                      {sea.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Occasions */}
            <div>
              <label className="block text-xs font-bold text-[#0A2E2C] uppercase tracking-wider mb-1.5">
                Occasions
              </label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS_LIST.map((occ) => {
                  const isSelected = metadata.occasions?.includes(occ.value);
                  return (
                    <button
                      key={occ.value}
                      type="button"
                      onClick={() => handleOccasionToggle(occ.value)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#6C151E] text-[#FAF4ED]'
                          : 'bg-[#FAF4ED] text-[#0A2E2C] border border-[#F5DABF] hover:bg-[#F5DABF]/50'
                      }`}
                    >
                      {occ.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4 flex justify-end gap-3 border-t border-[#F5DABF]">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-[#F5DABF] text-[#0A2E2C] text-xs font-bold hover:bg-[#FAF4ED] transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-[#0F3D3A] hover:bg-[#0A2E2C] text-[#FAF4ED] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#F5DABF]" /> Save to Wardrobe
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadWardrobe;
