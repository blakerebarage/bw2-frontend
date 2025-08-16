import { useSocket } from "@/contexts/SocketContext";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import useSoundNotification from "@/Hook/useSoundNotification";
import useManualUserDataReload from "@/Hook/useUserDataReload";
import { setCredentials } from "@/redux/slices/authSlice";
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import logo from "../../../public/logoBlack.png";

const AllWithdraw = () => {
  const axiosSecure = useAxiosSecure();
  const {formatCurrency} = useCurrency();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [withdraws, setWithdraws] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastSocketUpdate, setLastSocketUpdate] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const itemsPerPage = 50;
  const { reloadUserData } = useManualUserDataReload();
  
  // Ref for search input to maintain focus
  const searchInputRef = useRef(null);
  
  // Get socket using the useSocket hook
  const { socket, isConnected } = useSocket();

  // Use sound notification hook
  const { handleWithdrawEvent } = useSoundNotification();

  // Check if user is admin or super-admin
  const isAdminOrSuperAdmin = user?.role === "admin" || user?.role === "super-admin";

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setKeyword(searchValue);
    }, 500),
    []
  );

  // Update the search input handler
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value); // Update input value immediately for user feedback
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
  }, [withdraws, isSearchFocused, searchInput]);

  // Date validation
  const isDateRangeValid = () => {
    if (!startDate || !endDate) return true;
    return new Date(startDate) <= new Date(endDate);
  };

  const fetchData = async () => {
    try {
      // Don't fetch if date range is invalid
      if (!isDateRangeValid()) {
        return;
      }
      
      setLoading(true);
      
      let apiUrl = '/api/v1/finance/all-withdraw-request';
      
      // Add pagination
      apiUrl += `?page=${currentPage}&limit=${itemsPerPage}`;
      
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
      
      if (res.data.success) {
        const results = res.data.data.results || [];
        
        setWithdraws(results);
        setTotalPages(res.data.data.pageCount || 1);
      } else {
        setWithdraws([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching withdraw requests:", error);
      setWithdraws([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.referralCode || isAdminOrSuperAdmin) {
      fetchData();
    }
  }, [axiosSecure, user?.referralCode, currentPage, statusFilter, keyword, startDate, endDate, isAdminOrSuperAdmin]);

  // Reset to first page when filters change (except currentPage)
  useEffect(() => {
    setCurrentPage(1);
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
        if (updatedRequest.type === 'withdraw') {
          handleWithdrawEvent('withdraw_request_update', updatedRequest);
        }

        // Update withdraw requests
        setWithdraws(prev => {
         
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

    // Listen for withdraw request updates
    const handleWithdrawRequestUpdate = (payload) => {
     
      
      if (payload && payload.data && Array.isArray(payload.data)) {
        let filteredResults = payload.data;
        
        // Filter based on user type
        if (isAdminOrSuperAdmin) {
          // Admin/super-admin sees all requests
          filteredResults = payload.data;
        } else if (user?.role === "wallet-agent") {
          // Wallet agent sees only their assigned requests
          filteredResults = payload.data.filter(req => req.walletAgentUsername === user.username);
        } else if (user?.referralCode) {
          // Upline users see requests from their downline
          filteredResults = payload.data.filter(req => req.referralCode === user.referralCode);
        }
        
        // Apply status filter if set
        if (statusFilter !== "all") {
          filteredResults = filteredResults.filter(req => req.status === statusFilter);
        }
        
       
        
        setWithdraws(filteredResults);
        setLastSocketUpdate(new Date().toISOString());
      } else if (payload && payload.data && payload.data.results && Array.isArray(payload.data.results)) {
        // Handle paginated response structure
        let filteredResults = payload.data.results;
        
        if (isAdminOrSuperAdmin) {
          filteredResults = payload.data.results;
        } else if (user?.role === "wallet-agent") {
          filteredResults = payload.data.results.filter(req => req.walletAgentUsername === user.username);
        } else if (user?.referralCode) {
          filteredResults = payload.data.results.filter(req => req.referralCode === user.referralCode);
        }
        
        if (statusFilter !== "all") {
          filteredResults = filteredResults.filter(req => req.status === statusFilter);
        }
        
        setWithdraws(filteredResults);
        setLastSocketUpdate(new Date().toISOString());
      } else if (payload && payload.data && payload.data.data && payload.data.data.results && Array.isArray(payload.data.data.results)) {
        // Handle double-nested response structure
        let filteredResults = payload.data.data.results;
        
        if (isAdminOrSuperAdmin) {
          filteredResults = payload.data.data.results;
        } else if (user?.role === "wallet-agent") {
          filteredResults = payload.data.data.results.filter(req => req.walletAgentUsername === user.username);
        } else if (user?.referralCode) {
          filteredResults = payload.data.data.results.filter(req => req.referralCode === user.referralCode);
        }
        
        if (statusFilter !== "all") {
          filteredResults = filteredResults.filter(req => req.status === statusFilter);
        }
        
        setWithdraws(filteredResults);
        setLastSocketUpdate(new Date().toISOString());
      }
    };

    // Listen for request status updates
    const handleRequestStatusUpdate = (payload) => {
      // Update the specific request in the list
      setWithdraws(prev => {
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

    socket.on('withdraw_request_update', handleWithdrawRequestUpdate);
    socket.on('request_status_updated', handleRequestStatusUpdate);
    socket.on('wallet_request_update', handleIndividualRequestUpdate);
    socket.on('agent_request_update', handleIndividualRequestUpdate);
    socket.on('request_update', handleIndividualRequestUpdate);
    socket.on('status_update', handleIndividualRequestUpdate);
    // Additional events for wallet-agent actions
    socket.on('withdraw_approved', handleIndividualRequestUpdate);
    socket.on('withdraw_rejected', handleIndividualRequestUpdate);
    socket.on('recharge_approved', handleIndividualRequestUpdate);
    socket.on('recharge_rejected', handleIndividualRequestUpdate);
    socket.on('wallet_agent_action', handleIndividualRequestUpdate);
    socket.on('upline_update', handleIndividualRequestUpdate);
    socket.on('referral_code_room_update', handleIndividualRequestUpdate);
    socket.on('user_room_update', handleIndividualRequestUpdate);

    // Debug listener for all events
    socket.onAny(handleAnyEvent);

    return () => {
      socket.off('withdraw_request_update', handleWithdrawRequestUpdate);
      socket.off('request_status_updated', handleRequestStatusUpdate);
      socket.off('wallet_request_update', handleIndividualRequestUpdate);
      socket.off('agent_request_update', handleIndividualRequestUpdate);
      socket.off('request_update', handleIndividualRequestUpdate);
      socket.off('status_update', handleIndividualRequestUpdate);
      socket.off('withdraw_approved', handleIndividualRequestUpdate);
      socket.off('withdraw_rejected', handleIndividualRequestUpdate);
      socket.off('recharge_approved', handleIndividualRequestUpdate);
      socket.off('recharge_rejected', handleIndividualRequestUpdate);
      socket.off('wallet_agent_action', handleIndividualRequestUpdate);
      socket.off('upline_update', handleIndividualRequestUpdate);
      socket.off('referral_code_room_update', handleIndividualRequestUpdate);
      socket.off('user_room_update', handleIndividualRequestUpdate);
      socket.offAny(handleAnyEvent);
    };
  }, [socket, isConnected, user, statusFilter, isAdminOrSuperAdmin]);

  const handleApprove = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to approve this withdraw?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve it!",
      });

      if (result.isConfirmed) {
        const withdrawRequest = withdraws.find(item => item._id === id);
        if (!withdrawRequest) {
          throw new Error("Withdrawal request not found");
        }

        const userResponse = await axiosSecure.get(`/api/v1/user/profile`);
        const currentUserData = userResponse.data.data;

        const currentBalance = parseFloat(currentUserData.balance);
        const withdrawAmount = parseFloat(withdrawRequest.amount);
        const newBalance = currentBalance - withdrawAmount;

        if (newBalance < 0) {
          Swal.fire("Error!", "Insufficient balance for withdrawal.", "error");
          return;
        }

        const updatedUserData = {
          ...currentUserData,
          balance: newBalance
        };

        dispatch(setCredentials({
          token: localStorage.getItem("token"),
          user: updatedUserData
        }));

        await axiosSecure.patch(`/api/v1/finance/update-withdraw-request-status/${id}`, {
          status: "approved"
        });
        
        // Emit socket event to notify other users
        if (socket && isConnected) {
          socket.emit('request_status_updated', {
            requestId: id,
            status: 'approved',
            timestamp: new Date().toISOString()
          });
        }
        
        const updatedWithdraws = withdraws.map((item) =>
          item._id === id ? { ...item, status: "success" } : item
        );
        setWithdraws(updatedWithdraws);

        // Play success sound
        handleWithdrawEvent('withdraw_success', { id, amount: withdrawRequest.amount });

        Swal.fire({
          title: "Approved!",
          html: `<p>The withdraw request has been approved.</p>`,
          icon: "success"
        });

        let refreshUrl = `/api/v1/finance/all-withdraw-request?limit=${itemsPerPage}&page=${currentPage}`;
        if (statusFilter !== "all") refreshUrl += `&status=${statusFilter}`;
        if (keyword.trim()) refreshUrl += `&search=${encodeURIComponent(keyword.trim())}`;
        if (startDate) refreshUrl += `&startDate=${startDate}`;
        if (endDate) refreshUrl += `&endDate=${endDate}`;
        if (!isAdminOrSuperAdmin && user?.referralCode) refreshUrl += `&referralCode=${user.referralCode}`;
        
        const refreshedWithdraws = await axiosSecure.get(refreshUrl);
        console.log(refreshedWithdraws);
        const filteredWithdraws = isAdminOrSuperAdmin 
          ? refreshedWithdraws?.data?.data?.results 
          : refreshedWithdraws?.data?.data?.results.filter(
              (item) => item?.referralCode === user?.referralCode
            );
       
        setWithdraws(filteredWithdraws);
        reloadUserData();
      }
    } catch (error) {
      Swal.fire("Error!", error.message || "Something went wrong while approving.", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to reject this withdraw request?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, reject it!",
      });

      if (result.isConfirmed) {
        await axiosSecure.patch(`/api/v1/finance/update-withdraw-request-status/${id}`,
          {
            status: "cancelled"
          }
        );

        // Emit socket event to notify other users
        if (socket && isConnected) {
          socket.emit('request_status_updated', {
            requestId: id,
            status: 'cancelled',
            timestamp: new Date().toISOString()
          });
        }

        const updatedWithdraws = withdraws.map((item) =>
          item._id === id ? { ...item, status: "rejected" } : item
        );
        setWithdraws(updatedWithdraws);

        // Play error sound for rejection
        handleWithdrawEvent('withdraw_error', { id });

        Swal.fire({
          title: "Rejected!",
          html: `<p>The withdraw request has been rejected.</p>`,
          icon: "success"
        });

        let refreshUrl = `/api/v1/finance/all-withdraw-request?limit=${itemsPerPage}&page=${currentPage}`;
        if (statusFilter !== "all") refreshUrl += `&status=${statusFilter}`;
        if (keyword.trim()) refreshUrl += `&search=${encodeURIComponent(keyword.trim())}`;
        if (startDate) refreshUrl += `&startDate=${startDate}`;
        if (endDate) refreshUrl += `&endDate=${endDate}`;
        if (!isAdminOrSuperAdmin && user?.referralCode) refreshUrl += `&referralCode=${user.referralCode}`;
        
        const refreshedWithdraws = await axiosSecure.get(refreshUrl);
        const filteredWithdraws = isAdminOrSuperAdmin 
          ? refreshedWithdraws?.data?.data?.results 
          : refreshedWithdraws?.data?.data?.results.filter(
              (item) => item?.referralCode === user?.referralCode
            );
        setWithdraws(filteredWithdraws);
        reloadUserData();
      }
    } catch (error) {
      Swal.fire("Error!", error.message || "Something went wrong while rejecting.", "error");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "success":
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "rejected":
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Withdraw Requests
            </h1>
            
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

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-12 h-12 border-4 border-[#1f2937] border-t-transparent rounded-full animate-spin"></div>
            <img src={logo} alt="" className="w-16 h-16 bg-blue-400 rounded-2xl shadow-lg" />
          </div>
        ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
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
                    placeholder="Search by username, phone..."
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
                      setStartDate("");
                      setEndDate("");
                      setStatusFilter("all");
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#1f2937]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    User Name / Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Bank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Mobile Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Referred By
                  </th>
                  
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Wallet Agent
                    </th>
                  
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdraws.length ? (
                  withdraws.map((withdraw) => (
                    <tr key={withdraw._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#1f2937] text-white text-sm font-semibold rounded-lg">
                            {withdraw?.username?.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="text-[#1f2937] font-medium">{withdraw?.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {withdraw?.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1f2937]">
                        {formatCurrency(withdraw?.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {withdraw?.withdrawAccountNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {withdraw?.channel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {withdraw?.referralCode}
                      </td>
                      
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {withdraw?.walletAgentUsername || "N/A"}
                        </td>
                   
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(withdraw?.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(withdraw?.status)}`}>
                          <svg className="w-2 h-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          {withdraw?.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {withdraw?.status === "pending" && (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleApprove(withdraw._id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(withdraw._id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isAdminOrSuperAdmin ? "10" : "9"} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">No Data Found</p>
                        <p className="text-sm">There are no withdrawal requests matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#1f2937] text-white hover:bg-[#1f2937]/90"
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!withdraws.length}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  !withdraws.length
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#1f2937] text-white hover:bg-[#1f2937]/90"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllWithdraw;
