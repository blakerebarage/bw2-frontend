import Loading from '@/components/shared/Loading';
import useAxiosSecure from '@/Hook/useAxiosSecure';
import { useEffect, useState } from 'react';
import { FaGamepad, FaPlay, FaSearch } from 'react-icons/fa';
import { useToasts } from 'react-toast-notifications';
import Swal from 'sweetalert2';

const MostPlayedGamesMonitor = () => {
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]); // Store all games for frontend filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();

  // Fetch all games once
  const fetchGames = async () => {
    setLoading(true);
    try {
      const [response, imagesResponse] = await Promise.all([
        axiosSecure.get(`/api/v1/playwin/most-played-games`), // Remove search param
        axiosSecure.get('/api/v1/content/all-game-images')
      ]);
      let imagesMap = {};
      if (imagesResponse?.data?.data) {
        imagesResponse.data.data.forEach(game => {
          if (game.url) {
            imagesMap[game.game_code] = game.url;
          }
        });
      }

      if (response?.data?.data) {
        const updatedGames = (response.data.data.popularGames || []).map(game => ({
          ...game,
          game_image: imagesMap[game.game_code] 
            ? imagesMap[game.game_code]
            : game.game_image?.startsWith('http') 
              ? game.game_image 
              : `${import.meta.env.VITE_BASE_API_URL}${game.game_image}`,
          isUpdatedImage: !!imagesMap[game.game_code]
        }));

        setGames(updatedGames);
        setAllGames(updatedGames); // Store all games for filtering
      }
    } catch (error) {
      console.log(error);
      addToast('Failed to fetch games', {
        appearance: 'error',
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Update play count for a game
  const updatePlayCount = async (gameId,playCountData) => {
    const { value: playCount } = await Swal.fire({
      title: 'Update Play Count',
      input: 'number',
      inputLabel: 'Enter new play count',
      inputValue: playCountData,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a value';
        }
        if (value < 0) {
          return 'Play count cannot be negative';
        }
      }
    });

    if (playCount) {
      try {
        await axiosSecure.patch(`/api/v1/playwin/update-play-count/${gameId}`, {
          playCount: parseInt(playCount)
        });
        addToast('Play count updated successfully', {
          appearance: 'success',
          autoDismiss: true,
        });
        // Refresh the games list
        fetchGames();
      } catch (error) {
        console.log(error);
        addToast('Failed to update play count', {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
  };

  // Handle search (frontend filtering)
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery) {
      setGames(allGames);
    } else {
      const filtered = allGames.filter(game =>
        game.game_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.game_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setGames(filtered);
    }
  };

  useEffect(() => {
    fetchGames();   
  }, []); // Only fetch once on mount

  // Optionally, filter as user types (live search)
  useEffect(() => {
    if (!searchQuery) {
      setGames(allGames);
    } else {
      const filtered = allGames.filter(game =>
        game.game_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.game_code?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setGames(filtered);
    }
  }, [searchQuery, allGames]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
              <FaGamepad className="text-2xl" />
              Most Played Games Monitor
            </h1>
            <p className="text-gray-300 text-center mt-1">
              Monitor and manage game play counts
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Search Section */}
          <div className="p-6 border-b border-gray-200">
            <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </form>
          </div>

          {/* Games Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loading />
            </div>
          ) : (
            games.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">No Data Found</p>
                <p className="text-sm">There are no games found</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {games.map((game) => (
                    <div
                      key={game._id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      {/* Game Image */}
                      <div className="relative aspect-video">
                        <img
                          src={game.isUpdatedImage ? `${import.meta.env.VITE_BASE_API_URL}${game.game_image}` : game.game_image}
                          alt={game.game_name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-100 transition-all duration-300"></div>
                      </div>

                      {/* Game Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {game.game_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Code: {game.game_code}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-sm font-medium text-gray-700">
                            Play Count: {game.play_count || 0}
                          </span>
                          <button
                            onClick={() => updatePlayCount(game.game_code,game.play_count)}
                            className="inline-flex items-center px-3 py-1.5 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                          >
                            <FaPlay className="w-3 h-3 mr-1" />
                            Update Count
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MostPlayedGamesMonitor; 