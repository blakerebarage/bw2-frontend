import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { FaFileAlt, FaMoneyBillWave, FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { useLanguage } from "../../contexts/LanguageContext";
import useAxiosSecure from "../../Hook/useAxiosSecure";

const WithdrawRequests = () => {
  const { t } = useLanguage();
  const { addToast } = useToasts();
  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchWithdrawRequests();
  }, [currentPage, search]);

  const fetchWithdrawRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosSecure.get(`/api/v1/finance/all-withdraw-request-by-user?page=${currentPage}&search=${search}`);
      
      if (response.data.success) {
        setWithdrawRequests(response.data.data.results);
        setTotalPages(response.data.data.pageCount);
        setTotalItems(response.data.data.totalItems);
      } else {
        addToast(response.data.message || "Failed to fetch withdraw requests", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (error) {
      console.error("Error fetching withdraw requests:", error);
      addToast("Failed to fetch withdraw requests", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-400';
      case 'approved':
        return 'text-green-400';
      case 'rejected':
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBgColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500/20';
      case 'approved':
        return 'bg-green-500/20';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500/20';
      default:
        return 'bg-gray-500/20';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f24] to-[#0f1419] mt-20">
        <div className="px-4 py-6 max-w-lg mx-auto">
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#facc15]"></div>
              <p className="text-gray-400 mt-2">{t('loading') || 'Loading...'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f24] to-[#0f1419] mt-20">
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#facc15] flex items-center justify-center">
              <FaFileAlt className="text-2xl text-[#1a1f24]" />
            </div>
            <h1 className="text-lg font-medium text-gray-300 mb-2">{t('withdrawRequests') || 'Withdraw Requests'}</h1>
            <p className="text-sm text-gray-400">{t('viewYourWithdrawRequests') || 'View all your withdraw requests and their status'}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FaFileAlt className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xs text-gray-400 mb-1">{t('totalRequests') || 'Total'}</p>
              <p className="text-lg font-semibold text-white">{totalItems}</p>
            </div>
          </div>

          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <p className="text-xs text-gray-400 mb-1">{t('pendingRequests') || 'Pending'}</p>
              <p className="text-lg font-semibold text-yellow-400">
                {withdrawRequests.filter(req => req.status === 'pending').length}
              </p>
            </div>
          </div>

          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
            <div className="text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
              <p className="text-xs text-gray-400 mb-1">{t('approvedRequests') || 'Approved'}</p>
              <p className="text-lg font-semibold text-green-400">
                {withdrawRequests.filter(req => req.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('searchByPaymentMethod') || 'Search by payment method...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#22282e] border border-[#facc15]/20 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#facc15]/50 focus:border-[#facc15]/50"
            />
          </div>
        </div>

        {/* Withdraw Requests List */}
        {loading ? (
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#facc15]"></div>
              <p className="text-gray-400 mt-2">{t('loadingRequests') || 'Loading requests...'}</p>
            </div>
          </div>
        ) : withdrawRequests.length > 0 ? (
          <div className="space-y-3">
            {withdrawRequests.map((request) => (
              <div
                key={request._id}
                className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4"
              >
                {/* Request Info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#facc15]/20 flex items-center justify-center">
                      <FaMoneyBillWave className="w-4 h-4 text-[#facc15]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">
                        {request.paymentMethod || 'Payment Method'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">{t('status') || 'Status'}</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${getStatusBgColor(request.status)}`}>
                        <div className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                        </div>
                      </div>
                      <p className={`text-sm font-medium ${getStatusColor(request.status)}`}>
                        {request.status?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                      <FaMoneyBillWave className="w-3 h-3 text-blue-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400">{t('amount') || 'Amount'}</p>
                      <p className="text-sm font-semibold text-white truncate">
                        ৳{formatAmount(request.amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center">
                      <FaFileAlt className="w-3 h-3 text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400">{t('withdrawAccount') || 'Withdraw Account'}</p>
                      <p className="text-sm font-semibold text-white truncate">
                        {request.withdrawAccountNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('username') || 'Username'}:</span>
                    <span className="text-gray-300">{request.username || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('channel') || 'Channel'}:</span>
                    <span className="text-gray-300">{request.channel || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('referralCode') || 'Referral Code'}:</span>
                    <span className="text-gray-300">{request.referralCode || 'N/A'}</span>
                  </div>
                  {request.adminNote && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t('adminNote') || 'Admin Note'}:</span>
                      <span className="text-gray-300 max-w-xs truncate">{request.adminNote}</span>
                    </div>
                  )}
                </div>

                {/* Updated At Info */}
                <div className="mt-3 pt-2 border-t border-gray-700">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{t('updatedAt') || 'Updated At'}:</span>
                    <span className="text-gray-300">{formatDate(request.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-500/20 flex items-center justify-center">
                <FaFileAlt className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">{t('noWithdrawRequests') || 'No withdraw requests found'}</h3>
              <p className="text-gray-400">{t('noWithdrawRequestsDesc') || 'You haven\'t made any withdraw requests yet'}</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loading && withdrawRequests.length > 0 && totalPages > 1 && (
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#22282e] text-gray-300 rounded-lg border border-[#facc15]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a3138] transition-colors text-sm"
              >
                {t('previous') || 'Previous'}
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {t('page') || 'Page'} {currentPage} {t('of') || 'of'} {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#22282e] text-gray-300 rounded-lg border border-[#facc15]/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2a3138] transition-colors text-sm"
              >
                {t('next') || 'Next'}
              </button>
            </div>
            
            {totalPages > 2 && (
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => setCurrentPage(1)}
                  className="px-4 py-2 bg-[#facc15] text-[#1a1f24] rounded-lg hover:bg-[#e6b800] transition-colors font-medium text-sm"
                >
                  {t('firstPage') || 'First Page'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawRequests; 