import { useSocket } from "@/contexts/SocketContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import useAxiosSecure from "./useAxiosSecure";

const usePendingRequests = () => {
  const { user } = useSelector((state) => state.auth);
  const { socket, isConnected } = useSocket();
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdraws, setPendingWithdraws] = useState(0);
  const listenersSetupRef = useRef(false);
  const axiosSecure = useAxiosSecure();

  const fetchPendingRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      // For admin/super-admin, fetch all pending requests without any filters
      if (user.role === "super-admin" || user.role === "admin") {
        // Fetch deposit requests
        const depositResponse = await axiosSecure.get('/api/v1/finance/all-recharge-request');
        console.log(depositResponse.data);
        if (depositResponse.data.success) {
          setPendingDeposits(depositResponse.data.data.pendingRequests || 0);
        }

        // Fetch withdraw requests
        const withdrawResponse = await axiosSecure.get('/api/v1/finance/all-withdraw-request');
        
        if (withdrawResponse.data.success) {
          setPendingWithdraws(withdrawResponse.data.data.pendingRequests || 0);
        }
      } else if (user.role === "wallet-agent") {
        // For wallet agent, fetch requests filtered by walletAgentUsername
        const depositResponse = await axiosSecure.get(`/api/v1/finance/all-recharge-request?walletAgentUsername=${user.username}`);
        
        if (depositResponse.data.success) {
          setPendingDeposits(depositResponse.data.data.pendingRequests || 0);
        }

        const withdrawResponse = await axiosSecure.get(`/api/v1/finance/all-withdraw-request?walletAgentUsername=${user.username}`);
        
        if (withdrawResponse.data.success) {
          setPendingWithdraws(withdrawResponse.data.data.pendingRequests || 0);
        }
      } else if (user.referralCode) {
        // For upline users, fetch requests filtered by referral code (from their downline)
        const depositResponse = await axiosSecure.get(`/api/v1/finance/all-recharge-request?referralCode=${user.referralCode}`);
        
        if (depositResponse.data.success) {
          setPendingDeposits(depositResponse.data.data.pendingRequests || 0);
        }

        const withdrawResponse = await axiosSecure.get(`/api/v1/finance/all-withdraw-request?referralCode=${user.referralCode}`);
        
        if (withdrawResponse.data.success) {
          setPendingWithdraws(withdrawResponse.data.data.pendingRequests || 0);
        }
      }
    } catch (error) {
      // Only log if it's not a network error (which we expect if API is down)
      if (!error.message.includes('Network Error')) {
        console.error("Error fetching pending requests:", error);
      }
    }
  }, [user?.role, user?.referralCode, user?.username, axiosSecure]);

  // Memoize socket event handlers to prevent re-creation on every render
  const handleRechargeRequestUpdate = useMemo(() => (payload) => {
    if (!user) return;
    
    // Handle the actual backend payload structure: { timestamp, data: rechargeData }
    if (payload && payload.data && Array.isArray(payload.data)) {
      let filteredResults = payload.data;
      
      // For admin/super-admin, show all pending requests
      if (user.role === "super-admin" || user.role === "admin") {
        setPendingDeposits(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.role === "wallet-agent") {
        // For wallet agent, filter by walletAgentUsername
        filteredResults = filteredResults.filter(req => req.walletAgentUsername === user.username);
        setPendingDeposits(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.referralCode) {
        // For other users, filter by referral code
        filteredResults = filteredResults.filter(req => req.referralCode === user.referralCode);
        setPendingDeposits(filteredResults.filter(req => req.status === 'pending').length);
      }
    } else if (payload && payload.data && payload.data.results && Array.isArray(payload.data.results)) {
      // Handle paginated response structure: { data: { results: [...], pageCount: 1, pendingRequests: 1 } }
      let filteredResults = payload.data.results;
      
      if (user.role === "super-admin" || user.role === "admin") {
        setPendingDeposits(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.role === "wallet-agent") {
        filteredResults = filteredResults.filter(req => req.walletAgentUsername === user.username);
        setPendingDeposits(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.referralCode) {
        filteredResults = filteredResults.filter(req => req.referralCode === user.referralCode);
        setPendingDeposits(filteredResults.filter(req => req.status === 'pending').length);
      }
    } else if (payload && payload.data && payload.data.data && payload.data.data.results && Array.isArray(payload.data.data.results)) {
      // Handle double-nested response structure: { data: { data: { results: [...], pageCount: 1, pendingRequests: 1 } } }
      let filteredResults = payload.data.data.results;
      
      if (user.role === "super-admin" || user.role === "admin") {
        setPendingDeposits(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.role === "wallet-agent") {
        filteredResults = filteredResults.filter(req => req.walletAgentUsername === user.username);
        setPendingDeposits(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.referralCode) {
        filteredResults = filteredResults.filter(req => req.referralCode === user.referralCode);
        setPendingDeposits(filteredResults.filter(req => req.status === 'pending').length);
      }
    }
  }, [user?.role, user?.referralCode, user?.username]);

  const handleWithdrawRequestUpdate = useMemo(() => (payload) => {
    if (!user) return;
    
    // Handle withdraw request updates similar to recharge requests
    if (payload && payload.data && Array.isArray(payload.data)) {
      let filteredResults = payload.data;
      
      if (user.role === "super-admin" || user.role === "admin") {
        setPendingWithdraws(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.role === "wallet-agent") {
        filteredResults = filteredResults.filter(req => req.walletAgentUsername === user.username);
        setPendingWithdraws(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.referralCode) {
        filteredResults = filteredResults.filter(req => req.referralCode === user.referralCode);
        setPendingWithdraws(filteredResults.filter(req => req.status === 'pending').length);
      }
    } else if (payload && payload.data && payload.data.results && Array.isArray(payload.data.results)) {
      let filteredResults = payload.data.results;
      
      if (user.role === "super-admin" || user.role === "admin") {
        setPendingWithdraws(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.role === "wallet-agent") {
        filteredResults = filteredResults.filter(req => req.walletAgentUsername === user.username);
        setPendingWithdraws(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.referralCode) {
        filteredResults = filteredResults.filter(req => req.referralCode === user.referralCode);
        setPendingWithdraws(filteredResults.filter(req => req.status === 'pending').length);
      }
    } else if (payload && payload.data && payload.data.data && payload.data.data.results && Array.isArray(payload.data.data.results)) {
      let filteredResults = payload.data.data.results;
      
      if (user.role === "super-admin" || user.role === "admin") {
        setPendingWithdraws(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.role === "wallet-agent") {
        filteredResults = filteredResults.filter(req => req.walletAgentUsername === user.username);
        setPendingWithdraws(filteredResults.filter(req => req.status === 'pending').length);
      } else if (user.referralCode) {
        filteredResults = filteredResults.filter(req => req.referralCode === user.referralCode);
        setPendingWithdraws(filteredResults.filter(req => req.status === 'pending').length);
      }
    }
  }, [user?.role, user?.referralCode, user?.username]);

  // Handle request status updates (when requests are approved/rejected)
  const handleRequestStatusUpdate = useMemo(() => (payload) => {
    if (!user || !payload || !payload.requestId || !payload.status) return;
    
    // When a request status changes, we need to refetch the counts
    // This ensures all users (admin, wallet agent, etc.) get updated counts
    fetchPendingRequests();
  }, [user, fetchPendingRequests]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !isConnected || !user || listenersSetupRef.current) {
      return;
    }

    listenersSetupRef.current = true;

    socket.on('recharge_request_update', handleRechargeRequestUpdate);
    socket.on('withdraw_request_update', handleWithdrawRequestUpdate);
    socket.on('request_status_updated', handleRequestStatusUpdate);

    return () => {
      socket.off('recharge_request_update', handleRechargeRequestUpdate);
      socket.off('withdraw_request_update', handleWithdrawRequestUpdate);
      socket.off('request_status_updated', handleRequestStatusUpdate);
      listenersSetupRef.current = false;
    };
  }, [socket, isConnected, user, handleRechargeRequestUpdate, handleWithdrawRequestUpdate, handleRequestStatusUpdate]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchPendingRequests();
    }
  }, [user, fetchPendingRequests]);

  return {
    pendingDeposits,
    pendingWithdraws,
    socket,
    isConnected,
    fetchPendingRequests
  };
};

export default usePendingRequests; 