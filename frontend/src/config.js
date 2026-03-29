// Central configuration for AutoVault Frontend
// Uses Vite's built-in support for environment variables

// Use VITE_API_URL if defined, otherwise default to local backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export { API_URL };
export default API_URL;
