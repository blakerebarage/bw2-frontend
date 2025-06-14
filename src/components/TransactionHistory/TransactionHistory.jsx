import Loading from "@/components/shared/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp, FaList, FaTable } from "react-icons/fa";
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
  const [viewMode, setViewMode] = useState("table");
  const itemsPerPage = 10;

  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const { formatCurrency } = useCurrency();

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

          // Calculate totals
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
  }, [user?.username, axiosSecure, addToast, currentPage]);

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

  const TransactionIcon = ({ type }) => (
    <div className={`p-2 rounded-full bg-[#facc15]/10 text-[#facc15]`}>
      {type === "deposit" ? <FaArrowUp /> : <FaArrowDown />}
    </div>
  );

  const TransactionAmount = ({ type, amount }) => (
    <p className={`font-medium text-[#facc15]`}>
      {type === "deposit" ? "+" : "-"}{formatCurrency(amount)}
    </p>
  );

  const ListView = () => (
    <div className="space-y-4">
      {filteredTransactions.map((txn) => (
        <div
          key={txn._id}
          className={`p-4 rounded-lg border bg-[#1a1f24] ${getStatusColor(txn.status)} hover:shadow-lg transition-all duration-300 group`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <TransactionIcon type={txn.type} />
              <div>
                <h3 className="text-lg font-semibold text-[#facc15] group-hover:text-[#facc15]/90">
                  {txn.type.toUpperCase()} Transaction
                </h3>
                <p className="text-sm text-gray-300">Ref: {txn.txnRef}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusTextColor(txn.status)}`}>
              {txn.status?.toUpperCase() || "PENDING"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-300">Amount</p>
                <TransactionAmount type={txn.type} amount={txn.amount} />
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-300">Balance</p>
                <p className="font-medium text-[#facc15]">
                  {formatCurrency(txn.balanceAfter)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#facc15]/20">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-300">
                {moment(txn.createdAt).format("MMM D, YYYY h:mm A")}
              </p>
              <p className="text-sm text-gray-300">
                {txn.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TableView = () => (
    <div className="space-y-4">
      {filteredTransactions.length === 0 ? (
        <p className="text-center text-gray-300 py-8">No transactions found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#facc15]/20">
            <thead className="bg-[#1a1f24]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#facc15] uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#facc15] uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#facc15] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#facc15] uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#facc15] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#facc15]/20">
              {filteredTransactions.map((txn) => (
                <tr key={txn._id} className="hover:bg-[#facc15]/5 transition-all duration-300">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <TransactionIcon type={txn.type} />
                      <div>
                        <p className="text-sm font-medium text-gray-300">{txn.description}</p>
                        <p className="text-xs text-gray-400">Ref: {txn.txnRef}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {moment(txn.createdAt).format("MMM D, YYYY h:mm A")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TransactionAmount type={txn.type} amount={txn.amount} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#facc15]">
                    {formatCurrency(txn.balanceAfter)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusTextColor(txn.status)}`}>
                      {txn.status?.toUpperCase() || "PENDING"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <div className="container mx-auto p-4 mt-16">
      <Card className="w-full bg-[#1a1f24] rounded-lg shadow-xl border border-[#facc15]/20">
        <CardHeader className="border-b border-[#facc15]/20">
          <CardTitle className="text-2xl font-bold text-[#facc15] text-center">
            Transaction History
          </CardTitle>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-[#1a1f24] p-4 rounded-lg border border-[#facc15] hover:border-[#facc15]/80 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <FaArrowUp className="text-[#facc15]" />
                <h3 className="text-sm font-medium text-gray-300">Total Deposit (30 days)</h3>
              </div>
              <p className="text-2xl font-bold text-[#facc15]">{formatCurrency(stats.totalDeposit)}</p>
            </div>
            <div className="bg-[#1a1f24] p-4 rounded-lg border border-[#facc15] hover:border-[#facc15]/80 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <FaArrowDown className="text-[#facc15]" />
                <h3 className="text-sm font-medium text-gray-300">Total Withdraw (30 days)</h3>
              </div>
              <p className="text-2xl font-bold text-[#facc15]">{formatCurrency(stats.totalWithdraw)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-[#1a1f24] border border-[#facc15]/20">
                <TabsTrigger 
                  value="all" 
                  className="text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="deposit" 
                  className="text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300"
                >
                  Deposits
                </TabsTrigger>
                <TabsTrigger 
                  value="withdraw" 
                  className="text-sm font-medium data-[state=active]:bg-[#facc15] data-[state=active]:text-[#1a1f24] text-gray-300 hover:bg-[#facc15]/10 transition-all duration-300"
                >
                  Withdrawals
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2 bg-[#1a1f24] p-1 rounded-lg border border-[#facc15]/20">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-md transition-all duration-300 ${
                  viewMode === "table"
                    ? "bg-[#facc15] text-[#1a1f24]"
                    : "text-gray-300 hover:bg-[#facc15]/10"
                }`}
                title="Table View"
              >
                <FaTable className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all duration-300 ${
                  viewMode === "list"
                    ? "bg-[#facc15] text-[#1a1f24]"
                    : "text-gray-300 hover:bg-[#facc15]/10"
                }`}
                title="List View"
              >
                <FaList className="w-5 h-5" />
              </button>
            </div>
          </div>

          {viewMode === "table" ? <TableView /> : <ListView />}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  currentPage === 1
                    ? "bg-[#1a1f24] text-gray-500 cursor-not-allowed"
                    : "bg-[#1a1f24] text-[#facc15] border border-[#facc15] hover:bg-[#facc15]/10"
                }`}
              >
                Previous
              </button>
              <span className="text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                  currentPage === totalPages
                    ? "bg-[#1a1f24] text-gray-500 cursor-not-allowed"
                    : "bg-[#1a1f24] text-[#facc15] border border-[#facc15] hover:bg-[#facc15]/10"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionHistory; 