import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import { Check, Copy, CreditCard, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import Swal from "sweetalert2";
import useAxiosSecure from "./../../../Hook/useAxiosSecure";
// Payment Method Selector Component
const PaymentMethodSelector = ({ bankTypes, paymentMethods, selectedMethod, onSelect }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Select Payment Method</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {bankTypes.map((bankType) => {
        const methodInfo = paymentMethods.find(m => m.name === bankType);
        const isSelected = selectedMethod === bankType;
        
        return (
          <button
            key={bankType}
            onClick={() => onSelect(bankType)}
            className={`relative p-3 rounded-lg border transition-all duration-200 ${
              isSelected
                ? "bg-[#facc15]/10 border-[#facc15] text-[#facc15]"
                : "bg-[#22282e] border-gray-600 text-gray-300 hover:border-gray-500"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#22282e] flex items-center justify-center">
                {methodInfo?.logo ? (
                  <img
                    className="w-6 h-6 object-contain"
                    src={methodInfo.logo}
                    alt={bankType}
                  />
                ) : (
                  <CreditCard className="w-4 h-4 text-[#facc15]" />
                )}
              </div>
              <span className="text-xs font-medium">{bankType}</span>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#facc15] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#1a1f24]" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

// Channel Selector Component
const ChannelSelector = ({ channels, selectedChannel, onSelect }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Select Channel</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {channels.map((channel) => (
        <button
          key={channel}
          onClick={() => onSelect(channel)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            selectedChannel === channel
              ? "bg-[#facc15] text-[#1a1f24]"
              : "bg-[#22282e] text-gray-300 hover:bg-[#2a323a] border border-gray-600"
          }`}
          disabled={channel === "Bank-Transfer"}
        >
          {channel}
        </button>
      ))}
    </div>
  </div>
);

// Amount Selector Component
const AmountSelector = ({ amountOptions, selectedAmount, selectedAccount, onSelect }) => {
  const isAmountExceedsLimit = (amount) => {
    return selectedAccount && parseFloat(amount) > selectedAccount.dailyLimit;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Select Amount</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {amountOptions.map((amount) => {
          const exceedsLimit = isAmountExceedsLimit(amount);
          const isSelected = selectedAmount === amount;
          
          return (
            <button
              key={amount}
              onClick={() => onSelect(amount)}
              className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                exceedsLimit
                  ? "bg-gray-600 cursor-not-allowed opacity-50 text-gray-400"
                  : isSelected
                  ? "bg-[#facc15] text-[#1a1f24]"
                  : "bg-[#22282e] text-gray-300 hover:bg-[#2a323a] border border-gray-600"
              }`}
              disabled={exceedsLimit}
            >
              ৳ {amount}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#facc15] rounded-full flex items-center justify-center">
                  <Check className="w-2 h-2 text-[#1a1f24]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Bank Card Component
const BankCard = ({ bankDetails }) => {
  const [copiedField, setCopiedField] = useState(null);

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      // Handle error silently
    }
  };

  const CopyableField = ({ label, value, field }) => (
    <div className="flex items-center justify-between p-3 bg-[#22282e] rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-white truncate mt-1">{value}</p>
      </div>
      <button
        onClick={() => copyToClipboard(value, field)}
        className="ml-3 p-2 text-[#facc15] hover:bg-[#facc15]/10 rounded-lg transition-colors"
      >
        {copiedField === field ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Bank Details</h3>
      <div className="bg-[#1a1f24] rounded-lg border border-[#facc15]/20 p-4 space-y-3">
        <CopyableField
          label="Bank Name"
          value={bankDetails.bankName}
          field="bankName"
        />
        <CopyableField 
          label="Branch"
          value={bankDetails.branchName}
          field="branchName"
        />
        <CopyableField 
          label="Account Number" 
          value={bankDetails.accountNumber} 
          field="accountNumber"
        />
        <CopyableField 
          label="Account Holder" 
          value={bankDetails.accountHolderName} 
          field="accountHolder"
        />
        <CopyableField 
          label="District" 
          value={bankDetails.districtName} 
          field="district"
        />
        <CopyableField 
          label="Routing Number" 
          value={bankDetails.routingNumber} 
          field="routing"
        />
      </div>
    </div>
  );
};

const DepositSection = () => {
  const axiosSecure = useAxiosSecure();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bankTypes, setBankTypes] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const { data: users } = useGetUsersQuery();
  const [selectedChannel, setSelectedChannel] = useState("");
  const [allChannels, setAllChannels] = useState([]);
  const [filteredChannels, setFilteredChannels] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [trxId, setTrxId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const { addToast } = useToasts();
  const [reference, setReference] = useState("");
  const amountOptions = ["100", "200", "500", "1000", "2000", "5000", "10000", "15000", "20000"];
  const bankamountOptions = ["30000", "50000", "100000", "150000", "200000"];
  const paymentMethodOrder = ["Bkash", "Nagad", "Rocket", "Upay", "Tap", "OkWallet", "Crypto", "Bank"];
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankList, setBankList] = useState([]);

  // Memoized utility functions
  const sortPaymentMethods = useCallback((methods) => {
    return [...methods].sort((a, b) => {
      const indexA = paymentMethodOrder.indexOf(a);
      const indexB = paymentMethodOrder.indexOf(b);
      return indexA - indexB;
    });
  }, []);

  const isMobileBanking = useCallback((method) => {
    return ["Bkash", "Nagad", "Rocket", "Upay", "Tap", "OkWallet"].includes(method);
  }, []);

  const isAmountValid = useCallback(() => {
    const amount = customAmount || selectedAmount;
    if (!amount) return false;
    if (!selectedAccount) return false;
    return parseFloat(amount) <= selectedAccount.dailyLimit;
  }, [selectedAmount, customAmount, selectedAccount]);

  const getSuitableBankAccount = useCallback((amount, availableBanks) => {
    if (!amount || !availableBanks.length) return null;
    const sortedBanks = [...availableBanks].sort((a, b) => b.dailyLimit - a.dailyLimit);
    const suitableBank = sortedBanks.find(bank => bank.dailyLimit >= amount);
    return suitableBank || null;
  }, []);

  // Fetch payment methods
  useEffect(() => {
    fetch("/Payment_Methods.json")
      .then((res) => res.json())
      .then((data) => setPaymentMethods(data))
      .catch(() => {});
  }, [users]);

  // Fetch bank types and channels
  useEffect(() => {
    const fetchBankInfo = async () => {
      try {
        setLoading(true);
        const res = await axiosSecure.get(`/api/v1/finance/bank-list/${user.referredBy}`);
        if (res.data.success) {
          const banks = res.data.data.filter(bank => bank.status === "active");
          const uniqueBankTypes = [...new Set(banks.map(bank => bank.bankType))];
          setBankTypes(sortPaymentMethods(uniqueBankTypes));
          setAllChannels([...new Set(banks.map(bank => bank.channel))]);
          
          if (selectedMethod === "Bank") {
            const activeBanks = banks.filter(bank => bank.bankType === "Bank");
            setBankList(activeBanks);
          }
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch bank information. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBankInfo();
  }, [user.referredBy, axiosSecure, sortPaymentMethods, selectedMethod]);

  // Fetch filtered channels
  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedMethod) {
        setFilteredChannels(allChannels);
        return;
      }
      try {
        setLoading(true);
        const res = await axiosSecure.get(`/api/v1/finance/bank-list/${user.referredBy}?bankType=${selectedMethod}`);
        if (res.data.success) {
          const channels = [...new Set(res.data.data.map(bank => bank.channel))];
          setFilteredChannels(channels);
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch channels. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, [selectedMethod, user.referredBy, axiosSecure, allChannels]);

  // Fetch bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      if (!selectedMethod || !selectedChannel) {
        setSelectedAccount(null);
        setSelectedBankDetails(null);
        return;
      }
      try {
        setLoading(true);
        const res = await axiosSecure.get(
          `/api/v1/finance/bank-list/${user.referredBy}?bankType=${selectedMethod}&channel=${selectedChannel}`
        );
        if (res.data.success) {
          const activeBanks = res.data.data.filter(bank => bank.status === "active");
          if (selectedMethod === "Bank") {
            const selectedBankData = activeBanks.find(bank => bank.bankName === selectedBank?.bankName);
            if (selectedBankData) {
              setSelectedAccount(selectedBankData);
              setSelectedBankDetails(selectedBankData);
            }
          } else if (isMobileBanking(selectedMethod)) {
            const amount = customAmount || selectedAmount;
            setSelectedAccount(getSuitableBankAccount(parseFloat(amount), activeBanks));
          } else {
            setSelectedAccount(activeBanks[0]);
          }
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch bank accounts. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchBankAccounts();
  }, [selectedMethod, selectedChannel, selectedAmount, customAmount, selectedBank, user.referredBy, axiosSecure, isMobileBanking, getSuitableBankAccount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalAmount = customAmount || selectedAmount;
    
    const validateFields = () => {
      if (selectedMethod === "Bank") {
        return !finalAmount || !selectedMethod || !selectedBank || !reference;
      }
      return !finalAmount || !senderPhone || !selectedMethod || !selectedAccount;
    };

    if (validateFields()) {
      Swal.fire({
        icon: "warning",
        title: "All fields are required!",
        confirmButtonText: "OK",
      });
      return;
    }

    const rechargeData = {
      username: user?.username,
      amount: parseFloat(finalAmount),
      paymentMethod: selectedMethod,
      channel: selectedChannel,
      txnId: selectedMethod === "Bank" ? reference : trxId,
      senderPhone: selectedMethod === "Bank" ? undefined : senderPhone,
      referralCode: user.referredBy,
      status: "pending",
      adminNote: "Urgent recharge",
      accountNumber: selectedMethod === "Bank" ? selectedBank.accountNumber : selectedAccount.accountNumber,
      dailyLimit: selectedMethod === "Bank" ? selectedBank.dailyLimit : selectedAccount.dailyLimit
    };

    try {
      const res = await axiosSecure.post(`/api/v1/finance/create-recharge-request`, rechargeData);
      if (res.data.success) {
        Swal.fire({
          title: "Request Submitted!",
          text: `Amount: ৳${finalAmount}, Method: ${selectedMethod}`,
          icon: "success",
          confirmButtonText: "OK",
        });
        // Reset form
        setTrxId("");
        setSenderPhone("");
        setSelectedAmount("");
        setCustomAmount("");
        setSelectedMethod(null);
        setSelectedChannel("");
        setSelectedAccount(null);
        setSelectedBank(null);
        setReference("");
        setSelectedBankDetails(null);
        document.getElementById("deposit_modal")?.close();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f24] to-[#0f1419] pt-20">
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#facc15] flex items-center justify-center">
            <Send className="w-8 h-8 text-[#1a1f24]" />
          </div>
          <h1 className="text-2xl font-bold text-[#facc15] mb-2">Send Request</h1>
          <p className="text-gray-300">Submit your deposit request</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1a1f24] rounded-lg border border-[#facc15]/20 p-6 space-y-6">
          {/* Payment Method Selection */}
          <PaymentMethodSelector
            bankTypes={bankTypes}
            paymentMethods={paymentMethods}
            selectedMethod={selectedMethod}
            onSelect={(method) => {
              setSelectedMethod(method);
              if (method === "Bank") {
                setSelectedChannel("Bank-Transfer");
              } else {
                setSelectedChannel("");
              }
            }}
          />

          {/* Selected Method Indicator */}
          {selectedMethod && (
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#facc15] text-[#1a1f24] rounded-full text-sm font-medium">
                <Check className="w-4 h-4" />
                {selectedMethod}
              </span>
            </div>
          )}

          {/* Bank Selection for Bank Method */}
          {selectedMethod === "Bank" && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Select Bank</h3>
              <div className="grid grid-cols-2 gap-2">
                {bankList.map((bank) => (
                  <button
                    key={bank.bankName}
                    onClick={() => {
                      setSelectedBank(bank);
                      setSelectedChannel("Bank-Transfer");
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      selectedBank?.bankName === bank.bankName
                        ? "bg-[#facc15] text-[#1a1f24]"
                        : "bg-[#22282e] text-gray-300 hover:bg-[#2a323a] border border-gray-600"
                    }`}
                  >
                    {bank.bankName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Channel Selection for Non-Bank Methods */}
          {selectedMethod && selectedMethod !== "Bank" && (
            <ChannelSelector
              channels={filteredChannels}
              selectedChannel={selectedChannel}
              onSelect={setSelectedChannel}
            />
          )}

          {/* Amount Selection */}
          {selectedMethod && selectedChannel && (
            <AmountSelector
              amountOptions={selectedMethod === "Bank" ? bankamountOptions : amountOptions}
              selectedAmount={selectedAmount}
              selectedAccount={selectedBank || selectedAccount}
              onSelect={(amount) => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
            />
          )}

          {/* Custom Amount Input */}
          {selectedMethod && selectedChannel && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Or Enter Custom Amount</h3>
              <input
                type="number"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount("");
                }}
                className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
              />
            </div>
          )}



          {/* Submit Button */}
          <button
            onClick={() => {
              const finalAmount = customAmount || selectedAmount;
              
              // Validation for Bank method
              if (selectedMethod === "Bank") {
                if (!finalAmount || !selectedMethod || !selectedBank || !selectedChannel) {
                  Swal.fire({
                    icon: "warning",
                    title: "Please complete all fields!",
                    text: "Please select payment method, bank, and enter amount.",
                    confirmButtonText: "OK",
                  });
                  return;
                }
              } else {
                // Validation for other methods
                if (!finalAmount || !selectedMethod || !selectedChannel) {
                  Swal.fire({
                    icon: "warning",
                    title: "Please complete all fields!",
                    text: "Please select payment method, channel, and enter amount.",
                    confirmButtonText: "OK",
                  });
                  return;
                }
              }
              
              document.getElementById("deposit_modal")?.showModal();
            }}
            disabled={loading || !isAmountValid()}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
              loading || !isAmountValid()
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-[#facc15] text-[#1a1f24] hover:bg-[#e6b800] active:scale-95"
            }`}
          >
            {loading ? "Processing..." : "Confirm Deposit"}
          </button>
        </div>

        {/* Confirmation Modal */}
        <dialog id="deposit_modal" className="modal">
          <div className="modal-box bg-[#1a1f24] text-white max-w-md w-full mx-auto border border-[#facc15]/20">
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#facc15] flex items-center justify-center">
                <Send className="w-8 h-8 text-[#1a1f24]" />
              </div>
              <h2 className="text-2xl font-bold text-[#facc15] mb-2">Confirm Deposit</h2>
              {selectedMethod && (
                <p className="text-gray-300">
                  Method: <span className="text-[#facc15] font-medium">{selectedMethod}</span>
                </p>
              )}
            </div>

            {/* Amount Display */}
            {(selectedAmount || customAmount) && (
              <div className="bg-[#22282e] rounded-lg p-4 mb-6 text-center">
                <p className="text-sm text-gray-400 mb-1">Amount to Deposit</p>
                <p className="text-3xl font-bold text-[#facc15]">৳ {customAmount || selectedAmount}</p>
              </div>
            )}

            {/* Bank Details for Bank Method */}
            {selectedMethod === "Bank" && selectedBankDetails && (
              <div className="mb-6">
                <BankCard bankDetails={selectedBankDetails} />
              </div>
            )}

            {/* Mobile Banking Account Details */}
            {selectedMethod !== "Bank" && selectedAccount && (
              <div className="mb-6">
                <div className="bg-[#22282e] rounded-lg p-4 border border-[#facc15]/20">
                  <h3 className="text-[#facc15] font-medium mb-3 text-center">Send money to this number:</h3>
                  <div className="flex items-center justify-between p-3 bg-[#1a1f24] rounded-lg">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Account Number</p>
                      <p className="text-lg font-bold text-white">{selectedAccount.accountNumber}</p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedAccount.accountNumber);
                        addToast("Copied to clipboard", {
                          appearance: "success",
                          autoDismiss: true,
                        });
                      }}
                      className="px-3 py-2 bg-[#facc15] text-[#1a1f24] rounded-lg text-sm font-medium hover:bg-[#e6b800] transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              {selectedMethod === "Bank" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Reference Number *</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Enter reference number"
                    className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Sender Phone *</label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="Enter sender phone number"
                      className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Transaction ID *</label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="Enter transaction ID"
                      className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-[#facc15] text-[#1a1f24] font-medium px-6 py-3 rounded-lg hover:bg-[#e6b800] transition-colors"
              >
                Submit Request
              </button>
              <button
                onClick={() => document.getElementById("deposit_modal")?.close()}
                className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default DepositSection;
