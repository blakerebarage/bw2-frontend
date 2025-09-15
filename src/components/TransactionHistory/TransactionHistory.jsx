import Loading from "@/components/shared/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaFileAlt, FaMoneyBillWave, FaSearch } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [depositRequests, setDepositRequests] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDeposit: 0,
    totalWithdraw: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const itemsPerPage = 10;
  
  // Separate pagination states for different data types
  const [transactionsTotalPages, setTransactionsTotalPages] = useState(1);
  const [depositRequestsTotalPages, setDepositRequestsTotalPages] = useState(1);
  const [withdrawRequestsTotalPages, setWithdrawRequestsTotalPages] = useState(1);

  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();

  // Check if user is admin (not regular user)
  const isAdminUser = user?.role && user.role !== "user";

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.username) return;

      try {
        setLoading(true);
        
        // Fetch data based on active tab
        if (activeTab === "deposit-requests") {
          const response = await axiosSecure.get(`/api/v1/finance/all-recharge-request-by-user?page=${currentPage}&limit=${itemsPerPage}&search=${search}&t=${Date.now()}`);
          if (response.data.success) {
            setDepositRequests(response.data.data.results);
            setDepositRequestsTotalPages(response.data.data.pageCount);
          }
        } else if (activeTab === "withdraw-requests") {
          const response = await axiosSecure.get(`/api/v1/finance/all-withdraw-request-by-user?page=${currentPage}&limit=${itemsPerPage}&search=${search}`);
          if (response.data.success) {
            setWithdrawRequests(response.data.data.results);
            setWithdrawRequestsTotalPages(response.data.data.pageCount);
          }
        } else {
          // For transactions (all, deposit, withdraw tabs)
          const response = await axiosSecure.get(`/api/v1/finance/all-transactions/${user.username}?page=${currentPage}&limit=${itemsPerPage}&t=${Date.now()}`);
        if (response.data.success) {
            // Show all transactions (30-day filter disabled)
            const filteredTransactions = response.data.data.results;

          setTransactions(filteredTransactions);
            setTransactionsTotalPages(response.data.data.pageCount);

          // Calculate totals (only for admin users)
          if (isAdminUser) {
            const totals = filteredTransactions.reduce(
              (acc, txn) => {
                if (txn.type === "deposit") {
                  acc.totalDeposit += txn.amount;
                } else if (txn.type === "withdraw" || txn.type === "transfer") {
                  acc.totalWithdraw += txn.amount;
                }
                return acc;
              },
              { totalDeposit: 0, totalWithdraw: 0 }
            );
            setStats(totals);
          }
          }
        }

      } catch (err) {
        setError("Failed to fetch data");
        addToast("Failed to fetch data", {
          appearance: "error",
          autoDismiss: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.username, axiosSecure, addToast, currentPage, isAdminUser, search, activeTab]);

  // Helper functions for request data
  const getRequestStatusColor = (status) => {
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

  const getRequestStatusIcon = (status) => {
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

  const getRequestStatusBgColor = (status) => {
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

  // Get filtered data based on active tab
  const getFilteredData = () => {
    switch (activeTab) {
      case "deposit-requests":
        return depositRequests;
      case "withdraw-requests":
        return withdrawRequests;
      case "deposit":
        return transactions.filter(txn => txn.type === "deposit");
      case "withdraw":
        return transactions.filter(txn => txn.type === "withdraw" || txn.type === "transfer");
      default:
        return transactions;
    }
  };

  // Get total pages based on active tab
  const getTotalPages = () => {
    switch (activeTab) {
      case "deposit-requests":
        return depositRequestsTotalPages;
      case "withdraw-requests":
        return withdrawRequestsTotalPages;
      default:
        return transactionsTotalPages;
    }
  };

  const filteredData = getFilteredData();
  const totalPages = getTotalPages();


  // Reset page when switching tabs
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1); // Reset to first page when switching tabs
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "rejected":
      case "cancelled":
        return "border-red-500 hover:border-red-500/80";
      case "completed":
        return "border-[#facc15] hover:border-[#facc15]/80";
      case "pending":
        return "border-yellow-500 hover:border-yellow-500/80";
      default:
        return "border-[#facc15] hover:border-[#facc15]/80";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case "rejected":
      case "cancelled":
        return "bg-red-500 text-white";
      case "completed":
        return "bg-[#facc15] text-[#1a1f24]";
      case "pending":
        return "bg-yellow-500 text-[#1a1f24]";
      default:
        return "bg-[#facc15] text-[#1a1f24]";
    }
  };

  const getTransactionTypeName = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return t('depositTransaction');
      case "withdraw":
        return t('withdrawTransaction');
      case "transfer":
        return t('transferTransaction');
      default:
        return type?.toUpperCase() + " Transaction";
    }
  };

  const getStatusName = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return t('pending');
      case "completed":
        return t('completed');
      case "rejected":
        return t('rejected');
      case "cancelled":
        return t('cancelled');
      default:
        return status?.toUpperCase() || t('pending');
    }
  };

  const TransactionIcon = ({ type }) => (
    <div className={`p-2 rounded-full bg-[#facc15]/10 text-[#facc15]`}>
      {type === "deposit" ? <FaArrowUp /> : <FaArrowDown />}
    </div>
  );

  const TransactionAmount = ({ type, amount }) => (
    <p className={`font-medium text-[#facc15] text-sm sm:text-base break-words`}>
      {type === "deposit" ? "+" : "-"}{formatCurrency(amount)}
    </p>
  );

  const renderTransactionCard = (txn) => (
          <div
            key={txn._id}
            className={`p-3 sm:p-4 rounded-lg border bg-[#1a1f24] ${getStatusColor(txn.status)} hover:shadow-lg transition-all duration-300 group`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <TransactionIcon type={txn.type} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-lg font-semibold text-[#facc15] group-hover:text-[#facc15]/90 truncate">
                    {getTransactionTypeName(txn.type)}
                  </h3>
                </div>
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusTextColor(txn.status)} flex-shrink-0 ml-2`}>
                {getStatusName(txn.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <div>
                  <p className="text-xs sm:text-sm text-gray-300">{t('amount')}</p>
                  <TransactionAmount type={txn.type} amount={txn.amount} />
                </div>
              </div>
              <div className="space-y-1 sm:space-y-2">
                <div>
                  <p className="text-xs sm:text-sm text-gray-300">{t('balance')}</p>
                  <p className="font-medium text-[#facc15] text-sm sm:text-base break-words">
                    {formatCurrency(txn.balanceAfter)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#facc15]/20">
              <div className="flex justify-center">
                <p className="text-xs sm:text-sm text-gray-300 text-center">
                  {moment(txn.createdAt).format("MMM D, YYYY h:mm A")}
                </p>
              </div>
            </div>
          </div>
  );

  const renderDepositRequestCard = (request) => (
    <div
      key={request._id}
      className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4 hover:shadow-lg transition-all duration-300"
    >
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
            <div className={`w-4 h-4 rounded flex items-center justify-center ${getRequestStatusBgColor(request.status)}`}>
              <div className={getRequestStatusColor(request.status)}>
                {getRequestStatusIcon(request.status)}
              </div>
            </div>
            <p className={`text-sm font-medium ${getRequestStatusColor(request.status)}`}>
              {request.status?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

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
            <p className="text-xs text-gray-400">{t('transactionId') || 'Transaction ID'}</p>
            <p className="text-sm font-semibold text-white truncate">
              {request.txnId?.[0] || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-400">{t('senderPhone') || 'Sender Phone'}:</span>
          <span className="text-gray-300">{request.senderPhone || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{t('channel') || 'Channel'}:</span>
          <span className="text-gray-300">{request.channel || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">{t('accountNumber') || 'Account Number'}:</span>
          <span className="text-gray-300">{request.accountNumber || 'N/A'}</span>
        </div>
        {request.adminNote && (
          <div className="flex justify-between">
            <span className="text-gray-400">{t('adminNote') || 'Admin Note'}:</span>
            <span className="text-gray-300 max-w-xs truncate">{request.adminNote}</span>
          </div>
        )}
      </div>

      {request.note && (
        <div className="mt-3 p-3 bg-[#22282e] rounded-lg border border-[#facc15]/20">
          <p className="text-xs text-gray-300">
            <span className="font-medium text-gray-400">{t('note') || 'Note'}:</span> {request.note}
          </p>
        </div>
      )}
    </div>
  );

  const renderWithdrawRequestCard = (request) => (
    <div
      key={request._id}
      className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4 hover:shadow-lg transition-all duration-300"
    >
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
            <div className={`w-4 h-4 rounded flex items-center justify-center ${getRequestStatusBgColor(request.status)}`}>
              <div className={getRequestStatusColor(request.status)}>
                {getRequestStatusIcon(request.status)}
              </div>
            </div>
            <p className={`text-sm font-medium ${getRequestStatusColor(request.status)}`}>
              {request.status?.toUpperCase()}
            </p>
          </div>
        </div>
      </div>

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

      <div className="mt-3 pt-2 border-t border-gray-700">
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">{t('updatedAt') || 'Updated At'}:</span>
          <span className="text-gray-300">{formatDate(request.updatedAt)}</span>
        </div>
      </div>
    </div>
  );

  const TransactionCards = () => (
    <div className="space-y-3 sm:space-y-4" key={`${activeTab}-${currentPage}-${filteredData.length}`}>
      {filteredData.length === 0 ? (
        <p className="text-center text-gray-300 py-8">{t('noTransactionsFound')}</p>
      ) : (
        filteredData.map((item, index) => {
          if (activeTab === "deposit-requests") {
            return renderDepositRequestCard(item);
          } else if (activeTab === "withdraw-requests") {
            return renderWithdrawRequestCard(item);
          } else {
            return renderTransactionCard(item);
          }
        })
      )}
    </div>
  );

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 py-4 mt-16">
      <Card className="w-full bg-[#1a1f24] rounded-lg shadow-xl border border-[#facc15]/20">
        <CardHeader className="border-b border-[#facc15]/20 p-2">
          <CardTitle className="text-xl sm:text-2xl font-bold text-[#facc15] text-center">
            {t('transactionHistory')}
          </CardTitle>
          
          {/* Summary Cards - Only show for admin users */}
          {isAdminUser && (
            <div className="grid grid-cols-1  gap-3 sm:gap-4 mt-4">
              <div className="bg-[#1a1f24] p-3 sm:p-4 rounded-lg border border-[#facc15] hover:border-[#facc15]/80 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <FaArrowUp className="text-[#facc15] flex-shrink-0" />
                  <h3 className="text-xs sm:text-sm font-medium text-gray-300 truncate">{t('totalDeposit30Days')}</h3>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-[#facc15] break-words">{formatCurrency(stats.totalDeposit)}</p>
              </div>
              <div className="bg-[#1a1f24] p-3 sm:p-4 rounded-lg border border-[#facc15] hover:border-[#facc15]/80 transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <FaArrowDown className="text-[#facc15] flex-shrink-0" />
                  <h3 className="text-xs sm:text-sm font-medium text-gray-300 truncate">{t('totalWithdraw30Days')}</h3>
                </div>
                <p className="text-lg sm:text-2xl font-bold text-[#facc15] break-words">{formatCurrency(stats.totalWithdraw)}</p>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-2">
          {/* Search Bar */}
          <div className="mb-4 sm:mb-6">
            <div className="relative max-w-md mx-auto">
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

          {/* Filter Tabs - Vertical Layout */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="w-full max-w-md">
              <TabsList className="grid grid-cols-1 gap-2 w-full bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="all" 
                  className="text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300 px-4 py-3 rounded-md bg-[#1a1f24] border border-[#facc15]/20 justify-start"
                >
                  {t('all')}
                </TabsTrigger>
                <TabsTrigger 
                  value="deposit" 
                  className="text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300 px-4 py-3 rounded-md bg-[#1a1f24] border border-[#facc15]/20 justify-start"
                >
                  {t('deposits')}
                </TabsTrigger>
                <TabsTrigger 
                  value="withdraw" 
                  className="text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300 px-4 py-3 rounded-md bg-[#1a1f24] border border-[#facc15]/20 justify-start"
                >
                  {t('withdrawals')}
                </TabsTrigger>
                <TabsTrigger 
                  value="deposit-requests" 
                  className="text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300 px-4 py-3 rounded-md bg-[#1a1f24] border border-[#facc15]/20 justify-start"
                >
                  {t('depositRequests') || 'Deposit Requests'}
                </TabsTrigger>
                <TabsTrigger 
                  value="withdraw-requests" 
                  className="text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300 px-4 py-3 rounded-md bg-[#1a1f24] border border-[#facc15]/20 justify-start"
                >
                  {t('withdrawRequests') || 'Withdraw Requests'}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Transaction Cards */}
          <TransactionCards />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                  currentPage === 1
                    ? "bg-[#1a1f24] text-gray-500 cursor-not-allowed"
                    : "bg-[#1a1f24] text-[#facc15] border border-[#facc15] hover:bg-[#facc15]/10"
                }`}
              >
                {t('previous')}
              </button>
              <span className="text-gray-300 text-xs sm:text-sm text-center">
                {t('pageOf')} {currentPage} {t('of')} {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300 ${
                  currentPage === totalPages
                    ? "bg-[#1a1f24] text-gray-500 cursor-not-allowed"
                    : "bg-[#1a1f24] text-[#facc15] border border-[#facc15] hover:bg-[#facc15]/10"
                }`}
              >
                {t('next')}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory; 