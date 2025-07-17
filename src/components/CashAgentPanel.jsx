import { useCurrency } from "@/Hook/useCurrency";
import { useGetUserTransactionsQuery, useSendBalanceMutation } from "@/redux/features/allApis/usersApi/usersApi";
import { logout } from "@/redux/slices/authSlice";
import { useState } from "react";
import { FaArrowRight, FaHistory, FaMoneyBillWave, FaPaperPlane, FaUserCheck, FaWallet } from "react-icons/fa";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import LanguageSwitcher from "./LanguageSwitcher/LanguageSwitcher";

const CashAgentPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const { formatCurrency } = useCurrency();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [receiverUsername, setReceiverUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Use RTK Query mutations and queries
  const [sendBalance, { isLoading: sendingBalance }] = useSendBalanceMutation();
  const { data: transactionsData, refetch: refetchTransactions } = useGetUserTransactionsQuery(
    { username: user?.username, page: 1, limit: 5 },
    { skip: !user?.username }
  );

  const recentTransactions = transactionsData?.data?.results || [];

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    addToast("Logout successful", {
      appearance: "success",
      autoDismiss: true,
    });
    navigate("/");
  };

  const handleSendBalance = async (e) => {
    e.preventDefault();
    if (!receiverUsername || !amount) {
      addToast("Please enter both username and amount", { appearance: "error", autoDismiss: true });
      return;
    }

    try {
      const result = await sendBalance({
        receiverUsername,
        amount: Number(amount),
      }).unwrap();

      if (result.success) {
        addToast("Balance sent successfully!", { appearance: "success", autoDismiss: true });
        setReceiverUsername("");
        setAmount("");
        // Refetch transactions to show updated data
        refetchTransactions();
      } else {
        addToast(result.message || "Failed to send balance", { appearance: "error", autoDismiss: true });
      }
    } catch (err) {
      addToast(err.message || "Error sending balance", { appearance: "error", autoDismiss: true });
    }
  };

  // Only render for cash-agent and sub-cash-agent roles
  if (!user || !["cash-agent", "sub-cash-agent"].includes(user.role)) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <FaUserCheck className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white capitalize">
                  {user.role.replace("-", " ")} Panel
                </h1>
                <p className="text-gray-300">Welcome back, {user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher variant="navbar" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
                title="Logout"
              >
                <RiLogoutCircleLine className="text-lg" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <FaWallet className="text-3xl opacity-80" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Available Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(user.balance || 0)}</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 mt-4">
                <p className="text-sm opacity-90">Account Status</p>
                <p className="font-semibold">Active</p>
              </div>
            </div>
          </div>

          {/* Send Balance Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <FaPaperPlane className="text-yellow-400 text-xl" />
                <h2 className="text-xl font-bold text-white">Send Balance</h2>
              </div>
              
              <form onSubmit={handleSendBalance} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Receiver Username
                  </label>
                  <div className="relative">
                    <FaUserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter username"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      value={receiverUsername}
                      onChange={e => setReceiverUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  disabled={sendingBalance}
                >
                  {sendingBalance ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send Balance
                      <FaArrowRight />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaHistory className="text-yellow-400 text-xl" />
                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                {showHistory ? 'Hide' : 'Show All'}
              </button>
            </div>

            {showHistory && (
              <div className="space-y-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            <FaMoneyBillWave />
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">{transaction.type}</p>
                            <p className="text-gray-400 text-sm">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-gray-400 text-sm capitalize">{transaction.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FaHistory className="text-gray-500 text-4xl mx-auto mb-4" />
                    <p className="text-gray-400">No recent transactions</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashAgentPanel; 