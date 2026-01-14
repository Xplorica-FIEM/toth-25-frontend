// utils/api.js - API wrapper functions with JWT token handling

import { getToken, removeToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Generic fetch wrapper with JWT token injection
 */
const fetchAPI = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  let response;

  // Try to fetch - catch network errors separately
  try {
    response = await fetch(`${API_URL}${endpoint}`, config);
  } catch (networkError) {
    console.error('❌ Network error - Backend not reachable:', networkError);
    console.error('Backend URL:', API_URL);
    // Return a structured error response instead of throwing
    return {
      ok: false,
      status: 0,
      data: null,
      networkError: true,
      message: `Backend server not reachable. Please check your connection.`
    };
  }

  // Handle non-JSON responses safely
  let data = null;
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON:', jsonError);
      data = null;
    }
  }

  // Handle 401 Unauthorized - token expired or invalid
  // Skip auto-redirect for auth endpoints (login, register, etc.)
  const isAuthEndpoint = endpoint.startsWith('/api/auth/');
  if (response.status === 401 && !isAuthEndpoint) {
    removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  // Return response with data
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

// ==================== AUTH ENDPOINTS ====================

/**
 * Register new user (Step 1 - now with all profile fields)
 */
export const register = async (email, password, confirmPassword, fullName, classRollNo, phoneNumber, department) => {
  return fetchAPI('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ 
      email, 
      password, 
      confirmPassword, 
      fullName, 
      classRollNo, 
      phoneNumber, 
      department 
    }),
  });
};


/**
 * Login
 */
