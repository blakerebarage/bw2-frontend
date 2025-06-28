import SpinLoader from "@/components/loaders/SpinLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDeviceInfo from "@/Hook/useDeviceInfo";
import useDeviceManager from "@/Hook/useDeviceManager";
import {
  useLazyGetAuthenticatedUserQuery,
  useLoginUserMutation,
} from "@/redux/features/allApis/usersApi/usersApi";
import { setCredentials } from "@/redux/slices/authSlice";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaRedo,
  FaUser
} from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import { IoIosUnlock } from "react-icons/io";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

import logo from "../../../../public/logoBlack.png";
import { useWelcome } from '../../../UserContext/WelcomeContext';

const Login = () => {
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [getUser] = useLazyGetAuthenticatedUserQuery();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const navigate = useNavigate();
  const { addToast } = useToasts();
  const { triggerWelcome } = useWelcome();
  const { deviceId } = useDeviceManager();
  const deviceInfo = useDeviceInfo();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    mode: "onChange"
  });

  const watchInputCode = watch("inputCode", "");

  const generateVerificationCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
    reset({ inputCode: "" });
  };

  useEffect(() => {
    generateVerificationCode();
  }, []);

  const onSubmit = async (data) => {
    
    const { phoneOrUserName, password } = data;
    try {
      const { data: loginData } = await loginUser({ 
        phoneOrUserName, 
        password,
        deviceId,
        deviceInfo
      });
    
      
      if (loginData.token) {
        const { data: userData } = await getUser(loginData.token);
        dispatch(setCredentials({ 
          token: loginData.token, 
          user: userData?.data,
          session: loginData.session,
          deviceId,
          deviceInfo
        }));

        addToast("Login successful", {
          appearance: "success",
          autoDismiss: true,
        });

        if (userData?.user?.role !== "admin") {
          triggerWelcome();
          navigate("/");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error.response?.status === 401 && 
          error.response?.data?.message === "Session expired. Please log in again.") {
        addToast("Your session has expired. Please log in again.", {
          appearance: "error",
          autoDismiss: true,
        });
      } else {
        addToast("Provide valid Phone Or UserName and password", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  };

  const isLoginDisabled = !(watchInputCode === verificationCode) || !isValid || isLoading;


 

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f24] to-[#0f1419] flex items-center justify-center p-4 mt-12">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#facc15] via-[#e6b800] to-[#d4af00] flex items-center justify-center shadow-2xl border-4 border-[#facc15]/30">
            <div className="w-28 h-28 rounded-full bg-white/90 flex items-center justify-center shadow-inner" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
              <img 
                src={logo}
                alt="Our Bet" 
                className="w-24 h-24 object-contain drop-shadow-md" 
                
                loading="lazy"
              />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-lg">Sign in to your account to continue</p>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent mx-auto rounded-full"></div>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#1a1f24] rounded-xl shadow-2xl border border-[#facc15]/20 p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Phone/Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Phone/Username
              </label>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#facc15] text-lg" />
                <Input
                  type="text"
                  {...register("phoneOrUserName", {
                    required: "Phone/Username is required",
                    minLength: { value: 4, message: "Minimum 4 characters"}
                  })}
                  placeholder="Enter your phone or username"
                  className="pl-12 h-12 w-full rounded-lg bg-[#22282e] border border-[#facc15]/30 text-white placeholder-gray-400 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 transition-all"
                  aria-invalid={errors.phoneOrUserName ? "true" : "false"}
                />
              </div>
              {errors.phoneOrUserName && (
                <p className="text-sm text-red-400 flex items-center gap-2 mt-1">
                  <FaInfoCircle className="text-sm" />
                  {errors.phoneOrUserName.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Password
              </label>
              <div className="relative group">
                <IoIosUnlock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#facc15] text-xl" />
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: {
                      value: true,
                      message: "Password is required"
                    },
                    minLength: { value: 8, message: "Minimum 8 characters" }
                  })}
                  placeholder="Enter your password"
                  className="pl-12 pr-12 h-12 w-full rounded-lg bg-[#22282e] border border-[#facc15]/30 text-white placeholder-gray-400 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 transition-all"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#facc15] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 flex items-center gap-2 mt-1">
                  <FaInfoCircle className="text-sm" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Verification Code Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Verification Code
              </label>
              <div className="relative group">
                <FaShield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#facc15] text-lg" />
                <Input
                  type="text"
                  {...register("inputCode", {
                    required: "Validation code is required",
                    validate: value => value === verificationCode || "Invalid verification code"
                  })}
                  placeholder="Enter verification code"
                  className="pl-12 pr-24 h-12 w-full rounded-lg bg-[#22282e] border border-[#facc15]/30 text-white placeholder-gray-400 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 transition-all"
                  aria-invalid={errors.inputCode ? "true" : "false"}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                  <span className="text-lg font-bold text-[#facc15] select-none px-2 py-1 bg-[#facc15]/10 rounded border border-[#facc15]/30">
                    {verificationCode}
                  </span>
                  <button
                    type="button"
                    onClick={generateVerificationCode}
                    className="text-[#facc15] hover:text-[#facc15]/80 transition-all hover:rotate-180 duration-300"
                    aria-label="Generate new verification code"
                  >
                    <FaRedo className="text-lg" />
                  </button>
                </div>
              </div>
              {errors.inputCode && (
                <p className="text-sm text-red-400 flex items-center gap-2 mt-1">
                  <FaInfoCircle className="text-sm" />
                  {errors.inputCode.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoginDisabled}
              className="w-full h-12 bg-[#facc15] hover:bg-[#e6b800] text-[#1a1f24] font-semibold rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none shadow-md border-2 border-transparent hover:border-[#facc15]/20"
              style={{
                background: isLoginDisabled ? '#facc15' : '#facc15',
                opacity: isLoginDisabled ? '0.5' : '1',
                WebkitTransform: 'translateZ(0)', // Hardware acceleration for better performance
                MozTransform: 'translateZ(0)',
                transform: 'translateZ(0)'
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <SpinLoader />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#facc15]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1f24] text-gray-400">Don't have an account?</span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              to="/signup"
              className="w-full h-12 bg-transparent border-2 border-[#facc15] text-[#facc15] hover:bg-[#facc15] hover:text-[#1a1f24] font-semibold rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center"
            >
              Create New Account
            </Link>
          </form>
        </div>

       
      </div>
    </div>
  );
};

export default Login;
