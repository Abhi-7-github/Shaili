import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import {
  UploadCloud,
  X,
  Trash2,
  Tag,
  Calendar,
  Sparkles,
  ArrowLeft,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Folder,
  UserCheck
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

const GENDERS = [
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
  { id: 'unisex', label: 'Unisex / General' },
];

export const UploadPage = () => {
  const navigate = useNavigate();
  const { token, logout, user } = useAuth();

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('wedding');
  const [selectedGender, setSelectedGender] = useState(() => user?.gender || 'women');

  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [recentImages, setRecentImages] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    fetchRecentImages();
  }, []);

  const fetchRecentImages = async () => {
    setLoadingRecent(true);
    try {
      const res = await fetch('/api/images?limit=12', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setRecentImages(data.images);
      }
    } catch (err) {
      console.error('Failed to fetch recent images:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const processSingleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(`File "${file.name}" is not a valid image format (JPEG, PNG, WEBP, GIF).`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(`File "${file.name}" exceeds the 10MB limit.`);
      return;
    }

    setError('');
    setSuccessMsg('');
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      processSingleFile(file);
    }
  };

  // Robust Native HTML5 Drag & Drop Event Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragging) setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget && e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    let droppedFile = null;

    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          const itemFile = e.dataTransfer.items[i].getAsFile();
          if (itemFile && itemFile.type.startsWith('image/')) {
            droppedFile = itemFile;
            break;
          }
        }
      }
    }

    if (!droppedFile && e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      droppedFile = e.dataTransfer.files[0];
    }

    if (droppedFile) {
      processSingleFile(droppedFile);
    } else {
      setError('Please drop a valid image file (JPEG, PNG, WEBP, GIF).');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a photo to upload.');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('categories', selectedCategory);
      formData.append('gender', selectedGender);
      if (tags.trim()) {
        formData.append('tags', tags);
      }
      if (description.trim()) {
        formData.append('description', description);
      }

      const res = await fetch('/api/images/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(`Successfully uploaded photo under category "${selectedCategory}" (${selectedGender})!`);
        resetForm();
        fetchRecentImages();
      } else {
        setError(data.message || 'Failed to upload memory photo');
      }
    } catch (err) {
      setError('An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setSelectedCategory('wedding');
    setSelectedGender('women');
    setTags('');
    setDescription('');
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this memory photo?')) return;

    try {
      const res = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      const data = await res.json();
      if (res.ok && data.success) {
        setRecentImages(recentImages.filter((img) => img.id !== imageId));
      } else {
        alert(data.message || 'Failed to delete image');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  return (
    <div className="upload-page-container">
      {/* Navbar Header */}
      <header className="upload-header">
        <div className="upload-header-left">
          <Link to="/home" className="back-home-btn">
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </Link>
          <Logo width={120} height={36} />
        </div>
        <div className="upload-header-right">
          <span className="user-greeting">Logged in as {user?.email}</span>
        </div>
      </header>

      {/* Main Upload Box */}
      <main className="upload-main-content">
        <div className="upload-card">
          <div className="upload-card-header">
            <div className="badge-pill">
              <Sparkles size={14} />
              <span>SHAILI MEMORY VAULT UPLOAD</span>
            </div>
            <h1>Upload Personal Memory Photo</h1>
            <p>
              Select or drag and drop a photo, pick a single category and gender profile, then upload directly to your Cloudinary vault.
            </p>
          </div>

          {error && (
            <div className="alert-box error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-box success">
              <Check size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="upload-form-body">
            {/* Single File Native Drag & Drop Dropzone */}
            <div
              className={`file-dropzone-large ${isDragging ? 'dragging' : ''}`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {filePreview ? (
                <div className="file-preview-wrap">
                  <img src={filePreview} alt="Selected preview" />
                  <button type="button" className="remove-file-btn" onClick={resetForm}>
                    <X size={18} /> Remove / Replace Image
                  </button>
                </div>
              ) : (
                <label htmlFor="upload-file-input" className="dropzone-label-large">
                  <UploadCloud size={48} className="cloud-icon" />
                  <h3>Click or drag photo here to upload</h3>
                  <p>Supports JPEG, PNG, WEBP, GIF (Max 10MB)</p>
                  <input
                    id="upload-file-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            {/* Gender Selection Radio Buttons */}
            <div className="form-group-field">
              <label className="section-label">
                <UserCheck size={14} /> Select Gender Category:
              </label>
              <div className="radio-category-grid gender-grid">
                {GENDERS.map((g) => (
                  <label key={g.id} className={`radio-category-item ${selectedGender === g.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="gender"
                      value={g.id}
                      checked={selectedGender === g.id}
                      onChange={(e) => setSelectedGender(e.target.value)}
                    />
                    <span className="radio-dot"></span>
                    <span className="radio-label-text">{g.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Single Category Radio Button Selector */}
            <div className="form-group-field">
              <label className="section-label">
                <Folder size={14} /> Select Memory Category (Select 1 category):
              </label>
              <div className="radio-category-grid">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className={`radio-category-item ${selectedCategory === cat ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      checked={selectedCategory === cat}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                    <span className="radio-dot"></span>
                    <span className="radio-label-text">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Tags */}
            <div className="form-group-field">
              <label htmlFor="tags-field">
                <Tag size={14} /> Memory Tags (Comma separated):
              </label>
              <input
                id="tags-field"
                type="text"
                placeholder="e.g. beach, goa-trip, red-dress, graduation-2026"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="form-group-field">
              <label htmlFor="desc-field">Memory Description / Notes:</label>
              <textarea
                id="desc-field"
                rows={3}
                placeholder="Add notes, occasion, or details about this memory..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-upload-btn" disabled={isUploading || !selectedFile}>
              {isUploading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <UploadCloud size={18} />
                  <span>Upload Photo to Vault</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recent Uploads Section */}
        <section className="recent-uploads-section">
          <h2>Your Uploaded Memory Vault ({recentImages.length})</h2>
          {loadingRecent ? (
            <div className="loading-spinner-box">
              <div className="spinner-large"></div>
              <p>Fetching your memory photos...</p>
            </div>
          ) : recentImages.length > 0 ? (
            <div className="recent-images-grid">
              {recentImages.map((img) => (
                <div key={img.id} className="recent-img-card">
                  <img src={img.url} alt={img.description || 'Uploaded memory'} loading="lazy" />
                  <div className="img-overlay-info">
                    <p className="img-desc">{img.description || 'Uploaded Memory'}</p>
                    {img.categories && img.categories.length > 0 && (
                      <span className="card-category-badge">{img.categories[0]}</span>
                    )}
                    {img.tags && img.tags.length > 0 && (
                      <div className="img-tags">
                        {img.tags.slice(0, 3).map((t, i) => (
                          <span key={i} className="tag-badge">#{t}</span>
                        ))}
                      </div>
                    )}
                    <button
                      className="delete-img-btn"
                      onClick={() => handleDelete(img.id)}
                      title="Delete Photo"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-vault-box">
              <ImageIcon size={36} />
              <p>No photos uploaded yet. Select a photo above to add to your vault!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
