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
        return 'bg-emerald-100 text-emerald-600 border border-emerald-200';
      case 'lost':
        return 'bg-rose-100 text-rose-600 border border-rose-200';
      case 'pending':
        return 'bg-amber-100 text-amber-600 border border-amber-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="min-h-[60vh] mt-12 py-12 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Bets History</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            Track your betting activity and results
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 text-indigo-600">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading bets history...</span>
          </div>
        ) : bets.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-xl border border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <FaHistory className="text-indigo-600 text-2xl" />
            </div>
            <p className="text-lg font-medium text-slate-800 mb-2">No bets history available</p>
            <p className="text-slate-600">Start placing bets to see your history</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-indigo-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Game</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Bet Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Result</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map((bet, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-indigo-50 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(bet.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {bet.game}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-indigo-600">
                        {formatCurrency(bet.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {bet.result === 'won' ? (
                          <span className="flex items-center gap-1 text-emerald-600">
                            <FaTrophy className="text-sm" />
                            Won
                          </span>
                        ) : bet.result === 'lost' ? (
                          <span className="flex items-center gap-1 text-rose-600">
                            <FaTimes className="text-sm" />
                            Lost
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600">
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