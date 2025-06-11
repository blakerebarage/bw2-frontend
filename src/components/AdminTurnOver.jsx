import debounce from 'lodash.debounce';
import { useCallback, useEffect, useRef, useState } from "react";
import { FaEdit, FaSearch } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { useToasts } from "react-toast-notifications";
import useAxiosSecure from "../Hook/useAxiosSecure";

const AdminTurnOver = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [turnoverData, setTurnoverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const searchInputRef = useRef(null);
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();

  // Debounce the search query update
  const debouncedSetSearchQuery = useCallback(
    debounce((value) => setSearchQuery(value), 300),
    []
  );

  // Update search query when input value changes
  useEffect(() => {
    debouncedSetSearchQuery(inputValue);
    return () => debouncedSetSearchQuery.cancel();
  }, [inputValue, debouncedSetSearchQuery]);

  // Fetch turnover data
  const fetchTurnoverData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosSecure.get(
        `/api/v1/finance/all-turnover?page=${currentPage}&limit=${limit}&search=${searchQuery}`
      );  
      if (res.data.success) {
        setTurnoverData(res.data.data);
      } else {
        throw new Error(res.data.message || "Failed to fetch turnover data");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch turnover data");
      addToast(error.response?.data?.message || "Failed to fetch turnover data", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when page, limit, or search query changes
  useEffect(() => {
    fetchTurnoverData();
  }, [currentPage, limit, searchQuery]);

  // Handle turnover cancellation
  const handleTurnoverCancel = async (id) => {
    try {
      const res = await axiosSecure.patch(`/api/v1/finance/turnover-cancel/${id}`);
      if (res.data.success) {
        addToast("Turnover cancelled successfully", { 
          appearance: "success",
          autoDismiss: true,
        });
        // Refresh the data
        await fetchTurnoverData();
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to cancel turnover", { 
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  // Handle reset
  const handleReset = () => {
    setInputValue("");
    setSearchQuery("");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Turnover Management
            </h1>
            <p className="text-gray-300 text-center mt-2">
              Manage and update user turnover status efficiently
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Search Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by username..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                <FiRefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-[#1f2937]">
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Username</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Current Turnover</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Turnover Limit</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!turnoverData?.results?.length ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">No Data Found</p>
                        <p className="text-sm">There are no turnover data found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  turnoverData.results.map((turnover) => (
                    <tr key={turnover._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-gray-900">{turnover.username}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {turnover.currentTurnover.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {turnover.turnoverLimit.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            turnover.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {turnover.status.charAt(0).toUpperCase() + turnover.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTurnoverCancel(turnover._id)}
                          disabled={turnover.status === "cancelled"}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${
                            turnover.status === "cancelled"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-[#1f2937] text-white hover:bg-gray-800"
                          }`}
                        >
                          <FaEdit />
                          Cancel Turnover
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {turnoverData?.results?.length || 0} of{" "}
                {turnoverData?.totalItems || 0} results
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, turnoverData?.pageCount || 1))}
                  disabled={currentPage === (turnoverData?.pageCount || 1)}
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

export default AdminTurnOver; 