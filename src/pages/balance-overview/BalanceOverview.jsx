import { useCurrency } from "@/Hook/useCurrency";
import { useEffect, useState } from "react";
import { FaExchangeAlt, FaWallet } from "react-icons/fa";
import { useSelector } from "react-redux";

import useAxiosSecure from "../../Hook/useAxiosSecure";

const BalanceOverview = () => {
  const { formatCurrency } = useCurrency();

  const { user } = useSelector((state) => state.auth);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
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
        // Fetch transactions
        const transactionsResponse = await axiosSecure.get("/api/v1/finance/all-transactions/user");
        if (transactionsResponse.data.success) {
          const data = Array.isArray(transactionsResponse?.data?.data?.results) ? transactionsResponse?.data?.data?.results : [];
          setTransactions(data);

          const totals = data.reduce((acc, transaction) => {
            if (transaction.type === 'deposit') {
              acc.totalDeposit += Number(transaction.amount) || 0;
            } else if (transaction.type === 'withdraw') {
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

    fetchData();
  }, [axiosSecure]);

  return (
    <div className="mt-20">
      {/* <PageHeader title="Balance Overview" /> */}
      <div className="m-4 space-y-6">
        {/* Main Balance Card */}
        <div className="bg-gradient-to-r from-[#ffffff] to-[#ffffff] p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Your Balances</h1>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="bg-red-400 backdrop-blur-sm py-2 px-4 rounded-xl">
              <p className="text-sm font-bold text-[#ffffff]">
                <FaWallet className="text-3xl text-[#ffffff]" />
              </p>
            </div>
            <p className="text-4xl font-bold text-gray-800">
              { formatCurrency(user?.balance) || '0.00'}
            </p>
          </div>
        </div>

        

        {/* Transaction History Card */}
        {
          user?.role === "super-admin" || user?.role === "admin" && <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Transaction Details</h2>
              <span className="text-sm text-gray-800">
                {stats.lastTransaction ? new Date(stats.lastTransaction.createdAt).toLocaleString() : 'No transactions'}
              </span>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FaExchangeAlt className="text-xl text-green-600" />
                </div>
                <p className="text-sm text-gray-500">Total Deposit</p>
                <h3 className="text-xl font-semibold text-gray-800">
                  {stats.totalDeposit.toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <FaExchangeAlt className="text-xl text-red-600 transform rotate-180" />
                </div>
                <p className="text-sm text-gray-500">Total Withdraw</p>
                <h3 className="text-xl font-semibold text-red-500">
                  {stats.totalWithdraw.toLocaleString()}
                </h3>
              </div>
            </div>
            <div className="p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaWallet className="text-xl text-blue-600" />
                </div>
                <p className="text-sm text-gray-500">Your Balance</p>
                <h3 className="text-xl font-semibold text-gray-800">
                  {user?.balance?.toLocaleString() || '0.00'}
                </h3>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-100">
            <div className="p-6 space-y-4">
              {/* Last Transaction Remark */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaExchangeAlt className="text-lg text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Transaction</p>
                    <p className="text-gray-700 font-medium">
                      {stats.lastTransaction ? `${stats.lastTransaction.type.charAt(0).toUpperCase() + stats.lastTransaction.type.slice(1)} - ${stats.lastTransaction.amount}` : 'No transactions yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        }
        
      </div>
    </div>
  );
};

export default BalanceOverview;
