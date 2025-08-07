import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { FaEdit, FaEye, FaList, FaPlus, FaTable, FaTimes, FaUniversity, FaWallet } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import Swal from "sweetalert2";
import BankModal from "./BankModal";

const WalletAgentPaymentMethods = () => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  
  // User banks states
  const [userBanks, setUserBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);

  // Bank Details states
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState("");
  const [bankTransactions, setBankTransactions] = useState([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState(null);
  const [bankCurrentPage, setBankCurrentPage] = useState(1);
  const [bankTotalPages, setBankTotalPages] = useState(1);
  const [bankViewMode, setBankViewMode] = useState("table");
  const [bankStartDate, setBankStartDate] = useState("");
  const [bankEndDate, setBankEndDate] = useState("");

  // Fetch user's banks
  const fetchUserBanks = useCallback(async () => {
    try {
      setBanksLoading(true);
      const params = new URLSearchParams({
        username: user?.username || '',
        limit: '50'
      });
      
      const res = await axiosSecure.get(`/api/v1/finance/bank-list?${params.toString()}`);
      
      if (res.data.success) {
        setUserBanks(res.data.data.results || []);
      } else {
        setUserBanks([]);
      }
    } catch (err) {
      console.error("Failed to fetch user banks:", err);
      setUserBanks([]);
    } finally {
      setBanksLoading(false);
    }
  }, [axiosSecure, user?.username]);

  // Fetch user banks when component mounts
  useEffect(() => {
    fetchUserBanks();
  }, [fetchUserBanks]);

  // Handle bank edit
  const handleEditBank = (bank) => {
    setEditingBank(bank);
    setShowBankModal(true);
  };

  // Handle bank update
  const handleBankUpdate = async (updatedBank) => {
    try {
      const res = await axiosSecure.patch(`/api/v1/finance/update-bank/${editingBank._id}`, updatedBank);
      
      if (res.data.success) {
        addToast("Bank updated successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
        setShowBankModal(false);
        setEditingBank(null);
        fetchUserBanks(); // Refresh the list
      }
    } catch (error) {
      addToast("Failed to update bank", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  // Handle bank delete
  const handleDeleteBank = (bankId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.delete(`/api/v1/finance/delete-bank/${bankId}`);
          if (res.data.success) {
            Swal.fire("Deleted!", "The bank has been deleted.", "success");
            fetchUserBanks(); // Refresh the list
          }
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the bank.", "error");
        }
      }
    });
  };

  // Handle bank status toggle
  const handleToggleStatus = async (bankId, currentStatus) => {
    try {
      const res = await axiosSecure.patch(`/api/v1/finance/update-bank/${bankId}`, {
        status: currentStatus === "active" ? "deactive" : "active",
      });
      if (res.data.success) {
        addToast(`Bank ${currentStatus === "active" ? "deactivated" : "activated"}!`, {
          appearance: "success",
          autoDismiss: true,
        });
        fetchUserBanks(); // Refresh the list
      }
    } catch (err) {
      addToast("Failed to update status.", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  // Bank Details Functions
  const handleShowBankDetails = (bank) => {
    setSelectedBankAccount(bank.accountNumber);
    setShowBankDetails(true);
    setBankCurrentPage(1);
    setBankStartDate("");
    setBankEndDate("");
    setBankError(null);
  };

  const fetchBankTransactions = async (accountNumber) => {
    try {
      setBankLoading(true);
      setBankError(null);
      
      // Validate date range if both dates are provided
      if (bankStartDate && bankEndDate && new Date(bankStartDate) > new Date(bankEndDate)) {
        throw new Error("Start date cannot be after end date");
      }

      let url = `/api/v1/finance/received-payments/${accountNumber}?page=${bankCurrentPage}&limit=10`;
      
      if (bankStartDate) {
        url += `&startDate=${bankStartDate}`;
      }
      if (bankEndDate) {
        url += `&endDate=${bankEndDate}`;
      }

      const response = await axiosSecure.get(url);
      
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch transactions");
      }

      setBankTransactions(response.data.data.results);
      setBankTotalPages(response.data.data.pageCount);
    } catch (error) {
      setBankError(error.message || "Failed to fetch transactions. Please try again later.");
      addToast(error.message || "Failed to fetch transactions. Please try again later.", {
        appearance: "error",
        autoDismiss: true,
      });
      setBankTransactions([]);
      setBankTotalPages(1);
    } finally {
      setBankLoading(false);
    }
  };

  const handleBankDateFilter = () => {
    if (bankStartDate && bankEndDate && new Date(bankStartDate) > new Date(bankEndDate)) {
      addToast("Start date cannot be after end date", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    setBankCurrentPage(1);
    if (selectedBankAccount) {
      fetchBankTransactions(selectedBankAccount);
    }
  };

  const clearBankDateFilter = () => {
    setBankStartDate("");
    setBankEndDate("");
    setBankCurrentPage(1);
    setBankError(null);
    if (selectedBankAccount) {
      fetchBankTransactions(selectedBankAccount);
    }
  };

  // Fetch bank transactions when selected account changes
  useEffect(() => {
    if (selectedBankAccount && showBankDetails) {
      fetchBankTransactions(selectedBankAccount);
    }
  }, [selectedBankAccount, bankCurrentPage, bankStartDate, bankEndDate, showBankDetails]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FaPlus className="text-blue-400 text-xl" />
        <h2 className="text-xl font-bold text-white">Add Payment Method</h2>
      </div>
      
      <div className="w-full">
        <button
          onClick={() => setShowBankModal(true)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
        >
          <FaPlus className="text-xl" />
          <span className="text-lg">Add New Payment Method</span>
        </button>
        
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <FaWallet className="text-yellow-400 text-2xl mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Mobile Banking</p>
            <p className="text-gray-400 text-xs">Bkash, Nagad, Rocket</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <FaUniversity className="text-blue-400 text-2xl mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Bank Transfer</p>
            <p className="text-gray-400 text-xs">All Banks</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <FaWallet className="text-green-400 text-2xl mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Digital Wallet</p>
            <p className="text-gray-400 text-xs">Upay, Tap, OkWallet</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <FaWallet className="text-orange-400 text-2xl mx-auto mb-2" />
            <p className="text-white text-sm font-medium">Crypto</p>
            <p className="text-gray-400 text-xs">Bitcoin, USDT</p>
          </div>
        </div>

        {/* User's Existing Banks */}
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <FaWallet className="text-green-400 text-xl" />
            <h3 className="text-lg font-bold text-white">Your Payment Methods</h3>
            {banksLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            )}
          </div>

          {banksLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : userBanks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userBanks.map((bank, index) => (
                <div key={bank._id || index} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        bank.bankType === "Bank Transfer" ? "bg-blue-500/20 text-blue-400" :
                        bank.bankType === "Bkash" ? "bg-green-500/20 text-green-400" :
                        bank.bankType === "Nagad" ? "bg-yellow-500/20 text-yellow-400" :
                        bank.bankType === "Rocket" ? "bg-purple-500/20 text-purple-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {bank.bankType === "Bank Transfer" ? <FaUniversity className="text-sm" /> : <FaWallet className="text-sm" />}
                      </div>
                      <span className="text-white font-medium text-sm">
                        {bank.bankType === "Bank Transfer" ? bank.bankName : bank.bankType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bank.status === "active" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {bank.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleShowBankDetails(bank)}
                          className="p-1 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded transition-colors"
                          title="Bank Details"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleEditBank(bank)}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
                          title="Edit"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDeleteBank(bank._id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                          title="Delete"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Account:</span>
                      <span className="text-white font-mono">{bank.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Channel:</span>
                      <span className="text-white">{bank.channel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Purpose:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        bank.purpose === "Deposit" ? "bg-green-500/20 text-green-400" :
                        bank.purpose === "Withdraw" ? "bg-red-500/20 text-red-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {bank.purpose}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Daily Limit:</span>
                      <span className="text-white">{formatCurrency(bank.dailyLimit || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Balance:</span>
                      <span className="text-white">{formatCurrency(bank.balance || 0)}</span>
                    </div>
                    {bank.bankType === "Bank Transfer" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Branch:</span>
                          <span className="text-white text-xs">{bank.branchName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Holder:</span>
                          <span className="text-white text-xs">{bank.accountHolderName}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <button
                      onClick={() => handleToggleStatus(bank._id, bank.status)}
                      className={`w-full text-xs py-1 px-2 rounded transition-colors  ${
                        bank.status === "active" 
                          ? "bg-red-500 text-white hover:bg-red-600" 
                          : "bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {bank.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaWallet className="text-gray-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-400">No payment methods added yet</p>
              <p className="text-gray-500 text-sm mt-2">Click "Add New Payment Method" to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Bank Modal */}
      {showBankModal && (
        <BankModal
          isOpen={showBankModal}
          onClose={() => {
            setShowBankModal(false);
            setEditingBank(null);
          }}
          editingBank={editingBank}
          onSubmit={editingBank ? handleBankUpdate : undefined}
          onSuccess={() => {
            fetchUserBanks();
            setShowBankModal(false);
            setEditingBank(null);
          }}
        />
      )}

             {/* Bank Details Modal */}
       {showBankDetails && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/20">
                           {/* Header */}
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-white/5 to-white/10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  
                                   <div className="flex flex-col lg:flex-row gap-4 min-w-0">
                    {/* Date Filter */}
                    <div className="flex flex-col sm:flex-row gap-3 min-w-0">
                      <div className="relative min-w-0">
                        <input
                          type="date"
                          value={bankStartDate}
                          onChange={(e) => setBankStartDate(e.target.value)}
                          className="w-full min-w-0 pl-4 pr-4 py-2.5 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-white/10 text-white placeholder-gray-400 shadow-sm hover:border-white/30 transition-colors"
                        />
                      </div>
                      <div className="relative min-w-0">
                        <input
                          type="date"
                          value={bankEndDate}
                          onChange={(e) => setBankEndDate(e.target.value)}
                          className="w-full min-w-0 pl-4 pr-4 py-2.5 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-white/10 text-white placeholder-gray-400 shadow-sm hover:border-white/30 transition-colors"
                        />
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={handleBankDateFilter}
                          className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                        >
                          <span>Filter</span>
                        </button>
                        <button
                          onClick={clearBankDateFilter}
                          className="px-6 py-2.5 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 whitespace-nowrap"
                        >
                          <span>Clear</span>
                        </button>
                      </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center flex-shrink-0">
                      <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/20">
                        <button
                          onClick={() => setBankViewMode("table")}
                          className={`p-2.5 rounded-lg transition-all duration-200 ${
                            bankViewMode === "table"
                              ? "bg-white/20 shadow-sm text-purple-300"
                              : "text-gray-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="Table View"
                        >
                          <FaTable className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setBankViewMode("list")}
                          className={`p-2.5 rounded-lg transition-all duration-200 ${
                            bankViewMode === "list"
                              ? "bg-white/20 shadow-sm text-purple-300"
                              : "text-gray-300 hover:text-white hover:bg-white/10"
                          }`}
                          title="List View"
                        >
                          <FaList className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Close Button */}
                    <button
                      onClick={() => setShowBankDetails(false)}
                      className="text-gray-300 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all duration-200 flex-shrink-0"
                    >
                      <FaTimes className="h-6 w-6" />
                    </button>
                  </div>
               </div>
             </div>

             {/* Content */}
             <div className="p-2 overflow-y-auto max-h-[60vh]">
               {bankLoading ? (
                 <div className="flex justify-center items-center py-12">
                   <div className="flex items-center gap-3 text-white">
                     <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                     <span>Loading transactions...</span>
                   </div>
                 </div>
               ) : bankError ? (
                 <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-red-300">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                       <FaTimes className="text-red-400" />
                     </div>
                     <div>
                       <h3 className="font-semibold text-red-300">Error</h3>
                       <p className="text-red-400 text-sm">{bankError}</p>
                     </div>
                   </div>
                 </div>
               ) : bankTransactions.length === 0 ? (
                 <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
                   <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <FaUniversity className="text-purple-400 text-2xl" />
                   </div>
                   <p className="text-white text-lg font-medium mb-2">No transactions found</p>
                   <p className="text-gray-400 text-sm">Try adjusting your filters or date range</p>
                 </div>
                               ) : bankViewMode === "table" ? (
                  <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-white/5">
                    <div className="min-w-[800px]">
                      <table className="w-full divide-y divide-white/10">
                        <thead className="bg-white/10">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[120px]">
                              Username
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[140px]">
                              Payment Method
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[140px]">
                              Account Number
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[100px]">
                              Channel
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[120px]">
                              Amount
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider min-w-[160px]">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/5 divide-y divide-white/10">
                          {bankTransactions.map((txn) => (
                            <tr key={txn._id} className="hover:bg-white/10 transition-colors duration-200">
                              <td className="px-6 py-4 whitespace-nowrap min-w-[120px]">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                    {txn.username.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="ml-3 text-sm font-medium text-white truncate">{txn.username}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap min-w-[140px]">
                                <span className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                                  {txn.paymentMethod}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-mono min-w-[140px]">
                                {txn.accountNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap min-w-[100px]">
                                <span className="px-3 py-1 text-sm rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  {txn.channel}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap min-w-[120px]">
                                <span className="text-sm font-semibold text-yellow-300">
                                  {formatCurrency(txn.amount)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 min-w-[160px]">
                                {moment(txn.date).format("MMM D, YYYY h:mm A")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
               ) : (
                 <div className="space-y-4">
                   {bankTransactions.map((txn) => (
                     <div
                       key={txn._id}
                       className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:border-white/20"
                     >
                       <div className="flex justify-between items-start">
                         <div className="flex items-start gap-4">
                           <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg">
                             {txn.username.charAt(0).toUpperCase()}
                           </div>
                           <div>
                             <div className="flex items-center gap-3 mb-2">
                               <h3 className="font-semibold text-white">{txn.paymentMethod}</h3>
                               <span className="px-3 py-1 text-sm rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                                 {txn.channel}
                               </span>
                             </div>
                             <div className="space-y-1">
                               <p className="text-sm text-gray-300">
                                 <span className="font-medium text-white">Username:</span> {txn.username}
                               </p>
                               <p className="text-sm text-gray-300">
                                 <span className="font-medium text-white">Account:</span> <span className="font-mono text-purple-300">{txn.accountNumber}</span>
                               </p>
                             </div>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-xl font-bold text-yellow-300 mb-1">{formatCurrency(txn.amount)}</p>
                           <p className="text-sm text-gray-400">{moment(txn.date).format("MMM D, YYYY h:mm A")}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>

             {/* Pagination */}
             {bankTotalPages > 1 && (
               <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                 <div className="flex items-center justify-between">
                   <div className="text-sm text-gray-300">
                     Showing page {bankCurrentPage} of {bankTotalPages}
                   </div>
                   <div className="flex gap-3">
                     <button
                       onClick={() => setBankCurrentPage((prev) => Math.max(prev - 1, 1))}
                       disabled={bankCurrentPage === 1}
                       className="px-5 py-2.5 border border-white/20 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                     >
                       Previous
                     </button>
                     <button
                       onClick={() => setBankCurrentPage((prev) => Math.min(prev + 1, bankTotalPages))}
                       disabled={bankCurrentPage === bankTotalPages}
                       className="px-5 py-2.5 border border-white/20 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                     >
                       Next
                     </button>
                   </div>
                 </div>
               </div>
             )}
           </div>
         </div>
       )}
    </div>
  );
};

export default WalletAgentPaymentMethods; 