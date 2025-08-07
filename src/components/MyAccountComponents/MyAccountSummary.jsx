import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaWallet } from "react-icons/fa";
import { useSelector } from "react-redux";
import TransactionSummaryCards from '../TransactionSummaryCards/TransactionSummaryCards';

const MyAccountSummary = () => {
  const { user } = useSelector((state) => state.auth);
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!user?.username) return;
      
      try {
        setLoading(true);
        // Use the same API as BalanceOverview
        const transactionsResponse = await axiosSecure.get(`/api/v1/finance/all-transactions/${user.username}?page=1&limit=20`);
        
        if (transactionsResponse.data.success) {
          const data = Array.isArray(transactionsResponse?.data?.data?.results) ? transactionsResponse?.data?.data?.results : [];
          const recentTransactions = data.slice(0, 10); // Get last 3 transactions
          setRecentTransactions(recentTransactions);
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setRecentTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [axiosSecure, user?.username]);

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-b from-[#fefefe] to-[#f3f3f3]">
        <div className="w-full min-h-screen flex justify-center items-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-b from-[#fefefe] to-[#f3f3f3]">
      <div>
        <div className="w-full min-h-screen flex flex-col space-y-6">
          <div className="font-sans space-y-4 md:space-y-6 lg:space-y-6">
            <h3 className="text-lg font-bold sm:text-xl text-gray-800">
              Account Summary
            </h3>
            
            {/* Main Balance Card */}
            <div className="bg-white shadow-lg rounded-lg p-6 ">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaWallet className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="text-gray-600 font-bold text-sm sm:text-lg">
                    Current Balance
                  </p>
                  <div className="flex items-center gap-2">
                  
                    <span className="text-gray-700 text-xl font-bold sm:text-3xl">
                      {formatCurrency(user?.balance) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Summary Cards */}
            <TransactionSummaryCards />

            {/* Recent Transactions */}
            {recentTransactions.length > 0 && (
              <div className="bg-white shadow-lg rounded-lg ">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-800">Recent Transactions</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentTransactions.map((txn) => (
                    <div key={txn._id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            txn.type === "deposit" 
                              ? "bg-green-100 text-green-600" 
                              : "bg-red-100 text-red-600"
                          }`}>
                            {txn.type === "deposit" ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {txn.type.charAt(0).toUpperCase() + txn.type.slice(1)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(txn.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${
                            txn.type === "deposit" ? "text-green-600" : "text-red-600"
                          }`}>
                            {txn.type === "deposit" ? "+" : "-"}{formatCurrency(txn.amount)}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            txn.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                            txn.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {txn.status?.toUpperCase() || "PENDING"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountSummary;
