import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useAxiosSecure from "./useAxiosSecure";

const usePendingRequests = () => {
  const [pendingDeposits, setPendingDeposits] = useState(0);
  const [pendingWithdraws, setPendingWithdraws] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      if(user?.role === "user") return;
      // Fetch deposit requests
      const depositRes = await axiosSecure.get("/api/v1/finance/all-recharge-request?page=1&limit=100");
      if (depositRes.data.success) {
        let pendingDepositCount = 0;
      // Other roles only see their referrals' requests
          pendingDepositCount = depositRes.data.data.results.filter(
            (req) => req.status === "pending" && req?.referralCode === user?.referralCode
          ).length;
        
        setPendingDeposits(pendingDepositCount);
      }

      // Fetch withdraw requests
      const withdrawRes = await axiosSecure.get("/api/v1/finance/all-withdraw-request?page=1&limit=100");
      if (withdrawRes.data.success) {
        let pendingWithdrawCount = 0;
        // Other roles only see their referrals' requests
          pendingWithdrawCount = withdrawRes.data.data.results.filter(
            (req) => req.status === "pending" && req?.referralCode === user?.referralCode
          ).length;
        setPendingWithdraws(pendingWithdrawCount);
      }
    } catch (err) {
     
      setError(err.message || "Failed to fetch pending requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPendingRequests();
      // Refresh counts every minute
      const interval = setInterval(fetchPendingRequests, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    pendingDeposits,
    pendingWithdraws,
    loading,
    error,
    refetch: fetchPendingRequests
  };
};

export default usePendingRequests; 