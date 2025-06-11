import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

import Loading from "@/components/shared/Loading";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { CategoryCards } from "./CategoryCards";
import { GameCard } from "./GameCard";
import { MostPlayedGames } from "./MostPlayedGames";
import { SearchBar } from "./SearchBar";

export function SelectCategory() {
  const [allGames, setAllGames] = useState([]);
  const [displayGames, setDisplayGames] = useState([]);
  const [mostPlayedGames, setMostPlayedGames] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [gameLoading, setGameLoading] = useState(false);
  const [favoriteGames, setFavoriteGames] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({ value: "favourite", title: "Favourite Games" });
  const [updatedImagesMap, setUpdatedImagesMap] = useState({});
  const [gamesToShow, setGamesToShow] = useState(45);

  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 800 });
  }, []);

  // Fetch all games data and updated images map
  useEffect(() => {
    const fetchAllGames = async () => {
      try {
        setLoading(true);
        const [gamesResponse, imagesResponse] = await Promise.all([
          axiosSecure.get('/api/v1/playwin/games/All'),
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
        setUpdatedImagesMap(imagesMap);

        if (gamesResponse?.data?.data) {
          setAllGames(gamesResponse.data.data || []);
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
  }, []);

  // Handle category selection and search
  useEffect(() => {
    const fetchGamesByCategory = async () => {
      try {
        setLoading(true);
        let categoryGames = [];

        if (selectedCategory.value === "favourite") {
          if (user?.username) {
            const favoritesResponse = await axiosSecure.get(`/api/v1/content/all-favorite/${user.username}`);
            categoryGames = favoritesResponse.data.data || [];
            setDisplayGames(categoryGames);
          }
        } else if (selectedCategory.value === "allgames") {
          categoryGames = allGames;
        } else {
          const categoryResponse = await axiosSecure.get(
            `/api/v1/playwin/games/${selectedCategory.value.charAt(0).toUpperCase() + selectedCategory.value.slice(1)}`
          );
          categoryGames = categoryResponse.data.data || [];
        }

        if (searchQuery) {
          const searchResults = allGames.filter(game => 
            game.game_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            game.provider_name?.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setDisplayGames(searchResults);
        } else {
          setDisplayGames(categoryGames);
        }
      } catch (error) {
        addToast("Failed to fetch category games", {
          appearance: "error",
          autoDismiss: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGamesByCategory();
  }, [selectedCategory, user?.username, searchQuery, allGames]);

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user?.username) {
        try {
          const res = await axiosSecure.get(`/api/v1/content/all-favorite/${user.username}`);
          
          setFavoriteGames(res.data.data || []);
        } catch (err) {
          addToast("Failed to load favorites", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      }
    };
    fetchFavorites();
  }, [user?.username]);

  // Fetch most played games
  useEffect(() => {
    const fetchMostPlayedGames = async () => {
      try {
        const [response, imagesResponse] = await Promise.all([
          axiosSecure.get('/api/v1/playwin/most-played-games?limit=9'),
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

          setMostPlayedGames(updatedGames);
        }
      } catch (error) {
        addToast("Failed to fetch most played games", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    };

    fetchMostPlayedGames();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setGamesToShow(45);
  };

  const handleLoadMore = () => {
    setGamesToShow(prev => prev + 45);
  };

  const handleFavoriteToggle = async (game) => {
    if (!user?.username) {
      addToast("Please login to manage favorites", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    const isFavorite = favoriteGames.some(fav => fav.game_code === game.game_code);
    
    try {
      if (isFavorite) {
        const res = await axiosSecure.delete(`/api/v1/content/remove-favorite/${game.game_code}`);
        
        if(res?.data?.data.deletedCount) {    
          setFavoriteGames(prev => prev.filter(fav => fav.game_code !== game.game_code));
          if (selectedCategory?.value === "favourite") {
            setDisplayGames(prev => prev.filter(g => g.game_code !== game.game_code));
          }
          addToast("Game removed from favorites", {
            appearance: "success",
            autoDismiss: true,
          });
        }
      } else {
        const favData = {
          username: user.username,
          gameId: game.game_code,
        };
        const response = await axiosSecure.post("/api/v1/content/make-favorite", favData);
        if (response?.data?.data) {
          setFavoriteGames(prev => [...prev, game]);
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
    await axiosSecure.post(`/api/v1/playwin/increment-game-play-count/${gameId}`);
    try {
      const { data } = await axiosSecure.get(
        `/api/v1/playwin/game-launch?user_id=${user?.username}&wallet_amount=${user?.balance}&game_uid=${gameId}`
      );

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      addToast("Failed to launch game", {
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
          {user?.username && displayGames?.length > 0 && (
            <h3 className="text-2xl font-bold text-[#f4c004] drop-shadow">
              Favourite Games
            </h3>
          )}
          {loading ? (
            <div className="text-center py-8">
              <Loading />
            </div>
          ) : displayGames?.length > 0 ? (
            <div className="grid gap-4 grid-cols-3">
              {displayGames.map((game) => (
                <GameCard
                  key={game.game_code}
                  game={game}
                  updatedImagesMap={updatedImagesMap}
                  onGameLaunch={initGameLaunch}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={favoriteGames.some(fav => fav.game_code === game.game_code)}
                  user={user}
                />
              ))}
            </div>
          ) : user?.username ? (
            null
            
          ) : null}

          {/* Most Played Games Section - Only in Favourite view */}
          {mostPlayedGames.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-bold text-[#f4c004] drop-shadow mb-4">
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

      {/* Category Games Section */}
      {selectedCategory.value !== "favourite" && (
        <div className="space-y-4 px-3">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-[#f4c004] drop-shadow">
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
              <Loading />
            </div>
          ) : displayGames?.length > 0 ? (
            <>
              <div className="grid gap-4 grid-cols-3">
                {displayGames.slice(0, gamesToShow).map((game) => (
                  <GameCard
                    key={game.game_code}
                    game={game}
                    updatedImagesMap={updatedImagesMap}
                    onGameLaunch={initGameLaunch}
                    onFavoriteToggle={handleFavoriteToggle}
                    isFavorite={favoriteGames.some(fav => fav.game_code === game.game_code)}
                    user={user}
                  />
                ))}
              </div>
              {selectedCategory.value === "allgames" && displayGames.length > gamesToShow && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    className="px-6 py-2 bg-[#f4c004] text-black font-semibold rounded-lg hover:bg-[#e0b000] transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-white/70 py-8">
              <p className="text-lg">No games found</p>
              <p className="text-sm mt-2 text-white/50">
                Try a different search or category
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 