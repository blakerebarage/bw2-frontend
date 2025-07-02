import Loading from '@/components/shared/Loading';
import useAxiosSecure from '@/Hook/useAxiosSecure';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useState } from 'react';
import { FaImage, FaSearch, FaUpload } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

const ImageControl = () => {
  const { user } = useSelector((state) => state.auth);
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  const navigate = useNavigate();

  // State Management
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(100);
  const [totalPages, setTotalPages] = useState(0);
   
  // Debounce the search query update
  const debouncedSetSearchQuery = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearchQuery(inputValue);
    return () => debouncedSetSearchQuery.cancel();
  }, [inputValue, debouncedSetSearchQuery]);

  useEffect(()=>{
    fetchAllGames()
  },[page,searchQuery])

  // Fetch all games
  const fetchAllGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const gamesResponse = await axiosSecure.get(`/api/v1/game/all-games?page=${page}&limit=${limit}&search=${searchQuery}`);
      
      if (gamesResponse?.data?.data) {
        setGames(gamesResponse.data.data.results || gamesResponse.data.data);
        setTotalPages(Math.ceil(gamesResponse.data.data.totalItems / limit));
      }
    } catch (error) {
      setError('Failed to fetch games. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (gameId, file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axiosSecure.patch(
        `/api/v1/content/update-game-image/${gameId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.data.success) {
        addToast('Image updated successfully', {
          appearance: 'success',
          autoDismiss: true,
        });
        // Refresh games
        fetchAllGames();
      }
    } catch (error) {
      addToast('Failed to upload image. Please try again.', {
        appearance: 'error',
        autoDismiss: true,
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (gameId, event) => {
    const file = event.target.files[0];
    if (file) {
      handleImageUpload(gameId, file);
    }
  };

  const initGameLaunch = async (gameId) => {
    if (!user?.username) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // Find the game details from the games array
      const gameDetails = games.find(game => game.gameId === gameId);
      if (!gameDetails) {
        throw new Error('Game not found');
      }
      
      const provider = await axiosSecure.get(`/api/v1/game/providers?page=1&limit=300`);
      const providerDetails = provider?.data?.data?.results?.find(p => p.name.toLowerCase() === gameDetails.provider.toLowerCase());
      if (!providerDetails) {
        throw new Error('Provider not found');
      }

      const providerCurrency = providerDetails.currencyCode || 'NGN';
      
      // Increment play count
      await axiosSecure.patch(`/api/v1/game/increment-game-play-count/${gameId}`);
      
      // Launch game with provider's currency
      const { data } = await axiosSecure.post(
        `/api/v1/game/game-launch`,
        {
          username: user?.username,
          currency: providerCurrency || 'NGN',
          gameId,
          lang: 'en',
          platform: 2,
        }
      );
      if (data?.result?.payload?.game_launch_url) {
        // Navigate to the game page with the game URL
        navigate(`/game?url=${encodeURIComponent(data.result.payload.game_launch_url)}`);
      } 
    } catch (error) {
      addToast("Failed to launch game", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = games;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
              <FaImage className="text-2xl" />
              Game Image Control
            </h1>
            <p className="text-gray-300 text-center mt-1">
              Manage and update game images
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Search Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search games..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Error and Loading States */}
          {error && (
            <div className="mx-6 my-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Only the cards grid shows loading */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loading />
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {filteredGames?.map((game) => (
                  <div
                    key={game.gameId}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 "
                  >
                    {/* Game Image */}
                    <div className="relative aspect-video">
                      <img
                        src={
                          game?.imageUrl ? `${import.meta.env.VITE_BASE_API_URL}${game?.imageUrl}` :
                          game.img || 'https://via.placeholder.com/300x200?text=No+Image'
                        }
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                      {/* Upload Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-[#1f2937] px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2">
                          <FaUpload className="w-4 h-4" />
                          {game.img ? 'Update Image' : 'Add Image'}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleFileSelect(game.gameId, e)}
                            disabled={uploading}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {game.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {game.provider}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        ID: {game.gameId}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Category: {game.category}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Play Count: {game.playCount || 0}
                      </p>
                      <button
                        onClick={() => initGameLaunch(game.gameId)}
                        className="mt-3 w-full bg-[#1f2937] text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Play Game
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(prev => prev + 1)}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageControl; 