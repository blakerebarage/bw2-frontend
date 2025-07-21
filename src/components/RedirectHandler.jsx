import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const RedirectHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const currentPath = location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(location.search);
    
    // List of paths that should redirect to home
    const redirectPaths = [
      '/home/error',
      '/home',
      '/error',
      '/default.aspx',
      '/default.asp',
      '/index.aspx',
      '/index.asp',
      '/member/emailresetpass',
      '/id-id/member/emailresetpass',
    ];

    // Check for ASP.NET error parameters
    const hasAspNetError = searchParams.has('aspxerrorpath') || 
                          searchParams.has('aspxerror') ||
                          searchParams.has('errorpage');

    // Check if current path should be redirected (only exact matches or paths that start with pattern)
    const shouldRedirect = redirectPaths.some(path => {
      const lowerPath = path.toLowerCase();
      // Only redirect if the path exactly matches or starts with the redirect path followed by /
      return currentPath === lowerPath || currentPath.startsWith(lowerPath + '/');
    }) || hasAspNetError;

    if (shouldRedirect) {
      // Use replace to avoid adding to history
      navigate('/', { replace: true });
      
      // Log for monitoring
      console.warn('Redirected problematic URL:', location.pathname + location.search);
      
      // Optional: Send analytics event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'redirect', {
          'event_category': 'navigation',
          'event_label': 'aspnet_error_redirect',
          'value': location.pathname
        });
      }
    }
  }, [location, navigate]);

  return null; // This component doesn't render anything
};

export default RedirectHandler; 