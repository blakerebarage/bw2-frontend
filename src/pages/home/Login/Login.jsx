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
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
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
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="w-full max-w-4xl mx-auto pt-8 ">
        <form onSubmit={handleSubmit(onSubmit)} className="from-gray-50 to-gray-100 p-8 space-y-6 transform  transition-all duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1b1f23]">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600">
              Please enter your credentials to continue
            </p>
          </div>

          {/* Phone/Username Input */}
          <div className="space-y-2">
            <div className="relative group">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
              <Input
                type="text"
                {...register("phoneOrUserName", {
                  required: "Phone/Username is required",
                  minLength: { value: 4, message: "Minimum 4 characters" }
                })}
                placeholder="Phone/Username"
                className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                aria-invalid={errors.phoneOrUserName ? "true" : "false"}
              />
            </div>
            {errors.phoneOrUserName && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                <FaInfoCircle className="text-sm" />
                {errors.phoneOrUserName.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <div className="relative group">
              <IoIosUnlock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: {
                    value: true,
                    message: "Password is required"
                  },
                  minLength: { value: 8, message: "Minimum 8 characters" }
                })}
                placeholder="Password"
                className="pl-10 pr-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                <FaInfoCircle className="text-sm" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Verification Code Input */}
          <div className="space-y-2">
            <div className="relative group">
              <FaShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
              <Input
                type="text"
                {...register("inputCode", {
                  required: "Validation code is required",
                  validate: value => value === verificationCode || "Invalid verification code"
                })}
                placeholder="Validation Code"
                className="pl-10 pr-24 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                aria-invalid={errors.inputCode ? "true" : "false"}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <span className="text-2xl font-bold text-[#1b1f23] select-none">{verificationCode}</span>
                <button
                  type="button"
                  onClick={generateVerificationCode}
                  className="text-[#1b1f23] hover:text-gray-600 transition-colors"
                  aria-label="Generate new verification code"
                >
                  <FaRedo className="text-lg hover:rotate-180 transition-transform duration-300" />
                </button>
              </div>
            </div>
            {errors.inputCode && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                <FaInfoCircle className="text-sm" />
                {errors.inputCode.message}
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center group">
            <input
              type="checkbox"
              {...register("rememberMe")}
              className="h-4 w-4 text-[#1b1f23] focus:ring-[#1b1f23] border-gray-300 rounded transition-colors group-hover:border-[#1b1f23]/50"
            />
            <label className="ml-2 block text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              I agree to the{" "}
              <a href="/terms-conditions" className="text-[#1b1f23] hover:underline transition-colors">Terms and Conditions</a>
            </label>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={isLoginDisabled}
            className="w-full h-12 bg-[#1b1f23] hover:bg-[#1b1f23]/90 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <SpinLoader />
                <span>Logging in...</span>
              </div>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
