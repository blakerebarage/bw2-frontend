import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useUser } from "@/UserContext/UserContext";
import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaWallet } from "react-icons/fa";
import { useParams } from "react-router-dom";
import AccountTabs from "../AccountTabs/AccountTabs";
import CommonNavMenu from "../CommonNavMenu/CommonNavMenu";

const AccountSummary = () => {
  const { selectedUser, setSelectedUser } = useUser();
  const { id } = useParams();
  const { data: users = [] } = useGetUsersQuery();
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeposit: 0,
    totalWithdraw: 0,
    netBalance: 0,
    recentTransactions: []
  });

  useEffect(() => {
    const foundUser = users?.data?.users.find((user) => user._id === id);
    if (foundUser) {
      setSelectedUser(foundUser);
    }
  }, [id, users, setSelectedUser]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      if (!selectedUser?.username) return;
      
      try {
        setLoading(true);
        // Use the same API as BalanceOverview
        const transactionsResponse = await axiosSecure.get(`/api/v1/finance/all-transactions/${selectedUser.username}?page=1&limit=20`);
        
        if (transactionsResponse.data.success) {
          const data = Array.isArray(transactionsResponse?.data?.data?.results) ? transactionsResponse?.data?.data?.results : [];
          setTransactions(data);
          
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
          const recentTransactions = data.slice(0, 3); // Get last 3 transactions

          setStats({
            totalDeposit: totals.totalDeposit,
            totalWithdraw: totals.totalWithdraw,
            netBalance,
            recentTransactions
          });
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setStats({
          totalDeposit: 0,
          totalWithdraw: 0,
          netBalance: 0,
          recentTransactions: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactionData();
  }, [axiosSecure, selectedUser?.username]);

  return (
    <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen">
      <CommonNavMenu />
      <div>
        <div className="flex flex-col md:flex-row px-4 py-6 gap-6 ">
          <AccountTabs id={id} />
          <div className="font-sans space-y-4 md:space-y-6 lg:space-y-6 mt-6 flex-1 border border-gray-200 rounded-lg p-4 drop-shadow-lg">
            <h3 className="text-lg font-bold sm:text-xl text-gray-800">
              Account Summary - {selectedUser?.username || 'Loading...'}
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : (
              <>
                {/* Main Balance Card */}
                <div className="bg-white shadow-lg rounded-lg p-6 ">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaWallet className="text-blue-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-700 font-bold text-sm sm:text-lg">
                        User Balance
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-lg font-semibold text-gray-600">
                          {selectedUser?.currency || 'USD'}
                        </span>
                        <span className="text-gray-700 text-xl font-bold sm:text-3xl">
                          {selectedUser?.balance ? formatCurrency(selectedUser.balance) : '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
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

                {/* Recent Transactions */}
                {stats.recentTransactions.length > 0 && (
                  <div className="bg-white shadow-lg rounded-lg ">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-800">Recent Transactions</h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {stats.recentTransactions.map((txn) => (
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
