
export const SkeletonCard = ({ className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="animate-pulse">
        {/* Image placeholder */}
        <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
        
        {/* Title */}
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        
        {/* Description */}
        <div className="h-3 bg-gray-200 rounded mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        
        {/* Button */}
        <div className="h-8 bg-gray-200 rounded mt-4"></div>
      </div>
    </div>
  );
};

export const SkeletonText = ({ lines = 3, className = "" }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded animate-pulse ${
            index === lines - 1 ? "w-3/4" : "w-full"
          }`}
        ></div>
      ))}
    </div>
  );
};

export const SkeletonAvatar = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20"
  };

  return (
    <div className={`${sizeClasses[size]} bg-gray-200 rounded-full animate-pulse ${className}`}></div>
  );
};

export const SkeletonButton = ({ className = "" }) => {
  return (
    <div className={`h-10 bg-gray-200 rounded-lg animate-pulse ${className}`}></div>
  );
};

export const SkeletonTable = ({ rows = 5, columns = 4, className = "" }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex space-x-4">
        {[...Array(columns)].map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {[...Array(columns)].map((_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonForm = ({ fields = 4, className = "" }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(fields)].map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
    </div>
  );
};

export const SkeletonStats = ({ count = 4, className = "" }) => {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className="text-center space-y-3">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}; 