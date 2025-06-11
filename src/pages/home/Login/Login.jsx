import SpinLoader from "@/components/loaders/SpinLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FaRedo,
  FaUser
} from "react-icons/fa";
import { FaShield } from "react-icons/fa6";
import { IoIosUnlock } from "react-icons/io";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import image from "../../../../public/login.jpg";
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

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  // Watch form values
  const watchInputCode = watch("inputCode", "");

  // Function to generate a random 4-digit verification code
  const generateVerificationCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setVerificationCode(code);
  };

  useEffect(() => {
    generateVerificationCode();
  }, []);

  const onSubmit = async (data) => {
    const { phoneOrUserName, password } = data;
    try {
      const { data: loginData } = await loginUser({ phoneOrUserName, password });
      if (loginData.token) {
        const { data: userData } = await getUser(loginData.token);
        dispatch(setCredentials({ token: loginData.token, user: userData?.data,
          session: loginData.session
           }));
        addToast("Login successful", {
          appearance: "success",
          autoDismiss: true,
        });

        // Trigger welcome message for non-admin users
        if (userData?.user?.role !== "admin") {
          triggerWelcome();
          navigate("/");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      addToast("Provide valid Phone Or UserName and password", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Here you would typically send the credential to your backend
    
      // After successful login, you can redirect or update your app state
      // navigate('/dashboard');
    } catch (error) {
      
      addToast("Google login failed", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleGoogleError = () => {
   
    addToast("Google login failed", {
      appearance: "error",
      autoDismiss: true,
    });
  };

  const handleFacebookResponse = async (response) => {
    try {
      if (response.accessToken) {
        // Here you would typically send the token to your backend
       
        // After successful login, you can redirect or update your app state
        // navigate('/dashboard');
      }
    } catch (error) {
      
      addToast("Facebook login failed", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const isLoginDisabled = !(watchInputCode === verificationCode);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 mt-12">
      {/* Banner Image */}
      <div className="w-full h-[200px] sm:h-[250px] md:h-[300px] relative overflow-hidden">
        <img 
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 " 
          src={image} 
          alt="Login Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1f23]/50 to-transparent"></div>
      </div>

      {/* Login Form Container */}
      <div className="flex-1 w-full max-w-md mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-2xl shadow-xl transform hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#1b1f23] mb-8">
            Welcome Back
          </h2>

          {/* Phone/Username Input */}
          <div className="relative group">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
            <Input
              type="text"
              {...register("phoneOrUserName", {
                required: "Phone/Username is required",
              })}
              placeholder="Phone/Username"
              className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
            />
            {errors.phoneOrUserName && (
              <p className="mt-1 text-sm text-red-500 animate-fade-in">{errors.phoneOrUserName.message}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="relative group">
            <IoIosUnlock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-2xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
            <Input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: {
                  value: true,
                  message: "Password is required"
                }
              })}
              placeholder="Password"
              className="pl-10 pr-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] hover:text-gray-600 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500 animate-fade-in">{errors.password.message}</p>
            )}
          </div>

          {/* Verification Code Input */}
          <div className="relative group">
            <FaShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
            <Input
              type="text"
              {...register("inputCode", {
                required: "Validation code is required",
              })}
              placeholder="Validation Code"
              className="pl-10 pr-24 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#1b1f23]">{verificationCode}</span>
              <button
                type="button"
                onClick={() => {
                  generateVerificationCode();
                  reset({ inputCode: "" });
                }}
                className="text-[#1b1f23] hover:text-gray-600 transition-colors"
              >
                <FaRedo className="text-lg hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>
            {errors.inputCode && (
              <p className="mt-1 text-sm text-red-500 animate-fade-in">{errors.inputCode.message}</p>
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
            disabled={isLoginDisabled || isLoading}
            className="w-full h-12 bg-[#1b1f23] hover:bg-[#1b1f23]/90 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? <SpinLoader /> : "Login"}
          </Button>

          {/* Social Login Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Login Buttons */}
          {/* <div className=" flex justify-center items-center gap-x-2">
            <div className="w-full ">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                text="continue_with"
                shape="rectangular"
              />
            </div>
            
            <div className="w-full">
              <FacebookLogin
                appId="YOUR_FACEBOOK_APP_ID" // Replace with your Facebook App ID
                autoLoad={false}
                fields="name,email,picture"
                callback={handleFacebookResponse}
                cssClass=" bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-[8px] flex items-center justify-center py-2 px-4"
                  icon={
                    <FaFacebookF className="text-2xl" />
                  }
                  textButton="ContinueFacebook"
                
              />
            </div>
          </div> */}

          {/* Footer Links */}
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <a href="/privacy-policy" className="hover:text-[#1b1f23] transition-colors">Privacy Policy</a>
            <a href="/terms-conditions" className="hover:text-[#1b1f23] transition-colors">Terms and Conditions</a>
          </div>
        </form>
      </div>

      {/* Version Info */}
      <div className="text-center py-4 text-sm text-gray-500">
        V5.6.0 | 2025/1/8 - 12.6MB
      </div>
    </div>
  );
};

export default Login;
