import { useEffect, useState } from "react";
import { FaChartLine } from "react-icons/fa";
import useAxiosSecure from "../Hook/useAxiosSecure";

const TurnOver = () => {
  const [turnover, setTurnover] = useState(null);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchTurnoverData = async () => {
      try {
        const turnoverResponse = await axiosSecure.get("/api/v1/finance/user-turnovers?page=1&limit=10");
        if (turnoverResponse.data.success) {
          setTurnover(turnoverResponse.data.data.results[0]);
        }
      } catch (error) {
       
      }
    };

    fetchTurnoverData();
  }, [axiosSecure]);

  const calculateTurnoverPercentage = () => {
    if (!turnover) return 0;
    return (turnover.currentTurnover / turnover.turnoverLimit) * 100;
  };

  if (!turnover) {
    return (
      <div className="mt-16">
        {/* Header Section */}
        <div className="mb-6 px-6">
          <h1 className="text-3xl font-bold text-white mb-2">Turnover Analytics</h1>
          <p className="text-gray-400">Track your turnover progress and status</p>
        </div>

        {/* No Data Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <FaChartLine className="text-2xl text-white" />
              <h2 className="text-xl font-semibold text-white">Turnover Status</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mb-4">
                <FaChartLine className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Turnover Data Available</h3>
              <p className="text-gray-400">Your turnover information will appear here once available.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      {/* Header Section */}
      <div className="mb-6 px-6">
        <h1 className="text-3xl font-bold text-white mb-2">Turnover Analytics</h1>
        <p className="text-gray-400">Track your turnover progress and status</p>
      </div>

      {/* Main Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <FaChartLine className="text-2xl text-white" />
            <h2 className="text-xl font-semibold text-white">Turnover Status</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Turnover Limit */}
            <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <FaChartLine className="text-lg text-purple-400" />
                </div>
                <span className="text-gray-300">Turnover Limit</span>
              </div>
              <span className="font-semibold text-white">{turnover.turnoverLimit.toLocaleString()}</span>
            </div>

            {/* Completed Turnover */}
            <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FaChartLine className="text-lg text-green-400" />
                </div>
                <span className="text-gray-300">Completed Turnover</span>
              </div>
              <span className="font-semibold text-white">{turnover.currentTurnover.toLocaleString()}</span>
            </div>
            
            {/* Status */}
            <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <span className="text-gray-300">Status</span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                turnover.status === 'active' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {turnover.status.charAt(0).toUpperCase() + turnover.status.slice(1)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
              <div className="flex justify-between mb-3">
                <span className="text-gray-300">Progress</span>
                <span className="text-purple-400 font-medium">{calculateTurnoverPercentage().toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${calculateTurnoverPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TurnOver; 