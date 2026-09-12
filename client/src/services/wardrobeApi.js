import { request } from './api';

/**
 * Wardrobe API Service
 */

export const analyzeWardrobeItem = async (file, imageUrl = '') => {
  const formData = new FormData();
  if (file) formData.append('image', file);
  if (imageUrl) formData.append('imageUrl', imageUrl);

  return request('/api/wardrobe/analyze', {
    method: 'POST',
    body: formData,
  });
};

export const uploadWardrobeItem = async (file, metadata = {}) => {
  const formData = new FormData();
  if (file) formData.append('image', file);

  Object.entries(metadata).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      if (Array.isArray(val)) {
        formData.append(key, JSON.stringify(val));
      } else {
        formData.append(key, val);
      }
    }
  });

  return request('/api/wardrobe/upload', {
    method: 'POST',
    body: formData,
  });
};

export const getWardrobe = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, val]) => {
    if (val && val !== 'all') {
      queryParams.append(key, val);
    }
  });

  const queryStr = queryParams.toString();
  const endpoint = `/api/wardrobe${queryStr ? '?' + queryStr : ''}`;
  return request(endpoint, { method: 'GET' });
};

export const getWardrobeItem = async (id) => {
  return request(`/api/wardrobe/${id}`, { method: 'GET' });
};

export const updateWardrobeItem = async (id, updates) => {
  return request(`/api/wardrobe/${id}`, {
    method: 'PUT',
    body: updates,
  });
};

export const deleteWardrobeItem = async (id) => {
  return request(`/api/wardrobe/${id}`, { method: 'DELETE' });
};

export const getUnderusedItems = async () => {
  return request('/api/wardrobe/underused', { method: 'GET' });
};
