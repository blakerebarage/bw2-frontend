import { GameCard } from './GameCard';

export const MostPlayedGames = ({ games, onGameLaunch, onFavoriteToggle, favoriteGames, user }) => {
  if (!games.length) return null;

  return (
    <div className="space-y-4 px-3">
     
      
      <div className="grid gap-4 grid-cols-3">
        {games.map((game) => (
          <GameCard
            key={game.game_code}
            game={game}
            onGameLaunch={onGameLaunch}
            onFavoriteToggle={onFavoriteToggle}
            isFavorite={favoriteGames.some(fav => fav.gameId === game.gameId)}
            user={user}
          />
        ))}
      </div>
    </div>
  );
}; 