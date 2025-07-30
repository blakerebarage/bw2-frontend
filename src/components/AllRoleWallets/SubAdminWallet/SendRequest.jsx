import { useSocket } from "@/contexts/SocketContext";
import useSoundNotification from "@/Hook/useSoundNotification";
import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import { Check, Copy, CreditCard, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import Swal from "sweetalert2";
import useAxiosSecure from "./../../../Hook/useAxiosSecure";
// Internal Payment Method Selector Component
const InternalPaymentMethodSelector = ({ systemBanks, paymentMethods, selectedMethod, onSelect }) => {
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
const WalletAgentPaymentMethodSelector = ({ walletAgentBanks, paymentMethods, selectedMethod, onSelect }) => {
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
  const [selectedMethod, setSelectedMethod] = useState({ type: '', method: '' });
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
  const [walletAgentBanks, setWalletAgentBanks] = useState([]);
  const [systemBanks, setSystemBanks] = useState([]);
  const [isWalletAgentMethod, setIsWalletAgentMethod] = useState(false);
  
  // Use sound notification hook
  const { handleDepositEvent } = useSoundNotification();
  
  // Use socket hook
  const { socket, isConnected } = useSocket();

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

  // Fetch system bank types and channels
  useEffect(() => {
    const fetchSystemBankInfo = async () => {
      try {
        setLoading(true);
        const res = await axiosSecure.get(`/api/v1/finance/bank-list/${user.referredBy}?purpose=Deposit`);
      
        if (res.data.success) {
          const banks = res.data.data.filter(bank => bank.status === "active");
          setSystemBanks(banks);
          const uniqueBankTypes = [...new Set(banks.map(bank => bank.bankType))];
          setBankTypes(sortPaymentMethods(uniqueBankTypes));
          setAllChannels([...new Set(banks.map(bank => bank.channel))]);
          
          if (selectedMethod.method === "Bank") {
            const activeBanks = banks.filter(bank => bank.bankType === "Bank");
            setBankList(activeBanks);
          }
        }
      } catch (err) {
        console.error("Failed to fetch system banks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSystemBankInfo();
  }, [user.referredBy, axiosSecure, sortPaymentMethods, selectedMethod]);

  // Fetch wallet agent banks
  useEffect(() => {
    const fetchWalletAgentBanks = async () => {
      try {
        const res = await axiosSecure.get(`/api/v1/finance/wallet-agent-bank-list?page=1&limit=100&purpose=Deposit`);
        if (res.data.success) {
          const banks = res.data.data.results.filter(bank => bank.status === "active" && bank.isWalletAgent);
          setWalletAgentBanks(banks);
          
          // Add wallet agent bank types to existing bank types
          const walletAgentBankTypes = [...new Set(banks.map(bank => bank.bankType))];
          setBankTypes(prevBankTypes => {
            const allBankTypes = [...new Set([...prevBankTypes, ...walletAgentBankTypes])];
            return sortPaymentMethods(allBankTypes);
          });
          
          // Add wallet agent channels to existing channels
          const walletAgentChannels = [...new Set(banks.map(bank => bank.channel))];
          setAllChannels(prevChannels => {
            const allChannels = [...new Set([...prevChannels, ...walletAgentChannels])];
            return allChannels;
          });
        }
      } catch (err) {
        console.error("Failed to fetch wallet agent banks:", err);
      }
    };
    fetchWalletAgentBanks();
  }, [axiosSecure, sortPaymentMethods]);

  // Update bank list when method changes
  useEffect(() => {
    if (selectedMethod.method === "Bank") {
      if (isWalletAgentMethod) {
        // Use wallet agent banks for Bank method
        const walletAgentBankBanks = walletAgentBanks.filter(bank => bank.bankType === "Bank");
        setBankList(walletAgentBankBanks);
      } else {
        // Use system banks for Bank method
        const systemBankBanks = systemBanks.filter(bank => bank.bankType === "Bank");
        setBankList(systemBankBanks);
      }
    }
  }, [selectedMethod, isWalletAgentMethod, walletAgentBanks, systemBanks]);

  // Update account list when method and channel change
  useEffect(() => {
    if (selectedMethod.method && selectedChannel && selectedMethod.method !== "Bank") {
      if (isWalletAgentMethod) {
        // Use wallet agent banks for this method and channel
        const methodChannelBanks = walletAgentBanks.filter(
          bank => bank.bankType === selectedMethod.method && bank.channel === selectedChannel
        );
        // Show all accounts for this method and channel
        setSelectedAccount(methodChannelBanks[0]); // Default to first account
      } else {
        // Use system banks for this method and channel
        const methodChannelBanks = systemBanks.filter(
          bank => bank.bankType === selectedMethod.method && bank.channel === selectedChannel
        );
        setSelectedAccount(methodChannelBanks[0]); // Default to first account
      }
    }
  }, [selectedMethod, selectedChannel, isWalletAgentMethod, walletAgentBanks, systemBanks]);

  // Fetch filtered channels
  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedMethod.method) {
        setFilteredChannels(allChannels);
        return;
      }
      try {
        setLoading(true);
        
        // Determine if it's a wallet agent method based on the selected type, not by checking if it exists in walletAgentBanks
        setIsWalletAgentMethod(selectedMethod.type === 'agent');
        
        if (selectedMethod.type === 'agent') {
          // Use wallet agent banks for this method
          const methodBanks = walletAgentBanks.filter(bank => bank.bankType === selectedMethod.method);
          const channels = [...new Set(methodBanks.map(bank => bank.channel))];
          setFilteredChannels(channels);
        } else {
          // Use system banks for this method
          const res = await axiosSecure.get(`/api/v1/finance/bank-list/${user.referredBy}?bankType=${selectedMethod.method}&purpose=Deposit`);
          if (res.data.success) {
            const channels = [...new Set(res.data.data.map(bank => bank.channel))];
            setFilteredChannels(channels);
          }
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
  }, [selectedMethod, user.referredBy, axiosSecure, allChannels, walletAgentBanks]);

  // Fetch bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      if (!selectedMethod.method || !selectedChannel) {
        setSelectedAccount(null);
        setSelectedBankDetails(null);
        return;
      }
      try {
        setLoading(true);
        
        if (isWalletAgentMethod) {
          // Use wallet agent banks
          const methodChannelBanks = walletAgentBanks.filter(
            bank => bank.bankType === selectedMethod.method && bank.channel === selectedChannel
          );
          
          if (methodChannelBanks.length > 0) {
            if (selectedMethod.method === "Bank") {
              const selectedBankData = methodChannelBanks.find(bank => bank._id === selectedBank?._id);
              if (selectedBankData) {
                setSelectedAccount(selectedBankData);
                setSelectedBankDetails(selectedBankData);
              }
            } else if (isMobileBanking(selectedMethod.method)) {
              const amount = customAmount || selectedAmount;
              setSelectedAccount(getSuitableBankAccount(parseFloat(amount), methodChannelBanks));
            } else {
              setSelectedAccount(methodChannelBanks[0]);
            }
          }
        } else {
          // Use system banks
          const res = await axiosSecure.get(
            `/api/v1/finance/bank-list/${user.referredBy}?bankType=${selectedMethod.method}&channel=${selectedChannel}&purpose=Deposit`
          );
          if (res.data.success) {
            const activeBanks = res.data.data.filter(bank => bank.status === "active");
            if (selectedMethod.method === "Bank") {
              const selectedBankData = activeBanks.find(bank => bank.bankName === selectedBank?.bankName);
              if (selectedBankData) {
                setSelectedAccount(selectedBankData);
                setSelectedBankDetails(selectedBankData);
              }
            } else if (isMobileBanking(selectedMethod.method)) {
              const amount = customAmount || selectedAmount;
              setSelectedAccount(getSuitableBankAccount(parseFloat(amount), activeBanks));
            } else {
              setSelectedAccount(activeBanks[0]);
            }
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
  }, [selectedMethod, selectedChannel, selectedAmount, customAmount, selectedBank, user.referredBy, axiosSecure, isMobileBanking, getSuitableBankAccount, isWalletAgentMethod, walletAgentBanks]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalAmount = customAmount || selectedAmount;
    
    const validateFields = () => {
      if (selectedMethod.method === "Bank") {
        return !finalAmount || !selectedMethod.method || !selectedBank || !reference;
      }
      return !finalAmount || !senderPhone || !selectedMethod.method || !selectedAccount;
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
      paymentMethod: selectedMethod.method,
      channel: selectedChannel,
      txnId: selectedMethod.method === "Bank" ? reference : trxId,
      senderPhone: selectedMethod.method === "Bank" ? undefined : senderPhone,
      referralCode: user.referredBy,
      status: "pending",
      adminNote: "Urgent recharge",
      accountNumber: selectedMethod.method === "Bank" ? selectedBank.accountNumber : selectedAccount.accountNumber,
      dailyLimit: selectedMethod.method === "Bank" ? selectedBank.dailyLimit : selectedAccount.dailyLimit,
      ...(isWalletAgentMethod && {
        walletAgentUsername: selectedMethod.method === "Bank" ? selectedBank.username : selectedAccount.username
      })
    };

    try {
      const res = await axiosSecure.post(`/api/v1/finance/create-recharge-request`, rechargeData);
      if (res.data.success) {
        // Play success sound for deposit request submission
        console.log('Playing deposit pending sound for amount:', finalAmount);
        handleDepositEvent('deposit_pending', { amount: finalAmount, method: selectedMethod.method });
        
        Swal.fire({
          title: "Request Submitted!",
          text: `Amount: ৳${finalAmount}, Method: ${selectedMethod.method}`,
          icon: "success",
          confirmButtonText: "OK",
        });
        // Reset form
        setTrxId("");
        setSenderPhone("");
        setSelectedAmount("");
        setCustomAmount("");
        setSelectedMethod({ type: '', method: '' });
        setSelectedChannel("");
        setSelectedAccount(null);
        setSelectedBank(null);
        setReference("");
        setSelectedBankDetails(null);
        document.getElementById("deposit_modal")?.close();
      }
    } catch (err) {
      // Play error sound for failed deposit request
      console.log('Playing deposit error sound for amount:', finalAmount);
      handleDepositEvent('deposit_error', { amount: finalAmount, method: selectedMethod.method });
      
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
          <h1 className="text-2xl font-bold text-[#facc15] mb-2">
            Deposit
          </h1>
          <p className="text-gray-300">Submit your deposit request</p>
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
                setSelectedChannel(methodObj.method === 'Bank' ? 'Bank-Transfer' : '');
              }}
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
                setSelectedChannel(methodObj.method === 'Bank' ? 'Bank-Transfer' : '');
              }}
            />
          )}

          {/* Selected Method Indicator */}
          {selectedMethod.method && (selectedAmount || customAmount) && (
            <div className=" flex justify-center items-center">
              <h2 className=" items-center gap-2 px-4 py-2 bg-[#facc15] text-[#1a1f24] rounded-full  w-[100px] text-center font-bold text-2xl">
                
                {selectedAmount || customAmount}
              </h2>
            </div>
          )}

          {/* Bank Selection for Bank Method */}
          {selectedMethod.method === "Bank" && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Select Bank</h3>
              <div className="grid grid-cols-2 gap-2">
                {bankList.map((bank) => (
                  <button
                    key={isWalletAgentMethod ? bank._id : bank.bankName}
                    onClick={() => {
                      setSelectedBank(bank);
                      setSelectedChannel("Bank-Transfer");
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      (isWalletAgentMethod 
                        ? selectedBank?._id === bank._id
                        : selectedBank?.bankName === bank.bankName)
                        ? "bg-[#facc15] text-[#1a1f24]"
                        : "bg-[#22282e] text-gray-300 hover:bg-[#2a323a] border border-gray-600"
                    }`}
                  >
                    {isWalletAgentMethod ? bank.username : bank.bankName}
                    {isWalletAgentMethod && (
                      <div className="text-xs text-gray-400 mt-1">
                        Limit: ৳{bank.dailyLimit}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Channel Selection for Non-Bank Methods */}
          {selectedMethod.method && selectedMethod.method !== "Bank" && (
            <ChannelSelector
              channels={filteredChannels}
              selectedChannel={selectedChannel}
              onSelect={setSelectedChannel}
            />
          )}

          {/* Amount Selection */}
          {selectedMethod.method && selectedChannel && (
            <AmountSelector
              amountOptions={selectedMethod.method === "Bank" ? bankamountOptions : amountOptions}
              selectedAmount={selectedAmount}
              selectedAccount={selectedBank || selectedAccount}
              onSelect={(amount) => {
                setSelectedAmount(amount);
                setCustomAmount("");
              }}
            />
          )}

          {/* Custom Amount Input */}
          {selectedMethod.method && selectedChannel && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Or Enter Custom Amount</h3>
              <input
                type="text"
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
              if (selectedMethod.method === "Bank") {
                if (!finalAmount || !selectedMethod.method || !selectedBank || !selectedChannel) {
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
                if (!finalAmount || !selectedMethod.method || !selectedChannel) {
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
              {selectedMethod.method && (
                <p className="text-gray-300">
                  Method: <span className="text-[#facc15] font-medium">{selectedMethod.method}</span>
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
            {selectedMethod.method === "Bank" && selectedBankDetails && (
              <div className="mb-6">
                <BankCard bankDetails={selectedBankDetails} />
              </div>
            )}

            {/* Mobile Banking Account Details */}
            {selectedMethod.method !== "Bank" && selectedAccount && (
              <div className="mb-6">
                <div className="bg-[#22282e] rounded-lg p-4 border border-[#facc15]/20">
                  <h3 className="text-[#facc15] font-medium mb-3 text-center">Send money to this number:</h3>
                  
                  {/* Account Selector for Multiple Accounts */}
                  {isWalletAgentMethod && (() => {
                    const methodChannelBanks = walletAgentBanks.filter(
                      bank => bank.bankType === selectedMethod.method && bank.channel === selectedChannel
                    );
                    if (methodChannelBanks.length > 1) {
                      return (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-400 mb-2">Select Account:</h4>
                          <div className="grid grid-cols-1 gap-2">
                            {methodChannelBanks.map((account) => (
                              <button
                                key={account._id}
                                onClick={() => setSelectedAccount(account)}
                                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                                  selectedAccount._id === account._id
                                    ? "bg-[#facc15] text-[#1a1f24]"
                                    : "bg-[#1a1f24] text-white border border-gray-600 hover:border-gray-500"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">{account.accountNumber}</p>
                                    <p className="text-xs text-gray-400">Username: {account.username}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs">Limit: ৳{account.dailyLimit}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  <div className="flex items-center justify-between p-3 bg-[#1a1f24] rounded-lg">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Account Number</p>
                      <p className="text-lg font-bold text-white">{selectedAccount.accountNumber}</p>
                      {isWalletAgentMethod && (
                        <p className="text-xs text-gray-400 mt-1">Username: {selectedAccount.username}</p>
                      )}
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
              {selectedMethod.method === "Bank" ? (
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