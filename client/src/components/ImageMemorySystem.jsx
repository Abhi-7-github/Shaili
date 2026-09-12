import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  UploadCloud,
  X,
  Trash2,
  Tag,
  Calendar,
  Sparkles,
  Filter,
  Image as ImageIcon,
  AlertCircle,
  Eye,
  Check,
  Plus
} from 'lucide-react';

const CATEGORIES = [
  'wedding',
  'birthday',
  'party',
  'travel',
  'family',
  'friends',
  'college',
  'sports',
  'festival',
  'fashion',
  'food',
  'nature',
  'work',
  'graduation',
  'pets',
  'music',
  'events',
  'memories',
  'road-trip',
  'beach',
];

export const ImageMemorySystem = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMetadata, setSearchMetadata] = useState(null);

  // Upload modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadCategories, setUploadCategories] = useState([]);
  const [uploadTags, setUploadTags] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Lightbox & Delete states
  const [activeImage, setActiveImage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Outfit Generation states
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [outfitOccasion, setOutfitOccasion] = useState('Casual');
  const [outfitStyle, setOutfitStyle] = useState('Smart Casual');
  const [generatedOutfits, setGeneratedOutfits] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showOutfitModal, setShowOutfitModal] = useState(false);
  const [outfitError, setOutfitError] = useState('');

  // Load User Images on Mount
  useEffect(() => {
    fetchUserImages();
  }, []);

  const fetchUserImages = async (categoryFilter = 'all') => {
    setLoading(true);
    setSearchMetadata(null);
    try {
      let url = '/api/images';
      if (categoryFilter !== 'all') {
        url += `?category=${encodeURIComponent(categoryFilter)}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setImages(data.images);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error('Failed to fetch memories:', err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Natural Language Memory Search
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      fetchUserImages(activeCategory);
      return;
    }

    setIsSearching(true);
    setLoading(true);

    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(searchQuery.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setImages(data.images);
        setSearchMetadata(data.filters);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error('Search memories failed:', err);
      setImages([]);
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchMetadata(null);
    fetchUserImages(activeCategory);
  };

  const handleCategoryFilter = (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setSearchMetadata(null);
    fetchUserImages(cat);
  };

  // Upload Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WEBP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be under 10MB.');
      return;
    }

    setUploadError('');
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const toggleUploadCategory = (cat) => {
    if (uploadCategories.includes(cat)) {
      setUploadCategories(uploadCategories.filter((c) => c !== cat));
    } else {
      setUploadCategories([...uploadCategories, cat]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select an image file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (uploadCategories.length > 0) {
        formData.append('categories', uploadCategories.join(','));
      }
      if (uploadTags.trim()) {
        formData.append('tags', uploadTags);
      }
      if (uploadDescription.trim()) {
        formData.append('description', uploadDescription);
      }

      const res = await fetch('/api/images/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setShowUploadModal(false);
        resetUploadForm();
        fetchUserImages(activeCategory);
      } else {
        setUploadError(data.message || 'Failed to upload memory image');
      }
    } catch (err) {
      setUploadError('An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadCategories([]);
    setUploadTags('');
    setUploadDescription('');
    setUploadError('');
  };

  // Delete Memory Handler
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this memory photo?')) return;

    setDeletingId(imageId);
    try {
      const res = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setImages(images.filter((img) => img.id !== imageId));
        if (activeImage?.id === imageId) {
          setActiveImage(null);
        }
      } else {
        alert(data.message || 'Failed to delete image');
      }
    } catch (err) {
      console.error('Delete image error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Outfit Generation Handlers
  const toggleItemSelection = (id) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleGenerateOutfit = async () => {
    if (selectedItems.size === 0) {
      setOutfitError('Please select at least one wardrobe item.');
      return;
    }
    
    setIsGenerating(true);
    setOutfitError('');
    setShowOutfitModal(true);

    try {
      const res = await fetch('/api/images/outfits/from-wardrobe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemIds: Array.from(selectedItems),
          occasion: outfitOccasion,
          style: outfitStyle
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setGeneratedOutfits(data.outfits);
      } else {
        setOutfitError(data.message || 'Failed to generate outfit');
        setGeneratedOutfits([]);
      }
    } catch (err) {
      console.error('Generate Outfit error:', err);
      setOutfitError('An error occurred during outfit generation. Please try again.');
      setGeneratedOutfits([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="memory-system-container">
      {/* Header Banner */}
      <div className="memory-header-banner">
        <div className="memory-header-content">
          <div className="system-badge">
            <Sparkles size={14} />
            <span>SHAILI PERSONAL IMAGE MEMORY &amp; RETRIEVAL SYSTEM</span>
          </div>
          <h1>Search &amp; Retrieve Your Personal Memories</h1>
          <p>
            Your private Cloudinary vault. Search your uploaded photos using natural language queries like
            <span className="query-highlight"> "Show my birthday photos"</span> or
            <span className="query-highlight"> "Photos from my trip to the beach"</span>.
          </p>
        </div>

        <button className="upload-trigger-btn" onClick={() => navigate('/upload')}>
          <UploadCloud size={18} />
          <span>Upload Memory Photo (/upload)</span>
        </button>
      </div>

      {/* 🔍 Natural Language Memory Search Bar */}
      <div className="memory-search-wrapper">
        <form onSubmit={handleSearch} className="memory-search-form">
          <div className="search-input-box">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="What memory are you looking for? (e.g. Show my photos from beach trip)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="clear-search-btn" onClick={handleClearSearch}>
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="search-submit-btn" disabled={isSearching}>
            {isSearching ? <span className="spinner"></span> : <span>Search Memories</span>}
          </button>
        </form>

        {/* Parsed Search Metadata Chips */}
        {searchMetadata && (
          <div className="search-parsed-info">
            <span className="parsed-label">Detected Filter Criteria:</span>
            {searchMetadata.categories?.map((cat, i) => (
              <span key={i} className="parsed-chip category">
                Category: {cat}
              </span>
            ))}
            {searchMetadata.keywords?.map((kw, i) => (
              <span key={i} className="parsed-chip keyword">
                Tag: {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 👕 Outfit Generation Control Bar */}
      {selectedItems.size > 0 && (
        <div className="outfit-control-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1f2c', padding: '15px 20px', borderRadius: '12px', margin: '20px 0', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="selected-count" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontWeight: '500' }}>
            <Check size={18} color="#4ade80" />
            <span>{selectedItems.size} {selectedItems.size === 1 ? 'item' : 'items'} selected</span>
          </div>
          
          <div className="outfit-options" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select 
              value={outfitOccasion} 
              onChange={(e) => setOutfitOccasion(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <option value="Casual" style={{color: '#000'}}>Casual</option>
              <option value="Smart Casual" style={{color: '#000'}}>Smart Casual</option>
              <option value="Formal" style={{color: '#000'}}>Formal</option>
              <option value="Party" style={{color: '#000'}}>Party</option>
              <option value="Traditional" style={{color: '#000'}}>Traditional</option>
            </select>
            
            <select 
              value={outfitStyle} 
              onChange={(e) => setOutfitStyle(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <option value="Everyday" style={{color: '#000'}}>Everyday</option>
              <option value="Elegant" style={{color: '#000'}}>Elegant</option>
              <option value="Edgy" style={{color: '#000'}}>Edgy</option>
              <option value="Minimalist" style={{color: '#000'}}>Minimalist</option>
              <option value="Trendy" style={{color: '#000'}}>Trendy</option>
            </select>
            
            <button 
              className="generate-outfit-btn" 
              onClick={handleGenerateOutfit}
              disabled={isGenerating}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'Generating...' : 'Generate Outfit'}</span>
            </button>
          </div>
        </div>
      )}


      {/* 🖼️ Memory Gallery Grid */}
      <div className="memory-gallery-section">
        {loading ? (
          <div className="gallery-loading-state">
            <div className="spinner-large"></div>
            <p>Searching &amp; Retrieving Stored Cloudinary Memories...</p>
          </div>
        ) : images.length > 0 ? (
          <div className="memory-grid">
            {images.map((img) => (
              <div key={img.id} className={`memory-card ${selectedItems.has(img.id) ? 'selected' : ''}`} onClick={() => toggleItemSelection(img.id)} style={selectedItems.has(img.id) ? { border: '2px solid #a855f7', transform: 'scale(0.98)' } : {}}>
                <div className="memory-image-box">
                  <img src={img.url} alt={img.description || 'Memory'} loading="lazy" />
                  {selectedItems.has(img.id) && (
                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#a855f7', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={16} color="white" />
                    </div>
                  )}
                  <div className="image-hover-overlay">
                    <button className="overlay-btn view" title="View Fullscreen" onClick={(e) => { e.stopPropagation(); setActiveImage(img); }}>
                      <Eye size={18} />
                    </button>
                    <button
                      className="overlay-btn delete"
                      title="Delete Memory"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(img.id);
                      }}
                      disabled={deletingId === img.id}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="memory-card-details">
                  <div className="card-categories-row">
                    {img.categories?.map((c, i) => (
                      <span key={i} className="card-category-badge">
                        {c}
                      </span>
                    ))}
                    {img.uploadedAt && (
                      <span className="card-date">
                        <Calendar size={12} /> {formatDate(img.uploadedAt)}
                      </span>
                    )}
                  </div>

                  <p className="card-description">{img.description || 'Uploaded Memory Photo'}</p>

                  {img.tags && img.tags.length > 0 && (
                    <div className="card-tags-row">
                      <Tag size={12} className="tag-icon" />
                      {img.tags.slice(0, 4).map((t, i) => (
                        <span key={i} className="tag-pill">
                          #{t}
                        </span>
                      ))}
                      {img.tags.length > 4 && (
                        <span className="tag-pill more">+{img.tags.length - 4}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Search Results State */
          <div className="empty-memories-state">
            <div className="empty-icon-circle">
              <ImageIcon size={32} />
            </div>
            <h3>No matching memories found.</h3>
            <p>Try searching for another memory or upload your first photo to your vault.</p>
            {searchQuery && (
              <button onClick={handleClearSearch} className="reset-search-btn">
                Clear Search Query
              </button>
            )}
          </div>
        )}
      </div>

      {/* 📤 Upload Image Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="upload-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <h3>Upload Memory to Cloudinary Vault</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadForm();
                }}
              >
                <X size={20} />
              </button>
            </div>

            {uploadError && (
              <div className="error-alert">
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="upload-form">
              {/* File Drag / Drop Dropzone */}
              <div className="file-dropzone">
                {filePreview ? (
                  <div className="preview-container">
                    <img src={filePreview} alt="Preview" />
                    <button
                      type="button"
                      className="remove-preview"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="file-input" className="dropzone-label">
                    <UploadCloud size={36} className="drop-icon" />
                    <p className="drop-title">Click to select an image from your device</p>
                    <p className="drop-sub">Supports JPEG, PNG, WEBP, GIF (Max 10MB)</p>
                    <input
                      id="file-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleFileChange}
                      required
                    />
                  </label>
                )}
              </div>

              {/* Category Selector Pills */}
              <div className="form-group">
                <label>Select Memory Categories (Multiple allowed):</label>
                <div className="category-selector-grid">
                  {CATEGORIES.map((cat) => {
                    const isSelected = uploadCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        className={`select-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleUploadCategory(cat)}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Tags */}
              <div className="form-group">
                <label htmlFor="tags-input">Custom Tags (Comma separated):</label>
                <input
                  id="tags-input"
                  type="text"
                  placeholder="e.g. bride, ceremony, goa-trip, 2026"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="desc-input">Description / Notes:</label>
                <textarea
                  id="desc-input"
                  rows={3}
                  placeholder="Add details about this memory..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                />
              </div>

              <div className="modal-footer-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-upload" disabled={isUploading || !selectedFile}>
                  {isUploading ? (
                    <span className="spinner"></span>
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      <span>Upload &amp; Save Memory</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 Fullscreen Lightbox Modal */}
      {activeImage && (
        <div className="lightbox-overlay" onClick={() => setActiveImage(null)}>
          <div className="lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setActiveImage(null)}>
              <X size={24} />
            </button>
            <div className="lightbox-image-box">
              <img src={activeImage.url} alt={activeImage.description || 'Memory'} />
            </div>
            <div className="lightbox-sidebar">
              <h3>Memory Details</h3>
              <div className="lightbox-meta-row">
                <span className="label">Categories:</span>
                <div className="badges">
                  {activeImage.categories?.map((c, i) => (
                    <span key={i} className="badge">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lightbox-meta-row">
                <span className="label">Uploaded:</span>
                <span className="val">{formatDate(activeImage.uploadedAt)}</span>
              </div>

              {activeImage.description && (
                <div className="lightbox-meta-row vertical">
                  <span className="label">Description:</span>
                  <p className="desc-text">{activeImage.description}</p>
                </div>
              )}

              {activeImage.tags && activeImage.tags.length > 0 && (
                <div className="lightbox-meta-row vertical">
                  <span className="label">Tags ({activeImage.tags.length}):</span>
                  <div className="tags-wrap">
                    {activeImage.tags.map((t, i) => (
                      <span key={i} className="tag">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="lightbox-delete-btn"
                onClick={() => handleDeleteImage(activeImage.id)}
              >
                <Trash2 size={16} />
                <span>Delete Memory</span>
              </button>
            </div>
          </div>
        </div>
      {/* 👗 Outfit Results Modal */}
      {showOutfitModal && (
        <div className="modal-overlay" onClick={() => setShowOutfitModal(false)}>
          <div className="outfit-modal-card" onClick={(e) => e.stopPropagation()} style={{ background: '#111827', padding: '30px', borderRadius: '16px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', margin: 0 }}>Generated Outfits</h3>
              <button
                className="modal-close"
                onClick={() => setShowOutfitModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="outfit-modal-body">
              {isGenerating ? (
                <div className="loading-state" style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spinner-large" style={{ margin: '0 auto 20px' }}></div>
                  <p style={{ color: '#aaa' }}>Curating the perfect outfits for you...</p>
                </div>
              ) : outfitError ? (
                <div className="error-alert" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '15px', borderRadius: '8px' }}>
                  <AlertCircle size={20} />
                  <span>{outfitError}</span>
                </div>
              ) : generatedOutfits.length > 0 ? (
                <div className="outfits-list" style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  {generatedOutfits.map((outfit, idx) => (
                    <div key={idx} className="outfit-result-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '20px' }}>
                      <div className="outfit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h4 style={{ color: '#fff', margin: 0, fontSize: '1.2rem' }}>Outfit {idx + 1}</h4>
                        <div className="outfit-badges" style={{ display: 'flex', gap: '10px' }}>
                          <span className="badge occasion" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>{outfit.occasion}</span>
                          <span className="badge style" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem' }}>{outfit.style}</span>
                        </div>
                      </div>
                      
                      <div className="outfit-items-row" style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                        {outfit.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="outfit-item-img" style={{ flex: '0 0 150px', height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                            <img src={item.url} alt={`Item ${itemIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                      
                      <div className="outfit-reason" style={{ marginTop: '15px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <strong style={{ color: '#ccc', display: 'block', marginBottom: '5px' }}>Why it works:</strong>
                        <p style={{ color: '#aaa', margin: 0, lineHeight: 1.5 }}>{outfit.reason}</p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="modal-footer-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' }}>
                    <button className="btn-cancel" onClick={() => setShowOutfitModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                      Close
                    </button>
                    <button className="btn-upload" onClick={() => { setShowOutfitModal(false); setSelectedItems(new Set()); }} style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Try Another Combination
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
