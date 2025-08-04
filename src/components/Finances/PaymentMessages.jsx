import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useSocket } from "@/contexts/SocketContext";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaList, FaSms, FaTable } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const PaymentMessages = () => {
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const { socket, isConnected } = useSocket();
  const [paymentMessages, setPaymentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // table or list
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const limit = 10;

  useEffect(() => {
    fetchPaymentMessages();
  }, [currentPage, filter, startDate, endDate]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !user) {
      return;
    }

    // Listen for payment message updates
    const handlePaymentMessageUpdate = (payload) => {
      if (payload && payload.data) {
        let messageData = [];
        
        // Handle different response structures
        if (Array.isArray(payload.data)) {
          messageData = payload.data;
        } else if (payload.data.data && Array.isArray(payload.data.data)) {
          messageData = payload.data.data;
        }
        
        if (messageData.length > 0) {
          // Apply current filters
          let filteredMessages = messageData;
          
          if (filter !== "all") {
            filteredMessages = messageData.filter(m => m.status === filter);
          }
          
          if (startDate) {
            filteredMessages = filteredMessages.filter(m => 
              new Date(m.smsTimestamp) >= new Date(startDate)
            );
          }
          
          if (endDate) {
            filteredMessages = filteredMessages.filter(m => 
              new Date(m.smsTimestamp) <= new Date(endDate)
            );
          }
          
          setPaymentMessages(filteredMessages);
        }
      }
    };

    // Listen for status updates
    const handleStatusUpdate = (payload) => {
      if (payload && payload.messageId && payload.status) {
        setPaymentMessages(prev => {
          return prev.map(message => {
            if (message._id === payload.messageId) {
              return { ...message, status: payload.status };
            }
            return message;
          });
        });
      }
    };

    socket.on('payment_message_update', handlePaymentMessageUpdate);
    socket.on('message_status_updated', handleStatusUpdate);

    return () => {
      socket.off('payment_message_update', handlePaymentMessageUpdate);
      socket.off('message_status_updated', handleStatusUpdate);
    };
  }, [socket, isConnected, user, filter, startDate, endDate]);

  const fetchPaymentMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate date range if both dates are provided
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        throw new Error("Start date cannot be after end date");
      }

      let url = `/api/v1/finance/payment-confirmations?page=${currentPage}&limit=${limit}`;
      
      if (startDate) {
        url += `&startDate=${startDate}`;
      }
      if (endDate) {
        url += `&endDate=${endDate}`;
      }

      const response = await axiosSecure.get(url);

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch payment messages");
      }

      setPaymentMessages(response.data.data);
      setTotalPages(Math.ceil(response.data.meta.total / limit));
    } catch (error) {
      setError(error.message || "Failed to fetch payment messages. Please try again later.");
      addToast(error.message || "Failed to fetch payment messages. Please try again later.", {
        appearance: "error",
        autoDismiss: true,
      });
      setPaymentMessages([]);
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
    fetchPaymentMessages();
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    setError(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method?.toLowerCase()) {
      case "bkash":
        return "text-orange-500";
      case "nagad":
        return "text-green-500";
      case "rocket":
        return "text-blue-500";
      case "upay":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  const getPaymentMethodBgColor = (method) => {
    switch (method?.toLowerCase()) {
      case "bkash":
        return "bg-orange-50 border-orange-200";
      case "nagad":
        return "bg-green-50 border-green-200";
      case "rocket":
        return "bg-blue-50 border-blue-200";
      case "upay":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const ListView = () => (
    <div className="space-y-4">
      {paymentMessages.map((message) => (
        <div
          key={message._id}
          className={`p-4 rounded-lg border ${getPaymentMethodBgColor(message.paymentMethod)}`}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {message.paymentMethod} Payment
              </h3>
              <p className="text-sm text-gray-500">TXN: {message.txnId}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(message.status)}`}>
              {message.status?.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">{message.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Incoming Number</p>
                <p className="font-medium">{message.incommingNumber}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Sender Number</p>
                <p className="font-medium">{message.senderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className={`font-medium ${getPaymentMethodColor(message.paymentMethod)}`}>
                  {message.paymentMethod}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {moment(message.smsTimestamp).format("MMM D, YYYY h:mm A")}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(message.amount)}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
              {message.msg}
            </p>
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
              Payment Messages
            </h1>
            <p className="text-gray-300 text-center mt-2">
              Monitor and manage SMS payment confirmations
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

              {/* View Mode and Status Filter */}
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
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm min-w-[150px]"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="failed">Failed</option>
                    <option value="rejected">Rejected</option>
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
                  onClick={fetchPaymentMessages}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : paymentMessages.length > 0 ? (
              <>
                {viewMode === "table" && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transaction ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sender Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Incoming Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SMS Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Message
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paymentMessages.map((message) => (
                          <tr key={message._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {message.txnId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {message.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-medium ${getPaymentMethodColor(message.paymentMethod)}`}>
                                {message.paymentMethod}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(message.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {message.senderNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {message.incommingNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-medium ${getStatusColor(message.status)}`}>
                                {message.status?.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {moment(message.smsTimestamp).format("MMM D, YYYY h:mm A")}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="max-w-xs">
                                <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                  {message.msg}
                                </p>
                              </div>
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
                <div className="text-gray-400 mb-4">
                  <FaSms className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500">No payment messages found</p>
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

export default PaymentMessages; 