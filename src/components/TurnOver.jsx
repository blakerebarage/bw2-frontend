import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { FaChartLine } from "react-icons/fa";
import useAxiosSecure from "../Hook/useAxiosSecure";

const TurnOver = () => {
  const { t } = useLanguage();
  const [turnover, setTurnover] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchTurnoverData = async () => {
      try {
        setLoading(true);
        const turnoverResponse = await axiosSecure.get("/api/v1/finance/user-turnovers?page=1&limit=10");
        if (turnoverResponse.data.success) {
          setTurnover(turnoverResponse.data.data.results[0]);
        }
      } catch (error) {
        console.error("Failed to fetch turnover data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTurnoverData();
  }, [axiosSecure]);

  const calculateTurnoverPercentage = () => {
    if (!turnover) return 0;
    return (turnover.currentTurnover / turnover.turnoverLimit) * 100;
  };

  if (loading) {
    return (
      <div className="mt-16">
        <div className="mb-6 px-6">
          <h1 className="text-3xl font-bold text-[#facc15] mb-2">{t('turnoverAnalytics')}</h1>
          <p className="text-gray-300">{t('trackTurnoverProgress')}</p>
        </div>
        <div className="bg-[#1a1f24] rounded-2xl shadow-xl overflow-hidden border border-[#facc15]/20">
          <div className="p-8">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-[#facc15]">{t('loading')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!turnover) {
    return (
      <div className="mt-16">
        <div className="mb-6 px-6">
          <h1 className="text-3xl font-bold text-[#facc15] mb-2">{t('turnoverAnalytics')}</h1>
          <p className="text-gray-300">{t('trackTurnoverProgress')}</p>
        </div>
        <div className="bg-[#1a1f24] rounded-2xl shadow-xl overflow-hidden border border-[#facc15]/20">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#facc15]/10 flex items-center justify-center mb-4">
                <FaChartLine className="text-3xl text-[#facc15]" />
              </div>
              <h3 className="text-xl font-semibold text-[#facc15] mb-2">No Turnover Data Available</h3>
              <p className="text-gray-300">Your turnover information will appear here once available.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <div className="mb-6 px-6">
        <h1 className="text-3xl font-bold text-[#facc15] mb-2">{t('turnoverAnalytics')}</h1>
        <p className="text-gray-300">{t('trackTurnoverProgress')}</p>
      </div>

      <div className="bg-[#1a1f24] rounded-2xl shadow-xl overflow-hidden border border-[#facc15]/20">
        <div className="p-6">
          <div className="space-y-6">
            {/* Turnover Limit */}
            <div className="flex justify-between items-center p-4 bg-[#1a1f24] rounded-xl border border-[#facc15]/20 hover:border-[#facc15]/40 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#facc15]/10 flex items-center justify-center">
                  <FaChartLine className="text-lg text-[#facc15]" />
                </div>
                <span className="text-gray-300">{t('turnoverLimit')}</span>
              </div>
              <span className="font-semibold text-[#facc15]">{turnover.turnoverLimit.toLocaleString()}</span>
            </div>

            {/* Completed Turnover */}
            <div className="flex justify-between items-center p-4 bg-[#1a1f24] rounded-xl border border-[#facc15]/20 hover:border-[#facc15]/40 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#facc15]/10 flex items-center justify-center">
                  <FaChartLine className="text-lg text-[#facc15]" />
                </div>
                <span className="text-gray-300">{t('completedTurnover')}</span>
              </div>
              <span className="font-semibold text-[#facc15]">{turnover.currentTurnover.toLocaleString()}</span>
            </div>
            
            {/* Status */}
            <div className="flex justify-between items-center p-4 bg-[#1a1f24] rounded-xl border border-[#facc15]/20 hover:border-[#facc15]/40 transition-all duration-300">
              <span className="text-gray-300">{t('status')}</span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                turnover.status === 'active' 
                  ? 'bg-[#facc15]/10 text-[#facc15] border border-[#facc15]/20' 
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              }`}>
                {turnover.status === 'active' ? t('active') : turnover.status.charAt(0).toUpperCase() + turnover.status.slice(1)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="p-4 bg-[#1a1f24] rounded-xl border border-[#facc15]/20 hover:border-[#facc15]/40 transition-all duration-300">
              <div className="flex justify-between mb-3">
                <span className="text-gray-300">{t('progress')}</span>
                <span className="text-[#facc15] font-medium">{calculateTurnoverPercentage().toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#1a1f24] rounded-full h-3 border border-[#facc15]/20">
                <div 
                  className="bg-[#facc15] h-3 rounded-full transition-all duration-500 ease-out"
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