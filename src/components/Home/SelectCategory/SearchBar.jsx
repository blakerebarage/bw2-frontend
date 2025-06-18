export const SearchBar = ({ searchQuery, onSearchChange, onClearSearch }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search by game name"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-60 px-4 py-2 rounded-full bg-white/10 border border-gray-700 text-[#facc15] placeholder:text-[#facc15]/50 focus:outline-none focus:border-[#facc15] transition-all duration-300"
      />
      {searchQuery && (
        <button
          onClick={onClearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#facc15] hover:text-[#facc15]"
        >
          ×
        </button>
      )}
    </div>
  );
}; 