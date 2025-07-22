import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useCallback, useEffect, useState } from "react";
import { FaArrowDown, FaCheck, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const WalletAgentWithdrawRequests = () => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [withdrawNotificationCount, setWithdrawNotificationCount] = useState(0);
  const [requestsLoading, setRequestsLoading] = useState(false);

  // Fetch withdraw requests
  const fetchWithdrawRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      
      const withdrawRes = await axiosSecure.get(`/api/v1/finance/all-withdraw-request?walletAgentUsername=${user?.username}`);
      if (withdrawRes.data.success) {
        const withdrawData = withdrawRes.data.data?.results || withdrawRes.data.data || [];
        setWithdrawRequests(withdrawData);
        setWithdrawNotificationCount(withdrawData.filter(req => req.status === "pending")?.length || 0);
      }
    } catch (error) {
      console.error("Failed to fetch withdraw requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  }, [axiosSecure, user?.username]);

  // Fetch requests on component mount and set up interval
  useEffect(() => {
    fetchWithdrawRequests();
    
    // Refresh requests every 30 seconds
    const interval = setInterval(fetchWithdrawRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchWithdrawRequests]);

  // Handle withdraw request actions
  const handleRequestAction = async (requestId, action) => {
    try {
      const res = await axiosSecure.patch(`/api/v1/finance/update-withdraw-request-status-by-wallet-agent/${requestId}`, {
        status: action === "approve" ? "approved" : "cancelled"
      });
      
      if (res.data.success) {
        addToast(`Withdraw request ${action}ed successfully!`, {
          appearance: "success",
          autoDismiss: true,
        });
        fetchWithdrawRequests(); // Refresh requests
      }
    } catch (error) {
      addToast(`Failed to ${action} withdraw request`, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FaArrowDown className="text-red-400 text-xl" />
        <h2 className="text-xl font-bold text-white">Withdraw Requests</h2>
        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
          {withdrawRequests.length} total
        </span>
        <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">
          {withdrawNotificationCount} pending
        </span>
      </div>

      {requestsLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : withdrawRequests.length > 0 ? (
        <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
          {withdrawRequests.map((request, index) => (
            <div key={request._id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="font-medium text-white">#{index + 1} {request.username}</span>
                    <span className="text-red-400 font-bold">{formatCurrency(request.amount)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    <p>Method: {request.paymentMethod} | Channel: {request.channel}</p>
                    <p>Account: {request.accountNumber} | Agent: {request.walletAgentUsername || 'N/A'}</p>
                    <p>Date: {new Date(request.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequestAction(request._id, 'approve')}
                      className="flex items-center gap-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      <FaCheck className="text-sm" />
                      <span className="text-sm">Approve</span>
                    </button>
                    <button
                      onClick={() => handleRequestAction(request._id, 'reject')}
                      className="flex items-center gap-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <FaTimes className="text-sm" />
                      <span className="text-sm">Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FaArrowDown className="text-gray-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-400">No withdraw requests found</p>
        </div>
      )}
    </div>
  );
};

export default WalletAgentWithdrawRequests; 