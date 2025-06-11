import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import useAxiosSecure from "./../../../Hook/useAxiosSecure";

// Payment Method Selector Component
const PaymentMethodSelector = ({ bankTypes, paymentMethods, selectedMethod, onSelect }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-4 rounded-lg shadow-md bg-gray-900/80">
    {bankTypes.map((bankType) => {
      const methodInfo = paymentMethods.find(m => m.name === bankType);
      return (
        <div
          key={bankType}
          onClick={() => onSelect(bankType)}
          className={`relative group cursor-pointer transition-all duration-300 ease-in-out ${
            selectedMethod === bankType
              ? "ring-2 ring-yellow-400 bg-yellow-50/10"
              : "hover:bg-gray-800/50"
          }`}
        >
          <div className="relative w-16 h-16 mx-auto overflow-hidden rounded-lg p-2">
            <img
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
              src={methodInfo?.logo || ""}
              alt={bankType}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-sm font-medium">
                {bankType}
              </span>
            </div>
          </div>
          <div className="mt-1 text-center">
            <span className="text-xs text-gray-300">{bankType}</span>
          </div>
        </div>
      );
    })}
  </div>
);

// Channel Selector Component
const ChannelSelector = ({ channels, selectedChannel, onSelect }) => (
  <div className="flex flex-wrap gap-2">
    {channels.map((channel) => (
      <button
        key={channel}
        onClick={() => onSelect(channel)}
        className={`px-4 py-2 rounded-md border transition-all duration-300 ease-in-out ${
          selectedChannel === channel
            ? "bg-yellow-500 text-black font-bold transform scale-105"
            : "bg-gray-700 hover:bg-gray-600 text-gray-200"
        }`}
        disabled={channel === "Bank-Transfer"}
      >
        {channel}
      </button>
    ))}
  </div>
);

