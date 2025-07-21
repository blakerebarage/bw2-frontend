import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import useManualUserDataReload from "@/Hook/useUserDataReload";
import { useAddUserMutation, useCompleteWithdrawalMutation, useGetUserTransactionsQuery, useInitiateWithdrawalMutation, useLazyGetActiveOtpQuery, useSendBalanceMutation } from "@/redux/features/allApis/usersApi/usersApi";
import { logout } from "@/redux/slices/authSlice";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowDown, FaArrowRight, FaCopy, FaEye, FaEyeSlash, FaHistory, FaMoneyBillWave, FaPaperPlane, FaTimes, FaUserCheck, FaUserPlus, FaWallet } from "react-icons/fa";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import LanguageSwitcher from "./LanguageSwitcher/LanguageSwitcher";

const CashAgentPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const { formatCurrency } = useCurrency();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { reloadUserData } = useManualUserDataReload();
  const axiosSecure = useAxiosSecure();
  
  // Balance sending states
  const [receiverUsername, setReceiverUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  
  // User creation states
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  
  // User withdrawal states  
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawUsername, setWithdrawUsername] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawOtp, setWithdrawOtp] = useState(["", "", "", "", "", ""]); // Change to array for 6 digits
  const [withdrawStep, setWithdrawStep] = useState(1); // 1: Enter details, 2: Enter OTP
  const [hasRestoredState, setHasRestoredState] = useState(false); // Flag to prevent multiple restorations

  // Commission states
  const [showCommissions, setShowCommissions] = useState(false);
  const [commissionsData, setCommissionsData] = useState([]);
  const [commissionsLoading, setCommissionsLoading] = useState(false);
  const [commissionsPage, setCommissionsPage] = useState(1);
  const [commissionsPagination, setCommissionsPagination] = useState(null);

  // OTP display states for Cash Agent Panel
  const [showOtpDisplay, setShowOtpDisplay] = useState(false);
  const [activeOtpData, setActiveOtpData] = useState(null);
  const [otpVisible, setOtpVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Use RTK Query mutations and queries
  const [sendBalance, { isLoading: sendingBalance }] = useSendBalanceMutation();
  const [addUser, { isLoading: creatingUser }] = useAddUserMutation();

  const [initiateWithdrawal, { isLoading: initiatingWithdrawal }] = useInitiateWithdrawalMutation();
  const [completeWithdrawal, { isLoading: completingWithdrawal }] = useCompleteWithdrawalMutation();
  const [getActiveOtp] = useLazyGetActiveOtpQuery();
  const { data: transactionsData, refetch: refetchTransactions } = useGetUserTransactionsQuery(
    { username: user?.username, page: 1, limit: 5 },
    { skip: !user?.username }
  );

  // Keys for localStorage
  const WITHDRAWAL_STATE_KEY = `withdrawal_state_${user?.username}`;
  useEffect(() => {
    reloadUserData()
  }, [])
  // Save withdrawal state to localStorage
  const saveWithdrawalState = (state) => {
    try {
      localStorage.setItem(WITHDRAWAL_STATE_KEY, JSON.stringify({
        ...state,
        timestamp: Date.now(), // Add timestamp for expiry
        restored: false // Flag to track if already restored
      }));
    } catch (error) {
      console.error("Failed to save withdrawal state:", error);
    }
  };

  // Load withdrawal state from localStorage
  const loadWithdrawalState = () => {
    try {
      const savedState = localStorage.getItem(WITHDRAWAL_STATE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        const now = Date.now();
        const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
        
        // Check if state is not older than 15 minutes and not already restored
        if (parsedState.timestamp && (now - parsedState.timestamp) < fifteenMinutes && !parsedState.restored) {
          return parsedState;
        } else {
          // Remove expired or already restored state
          localStorage.removeItem(WITHDRAWAL_STATE_KEY);
        }
      }
    } catch (error) {
      console.error("Failed to load withdrawal state:", error);
    }
    return null;
  };

  // Mark state as restored in localStorage
  const markStateAsRestored = () => {
    try {
      const savedState = localStorage.getItem(WITHDRAWAL_STATE_KEY);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        parsedState.restored = true;
        localStorage.setItem(WITHDRAWAL_STATE_KEY, JSON.stringify(parsedState));
      }
    } catch (error) {
      console.error("Failed to mark state as restored:", error);
    }
  };

  // Clear withdrawal state from localStorage
  const clearWithdrawalState = () => {
    try {
      localStorage.removeItem(WITHDRAWAL_STATE_KEY);
    } catch (error) {
      console.error("Failed to clear withdrawal state:", error);
    }
  };

  // Handle OTP input changes with auto-focus navigation
  const handleOtpChange = (index, value) => {
    // Get the last character entered (for when user types multiple characters)
    const digit = value.slice(-1);
    
    // Only allow numeric input or empty string
    if (digit && !/^[0-9]$/.test(digit)) return;
    
    const newOtp = [...withdrawOtp];
    newOtp[index] = digit;
    setWithdrawOtp(newOtp);
    
    // Auto focus next input only if a digit was entered and there's a next input
    if (digit && index < 5) {
      const nextInput = document.querySelector(`[data-otp-index="${index + 1}"]`);
      if (nextInput) {
        setTimeout(() => nextInput.focus(), 0); // Use setTimeout to ensure state update completes
      }
    }
  };

  // Handle OTP backspace navigation
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!withdrawOtp[index] && index > 0) {
        // If current input is empty, move to previous and clear it
        const newOtp = [...withdrawOtp];
        newOtp[index - 1] = '';
        setWithdrawOtp(newOtp);
        
        const prevInput = document.querySelector(`[data-otp-index="${index - 1}"]`);
        if (prevInput) {
          setTimeout(() => prevInput.focus(), 0);
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.querySelector(`[data-otp-index="${index - 1}"]`);
      if (prevInput) prevInput.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      const nextInput = document.querySelector(`[data-otp-index="${index + 1}"]`);
      if (nextInput) nextInput.focus();
    } else if (e.key === 'Delete') {
      // Handle Delete key to clear current input
      const newOtp = [...withdrawOtp];
      newOtp[index] = '';
      setWithdrawOtp(newOtp);
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e, startIndex) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').split('').slice(0, 6 - startIndex);
    
    if (digits.length > 0) {
      const newOtp = [...withdrawOtp];
      digits.forEach((digit, i) => {
        if (startIndex + i < 6) {
          newOtp[startIndex + i] = digit;
        }
      });
      setWithdrawOtp(newOtp);
      
      // Focus the next empty input or the last filled one
      const lastFilledIndex = Math.min(startIndex + digits.length - 1, 5);
      const nextEmptyIndex = newOtp.findIndex((digit, i) => i > lastFilledIndex && digit === '');
      const focusIndex = nextEmptyIndex === -1 ? Math.min(startIndex + digits.length, 5) : nextEmptyIndex;
      
      const targetInput = document.querySelector(`[data-otp-index="${focusIndex}"]`);
      if (targetInput) {
        setTimeout(() => targetInput.focus(), 0);
      }
    }
  };

  // Check for active OTP for cash-agent and sub-cash-agent
  useEffect(() => {
    
    if (user && ["cash-agent", "sub-cash-agent"].includes(user.role)) {
      const checkForActiveOtp = async () => {
        try {
          const result = await getActiveOtp();
          if (result.data && result.data.success) {
            setActiveOtpData(result.data.data);
            setShowOtpDisplay(true);
          }
        } catch (error) {
          console.error("Failed to fetch active OTP:", error);
        }
      };

      // Check immediately
      checkForActiveOtp();

      // Check every 30 seconds for new OTPs
      const interval = setInterval(checkForActiveOtp, 30000);

      return () => clearInterval(interval);
    }
  }, [user, getActiveOtp]);

  // Update countdown timer for OTP display
  useEffect(() => {
    if (activeOtpData?.expiresAt && showOtpDisplay) {
      const updateTimer = () => {
        const now = new Date();
        const expiry = new Date(activeOtpData.expiresAt);
        const diff = expiry - now;

        if (diff <= 0) {
          setTimeRemaining("Expired");
          setTimeout(() => setShowOtpDisplay(false), 2000);
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    }
  }, [activeOtpData, showOtpDisplay]);

  // Copy OTP to clipboard for Cash Agent Panel
  const copyOtpToClipboard = async () => {
    if (activeOtpData?.otp) {
      try {
        await navigator.clipboard.writeText(activeOtpData.otp);
        addToast("OTP copied to clipboard!", { appearance: "success", autoDismiss: true });
      } catch (error) {
        addToast("Failed to copy OTP", { appearance: "error", autoDismiss: true });
      }
    }
  };

  // Close OTP display
  const closeOtpDisplay = () => {
    setShowOtpDisplay(false);
    setActiveOtpData(null);
  };

  // Restore withdrawal state on component mount
  useEffect(() => {
    if (user?.username && !hasRestoredState) {
      const savedState = loadWithdrawalState();
      if (savedState) {
        setIsWithdrawModalOpen(true);
        setWithdrawUsername(savedState.withdrawUsername || "");
        setWithdrawAmount(savedState.withdrawAmount || "");
        setWithdrawOtp(savedState.withdrawOtp || ["", "", "", "", "", ""]);
        setWithdrawStep(savedState.withdrawStep || 1);
        
        // Show notification about restored state
        addToast(
          `Withdrawal process restored for ${savedState.withdrawUsername} (${formatCurrency(savedState.withdrawAmount)})`,
          { appearance: "info", autoDismiss: true }
        );
        
        // Mark the state as restored to prevent multiple restorations
        markStateAsRestored();
      }
      setHasRestoredState(true); // Mark as restored to prevent running again
    }
  }, [user?.username, hasRestoredState, formatCurrency, addToast]);

  // Add beforeunload event to warn about incomplete withdrawal
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isWithdrawModalOpen && withdrawStep === 2) {
        e.preventDefault();
        e.returnValue = "You have an incomplete withdrawal process. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isWithdrawModalOpen, withdrawStep]);

  // User creation form
  const {
    register,
    handleSubmit: handleCreateUserSubmit,
    watch,
    reset: resetUserForm,
    formState: { errors },
  } = useForm();

  const recentTransactions = transactionsData?.data?.results || [];

  // Fetch commissions data
  const fetchCommissions = async () => {
    try {
      setCommissionsLoading(true);
      const response = await axiosSecure.get(`/api/v1/finance/cash-agent-commissions?page=${commissionsPage}&limit=10`);
      
      if (response.data.success) {
        setCommissionsData(response.data.data.commissions || response.data.data || []);
        setCommissionsPagination(response.data.data.pagination || null);
      }
    } catch (error) {
      addToast("Failed to fetch commissions", { appearance: "error", autoDismiss: true });
    } finally {
      setCommissionsLoading(false);
    }
  };

  // Fetch commissions when page changes or component mounts
  useEffect(() => {
    if (showCommissions && user && ["cash-agent", "sub-cash-agent"].includes(user.role)) {
      fetchCommissions();
    }
  }, [commissionsPage, showCommissions]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    addToast("Logout successful", {
      appearance: "success",
      autoDismiss: true,
    });
    navigate("/");
  };

    const handleSendBalance = async (e) => {
    e.preventDefault();
    if (!receiverUsername || !amount) {
      addToast("Please enter both username and amount", { appearance: "error", autoDismiss: true });
      return;
    }

    try {
      // Use the raw result instead of .unwrap() to handle both success and error responses
      const response = await sendBalance({
        receiverUsername,
        amount: Number(amount),
      });
      
      console.log("Full RTK Response:", response);
      
      // Check if the response has data (successful HTTP call)
      if (response.data) {
        const result = response.data;
        console.log("API Response Data:", result);
        
        if (result.success) {
          addToast("Balance sent successfully!", { appearance: "success", autoDismiss: true });
          reloadUserData()
          setReceiverUsername("");
          setAmount("");
          refetchTransactions();
        } else {
          // Handle API returning success: false
          addToast(result.message || "Failed to send balance", { appearance: "error", autoDismiss: true });
        }
      } else if (response.error) {
        // Handle RTK Query error
        console.log("RTK Error:", response.error);
        const errorMessage = response.error?.data?.message || response.error?.message || "Error sending balance";
        addToast(errorMessage, { appearance: "error", autoDismiss: true });
      }
    } catch (err) {
      console.log("Caught error:", err);
      // Fallback error handling
      const errorMessage = err?.data?.message || err?.message || "Error sending balance";
      addToast(errorMessage, { appearance: "error", autoDismiss: true });
    }
    
  };

  // Generate referral code for new users
  const generateReferralCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPart = "";
    for (let i = 0; i < 8; i++) {
      randomPart += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return `${randomPart}`;
  };

  // Handle user creation
  const onCreateUserSubmit = async (data) => {
    const { confirmPassword, ...userInfo } = data;
    
    // Only allow sub-cash-agent creation for cash-agent
    if (user?.role === "cash-agent" && userInfo.role !== "sub-cash-agent") {
      addToast("Cash agents can only create sub-cash-agent users", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    
    const referrerCode = user?.referralCode || null;
    const referralCode = generateReferralCode();
    
    const finalUserInfo = {
      ...userInfo,
      referralCode,
      referredBy: referrerCode,
      requesterUserId: user?._id,
    };

    try {
      const result = await addUser(finalUserInfo);
      
      if (result?.data?.success) {
        addToast("User created successfully", {
          appearance: "success",
          autoDismiss: true,
        });
        setIsCreateUserModalOpen(false);
        resetUserForm();
      }

      if (result?.error) {
        addToast(result?.error?.data?.message || "Failed to create user", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    } catch (error) {
      addToast("Error creating user", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  // Handle user withdrawal - Step 1: Initiate withdrawal
  const handleInitiateWithdrawal = async (e) => {
    e.preventDefault();
    if (!withdrawUsername || !withdrawAmount) {
      addToast("Please enter both username and amount", { appearance: "error", autoDismiss: true });
      return;
    }

    try {
      const payload = {
        username: withdrawUsername,
        amount: Number(withdrawAmount),
      };

      const result = await initiateWithdrawal(payload).unwrap();

      if (result?.success) {
        addToast(result?.message || "OTP sent successfully! Please enter the OTP to complete withdrawal.", { appearance: "success", autoDismiss: true });
        setWithdrawStep(2); // Move to OTP step
        
        // Save withdrawal state to localStorage
        saveWithdrawalState({
          withdrawUsername,
          withdrawAmount,
          withdrawStep: 2,
          withdrawOtp: ["", "", "", "", "", ""] // Reset OTP for new session
        });
      }
    } catch (error) {
      addToast(error?.data?.message || "Error initiating withdrawal", { appearance: "error", autoDismiss: true });
    }
  };

  // Handle user withdrawal - Step 2: Complete withdrawal with OTP
  const handleCompleteWithdrawal = async (e) => {
    e.preventDefault();
    if (!withdrawOtp.every(digit => digit !== "")) { // Check if all digits are filled
      addToast("Please enter all 6 OTP digits", { appearance: "error", autoDismiss: true });
      return;
    }

    try {
      const payload = {
        username: withdrawUsername,
        amount: Number(withdrawAmount),
        otp: withdrawOtp.join(""), // Join array to string
      };

      const result = await completeWithdrawal(payload).unwrap();

      if (result?.success) {
        addToast(result?.message || "Amount withdrawn successfully!", { appearance: "success", autoDismiss: true });
        setWithdrawUsername("");
        setWithdrawAmount("");
        setWithdrawOtp(["", "", "", "", "", ""]); // Reset OTP
        setWithdrawStep(1);
        setIsWithdrawModalOpen(false);
        reloadUserData();
        refetchTransactions();
        
        // Clear withdrawal state from localStorage after successful completion
        clearWithdrawalState();
      }
    } catch (error) {
      addToast(error?.data?.message || "Error completing withdrawal", { appearance: "error", autoDismiss: true });
    }
  };

  // Reset withdrawal modal
  const resetWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    setWithdrawUsername("");
    setWithdrawAmount("");
    setWithdrawOtp(["", "", "", "", "", ""]); // Reset OTP
    setWithdrawStep(1);
    
    // Clear withdrawal state from localStorage when modal is closed
    clearWithdrawalState();
  };
  
  // Only render for cash-agent and sub-cash-agent roles
  if (!user || !["cash-agent", "sub-cash-agent"].includes(user.role)) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <FaUserCheck className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white capitalize">
                  {user.role.replace("-", " ")} Panel
                </h1>
                <p className="text-gray-300">Welcome back, {user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher variant="navbar" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 border border-red-500/30 hover:border-red-500/50"
                title="Logout"
              >
                <RiLogoutCircleLine className="text-lg" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-2xl mb-6">
              <div className="flex items-center justify-between mb-4">
                <FaWallet className="text-3xl opacity-80" />
                <div className="text-right">
                  <p className="text-sm opacity-90">Available Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(user.balance || 0)}</p>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-3 mt-4">
                <p className="text-sm opacity-90">Account Status</p>
                <p className="font-semibold">Active</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              {user?.role === "cash-agent" && (
                <button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white hover:bg-white/20 transition-all duration-200 flex items-center gap-3"
                >
                  <FaUserPlus className="text-green-400 text-xl" />
                  <span className="font-medium">Create Sub Cash Agent</span>
                </button>
              )}
              
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white hover:bg-white/20 transition-all duration-200 flex items-center gap-3"
              >
                <FaArrowDown className="text-red-400 text-xl" />
                <span className="font-medium">Withdraw from User</span>
              </button>

              <button
                onClick={() => {
                  setShowCommissions(!showCommissions);
                  if (!showCommissions) {
                    setCommissionsPage(1);
                  }
                }}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white hover:bg-white/20 transition-all duration-200 flex items-center gap-3"
              >
                <FaMoneyBillWave className="text-blue-400 text-xl" />
                <span className="font-medium">
                  {showCommissions ? 'Hide' : 'Show'} Commissions
                </span>
              </button>
            </div>
          </div>

          {/* Send Balance Form */}
          <div className="lg:col-span-3">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <FaPaperPlane className="text-yellow-400 text-xl" />
                <h2 className="text-xl font-bold text-white">Send Balance</h2>
              </div>
              
              <form onSubmit={handleSendBalance} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Receiver Username
                  </label>
                  <div className="relative">
                    <FaUserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter username"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      value={receiverUsername}
                      onChange={e => setReceiverUsername(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  disabled={sendingBalance}
                >
                  {sendingBalance ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send Balance
                      <FaArrowRight />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Commissions Section */}
        {showCommissions && (
          <div className="mt-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <FaMoneyBillWave className="text-blue-400 text-xl" />
                <h2 className="text-xl font-bold text-white">Commission Details</h2>
              </div>

              {/* Summary Cards */}
              {commissionsData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-400 text-sm font-medium">Deposits</p>
                        <p className="text-white text-2xl font-bold">
                          {formatCurrency(commissionsData
                            .filter(c => c.type === 'deposit')
                            .reduce((sum, c) => sum + c.commissionAmount, 0)
                          )}
                        </p>
                        <p className="text-green-400/70 text-xs">
                          {commissionsData.filter(c => c.type === 'deposit').length} transactions
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <FaArrowDown className="text-green-400 rotate-180" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-400 text-sm font-medium">Withdrawals</p>
                        <p className="text-white text-2xl font-bold">
                          {formatCurrency(commissionsData
                            .filter(c => c.type === 'withdraw')
                            .reduce((sum, c) => sum + c.commissionAmount, 0)
                          )}
                        </p>
                        <p className="text-red-400/70 text-xs">
                          {commissionsData.filter(c => c.type === 'withdraw').length} transactions
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <FaArrowDown className="text-red-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-400 text-sm font-medium">Total Commission</p>
                        <p className="text-white text-2xl font-bold">
                          {formatCurrency(commissionsData.reduce((sum, c) => sum + c.commissionAmount, 0))}
                        </p>
                        <p className="text-blue-400/70 text-xs">{commissionsData.length} total transactions</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <FaWallet className="text-blue-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Commissions Table */}
              {commissionsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : commissionsData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Transaction Amount</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Commission</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Rate</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Client</th>
                        <th className="text-left py-3 px-4 text-gray-300 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissionsData.map((commission, index) => (
                        <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4 text-gray-300">
                            {new Date(commission.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-3 px-4 text-white capitalize">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              commission.type === 'withdraw' ? 'bg-red-500/20 text-red-400' :
                              commission.type === 'deposit' ? 'bg-green-500/20 text-green-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {commission.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white font-medium">
                            {formatCurrency(commission.transactionAmount)}
                          </td>
                          <td className="py-3 px-4 text-yellow-400 font-bold">
                            {formatCurrency(commission.commissionAmount)}
                          </td>
                          <td className="py-3 px-4 text-gray-300">
                            {commission.commissionRate}%
                          </td>
                          <td className="py-3 px-4 text-gray-300">{commission.clientUsername || 'N/A'}</td>
                          <td className="py-3 px-4 text-gray-400 text-sm">
                            <div className="max-w-xs truncate" title={commission.description}>
                              {commission.description || `${commission.type} commission`}
                            </div>
                            <div className="text-xs text-gray-500 font-mono mt-1">
                              Ref: {commission.transactionRef}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {commissionsPagination && commissionsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                      <div className="text-gray-400 text-sm">
                        Showing page {commissionsPagination.page} of {commissionsPagination.totalPages} 
                        ({commissionsPagination.total} total commissions)
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCommissionsPage(prev => Math.max(prev - 1, 1))}
                          disabled={commissionsPagination.page === 1}
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCommissionsPage(prev => prev + 1)}
                          disabled={commissionsPagination.page >= commissionsPagination.totalPages}
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaMoneyBillWave className="text-gray-500 text-4xl mx-auto mb-4" />
                  <p className="text-gray-400">No commission data found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaHistory className="text-yellow-400 text-xl" />
                <h2 className="text-xl font-bold text-white">Recent Transactions</h2>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                {showHistory ? 'Hide' : 'Show All'}
              </button>
            </div>

            {showHistory && (
              <div className="space-y-3">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            <FaMoneyBillWave />
                          </div>
                          <div>
                            <p className="text-white font-medium capitalize">{transaction.type}</p>
                            <p className="text-gray-400 text-sm">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-gray-400 text-sm capitalize">{transaction.status}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FaHistory className="text-gray-500 text-4xl mx-auto mb-4" />
                    <p className="text-gray-400">No recent transactions</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create User Modal */}
        {isCreateUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <form
              onSubmit={handleCreateUserSubmit(onCreateUserSubmit)}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="text-lg font-semibold text-[#1f2937]">Create Sub Cash Agent</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateUserModalOpen(false);
                    resetUserForm();
                  }}
                  className="text-[#1f2937] hover:text-gray-500 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1f2937] mb-1">Username</label>
                  <input
                    type="text"
                    {...register("username", { required: "Username is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1f2937] mb-1">Phone Number</label>
                  <input
                    type="text"
                    {...register("phone", { required: "Phone number is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <input type="hidden" {...register("role")} value="sub-cash-agent" />

                <div>
                  <label className="block text-sm font-medium text-[#1f2937] mb-1">Password</label>
                  <input
                    type="password"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1f2937] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    {...register("confirmPassword", {
                      required: "Confirm Password is required",
                      validate: (value) =>
                        value === watch("password") || "Passwords do not match",
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {creatingUser ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Withdraw from User Modal */}
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <h3 className="text-lg font-semibold text-[#1f2937]">
                  {withdrawStep === 1 ? "Withdraw from User" : "Enter OTP to Complete Withdrawal"}
                </h3>
                <button
                  type="button"
                  onClick={resetWithdrawModal}
                  className="text-[#1f2937] hover:text-gray-500 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {withdrawStep === 1 ? (
                <form onSubmit={handleInitiateWithdrawal} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-1">Username</label>
                    <input
                      type="text"
                      placeholder="Enter username to withdraw from"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                      value={withdrawUsername}
                      onChange={e => setWithdrawUsername(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-1">Amount</label>
                    <input
                      type="number"
                      placeholder="Enter amount to withdraw"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                      value={withdrawAmount}
                      onChange={e => setWithdrawAmount(e.target.value)}
                      min="1"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <button
                      type="submit"
                      disabled={initiatingWithdrawal}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {initiatingWithdrawal ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className="mr-2" />
                          Send OTP
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCompleteWithdrawal} className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Withdrawal Details:</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-800">Username:</span>
                      <span className="text-gray-600">{withdrawUsername}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-800">Amount:</span>
                      <span className="text-gray-600">{formatCurrency(withdrawAmount)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-3">Enter OTP</label>
                    <div className="flex justify-center gap-3 mb-4">
                      {withdrawOtp.map((digit, index) => (
                        <input
                          key={index}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="•"
                          className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] transition-colors hover:border-gray-400"
                          value={digit}
                          onChange={e => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          onPaste={(e) => handleOtpPaste(e, index)}
                          onFocus={(e) => e.target.select()} // Select text on focus for easy replacement
                          onInput={(e) => {
                            // Additional safety: ensure only single digit
                            if (e.target.value.length > 1) {
                              e.target.value = e.target.value.slice(-1);
                            }
                          }}
                          maxLength="1"
                          data-otp-index={index}
                          autoComplete="off"
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 text-center">Please enter the 6-digit OTP code</p>
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setWithdrawStep(1)}
                      className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={completingWithdrawal}
                      className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {completingWithdrawal ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Completing...
                        </>
                      ) : (
                        <>
                          <FaArrowDown className="mr-2" />
                          Complete Withdrawal
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* OTP Display Overlay for Cash Agent Panel */}
      {showOtpDisplay && activeOtpData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <FaEye className="text-white text-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Active OTP</h3>
                  <p className="text-yellow-100 text-sm">Current withdrawal OTP</p>
                </div>
              </div>
              <button
                onClick={closeOtpDisplay}
                className="text-white/80 hover:text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* OTP Display */}
              <div className="text-center">
                <label className="block text-sm font-medium text-gray-700 mb-3">Current OTP Code:</label>
                <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex gap-1">
                    {(activeOtpData.otp || "").split('').map((digit, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 bg-yellow-100 border border-yellow-300 rounded-md flex items-center justify-center text-xl font-bold text-yellow-700"
                      >
                        {otpVisible ? digit : "•"}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setOtpVisible(!otpVisible)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                      title={otpVisible ? "Hide OTP" : "Show OTP"}
                    >
                      {otpVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      onClick={copyOtpToClipboard}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                      title="Copy OTP"
                    >
                      <FaCopy />
                    </button>
                  </div>
                </div>
              </div>

              {/* OTP Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">{formatCurrency(activeOtpData.amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Attempts:</span>
                  <span className="font-medium">{activeOtpData.attempts}/3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expires in:</span>
                  <span className={`font-medium ${timeRemaining === "Expired" ? "text-red-600" : "text-green-600"}`}>
                    {timeRemaining}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium text-xs">
                    {new Date(activeOtpData.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={closeOtpDisplay}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashAgentPanel; 