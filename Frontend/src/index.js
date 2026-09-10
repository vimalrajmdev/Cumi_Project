import 'react-app-polyfill/stable';
import 'core-js';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './store';
import './index.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './authSetup'; // axios JWT interceptors (must load before any API call)

import { loadConfig } from './config'; // import loadConfig

// ag-grid fires benign "ResizeObserver loop" browser warnings when the
// window is resized; they are noise, not app errors, but the CRA dev overlay
// treats them as uncaught and blocks the screen. Swallow just those two.
const resizeObserverNoise = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded',
];
window.addEventListener('error', (e) => {
  if (resizeObserverNoise.includes(e.message)) {
    e.stopImmediatePropagation();
  }
});

// Wait for config.json to load before rendering the app
loadConfig().then(() => {
  createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <App />
    </Provider>
  );


  serviceWorkerRegistration.register();
  // Optional: performance reporting
  reportWebVitals();
});