// Amount Selector Component
const AmountSelector = ({ amountOptions, selectedAmount, selectedAccount, onSelect }) => {
  const isAmountExceedsLimit = (amount) => {
    return selectedAccount && parseFloat(amount) > selectedAccount.dailyLimit;
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {amountOptions.map((amount) => {
        const exceedsLimit = isAmountExceedsLimit(amount);
        const isSelected = selectedAmount === amount;
        return (
          <button
            key={amount}
            onClick={() => onSelect(amount)}
            className={`relative px-3 py-2 rounded-md border transition-all duration-300 ease-in-out ${
              exceedsLimit
                ? "bg-gray-600 cursor-not-allowed opacity-50"
                : isSelected
                ? "bg-yellow-500 text-black font-bold transform scale-105"
                : "bg-gray-800 hover:bg-gray-700 text-gray-200"
            }`}
            disabled={exceedsLimit}
          >
            <span className="text-sm font-medium">৳ {amount}</span>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
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
      
    }
  };

  const CopyableField = ({ label, value, field }) => (
    <div className="relative group">
      <div className="flex items-center justify-between">
        <span className="text-xs opacity-80">{label}</span>
        <button
          onClick={() => copyToClipboard(value, field)}
          className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
        >
          {copiedField === field ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div 
        className="text-sm font-semibold cursor-pointer hover:text-yellow-400 transition-colors"
        onClick={() => copyToClipboard(value, field)}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div className="flex justify-center mt-4">
      <div className="relative w-full max-w-xs rounded-xl shadow-lg bg-gradient-to-br from-gray-700 to-gray-800 p-4 text-white overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
        
        <div className="flex flex-col gap-2">
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
  const [trxId, setTrxId] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [reference, setReference] = useState("");
  const [copiedField, setCopiedField] = useState(null);
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

  // Add this new function to check if amount is valid
  const isAmountValid = useCallback(() => {
    if (!selectedAmount) return false;
    if (!selectedAccount) return false;
    return parseFloat(selectedAmount) <= selectedAccount.dailyLimit;
  }, [selectedAmount, selectedAccount]);

  // Modify the getSuitableBankAccount function
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
          
          // Store bank list for bank selection
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
            // Filter banks by selected bank name
            const selectedBankData = activeBanks.find(bank => bank.bankName === selectedBank?.bankName);
            if (selectedBankData) {
              setSelectedAccount(selectedBankData);
              setSelectedBankDetails(selectedBankData);
            }
          } else if (isMobileBanking(selectedMethod)) {
            setSelectedAccount(getSuitableBankAccount(parseFloat(selectedAmount), activeBanks));
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
  }, [selectedMethod, selectedChannel, selectedAmount, selectedBank, user.referredBy, axiosSecure, isMobileBanking, getSuitableBankAccount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validateFields = () => {
      if (selectedMethod === "Bank") {
        return !selectedAmount || !selectedMethod || !selectedBank || !reference;
      }
      return !selectedAmount || !senderPhone || !selectedMethod || !selectedAccount;
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
      amount: parseFloat(selectedAmount),
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
          title: "Deposit Request Submitted!",
          text: `Amount: ৳${selectedAmount}, Method: ${selectedMethod}`,
          icon: "success",
          confirmButtonText: "OK",
        });
        // Reset form
        setTrxId("");
        setSenderPhone("");
        setSelectedAmount("");
        setSelectedMethod(null);
        setSelectedChannel("");
        setSelectedAccount(null);
        setSelectedBank(null);
        setReference("");
        document.getElementById("my_modal_1").close();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message,
      });
    }
  };
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
     
    }
  };
  const CopyableField = ({ label, value, field,  }) => (
     
    <div className="relative group">
      <div className="flex items-center justify-between">
        <span className="text-xs opacity-80">{label}</span>
        <button
          onClick={() => copyToClipboard(value, field)}
          className="text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
        >
          {copiedField === field ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div 
        className="text-sm font-semibold cursor-pointer hover:text-yellow-400 transition-colors"
        onClick={() => copyToClipboard(value, field)}
      >
        {value}
      </div>
    </div>
  );

  return (
    <div className="pt-12 max-w-3xl mx-auto">
      <div className="bg-gray-900/80 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
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
          {selectedMethod && (
            <div className="mt-4 text-center w-2/4 mx-auto">
              <span className="inline-block px-4 py-2 bg-yellow-500 text-gray-900  rounded-full text-sm w-full font-bold">
                Selected: {selectedMethod}
              </span>
            </div>
          )}
        </div>

        <div className="bg-gray-900/80 p-4 rounded-b-lg">
          {selectedMethod === "Bank" ? (
            <>
              <h2 className="text-base text-white mb-3">Select Bank</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {bankList.map((bank) => (
                  <button
                    key={bank.bankName}
                    onClick={() => {
                      setSelectedBank(bank);
                      setSelectedChannel("Bank-Transfer");
                    }}
                    className={`px-1 py-1 rounded-lg border text-sm transition-all duration-300 ease-in-out ${
                      selectedBank?.bankName === bank.bankName
                        ? "bg-yellow-500 text-black  transform scale-105"
                        : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    }`}
                  >
                    {bank.bankName}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-base text-white mb-3">Select Channel</h2>
              <ChannelSelector
                channels={selectedMethod ? filteredChannels : allChannels}
                selectedChannel={selectedChannel}
                onSelect={setSelectedChannel}
              />
            </>
          )}

          <h2 className="text-base font-semibold text-white mt-6 mb-3">Select Amount</h2>
          <AmountSelector
            amountOptions={selectedMethod === "Bank" ? bankamountOptions : amountOptions}
            selectedAmount={selectedAmount}
            selectedAccount={selectedBank || selectedAccount}
            onSelect={setSelectedAmount}
          />

          <div className="mt-4">
            <input
              type="number"
              placeholder="Enter Custom Amount"
              className={`w-full p-3 bg-gray-800 text-white rounded-md border transition-all duration-300 ${
                selectedAmount && !isAmountValid()
                  ? "border-red-500 focus:border-red-500" 
                  : "border-gray-700 focus:border-yellow-500"
              } focus:ring-1 focus:ring-yellow-500/20 focus:outline-none`}
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(e.target.value)}
              disabled={!selectedMethod || (selectedMethod === "Bank" ? !selectedBank : !selectedChannel)}
            />
          </div>

          <button
            className={`mt-6 w-full px-6 py-3 font-bold rounded-md transition-all duration-300 ${
              loading || !selectedMethod || 
              (selectedMethod === "Bank" ? !selectedBank : !selectedChannel) || 
              !selectedAmount || !isAmountValid()
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-yellow-500 text-black hover:bg-yellow-400 transform hover:scale-[1.02]"
            }`}
            onClick={() => document.getElementById("my_modal_1").showModal()}
            disabled={loading || !selectedMethod || 
              (selectedMethod === "Bank" ? !selectedBank : !selectedChannel) || 
              !selectedAmount || !isAmountValid()}
          >
            {loading
              ? "Processing..."
              : !selectedAccount && selectedAmount
                ? "No account available"
                : !isAmountValid()
                  ? "Select a valid amount"
                  : `Deposit ৳ ${selectedAmount}`
            }
          </button>
        </div>
      </div>

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box bg-gray-900 text-white max-w-md w-full mx-auto p-4 rounded-lg">
          {selectedMethod && (
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">Confirm Deposit</h2>
              <p className="text-sm text-gray-300 mt-1">
                Method: <span className="text-yellow-500 font-medium">{selectedMethod}</span>
              </p>
            </div>
          )}

          {selectedAmount && !selectedAccount && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-md">
              <p className="text-red-400 text-sm">
                No account available for this amount. Please enter a lower amount.
              </p>
            </div>
          )}
          
          {selectedAmount && selectedAccount && !isAmountValid() && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-md">
              <p className="text-red-400 text-sm">
                Maximum amount for this account is ৳{selectedAccount.dailyLimit}
              </p>
            </div>
          )}

          {selectedMethod === "Bank" && selectedBankDetails && (
            <BankCard bankDetails={selectedBankDetails} />
          )}

          {selectedMethod === "Bank" && (
            <div className="mt-4">
              <label className="block mb-2 text-sm text-gray-300">Reference / Remarks</label>
              <input
                type="text"
                className="w-full p-3 rounded-md border border-gray-700 bg-gray-800 text-white focus:ring-1 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your bank transfer reference or remarks"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
              />
            </div>
          )}
          
          {selectedMethod !== "Bank" && selectedAccount && (
            <>
              <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-700">
                <p className="text-sm font-medium text-yellow-500 mb-1">
                  Send money to this number:
                </p>
                <CopyableField 
                  label="Account Number"
                  value={selectedAccount.accountNumber}
                  field="accountNumber"
                />
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block mb-2 text-sm text-gray-300">Sender Phone</label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-md border border-gray-700 bg-gray-800 text-white focus:ring-1 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter Sender Phone"
                    value={senderPhone}
                    required
                    onChange={(e) => setSenderPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm text-gray-300">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 rounded-md border border-gray-700 bg-gray-800 text-white focus:ring-1 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter Transaction ID"
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="modal-action flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-yellow-500 text-black font-bold px-6 py-3 rounded-md hover:bg-yellow-400 transition-all duration-300 transform hover:scale-[1.02]"
            >
              Submit Deposit Request
            </button>
            <button
              onClick={() => document.getElementById("my_modal_1").close()}
              className="flex-1 bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default DepositSection;
