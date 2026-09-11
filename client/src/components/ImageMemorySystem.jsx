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
              <div key={img.id} className="memory-card">
                <div className="memory-image-box" onClick={() => setActiveImage(img)}>
                  <img src={img.url} alt={img.description || 'Memory'} loading="lazy" />
                  <div className="image-hover-overlay">
                    <button className="overlay-btn view" title="View Fullscreen">
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
      )}
    </div>
  );
};
