import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  UploadCloud,
  Sparkles,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle2,
  ArrowRight,
  Shirt,
  User,
  Zap,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import './VirtualTryOn.css';

const SAMPLE_GARMENTS = [
  { id: 'outerwear', name: 'Editorial Coat', url: '/images/outerwear.png', category: 'upper' },
  { id: 'leather', name: 'Leather Jacket', url: '/images/leather.png', category: 'upper' },
  { id: 'tailoring', name: 'Tailored Blazer', url: '/images/tailoring.png', category: 'upper' },
  { id: 'polo', name: 'Polo Shirt', url: '/images/hero_fashion.png', category: 'upper' },
];

export const VirtualTryOn = ({ initialGarmentUrl, initialGarmentTitle, onClose, isModal = false }) => {
  const { token } = useAuth();

  // Person photo state
  const [selectedPersonFile, setSelectedPersonFile] = useState(null);
  const [personPreview, setPersonPreview] = useState(null);

  // Garment selection state (preset vs custom)
  const [isCustomGarment, setIsCustomGarment] = useState(false);
  const [customGarmentFile, setCustomGarmentFile] = useState(null);
  const [customGarmentPreview, setCustomGarmentPreview] = useState(null);

  const [garmentUrl, setGarmentUrl] = useState(initialGarmentUrl || SAMPLE_GARMENTS[0].url);
  const [garmentTitle, setGarmentTitle] = useState(initialGarmentTitle || SAMPLE_GARMENTS[0].name);
  const [category, setCategory] = useState('upper');

  // Generation & Result state
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState(null);
  const [currentRequestId, setCurrentRequestId] = useState(null);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  // Person photo file change
  const handlePersonFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file for your photo (JPEG, PNG, WEBP).');
      return;
    }

    setSelectedPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    setError(null);
    setErrorDetails(null);
    setResultImageUrl(null);
  };

  // Custom garment image upload
  const handleCustomGarmentChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid garment image file (JPEG, PNG, WEBP).');
      return;
    }

    setCustomGarmentFile(file);
    setCustomGarmentPreview(URL.createObjectURL(file));
    setIsCustomGarment(true);
    setGarmentTitle(`Custom Garment (${file.name})`);
    setError(null);
    setErrorDetails(null);
    setResultImageUrl(null);
  };

  // Select preset garment
  const handleSelectPresetGarment = (preset) => {
    setIsCustomGarment(false);
    setGarmentUrl(preset.url);
    setGarmentTitle(preset.name);
    setCategory(preset.category || 'upper');
    setError(null);
    setErrorDetails(null);
    setResultImageUrl(null);
  };

  // Virtual Try-On Form Submission
  const handleTryOnSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!selectedPersonFile) {
      setError('Please upload a photo of yourself first.');
      return;
    }

    // Enforce Garment Priority: Custom > Preset
    if (isCustomGarment && !customGarmentFile) {
      setError('Please select or upload a garment.');
      return;
    }

    if (!isCustomGarment && !garmentUrl) {
      setError('Please select or upload a garment.');
      return;
    }

    // 1. Clear previous result & generate unique Request ID
    const requestId = `VTON_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log(`[VTON UI] Starting request ID: ${requestId}`);

    setIsProcessing(true);
    setResultImageUrl(null);
    setCurrentRequestId(requestId);
    setError(null);
    setErrorDetails(null);

    const formData = new FormData();
    formData.append('personImage', selectedPersonFile);
    formData.append('category', category);
    formData.append('requestId', requestId);

    if (isCustomGarment && customGarmentFile) {
      formData.append('garmentImage', customGarmentFile);
      console.log(`[VTON UI] Appending custom garment file: ${customGarmentFile.name}`);
    } else {
      formData.append('garmentImageUrl', garmentUrl);
      console.log(`[VTON UI] Appending preset garment URL: ${garmentUrl}`);
    }

    try {
      const res = await fetch('/api/virtual-tryon', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Virtual Try-On generation failed.');
        setErrorDetails(data.details || null);
        setResultImageUrl(null);
      } else {
        setResultImageUrl(data.resultImageUrl);
      }
    } catch (err) {
      console.error('[Virtual Try-On Request Error]:', err);
      setError('Failed to connect to the server. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResultImageUrl(null);
    setError(null);
    setErrorDetails(null);
  };

  const containerContent = (
    <div className="vton-card-wrapper">
      {/* Top Header */}
      <div className="vton-header">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#6C151E] text-[#F5DABF] flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-6 h-6 text-[#F5DABF]" />
          </div>
          <div>
            <h1 className="vton-header-title">AI Virtual Try-On</h1>
            <p className="vton-header-subtitle">CatVTON Neural Garment Fitting Engine</p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#6C151E]/10 text-[#1C1A18] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Grid: Left = 38-40%, Right = 60-62% */}
      <div className="vton-main-grid">
        {/* Left Column: Controls / Inputs */}
        <div className="vton-left-panel">
          {/* Section 1: Person Photo */}
          <div className="vton-input-section">
            <div className="flex items-center justify-between mb-2.5">
              <span className="vton-section-label">
                <User className="w-3.5 h-3.5" /> Your Photo
              </span>
              {personPreview && (
                <span className="text-[10px] text-[#0F3D3A] font-bold font-mono uppercase bg-[#0F3D3A]/10 px-2 py-0.5 rounded-full">
                  Uploaded
                </span>
              )}
            </div>

            {personPreview ? (
              <div className="vton-person-photo-box group">
                <img src={personPreview} alt="User Preview" className="w-full h-full object-cover" />
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-xs font-mono uppercase font-bold">
                  Change Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePersonFileChange} />
                </label>
              </div>
            ) : (
              <label className="vton-person-dropzone">
                <UploadCloud className="w-8 h-8 text-[#6C151E] mb-1.5" />
                <p className="text-xs font-bold text-[#1C1A18] mb-0.5">Click or drag a portrait photo</p>
                <p className="text-[11px] text-[#5C544D]">Full-body or upper-body photo</p>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePersonFileChange} />
              </label>
            )}
          </div>

          {/* Section 2: Garment Selection & Custom Garment Upload */}
          <div className="vton-input-section space-y-3">
            <div className="flex items-center justify-between">
              <span className="vton-section-label">
                <Shirt className="w-3.5 h-3.5" /> Select / Upload Garment
              </span>
              {isCustomGarment ? (
                <span className="text-[10px] font-mono font-bold text-[#6C151E] bg-[#6C151E]/10 px-2 py-0.5 rounded-full">
                  ✓ Custom Garment
                </span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-[#5C544D] bg-gray-100 px-2 py-0.5 rounded-full">
                  Preset Garment
                </span>
              )}
            </div>

            {/* Custom Garment Upload Component */}
            <div className="vton-garment-upload-box">
              <label className="flex items-center justify-between w-full cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#6C151E] text-white flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4 text-[#F5DABF]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1C1A18] block">Upload Your Own Garment</span>
                    <span className="text-[10px] text-[#5C544D] block">JPG / PNG / WEBP</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase bg-white border border-[#6C151E]/20 px-2.5 py-1 rounded-md text-[#6C151E]">
                  Upload
                </span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCustomGarmentChange} />
              </label>
            </div>

            {/* Selected Garment Component */}
            <div className="vton-selected-garment-card">
              <img
                src={isCustomGarment && customGarmentPreview ? customGarmentPreview : garmentUrl}
                alt={garmentTitle}
                className="w-12 h-12 object-contain rounded-md bg-white border border-[#6C151E]/10 p-0.5 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-mono text-[#5C544D] uppercase font-bold block">Selected Garment</span>
                <p className="text-xs font-bold text-[#1C1A18] truncate mt-0.5">{garmentTitle}</p>
                <p className="text-[10px] text-[#6C151E] font-mono mt-0.5 truncate">
                  {isCustomGarment ? 'Custom Garment Active' : 'Preset Active'}
                </p>
              </div>
            </div>

            {/* Preset Garment Cards (4 columns uniform grid) */}
            <div>
              <span className="text-[10px] font-mono text-[#5C544D] uppercase font-bold block mb-1.5">Preset Garments:</span>
              <div className="vton-preset-grid">
                {SAMPLE_GARMENTS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectPresetGarment(g)}
                    className={`vton-preset-card ${!isCustomGarment && garmentUrl === g.url ? 'active' : ''}`}
                  >
                    <img src={g.url} alt={g.name} className="w-10 h-10 object-contain mx-auto rounded" />
                    <span className="text-[11px] font-sans font-medium block truncate mt-1 text-[#1C1A18] w-full px-1">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clothing Category Selector */}
            <div className="pt-2 border-t border-[#6C151E]/15 space-y-1">
              <label className="vton-section-label">Clothing Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="vton-category-select"
              >
                <option value="upper">Upper Body (Tops & Jackets)</option>
                <option value="lower">Lower Body (Pants & Skirts)</option>
                <option value="overall">Full Body (Dresses & Outfits)</option>
              </select>
            </div>
          </div>

          {/* Action Generate Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleTryOnSubmit}
            disabled={isProcessing || !selectedPersonFile}
            className="vton-generate-btn"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 text-[#F5DABF] animate-spin" />
                <span>Generating Virtual Try-On...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-[#F5DABF]" />
                <span>Generate Virtual Try-On</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Right Column: AI Try-On Result Display */}
        <div className="vton-right-panel">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#6C151E]/15">
              <span className="vton-section-label">
                <Sparkles className="w-3.5 h-3.5" /> Try-On Result
              </span>
              {resultImageUrl && (
                <span className="text-[10px] font-mono font-bold text-white bg-[#0F3D3A] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#F5DABF]" /> 100% Neural Generated
                </span>
              )}
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-800">{error}</p>
                    {errorDetails && <p className="mt-1 text-[11px] text-red-600 leading-relaxed">{errorDetails}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Main Result Display State */}
            {resultImageUrl ? (
              <div className="space-y-4">
                <div className="vton-result-image-box">
                  <img src={resultImageUrl} alt="Virtual Try-On Result" className="vton-result-img" />
                </div>

                {/* Bottom Balanced Cards */}
                <div className="vton-bottom-cards-grid">
                  <div className="vton-bottom-card">
                    <img src={personPreview} alt="Original" className="w-11 h-11 object-cover rounded-md shrink-0 border border-[#6C151E]/10" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-[#5C544D] uppercase font-bold block">User Photo</span>
                      <span className="text-xs font-bold text-[#1C1A18] truncate block">Original Pose</span>
                    </div>
                  </div>
                  <div className="vton-bottom-card">
                    <img
                      src={isCustomGarment && customGarmentPreview ? customGarmentPreview : garmentUrl}
                      alt="Garment"
                      className="w-11 h-11 object-contain rounded-md bg-white p-0.5 shrink-0 border border-[#6C151E]/10"
                    />
                    <div className="min-w-0">
                      <span className="text-[9px] font-mono text-[#5C544D] uppercase font-bold block">Applied Garment</span>
                      <span className="text-xs font-bold text-[#1C1A18] truncate block">{garmentTitle}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="flex flex-col items-center justify-center min-h-[380px] text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-[#6C151E]/20 border-t-[#6C151E] animate-spin" />
                  <Sparkles className="w-6 h-6 text-[#6C151E] absolute inset-0 m-auto" />
                </div>
                <div>
                  <h4 className="font-editorial text-xl font-bold text-[#1C1A18]">Generating Virtual Try-On...</h4>
                  <p className="text-xs font-sans text-[#5C544D] max-w-xs mx-auto mt-1">
                    Request ID: <span className="font-mono font-bold">{currentRequestId}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[380px] text-center p-6 border-2 border-dashed border-[#6C151E]/15 rounded-xl bg-[#FAF5F0]/50">
                <div className="w-14 h-14 rounded-full bg-[#6C151E]/10 flex items-center justify-center mb-3">
                  <ImageIcon className="w-7 h-7 text-[#6C151E]" />
                </div>
                <h3 className="font-editorial text-xl font-bold text-[#1C1A18] mb-1">Ready for Try-On</h3>
                <p className="text-xs font-sans text-[#5C544D] max-w-sm leading-relaxed">
                  Upload your photo, pick or upload a garment, and click <strong>Generate Virtual Try-On</strong> to preview your neural fitting result.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          {resultImageUrl && (
            <div className="vton-bottom-actions">
              <button onClick={handleReset} className="vton-btn-secondary">
                Try Another Garment
              </button>

              <a href={resultImageUrl} target="_blank" rel="noreferrer" className="vton-btn-primary">
                <span>Download Result</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <AnimatePresence>
        <div className="vton-modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-[1280px]"
          >
            {containerContent}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  return (
    <div className="vton-page-container">
      {containerContent}
    </div>
  );
};

export default VirtualTryOn;
