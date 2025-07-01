import { useEffect, useState } from 'react';
import { IoClose, IoDownload } from 'react-icons/io5';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if device is mobile (phone/tablet)
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) ||
             /tablet|ipad|playbook|silk/i.test(userAgent) ||
             (window.innerWidth <= 768 && window.matchMedia('(pointer: coarse)').matches);
    };

    const mobile = checkMobile();
    setIsMobile(mobile);

    // Check if device is iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Only proceed if on mobile device
    if (!mobile) {
      console.log('PWA install prompt hidden - Desktop device detected');
      return;
    }

    // Handle PWA install prompt (only on mobile)
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA install prompt triggered on mobile device!');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
      setCanInstall(true);
      // Show the install prompt
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installation (when user installs via browser menu)
    const handleAppInstalled = () => {
      console.log('App was installed via browser!');
      localStorage.setItem('pwaInstalled', 'true');
      setShowInstallPrompt(false);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Enhanced check if already installed
    const checkIfInstalled = () => {
      // Method 1: Check if running in standalone mode (PWA installed)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Method 2: Check iOS standalone mode
      const isIOSStandalone = window.navigator.standalone === true;
      
      // Method 3: Check if app was launched from home screen
      const isFromHomeScreen = window.location.search.includes('utm_source=homescreen') ||
                              window.location.search.includes('source=pwa');
      
      // Method 4: Check if previously installed (stored in localStorage)
      const wasPreviouslyInstalled = localStorage.getItem('pwaInstalled') === 'true';
      
      return isStandalone || isIOSStandalone || isFromHomeScreen || wasPreviouslyInstalled;
    };

    const isInstalled = checkIfInstalled();
    
    if (isInstalled) {
      setShowInstallPrompt(false);
      console.log('App is already installed - hiding install prompt');
      // Store that app is installed
      localStorage.setItem('pwaInstalled', 'true');
    } else {
      // Show install prompt after a delay on mobile (even without beforeinstallprompt)
      const timer = setTimeout(() => {
        const wasDismissed = localStorage.getItem('installPromptDismissed');
        const isCurrentlyInstalled = checkIfInstalled(); // Check again after delay
        
        if (!wasDismissed && !isCurrentlyInstalled) {
          setShowInstallPrompt(true);
        }
      }, 3000); // Show after 3 seconds on mobile

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    // For testing: log PWA status
    console.log('PWA Status:', {
      isMobile: mobile,
      isIOS,
      isInstalled,
      hasServiceWorker: 'serviceWorker' in navigator,
      isSecureContext: window.isSecureContext
    });

  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Simple guide for manual installation
      if (isIOS) {
        alert('📱 Safari: Tap Share (⇧) → Add to Home Screen');
      } else {
        alert('📱 Look for install icon (⊕) in your browser address bar, or check browser menu for "Install Play9"');
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      localStorage.setItem('pwaInstalled', 'true');
      localStorage.removeItem('installPromptDismissed');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember user dismissed (you can use localStorage if needed)
    localStorage.setItem('installPromptDismissed', 'true');
    console.log('User dismissed install prompt');
  };

  // Only show on mobile devices
  if (!isMobile || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 z-50 animate-slide-up max-w-md mx-auto">
      <div className="bg-gradient-to-r from-[#1b1f23] to-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border border-[#facc15]/20 p-3 sm:p-4">
        <div className="flex items-start sm:items-center justify-between mb-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 p-1">
              <img 
                src="/favicon.ico" 
                alt="Play9 Logo" 
                className="w-full h-full object-contain"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-base sm:text-lg leading-tight">Install Play9</h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-tight">Quick access from home screen</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0 ml-2"
          >
            <IoClose className="text-lg sm:text-xl" />
          </button>
        </div>

        <button
          onClick={handleInstallClick}
          className="w-full bg-gradient-to-r from-[#facc15] to-yellow-500 hover:from-yellow-500 hover:to-[#facc15] text-[#1b1f23] font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
        >
          <IoDownload className="text-lg" />
          <span>Install Now</span>
        </button>

        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
          <span>✓ Fast & Secure</span>
          <span>✓ Works Offline</span>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt; 