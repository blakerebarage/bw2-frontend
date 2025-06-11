import { useGetUserTransactionsQuery } from "@/redux/features/allApis/usersApi/usersApi";
import moment from "moment";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const MyAccountStatementtabs = () => {
  const pathName = useLocation().pathname;
  const [currentPage, setCurrentPage] = useState(1);
  const {user} = useSelector((state) => state.auth);
 
  const { data: transactionsData, isLoading } = useGetUserTransactionsQuery({
    username: user?.username,
    page: currentPage,
    limit: 50,
  });


  // Theme switch
  const isDark = pathName === "/account-statement";

  return (
    <div className={`mx-auto ${isDark ? "pt-16 pb-6 bg-[#1a1f2b]" : "bg-white"}`}>
      <div className="flex-1 min-w-0">
        <div className="space-y-6">
          {isDark ? "" : (
            <h3 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              My Account Statement
            </h3>
          )}
          
          {/* Table Container with theme switch */}
          <div className={
            isDark
              ? "bg-[#1f2937] rounded-xl shadow-lg border border-gray-700"
              : "bg-white rounded-lg shadow-lg border border-gray-200"
          }>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className={`min-w-full divide-y ${isDark ? "divide-gray-700" : "divide-gray-200"}`}>
                  <thead className={isDark ? "bg-[#111827]" : "bg-white"}>
                    <tr>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                        Date/Time
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                        Transaction Type
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                            Transaction ID
                          </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                        Amount
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                        Balance Before
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                        Balance After
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                        Description
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                        Counterparty
                      </th>
                    </tr>
                  </thead>
                  <tbody className={isDark ? "bg-[#1f2937] divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}>
                    {isLoading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex justify-center items-center">
                            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDark ? "border-blue-500" : "border-blue-600"}`}></div>
                            <span className={`ml-3 ${isDark ? "text-gray-300" : "text-gray-700"}`}>Loading transactions...</span>
                          </div>
                        </td>
                      </tr>
                    ) : transactionsData?.data?.results?.length > 0 ? (
                      transactionsData.data.results.map((transaction) => (
                        <tr key={transaction._id} className={isDark ? "hover:bg-[#2d3748] transition-colors duration-200" : "hover:bg-gray-100 transition-colors duration-200"}>
                          <td className={`px-6 py-4 text-sm whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                            {moment(transaction.createdAt).format("Do MMM YYYY, h:mm a")}
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              transaction.type === 'deposit'
                                ? isDark
                                  ? 'bg-green-900 text-green-300'
                                  : 'bg-green-600 text-white'
                                : transaction.type === 'withdraw'
                                ? isDark
                                  ? 'bg-red-900 text-red-300'
                                  : 'bg-red-600 text-white'
                                : isDark
                                  ? 'bg-blue-900 text-blue-300'
                                  : 'bg-blue-800 text-white'
                            }`}>
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </span>
                          </td>
                           <td className={`px-6 py-4 text-sm whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                            {transaction?.txnRef}
                           </td>
                          <td className={`px-6 py-4 text-sm whitespace-nowrap font-medium ${
                            transaction.type === 'deposit'
                              ? isDark ? 'text-green-400' : 'text-green-400'
                              : transaction.type === 'withdraw'
                              ? isDark ? 'text-red-400' : 'text-red-400'
                              : isDark ? 'text-blue-400' : 'text-blue-400'
                          }`}>
                            {transaction.amount.toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 text-sm whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                            {transaction.balanceBefore.toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 text-sm whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                            {transaction.balanceAfter.toFixed(2)}
                          </td>
                            <td className={`px-6 py-4 text-sm whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-800"}`}>
                            {transaction.description}
                          </td>
                          <td className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${isDark ? "text-blue-400" : "text-blue-400 underline cursor-pointer"}`}>
                            {transaction.counterparty}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className={isDark ? "text-gray-400 flex flex-col items-center" : "text-gray-500 flex flex-col items-center"}>
                            <svg className="w-12 h-12 mb-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-lg">No transactions found</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Enhanced Pagination with theme switch */}
          {transactionsData?.data?.pageCount > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-6">
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 1 
                    ? (isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#232c43] text-gray-400 cursor-not-allowed')
                    : (isDark ? 'bg-[#2d3748] text-gray-300 hover:bg-[#374151] border border-gray-700' : 'bg-gray-300 text-gray-800 hover:bg-white border border-gray-200')
                }`}
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="flex items-center space-x-2">
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>Page</span>
                <span className={`px-4 py-2 rounded-lg font-semibold ${isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                  {currentPage}
                </span>
                <span className={isDark ? "text-gray-300" : "text-gray-700"}>of {transactionsData.data.pageCount}</span>
              </div>
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === transactionsData.data.pageCount 
                    ? (isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#232c43] text-gray-400 cursor-not-allowed')
                    : (isDark ? 'bg-[#2d3748] text-gray-300 hover:bg-[#374151] border border-gray-700' : 'bg-gray-300 text-gray-800 hover:bg-gray-200 border border-[#232c43]')
                }`}
                onClick={() =>
                  setCurrentPage(currentPage + 1)
                }
                disabled={currentPage === transactionsData.data.pageCount}
              >
                Next
              </button>
              <button 
                className={isDark
                  ? "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                  : "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                }
                onClick={() => handlePageChange(1)}
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

export default MyAccountStatementtabs; 