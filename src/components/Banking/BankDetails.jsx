import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaList, FaTable } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

const BankDetails = () => {
  const { accountNumber } = useParams();
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState("table");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const limit = 10;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate date range if both dates are provided
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new Error("Start date cannot be after end date");
      }

      let url = `/api/v1/finance/received-payments/${accountNumber}?page=${currentPage}&limit=${limit}`;
      
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

  const ListView = () => (
    <div className="space-y-4">
      {transactions.map((txn) => (
        <div
          key={txn._id}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-gray-200"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">
                {txn.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{txn.paymentMethod}</h3>
                  <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    {txn.channel}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Username:</span> {txn.username}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Account:</span> {txn.accountNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900 mb-1">{formatCurrency(txn.amount)}</p>
              <p className="text-sm text-gray-500">{moment(txn.date).format("MMM D, YYYY h:mm A")}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading transactions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Bank Transactions</h2>
                <p className="text-gray-500">View and manage your bank account transactions</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Date Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm hover:border-gray-300 transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm hover:border-gray-300 transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDateFilter}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center gap-2"
                    >
                      <span>Filter</span>
                    </button>
                    <button
                      onClick={clearDateFilter}
                      className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm hover:shadow flex items-center gap-2"
                    >
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center">
                  <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                    <button
                      onClick={() => setViewMode("table")}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${
                        viewMode === "table"
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                      title="Table View"
                    >
                      <FaTable className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2.5 rounded-lg transition-all duration-200 ${
                        viewMode === "list"
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                      title="List View"
                    >
                      <FaList className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {transactions.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-500 text-lg">No transactions found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or date range</p>
              </div>
            ) : viewMode === "table" ? (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Account Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Channel
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((txn) => (
                      <tr key={txn._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                              {txn.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="ml-3 text-sm font-medium text-gray-900">{txn.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                            {txn.paymentMethod}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {txn.accountNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                            {txn.channel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(txn.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {moment(txn.date).format("MMM D, YYYY h:mm A")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <ListView />
            )}
          </div>

          {/* Pagination */}
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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

export default BankDetails;