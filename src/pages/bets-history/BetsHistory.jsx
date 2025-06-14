import Loading from "@/components/shared/Loading";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaCoins, FaGamepad, FaMoneyBillWave, FaTrophy } from "react-icons/fa";
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

  return (
    <div className="min-h-screen bg-[#1f2937]">
      <div className="mx-auto px-4 py-8 mt-12">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by game round or serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-[#111827] border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loading />
            </div>
          ) : bets.length > 0 ? (
            bets.map((bet) => (
              <div
                key={bet._id}
                className="bg-[#111827] rounded-xl shadow-md border border-gray-700 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                  {/* Game Details */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-900 text-blue-300 text-xs font-semibold">
                      <FaGamepad className="inline" /> {bet.data.game_uid}
                    </span>
                  </div>

                  {/* Bet Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <FaMoneyBillWave className="text-gray-400" />
                      <span className="font-medium">Bet:</span> {formatCurrency(bet.data.bet_amount)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaTrophy className="text-gray-400" />
                      <span className="font-medium">Win:</span>
                      <span className={getWinLossColor(bet.data.win_amount, bet.data.bet_amount)}>
                        {formatCurrency(bet.data.win_amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCoins className="text-gray-400" />
                      <span className="font-medium">Currency:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                        {bet.data.currency_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" />
                      <span className="font-medium">Time:</span>
                      {moment(bet.createdAt).format("MMM D, YYYY h:mm A")}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-2 text-xs text-gray-400">
                    <span className="font-medium">Game Round:</span> {bet.data.game_round}
                    <span className="mx-2">•</span>
                    <span className="font-medium">Serial Number:</span> {bet.data.serial_number}
                    <span className="mx-2">•</span>
                    <span className="font-medium">Member Account:</span> {bet.data.member_account}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-[#111827] rounded-xl shadow-md border border-gray-700 p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                  <FaGamepad className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-200 mb-1">No bets found</h3>
                <p className="text-gray-400">Your betting history will appear here</p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && bets.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-1.5 px-4 rounded-md mr-2 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="py-1.5 px-4 text-gray-300">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-1.5 px-4 rounded-md ml-2 disabled:opacity-50"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(1)}
                className="bg-blue-600 text-white font-bold py-1.5 px-4 rounded-md ml-2 hover:bg-blue-700"
              >
                First Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BetsHistory;
