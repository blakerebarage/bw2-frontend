import Loading from '@/components/shared/Loading';
import { useEffect, useState } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

const GameLunch = () => {
  const [loading, setLoading] = useState(true);
  const [gameUrl, setGameUrl] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToasts();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const url = params.get('url');

    if (!url) {
      addToast('Invalid game URL', {
        appearance: 'error',
        autoDismiss: true,
      });
      navigate('/');
      return;
    }

    setGameUrl(decodeURIComponent(url));
  }, [location.search, navigate, addToast]);

  const handleIframeLoad = () => setLoading(false);

  const handleIframeError = () => {
    addToast('Failed to load game', {
      appearance: 'error',
      autoDismiss: true,
    });
    navigate('/');
  };

  const handleBack = () => navigate(-1);

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-50">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 z-50 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80"
        aria-label="Back"
      >
        <IoArrowBack size={28} />
      </button>
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-40">
          <Loading />
        </div>
      )}
      {/* Game Iframe */}
      <iframe
        src={gameUrl}
        className="w-full h-full border-0"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Game"
        allow="fullscreen"
        allowFullScreen
      />
    </div>
  );
};

export default GameLunch; 