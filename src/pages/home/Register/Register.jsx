import SpinLoader from "@/components/loaders/SpinLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import {
  useAddUserMutation
} from "@/redux/features/allApis/usersApi/usersApi";
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
import { MdEmail } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import image from "../../../../public/login.jpg";
import { useWelcome } from '../../../UserContext/WelcomeContext';

const Register = () => {
  const dispatch = useDispatch();
  const axiosSecure = useAxiosSecure()
  const [addUser] = useAddUserMutation();
  const navigate = useNavigate();
  const [referal, setReferal] = useState('SDFHSDJKFD');
  const { triggerWelcome } = useWelcome();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      phone: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      referCode: "",
      validationCode: "" ,
      terms: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { addToast } = useToasts();
  

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  // useEffect(() => {
  //   axiosSecure.get("/refCode").then((res) => {
  //     if (res.data.length > 0) {
  //       setReferal(res.data[0].refCode);
  //     }
  //   });
  // }, []);
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
  };

  const generateReferralCode = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const onSubmit = async (data) => {
    const referralCode = generateReferralCode();
    const referredBy = data.referCode || referal;

    const userInfo = {
      phone: data.phone,
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      referralCode,
      referredBy,
    };

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
          // Trigger welcome message after successful registration
          triggerWelcome();
          navigate("/login");
        }
        if (error) {
          
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Here you would typically send the credential to your backend
     
      // After successful registration, you can redirect or update your app state
      // navigate('/login');
    } catch (error) {
      
      addToast("Google registration failed", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleGoogleError = () => {
    
    addToast("Google registration failed", {
      appearance: "error",
      autoDismiss: true,
    });
  };

  const handleFacebookResponse = async (response) => {
    try {
      if (response.accessToken) {
        // Here you would typically send the token to your backend
       
        // After successful registration, you can redirect or update your app state
        // navigate('/login');
      }
    } catch (error) {
      
      addToast("Facebook registration failed", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 mt-12">
      <div className="relative">
        <img
          className="h-[200px] sm:h-[250px] w-full object-cover transform hover:scale-105 transition-transform duration-700"
          src={image}
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1f23]/50 to-transparent"></div>
      </div>
      <div className="w-full max-w-md mx-auto p-4">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl shadow-xl space-y-6 transform hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#1b1f23] mb-8">
            Create Account
          </h2>

          {/* phone Input */}
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
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500 animate-fade-in">{errors.phone.message}</p>
            )}
          </div>

          {/* Full Name Input */}
          <div className="relative group">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
            <Input
              type="text"
              placeholder="Full Name (optional)"
              className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
              {...register("fullName")}
            />
          </div>

          {/* Email Input */}
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
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500 animate-fade-in">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
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
            />
            <div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] hover:text-gray-600 transition-colors cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500 animate-fade-in">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
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
            />
            <div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] hover:text-gray-600 transition-colors cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500 animate-fade-in">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Referral Code */}
          <div className="relative group">
            <FaShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
            <Input
              type="text"
              placeholder="Referral Code (optional)"
              className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
              {...register("referCode")}
            />
          </div>

          {/* Validation Code */}
          <div className="relative group">
            <FaShield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl text-[#1b1f23] group-hover:text-[#1b1f23]/80 transition-colors" />
            <div className="flex">
              <Input
                type="text"
                placeholder="Validation Code*"
                className="pl-10 h-12 w-full rounded-xl border-gray-200 focus:border-[#1b1f23] focus:ring-2 focus:ring-[#1b1f23]/20 transition-all group-hover:border-[#1b1f23]/50"
                {...register("validationCode", {
                  required: "Validation code is required.",
                })}
              />
              <div className="absolute right-3 flex items-center mt-2">
                <span className="text-2xl font-bold text-[#1b1f23]">
                  {verificationCode}
                </span>
                <FaRedo
                  className="ml-2 mt-1 cursor-pointer text-[#1b1f23] hover:text-gray-600 transition-colors hover:rotate-180  duration-300"
                  onClick={generateVerificationCode}
                />
              </div>
            </div>
            {errors.validationCode && (
              <p className="mt-1 text-sm text-red-500 animate-fade-in">{errors.validationCode.message}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-center gap-2 group">
            <input
              type="checkbox"
              className="h-4 w-4 text-[#1b1f23] focus:ring-[#1b1f23] border-gray-300 rounded transition-colors group-hover:border-[#1b1f23]/50"
              {...register("terms", {
                required: "You must agree to the terms.",
              })}
            />
            <label className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              I agree and understand the{" "}
              <Link
                to="/terms-and-conditions"
                className="text-[#1b1f23] hover:underline transition-colors"
              >
                Terms & Conditions
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-500 animate-fade-in">{errors.terms.message}</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-[#1b1f23] hover:bg-[#1b1f23]/90 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? <SpinLoader /> : "Sign Up"}
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
        </form>
      </div>
    </div>
  );
};

export default Register;
