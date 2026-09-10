import axios from 'axios';
import secureLocalStorage from 'react-secure-storage';

// Global axios auth wiring, imported once from src/index.js.
// Every view uses the plain `axios` instance, so these interceptors cover
// all API calls without touching the individual screens.

// Attach the JWT issued by POST /login to every request.
axios.interceptors.request.use((config) => {
  const token = secureLocalStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sliding refresh: the API sends a fresh token in X-Refreshed-Token once the
// current one is past half its lifetime — store it so active users are never
// logged out. When the API rejects the token (missing/expired/invalid), end
// the session exactly like Sign Out does and return to the login page.
axios.interceptors.response.use(
  (response) => {
    const refreshed = response.headers['x-refreshed-token'];
    if (refreshed) {
      secureLocalStorage.setItem('authToken', refreshed);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      secureLocalStorage.clear();
      localStorage.clear();
      const hash = window.location.hash;
      if (hash !== '#/' && !hash.startsWith('#/login')) {
        window.location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  },
);
