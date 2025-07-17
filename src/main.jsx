import { UserProvider } from "@/UserContext/UserContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "react-toast-notifications";
import { PersistGate } from "redux-persist/integration/react";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";
import { clearAllCaches, persistor, store } from "./redux/store";
import router from "./routes/Router.jsx";

// Clear caches on app start if needed
const shouldClearCache = localStorage.getItem('clearCache') === 'true';
if (shouldClearCache) {
  localStorage.removeItem('clearCache');
  clearAllCaches();
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ToastProvider>
          <UserProvider>
            <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
            <LanguageProvider>
              <RouterProvider router={router} />
              </LanguageProvider>
            </GoogleOAuthProvider>
          </UserProvider>
        </ToastProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);

// Enhanced service worker registration with cache management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                console.log('New service worker available');
                
                // Ask the new service worker to skip waiting
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                
                // Reload page to use new service worker
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
      
    // Listen for service worker controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed');
      // Reload page when service worker updates
      window.location.reload();
    });
  });
}

// Add global cache clearing function
window.clearAppCache = () => {
  console.log('Clearing all application caches...');
  clearAllCaches();
};

// Add debug info
console.log('App initialized with cache clearing utilities');
console.log('To clear all caches, run: window.clearAppCache()');

// Prevent back button cache issues
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page was loaded from cache, reload to ensure fresh data
    window.location.reload();
  }
});
