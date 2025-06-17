import SpinLoader from "@/components/loaders/SpinLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useAddUserMutation
} from "@/redux/features/allApis/usersApi/usersApi";
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
import { MdEmail } from "react-icons/md";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import { useWelcome } from '../../../UserContext/WelcomeContext';

const Register = () => {
  const [addUser] = useAddUserMutation();
  const navigate = useNavigate();
  
  const { triggerWelcome } = useWelcome();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty, isValid },
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      phone: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      referCode: "",
      validationCode: "",
     
    },
  });

  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { addToast } = useToasts();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    generateVerificationCode();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === "admin" ? "/dashboard" : "/");
    }
  }, [isAuthenticated, user]);

  const generateVerificationCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
    setValue("validationCode", "");
  };

  
  const onSubmit = async (data) => {
    
    const userInfo = {
      phone: data.phone,
      fullName: data.fullName,
      password: data.password,
      referredBy: data.referCode ? data.referCode : "",
      role: "user",
    };
    // Only add email to userInfo if it has a value
    if (data.email && data.email.trim() !== "") {
      userInfo.email = data.email;
    }
 
    if (data.validationCode === verificationCode) {
      try {
        setLoading(true);
        const { data, error } = await addUser(userInfo)
        
        if (data.success) {
          addToast("Registration successful", {
            appearance: "success",
            autoDismiss: true,
          });
          setLoading(false);
          triggerWelcome();
          navigate("/login");
        }
        if (error) {
          addToast(error.message, {
            appearance: "error",
            autoDismiss: true,
          });
        }
      } catch (error) {
        addToast(error.message, {
          appearance: "error",
          autoDismiss: true,
        });
        setLoading(false);
      }
    } else {
      addToast("Verification code does not match", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-6">
      <div className="w-full max-w-4xl mx-auto pt-8 ">
        <form onSubmit={handleSubmit(onSubmit)} className="from-gray-50 to-gray-100 p-8 space-y-6 transform  transition-all duration-300">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1b1f23]">
              Sign Up
            </h2>
            <p className="text-sm text-gray-600">
              Fill in your details to create an account
            </p>
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <div className="relative group">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
              <Input
                type="text"
                placeholder="Phone*"
                className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                {...register("phone", {
                  required: "Phone or username is required.",
                  minLength: { value: 4, message: "Minimum 4 characters." },
                })}
                aria-invalid={errors.phone ? "true" : "false"}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                <FaInfoCircle className="text-sm" />
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Full Name Input */}
          <div className="space-y-2">
            <div className="relative group">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
              <Input
                type="text"
                placeholder="Full Name (optional)"
                className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                {...register("fullName")}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <div className="relative group">
              <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
              <Input
                type="email"
                placeholder="Email (optional)"
                className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                {...register("email", {
                  pattern: {
                    value: /^[\w-.]+@[\w-]+\.[a-z]{2,}$/i,
                    message: "Invalid email address.",
                  },
                })}
                aria-invalid={errors.email ? "true" : "false"}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                <FaInfoCircle className="text-sm" />
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="relative group">
              <IoIosUnlock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password*"
                className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                {...register("password", {
                  required: "Password is required.",
                  minLength: { value: 8, message: "Minimum 8 characters." },
                })}
                aria-invalid={errors.password ? "true" : "false"}
              />
              <div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] hover:text-gray-600 transition-colors cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                role="button"
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                <FaInfoCircle className="text-sm" />
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <div className="relative group">
              <IoIosUnlock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password*"
                className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                {...register("confirmPassword", {
                  required: "Please confirm your password.",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match.",
                })}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              <div
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] hover:text-gray-600 transition-colors cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                role="button"
                tabIndex={0}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                <FaInfoCircle className="text-sm" />
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Referral Code */}
          <div className="space-y-2">
            <div className="relative group">
              <FaShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
              <Input
                type="text"
                placeholder="Referral Code (optional)"
                className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                {...register("referCode")}
              />
            </div>
          </div>

          {/* Validation Code */}
          <div className="space-y-2">
            <div className="relative group">
              <FaShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
              <div className="flex">
                <Input
                  type="text"
                  placeholder="Validation Code*"
                  className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                  {...register("validationCode", {
                    required: "Validation code is required.",
                    validate: value => value === verificationCode || "Invalid verification code"
                  })}
                  aria-invalid={errors.validationCode ? "true" : "false"}
                />
                <div className="absolute right-3 flex items-center mt-2">
                  <span className="text-2xl font-bold text-[#1b1f23] select-none">
                    {verificationCode}
                  </span>
                  <FaRedo
                    className="ml-2 mt-1 cursor-pointer text-[#1b1f23] hover:text-gray-600 transition-colors hover:rotate-180 duration-300"
                    onClick={generateVerificationCode}
                    role="button"
                    tabIndex={0}
                    aria-label="Generate new verification code"
                  />
                </div>
              </div>
            </div>
            {errors.validationCode && (
              <p className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                <FaInfoCircle className="text-sm" />
                {errors.validationCode.message}
              </p>
            )}
          </div>

          

          <Button
            type="submit"
            disabled={!isValid || loading}
            className="w-full h-12 bg-[#1b1f23] hover:bg-[#1b1f23]/90 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <SpinLoader />
                <span>Creating account...</span>
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Register;
