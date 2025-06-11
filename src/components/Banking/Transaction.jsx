import useManualUserDataReload from "@/Hook/useUserDataReload";
import { useUpdateBalanceMutation } from "@/redux/features/allApis/usersApi/usersApi";
import { useState } from "react";
import { FiCheck, FiMinus, FiPlus } from "react-icons/fi";
import { useToasts } from "react-toast-notifications";

const Transaction = ({ username, availableBalance = 0 }) => {
  const [updateBalance] = useUpdateBalanceMutation();
  const [action, setAction] = useState("");
  const [amount, setAmount] = useState("");
  const { addToast } = useToasts();
  const { reloadUserData } = useManualUserDataReload();

  const handleTransaction = async () => {
    if (!action) {
      addToast("Please select deposit or withdraw", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    if (!amount || amount <= 0) {
      addToast("Please enter a valid amount", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    if (action === "withdraw" && availableBalance < Number(amount)) {
      addToast("Insufficient balance", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    try {
      const payload = {
        username,
        amount: Number(amount),
        type: action,
      };

      const result = await updateBalance(payload).unwrap();
    
      if (result?.success) {
        addToast(result?.message || "Transaction successful", {
          appearance: "success",
          autoDismiss: true,
        });
        setAmount("");
        setAction("");
        reloadUserData();
      }
    } catch (error) {
      addToast(error?.data?.message || "Transaction failed", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  return (
    <div className="flex flex-row gap-2 items-center">
      {/* D/W Buttons */}
      <div className="flex flex-row items-center justify-center gap-1">
        <button
          type="button"
          title="Deposit"
          className={`flex items-center justify-center px-3 py-2 rounded-lg shadow-md transition-all duration-200 border-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937] 
            ${action === "deposit"
              ? "bg-gradient-to-r from-green-500 to-emerald-600 border-green-600 scale-105 ring-2 ring-green-300"
              : "bg-[#1f2937] border-[#1f2937] hover:bg-green-500 hover:border-green-600"}
          `}
          onClick={() => setAction("deposit")}
        >
          <FiPlus className="w-4 h-4 mr-1" />
          D
        </button>
        <button
          type="button"
          title="Withdraw"
          className={`flex items-center justify-center px-3 py-2 rounded-lg shadow-md transition-all duration-200 border-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937] 
            ${action === "withdraw"
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-600 scale-105 ring-2 ring-yellow-300"
              : "bg-[#1f2937] border-[#1f2937] hover:bg-yellow-500 hover:border-yellow-600"}
          `}
          onClick={() => setAction("withdraw")}
        >
          <FiMinus className="w-4 h-4 mr-1" />
          W
        </button>
      </div>

      {/* Amount Input */}
      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="Amount"
          className="w-32 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm bg-gray-50 placeholder:text-gray-400"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        {amount && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            ৳
          </div>
        )}
      </div>

      {/* Add Button */}
      <button
        type="button"
        title="Submit Transaction"
        className={`flex items-center gap-1 px-4 py-2 rounded-lg shadow-md transition-all duration-200 border-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937]
          ${amount && action
            ? "bg-gradient-to-r from-[#1f2937] to-gray-800 border-[#1f2937] hover:from-gray-800 hover:to-[#1f2937]"
            : "bg-gray-400 border-gray-400 cursor-not-allowed"
          }
        `}
        onClick={handleTransaction}
        disabled={!amount || !action}
      >
        <FiCheck className="w-4 h-4" />
        Add
      </button>
    </div>
  );
};

export default Transaction;
