export const SearchBar = ({ searchQuery, onSearchChange, onClearSearch }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search by game name or provider..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-60 px-4 py-2 rounded-full bg-white/10 border border-gray-700 text-[#ffffff] placeholder-white/50 focus:outline-none focus:border-gray-100 transition-all duration-300"
      />
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/800 hover:text-red-500"
        >
          ×
        </button>
      )}
    </div>
  );
}; 