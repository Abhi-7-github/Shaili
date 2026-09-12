import { request } from './api';

/**
 * Insights API Service
 */

export const getInsights = async () => {
  return request('/api/insights', { method: 'GET' });
};

export default {
  getInsights,
};