export const login = async (email, password) => {
  return fetchAPI('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  return fetchAPI('/api/auth/me');
};

// ==================== SCAN ENDPOINTS ====================
// ... existing imports and fetchAPI wrapper ...

// ==================== SCAN ENDPOINTS ====================

/**
 * 1. GET KEYS (NEW)
 * Fetches the list of valid { encryptionKey, id } pairs.
 * Called by Scanner component on mount.
 */
/**
 * Scan QR code - sends encrypted qrData to backend
 */
export const scanQR = async (qrData) => {
  return fetchAPI('/api/scan', {
    method: 'POST',
    body: JSON.stringify({ qrData }),
  });
};

// ==================== GAME ENDPOINTS ====================

/**
 * Load complete game state (riddles, status)
 */
export const loadGame = async () => {
  return fetchAPI('/api/game/load');
};

/**
 * Get last game update timestamp
 */
export const getLastGameUpdate = async () => {
  return fetchAPI('/api/game/last-updated');
};

/**
 * Get user's scan history
 */
export const getMyScans = async () => {
  return fetchAPI('/api/game/my-scans');
};

/**
 * Get riddles metadata for caching (non-sensitive data only)
 */
export const getRiddlesMetadata = async () => {
  return fetchAPI('/api/game/riddles-metadata');
};

/**
 * Get all riddles with puzzleText for cache initialization
 */
export const getRiddlesForCache = async () => {
  return fetchAPI('/api/game/riddles-for-cache');
};

/**
 * Sync offline scans to server
 * @param {Array} scans - Array of {riddleId, scannedAt}
 */
export const syncOfflineScans = async (scans) => {
  return fetchAPI('/api/scan/sync-offline', {
    method: 'POST',
    body: JSON.stringify({ scans }),
  });
};

/**
 * Complete game
 */
export const completeGame = async () => {
  return fetchAPI('/api/game/complete', {
    method: 'POST',
  });
};

// ==================== LEADERBOARD ENDPOINTS ====================

/**
 * Get global leaderboard
 */
export const getLeaderboard = async (department = '') => {
  const query = department ? `?department=${encodeURIComponent(department)}` : '';
  return fetchAPI(`/api/leaderboard${query}`);
};

/**
 * Get top performers
 */
export const getTopPerformers = async () => {
  return fetchAPI('/api/leaderboard/top');
};

// ==================== USER ENDPOINTS ====================

/**
 * Get all users
 */
export const getUsers = async () => {
  return fetchAPI('/api/users');
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  return fetchAPI(`/api/users/${userId}`);
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (userId) => {
  return fetchAPI(`/api/users/${userId}`, {
    method: 'DELETE',
  });
};

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all riddles (Admin)
 */
export const getAdminRiddles = async () => {
  return fetchAPI('/api/admin/riddles');
};

/**
 * Get single riddle (Admin)
 */
export const getAdminRiddleById = async (riddleId) => {
  return fetchAPI(`/api/admin/riddles/${riddleId}`);
};

/**
 * Create riddle (Admin)
 */
export const createRiddle = async (riddleData) => {
  return fetchAPI('/api/admin/riddles', {
    method: 'POST',
    body: JSON.stringify(riddleData),
  });
};

/**
 * Update riddle (Admin)
 */
export const updateRiddle = async (riddleId, riddleData) => {
  return fetchAPI(`/api/admin/riddles/${riddleId}`, {
    method: 'PUT',
    body: JSON.stringify(riddleData),
  });
};

/**
 * Delete riddle (Admin)
 */
export const deleteRiddle = async (riddleId) => {
  return fetchAPI(`/api/admin/riddles/${riddleId}`, {
    method: 'DELETE',
  });
};

/**
 * Get all users (Admin)
 */
export const getAdminUsers = async (page = 1, limit = 20) => {
  return fetchAPI(`/api/admin/users?page=${page}&limit=${limit}`);
};

/**
 * Toggle admin status (Admin)
 */
export const toggleAdminStatus = async (userId) => {
  return fetchAPI(`/api/admin/users/${userId}/toggle-admin`, {
    method: 'PUT',
  });
};

/**
 * Get admin stats
 */
export const getAdminStats = async () => {
  return fetchAPI('/api/admin/stats');
};

/**
 * Get riddle scan stats
 */
export const getRiddleScanStats = async () => {
    return fetchAPI('/api/admin/stats/riddle-scans');
};
  
/**
 * Get recent scans
 */
export const getRecentScans = async (limit = 10) => {
    return fetchAPI(`/api/admin/stats/recent-scans?limit=${limit}`);
};
  
/**
 * Get user scan stats
 */
export const getUserScanStats = async () => {
    return fetchAPI('/api/admin/stats/user-scans');
};

/**
 * Get first scanner per riddle (Admin)
 */
export const getRiddleFirstScans = async () => {
  return fetchAPI('/api/admin/stats/riddle-first-scans');
};

/**
 * Get top users by unique riddles scanned (Admin)
 */
export const getUserUniqueRiddleStats = async (limit = 10) => {
  return fetchAPI(`/api/admin/stats/user-unique-riddles?limit=${limit}`);
};

/**
 * Get Global Settings
 */
export const getGlobalSettings = async () => {
  return fetchAPI('/api/admin/settings', {
    method: 'GET',
  });
};

/**
 * Update Global Setting
 */
export const updateGlobalSetting = async (key, value) => {
  return fetchAPI('/api/admin/settings', {
    method: 'POST',
    body: JSON.stringify({ key, value }),
  });
};

/**
 * Check if game has started
 */
export const checkGameStatus = async () => {
  return fetchAPI('/api/game/load');
};

export default {
  // Auth
  register,
  login,
  getCurrentUser,
  
  // Scan
  scanQR,
  
  // Game
  loadGame,
  getLastGameUpdate,
  getMyScans,
  completeGame,
  syncOfflineScans,
  
  // Leaderboard
  getLeaderboard,
  getTopPerformers,
  
  // Users
  getUsers,
  getUserById,
  deleteUser,
  
  // Admin
  getAdminRiddles,
  getAdminRiddleById,
  createRiddle,
  updateRiddle,
  deleteRiddle,
  getAdminUsers,
  toggleAdminStatus,
  getAdminStats,
  getRiddleScanStats,
  getRecentScans,
  getUserScanStats,
  getRiddleFirstScans,
  getUserUniqueRiddleStats,
  getGlobalSettings,
  updateGlobalSetting,
  checkGameStatus,
};
