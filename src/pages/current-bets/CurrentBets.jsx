import PageHeader from "@/components/shared/PageHeader";
import { ImSpinner8 } from "react-icons/im";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import SelectOption from "./SelectOption";

const CurrentBets = () => {
  return (
    <div className="min-h-screen bg-[#1b1f23] mt-16">
      <PageHeader title="Current Bets" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <Tabs>
            <div className="border-b border-gray-200">
              <TabList className="flex flex-wrap items-center justify-center gap-2 p-4">
                {["All", "Exchange", "Casino", "Fancybet", "Bookmaker", "SportsBook"].map((tab) => (
                  <Tab
                    key={tab}
                    selectedClassName="bg-[#1b1f23] text-white px-4 py-2 rounded-lg transform scale-105 transition-all duration-300"
                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-300 cursor-pointer font-medium"
                  >
                    {tab}
                  </Tab>
                ))}
              </TabList>
            </div>

            {[...Array(6)].map((_, index) => (
              <TabPanel key={index}>
                <div className="p-4">
                  <SelectOption />
                </div>
                <div className="bg-gradient-to-br from-[#eef6fb] to-[#f8fafc] min-h-[45rem] flex items-center justify-center p-4">
                  <div className="bg-white flex flex-col items-center justify-center gap-4 p-8 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                    <div className="relative">
                      <ImSpinner8 className="text-5xl text-[#1b1f23] animate-spin" />
                      <div className="absolute inset-0 bg-white/50 rounded-full blur-sm"></div>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-700">No Data Available</h1>
                    <p className="text-gray-500 text-center max-w-md">
                      There are currently no bets in this category. Check back later for updates.
                    </p>
                  </div>
                </div>
              </TabPanel>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CurrentBets;
