import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaWallet } from "react-icons/fa";
import { useSelector } from "react-redux";

const TransactionSummaryCards = ({ username = null }) => {
  const { user } = useSelector((state) => state.auth);
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeposit: 0,
    totalWithdraw: 0,
    netBalance: 0,
  });

  useEffect(() => {
    const fetchTransactionData = async () => {
      const targetUsername = username || user?.username;
      if (!targetUsername) return;
      
      try {
        setLoading(true);
        // Use the same API as BalanceOverview
        const transactionsResponse = await axiosSecure.get(`/api/v1/finance/all-transactions/${targetUsername}?page=1&limit=20`);
        
        if (transactionsResponse.data.success) {
          const data = Array.isArray(transactionsResponse?.data?.data?.results) ? transactionsResponse?.data?.data?.results : [];
         
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

          const netBalance = totals.totalDeposit - totals.totalWithdraw;

          setStats({
            totalDeposit: totals.totalDeposit,
            totalWithdraw: totals.totalWithdraw,
            netBalance,
          });
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setStats({
          totalDeposit: 0,
          totalWithdraw: 0,
          netBalance: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [axiosSecure, user?.username, username]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white shadow-lg rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-5 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Deposits */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FaArrowUp className="text-green-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Deposits (30d)</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency(stats.totalDeposit)}
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawals */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <FaArrowDown className="text-red-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Withdrawals (30d)</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatCurrency(stats.totalWithdraw)}
            </p>
          </div>
        </div>
      </div>

      {/* Net Balance */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FaWallet className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Net Balance (30d)</p>
            <p className={`text-lg font-semibold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummaryCards; 