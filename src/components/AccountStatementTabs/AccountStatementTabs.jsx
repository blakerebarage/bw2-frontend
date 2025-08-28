import { useGetUsersQuery, useGetUserTransactionsQuery } from "@/redux/features/allApis/usersApi/usersApi";
import { useUser } from "@/UserContext/UserContext";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AccountTabs from "../AccountTabs/AccountTabs";
import CommonNavMenu from "../CommonNavMenu/CommonNavMenu";

const AccountStatementTabs = () => {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedUser, setSelectedUser } = useUser();
  const { user } = useSelector((state) => state.auth);
  const queryParams = {
    page: currentPage,
    limit: 50,
    ...( user?.referralCode && { referredBy: user.referralCode })
  };
  const { data: users = [] } = useGetUsersQuery(queryParams);
  
  useEffect(() => {
    const foundUser = users?.data?.users.find((user) => user._id === id);
    if (foundUser) {
      setSelectedUser(foundUser);
    }
  }, [id, users, setSelectedUser]);

  const { data: transactionsData, isLoading } = useGetUserTransactionsQuery({
    username: selectedUser?.username,
    page: currentPage,
    limit: 50,
  });
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen">
      <CommonNavMenu></CommonNavMenu>
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row px-4 py-6 gap-6">
          <AccountTabs
          id={id}
          ></AccountTabs>
          <div className="flex-1 space-y-6 border border-gray-200 rounded-lg p-4 drop-shadow-lg">
            
              <h3 className="text-2xl font-bold text-gray-900 mb-2">User Account Statement</h3>
              
              {/* Table Container with improved overflow handling */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[120px]">
                          Date/Time
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[100px]">
                          Type
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[120px]">
                          Transaction ID
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[80px]">
                          Amount
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[100px]">
                          Balance Before
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[100px]">
                          Balance After
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[150px]">
                          Description
                        </th>
                        <th scope="col" className="px-3 py-3 text-left text-xs font-semibold text-gray-800 uppercase tracking-wider min-w-[100px]">
                          Counterparty
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan="8" className="px-3 py-8 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : transactionsData?.data?.results?.length > 0 ? (
                        transactionsData.data.results.map((transaction) => (
                          <tr key={transaction._id} className="hover:bg-gray-50">
                            <td className="px-3 py-3 text-sm text-gray-700">
                              <div className="min-w-[120px]">
                                {moment(transaction.createdAt).format("Do MMM YYYY, h:mm a")}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <div className="min-w-[100px]">
                                <span className={`${
                                  transaction.type === 'deposit' ? 'text-green-600' : 
                                  transaction.type === 'withdraw' ? 'text-red-600' : 
                                  'text-blue-600'
                                }`}>
                                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <div className="min-w-[120px] break-all">
                                {transaction.txnRef}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <div className="min-w-[80px]">
                                <span className={`${
                                  transaction.type === 'deposit' ? 'text-green-600' : 
                                  transaction.type === 'withdraw' ? 'text-red-600' : 
                                  'text-blue-600'
                                }`}>
                                  {transaction.amount.toFixed(2)}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <div className="min-w-[100px]">
                                {transaction.balanceBefore.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm">
                              <div className="min-w-[100px]">
                                {transaction.balanceAfter.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-700">
                              <div className="min-w-[150px] max-w-[200px] break-words">
                                {transaction.description}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-sm text-blue-600">
                              <div className="min-w-[100px] break-all">
                                {transaction.counterparty}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="px-3 py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {transactionsData?.data?.pageCount > 1 && (
                <div className="flex items-center justify-center space-x-3 mt-4">
                  <button 
                    className="bg-gray-200 shadow-xl border border-gray-400 rounded-sm text-gray-500 font-sans font-semibold px-3 hover:bg-gray-300 transition-colors"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <button className="bg-yellow-400 px-3 font-sans font-semibold border rounded-sm border-yellow-500 shadow-2xl">
                    {currentPage}
                  </button>
                  <button 
                    className="bg-gray-200 shadow-xl border border-gray-400 rounded-sm text-gray-500 font-sans font-semibold px-3 hover:bg-gray-300 transition-colors"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === transactionsData.data.pageCount}
                  >
                    Next
                  </button>
                  <button 
                    className="bg-yellow-400 px-3 font-sans font-semibold border rounded-sm border-yellow-500 shadow-2xl hover:bg-yellow-500 transition-colors"
                    onClick={() => handlePageChange(1)}
                  >
                    Go
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
     
    </div>
  );
};

export default AccountStatementTabs;
