export const SearchBar = ({ searchQuery, onSearchChange, onClearSearch }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search by game name or provider..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-60 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#f4c004] transition-all duration-300"
      />
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
        >
          ×
        </button>
      )}
    </div>
  );
}; 