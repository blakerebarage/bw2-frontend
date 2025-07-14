import useAxiosSecure from "@/Hook/useAxiosSecure";
import useManualUserDataReload from "@/Hook/useUserDataReload";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const GameLauncher = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  const { gameId } = useParams();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { reloadUserData } = useManualUserDataReload();
  const pathName = useLocation().pathname;
  useEffect(() => {
    (async () => {
      try {
        await reloadUserData();
        const { data } = await axiosSecure.get(
          `/api/v1/playwin/game-launch?user_id=${user?.username}&wallet_amount=${user?.balance}&game_uid=${gameId}`
        );
        setGameData(data);
        
      } catch (error) {
        ''
      }
    })();
  }, [user, gameId, pathName]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {gameData?.url ? (
        <iframe
          src={gameData?.url}
          frameBorder="0"
          className="w-full h-screen"
          title="Game Launch"
        ></iframe>
      ) : (
        <p>Loading game or no URL found.</p>
      )}
    </div>
  );
};

export default GameLauncher;
