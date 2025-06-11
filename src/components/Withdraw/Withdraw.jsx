import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import useManualUserDataReload from "@/Hook/useUserDataReload";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

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
      >
        {channel}
      </button>
    ))}
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

  // Mobile banking: only show account number
  if (type !== "Bank") {
    return (
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-xs rounded-xl shadow-lg bg-gradient-to-br from-gray-700 to-gray-800 p-4 text-white overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
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
    <div className="flex justify-center mb-6">
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
            label="Routing Number" 
            value={bankDetails.routingNumber} 
            field="routing"
          />
        </div>
      </div>
    </div>
  );
};

export default function Withdraw() {
  const { user } = useSelector((state) => state.auth);
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  const [bank, setBank] = useState("");
  const [chanel, setChanel] = useState("");
  const [amount, setAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [bankTypes, setBankTypes] = useState([]);
  const [channels, setChannels] = useState([]);
  const [allBanks, setAllBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBankDetails, setSelectedBankDetails] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const { reloadUserData } = useManualUserDataReload();
  const [selectedBank, setSelectedBank] = useState(null);
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

  // Fetch all active banks and extract unique bank types and channels
  useEffect(() => {
    setLoading(true);
    axiosSecure
      .get(`/api/v1/finance/bank-list/${user.referredBy}`)
      .then((res) => {
        if (res.data.success) {
          const banks = res.data?.data?.filter(bank => bank.status === "active");
          setAllBanks(banks);
          const uniqueBankTypes = [...new Set(banks.map(bank => bank.bankType))];
          const sortedBankTypes = sortPaymentMethods(uniqueBankTypes);
          setBankTypes(sortedBankTypes);
        }
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to fetch bank information. Please try again.",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  // Update channels when bank changes
  useEffect(() => {
    if (!bank) {
      setChannels([]);
      setChanel("");
      setSelectedBankDetails(null);
      setSelectedBank(null);
      return;
    }
    const filtered = allBanks.filter(b => b.bankType === bank);
    const uniqueChannels = [...new Set(filtered.map(b => b.channel))];
    setChannels(uniqueChannels);
    setChanel("");
    setSelectedBankDetails(null);
    setSelectedBank(null);
  }, [bank, allBanks]);

  // Update selected bank details when both bank and channel are selected
  useEffect(() => {
    if (bank === "Bank" && selectedBank && chanel) {
      const filtered = allBanks.filter(b => b.bankType === bank && b.channel === chanel && b.bankName === selectedBank.bankName);
      setSelectedBankDetails(filtered[0] || null);
    } else if (bank && chanel) {
      const filtered = allBanks.filter(b => b.bankType === bank && b.channel === chanel);
      setSelectedBankDetails(filtered[0] || null);
    } else {
      setSelectedBankDetails(null);
    }
  }, [bank, chanel, allBanks, selectedBank]);

  // Fetch payment methods
  useEffect(() => {
    fetch("/Payment_Methods.json")
      .then((res) => res.json())
      .then((data) => setPaymentMethods(data))
      .catch(() => {});
  }, []);

  const handleWithdraw = async () => {
    if (!bank || !chanel || !amount || !mobileNumber) {
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
    if (bank === "Bank" && (!userBankName || !userBranchName || !userAccountHolderName || !userRoutingNumber)) {
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
      paymentMethod: bank,
      amount,
      withdrawAccountNumber: mobileNumber,
      channel: chanel,
      username: user.username,
      referralCode: user.referredBy,
      // Add user bank info for direct bank
      ...(bank === "Bank" && {
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
      setBank("");
      setChanel("");
      setAmount("");
      setMobileNumber("");
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
    <div className="min-h-screen bg-transparent backdrop-blur-md flex flex-col items-center px-6 pt-20">
      {/* Wallet Balance */}
      <div className="bg-gray-950/70 backdrop-blur-3xl shadow-2xl text-white w-full max-w-2xl p-6 rounded-md mb-8">
        <div className="text-sm text-gray-400">Total Wallet Balance</div>
        <div className="text-3xl font-bold text-yellow-400">{formatCurrency(user?.balance)}</div>
        <div className="text-sm mt-2 text-gray-400">Main Wallet: {formatCurrency(user?.balance)}</div>
        <Link to="/transaction-history" className="bg-gray-600 hover:bg-gray-700 text-xs px-3 py-1 rounded mt-4 float-right transition-colors duration-200">
          See transaction history
        </Link>
      </div>

      {/* Form */}
      <div className="bg-gray-950/70 backdrop-blur-3xl shadow-2xl w-full max-w-2xl p-6 rounded-md mb-8">
        <PaymentMethodSelector
          bankTypes={bankTypes}
          paymentMethods={paymentMethods}
          selectedMethod={bank}
          onSelect={setBank}
        />

        {bank && (
          <div className="mt-4 text-center w-2/4 mx-auto">
            <span className="inline-block px-4 py-2 bg-yellow-500 text-gray-900 rounded-full text-sm w-full font-bold">
              Selected: {bank}
            </span>
          </div>
        )}

        {/* Bank selection step for 'Bank' payment method */}
        {bank === "Bank" && (
          <div className="mt-6">
            <h2 className="text-base text-white mb-3">Select Bank</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allBanks.filter(b => b.bankType === "Bank").map((bankObj) => (
                <button
                  key={bankObj.bankName}
                  onClick={() => setSelectedBank(bankObj)}
                  className={`px-1 py-1 rounded-lg border text-sm transition-all duration-300 ease-in-out ${
                    selectedBank?.bankName === bankObj.bankName
                      ? "bg-yellow-500 text-black  transform scale-105"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  }`}
                >
                  {bankObj.bankName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Only show channel selector and bank card after a bank is selected */}
        {bank === "Bank" && selectedBank && (
          <div className="mt-6 mb-6">
            <h2 className="text-base font-semibold text-white mb-3">Select Channel</h2>
            <ChannelSelector
              channels={channels}
              selectedChannel={chanel}
              onSelect={setChanel}
            />
          </div>
        )}

        {/* {bank === "Bank" && selectedBank && chanel && selectedBankDetails && (
          <BankCard bankDetails={selectedBankDetails} type={bank} />
        )} */}

        {/* For non-bank methods, keep the old flow */}
        {bank !== "Bank" && bank && (
          <div className="mt-6 mb-6">
            <h2 className="text-base font-semibold text-white mb-3">Select Channel</h2>
            <ChannelSelector
              channels={channels}
              selectedChannel={chanel}
              onSelect={setChanel}
            />
          </div>
        )}
        {/* {bank !== "Bank" && chanel && selectedBankDetails && (
          <BankCard bankDetails={selectedBankDetails} type={bank} />
        )} */}

        {/* User's own bank info fields for direct bank */}
        {bank === "Bank" && selectedBank && (
          <div className="mt-6 mb-6 bg-gray-800/40 rounded-lg p-4 flex flex-col gap-4 border border-yellow-500/20">
            <h3 className="text-yellow-400 font-bold mb-2 text-base">Your Bank Information</h3>
            <div>
              <label className="text-white block mb-1 text-sm">Bank Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                value={userBankName}
                onChange={e => setUserBankName(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-900/40 text-yellow-400 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors duration-200"
                placeholder="Enter your bank name"
                required
              />
            </div>
            <div>
              <label className="text-white block mb-1 text-sm">Branch Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                value={userBranchName}
                onChange={e => setUserBranchName(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-900/40 text-yellow-400 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors duration-200"
                placeholder="Enter your branch name"
                required
              />
            </div>
            <div>
              <label className="text-white block mb-1 text-sm">Account Holder Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                value={userAccountHolderName}
                onChange={e => setUserAccountHolderName(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-900/40 text-yellow-400 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors duration-200"
                placeholder="Enter your account holder name"
                required
              />
            </div>
            <div>
              <label className="text-white block mb-1 text-sm">Routing Number<span className="text-red-500">*</span></label>
              <input
                type="text"
                value={userRoutingNumber}
                onChange={e => setUserRoutingNumber(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-900/40 text-yellow-400 border border-gray-700 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors duration-200"
                placeholder="Enter your routing number"
                required
              />
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="text-white block mb-2 text-sm">Amount<span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-800/20 text-blue-500 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
                placeholder="0.00"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                Available: {formatCurrency(user?.balance)}
              </div>
            </div>
          </div>

          {/* Account/Mobile Number */}
          <div>
            <label className="text-white block mb-2 text-sm">
              {bank === "Bank" ? "Account Number" : "Mobile Number"}<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-800/20 text-blue-500 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors duration-200"
              placeholder={bank === "Bank" ? "Enter account number" : "Enter mobile number"}
            />
          </div>
        </div>

        {/* Withdraw Button */}
        <button
          onClick={handleWithdraw}
          className={`
            mt-6 w-full px-6 py-3 font-bold rounded-md transition-all duration-300
            ${!amount || amount <= 0 || amount > user?.balance
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-yellow-500 text-black hover:bg-yellow-400 transform hover:scale-[1.02]"
            }
          `}
          disabled={!amount || amount <= 0 || amount > user?.balance}
        >
          {!amount || amount <= 0 || amount > user?.balance 
            ? "INSUFFICIENT BALANCE" 
            : "WITHDRAW"}
        </button>
      </div>
    </div>
  );
}
