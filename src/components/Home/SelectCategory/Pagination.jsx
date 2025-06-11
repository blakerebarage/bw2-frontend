export const Pagination = ({ currentPage, totalPages, onPrevPage, onNextPage }) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1}
        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
          currentPage === 1
            ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
            : "bg-[#f4c004] text-black hover:bg-[#f4c004]/80"
        }`}
      >
        Previous
      </button>
      <span className="text-white font-semibold">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={onNextPage}
        disabled={currentPage >= totalPages}
        className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
          currentPage >= totalPages
            ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
            : "bg-[#f4c004] text-black hover:bg-[#f4c004]/80"
        }`}
      >
        Next
      </button>
    </div>
  );
}; 