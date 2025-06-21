import useAxiosSecure from "@/Hook/useAxiosSecure";
import { Check, Clock, Copy, Key, Loader2, Lock, Mail, Phone, PhoneCall, User } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

const MyDashboardProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
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
        setShowModal(false);
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

  const handleCopy = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode).then(() => {
        setCopied(true);
        addToast("Referral code copied to clipboard!", {
          appearance: "success",
          autoDismiss: true,
        });
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        addToast("Failed to copy referral code", {
          appearance: "error",
          autoDismiss: true,
        });
      });
    }
  };

  const profileFields = [
    { key: "name", label: "Full Name", icon: User },
    { key: "username", label: "Username", icon: Phone },
    { key: "email", label: "Email", icon: Mail },
    { key: "phone", label: "Phone", icon: PhoneCall },
    { key: "lastLoginAt", label: "Last Login", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-sm text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileFields.map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">{label}</p>
                        <p className="mt-1 text-base font-medium text-gray-900">
                          {key === "lastLoginAt" 
                            ? user?.[key] 
                              ? moment(user[key]).format("Do MMM YYYY, h:mm a")
                              : "Never"
                            : user?.[key] || "--"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Referral Code Section */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Referral Code</h3>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Your unique referral code</p>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-lg font-bold text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                            {user?.referralCode || "--"}
                          </code>
                          <button
                            onClick={handleCopy}
                            disabled={!user?.referralCode}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                              copied
                                ? "bg-green-100 text-green-700"
                                : "bg-white text-blue-600 hover:bg-blue-50 border border-gray-200"
                            } ${!user?.referralCode ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {copied ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="text-sm font-medium">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span className="text-sm font-medium">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {user?.referralCode && (
                      <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        Share this code with friends to earn rewards!
                      </p>
                    )}
                  </div>
                </div>

                {/* Password Section */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <Key className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Password</h3>
                        <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowModal(true)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg transition-colors duration-200 w-full sm:w-auto"
                    >
                      <Lock className="w-4 h-4" />
                      <span className="text-sm font-medium">Change Password</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user?.createdAt ? moment(user.createdAt).format("MMM YYYY") : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Account Type</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {user?.role || "User"}
                  </span>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Our support team is here to help you with any questions or concerns.
              </p>
              <button className="w-full bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors duration-200">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showModal && (
        <div
          id="admin-modal"
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center backdrop-blur-sm p-4"
          onClick={(e) => e.target.id === "admin-modal" && setShowModal(false)}
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleInputChange}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Key className="w-4 h-4 text-gray-500" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Key className="w-4 h-4 text-gray-500" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Enter confirm new password"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 rounded-b-2xl">
              <form onSubmit={handleChangePassword}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDashboardProfile;
