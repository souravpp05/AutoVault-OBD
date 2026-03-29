// Central configuration for AutoVault Frontend
// Uses Vite's built-in support for environment variables

// For Firebase Hosting + Render backend:
//   Set VITE_API_URL to your Render backend URL (e.g. https://autovault-backend.onrender.com)
// For local development:
//   Set VITE_API_URL=http://localhost:3001 in frontend/.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export { API_URL };
export default API_URL;
