import SpinLoader from "@/components/loaders/SpinLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import useDeviceInfo from "@/Hook/useDeviceInfo";
import useDeviceManager from "@/Hook/useDeviceManager";
import {
  useAddUserMutation,
  useLazyGetAuthenticatedUserQuery
} from "@/redux/features/allApis/usersApi/usersApi";
import { setCredentials } from "@/redux/slices/authSlice";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaMinus,
  FaPlus,
  FaRedo
} from "react-icons/fa";
import { FaFlag, FaShield } from "react-icons/fa6";
import { IoIosUnlock } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import logo from "../../../../public/logoBlack.png";
import { useLanguage } from '../../../contexts/LanguageContext';
import { trackRegistration } from '../../../lib/facebookPixel';
import { useWelcome } from '../../../UserContext/WelcomeContext';

const Register = () => {
  const { t } = useLanguage();
  const [addUser] = useAddUserMutation();
  const [getUser] = useLazyGetAuthenticatedUserQuery();
 
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { triggerWelcome } = useWelcome();
  const { deviceId } = useDeviceManager();

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
      email: "",
      password: "",
      confirmPassword: "",
      referCode: "",
      referredUser: "",
      validationCode: "",
     
    },
  });

  const [loading, setLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [showReferralCode, setShowReferralCode] = useState(false);

  const { addToast } = useToasts();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const deviceInfo = useDeviceInfo();
  
  const location = useLocation();
  const [linkId, setLinkId] = useState(null);
  const [affiliateCode, setAffiliateCode] = useState(null);
  const axiosSecure = useAxiosSecure();
  // Handle affiliate data through state
  useEffect(() => {
    generateVerificationCode();
    const params = new URLSearchParams(location.search);
    const linkIdParam = params.get("linkid");
    const affiliateCodeParam = params.get("affiliateCode");

    if (linkIdParam || affiliateCodeParam) {
      // Store in state
      if (linkIdParam) {
        localStorage.setItem("play9_aff_link", linkIdParam);
        setLinkId(linkIdParam);
      }

      if (affiliateCodeParam) {
        localStorage.setItem("play9_aff_code", affiliateCodeParam);
        setAffiliateCode(affiliateCodeParam);
        setValue("referCode", affiliateCodeParam);
        setShowReferralCode(false);
      }

      // Clean URL immediately by replacing state
      const cleanUrl = window.location.pathname;
      window.history.replaceState(
        { 
          linkId: linkIdParam,
          affiliateCode: affiliateCodeParam 
        },
        '',
        cleanUrl
      );
    } else {
      // Fallback to stored values (when user navigated away & back)
      const storedLink = localStorage.getItem("play9_aff_link");
      const storedAff = localStorage.getItem("play9_aff_code");
      
      if (storedLink) setLinkId(storedLink);
      if (storedAff) {
        setAffiliateCode(storedAff);
        setValue("referCode", storedAff);
        setShowReferralCode(false);
      }
    }
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
      password: data.password,
      role: "user",
      deviceInfo: deviceInfo,
      deviceId: deviceId,
    };
    
    // Only add email to userInfo if it has a value
    if (data.email && data.email.trim() !== "") {
      userInfo.email = data.email;
    }
   if(affiliateCode){
    userInfo.affiliateBy = affiliateCode;
   }
   if(data.referredUser){
    userInfo.referredUser = data.referredUser;
   }
    if (data.validationCode === verificationCode) {
      try {
        setLoading(true);
        
        const { data: registerData, error } = await addUser(userInfo);
       
        if (registerData?.success) {
          // Track successful registration with Facebook Pixel
          trackRegistration({
            user_id: registerData?.data?._id,
            registration_method: 'phone',
            has_referral: !!data.referCode,
            has_email: !!data.email
          });

          // Notify affiliate service about conversion
          if (linkId && registerData?.data?._id) {
            try {
              await axiosSecure.post(`/api/v1/affiliate/track/${linkId}/conversion`, {
                userId: registerData.data._id,
              });
              
              // cleanup so future sign-ups aren’t double counted
              localStorage.removeItem("play9_aff_link");
              localStorage.removeItem("play9_aff_code");
            } catch (convErr) {
              console.error("Affiliate conversion tracking failed", convErr);
            }
          }

          // Always clear stored affiliate params once the account is created
          localStorage.removeItem("play9_aff_link");
          localStorage.removeItem("play9_aff_code");

          // Check if registration response includes session/token for auto-login
          if (registerData.session && registerData.session.token) {
            try {
              // Get user data using the token from registration
              const { data: userData } = await getUser(registerData.session.token);
             
              // Set credentials to automatically log in the user
              dispatch(setCredentials({ 
                token: registerData.session.token, 
                user: userData?.data,
                session: registerData.session,
                deviceId,
                deviceInfo
              }));

              addToast("Registration successful! Welcome to Our Bet!", {
                appearance: "success",
                autoDismiss: true,
              });

              

              // Trigger welcome message and navigate to home
              triggerWelcome();
              navigate("/");
              
            } catch (authError) {
              // If auto-login fails, still show success but redirect to login
              console.error("Auto-login failed:", authError);
              addToast("Registration successful! Please log in to continue.", {
                appearance: "success",
                autoDismiss: true,
              });
              navigate("/login");
            }
          } else {
            // If no session token in response, show success and redirect to login
            addToast("Registration successful! Please log in to continue.", {
              appearance: "success",
              autoDismiss: true,
            });
            navigate("/login");
          }
        }
        
        if (error) {
          addToast(error.data?.message || error.message || "Registration failed", {
            appearance: "error",
            autoDismiss: true,
          });
        }
      } catch (error) {
        addToast(error.data?.message || error.message || "Registration failed", {
          appearance: "error",
          autoDismiss: true,
        });
      } finally {
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
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f24] to-[#0f1419] flex items-center justify-center p-4 mt-12">
      <div className="w-full max-w-lg">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#facc15] via-[#e6b800] to-[#d4af00] flex items-center justify-center shadow-2xl border-4 border-[#facc15]/30 backdrop-blur-sm">
            <div className="w-28 h-28 rounded-full bg-white/90 flex items-center justify-center shadow-inner">
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
              {t('createAccount')}
            </h1>
            <p className="text-gray-400 text-lg">{t('joinBettingJourney')}</p>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent mx-auto rounded-full"></div>
          </div>
        </div>

        {/* Register Form Card */}
        <div className="bg-[#1a1f24] rounded-xl shadow-2xl border border-[#facc15]/20 p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Phone Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                {t('phoneNumber')} <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <FaFlag className="text-[#facc15] text-lg" />
                  <span className="text-[#facc15] font-semibold text-sm">+88</span>
                </div>
                <Input
                  type="text"
                  placeholder="0XXXXXXXXX"
                  className="pl-20 h-12 w-full rounded-lg bg-[#22282e] border border-[#facc15]/30 text-white placeholder-gray-400 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 transition-all"
                  {...register("phone", {
                    required: `${t('phoneNumber')} is required.`,
                    pattern: {
                      value: /^[0-9]{11}$/,
                      message: "Phone number must be exactly 11 digits (e.g., 0XXXXXXXXX)"
                    },
                    validate: {
                      onlyNumbers: (value) => /^[0-9]+$/.test(value) || "Only numbers are allowed",
                      exactLength: (value) => value.length === 11 || "Phone number must be exactly 11 digits"
                    }
                  })}
                  aria-invalid={errors.phone ? "true" : "false"}
                  maxLength={11}
                  onKeyPress={(e) => {
                    // Only allow numbers
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-400 flex items-center gap-2 mt-1">
                  <FaInfoCircle className="text-sm" />
                  {errors.phone.message}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                💡 Enter 11-digit phone number (e.g., 0XXXXXXXXX)
              </p>
            </div>
            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                {t('password')} <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <IoIosUnlock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#facc15] text-xl" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={`Create a strong ${t('password').toLowerCase()}`}
                  className="pl-12 pr-12 h-12 w-full rounded-lg bg-[#22282e] border border-[#facc15]/30 text-white placeholder-gray-400 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 transition-all"
                  {...register("password", {
                    required: `${t('password')} is required.`,
                    minLength: { value: 8, message: "Minimum 8 characters." },
                  })}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <div
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#facc15] transition-colors cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                  tabIndex={0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </div>
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 flex items-center gap-2 mt-1">
                  <FaInfoCircle className="text-sm" />
                  {errors.password.message}
                </p>
              )}
            </div>

         
            {/* Referral Code Toggle Button - hidden when affiliate code present */}
            {!affiliateCode && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowReferralCode(!showReferralCode)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#facc15]/10 border border-[#facc15]/30 text-[#facc15] hover:bg-[#facc15]/20 rounded-lg transition-all text-sm font-medium"
                >
                  {showReferralCode ? <FaMinus className="text-sm" /> : <FaPlus className="text-sm" />}
                  {showReferralCode ? "Hide Referral Code" : t('haveReferralCode')}
                </button>
              </div>
            )}

            {/* Referral Code Input - Conditionally Rendered */}
            {showReferralCode && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  {t('haveReferralCode')}
                </label>
                <div className="relative group">
                  <FaShield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#facc15] text-lg" />
                  <Input
                    type="text"
                    placeholder="Enter Referral Code.."
                    className="pl-12 h-12 w-full rounded-lg bg-[#22282e] border border-[#facc15]/30 text-white placeholder-gray-400 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 transition-all"
                    {...register("referredUser")}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  💡 Enter Referral Code if you have.
                </p>
              </div>
            )}

            {/* Validation Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                {t('verificationCode')} <span className="text-red-400">*</span>
              </label>
              <div className="relative group">
                <FaShield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#facc15] text-lg" />
                <Input
                  type="text"
                  placeholder={t('enterVerificationCode')}
                  className="pl-12 pr-24 h-12 w-full rounded-lg bg-[#22282e] border border-[#facc15]/30 text-white placeholder-gray-400 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 transition-all"
                  {...register("validationCode", {
                    required: `${t('verificationCode')} is required.`,
                    validate: value => value === verificationCode || "Invalid verification code"
                  })}
                  aria-invalid={errors.validationCode ? "true" : "false"}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
                  <span className="text-lg font-bold text-[#facc15] select-none px-2 py-1 bg-[#facc15]/10 rounded border border-[#facc15]/30">
                    {verificationCode}
                  </span>
                  <FaRedo
                    className="text-[#facc15] hover:text-[#facc15]/80 transition-all cursor-pointer hover:rotate-180 duration-300"
                    onClick={generateVerificationCode}
                    role="button"
                    tabIndex={0}
                    aria-label="Generate new verification code"
                  />
                </div>
              </div>
              {errors.validationCode && (
                <p className="text-sm text-red-400 flex items-center gap-2 mt-1">
                  <FaInfoCircle className="text-sm" />
                  {errors.validationCode.message}
                </p>
              )}
            </div>

            {/* Register Button */}
            <Button
              type="submit"
              disabled={!isValid || loading}
              className="w-full h-12 bg-[#facc15] hover:bg-[#e6b800] text-[#1a1f24] font-semibold rounded-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <SpinLoader />
                  <span>{t('loading')}</span>
                </div>
              ) : (
                t('createAccount')
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#facc15]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1f24] text-gray-400">{t('alreadyHaveAccount')}</span>
              </div>
            </div>

            {/* Login Link */}
            <Link
              to="/login"
              className="w-full h-12 bg-transparent border-2 border-[#facc15] text-[#facc15] hover:bg-[#facc15] hover:text-[#1a1f24] font-semibold rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center"
            >
              {t('signIn')}
            </Link>
          </form>
        </div>

      
      </div>
    </div>
  );
};

export default Register;
