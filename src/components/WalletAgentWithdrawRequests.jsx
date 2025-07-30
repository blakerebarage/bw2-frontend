import { useSocket } from "@/contexts/SocketContext";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import useSoundNotification from "@/Hook/useSoundNotification";
import { FaArrowDown, FaCheck, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const WalletAgentWithdrawRequests = ({ 
  withdrawRequests = [], 
  withdrawNotificationCount = 0, 
  requestsLoading = false,
  onRequestAction 
}) => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  const { socket, isConnected } = useSocket();
  const { handleWithdrawEvent } = useSoundNotification();

  // Handle withdraw request actions
  const handleRequestAction = async (requestId, action) => {
    try {
      const res = await axiosSecure.patch(`/api/v1/finance/update-withdraw-request-status-by-wallet-agent/${requestId}`, {
        status: action === "approve" ? "approved" : "cancelled"
      });
      
      if (res.data.success) {
        // Play sound notification based on action
        if (action === "approve") {
          handleWithdrawEvent('withdraw_success', { requestId, action });
        } else {
          handleWithdrawEvent('withdraw_error', { requestId, action });
        }
        
        // Emit socket event to notify other users
        if (socket && isConnected) {
          socket.emit('request_status_updated', {
            requestId: requestId,
            status: action === "approve" ? "approved" : "cancelled",
            timestamp: new Date().toISOString()
          });
        }
        
        addToast(`Withdraw request ${action}ed successfully!`, {
          appearance: "success",
          autoDismiss: true,
        });
        // Call the parent callback to refresh data
        if (onRequestAction) {
          onRequestAction();
        }
      }
    } catch (error) {
      // Play error sound for failed actions
      handleWithdrawEvent('withdraw_error', { requestId, action });
      
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