import Loading from "@/components/shared/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDeposit: 0,
    totalWithdraw: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();

  // Check if user is admin (not regular user)
  const isAdminUser = user?.role && user.role !== "user";

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.username) return;

      try {
        setLoading(true);
        const response = await axiosSecure.get(
          `/api/v1/finance/all-transactions/${user.username}?page=${currentPage}&limit=${itemsPerPage}`
        );
        

        if (response.data.success) {
          // Filter transactions for last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const filteredTransactions = response.data.data.results.filter(
            (txn) => new Date(txn.createdAt) >= thirtyDaysAgo
          );

          setTransactions(filteredTransactions);
          setTotalPages(Math.ceil(response.data.data.totalItems / itemsPerPage));

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
        } else {
          setError(response.data.message || "Failed to fetch transactions");
          addToast(response.data.message || "Failed to fetch transactions", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      } catch (err) {
        setError("Failed to fetch transactions");
        addToast("Failed to fetch transactions", {
          appearance: "error",
          autoDismiss: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.username, axiosSecure, addToast, currentPage, isAdminUser]);

  const filteredTransactions = activeTab === "all" 
    ? transactions 
    : transactions.filter((txn) => 
        activeTab === "withdraw" 
          ? (txn.type === "withdraw" || txn.type === "transfer")
          : txn.type === activeTab
      );

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

  const TransactionCards = () => (
    <div className="space-y-3 sm:space-y-4">
      {filteredTransactions.length === 0 ? (
        <p className="text-center text-gray-300 py-8">{t('noTransactionsFound')}</p>
      ) : (
        filteredTransactions.map((txn) => (
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
        ))
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 mt-16">
      <Card className="w-full bg-[#1a1f24] rounded-lg shadow-xl border border-[#facc15]/20">
        <CardHeader className="border-b border-[#facc15]/20 p-4 sm:p-6">
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
        
        <CardContent className="p-4 sm:p-6">
          {/* Filter Tabs */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#1a1f24] border border-[#facc15]/20">
                <TabsTrigger 
                  value="all" 
                  className="text-xs sm:text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300 px-2 sm:px-3"
                >
                  {t('all')}
                </TabsTrigger>
                <TabsTrigger 
                  value="deposit" 
                  className="text-xs sm:text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300 px-2 sm:px-3"
                >
                  {t('deposits')}
                </TabsTrigger>
                <TabsTrigger 
                  value="withdraw" 
                  className="text-xs sm:text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300 px-2 sm:px-3"
                >
                  {t('withdrawals')}
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