import { SkeletonCard } from '@/components/shared/SkeletonCard';
import useAxiosSecure from '@/Hook/useAxiosSecure';
import { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaGamepad, FaPlay, FaSearch } from 'react-icons/fa';
import { useToasts } from 'react-toast-notifications';
import Swal from 'sweetalert2';

const MostPlayedGamesMonitor = () => {
  const [games, setGames] = useState([]);
  const [allGames, setAllGames] = useState([]); // Store all games for frontend filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();

  // Fetch all games once
  const fetchGames = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axiosSecure.get(`/api/v1/game/most-played-games?page=${page}&limit=50`);
      
      if (response?.data?.data) {
        setGames(response.data.data.popularGames);
        setAllGames(response.data.data.popularGames);
        setTotalPages(response.data.data.pageCount);
        setTotalItems(response.data.data.totalItems);
      }
    } catch (error) {
      
      addToast('Failed to fetch games', {
        appearance: 'error',
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Update play count for a game
  const updatePlayCount = async (gameId, playCountData) => {
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
       
        const response = await axiosSecure.patch(`/api/v1/game/update-play-count/${gameId}`, {
          playCount: parseInt(playCount)
        });
        
        addToast('Play count updated successfully', {
          appearance: 'success',
          autoDismiss: true,
        });
        // Refresh the games list
        fetchGames(currentPage);
      } catch (error) {
      
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
        game.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.gameId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setGames(filtered);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchGames(newPage);
    }
  };

  useEffect(() => {
    fetchGames(currentPage);   
  }, []); // Only fetch once on mount

  // Optionally, filter as user types (live search)
  useEffect(() => {
    if (!searchQuery) {
      setGames(allGames);
    } else {
      const filtered = allGames.filter(game =>
        game.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.gameId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setGames(filtered);
    }
  }, [searchQuery, allGames]);

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {[...Array(8)].map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
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
              <>
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
                            src={game.img}
                            alt={game.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-100 transition-all duration-300"></div>
                        </div>

                        {/* Game Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {game.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Provider: {game.provider}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm font-medium text-gray-700">
                              Play Count: {game.playCount || 0}
                            </span>
                            <button
                              onClick={() => updatePlayCount(game.gameId, game.playCount)}
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

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * 50 + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * 50, totalItems)}</span> of{' '}
                      <span className="font-medium">{totalItems}</span> results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {generatePageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-[#1f2937] text-white border-[#1f2937]'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <FaChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MostPlayedGamesMonitor; 