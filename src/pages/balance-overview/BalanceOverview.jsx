import { useCurrency } from "@/Hook/useCurrency";
import { Activity, ArrowRight, Clock, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaWallet } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import useAxiosSecure from "../../Hook/useAxiosSecure";

const BalanceOverview = () => {
  const { formatCurrency } = useCurrency();

  const { user } = useSelector((state) => state.auth);
  const [transactions, setTransactions] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRecentTransactions, setShowRecentTransactions] = useState(false);
  const [stats, setStats] = useState({
    totalDeposit: 0,
    totalWithdraw: 0,
    lastTransaction: null
  });
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch transactions using the same API as TransactionHistory
        const transactionsResponse = await axiosSecure.get(`/api/v1/finance/all-transactions/${user.username}?page=1&limit=20`);
        
        if (transactionsResponse.data.success) {
          const data = Array.isArray(transactionsResponse?.data?.data?.results) ? transactionsResponse?.data?.data?.results : [];
          setTransactions(data);
          
          // Get recent 5 transactions for the recent transactions section
          const recent = data.slice(0, 5);
          setRecentTransactions(recent);

          // Calculate totals for last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const totals = data
            .filter((txn) => new Date(txn.createdAt) >= thirtyDaysAgo)
            .reduce((acc, transaction) => {
              if (transaction.type === 'deposit') {
                acc.totalDeposit += Number(transaction.amount) || 0;
              } else if (transaction.type === 'withdraw' || transaction.type === 'transfer') {
                acc.totalWithdraw += Number(transaction.amount) || 0;
              }
              return acc;
            }, { totalDeposit: 0, totalWithdraw: 0 });

          const lastTransaction = data.length > 0 ? data[0] : null;

          setStats({
            totalDeposit: totals.totalDeposit,
            totalWithdraw: totals.totalWithdraw,
            lastTransaction
          });
        }
      } catch (error) {
        setStats({
          totalDeposit: 0,
          totalWithdraw: 0,
          lastTransaction: null
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.username) {
      fetchData();
    }
  }, [axiosSecure, user?.username]);

  const netBalance = stats.totalDeposit - stats.totalWithdraw;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "rejected":
      case "cancelled":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "completed":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      default:
        return "bg-[#facc15]/20 text-[#facc15] border border-[#facc15]/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f24] to-[#0f1419] mt-20">
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* Main Balance Card */}
        <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#facc15] flex items-center justify-center">
              <FaWallet className="text-2xl text-[#1a1f24]" />
            </div>
            <h1 className="text-lg font-medium text-gray-300 mb-2">Your Balance</h1>
            <p className="text-4xl font-bold text-[#facc15] mb-2">
              {formatCurrency(user?.balance) || '0.00'}
            </p>
            <div className="flex items-center justify-center gap-2 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Active Account</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <FaArrowUp className="text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Deposits (30d)</p>
                <p className="text-lg font-semibold text-white truncate">
                  {formatCurrency(stats.totalDeposit)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                <FaArrowDown className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Withdrawals (30d)</p>
                <p className="text-lg font-semibold text-white truncate">
                  {formatCurrency(stats.totalWithdraw)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Net Balance (30d)</p>
              <p className={`text-lg font-semibold truncate ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(netBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Transactions Toggle */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowRecentTransactions(!showRecentTransactions)}
            className="flex items-center gap-2 px-4 py-3 bg-[#facc15] text-[#1a1f24] rounded-lg hover:bg-[#e6b800] transition-colors font-medium text-sm w-full justify-center"
          >
            <Clock className="w-4 h-4" />
            {showRecentTransactions ? "Hide Recent Transactions" : "Show Recent Transactions"}
          </button>
        </div>

        {/* Recent Transactions */}
        {showRecentTransactions && (
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#facc15]/20 bg-[#22282e]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#facc15] flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Transactions
                </h3>
                <Link 
                  to="/transaction-history" 
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#facc15] transition-colors"
                >
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Transactions List */}
            <div className="divide-y divide-[#facc15]/10">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#facc15]"></div>
                  <p className="text-gray-400 mt-2 text-sm">Loading...</p>
                </div>
              ) : recentTransactions.length > 0 ? (
                recentTransactions.map((txn) => (
                  <div key={txn._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          txn.type === "deposit" 
                            ? "bg-green-500/20 text-green-400" 
                            : "bg-red-500/20 text-red-400"
                        }`}>
                          {txn.type === "deposit" ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">
                            {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {moment(txn.createdAt).format("MMM D, h:mm A")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          txn.type === "deposit" ? "text-green-400" : "text-red-400"
                        }`}>
                          {txn.type === "deposit" ? "+" : "-"}{formatCurrency(txn.amount)}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(txn.status)}`}>
                          {txn.status?.toUpperCase() || "PENDING"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-400">No recent transactions</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transaction Overview - Only for Admin/Super Admin */}
        {(user?.role === "super-admin" || user?.role === "admin") && (
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[#facc15]/20 bg-[#22282e]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#facc15] flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Transaction Overview
                </h3>
                <span className="text-xs text-gray-400">
                  {stats.lastTransaction ? new Date(stats.lastTransaction.createdAt).toLocaleDateString() : 'No data'}
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-400">Total Deposits</p>
                  <p className="text-sm font-semibold text-green-400 truncate">
                    {formatCurrency(stats.totalDeposit)}
                  </p>
                </div>

                <div>
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-400">Total Withdrawals</p>
                  <p className="text-sm font-semibold text-red-400 truncate">
                    {formatCurrency(stats.totalWithdraw)}
                  </p>
                </div>

                <div>
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-[#facc15] flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-[#1a1f24]" />
                  </div>
                  <p className="text-xs font-medium text-gray-400">Current Balance</p>
                  <p className="text-sm font-semibold text-[#facc15] truncate">
                    {formatCurrency(user?.balance) || '0.00'}
                  </p>
                </div>
              </div>

              {/* Last Transaction */}
              {stats.lastTransaction ? (
                <div className="border-t border-[#facc15]/20 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Recent Transaction</p>
                      <p className="text-sm font-medium text-white truncate">
                        {stats.lastTransaction.type.charAt(0).toUpperCase() + stats.lastTransaction.type.slice(1)} - {formatCurrency(stats.lastTransaction.amount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        stats.lastTransaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {stats.lastTransaction.type === 'deposit' ? '+' : '-'}
                        {formatCurrency(stats.lastTransaction.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-t border-[#facc15]/20 pt-4">
                  <div className="text-center py-2">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                    <p className="text-xs text-gray-400">No recent transactions</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceOverview;
