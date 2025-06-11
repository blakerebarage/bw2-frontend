import { useCurrency } from "@/Hook/useCurrency";
import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import { useState } from "react";
import { FiFilter, FiRefreshCw, FiSearch } from "react-icons/fi";
import { useSelector } from "react-redux";
import Transaction from "./Transaction";

const Banking = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: users } = useGetUsersQuery();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const { formatCurrency } = useCurrency();

  

  const filteredUsers = users?.data?.users?.filter((row) => {
    const matchesRole = user?.referralCode === row?.referredBy;
    const matchesSearch = (row?.username || row?.phoneOrUserName).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    return matchesRole && matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);
  const paginatedUsers = filteredUsers?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Banking Management
            </h1>
            <p className="text-gray-300 text-center mt-2">
              Manage user balances and transactions efficiently
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Filters */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by username or phone"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm appearance-none"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="active">Active Users</option>
                  <option value="inactive">Deactivated Users</option>
                  <option value="all">All Users</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("active");
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                <FiRefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-[#1f2937]">
                  {[
                    "Phone/Username",
                    "Available Balance",
                    "Balance in Downline",
                    "Exposure in Downline",
                    "Deposit/Withdraw",
                    "Credit Reference",
                    "Reference P/L",
                    "Remark",
                    "Actions",
                  ].map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers?.length > 0 ? (
                  paginatedUsers.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm">
                        <span className="text-[#1f2937] font-medium">
                          {row?.username || row?.phoneOrUserName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-green-600 font-medium">
                          {formatCurrency(row?.balance)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-blue-600 font-medium">
                          {formatCurrency(row?.exposure)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-red-600 font-medium">
                          {formatCurrency(row?.exposure)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Transaction
                          username={row?.username}
                          availableBalance={row?.balance}
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="text-gray-700 font-medium">
                          {row?.playerBalance?.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`font-medium ${row?.refPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row?.refPL}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <input
                          className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                          type="text"
                          placeholder="Add remark"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button 
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#1f2937] to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-[#1f2937] transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                          title="Login as user"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Login
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-700">No data available</p>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banking;
