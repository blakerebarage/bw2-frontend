import { SkeletonCard } from '@/components/shared/SkeletonCard';
import useAxiosSecure from '@/Hook/useAxiosSecure';
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useState } from 'react';
import { FaGamepad, FaSearch } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useToasts } from 'react-toast-notifications';

/**
 * GameControl Component
 * 
 * This component manages game categories and their associated games.
 * Features:
 * - Add/Remove multiple categories for games
 * - Display existing category games
 * - Search and filter games
 * - Pagination support
 */
const GameControl = () => {
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  // State Management
  const [allGames, setAllGames] = useState([]);
  const [selectedGames, setSelectedGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [existingCategoryGames, setExistingCategoryGames] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [totalGames, setTotalGames] = useState(0);
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [totalPages, setTotalPages] = useState(0);

  // Search filter state
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Available categories
  const categories = [
    "All",
    "Sports",
    "Live",
    "Table",
    "Slot",
    "Crash",
    "Fishing",
    "Lottery",
  ];

  // Debounce the search query update
  const debouncedSetSearchQuery = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  /**
   * Fetch all games from the API
   */
  const fetchGames = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosSecure.get('/api/v1/game/all-games', {
        params: {
          page: page,
          limit: limit,
          isActive: true,
          search: searchQuery || undefined
        }
      });
      
      if (response?.data?.data) {
        setAllGames(response.data.data.results);
        setTotalPages(response.data.data.pageCount);
        setTotalGames(response.data.data.totalItems);
      }
    } catch (error) {
      setError('Failed to fetch games. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch games for selected category
   */
  const fetchCategoryGames = async (category) => {
    if (!category || category === 'All') {
      setSelectedGames([]);
      setExistingCategoryGames([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosSecure.get('/api/v1/game/all-games', {
        params: {
          isActive: true,
          category: category
        }
      });
      console.log(response);
      if (response?.data?.data) {
        const categoryGames = response.data.data.results;
        setExistingCategoryGames(categoryGames);
        setSelectedGames(categoryGames.map(game => game.gameId));
      }
    } catch (error) {
      addToast("Failed to fetch category games.", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle category selection
   */
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    fetchCategoryGames(category);
  };

  /**
   * Toggle game selection
   */
  const handleGameSelect = (gameId) => {
    setSelectedGames(prev => {
      const newSelectedGames = prev.includes(gameId)
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId];
      
      // If we're in a specific category, update the existingCategoryGames
      if (selectedCategory && selectedCategory !== 'All') {
        setExistingCategoryGames(prevGames => 
          prevGames.map(game => ({
            ...game,
            isSelected: newSelectedGames.includes(game.gameId)
          }))
        );
      }
      
      return newSelectedGames;
    });
  };

  /**
   * Save category games
   */
  const handleSaveCategory = async () => {
    if (!selectedCategory || selectedCategory === 'All') {
      addToast("Please select a category.", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    setLoading(true);

    try {
      await axiosSecure.patch('/api/v1/game/update-games-with-category', {
        category: selectedCategory,
        gameIds: selectedGames
      });

      addToast("Category updated successfully.", {
        appearance: "success",
        autoDismiss: true,
      });

      // Refresh category games after saving
      fetchCategoryGames(selectedCategory);
    } catch (error) {
      addToast("Failed to save category. Please try again later.", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const initGameLaunch = async (gameId) => {
    if (!user?.username) {
      addToast("Please login to play games", {
        appearance: "error",
        autoDismiss: true,
      });
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // First get the game details to get the provider
      const gameDetails = allGames.find(game => game.gameId === gameId);
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
        }
      );
      if (data?.result?.payload?.game_launch_url) {
        navigate(`/game?url=${encodeURIComponent(data.result.payload.game_launch_url)}`);
      } 
      else {
        addToast(data?.result?.message || "Something went wrong", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (error) {
      addToast(error.message || "Failed to launch game", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch games when page, limit, search, or filter changes
  useEffect(() => {
    fetchGames();
  }, [page, limit, searchQuery, filterType, selectedCategory, selectedGames]);

  useEffect(() => {
    debouncedSetSearchQuery(inputValue);
    return () => debouncedSetSearchQuery.cancel();
  }, [inputValue, debouncedSetSearchQuery]);

  // Update the getFilteredGames function to handle category games and remaining games
  const getFilteredGames = () => {
    let filteredGames = [];

    if (selectedCategory && selectedCategory !== 'All') {
      // Get games for the selected category
      const categoryGames = existingCategoryGames;
       console.log(allGames);
      // Get remaining games from all games that aren't in the category
      const remainingGames = allGames.filter(game => 
        !existingCategoryGames.some(catGame => catGame.gameId === game.gameId)
      );

      // Combine category games and remaining games
      filteredGames = [...categoryGames, ...remainingGames];
      
    } else {
      // If no category selected, show all games
      filteredGames = allGames;
    }

    // Apply search filter if there's a search query
    if (searchQuery) {
      filteredGames = filteredGames.filter(game => 
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.provider.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    console.log(selectedGames);
    // Apply selection filter
    if (filterType === 'selected') {
      filteredGames = filteredGames.filter(game => selectedGames.includes(game.gameId));
    } else if (filterType === 'unselected') {
      filteredGames = filteredGames.filter(game => !selectedGames.includes(game.gameId));
    }

    return filteredGames;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
              <FaGamepad className="text-2xl" />
              Game Category Control
            </h1>
            <p className="text-gray-300 text-center mt-1">
              Manage game categories and their associated games
            </p>
            {selectedCategory === 'All' && (
              <div className="mt-2 text-center">
                <span className="inline-block bg-[#f4c004] text-black px-4 py-1 rounded-full text-sm font-medium">
                  Total Games: {totalGames}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Search and Category Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search Filter */}
              <div className="relative">
                <label className="block text-gray-700 font-medium mb-2">Search Games</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by game name or provider..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              
              {/* Category Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm appearance-none"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Selection */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Filter Games</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm appearance-none"
                >
                  <option value="all">All Games</option>
                  <option value="selected">Selected Games</option>
                  <option value="unselected">Unselected Games</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveCategory}
                className="px-6 py-2.5 bg-[#1f2937] text-white rounded-lg font-medium hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Save Category
              </button>
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

          {/* Games Display */}
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaGamepad className="text-[#1f2937]" />
              Games
            </h2>
            {/* Only the cards grid shows loading */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(10)].map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {getFilteredGames().length ? getFilteredGames().map(game => (
                  <div
                    key={game.gameId}
                    className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg ${
                      selectedGames.includes(game.gameId) ? 'ring-2 ring-[#1f2937]' : ''
                    }`}
                  >
                    {/* Card Content */}
                    <div className="relative h-full flex flex-col bg-white text-gray-700">
                      {/* Image Container */}
                      <div className="relative w-full h-40 overflow-hidden cursor-pointer"
                       onClick={() => handleGameSelect(game.gameId)}
                      >
                        <img 
                          src={game.img}
                          alt={game.name}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Selection Overlay */}
                        <div className={`absolute inset-0 transition-all duration-300 ${
                          selectedGames.includes(game.gameId)
                            ? 'bg-[#1f2937]/70 flex items-center justify-center'
                            : 'bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100'
                        }`}>
                          {selectedGames.includes(game.gameId) && (
                            <div className="text-white text-center">
                              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2 mx-auto">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="font-medium">Selected</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Game Info */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-lg mb-1 truncate">
                          {game.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {game.provider}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleGameSelect(game.gameId)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            selectedGames.includes(game.gameId)
                              ? 'bg-[#1f2937] text-white hover:bg-gray-800'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {selectedGames.includes(game.gameId) ? 'Selected' : 'Select'}
                        </button>
                        <button
                          onClick={() => initGameLaunch(game.gameId)}
                          className="flex-1 px-3 py-2 bg-[#f4c004] text-white rounded-lg text-sm font-medium hover:bg-[#e0b000] transition-all duration-200"
                        >
                          Play
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full">
                    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white rounded-xl shadow-sm">
                      <div className="w-20 h-20 mb-4 text-gray-400">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Games Found</h3>
                      <p className="text-gray-500 text-center max-w-md">
                        {searchQuery ? 
                          `No games found matching "${searchQuery}"` :
                          filterType === 'selected' ? 
                            'No selected games found' :
                            filterType === 'unselected' ? 
                              'No unselected games found' :
                              'No games available in this category'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {page} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
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
        </div>
      </div>
    </div>
  );
};

export default GameControl;