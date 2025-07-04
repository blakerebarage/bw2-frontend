// Facebook Pixel tracking utility for login, register, and home page
// Make sure to replace 'YOUR_PIXEL_ID_HERE' with your actual Facebook Pixel ID

/**
 * Track a Facebook Pixel event
 * @param {string} eventName - The name of the event to track
 * @param {object} parameters - Additional parameters for the event
 */
export const trackFacebookEvent = (eventName, parameters = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

/**
 * Track page view
 * @param {string} pageName - Optional page name
 */
export const trackPageView = (pageName = null) => {
  if (typeof window !== 'undefined' && window.fbq) {
    if (pageName) {
      window.fbq('track', 'PageView', { page_name: pageName });
    } else {
      window.fbq('track', 'PageView');
    }
  }
};

/**
 * Track user registration
 * @param {object} userData - User data for tracking
 */
export const trackRegistration = (userData = {}) => {
  trackFacebookEvent('CompleteRegistration', userData);
};

/**
 * Track user login
 * @param {object} userData - User data for tracking
 */
export const trackLogin = (userData = {}) => {
  trackFacebookEvent('Login', userData);
};

/**
 * Track home page visit
 * @param {object} additionalData - Additional data for tracking
 */
export const trackHomePageVisit = (additionalData = {}) => {
  trackFacebookEvent('ViewContent', {
    content_name: 'Home Page',
    content_category: 'Landing Page',
    ...additionalData
  });
};

/**
 * Track custom event
 * @param {string} eventName - Custom event name
 * @param {object} parameters - Event parameters
 */
export const trackCustomEvent = (eventName, parameters = {}) => {
  trackFacebookEvent(eventName, parameters);
};

// Initialize Facebook Pixel if not already loaded
export const initFacebookPixel = () => {
  if (typeof window !== 'undefined' && !window.fbq) {
    console.warn('Facebook Pixel not loaded. Make sure the pixel code is in your HTML head.');
  }
}; 