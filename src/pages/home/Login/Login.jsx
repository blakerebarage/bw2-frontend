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
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  FaEye,
  FaEyeSlash,
  FaInfoCircle,
  FaUser
} from "react-icons/fa";
import { IoIosUnlock } from "react-icons/io";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

import logo from "../../../../public/logoBlack.png";
import { useLanguage } from '../../../contexts/LanguageContext';
import { trackLogin } from '../../../lib/facebookPixel';
import { useWelcome } from '../../../UserContext/WelcomeContext';

const Login = () => {
  const { t } = useLanguage();
  const [loginUser, { isLoading }] = useLoginUserMutation();
  const [getUser] = useLazyGetAuthenticatedUserQuery();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToasts();
  const { triggerWelcome } = useWelcome();
  const { deviceId } = useDeviceManager();
  const deviceInfo = useDeviceInfo();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange"
  });

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
        
        // Track successful login with Facebook Pixel
        trackLogin({
          user_id: userData?.data?._id,
          user_role: userData?.data?.role,
          login_method: 'username_password'
        });

        addToast(t('loginSuccess'), {
          appearance: "success",
          autoDismiss: true,
        });

        if (userData?.data?.role !== "admin" && userData?.data?.role !== "super-admin") {
          triggerWelcome();
          navigate("/");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error.response?.status === 401 && 
          error.response?.data?.message === "Session expired. Please log in again.") {
        addToast(t('sessionExpired'), {
          appearance: "error",
          autoDismiss: true,
        });
      } else {
        addToast(t('invalidCredentials'), {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  };

  const isLoginDisabled = !isValid || isLoading;

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
              {t('welcomeBack')}
            </h1>
            <p className="text-gray-400 text-lg">{t('signInToContinue')}</p>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#facc15] to-transparent mx-auto rounded-full"></div>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#1a1f24] rounded-xl shadow-2xl border border-[#facc15]/20 p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Phone/Username Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                {t('phoneUsername')}
              </label>
              <div className="relative group">
                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#facc15] text-lg" />
                <Input
                  type="text"
                  {...register("phoneOrUserName", {
                    required: `${t('phoneUsername')} ${t('isRequired')}`,
                    minLength: { value: 4, message: t('minimumCharacters').replace('{count}', '4')}
                  })}
                  placeholder={`${t('enterYour')} ${t('phoneUsername').toLowerCase()}`}
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
                {t('password')}
              </label>
              <div className="relative group">
                <IoIosUnlock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#facc15] text-xl" />
                <Input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: {
                      value: true,
                      message: `${t('password')} ${t('isRequired')}`
                    },
                    minLength: { value: 3, message: t('minimumCharacters').replace('{count}', '3') }
                  })}
                  placeholder={`${t('enterYour')} ${t('password').toLowerCase()}`}
                  className="pl-12 pr-12 h-12 w-full rounded-lg bg-[#22282e] border border-[#facc15]/30 text-white placeholder-gray-400 focus:border-[#facc15] focus:ring-2 focus:ring-[#facc15]/20 transition-all"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#facc15] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
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

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoginDisabled}
              className="w-full h-12 bg-[#facc15] hover:bg-[#e6b800] text-[#1a1f24] font-semibold rounded-lg transition-all duration-300 ease-in-out hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none shadow-md border-2 border-transparent hover:border-[#facc15]/20"
              style={{
                background: isLoginDisabled ? '#facc15' : '#facc15',
                opacity: isLoginDisabled ? '0.5' : '1',
                WebkitTransform: 'translateZ(0)',
                MozTransform: 'translateZ(0)',
                transform: 'translateZ(0)'
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <SpinLoader />
                  <span>{t('loading')}</span>
                </div>
              ) : (
                t('signIn')
              )}
            </Button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#facc15]/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1a1f24] text-gray-400">{t('dontHaveAccount')}</span>
              </div>
            </div>

            {/* Register Link */}
            <Link
              to="/signup"
              className="w-full h-12 bg-transparent border-2 border-[#facc15] text-[#facc15] hover:bg-[#facc15] hover:text-[#1a1f24] font-semibold rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center"
            >
              {t('createAccount')}
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
