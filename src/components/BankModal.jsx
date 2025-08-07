import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useEffect, useState } from "react";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import Swal from "sweetalert2";

const BankModal = ({ isOpen, onClose, editingBank, onSubmit, onSuccess }) => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const axiosSecure = useAxiosSecure();
  
  // Form states
  const [bankType, setBankType] = useState("");
  const [channel, setChannel] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [dailyLimit, setDailyLimit] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or editing bank changes
  useEffect(() => {
    if (isOpen) {
      if (editingBank) {
        // Pre-fill form for editing
        setBankType(editingBank.bankType);
        setChannel(editingBank.channel);
        setAccountNumber(editingBank.accountNumber);
        setDailyLimit(editingBank.dailyLimit || "");
        setPurpose(editingBank.purpose || "");
        setBankName(editingBank.bankName || "");
        setBranchName(editingBank.branchName || "");
        setAccountHolderName(editingBank.accountHolderName || "");
        setDistrictName(editingBank.districtName || "");
        setRoutingNumber(editingBank.routingNumber || "");
        setBalance(editingBank.balance || "");
      } else {
        // Reset form for adding new
        resetForm();
      }
    }
  }, [isOpen, editingBank]);

  const resetForm = () => {
    setBankType("");
    setChannel("");
    setAccountNumber("");
    setDailyLimit("");
    setPurpose("");
    setBankName("");
    setBranchName("");
    setAccountHolderName("");
    setDistrictName("");
    setRoutingNumber("");
    setBalance("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bankType === "Bank") {
      if (!bankName || !branchName || !accountNumber || !accountHolderName || !districtName || !routingNumber || !purpose) {
        addToast("All bank fields are required!", {
          appearance: "error",
          autoDismiss: true,
        });
        return;
      }
    } else {
      if (!bankType || !channel || !accountNumber || !purpose) {
        addToast("All fields are required!", {
          appearance: "error",
          autoDismiss: true,
        });
        return;
      }
    }

    // Validate balance (optional field but should be a valid number if provided)
    if (balance && isNaN(Number(balance))) {
      addToast("Balance must be a valid number!", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    const newBank = bankType === "Bank" ? {
      username: user?.username,
      bankType,
      bankName,
      branchName,
      accountNumber,
      accountHolderName,
      districtName,
      routingNumber,
      channel: "Bank-Transfer",
      dailyLimit: dailyLimit || "0",
      balance: balance || "0",
      purpose,
      isWalletAgent: true
    } : {
      username: user?.username,
      bankType,
      channel,
      accountNumber,
      dailyLimit: dailyLimit || "0",
      balance: balance || "0",
      purpose,
      isWalletAgent: true
    };

    try {
      setLoading(true);
      
      if (editingBank) {
        // Update existing bank
        if (onSubmit) {
          await onSubmit(newBank);
        } else {
          const res = await axiosSecure.patch(`/api/v1/finance/update-bank/${editingBank._id}`, newBank);
          if (res.data.success) {
            Swal.fire({
              title: "Success!",
              text: "Bank updated successfully.",
              icon: "success",
              confirmButtonText: "OK",
            });
            onSuccess?.();
          }
        }
      } else {
        // Add new bank
        const res = await axiosSecure.post("/api/v1/finance/create-bank", newBank);
        if (res.data.success) {
          Swal.fire({
            title: "Success!",
            text: "Payment method added successfully.",
            icon: "success",
            confirmButtonText: "OK",
          });
          onSuccess?.();
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {editingBank ? "Edit Payment Method" : "Add Payment Method"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Bank Type</label>
              <select
                value={bankType}
                onChange={(e) => {
                  const newBankType = e.target.value;
                  setBankType(newBankType);
                  // Auto-set channel for Bank and Crypto
                  if (newBankType === "Bank" || newBankType === "Crypto") {
                    setChannel("Send-Money");
                  } else {
                    setChannel("");
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Bank Type</option>
                <option value="Bkash">Bkash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Upay">Upay</option>
                <option value="Tap">Tap</option>
                <option value="OkWallet">OkWallet</option>
                <option value="Crypto">Crypto</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={bankType === "Bank"}
              >
                <option value="">Select Channel</option>
                {bankType === "Bank" || bankType === "Crypto" ? (
                  <option value="Send-Money">Send-Money</option>
                ) : (
                  <>
                    <option value="Cash-Out">Cash-Out</option>
                    <option value="Send-Money">Send-Money</option>
                    <option value="Cash-In">Cash-In</option>
                    <option value="Make-Payment">Make-Payment</option>
                    <option value="Bank-Transfer">Bank-Transfer</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter account number"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Daily Limit</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter daily limit"
              required
              min="1"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Purpose</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdraw">Withdraw</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Balance</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter balance"
              min="0"
            />
          </div>

          {bankType === "Bank" && (
            <>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Bank Name</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Bank Name</option>
                  <option value="DutchBangla">Dutch Bangla Bank</option>
                  <option value="Islami">Islami Bank</option>
                  <option value="ShajalalIslami">Shajalal Islami Bank</option>
                  <option value="Brack">Brack Bank</option>
                  <option value="City">City Bank</option>
                  <option value="Prime">Prime Bank</option>
                  <option value="Agrani">Agrani Bank</option>
                  <option value="Sonali">Sonali Bank</option>
                  <option value="Pubali">Pubali Bank</option>
                  <option value="Uttara">Uttara Bank</option>
                  <option value="Dhaka">Dhaka Bank</option>
                  <option value="Jamuna">Jamuna Bank</option>
                  <option value="One">One Bank</option>
                  <option value="UnitedCommercial">United Commercial Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Branch Name</label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter branch name"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter account holder name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">District</label>
                  <input
                    type="text"
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter district"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Routing Number</label>
                  <input
                    type="text"
                    value={routingNumber}
                    onChange={(e) => setRoutingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter routing number"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {editingBank ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <FaPlus />
                  {editingBank ? "Update Payment Method" : "Add Payment Method"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankModal; 