import React, { useEffect, useState } from "react";
import Loading from './../shared/Loading';

const GameProviders = () => {
  const [providers, setProviders] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null); 

  const fetchProviders = async () => {
    try {
      const response = await fetch("/gameProviders.json");
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setProviders(data.data);
    } catch (err) {
      setError("Failed to fetch providers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
    setExpandedIndex(null);
  };

  const handleSelectProvider = (index) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  const displayedProviders = showAll ? providers : providers.slice(0, 9);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-600">
        <Loading></Loading>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4 bg-transparent backdrop-blur-xl">
      <h2 className="text-2xl font-bold mb-6 text-yellow-500">Game Providers</h2>

      <div className="flex flex-wrap items-start">
        {displayedProviders.map((item, index) => (
          <div key={index} className="rounded-lg m-1">
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className={`btn text-left font-semibold border-sky-500 text-gray-100 ${
                  selectedIndex === index
                    ? "bg-gradient-to-b from-sky-500 via-sky-700 to-indigo-900 shadow-inner"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
                onClick={() => {
                  toggleExpand(index);
                  handleSelectProvider(index); 
                }}
              >
                {item.provider}
              </div>

              {expandedIndex === index && (
                <ul
                  tabIndex={0}
                  className="dropdown-content text-gray-100 menu bg-gradient-to-b from-sky-500 via-sky-700 to-indigo-900 min-w-[180px] rounded-box p-2 mt-2 shadow z-[1]"
                >
                  {item.game_types.map((type, i) => (
                    <li key={i}>
                      <a className="text-sm z-50 hover:text-yellow-500">
                        {type.includes("?") ? "Unknown" : type}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>

      {providers.length > 8 && (
        <div className="text-center mt-4">
          <button
            onClick={toggleShowAll}
            className="btn border-none btn-sm bg-sky-600 text-white hover:bg-blue-700"
          >
            {showAll ? "See Less" : "See More"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GameProviders;
