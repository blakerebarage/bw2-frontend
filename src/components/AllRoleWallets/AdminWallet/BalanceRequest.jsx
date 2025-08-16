import { useSocket } from "@/contexts/SocketContext";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import useSoundNotification from "@/Hook/useSoundNotification";
import useManualUserDataReload from "@/Hook/useUserDataReload";
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useRef, useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import Swal from "sweetalert2";

const BalanceRequest = () => {
  const { user } = useSelector((state) => state.auth);
  const axiosSecure = useAxiosSecure();
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSocketUpdate, setLastSocketUpdate] = useState(null);
  const { addToast } = useToasts();
  const [limit] = useState(50);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const {formatCurrency} = useCurrency();
  const { reloadUserData } = useManualUserDataReload();
  
  // Ref for search input to maintain focus
  const searchInputRef = useRef(null);
  
  // Get socket using the useSocket hook
  const { socket, isConnected } = useSocket();

  // Use sound notification hook
  const { handleDepositEvent } = useSoundNotification();

  // Check if user is admin or super-admin
  const isAdminOrSuperAdmin = user?.role === "admin" || user?.role === "super-admin";

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setKeyword(searchValue);
      setIsSearching(false);
    }, 500),
    []
  );

  // Update the search input handler
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value); // Update input value immediately for user feedback
    
    // Set searching state if there's a difference between input and current keyword
    if (value !== keyword) {
      setIsSearching(true);
    }
    
    debouncedSearch(value); // Debounce the actual search
  };

  // Maintain focus on search input after data updates
  useEffect(() => {
    if (isSearchFocused && searchInputRef.current && searchInput) {
      setTimeout(() => {
        searchInputRef.current?.focus();
        // Restore cursor position to end
        const len = searchInput.length;
        searchInputRef.current?.setSelectionRange(len, len);
      }, 0);
    }
  }, [requestData, isSearchFocused, searchInput]);

  // Date validation
  const isDateRangeValid = useCallback(() => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  }, [startDate, endDate]);

  const fetchRequests = useCallback(async () => {
    try {
      // Don't fetch if user is not loaded or date range is invalid
      if (!user?.role || !isDateRangeValid()) {
        return;
      }
      
      setLoading(true);
      setError(null);
     
      let apiUrl = '/api/v1/finance/all-recharge-request';
      
      // Add pagination
      apiUrl += `?page=${page}&limit=${limit}`;
      
      // For admin/super-admin, show all requests
      if (isAdminOrSuperAdmin) {
        // No additional filters needed for admin/super-admin
      } else if (user?.referralCode) {
        // For upline users, filter by referral code (requests from their downline)
        apiUrl += `&referralCode=${user.referralCode}`;
      }
      
      // Add status filter if not "all"
      if (statusFilter !== "all") {
        apiUrl += `&status=${statusFilter}`;
      }
      
      // Add search filter if provided
      if (keyword.trim()) {
        apiUrl += `&search=${encodeURIComponent(keyword.trim())}`;
      }
      
      // Add date filters if provided
      if (startDate) {
        apiUrl += `&startDate=${startDate}`;
      }
      
      if (endDate) {
        apiUrl += `&endDate=${endDate}`;
      }
      
      const res = await axiosSecure.get(apiUrl);

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to fetch recharge requests");
      }

      const { results } = res?.data?.data;
      
      setRequestData(results || []);
      setTotalPages(res.data.data.pageCount || 1);
    } catch (err) {
      setError(err.message || "Failed to fetch recharge requests. Please try again later.");
      
      setRequestData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, keyword, startDate, endDate, isAdminOrSuperAdmin, user?.role, user?.username, user?.referralCode, axiosSecure, isDateRangeValid]);

  useEffect(() => {
    if (user?.role) {
      fetchRequests();
    }
  }, [page, statusFilter, keyword, startDate, endDate, isAdminOrSuperAdmin, fetchRequests, user?.role]);

  // Reset to first page when filters change (except page)
  useEffect(() => {
    setPage(1);
  }, [statusFilter, keyword, startDate, endDate]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !user || user.role === "user") {
      return;
    }

    // Debug listener to capture all socket events
    const handleAnyEvent = (eventName, ...args) => {
     
    };

    // Handle individual request updates
    const handleIndividualRequestUpdate = (payload) => {
     

      if (payload && payload.data) {
        const updatedRequest = payload.data;
        
        // Play sound notification for individual request updates
        if (updatedRequest.type === 'deposit' || updatedRequest.type === 'recharge') {
          handleDepositEvent('deposit_request_update', updatedRequest);
        }

        // Update recharge requests
        setRequestData(prev => {
          
          const existingIndex = prev.findIndex(req => req._id === updatedRequest._id);
         

          if (existingIndex !== -1) {
           
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...updatedRequest };
            
            // Remove requests that are no longer pending if status filter is set
            if (statusFilter === "pending") {
              return updated.filter(req => req.status === "pending");
            }
            return updated;
          } else {
            const shouldShow = isAdminOrSuperAdmin || updatedRequest.referralCode === user.referralCode;

            if (shouldShow) {
              
              const updated = [...prev, updatedRequest];
              
              // Apply status filter if set
              if (statusFilter !== "all") {
                return updated.filter(req => req.status === statusFilter);
              }
              return updated;
            }
          }
          return prev;
        });
      } else {
       
      }
    };

    // Listen for recharge request updates
    const handleRechargeRequestUpdate = (payload) => {
     
      
      if (payload && payload.data && Array.isArray(payload.data)) {
        let filteredResults = payload.data;
        
        // Filter based on user type
        if (isAdminOrSuperAdmin) {
          // Admin/super-admin sees all requests
          filteredResults = payload.data;
        } else if (user?.referralCode) {
          // Upline users see requests from their downline
          filteredResults = payload.data.filter(req => req.referralCode === user.referralCode);
        }
        
        // Apply status filter if set
        if (statusFilter !== "all") {
          filteredResults = filteredResults.filter(req => req.status === statusFilter);
        }
        
        // Check for new pending requests and play sound
        const newPendingRequests = filteredResults.filter(req => req.status === "pending");
        if (newPendingRequests.length > 0) {
          // Play sound for new pending requests
          
          handleDepositEvent('deposit_pending', { 
            count: newPendingRequests.length,
            requests: newPendingRequests 
          });
          
          // Refresh the request list to show the new request
          fetchRequests();
        }
        
        setRequestData(filteredResults);
        setLastSocketUpdate(new Date().toISOString());
      } else if (payload && payload.data && payload.data.results && Array.isArray(payload.data.results)) {
        // Handle paginated response structure
        let filteredResults = payload.data.results;
        
        if (isAdminOrSuperAdmin) {
          filteredResults = payload.data.results;
        } else if (user?.referralCode) {
          filteredResults = payload.data.results.filter(req => req.referralCode === user.referralCode);
        }
        
        if (statusFilter !== "all") {
          filteredResults = filteredResults.filter(req => req.status === statusFilter);
        }
        
        // Check for new pending requests and play sound
        const newPendingRequests = filteredResults.filter(req => req.status === "pending");
        if (newPendingRequests.length > 0) {
          // Play sound for new pending requests
          
          handleDepositEvent('deposit_pending', { 
            count: newPendingRequests.length,
            requests: newPendingRequests 
          });
          
          // Refresh the request list to show the new request
          fetchRequests();
        }
        
        setRequestData(filteredResults);
        setLastSocketUpdate(new Date().toISOString());
      } else if (payload && payload.data && payload.data.data && payload.data.data.results && Array.isArray(payload.data.data.results)) {
        // Handle double-nested response structure
        let filteredResults = payload.data.data.results;
        
        if (isAdminOrSuperAdmin) {
          filteredResults = payload.data.data.results;
        } else if (user?.referralCode) {
          filteredResults = payload.data.data.results.filter(req => req.referralCode === user.referralCode);
        }
        
        if (statusFilter !== "all") {
          filteredResults = filteredResults.filter(req => req.status === statusFilter);
        }
        
        // Check for new pending requests and play sound
        const newPendingRequests = filteredResults.filter(req => req.status === "pending");
        if (newPendingRequests.length > 0) {
          // Play sound for new pending requests
          
          handleDepositEvent('deposit_pending', { 
            count: newPendingRequests.length,
            requests: newPendingRequests 
          });
          
          // Refresh the request list to show the new request
          fetchRequests();
        }
        
        setRequestData(filteredResults);
        setLastSocketUpdate(new Date().toISOString());
      }
    };

    // Listen for general request updates
    const handleGeneralRequestUpdate = () => {
      fetchRequests();
    };

    // Listen for request status updates
    const handleRequestStatusUpdate = (payload) => {
      // Update the specific request in the list
      setRequestData(prev => {
        const updated = prev.map(req => {
          if (req._id === payload.requestId) {
            return { ...req, status: payload.status };
          }
          return req;
        });
        
        // Remove requests that are no longer pending if status filter is set
        if (statusFilter === "pending") {
          return updated.filter(req => req.status === "pending");
        }
        
        return updated;
      });
    };

    // Handle new deposit request submissions
    socket.on('recharge_request_update', handleRechargeRequestUpdate);
    socket.on('request_update', handleGeneralRequestUpdate);
    socket.on('request_status_updated', handleRequestStatusUpdate);
    socket.on('wallet_request_update', handleIndividualRequestUpdate);
    socket.on('agent_request_update', handleIndividualRequestUpdate);
    socket.on('status_update', handleIndividualRequestUpdate);
    socket.on('withdraw_approved', handleIndividualRequestUpdate);
    socket.on('withdraw_rejected', handleIndividualRequestUpdate);
    socket.on('recharge_approved', handleIndividualRequestUpdate);
    socket.on('recharge_rejected', handleIndividualRequestUpdate);

    // Debug listener for all events
    socket.onAny(handleAnyEvent);

    return () => {
      socket.off('recharge_request_update', handleRechargeRequestUpdate);
      socket.off('request_update', handleGeneralRequestUpdate);
      socket.off('request_status_updated', handleRequestStatusUpdate);
      socket.off('wallet_request_update', handleIndividualRequestUpdate);
      socket.off('agent_request_update', handleIndividualRequestUpdate);
      socket.off('status_update', handleIndividualRequestUpdate);
      socket.off('withdraw_approved', handleIndividualRequestUpdate);
      socket.off('withdraw_rejected', handleIndividualRequestUpdate);
      socket.off('recharge_approved', handleIndividualRequestUpdate);
      socket.off('recharge_rejected', handleIndividualRequestUpdate);
      socket.offAny(handleAnyEvent);
    };
  }, [socket, isConnected, user, statusFilter, isAdminOrSuperAdmin]);

  const handleApproveBtn = async (id, txnId) => {
    try {
      const res = await axiosSecure.patch(`/api/v1/finance/update-recharge-request-status/${id}`,{
        status: "approved"
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to approve request");
      }

      // Play success sound
      handleDepositEvent('deposit_success', { id, txnId });

      // Update local state
      setRequestData((prev) => prev.filter((req) => req.txnId !== txnId));
      
      // Emit socket event to notify other users
      if (socket && isConnected) {
        socket.emit('request_status_updated', {
          requestId: id,
          status: 'approved',
          timestamp: new Date().toISOString()
        });
      }
      
      addToast("Request approved successfully", {
        appearance: "success",
        autoDismiss: true,
      });
      reloadUserData();
    } catch (err) {
      // Play error sound for failed approval
      handleDepositEvent('deposit_error', { id, txnId });
      
      addToast(err.message || "Failed to approve request", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleReject = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You want to reject this request?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, reject it!'
      });
      if (!result.isConfirmed) return;
      
      const response = await axiosSecure.patch(`/api/v1/finance/update-recharge-request-status/${id}`, {
        status: "cancelled"
      });
      
      if (response.data.success) {
        // Play error sound for rejection
        handleDepositEvent('deposit_error', { id });
        
        // Update local state
        setRequestData(prev => prev.filter(request => request._id !== id));
        
        // Emit socket event to notify other users
        if (socket && isConnected) {
          socket.emit('request_status_updated', {
            requestId: id,
            status: 'cancelled',
            timestamp: new Date().toISOString()
          });
        }
        
        Swal.fire(
          'Rejected!',
          'The request has been rejected.',
          'success'
        );
        reloadUserData();
      } else {
        throw new Error(response.data.message || 'Failed to reject request');
      }
    } catch (error) {
      // Play error sound for failed rejection
      handleDepositEvent('deposit_error', { id });
      
      Swal.fire(
        'Error!',
        error?.response?.data?.message || 'Failed to reject the request.',
        'error'
      );
    }
  };
  

  // Show loading if user is not loaded yet
  if (!user?.role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#1f2937] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#1f2937] font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
              <FaMoneyBillWave className="text-2xl" />
              Balance Requests
            </h1>
            <p className="text-gray-300 text-center mt-1">
              {isAdminOrSuperAdmin 
                ? "Manage all user balance requests" 
                : "Manage user balance requests"
              }
            </p>
            {lastSocketUpdate && (
              <p className="text-green-400 text-center mt-1 text-sm">
                🔄 Last updated: {new Date(lastSocketUpdate).toLocaleTimeString()}
              </p>
            )}
            {isAdminOrSuperAdmin && (
              <p className="text-gray-400 text-center mt-1 text-sm">
                Showing all requests (Admin/Super-Admin view)
              </p>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Filter Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                  {searchInput !== keyword && searchInput.length > 0 && (
                    <span className="ml-2 text-xs text-blue-500">(searching...)</span>
                  )}
                </label>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by username, txnId..."
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors duration-200"
                />
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Start Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors duration-200 ${
                    !isDateRangeValid() ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {!isDateRangeValid() && (
                  <p className="text-red-500 text-xs mt-1">Start date cannot be greater than end date</p>
                )}
              </div>
              
              {/* End Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors duration-200 ${
                    !isDateRangeValid() ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {!isDateRangeValid() && (
                  <p className="text-red-500 text-xs mt-1">End date cannot be less than start date</p>
                )}
              </div>
            </div>
            
            {/* Clear Filters Button */}
            {(keyword || searchInput || startDate || endDate || statusFilter !== "all") && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setKeyword("");
                    setSearchInput("");
                    setIsSearching(false);
                    setStartDate("");
                    setEndDate("");
                    setStatusFilter("all");
                    setPage(1);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Txn ID
                  </th>
                  
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wallet Agent
                    </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={isAdminOrSuperAdmin ? "11" : "10"} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-[#1f2937] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500">Loading...</p>
                      </div>
                    </td>
                  </tr>
                ) : isSearching ? (
                  <tr>
                    <td colSpan={isAdminOrSuperAdmin ? "11" : "10"} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-500">Searching...</p>
                      </div>
                    </td>
                  </tr>
                ) : requestData?.length ? requestData.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request?.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.accountNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.senderPhone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.channel}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.txnId[0]}</div>
                    </td>
                    
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.walletAgentUsername || 'N/A'}</div>
                      </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(request.amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveBtn(request._id, request.txnId)}
                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors duration-200"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={isAdminOrSuperAdmin ? "11" : "10"} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">No Data Found</p>
                        <p className="text-sm">There are no balance requests found</p>
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
                Showing page {page} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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

export default BalanceRequest;
