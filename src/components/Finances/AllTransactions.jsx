import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaList, FaTable } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const AllTransactions = () => {
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table or list
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const limit = 50;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, filter, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate date range if both dates are provided
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new Error("Start date cannot be after end date");
      }

      let url = `/api/v1/finance/all-transactions?page=${currentPage}&limit=${limit}`;
      
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      if (endDate) {
        url += `&endDate=${endDate}`;
      }

      const response = await axiosSecure.get(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch transactions");
      }

      setTransactions(response.data.data.results);
      setTotalPages(response.data.data.pageCount);
    } catch (error) {
      
      setError(error.message || "Failed to fetch transactions. Please try again later.");
      addToast(error.message || "Failed to fetch transactions. Please try again later.", {
        appearance: "error",
        autoDismiss: true,
      });
      setTransactions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      addToast("Start date cannot be after end date", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    setCurrentPage(1);
    fetchTransactions();
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    setError(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return "text-green-500";
      case "withdraw":
        return "text-red-500";
      case "transfer":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };

  const getTypeBgColor = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return "bg-green-50 border-green-200";
      case "withdraw":
        return "bg-red-50 border-red-200";
      case "transfer":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const ListView = () => (
    <div className="space-y-4">
      {transactions.map((txn) => (
        <div
          key={txn.txnRef}
          className={`p-4 rounded-lg border ${getTypeBgColor(txn?.senderTxn?.type)}`}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {txn?.senderTxn?.type?.toUpperCase()} Transaction
              </h3>
              <p className="text-sm text-gray-500">Ref: {txn.txnRef}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(txn?.senderTxn?.status)}`}>
              {txn?.senderTxn?.status?.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Sender</p>
                <p className="font-medium">{txn?.senderTxn?.senderUsername}</p>
                <p className="text-sm text-gray-500">
                  Balance: {formatCurrency(txn?.senderTxn?.balanceBefore)} → {formatCurrency(txn?.senderTxn?.balanceAfter)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Receiver</p>
                <p className="font-medium">{txn?.senderTxn?.receiverUsername}</p>
                <p className="text-sm text-gray-500">
                  Balance: {formatCurrency(txn?.receiverTxn?.balanceBefore)} → {formatCurrency(txn?.receiverTxn?.balanceAfter)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {moment(txn?.createdAt).format("MMM D, YYYY h:mm A")}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(txn?.senderTxn?.amount)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              All Transactions
            </h1>
            <p className="text-gray-300 text-center mt-2">
              Manage and update user transactions efficiently
            </p>
          </div>
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col gap-6">
              {/* Date Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <button
                    onClick={handleDateFilter}
                    className="flex-1 px-4 py-2.5 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Apply Filter
                  </button>
                  <button
                    onClick={clearDateFilter}
                    className="flex-1 px-4 py-2.5 bg-white text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>

              {/* View Mode and Type Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">View Mode:</span>
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === "table"
                          ? "bg-[#1f2937] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                      title="Table View"
                    >
                      <FaTable className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-[#1f2937] text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-200"
                      }`}
                      title="List View"
                    >
                      <FaList className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Transaction Type:</span>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm min-w-[150px]"
                  >
                    <option value="all">All Types</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdraw">Withdrawals</option>
                    <option value="transfer">Transfers</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={fetchTransactions}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : transactions.length > 0 ? (
              <>
                {viewMode === "table" && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction Ref
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sender
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Receiver
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Balance Before
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Balance After
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((txn) => (
                          <tr key={txn.txnRef} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {txn.txnRef}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-medium ${getTypeColor(txn?.senderTxn?.type)}`}>
                                {txn?.senderTxn?.type?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(txn?.senderTxn?.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex flex-col">
                                <span className="font-medium">{txn?.senderTxn?.senderUsername}</span>
                                <span className="text-xs text-gray-500">Balance: {formatCurrency(txn?.senderTxn?.balanceBefore)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex flex-col">
                                <span className="font-medium">{txn?.senderTxn?.receiverUsername}</span>
                                <span className="text-xs text-gray-500">Balance: {formatCurrency(txn?.receiverTxn?.balanceBefore)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex flex-col">
                                <span>Sender: {formatCurrency(txn?.senderTxn?.balanceBefore)}</span>
                                <span>Receiver: {formatCurrency(txn?.receiverTxn?.balanceBefore)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex flex-col">
                                <span>Sender: {formatCurrency(txn?.senderTxn?.balanceAfter)}</span>
                                <span>Receiver: {formatCurrency(txn?.receiverTxn?.balanceAfter)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-medium ${getStatusColor(txn?.senderTxn?.status)}`}>
                                {txn?.senderTxn?.status?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {moment(txn?.createdAt).format("MMM D, YYYY h:mm A")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {viewMode === "list" && <ListView />}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTransactions; 