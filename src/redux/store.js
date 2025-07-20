import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import baseApi from "./features/baseApi";
import providersReducer from "./features/providers/providersSlice";
import authReducer from "./slices/authSlice";
import mediaReducer from "./slices/mediaSlice";
import systemSettingsReducer from "./slices/systemSettingsSlice";

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
  blacklist: [baseApi.reducerPath, 'systemSettings', 'media', 'providers'], // Don't persist API cache and other dynamic data
  version: 1,
  migrate: (state) => {
    // Clear old cache on version change
    if (state && state._persist && state._persist.version !== 1) {
      return Promise.resolve({});
    }
    return Promise.resolve(state);
  }
};

// Auth-specific persist config with limited data
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token', 'isAuthenticated'], // Only persist essential auth data
  blacklist: ['user', 'session', 'loading', 'error'], // Don't persist dynamic user data
};

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  systemSettings: systemSettingsReducer, // Don't persist system settings
  media: mediaReducer, // Don't persist media data
  providers: providersReducer, // Don't persist providers data
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Add cache clearing utility
export const clearAllCaches = () => {
  // Clear Redux persist
  persistor.purge();
  
  // Clear localStorage
  localStorage.removeItem('persist:root');
  localStorage.removeItem('persist:auth');
  localStorage.removeItem('app-language');
  
  // Clear RTK Query cache
  store.dispatch(baseApi.util.resetApiState());
  
  // Clear service worker cache
  if ('serviceWorker' in navigator && 'caches' in window) {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
    
    // Send message to service worker to clear cache
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.postMessage({ type: 'CLEAR_CACHE' });
      }
    });
  }
  
  // Reload page to ensure clean state
  window.location.reload();
};