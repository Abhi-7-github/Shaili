import { request } from './api';

/**
 * Outfit API Service
 */

export const saveOutfit = async (outfitData) => {
  return request('/api/outfits', {
    method: 'POST',
    body: outfitData,
  });
};

export const getOutfits = async () => {
  return request('/api/outfits', { method: 'GET' });
};

export const getOutfitById = async (id) => {
  return request(`/api/outfits/${id}`, { method: 'GET' });
};

export const markOutfitWorn = async (id) => {
  return request(`/api/outfits/${id}/wear`, { method: 'POST' });
};

export default {
  saveOutfit,
  getOutfits,
  getOutfitById,
  markOutfitWorn,
};
