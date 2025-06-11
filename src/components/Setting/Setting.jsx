const items = [
  "Default span",
  "Sport wise",
  "Competition wise",
  "Event wise",
  "Market wise",
];
const itemsTwo = [
  "Default span",
  "Admin wise",
  "Subadmin wise",
  "Supermaster wise",
  "Master wise",
  "Agent wise",
  "Client wise",
];
const settings = [
  {
    title: "Exposure Limit:",
    placeholder: "10000",
  },
  {
    title: "Bookmaking Commission:",
    placeholder: "0",
  },
  {
    title: "Exchange Commission:",
    placeholder: "2",
  },
  {
    title: "Bet Delay:",
    placeholder: "5",
  },
  {
    title: "No of Minutes in play:",
    placeholder: "0",
  },
];
const marketSettings = [
  { title: "Bet Min Rate:", placeholder: "20" },
  { title: "Bet Max Rate:", placeholder: "20" },
  { title: "Volume Multiplier:", placeholder: "20" },
  { title: "Min Stake:", placeholder: "10000" },
  { title: "Max Stake:", placeholder: "20000" },
  { title: "Max Profit:", placeholder: "30000" },
  { title: "Max Loss:", placeholder: "100000" },
];
const sessionSettings = [
  { title: "Min Stake:", placeholder: "1" },
  { title: "Max Stake:", placeholder: "500000" },
  { title: "Max Loss:", placeholder: "200000" },
  { title: "Max Profit:", placeholder: "30000" },
  { title: "Per Rate Max Stake:", placeholder: "2" },
  { title: "Commission %:", placeholder: "5" },
  { title: "Bet Delay:", placeholder: "4" },
];
const bookmakingSettings = [
  { title: "Bet Delay:", placeholder: "20000" },
  { title: "Max Stake:", placeholder: "10000" },
  { title: "Min Stake:", placeholder: "5" },
  { title: "Max Profit:", placeholder: "3" },
  { title: "Max Loss:", placeholder: "2" },
  { title: "Max Stake Per Rate:", placeholder: "5000" },
];

const Setting = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-[#1f2937] mb-2">General Settings</h2>
          <p className="text-gray-600">Configure your betting and account settings</p>
        </div>

        {/* Radio Button Groups */}
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1f2937]">Span Settings</h3>
            <div className="flex flex-wrap gap-4">
              {items.map((item, index) => (
                <label
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <input
                    type="radio"
                    name="span"
                    className="w-4 h-4 text-[#1f2937] border-gray-300 focus:ring-[#1f2937]"
                  />
                  <span className="ml-2 text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1f2937]">User Type Settings</h3>
            <div className="flex flex-wrap gap-4">
              {itemsTwo.map((item, index) => (
                <label
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                >
                  <input
                    type="radio"
                    name="userType"
                    className="w-4 h-4 text-[#1f2937] border-gray-300 focus:ring-[#1f2937]"
                  />
                  <span className="ml-2 text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Limit Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-[#1f2937] mb-4 text-center">Limit Settings</h3>
            <div className="space-y-4">
              {settings.map((setting, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{setting.title}</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder={setting.placeholder}
                      className="flex-1 h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors duration-200"
                    />
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#1f2937] border-gray-300 rounded focus:ring-[#1f2937]"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-[#1f2937] mb-4 text-center">Market Settings</h3>
            <div className="space-y-4">
              {marketSettings.map((setting, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{setting.title}</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder={setting.placeholder}
                      className="flex-1 h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors duration-200"
                    />
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#1f2937] border-gray-300 rounded focus:ring-[#1f2937]"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Settings */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-[#1f2937] mb-4 text-center">Session Settings</h3>
            <div className="space-y-4">
              {sessionSettings.map((setting, index) => (
                <div key={index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{setting.title}</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder={setting.placeholder}
                      className="flex-1 h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors duration-200"
                    />
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#1f2937] border-gray-300 rounded focus:ring-[#1f2937]"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bookmaking Settings */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-[#1f2937] mb-6 text-center">Bookmaking Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {bookmakingSettings.map((setting, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{setting.title}</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder={setting.placeholder}
                    className="flex-1 h-10 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors duration-200"
                  />
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#1f2937] border-gray-300 rounded focus:ring-[#1f2937]"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button className="px-6 py-2.5 bg-[#1f2937] text-white font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2 transition-colors duration-200">
            Save Changes
          </button>
          <button className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors duration-200">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;
