import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useCallback, useEffect, useState } from "react";
import { FaEdit, FaPlus, FaTimes, FaUniversity, FaWallet } from "react-icons/fa";
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
    </div>
  );
};

export default WalletAgentPaymentMethods; 