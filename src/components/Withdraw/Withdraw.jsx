import { useLanguage } from "@/contexts/LanguageContext";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import useManualUserDataReload from "@/Hook/useUserDataReload";
import { ArrowRight, Check, Copy, CreditCard, Send, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

// Internal Payment Method Selector Component
const InternalPaymentMethodSelector = ({ systemBanks, paymentMethods, selectedMethod, onSelect, t }) => {
  const systemBankTypes = [...new Set(systemBanks.map(bank => bank.bankType))];
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Internal Payment Methods</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {systemBankTypes.map((bankType) => {
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
                <span className="text-xs text-blue-400">System</span>
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
const WalletAgentPaymentMethodSelector = ({ walletAgentBanks, paymentMethods, selectedMethod, onSelect, t }) => {
  const walletAgentBankTypes = [...new Set(walletAgentBanks.map(bank => bank.bankType))];
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Wallet Agent Payment Methods</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {walletAgentBankTypes.map((bankType) => {
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
                <span className="text-xs text-green-400">Agent</span>
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
        >
          {channel}
        </button>
      ))}
    </div>
  </div>
);

// Bank Card Component
const BankCard = ({ bankDetails, type }) => {
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

  // Mobile banking: only show account number
  if (type !== "Bank") {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Account Details</h3>
        <div className="bg-[#1a1f24] rounded-lg border border-[#facc15]/20 p-4">
          <CopyableField
            label="Account Number"
            value={bankDetails.accountNumber}
            field="accountNumber"
          />
        </div>
      </div>
    );
  }

  // Direct bank: show all fields
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
          label="Routing Number" 
          value={bankDetails.routingNumber} 
          field="routing"
        />
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
  const [chanel, setChanel] = useState("");
  const [amount, setAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bankTypes, setBankTypes] = useState([]);
  const [channels, setChannels] = useState([]);
  const [allBanks, setAllBanks] = useState([]);
  const [walletAgentBanks, setWalletAgentBanks] = useState([]);
  const [systemBanks, setSystemBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const { reloadUserData } = useManualUserDataReload();
  const [selectedBank, setSelectedBank] = useState(null);
  const [isWalletAgentMethod, setIsWalletAgentMethod] = useState(false);
  // New state for user's own bank info
  const [userBankName, setUserBankName] = useState("");
  const [userBranchName, setUserBranchName] = useState("");
  const [userAccountHolderName, setUserAccountHolderName] = useState("");
  const [userRoutingNumber, setUserRoutingNumber] = useState("");

  // Define the desired order of payment methods
  const paymentMethodOrder = [
    "Bkash",
    "Nagad",
    "Rocket",
    "Upay",
    "Tap",
    "OkWallet",
    "Crypto",
    "Bank"
  ];

  // Function to sort payment methods according to the defined order
  const sortPaymentMethods = (methods) => {
    return [...methods].sort((a, b) => {
      const indexA = paymentMethodOrder.indexOf(a);
      const indexB = paymentMethodOrder.indexOf(b);
      return indexA - indexB;
    });
  };

  // Fetch system banks
  useEffect(() => {
    setLoading(true);
    axiosSecure
      .get(`/api/v1/finance/bank-list/${user.referredBy}?purpose=Withdraw`)
      .then((res) => {
        if (res.data.success) {
          const banks = res.data?.data?.filter(bank => bank.status === "active");
          setSystemBanks(banks);
          setAllBanks(banks);
          const uniqueBankTypes = [...new Set(banks.map(bank => bank.bankType))];
          const sortedBankTypes = sortPaymentMethods(uniqueBankTypes);
          setBankTypes(sortedBankTypes);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch system banks:", err);
      })
      .finally(() => setLoading(false));
  }, [user.referredBy, axiosSecure]);

  // Fetch wallet agent banks
  useEffect(() => {
    const fetchWalletAgentBanks = async () => {
      try {
        const res = await axiosSecure.get(`/api/v1/finance/wallet-agent-bank-list?page=1&limit=100&purpose=Withdraw`);
      
        if (res.data.success) {
          const banks = res.data.data.results.filter(bank => bank.status === "active" && bank.isWalletAgent);
          setWalletAgentBanks(banks);
          
          // Add wallet agent bank types to existing bank types
          const walletAgentBankTypes = [...new Set(banks.map(bank => bank.bankType))];
          setBankTypes(prevBankTypes => {
            const allBankTypes = [...new Set([...prevBankTypes, ...walletAgentBankTypes])];
            return sortPaymentMethods(allBankTypes);
          });
        }
      } catch (err) {
        console.error("Failed to fetch wallet agent banks:", err);
      }
    };
    fetchWalletAgentBanks();
  }, [axiosSecure]);

  // Update channels when method changes
  useEffect(() => {
    if (!selectedMethod.method) {
      setChannels([]);
      setChanel("");
      setSelectedBankDetails(null);
      setSelectedBank(null);
      return;
    }

    if (isWalletAgentMethod) {
      // Use wallet agent banks for this method
      const methodBanks = walletAgentBanks.filter(bank => bank.bankType === selectedMethod.method);
      const uniqueChannels = [...new Set(methodBanks.map(bank => bank.channel))];
      setChannels(uniqueChannels);
    } else {
      // Use system banks for this method
      const methodBanks = systemBanks.filter(bank => bank.bankType === selectedMethod.method);
      const uniqueChannels = [...new Set(methodBanks.map(bank => bank.channel))];
      setChannels(uniqueChannels);
    }
    
    setChanel("");
    setSelectedBankDetails(null);
    setSelectedBank(null);
  }, [selectedMethod, isWalletAgentMethod, walletAgentBanks, systemBanks]);

  // Update selected bank details when both method and channel are selected
  useEffect(() => {
    if (selectedMethod.method === "Bank" && selectedBank && chanel) {
      if (isWalletAgentMethod) {
        const filtered = walletAgentBanks.filter(b => b.bankType === selectedMethod.method && b.channel === chanel && b._id === selectedBank._id);
        setSelectedBankDetails(filtered[0] || null);
      } else {
        const filtered = systemBanks.filter(b => b.bankType === selectedMethod.method && b.channel === chanel && b.bankName === selectedBank.bankName);
        setSelectedBankDetails(filtered[0] || null);
      }
    } else if (selectedMethod.method && chanel) {
      if (isWalletAgentMethod) {
        const filtered = walletAgentBanks.filter(b => b.bankType === selectedMethod.method && b.channel === chanel);
        setSelectedBankDetails(filtered[0] || null);
      } else {
        const filtered = systemBanks.filter(b => b.bankType === selectedMethod.method && b.channel === chanel);
        setSelectedBankDetails(filtered[0] || null);
      }
    } else {
      setSelectedBankDetails(null);
    }
  }, [selectedMethod, chanel, walletAgentBanks, systemBanks, selectedBank, isWalletAgentMethod]);

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
      const walletAgentMethod = walletAgentBanks.find(bank => bank.bankType === selectedMethod.method);
      setIsWalletAgentMethod(!!walletAgentMethod);
    }
  }, [selectedMethod, walletAgentBanks]);

  // Fetch payment methods
  useEffect(() => {
    fetch("/Payment_Methods.json")
      .then((res) => res.json())
      .then((data) => setPaymentMethods(data))
      .catch(() => {});
  }, []);

  const handleWithdraw = async () => {
    if (!selectedMethod.method || !chanel || !amount || !mobileNumber) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all the required fields!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return;
    }
    // For direct bank, require user bank info
    if (selectedMethod.method === "Bank" && (!userBankName || !userBranchName || !userAccountHolderName || !userRoutingNumber)) {
      Swal.fire({
        icon: "warning",
        title: "Missing Bank Info",
        text: "Please fill all your bank information!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      return;
    }

    const withdrawData = {
      paymentMethod: selectedMethod.method,
      amount,
      withdrawAccountNumber: mobileNumber,
      channel: chanel,
      username: user.username,
      referralCode: user.referredBy,
      ...(isWalletAgentMethod && {
        walletAgentUsername: selectedMethod.method === "Bank" ? selectedBank.username : selectedBankDetails.username
      }),
      // Add user bank info for direct bank
      ...(selectedMethod.method === "Bank" && {
        userBankName,
        userBranchName,
        userAccountHolderName,
        userRoutingNumber,
      })
    };
    try {
      const response = await axiosSecure.post(`/api/v1/finance/create-withdraw-request`, withdrawData);
    
      Swal.fire({
        icon: "success",
        title: "Withdrawal Successful!",
        text: "Your withdrawal request has been Pending",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      });
      setSelectedMethod({ type: '', method: '' });
      setChanel("");
      setAmount("");
      setMobileNumber("");
      setSelectedBank(null);
      setUserBankName("");
      setUserBranchName("");
      setUserAccountHolderName("");
      setUserRoutingNumber("");
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
              onSelect={(methodObj) => {
                setSelectedMethod(methodObj);
                setChanel("");
              }}
              t={t}
            />
          )}

          {/* Wallet Agent Payment Methods */}
          {walletAgentBanks.length > 0 && (
            <WalletAgentPaymentMethodSelector
              walletAgentBanks={walletAgentBanks}
              paymentMethods={paymentMethods}
              selectedMethod={selectedMethod}
              onSelect={(methodObj) => {
                setSelectedMethod(methodObj);
                setChanel("");
              }}
              t={t}
            />
          )}

          {/* Selected Method Indicator */}
          {amount && (
            <div className=" flex justify-center items-center">
            <h2 className=" items-center gap-2 px-4 py-2 bg-[#facc15] text-[#1a1f24] rounded-full  w-[100px] text-center font-bold text-2xl">
              
              {amount}
            </h2>
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
                    {isWalletAgentMethod && (
                      <div className="text-xs text-gray-400 mt-1">
                        Limit: ৳{bankObj.dailyLimit}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Channel Selection */}
          {selectedMethod.method && (
            <ChannelSelector
              channels={channels}
              selectedChannel={chanel}
              onSelect={setChanel}
            />
          )}

          {/* User's Bank Information for Direct Bank */}
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
          {selectedMethod.method && chanel && (
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
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full p-3 bg-[#22282e] text-white rounded-lg border border-gray-600 focus:border-[#facc15] focus:ring-1 focus:ring-[#facc15] outline-none"
                  placeholder={selectedMethod.method === "Bank" ? "Enter account number" : "Enter mobile number"}
                />
              </div>
            </div>
          )}

          {/* Withdraw Button */}
          {selectedMethod.method && chanel && (
            <button
              onClick={handleWithdraw}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                !amount || amount <= 0 || amount > user?.balance
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-[#facc15] text-[#1a1f24] hover:bg-[#e6b800] active:scale-95"
              }`}
              disabled={!amount || amount <= 0 || amount > user?.balance}
            >
              {!amount || amount <= 0 || amount > user?.balance 
                ? "Enter Valid Amount" 
                : `Withdraw ${formatCurrency(amount)}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
