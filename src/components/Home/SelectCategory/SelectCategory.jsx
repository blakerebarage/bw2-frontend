import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

import Loading from "@/components/shared/Loading";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useLanguage } from "../../../contexts/LanguageContext";
import { CategoryCards } from "./CategoryCards";
import { GameCard } from "./GameCard";
import { MostPlayedGames } from "./MostPlayedGames";
import { SearchBar } from "./SearchBar";

export function SelectCategory() {
  const { t } = useLanguage();
  
  const [displayGames, setDisplayGames] = useState([]);
  const [mostPlayedGames, setMostPlayedGames] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providerPage, setProviderPage] = useState(1);
  const [providerTotalPages, setProviderTotalPages] = useState(1);
  const { user } = useSelector((state) => state.auth);
 
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [popularSearchQuery, setPopularSearchQuery] = useState("");
  const [debouncedPopularSearchQuery, setDebouncedPopularSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({ value: "favourite", title: t('favourite') });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [popularPage, setPopularPage] = useState(1);
  const [popularTotalPages, setPopularTotalPages] = useState(1);
  const [categoryReloadKey, setCategoryReloadKey] = useState(0);

  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Debounce popular search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPopularSearchQuery(popularSearchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [popularSearchQuery]);

  // Fetch active providers when "All" category is selected
  useEffect(() => {
    const fetchProviders = async () => {
      if (selectedCategory.value === "allgames" && !selectedProvider) {
        try {
          setLoading(true);
          const response = await axiosSecure.get('/api/v1/game/providers', {
            params: {
              page: providerPage,
              limit: 30,
              isActive: true,
              search: debouncedSearchQuery || undefined
            }
          });
          
          if (response?.data?.data) {
            setProviders(response.data.data.results);
            setProviderTotalPages(response.data.data.pageCount || 1);
          }
        } catch (error) {
          console.error('Error fetching providers:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProviders();
  }, [selectedCategory.value, selectedProvider, debouncedSearchQuery, providerPage]);

  // Fetch all games data (consolidated with search functionality)
  useEffect(() => {
    const fetchAllGames = async () => {
      if (selectedCategory.value === "favourite") return;
      
      // If "All" category is selected but no provider is selected, don't fetch games
      if (selectedCategory.value === "allgames" && !selectedProvider) return;
      
      try {
        setLoading(true);
        const response = await axiosSecure.get('/api/v1/game/all-games', {
          params: {
            page: currentPage,
            limit: selectedCategory.value === "allgames" ? 45 : 45,
            isActive: true,
            // When searching, ignore category filter to search all games
            category: debouncedSearchQuery ? undefined : (selectedCategory.value === "allgames" ? undefined : selectedCategory.value.charAt(0).toUpperCase() + selectedCategory.value.slice(1)),
            search: debouncedSearchQuery || undefined,
            // Add provider filter when a provider is selected
            provider: selectedProvider ? selectedProvider.name : undefined
          }
        });
        console.log(response)
        if (response?.data?.data) {
          setTotalGames(response.data.data.totalItems || 0);
          // For "allgames" category, always use pagination (replace results)
          // For other categories, use load more (append results) except on first page or search
          if (selectedCategory.value === "allgames" || currentPage === 1 || debouncedSearchQuery) {
            setDisplayGames(response.data.data.results);
          } else {
            // Load more: append new results to existing ones (for other categories)
            setDisplayGames(prev => [...prev, ...response.data.data.results]);
          }
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchAllGames();
  }, [currentPage, selectedCategory.value, categoryReloadKey, debouncedSearchQuery, selectedProvider]);

  // Fetch favorites
  const fetchFavorites = async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const response = await axiosSecure.get(`/api/v1/content/all-favorite/${user.username}`);
      if (response?.data?.data) {
        setFavoriteGames(response.data.data || []);
        if (selectedCategory.value === "favourite") {
          setDisplayGames(response.data.data || []);
        }
      }
    } catch (error) {
     
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
   
   
  }, [user?.username, selectedCategory.value, categoryReloadKey]);

  // Handle search for favorites - now searches ALL games with pagination
  useEffect(() => {
    const searchInFavorites = async () => {
      if (selectedCategory.value === "favourite" && debouncedSearchQuery) {
        setLoading(true);
        try {
          const response = await axiosSecure.get('/api/v1/game/all-games', {
            params: {
              page: currentPage,
              limit: 45,
              isActive: true,
              search: debouncedSearchQuery
            }
          });
         
          if (response?.data?.data) {
            setTotalGames(response.data.data.totalItems);
            // Always replace results for traditional pagination
            setDisplayGames(response.data.data.results);
          }
        } catch (error) {
          console.error('Error searching games:', error);
        } finally {
          setLoading(false);
        }
      } else if (selectedCategory.value === "favourite" && !debouncedSearchQuery) {
        // When search is cleared, show all favorite games
        setDisplayGames(favoriteGames);
        setTotalGames(0); // Reset total games count for favorites
      }
    };

    searchInFavorites();
  }, [debouncedSearchQuery, favoriteGames, selectedCategory.value, currentPage]);

  // Reset page to 1 when search query changes or category changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      setCurrentPage(1);
    }
  }, [debouncedSearchQuery]);

  // Reset popular page to 1 when popular search query changes
  useEffect(() => {
    if (debouncedPopularSearchQuery) {
      setPopularPage(1);
    }
  }, [debouncedPopularSearchQuery]);

  // Fetch most played games
  useEffect(() => {
    const fetchMostPlayedGames = async () => {
      try {
        const response = await axiosSecure.get('/api/v1/game/most-played-games', {
          params: {
            page: popularPage,
            limit: 15,
            isActive: true,
            search: debouncedPopularSearchQuery || undefined
          }
        });
        if (response?.data?.data?.popularGames) {
          // For first page or search, replace results. For load more, append results
          if (popularPage === 1 || debouncedPopularSearchQuery) {
            setMostPlayedGames(response.data.data.popularGames);
          } else {
            setMostPlayedGames(prev => [...prev, ...response.data.data.popularGames]);
          }
          setPopularTotalPages(response.data.data.pageCount || 1);
        }
      } catch (error) {
        
      }
    };

    fetchMostPlayedGames();
  }, [popularPage, debouncedPopularSearchQuery]);

  // Function to format provider name based on word count
  const formatProviderName = (name) => {
    if (!name) return '';
    
    // Check if the name contains spaces (multiple words)
    if (name.includes(' ')) {
      // Multiple words: capitalize first letter of each word
      return name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    } else {
      // Single word: make it all uppercase
      return name.toUpperCase();
    }
  };

  // Function to get translated category title
  const getCategoryTitle = (categoryValue) => {
    const categoryTitleMap = {
      favourite: t('favouriteGames'),
      sports: t('sportsGames'),
      live: t('liveGames'),
      table: t('tableGames'),
      slot: t('slotGames'),
      crash: t('crashGames'),
      fishing: t('fishingGames'),
      Lottery: t('lotteryGames'),
      arcade: t('arcadeGames'),
      allgames: t('allGames'),
    };
    return categoryTitleMap[categoryValue] || `${categoryValue} Games`;
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedProvider(null); // Reset selected provider when category changes
    setCurrentPage(1);
    setProviderPage(1); // Reset provider page
    setDisplayGames([]);
    setSearchQuery("");
    setDebouncedSearchQuery(""); // Reset debounced search query
    setPopularSearchQuery("");
    setDebouncedPopularSearchQuery(""); // Reset popular search query
    setCategoryReloadKey(prev => prev + 1);
    if (category.value === "favourite") {
      fetchFavorites();
    }
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setCurrentPage(1);
    setDisplayGames([]);
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const handleBackToProviders = () => {
    setSelectedProvider(null);
    setDisplayGames([]);
    setCurrentPage(1);
    setProviderPage(1); // Reset provider page
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const handleFavoriteToggle = async (game) => {
    if (!user?.username) {
      
      return;
    }

    const isFavorite = favoriteGames.some(fav => fav.gameId === game.gameId);
    
    try {
      if (isFavorite) {
        const res = await axiosSecure.delete(`/api/v1/content/remove-favorite/${game.gameId}`);
        
        if(res?.data?.data.deletedCount) {    
          setFavoriteGames(prev => prev.filter(fav => fav.gameId !== game.gameId));
          if (selectedCategory.value === "favourite") {
            setDisplayGames(prev => prev.filter(g => g.gameId !== game.gameId));
          }
          addToast("Game removed from favorites", {
            appearance: "success",
            autoDismiss: true,
          });
        }
      } else {
        const favData = {
          username: user.username,
          gameId: game.gameId,
        };
        const response = await axiosSecure.post("/api/v1/content/make-favorite", favData);
        if (response?.data?.data) {
          setFavoriteGames(prev => [...prev, game]);
          if (selectedCategory.value === "favourite") {
            setDisplayGames(prev => [...prev, game]);
          }
          addToast("Game added to favorites", {
            appearance: "success",
            autoDismiss: true,
          });
        }
      }
    } catch (error) {
      
    }
  };

  const initGameLaunch = async (gameId) => {
    if (!user?.username) {
      
      navigate('/login');
      return;
    }

    setGameLoading(true);
    try {
      // First get the game details to get the provider
      // Check both displayGames and mostPlayedGames arrays
      let gameDetails = displayGames.find(game => game.gameId === gameId);
      
      // If not found in displayGames, check mostPlayedGames
      if (!gameDetails) {
        gameDetails = mostPlayedGames.find(game => game.gameId === gameId);
      }
      
      if (!gameDetails) {
        throw new Error('Game not found');
      }
      const provider = await axiosSecure.get(`/api/v1/game/providers?page=1&limit=1000`);
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
      else {
        
      }
    } catch (error) {
      
    } finally {
      setGameLoading(false);
    }
  };

  // Handle Load More functionality (for categories other than "allgames")
  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  // Handle Load More functionality for popular games
  const handlePopularLoadMore = () => {
    setPopularPage(prev => prev + 1);
  };

  // Handle provider pagination
  const handleProviderPageChange = (newPage) => {
    setProviderPage(newPage);
  };

  // Reset provider page when search changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      setProviderPage(1);
    }
  }, [debouncedSearchQuery]);

  // Calculate if there are more pages available
  const hasMorePages = selectedCategory.value === "allgames" 
    ? Math.ceil(totalGames / 45) > currentPage 
    : Math.ceil(totalGames / 45) > currentPage;
  
  // Calculate if there are more popular pages available
  const hasMorePopularPages = popularTotalPages > popularPage;

  if (gameLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <CategoryCards
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />

      {/* Favourite Games Section */}
      {selectedCategory.value === "favourite" &&  (
        <div className="space-y-4 px-3">
          {user?.username && favoriteGames?.length > 0 && (
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white drop-shadow">
                {t('favouriteGames')}
              </h3>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearSearch={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                }}
              />
            </div>
          )}
          
          {loading && user?.username ? (
            <div className="text-center py-8">
              <div className="grid gap-4 grid-cols-3">
                {[...Array(6)].map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            </div>
          ) : user?.username && displayGames?.length > 0 ? (
            <div className="grid gap-4 grid-cols-3">
              {displayGames.map((game) => (
                <GameCard
                  key={game.gameId}
                  game={game}
                  onGameLaunch={initGameLaunch}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={favoriteGames.some(fav => fav.gameId === game.gameId)}
                  user={user}
                />
              ))}
            </div>
          ) : (
            user?.username && favoriteGames?.length > 0 && !debouncedSearchQuery && <div className="text-center text-gray-300 py-8">
              <p className="text-lg">No favorite games found</p>
              <p className="text-sm mt-2 text-gray-400">
                {user?.username ? "Add some games to your favorites" : "Please login to view your favorite games"}
              </p>
            </div>
          )}

          {/* Show "No results found" only when searching */}
          {debouncedSearchQuery && displayGames?.length === 0 && !loading && (
            <div className="text-center text-gray-300 py-8">
              <p className="text-lg">No games found</p>
              <p className="text-sm mt-2 text-gray-400">
                Try a different search term
              </p>
            </div>
          )}

          {/* Most Played Games Section - Always show in Favourite view */}
          <div className="mt-6">
            <MostPlayedGames
              games={mostPlayedGames}
              onGameLaunch={initGameLaunch}
              onFavoriteToggle={handleFavoriteToggle}
              favoriteGames={favoriteGames}
              user={user}
              searchQuery={popularSearchQuery}
              onSearchChange={setPopularSearchQuery}
              onClearSearch={() => {
                setPopularSearchQuery("");
                setDebouncedPopularSearchQuery("");
              }}
              onLoadMore={handlePopularLoadMore}
              hasMorePages={hasMorePopularPages}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Providers Section - Show when "All" category is selected and no provider is selected */}
      {selectedCategory.value === "allgames" && !selectedProvider && (
        <div className="space-y-4 px-3 pb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white drop-shadow">
              {t('gameProviders')}
            </h3>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => {
                setSearchQuery("");
                setDebouncedSearchQuery("");
              }}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="grid gap-4 grid-cols-3">
                {[...Array(6)].map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            </div>
          ) : providers?.length > 0 ? (
            <div className="grid gap-4 grid-cols-3">
              {providers.map((provider) => (
                <div
                  key={provider._id}
                  onClick={() => handleProviderSelect(provider)}
                  className="bg-[#22282e] rounded-lg p-4 cursor-pointer hover:bg-[#2a3038] transition-all duration-200 hover:scale-105 min-h-[80px] flex items-center justify-center"
                >
                  <div className="text-center w-full">
                    <h3 className="text-white font-semibold text-xs leading-tight break-words overflow-hidden">
                      {formatProviderName(provider.name)}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-300 py-8">
              <p className="text-lg">{t('noProvidersFound')}</p>
              <p className="text-sm mt-2 text-gray-400">
                {t('tryDifferentSearch')}
              </p>
            </div>
          )}

          {/* Provider Pagination */}
          {providers?.length > 0 && providerTotalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handleProviderPageChange(Math.max(providerPage - 1, 1))}
                disabled={providerPage === 1}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  providerPage === 1
                    ? 'bg-[#22282e] text-gray-400 cursor-not-allowed border border-[#facc15]/20'
                    : 'bg-[#1a1f24] text-gray-300 hover:bg-[#22282e] border border-[#facc15]/20'
                }`}
              >
                {t('previous')}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-gray-300">{t('page')}</span>
                <span className="font-semibold text-[#facc15]">{providerPage}</span>
                <span className="text-gray-300">{t('of')}</span>
                <span className="font-semibold text-[#facc15]">
                  {providerTotalPages}
                </span>
              </div>

              <button
                onClick={() => handleProviderPageChange(providerPage + 1)}
                disabled={providerPage >= providerTotalPages}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                  providerPage >= providerTotalPages
                    ? 'bg-[#22282e] text-gray-400 cursor-not-allowed border border-[#facc15]/20'
                    : 'bg-[#facc15] text-[#1a1f24] hover:bg-[#e6b800]'
                }`}
              >
                {t('next')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Games Section - Show when a provider is selected or for other categories */}
      {((selectedCategory.value !== "favourite" && selectedCategory.value !== "allgames") || selectedProvider) && (
        <div className="space-y-4 px-3 pb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {selectedProvider && (
                <button
                  onClick={handleBackToProviders}
                  className="text-[#facc15] hover:text-[#e6b800] transition-colors duration-200 text-2xl"
                >
                  ←
                </button>
              )}
              <div className="flex items-center gap-x-2">
                {selectedProvider && (
                  <h2 className="text-xl font-bold text-[#facc15] uppercase">
                    {formatProviderName(selectedProvider.name)}
                  </h2>
                )}
                <h3 className="text-2xl font-semibold text-white">
                 {
                  !selectedProvider  && getCategoryTitle(selectedCategory.value)
                 } 
                </h3>
              </div>
            </div>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => {
                setSearchQuery("");
                setDebouncedSearchQuery("");
              }}
            />
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="grid gap-4 grid-cols-3">
                {[...Array(6)].map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            </div>
          ) : displayGames?.length > 0 ? (
            <>
              <div className="grid gap-4 grid-cols-3">
                {displayGames.map((game) => (
                  <GameCard
                    key={game.gameId}
                    game={game}
                    onGameLaunch={initGameLaunch}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favoriteGames.some(fav => fav.gameId === game.gameId)}
                    user={user}
                  />
                ))}
              </div>
              
              {/* Conditional rendering based on category type */}
              {selectedCategory.value === "allgames" ? (
                // Traditional Pagination for "All Games" category
                totalGames > 45 && Math.ceil(totalGames / 45) > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        currentPage === 1
                          ? 'bg-[#22282e] text-gray-400 cursor-not-allowed border border-[#facc15]/20'
                          : 'bg-[#1a1f24] text-gray-300 hover:bg-[#22282e] border border-[#facc15]/20'
                      }`}
                    >
                      {t('previous')}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">{t('page')}</span>
                      <span className="font-semibold text-[#facc15]">{currentPage}</span>
                      <span className="text-gray-300">{t('of')}</span>
                      <span className="font-semibold text-[#facc15]">
                        {Math.ceil(totalGames / 45)}
                      </span>
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= Math.ceil(totalGames / 45)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        currentPage >= Math.ceil(totalGames / 45)
                          ? 'bg-[#22282e] text-gray-400 cursor-not-allowed border border-[#facc15]/20'
                          : 'bg-[#facc15] text-[#1a1f24] hover:bg-[#e6b800]'
                      }`}
                    >
                      {t('next')}
                    </button>
                  </div>
                )
              ) : (
                // Load More Button for other categories (Slots, Table Games, etc.)
                hasMorePages && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        loading
                          ? 'bg-[#22282e] text-gray-400 cursor-not-allowed border border-[#facc15]/20'
                          : 'bg-[#facc15] text-[#1a1f24] hover:bg-[#e6b800] transform hover:scale-105'
                      }`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          {t('loading')}
                        </div>
                      ) : (
                        t('loadMore')
                      )}
                    </button>
                  </div>
                )
              )}
            </>
          ) : (
            <div className="text-center text-gray-300 py-8">
              <p className="text-lg">{t('noGamesFound')}</p>
              <p className="text-sm mt-2 text-gray-400">
                {t('tryDifferentSearchOrCategory')}
              </p>
            </div>
          )}
         
        </div>
      )}
      
    </div>
  );
} 