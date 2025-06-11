const items = [
  "Casino",
  "Premium",
  "Horseracing",
  "Greyhoundracing",
  "Xjames",
  "kabaddi",
  "Election",
  "Basketball",
  "Bollyball",
  "Snoker",
  "Motorsport",
  "Icehockey",
  "Golf",
  "Esports",
  "Drafts",
  "Cycling",
  "Boxing",
  "Americanfootball",
  "Gaelocgames",
  "Asino",
  "Premium",
  "Horseracing",
  "Greyhoundracing",
  "Xjames",
];

const options = [
  ["Select UserA", "Select UserB", "Select UserC"],
  ["Select MarketA", "Select MarketB", "Select MarketC"],
  ["Select EventA", "Select EventB", "Select EventC"],
  ["Select CurrencyA", "Select CurrencyB", "Select CurrencyC"],
];

const BetList = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center">
              Bet List Management
            </h1>
            <p className="text-gray-300 text-center mt-1">
              View and manage all betting activities
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Categories */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {items.map((item, index) => (
                <label
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <input
                    type="radio"
                    name="category"
                    className="w-4 h-4 text-[#1f2937] border-gray-300 focus:ring-[#1f2937]"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Bet Status */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Bet Status:</label>
                <select className="flex-1 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm">
                  <option value="settled">Settled</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Period:</label>
                <div className="flex-1 flex items-center space-x-2">
                  <input
                    type="date"
                    className="flex-1 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    className="flex-1 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  />
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm font-medium">
                  Just for today
                </button>
                <button className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-sm font-medium">
                  From Yesterday
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium">
                  Show Default
                </button>
                <button className="px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium">
                  Get History
                </button>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search betId"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                />
              </div>

              {/* Stack Filter */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Stack &gt;=</label>
                <input
                  type="number"
                  placeholder="0"
                  className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                />
              </div>

              {/* Dropdown Filters */}
              {options.map((optionGroup, index) => (
                <div key={index} className="relative">
                  <select className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm appearance-none">
                    {optionGroup.map((option, optIndex) => (
                      <option key={optIndex} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="w-4 h-4 text-[#1f2937] border-gray-300 rounded focus:ring-[#1f2937]" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PL ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BET ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BET placed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selection</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Odds req</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stack</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liability</th>
                </tr>
              </thead>
            </table>
          </div>

          {/* Error State */}
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-24 h-24 text-red-500"
              >
                <path d="M18.364 5.636a1.5 1.5 0 0 0-2.121 0L12 9.879 7.757 5.636a1.5 1.5 0 0 0-2.121 2.121L9.879 12l-4.243 4.243a1.5 1.5 0 1 0 2.121 2.121L12 14.121l4.243 4.243a1.5 1.5 0 1 0 2.121-2.121L14.121 12l4.243-4.243a1.5 1.5 0 0 0 0-2.121z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[#1f2937] mb-2">405 Error</h2>
            <p className="text-gray-600 text-center">
              Games not found. Please include API.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetList;
