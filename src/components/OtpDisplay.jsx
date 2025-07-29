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
        case 'new_otp':
          setShowOtpDisplay(true);
          addToast('New OTP received!', {
            appearance: 'info',
            autoDismiss: true,
          });
          break;
        case 'otp_used':
          setShowOtpDisplay(false);
          addToast('OTP has been used', {
            appearance: 'success',
            autoDismiss: true,
          });
          break;
        case 'otp_expired':
          setShowOtpDisplay(false);
          addToast('OTP has expired', {
            appearance: 'warning',
            autoDismiss: true,
          });
          break;
        case 'otp_completed':
          setShowOtpDisplay(false);
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
    if (activeOtpData && activeOtpData.otp) {
      setShowOtpDisplay(true);
    }
  }, [activeOtpData]);

  useEffect(() => {
    handleActiveOtpData();
  }, [handleActiveOtpData]);

  // Copy OTP to clipboard
  const copyToClipboard = async () => {
    if (activeOtpData?.otp) {
      try {
        await navigator.clipboard.writeText(activeOtpData.otp);
        addToast('OTP copied to clipboard!', {
          appearance: 'success',
          autoDismiss: true,
        });
      } catch (err) {
        addToast('Failed to copy OTP', {
          appearance: 'error',
          autoDismiss: true,
        });
      }
    }
  };

  // Close OTP display
  const closeOtpDisplay = () => {
    setShowOtpDisplay(false);
    clearNewOtpFlag();
  };

  // Toggle OTP visibility
  const toggleOtpVisibility = () => {
    setOtpVisible(!otpVisible);
  };

  // Calculate time remaining
  useEffect(() => {
    if (activeOtpData?.expiresAt) {
      const updateTimeRemaining = () => {
        const now = new Date().getTime();
        const expiresAt = new Date(activeOtpData.expiresAt).getTime();
        const timeLeft = expiresAt - now;

        if (timeLeft <= 0) {
          setTimeRemaining("Expired");
        } else {
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);
          setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      };

      updateTimeRemaining();
      const interval = setInterval(updateTimeRemaining, 1000);

      return () => clearInterval(interval);
    }
  }, [activeOtpData?.expiresAt]);

  if (!isAuthorizedUser) {
    return null;
  }

  if (!showOtpDisplay || !activeOtpData?.otp) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">OTP Code</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleOtpVisibility}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {otpVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaCopy />
          </button>
          <button
            onClick={closeOtpDisplay}
            className="p-1 text-gray-500 hover:text-red-500 transition-colors"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-100 p-3 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">OTP Code:</p>
          <p className="text-2xl font-mono font-bold text-gray-800">
            {otpVisible ? activeOtpData.otp : '••••••'}
          </p>
        </div>

        {timeRemaining && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Time Remaining:</span>
            <span className={`text-sm font-medium ${
              timeRemaining === "Expired" ? "text-red-500" : "text-green-500"
            }`}>
              {timeRemaining}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className={`w-2 h-2 rounded-full ${
            isSocketConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span>{isSocketConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </div>
  );
};

export default OtpDisplay; 