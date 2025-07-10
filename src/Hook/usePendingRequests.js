import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useAxiosSecure from "./useAxiosSecure";

const usePendingRequests = () => {
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdraws, setPendingWithdraws] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);

  const fetchPendingRequests = useCallback(async () => {
    if (!user || user.role === "user") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch deposit requests
      const depositRes = await axiosSecure.get("/api/v1/finance/all-recharge-request?page=1&limit=100");
      if (depositRes.data.success) {
        let pendingDepositCount = 0;
        
        // Super admin sees all pending requests
        if (user.role === "super-admin") {
          pendingDepositCount = depositRes.data.data.results.filter(
            req => req.status === "pending"
          ).length;
        } 
        // Other roles only see their referrals' requests
        else {
          pendingDepositCount = depositRes.data.data.results.filter(
            req => req.status === "pending" && req?.referralCode === user?.referralCode
          ).length;
        }
        
        setPendingDeposits(pendingDepositCount);
      }

      // Fetch withdraw requests
      const withdrawRes = await axiosSecure.get("/api/v1/finance/all-withdraw-request?page=1&limit=100");
      if (withdrawRes.data.success) {
        let pendingWithdrawCount = 0;
        
        // Super admin sees all pending requests
        if (user.role === "super-admin") {
          pendingWithdrawCount = withdrawRes.data.data.results.filter(
            req => req.status === "pending"
          ).length;
        }
        // Other roles only see their referrals' requests
        else {
          pendingWithdrawCount = withdrawRes.data.data.results.filter(
            req => req.status === "pending" && req?.referralCode === user?.referralCode
          ).length;
        }
        
        setPendingWithdraws(pendingWithdrawCount);
      }
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError(err.message || "Failed to fetch pending requests");
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, user]);

  useEffect(() => {
    if (user && user.role !== "user") {
      fetchPendingRequests();
      // Refresh counts every 30 seconds
      const interval = setInterval(fetchPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchPendingRequests]);

  return {
    pendingDeposits,
    pendingWithdraws,
    loading,
    error,
    refetch: fetchPendingRequests
  };
};

export default usePendingRequests; 