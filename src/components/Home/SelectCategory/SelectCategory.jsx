import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

import Loading from "@/components/shared/Loading";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { CategoryCards } from "./CategoryCards";
import { GameCard } from "./GameCard";
import { MostPlayedGames } from "./MostPlayedGames";
import { SearchBar } from "./SearchBar";

export function SelectCategory() {
  
  const [displayGames, setDisplayGames] = useState([]);
  const [mostPlayedGames, setMostPlayedGames] = useState([]);
  const { user } = useSelector((state) => state.auth);
 
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({ value: "favourite", title: "Favourite Games" });
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

 

  // Fetch all games data
  useEffect(() => {
    const fetchAllGames = async () => {
      if (selectedCategory.value === "favourite") return;
      
      try {
        setLoading(true);
        const response = await axiosSecure.get('/api/v1/game/all-games', {
          params: {
            page: currentPage,
            limit: 45,
            isActive: true,
            category: selectedCategory.value === "allgames" ? undefined : selectedCategory.value.charAt(0).toUpperCase() + selectedCategory.value.slice(1)
          }
        });
        
        if (response?.data?.data) {
          setTotalGames(response.data.data.totalItems || 0);
          if (currentPage === 1) {
            
            setDisplayGames(response.data.data.results);
          } else {
            
            setDisplayGames(prev => [...prev, ...response.data.data.results]);
          }
        }
      } catch (error) {
        addToast("Failed to fetch games", {
          appearance: "error",
          autoDismiss: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllGames();
  }, [currentPage, selectedCategory.value, categoryReloadKey]);

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
      addToast("Failed to load favorites", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
   
   
  }, [user?.username, selectedCategory.value, categoryReloadKey]);

  // Handle search for favorites
  useEffect(() => {
    if (selectedCategory.value === "favourite" && searchQuery) {
      const filteredFavorites = favoriteGames.filter(game => 
        game.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.provider?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayGames(filteredFavorites);
    }
  }, [searchQuery, favoriteGames, selectedCategory.value]);

  // Fetch most played games
  useEffect(() => {
    const fetchMostPlayedGames = async () => {
      try {
        const response = await axiosSecure.get('/api/v1/game/most-played-games', {
          params: {
            page: popularPage,
            limit: 15,
            isActive: true
          }
        });
        if (response?.data?.data?.popularGames) {
          setMostPlayedGames(response.data.data.popularGames);
          setPopularTotalPages(response.data.data.pageCount || 1);
        }
      } catch (error) {
        addToast("Failed to fetch most played games", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    };

    fetchMostPlayedGames();
  }, [popularPage]);

  // Add this effect to handle search for non-favourite categories
  useEffect(() => {
    if (selectedCategory.value !== "favourite") {
      const fetchGames = async () => {
        setLoading(true);
        try {
          const response = await axiosSecure.get('/api/v1/game/all-games', {
            params: {
              page: currentPage,
              limit: 45,
              isActive: true,
              category: selectedCategory.value === "allgames" ? undefined : selectedCategory.value.charAt(0).toUpperCase() + selectedCategory.value.slice(1),
              search: searchQuery || undefined
            }
          });

          if (response?.data?.data) {
            setDisplayGames(response.data.data.results);
            setTotalGames(response.data.data.totalItems);
          }
        } catch (error) {
          console.error('Error fetching games:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchGames();
    }
  }, [searchQuery, selectedCategory, currentPage, categoryReloadKey]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setDisplayGames([]);
    setSearchQuery("");
    setCategoryReloadKey(prev => prev + 1);
    if (category.value === "favourite") {
      fetchFavorites();
    }
  };

  const handleFavoriteToggle = async (game) => {
    if (!user?.username) {
      addToast("Please login to manage favorites", {
        appearance: "error",
        autoDismiss: true,
      });
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
      addToast("Failed to update favorite status", {
        appearance: "error",
        autoDismiss: true,
      });
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

    setGameLoading(true);
    try {
      // First get the game details to get the provider
      const gameDetails = displayGames.find(game => game.gameId === gameId);
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
        // Navigate to the game page with the game URL
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
      setGameLoading(false);
    }
  };

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
      {selectedCategory.value === "favourite" && (
        <div className="space-y-4 px-3">
          {user?.username && (
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-[#ffffff] drop-shadow">
                Favourite Games
              </h3>
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearSearch={() => setSearchQuery("")}
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
                  isFavorite={true}
                  user={user}
                />
              ))}
            </div>
          ) : (
            user?.username && <div className="text-center text-[#ffffff] py-8">
              <p className="text-lg">No favorite games found</p>
              <p className="text-sm mt-2 text-[#ffffff]">
                {user?.username ? "Add some games to your favorites" : "Please login to view your favorite games"}
              </p>
            </div>
          )}

          {/* Most Played Games Section - Only in Favourite view */}
          {mostPlayedGames.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-[#ffffff] drop-shadow mb-4">
                Popular Games
              </h3>
              <MostPlayedGames
                games={mostPlayedGames}
                onGameLaunch={initGameLaunch}
                onFavoriteToggle={handleFavoriteToggle}
                favoriteGames={favoriteGames}
                user={user}
              />
             
            </div>
          )}
        </div>
      )}

      {/* Regular Games Section */}
      {selectedCategory.value !== "favourite" && (
        <div className="space-y-4 px-3">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#ffffff] drop-shadow">
              {selectedCategory.title} Games
            </h3>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={() => setSearchQuery("")}
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
              
              {/* Pagination Controls for All Categories */}
              {totalGames > 0 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700">Page</span>
                    <span className="font-semibold text-red-500">{currentPage}</span>
                    <span className="text-gray-700">of</span>
                    <span className="font-semibold text-red-500">
                      {Math.ceil(totalGames / 45)}
                    </span>
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage >= Math.ceil(totalGames / 45)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage >= Math.ceil(totalGames / 45)
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-[#ffffff] py-8">
              <p className="text-lg">No games found</p>
              <p className="text-sm mt-2 text-[#ffffff]">
                Try a different search or category
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 