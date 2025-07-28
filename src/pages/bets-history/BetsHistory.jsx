import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaGamepad, FaMoneyBillWave, FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";

const BetsHistory = () => {
  const [loading, setLoading] = useState(true);
  const [bets, setBets] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 50;
  const axiosSecure = useAxiosSecure();
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();

  useEffect(() => {
    if (user?.username) {
      fetchBets();
    } 
  }, [currentPage, search, user?.username]);

  const fetchBets = async () => {
    try {
      setLoading(true);
      const response = await axiosSecure.get(
        `/api/v1/game/bet-history/${user?.username}?page=${currentPage}&limit=${limit}&search=${search}`
      );
      if (response.data.success) {
        setBets(response.data.data.results);
        setTotalPages(response.data.data.pageCount);
      }
    } catch (error) {
      console.error('Error fetching bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWinLossColor = (winAmount, betAmount) => {
    const win = parseFloat(winAmount);
    const bet = parseFloat(betAmount);
    if (win > bet) return "text-green-400";
    if (win < bet) return "text-red-400";
    return "text-gray-400";
  };

  const getWinLossIcon = (winAmount, betAmount) => {
    const win = parseFloat(winAmount);
    const bet = parseFloat(betAmount);
    if (win > bet) return <TrendingUp className="w-4 h-4" />;
    if (win < bet) return <TrendingDown className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f24] to-[#0f1419] mt-20">
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#facc15] flex items-center justify-center">
              <FaGamepad className="text-2xl text-[#1a1f24]" />
            </div>
            <h1 className="text-lg font-medium text-gray-300 mb-2">{t('betsHistory')}</h1>
            <p className="text-sm text-gray-400">{t('trackBettingActivity')}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('searchByGameName')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#22282e] border border-[#facc15]/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 focus:border-[#facc15]/50"
            />
          </div>
        </div>

        {/* Bets List */}
        {loading ? (
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#facc15]"></div>
              <p className="text-gray-400 mt-2">{t('loadingBets')}</p>
            </div>
          </div>
        ) : bets.length > 0 ? (
          <div className="space-y-3">
            {bets.map((bet) => (
              <div
                key={bet._id}
                className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4"
              >
                {/* Game Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#facc15]/20 flex items-center justify-center">
                      <FaGamepad className="w-4 h-4 text-[#facc15]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {bet?.gameName || bet.data.game_uid}
                      </p>
                      <p className="text-xs text-gray-400">
                        {moment(bet?.createdAt).format("MMM D, h:mm A")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t('round')}</p>
                    <p className="text-sm font-medium text-gray-300">
                      {bet.data.game_round}
                    </p>
                  </div>
                </div>

                {/* Bet Details */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                      <FaMoneyBillWave className="w-3 h-3 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400">{t('betAmount')}</p>
                      <p className="text-sm font-semibold text-white truncate">
                        {formatCurrency(bet.data.bet_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${
                      parseFloat(bet.data.win_amount) > parseFloat(bet.data.bet_amount)
                        ? "bg-green-500/20"
                        : parseFloat(bet.data.win_amount) < parseFloat(bet.data.bet_amount)
                        ? "bg-red-500/20"
                        : "bg-gray-500/20"
                    }`}>
                      <div className={getWinLossColor(bet.data.win_amount, bet.data.bet_amount)}>
                        {getWinLossIcon(bet.data.win_amount, bet.data.bet_amount)}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400">{t('winAmount')}</p>
                      <p className={`text-sm font-semibold truncate ${getWinLossColor(bet.data.win_amount, bet.data.bet_amount)}`}>
                        {formatCurrency(bet.data.win_amount)}
                      </p>
                    </div>
                  </div>
                </div>

               
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                <FaGamepad className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">{t('noBetsFound')}</h3>
              <p className="text-gray-400">{t('betsHistoryWillAppear')}</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && bets.length > 0 && totalPages > 1 && (
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#22282e] text-gray-300 rounded-lg border border-[#facc15]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a3138] transition-colors text-sm"
              >
                {t('previous')}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {t('pageOf')} {currentPage} {t('of')} {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#22282e] text-gray-300 rounded-lg border border-[#facc15]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a3138] transition-colors text-sm"
              >
                {t('next')}
              </button>
            </div>
            
            {totalPages > 2 && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => setCurrentPage(1)}
                  className="px-4 py-2 bg-[#facc15] text-[#1a1f24] rounded-lg hover:bg-[#e6b800] transition-colors font-medium text-sm"
                >
                  {t('firstPage')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BetsHistory;

