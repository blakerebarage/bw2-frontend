import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useEffect, useState } from 'react';
import { FaCalendarAlt, FaChartLine, FaHistory } from "react-icons/fa";

const TurnOver = () => {
  const axiosSecure = useAxiosSecure();
  const [turnoverData, setTurnoverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosSecure.get('/api/v1/turnover');
        if (res.data.success) {
          setTurnoverData(res.data.data);
        }
      } catch (err) {
        setTurnoverData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axiosSecure]);

  return (
    <div className="min-h-[60vh] mt-12 py-12 px-4 bg-gradient-to-b from-[#009245]/5 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-[#009245]">Turnover Overview</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Track your betting activity and turnover history
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 text-[#009245]">
            <div className="w-5 h-5 border-2 border-[#009245] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading turnover data...</span>
          </div>
        ) : !turnoverData ? (
          <div className="text-center bg-white p-8 rounded-xl border border-[#009245]/20 shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#009245]/10 flex items-center justify-center">
              <FaChartLine className="text-[#009245] text-2xl" />
            </div>
            <p className="text-lg font-medium text-gray-800 mb-2">No turnover data available</p>
            <p className="text-gray-600">Start placing bets to see your turnover history</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-[#009245]/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-[#009245]/10">
                    <FaChartLine className="text-[#009245] text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Total Turnover</h3>
                    <p className="text-2xl font-bold text-[#009245]">
                      {formatCurrency(turnoverData.totalTurnover)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Lifetime betting activity
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-[#009245]/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-[#009245]/10">
                    <FaCalendarAlt className="text-[#009245] text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Current Month</h3>
                    <p className="text-2xl font-bold text-[#009245]">
                      {formatCurrency(turnoverData.currentMonthTurnover)}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Turnover this month
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#009245]/20">
              <div className="flex items-center gap-3 mb-6">
                <FaHistory className="text-[#009245] text-xl" />
                <h3 className="text-xl font-semibold text-gray-800">Turnover History</h3>
              </div>

              {turnoverData.history && turnoverData.history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {turnoverData.history.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-[#009245]">
                            {formatCurrency(item.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#009245]/10 text-[#009245]">
                              {item.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No turnover history available</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TurnOver; 