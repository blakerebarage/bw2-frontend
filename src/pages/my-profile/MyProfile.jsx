import PageHeader from "@/components/shared/PageHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { Activity, Calendar, Eye, EyeOff, Key, Loader2, Lock, Mail, Phone, Shield, User, X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import ActivityLog from "../activity-log/ActivityLog";

const MyProfile = () => {
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);
  const [showActivity, setShowActivity] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToasts();
  const axiosSecure = useAxiosSecure();

  // Form state for password change
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!formData.oldPassword) {
      addToast("Current password is required!", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      addToast("New password and confirm password do not match!", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      addToast("Password must be at least 8 characters long!", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axiosSecure.patch("/api/v1/user/reset-password", {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (response.data.success) {
        addToast("Password changed successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
        setShowPasswordModal(false);
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to change password", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f24] to-[#0f1419]">
      <PageHeader title={t('profile')} />
      
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {/* Profile Header Card */}
        <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#facc15] flex items-center justify-center text-2xl font-bold text-gray-900">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-[#facc15] truncate">
                {user?.fullName || user?.username || "User"}
              </h1>
              <p className="text-sm text-gray-300 truncate">
                {user?.email || t('noEmailProvided')}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#facc15] text-[#1a1f24]">
                  {user?.role || "User"}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  {t('active')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <button
            onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1f24] text-gray-300 rounded-lg hover:bg-[#22282e] transition-colors border border-[#facc15]/20"
          >
            {showSensitiveInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm font-medium">{showSensitiveInfo ? "Hide Info" : t('showInfo')}</span>
          </button>
          
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1f24] text-gray-300 rounded-lg hover:bg-[#22282e] transition-colors border border-[#facc15]/20"
          >
            <Key className="w-4 h-4" />
            <span className="text-sm font-medium">{t('changePassword')}</span>
          </button>

          {user?.role !== "user" && (
            <button
              onClick={() => setShowActivity(!showActivity)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#facc15] text-[#1a1f24] rounded-lg hover:bg-[#e6b800] transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">{showActivity ? "Hide Activity" : t('activity')}</span>
            </button>
          )}
        </div>

        {/* Profile Details */}
        <div className="space-y-3">
          {[
            { 
              label: t('fullName'), 
              value: user?.fullName, 
              icon: User,
              sensitive: false
            },
            { 
              label: t('username'), 
              value: user?.username, 
              icon: User,
              sensitive: false
            },
            { 
              label: t('email'), 
              value: user?.email, 
              icon: Mail,
              sensitive: true
            },
            { 
              label: t('phoneNumberField'), 
              value: user?.phone, 
              icon: Phone,
              sensitive: true
            },
            { 
              label: t('lastLogin'), 
              value: user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : null, 
              icon: Calendar,
              sensitive: false
            },
            { 
              label: "Role", 
              value: user?.role, 
              icon: Shield,
              sensitive: false
            },
          ].map(({ label, value, icon: Icon, sensitive }) => (
            <div key={label} className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#22282e] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#facc15]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-white truncate mt-1">
                    {sensitive && !showSensitiveInfo 
                      ? "••••••••" 
                      : value || "--"
                    }
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Section */}
        {showActivity && (
          <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#facc15]/20 bg-[#22282e]">
              <h3 className="text-sm font-medium text-[#facc15] flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {t('activity')} Log
              </h3>
            </div>
            <div className="p-4">
              <ActivityLog />
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1f24] w-full max-w-md rounded-lg shadow-xl border border-[#facc15]/20">
            <div className="flex items-center justify-between p-4 border-b border-[#facc15]/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#facc15] rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-[#1a1f24]" />
                </div>
                <h3 className="text-lg font-semibold text-[#facc15]">{t('changePassword')}</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 bg-[#22282e] border border-[#facc15]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#facc15] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-[#22282e] border border-[#facc15]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#facc15] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 bg-[#22282e] border border-[#facc15]/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#facc15] focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 text-gray-300 bg-[#22282e] rounded-lg hover:bg-[#2a3036] transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#facc15] text-[#1a1f24] rounded-lg hover:bg-[#e6b800] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;

