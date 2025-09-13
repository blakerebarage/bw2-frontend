import { useLanguage } from "@/contexts/LanguageContext";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import useManualUserDataReload from "@/Hook/useUserDataReload";
import { ArrowRight, Check, CreditCard, Send, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

// Internal Payment Method Selector Component
const InternalPaymentMethodSelector = ({ systemBanks, paymentMethods, selectedMethod, onSelect, sortPaymentMethods }) => {
  const systemBankTypes = [...new Set(systemBanks.map(bank => bank.bankType))];
  const sortedBankTypes = sortPaymentMethods(systemBankTypes);
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sortedBankTypes.map((bankType) => {
          const methodInfo = paymentMethods.find(m => m.name === bankType);
          const isSelected = selectedMethod.method === bankType && selectedMethod.type === 'system';
          
          return (
            <button
              key={`system-${bankType}`}
              onClick={() => onSelect({ type: 'system', method: bankType })}
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
};

// Wallet Agent Payment Method Selector Component
const WalletAgentPaymentMethodSelector = ({ walletAgentBanks, paymentMethods, selectedMethod, onSelect, sortPaymentMethods }) => {
  const walletAgentBankTypes = [...new Set(walletAgentBanks.map(bank => bank.bankType))];
  const sortedBankTypes = sortPaymentMethods(walletAgentBankTypes);
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Wallet Agent Payment Methods</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sortedBankTypes.map((bankType) => {
          const methodInfo = paymentMethods.find(m => m.name === bankType);
          const isSelected = selectedMethod.method === bankType && selectedMethod.type === 'agent';
          
          return (
            <button
              key={`wallet-${bankType}`}
              onClick={() => onSelect({ type: 'agent', method: bankType })}
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
};





export default function Withdraw() {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  const [selectedMethod, setSelectedMethod] = useState({ type: '', method: '' });
  const [amount, setAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [walletAgentBanks, setWalletAgentBanks] = useState([]);
  const [systemBanks, setSystemBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const { reloadUserData } = useManualUserDataReload();
  const [selectedBank, setSelectedBank] = useState(null);
  const [isWalletAgentMethod, setIsWalletAgentMethod] = useState(false);
  // User's bank information for Bank method
  const [userBankName, setUserBankName] = useState("");
  const [userBranchName, setUserBranchName] = useState("");
  const [userAccountHolderName, setUserAccountHolderName] = useState("");
  const [userRoutingNumber, setUserRoutingNumber] = useState("");
  
  const paymentMethodOrder = ["Bkash", "Nagad", "Rocket", "Upay", "Tap", "OkWallet", "Bank", "Crypto"];

  // Memoized utility functions
  const sortPaymentMethods = useCallback((methods) => {
    return [...methods].sort((a, b) => {
      const indexA = paymentMethodOrder.indexOf(a);
      const indexB = paymentMethodOrder.indexOf(b);
      return indexA - indexB;
    });
  }, []);

  // Fetch banks data
  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        // Fetch system banks
        const systemRes = await axiosSecure.get(`/api/v1/finance/bank-list/${user.referredBy}?purpose=Withdraw`);
        if (systemRes.data.success) {
          const banks = systemRes.data?.data?.filter(bank => bank.status === "active");
          setSystemBanks(banks);
        }

        // Fetch wallet agent banks
        const agentRes = await axiosSecure.get(`/api/v1/finance/wallet-agent-bank-list?page=1&limit=100&purpose=Withdraw`);
        if (agentRes.data.success) {
          const banks = agentRes.data.data.results.filter(bank => bank.status === "active" && bank.isWalletAgent);
          setWalletAgentBanks(banks);
        }
      } catch (err) {
        console.error("Failed to fetch banks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, [user.referredBy, axiosSecure]);

  // Update selected bank details when method changes
  useEffect(() => {
    if (!selectedMethod.method) {
      setSelectedBankDetails(null);
      setSelectedBank(null);
      return;
    }

    setSelectedBankDetails(null);
    setSelectedBank(null);
  }, [selectedMethod, isWalletAgentMethod, walletAgentBanks, systemBanks]);

  // Update selected bank details when method and bank are selected
  useEffect(() => {
    if (selectedMethod.method === "Bank" && selectedBank) {
      if (isWalletAgentMethod) {
        const filtered = walletAgentBanks.filter(b => b.bankType === selectedMethod.method && b._id === selectedBank._id);
        setSelectedBankDetails(filtered[0] || null);
      } else {
        const filtered = systemBanks.filter(b => b.bankType === selectedMethod.method && b.bankName === selectedBank.bankName);
        setSelectedBankDetails(filtered[0] || null);
      }
    } else if (selectedMethod.method) {
      if (isWalletAgentMethod) {
        const filtered = walletAgentBanks.filter(b => b.bankType === selectedMethod.method);
        // For mobile banking, select the bank with smallest suitable limit
        if (["Bkash", "Nagad", "Rocket", "Upay", "Tap", "OkWallet","Crypto"].includes(selectedMethod.method)) {
          const amountValue = parseFloat(amount);
          if (amountValue && filtered.length > 0) {
            const suitableBanks = filtered.filter(bank => bank.dailyLimit >= amountValue);
            if (suitableBanks.length > 0) {
              const sortedBanks = suitableBanks.sort((a, b) => a.dailyLimit - b.dailyLimit);
              setSelectedBankDetails(sortedBanks[0]);
            } else {
              setSelectedBankDetails(filtered[0]);
            }
          } else {
            setSelectedBankDetails(filtered[0] || null);
          }
        } else {
          setSelectedBankDetails(filtered[0] || null);
        }
      } else {
        const filtered = systemBanks.filter(b => b.bankType === selectedMethod.method);
        // For mobile banking, select the bank with smallest suitable limit
        if (["Bkash", "Nagad", "Rocket", "Upay", "Tap", "OkWallet"].includes(selectedMethod.method)) {
          const amountValue = parseFloat(amount);
          if (amountValue && filtered.length > 0) {
            const suitableBanks = filtered.filter(bank => bank.dailyLimit >= amountValue);
            if (suitableBanks.length > 0) {
              const sortedBanks = suitableBanks.sort((a, b) => a.dailyLimit - b.dailyLimit);
              setSelectedBankDetails(sortedBanks[0]);
            } else {
              setSelectedBankDetails(filtered[0]);
            }
          } else {
            setSelectedBankDetails(filtered[0] || null);
          }
        } else {
          setSelectedBankDetails(filtered[0] || null);
        }
      }
    } else {
      setSelectedBankDetails(null);
    }
  }, [selectedMethod, walletAgentBanks, systemBanks, selectedBank, isWalletAgentMethod, amount]);

  // Update bank list when method changes
  useEffect(() => {
    if (selectedMethod.method === "Bank") {
      if (isWalletAgentMethod) {
        // Use wallet agent banks for Bank method
        const walletAgentBankBanks = walletAgentBanks.filter(bank => bank.bankType === "Bank");
        setSelectedBank(walletAgentBankBanks[0] || null);
      } else {
        // Use system banks for Bank method
        const systemBankBanks = systemBanks.filter(bank => bank.bankType === "Bank");
        setSelectedBank(systemBankBanks[0] || null);
      }
    }
  }, [selectedMethod, isWalletAgentMethod, walletAgentBanks, systemBanks]);

  // Update isWalletAgentMethod when method changes
  useEffect(() => {
    if (selectedMethod.method) {
      // Determine if it's a wallet agent method based on the selected type, not by checking if it exists in walletAgentBanks
      setIsWalletAgentMethod(selectedMethod.type === 'agent');
    }
  }, [selectedMethod]);

  // Fetch payment methods
  useEffect(() => {
    fetch("/Payment_Methods.json")
      .then((res) => res.json())
      .then((data) => setPaymentMethods(data))
      .catch(() => {});
  }, []);

  // Reset form to initial state
  const resetForm = () => {
    setSelectedMethod({ type: '', method: '' });
    setAmount("");
    setMobileNumber("");
    setSelectedBank(null);
    setUserBankName("");
    setUserBranchName("");
    setUserAccountHolderName("");
    setUserRoutingNumber("");
  };

  // Validation helper
  const validateForm = () => {
    if (!selectedMethod.method || !amount || !mobileNumber) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all the required fields!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (selectedMethod.method !== "Bank" && mobileNumber.length !== 11) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Phone Number",
        text: "Phone number must be exactly 11 digits!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return false;
    }

    if (selectedMethod.method === "Bank" && (!userBankName || !userBranchName || !userAccountHolderName || !userRoutingNumber)) {
      Swal.fire({
        icon: "warning",
        title: "Missing Bank Info",
        text: "Please fill all your bank information!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateForm()) return;

    const withdrawData = {
      paymentMethod: selectedMethod.method,
      amount,
      withdrawAccountNumber: mobileNumber,
      username: user.username,
      referralCode: user.referredBy,
      ...(isWalletAgentMethod && {
        walletAgentUsername: selectedMethod.method === "Bank" ? selectedBank?.username : selectedBankDetails?.username
      }),
      ...(selectedMethod.method === "Bank" && {
        userBankName,
        userBranchName,
        userAccountHolderName,
        userRoutingNumber,
      })
    };

    try {
      await axiosSecure.post(`/api/v1/finance/create-withdraw-request`, withdrawData);
    
      Swal.fire({
        icon: "success",
        title: "Withdrawal Successful!",
        text: "Your withdrawal request has been submitted",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      
      resetForm();
      reloadUserData();
    } catch (error) {
      
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error?.response?.data?.message || "Something went wrong! Please try again later.",
        confirmButtonColor: "#d33",
        confirmButtonText: "OK",
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
          <h1 className="text-2xl font-bold text-[#facc15] mb-2">{t('withdraw')}</h1>
          <p className="text-gray-300">{t('requestWithdrawal')}</p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-[#1a1f24] rounded-lg border border-[#facc15]/20 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#facc15] flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#1a1f24]" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{t('availableBalance')}</p>
              <p className="text-2xl font-bold text-[#facc15]">{formatCurrency(user?.balance)}</p>
            </div>
            <Link 
              to="/transaction-history" 
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#facc15] transition-colors"
            >
              History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#1a1f24] rounded-lg border border-[#facc15]/20 p-6 space-y-6">
          {/* Internal Payment Methods */}
          {systemBanks.length > 0 && (
            <InternalPaymentMethodSelector
              systemBanks={systemBanks}
              paymentMethods={paymentMethods}
              selectedMethod={selectedMethod}
              sortPaymentMethods={sortPaymentMethods}
              onSelect={setSelectedMethod}
            />
          )}

          {/* Wallet Agent Payment Methods */}
          {walletAgentBanks.length > 0 && (
            <WalletAgentPaymentMethodSelector
              walletAgentBanks={walletAgentBanks}
              paymentMethods={paymentMethods}
              selectedMethod={selectedMethod}
              sortPaymentMethods={sortPaymentMethods}
              onSelect={setSelectedMethod}
            />
          )}

          {/* Amount Display */}
          {amount && (
            <div className="flex justify-center items-center">
              <div className="px-4 py-2 bg-[#facc15] text-[#1a1f24] rounded-full min-w-[100px] text-center font-bold text-2xl">
                {formatCurrency(amount)}
              </div>
            </div>
          )}

          {/* Bank Selection for Bank Method */}
          {selectedMethod.method === "Bank" && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Select Bank</h3>
              <div className="grid grid-cols-2 gap-2">
                {(isWalletAgentMethod ? walletAgentBanks : systemBanks)
                  .filter(b => b.bankType === "Bank")
                  .map((bankObj) => (
                  <button
                    key={isWalletAgentMethod ? bankObj._id : bankObj.bankName}
                    onClick={() => setSelectedBank(bankObj)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      (isWalletAgentMethod 
                        ? selectedBank?._id === bankObj._id
                        : selectedBank?.bankName === bankObj.bankName)
                        ? "bg-[#facc15] text-[#1a1f24]"
                        : "bg-[#22282e] text-gray-300 hover:bg-[#2a323a] border border-gray-600"
                    }`}
                  >
                    {isWalletAgentMethod ? bankObj.username : bankObj.bankName}
                  </button>
                ))}
              </div>
            </div>
          )}          {/* User's Bank Information for Direct Bank */}
          {selectedMethod.method === "Bank" && selectedBank && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[#facc15] uppercase tracking-wide">Your Bank Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Bank Name *</label>
                  <input
                    type="text"
                    value={userBankName}
                    onChange={e => setUserBankName(e.target.value)}
                    className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
                    placeholder="Enter your bank name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Branch Name *</label>
                  <input
                    type="text"
                    value={userBranchName}
                    onChange={e => setUserBranchName(e.target.value)}
                    className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
                    placeholder="Enter your branch name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Account Holder Name *</label>
                  <input
                    type="text"
                    value={userAccountHolderName}
                    onChange={e => setUserAccountHolderName(e.target.value)}
                    className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
                    placeholder="Enter your account holder name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Routing Number *</label>
                  <input
                    type="text"
                    value={userRoutingNumber}
                    onChange={e => setUserRoutingNumber(e.target.value)}
                    className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
                    placeholder="Enter your routing number"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Amount and Account Number Fields */}
          {selectedMethod.method && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Amount *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
                    placeholder="0.00"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                    Max: {formatCurrency(user?.balance)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {selectedMethod.method === "Bank" ? "Account Number" : "Mobile Number"} *
                </label>
                {selectedMethod.method === "Bank" ? (
                  <input
                    type="text"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
                    placeholder="Enter account number"
                  />
                ) : (
                  <div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        <span className="text-[#facc15] font-semibold text-sm">+88</span>
                      </div>
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and limit to 11 digits
                          if (/^[0-9]*$/.test(value) && value.length <= 11) {
                            setMobileNumber(value);
                          }
                        }}
                        onKeyPress={(e) => {
                          // Only allow numbers
                          if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="0XXXXXXXXX"
                        maxLength={11}
                        className={`w-full pl-12 p-3 bg-[#22282e] text-white rounded-lg border focus:ring-1 focus:ring-[#facc15] outline-none transition-colors ${
                          mobileNumber && mobileNumber.length !== 11 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-600 focus:border-[#facc15]'
                        }`}
                      />
                    </div>
                    {mobileNumber && mobileNumber.length !== 11 && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Phone number must be exactly 11 digits (e.g., 0XXXXXXXXX)
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      💡 Enter 11-digit phone number (e.g., 0XXXXXXXXX)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Withdraw Button */}
          {selectedMethod.method && (
            <button
              onClick={handleWithdraw}
              disabled={!amount || amount <= 0 || amount > user?.balance || loading}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                !amount || amount <= 0 || amount > user?.balance || loading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-[#facc15] text-[#1a1f24] hover:bg-[#e6b800] active:scale-95"
              }`}
            >
              {loading ? "Processing..." : 
                (!amount || amount <= 0 || amount > user?.balance 
                  ? "Enter Valid Amount" 
                  : `Withdraw ${formatCurrency(amount)}`)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
