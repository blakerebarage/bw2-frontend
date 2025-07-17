import Loading from "@/components/shared/Loading";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useUser } from "@/UserContext/UserContext";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { FaCalendarAlt, FaCoins, FaGamepad, FaMoneyBillWave, FaTrophy } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AccountTabs from "../AccountTabs/AccountTabs";
import CommonNavMenu from "../CommonNavMenu/CommonNavMenu";

const UserBetList = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [bets, setBets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedUser, setSelectedUser } = useUser();
  const { user } = useSelector((state) => state.auth);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const axiosSecure = useAxiosSecure();
  const { formatCurrency } = useCurrency();

  // Fetch single user by ID
  const fetchSingleUser = useCallback(async (userId) => {
    if (!userId) return;
    
    setSelectedUserLoading(true);
    
    try {
      const response = await axiosSecure.get(`/api/v1/user/single/${userId}`);
      if (response.data?.success && response.data?.data) {
        setSelectedUser(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setSelectedUserLoading(false);
    }
  }, [axiosSecure, setSelectedUser]);

  // Fetch selected user when ID changes
  useEffect(() => {
    if (id) {
      fetchSingleUser(id);
    }
  }, [id, fetchSingleUser]);

  useEffect(() => {
    if (selectedUser?.username) {
      fetchUserBets();
    }
  }, [currentPage, search, selectedUser?.username]);

  const fetchUserBets = async () => {
    if (!selectedUser?.username) return;
    
    try {
      setLoading(true);
      const response = await axiosSecure.get(
        `/api/v1/game/bet-history/${selectedUser.username}?page=${currentPage}&limit=${limit}&search=${search}`
      );
      
      if (response.data.success) {
        setBets(response.data.data.results);
        setTotalPages(response.data.data.pageCount);
      }
    } catch (error) {
      console.error('Error fetching user bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWinLossColor = (winAmount, betAmount) => {
    const win = parseFloat(winAmount);
    const bet = parseFloat(betAmount);
    if (win > bet) return "text-green-600";
    if (win < bet) return "text-red-600";
    return "text-gray-600";
  };

  if (selectedUserLoading) {
    return (
      <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen">
        <CommonNavMenu />
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    
    <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen">
      <CommonNavMenu></CommonNavMenu>
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row px-4 py-6 gap-6">
          <AccountTabs
          id={id}
          ></AccountTabs>
          <div className="flex-1 border border-gray-200 rounded-lg p-4 drop-shadow-lg mt-6">
            
    <h3 className="text-2xl font-bold text-gray-900 mb-2">User Bet list</h3>
     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
      <div className="mx-auto">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden  p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by game round or serial number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Bets List */}
        <div className="space-y-4 bg-white rounded-xl shadow-lg overflow-hidden mb-8 p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loading />
            </div>
          ) : bets.length > 0 ? (
            bets.map((bet) => (
              <div
                key={bet._id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex-1">
                  {/* Game Details */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
                      <FaGamepad className="inline" /> {bet?.gameName || bet.data.game_uid}
                    </span>
                  </div>

                  {/* Bet Details */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <FaMoneyBillWave className="text-gray-500" />
                      <span className="font-medium">Bet:</span> {formatCurrency(bet.data.bet_amount)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaTrophy className="text-gray-500" />
                      <span className="font-medium">Win:</span>
                      <span className={getWinLossColor(bet.data.win_amount, bet.data.bet_amount)}>
                        {formatCurrency(bet.data.win_amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCoins className="text-gray-500" />
                      <span className="font-medium">Currency:</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {bet.data.currency_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-500" />
                      <span className="font-medium">Time:</span>
                      {moment(bet.createdAt).format("MMM D, YYYY h:mm A")}
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-2 text-xs text-gray-500">
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
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <FaGamepad className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-1">No bets found</h3>
                <p className="text-gray-600">No betting history available for this user</p>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && bets.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-1.5 px-4 rounded-md mr-2 disabled:opacity-50 border border-gray-300"
              >
                Previous
              </button>
              <span className="py-1.5 px-4 text-gray-700">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-1.5 px-4 rounded-md ml-2 disabled:opacity-50 border border-gray-300"
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
    </div>
    </div>
    </div>
    </div>
   
  );
};

export default UserBetList;