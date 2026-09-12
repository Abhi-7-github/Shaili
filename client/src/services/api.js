/**
 * Base API Communication Service for ShAili Client
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Generic Fetch Wrapper with Automatic Auth Token & Standardized Error Handling
 * @param {string} endpoint - API route path e.g. '/api/wardrobe'
 * @param {object} options - Fetch options (method, body, headers, etc.)
 */
export const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('shaili_token');

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is plain object and not FormData, stringify and set JSON content-type
  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      body,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        data.error?.message || data.message || `Request failed with status ${response.status}`;
      const errorCode = data.error?.code || 'API_ERROR';
      const error = new Error(errorMessage);
      error.code = errorCode;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
};

export default {
  request,
};
