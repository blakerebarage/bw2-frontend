import { useLazyGetActiveOtpQuery } from "@/redux/features/allApis/usersApi/usersApi";
import { useEffect, useState } from "react";
import { FaCopy, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const OtpDisplay = () => {
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToasts();
  const [showOtpDisplay, setShowOtpDisplay] = useState(false);
  const [activeOtpData, setActiveOtpData] = useState(null);
  const [otpVisible, setOtpVisible] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [getActiveOtp] = useLazyGetActiveOtpQuery();

  // Check for active OTP when component mounts and user is logged in
  useEffect(() => {
    if (user && ["super-admin", "admin", "agent", "user"].includes(user.role)) {
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

  // Update countdown timer
  useEffect(() => {
    if (activeOtpData?.expiresAt && showOtpDisplay) {
      const updateTimer = () => {
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
      };

      updateTimer(); // Initial update
      const timer = setInterval(updateTimer, 1000);

      return () => clearInterval(timer);
    }
  }, [activeOtpData, showOtpDisplay]);

  // Copy OTP to clipboard
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

  // Don't render if no user or not authorized or no OTP to show
  if (!user || !["super-admin", "admin", "agent", "user"].includes(user.role) || !showOtpDisplay || !activeOtpData) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ease-out scale-100 opacity-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <FaEye className="text-white text-sm" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Active OTP</h3>
             
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

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              <strong>⚠️ Admin Only:</strong> This OTP display is for testing/admin purposes. 
              It will automatically refresh every 30 seconds to show new OTPs.
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