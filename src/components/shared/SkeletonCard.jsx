
export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-gray-200 rounded-xl h-56 w-full flex flex-col items-center p-4 shadow-md">
      {/* Image Placeholder */}
      <div className="bg-gray-300 rounded-lg w-24 h-24 mb-4 flex items-center justify-center">
        <div className="w-12 h-12 bg-gray-400 rounded-full" />
      </div>
      {/* Title Placeholder */}
      <div className="bg-gray-300 h-5 w-3/4 rounded mb-2" />
      {/* Subtitle Placeholder */}
      <div className="bg-gray-300 h-4 w-1/2 rounded" />
    </div>
  );
} 