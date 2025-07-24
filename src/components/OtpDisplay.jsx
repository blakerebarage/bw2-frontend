import useOtpSocket from "@/Hook/useOtpSocket";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCopy, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const OtpDisplay = () => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const [showOtpDisplay, setShowOtpDisplay] = useState(false);
  const [otpVisible, setOtpVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");
  
  
  // Use socket hook for real-time OTP updates
  const { 
    activeOtpData, 
     
    lastEvent,
    clearNewOtpFlag, 
    clearLastEvent,
    isSocketConnected 
  } = useOtpSocket();

  // Memoize user role check to prevent re-renders
  const isAuthorizedUser = useMemo(() => {
    return user && ["super-admin", "admin", "agent", "user"].includes(user.role);
  }, [user?.role]);

  // Handle socket events and show notifications - use useCallback to prevent re-renders
  const handleLastEvent = useCallback(() => {
    if (lastEvent) {
      switch (lastEvent.type) {
        case 'active_otp_update':
          addToast('New OTP received!', {
            appearance: 'info',
            autoDismiss: true,
          });
          break;
        case 'otp_expired':
          addToast('OTP has expired', {
            appearance: 'warning',
            autoDismiss: true,
          });
          break;
        case 'otp_completed':
          addToast('OTP transaction completed', {
            appearance: 'success',
            autoDismiss: true,
          });
          break;
        default:
          break;
      }
      clearLastEvent();
    }
  }, [lastEvent, addToast, clearLastEvent]);

  useEffect(() => {
    handleLastEvent();
  }, [handleLastEvent]);

  // Check for active OTP when component mounts and user is logged in - only run once
  useEffect(() => {
    // Removed manual API call - now handled by useOtpSocket hook
  }, [isAuthorizedUser]); // Only depend on authorization status

  // Show OTP display when socket data is available - use useCallback
  const handleActiveOtpData = useCallback(() => {
    if (activeOtpData) {
      setShowOtpDisplay(true);
      clearNewOtpFlag(); // Clear the new OTP flag when displaying
    }
  }, [activeOtpData, clearNewOtpFlag]);

  useEffect(() => {
    handleActiveOtpData();
  }, [handleActiveOtpData]);

  // Update countdown timer - memoized to prevent re-renders
  const updateTimer = useCallback(() => {
    if (activeOtpData?.expiresAt && showOtpDisplay) {
      const now = new Date();
      const expiry = new Date(activeOtpData.expiresAt);
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining("Expired");
        setTimeout(() => setShowOtpDisplay(false), 2000); // Auto hide after showing expired
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }
  }, [activeOtpData?.expiresAt, showOtpDisplay]);

  useEffect(() => {
    updateTimer(); // Initial update
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [updateTimer]);

  // Copy OTP to clipboard
  const copyOtpToClipboard = useCallback(async () => {
    if (activeOtpData?.otp) {
      try {
        await navigator.clipboard.writeText(activeOtpData.otp);
        addToast("OTP copied to clipboard!", { appearance: "success", autoDismiss: true });
      } catch (error) {
        addToast("Failed to copy OTP", { appearance: "error", autoDismiss: true });
      }
    }
  }, [activeOtpData?.otp, addToast]);

  // Close OTP display - use useCallback to prevent re-renders
  const closeOtpDisplay = useCallback(() => {
    setShowOtpDisplay(false);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showOtpDisplay) {
        closeOtpDisplay();
      }
    };

    if (showOtpDisplay) {
      document.addEventListener('keydown', handleEscKey);
      return () => document.removeEventListener('keydown', handleEscKey);
    }
  }, [showOtpDisplay, closeOtpDisplay]);

  // Handle click outside to close
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      closeOtpDisplay();
    }
  }, [closeOtpDisplay]);

  // Debug socket connection
  const testSocketConnection = () => {
    if (socket) {
      console.log('Socket state:', {
        connected: socket.connected,
        id: socket.id,
        transport: socket.io.engine.transport.name
      });
      
      // Test emit a custom event
      socket.emit('test_event', { message: 'Testing socket connection' });
      console.log('Emitted test_event');
    } else {
      console.log('Socket not available');
    }
  };

  // Debug function to manually trigger recharge request update
  const testRechargeRequestUpdate = () => {
    if (socket) {
      // Simulate the backend emitting a recharge request update
      socket.emit('recharge_request_update', {
        timestamp: new Date().toISOString(),
        data: [
          {
            _id: 'test_id',
            status: 'pending',
            amount: 1000,
            username: 'test_user',
            referralCode: user?.referralCode
          }
        ]
      });
      console.log('Emitted test recharge_request_update');
    }
  };


  // Don't render if no user or not authorized or no OTP to show
  if (!user || !isAuthorizedUser || !showOtpDisplay || !activeOtpData) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
    >
      {/* Debug Section - Only in Development */}
     
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FaEye className="text-white text-sm" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Active OTP</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <span>{isSocketConnected ? 'Real-time' : 'Polling'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={closeOtpDisplay}
            className="text-white/80 hover:text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            title="Close OTP Display"
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
                    className="w-10 h-10 bg-blue-100 border border-blue-300 rounded-md flex items-center justify-center text-xl font-bold text-blue-700"
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
              <span className="font-medium">৳{activeOtpData.amount}</span>
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

          {/* Socket Status */}
          <div className={`rounded-lg p-3 text-sm ${isSocketConnected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={isSocketConnected ? 'text-green-800' : 'text-yellow-800'}>
              <strong>{isSocketConnected ? '🟢' : '🟡'}</strong> 
              {isSocketConnected 
                ? ' Real-time updates enabled via WebSocket' 
                : ' Using fallback polling method'
              }
            </p>
          </div>

          

          {/* Action Button */}
          <button
            onClick={closeOtpDisplay}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpDisplay; 