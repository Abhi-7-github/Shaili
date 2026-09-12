import { request } from './api';

/**
 * Stylist API Service
 */

export const generateOutfits = async (payload = {}) => {
  return request('/api/stylist/generate', {
    method: 'POST',
    body: payload,
  });
};

export default {
  generateOutfits,
};
