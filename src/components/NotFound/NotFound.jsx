import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set proper meta tags for 404 pages
    document.title = "404 - Page Not Found | Play9.live";
    
    // Add meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "The requested page could not be found. Return to Play9.live homepage.");
    } else {
      const meta = document.createElement('meta');
      meta.name = "description";
      meta.content = "The requested page could not be found. Return to Play9.live homepage.";
      document.head.appendChild(meta);
    }

    // Add canonical URL pointing to homepage
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin;

    // Auto redirect to home after 5 seconds for better UX and SEO
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 5000);

    return () => {
      clearTimeout(timer);
      // Reset title when component unmounts
      document.title = "Play9.live";
    };
  }, [navigate]);

  const goHome = () => {
    navigate("/", { replace: true });
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1f2937] text-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-extrabold text-yellow-400 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Page Not Found</h2>
        <p className="mb-6 text-lg text-gray-300">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="mb-8 text-sm text-gray-400">
          You will be automatically redirected to the homepage in 5 seconds.
        </p>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={goHome}
            className="bg-yellow-400 hover:bg-yellow-500 text-[#1f2937] font-semibold px-6 py-3 rounded-full shadow-lg transition-colors duration-200"
          >
            Go to Homepage
          </button>
          <button
            onClick={goBack}
            className="bg-gray-600 hover:bg-gray-500 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <a href="/" className="text-yellow-400 hover:text-yellow-300">Home</a>
            <span>•</span>
            <a href="/casino" className="text-yellow-400 hover:text-yellow-300">Casino</a>
            <span>•</span>
            <a href="/sports" className="text-yellow-400 hover:text-yellow-300">Sports</a>
            <span>•</span>
            <a href="/login" className="text-yellow-400 hover:text-yellow-300">Login</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
