import useAxiosSecure from "@/Hook/useAxiosSecure";
import useManualUserDataReload from "@/Hook/useUserDataReload";
import { useState } from "react";

import { FaMoneyBill } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const SuperAdminBalanceAdd = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const axiosSecure = useAxiosSecure();
    const { addToast } = useToasts();
    const { reloadUserData } = useManualUserDataReload();
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            addToast("Please enter a valid amount", {
                appearance: "error",
                autoDismiss: true,
              });
        }

        try {
            setLoading(true);
            const data = {
                username: user?.username,
                amount: Number(amount)
            }

            const response = await axiosSecure.post("/api/v1/finance/add-balance-to-super-admin", data);
            if (response.data.success) {
                addToast("Balance added successfully", {
                    appearance: "success",
                    autoDismiss: true,
                })
                setIsModalOpen(false);
                setAmount("");
                reloadUserData();
            } else {
                toast.error(response.data.message || "Failed to add balance");
            }
        } catch (error) {
            
            addToast("Failed to add balance", {
                appearance: "error",
                autoDismiss: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#fefefe] to-[#f3f3f3]">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center mb-6">
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <FaMoneyBill /> Deposit Now
                    </button>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Add Balance</h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg "
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Adding..." : "Add Balance"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminBalanceAdd;