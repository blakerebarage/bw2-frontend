import { UserProvider } from "@/UserContext/UserContext";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "react-toast-notifications";
import { PersistGate } from "redux-persist/integration/react";
import { LanguageProvider } from "./contexts/LanguageContext";
import { SocketProvider } from "./contexts/SocketContext";
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
        <SocketProvider>
        <ToastProvider>
          <UserProvider>
            <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID_HERE">
            <LanguageProvider>
              <RouterProvider router={router} />
              </LanguageProvider>
            </GoogleOAuthProvider>
          </UserProvider>
        </ToastProvider>
        </SocketProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);

// Enhanced service worker registration with cache management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                
                
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
       
      });
      
    // Listen for service worker controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      
      // Reload page when service worker updates
      window.location.reload();
    });
  });
}

// Add global cache clearing function
window.clearAppCache = () => {
  
  clearAllCaches();
};

// Add debug info


// Prevent back button cache issues
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page was loaded from cache, reload to ensure fresh data
    window.location.reload();
  }
});
