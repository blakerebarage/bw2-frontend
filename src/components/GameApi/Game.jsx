const fieldNames = [
  "Sprots Live TV Api key ",
  "Kambi API Key",
  "Playtech API Key",
  "BetFair APIApi key",
  "Pinnacle API Key",
  "etEnt API Key",
  " Sports Radar API Key",
  "SoftSwiss API Key",
  "SABA Sports Api key",
  "Odds Jam API Key",
  "Evolution API Key",
  "OBS Api key",
  "Bet Construct API Key",
  "Pragmatic Play API Key",
  "iNsports Api key",
];

const Game = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center">
              Game API Key Settings
            </h1>
            <p className="text-gray-300 text-center mt-1">
              Manage your game provider API keys
            </p>
          </div>
        </div>

        {/* API Keys Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fieldNames.map((fieldName, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <label
                htmlFor={`input-${index}`}
                className="block text-sm font-medium text-[#1f2937] mb-2"
              >
                {fieldName}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id={`input-${index}`}
                  type="text"
                  className="flex-1 h-10 px-4 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                  placeholder="Enter API key"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-[#1f2937] text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <button className="px-8 py-3 bg-[#1f2937] text-white font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;
