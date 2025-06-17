import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useEffect, useState } from 'react';
import { FaHistory, FaSpinner, FaTimes, FaTrophy } from "react-icons/fa";

const BetsHistory = () => {
  const axiosSecure = useAxiosSecure();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosSecure.get('/api/v1/bets/history');
        if (res.data.success) {
          setBets(res.data.data);
        }
      } catch (err) {
        setBets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axiosSecure]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'won':
        return 'bg-[#facc15]/10 text-[#facc15] border border-[#facc15]/20';
      case 'lost':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      default:
        return 'bg-[#facc15]/10 text-[#facc15] border border-[#facc15]/20';
    }
  };

  return (
    <div className="min-h-[60vh] mt-12 py-12 px-4 bg-[#1a1f24]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-[#facc15]">Bets History</h2>
          <p className="text-gray-300 max-w-xl mx-auto">
            Track your betting activity and results
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 text-[#facc15]">
            <div className="w-5 h-5 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading bets history...</span>
          </div>
        ) : bets.length === 0 ? (
          <div className="text-center bg-[#1a1f24] p-8 rounded-xl border border-[#facc15]/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#facc15]/10 flex items-center justify-center">
              <FaHistory className="text-[#facc15] text-2xl" />
            </div>
            <p className="text-lg font-medium text-gray-300 mb-2">No bets history available</p>
            <p className="text-gray-400">Start placing bets to see your history</p>
          </div>
        ) : (
          <div className="bg-[#1a1f24] rounded-xl shadow-lg p-6 border border-[#facc15]/20 hover:shadow-xl transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#facc15]/20">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#facc15] uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#facc15] uppercase tracking-wider">Game</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#facc15] uppercase tracking-wider">Bet Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#facc15] uppercase tracking-wider">Result</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#facc15] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map((bet, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-[#facc15]/20 hover:bg-[#facc15]/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {new Date(bet.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {bet.game}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-[#facc15]">
                        {formatCurrency(bet.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {bet.result === 'won' ? (
                          <span className="flex items-center gap-1 text-[#facc15]">
                            <FaTrophy className="text-sm" />
                            Won
                          </span>
                        ) : bet.result === 'lost' ? (
                          <span className="flex items-center gap-1 text-red-500">
                            <FaTimes className="text-sm" />
                            Lost
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-500">
                            <FaSpinner className="text-sm animate-spin" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bet.status)}`}>
                          {bet.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BetsHistory; 