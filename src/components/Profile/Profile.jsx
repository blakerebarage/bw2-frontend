import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useUser } from "@/UserContext/UserContext";
import { Loader2, Lock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import AccountTabs from "../AccountTabs/AccountTabs";
import CommonNavMenu from "../CommonNavMenu/CommonNavMenu";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const { addToast } = useToasts();
  const { id } = useParams();
  const { selectedUser, setSelectedUser } = useUser();
  const { user } = useSelector((state) => state.auth);
  const axiosSecure = useAxiosSecure();

  // Fetch single user by ID
  const fetchSingleUser = useCallback(async (userId) => {
    if (!userId) return;
    
    setSelectedUserLoading(true);
    
    try {
      const response = await axiosSecure.get(`/api/v1/user/single/${userId}`);
      if (response.data?.success && response.data?.data) {
        setSelectedUser(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setSelectedUserLoading(false);
    }
  }, [axiosSecure, setSelectedUser]);

  // Fetch selected user when ID changes
  useEffect(() => {
    if (id) {
      fetchSingleUser(id);
    }
  }, [id, fetchSingleUser]);

  const [formData, setFormData] = useState({
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
      const response = await axiosSecure.patch("/api/v1/user/password-change", {
        username: selectedUser?.username,
        password: formData.newPassword
      });

      if (response.data.success) {
        addToast("Password changed successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
        setShowModal(false);
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      }
    } catch (error) {
      addToast(error.response?.data?.error || "Failed to change password", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen">
      <CommonNavMenu />
      <div className="flex flex-col md:flex-row px-4 py-6 gap-6">
        <AccountTabs id={id} />
        <div className="flex-1 space-y-6  border border-gray-200 rounded-lg p-4 drop-shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            👤 Profile Overview
          </h2>

          {/* About You Section */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between bg-gray-700 text-white px-6 py-4">
              <h3 className="text-lg font-semibold">About {selectedUser?.username}</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 text-base">
              {[
                "fullName",
                "username",
                "email",
                "phone",
                "lastLoginAt",
              ].map((field) => (
                <div key={field}>
                  <p className="text-gray-500 font-semibold capitalize">
                    {field.replace(/([A-Z])/g, " $1")}
                  </p>
                  <p className="text-gray-700 font-medium">
                    {selectedUser?.[field] || "--"}
                  </p>
                </div>
              ))}

              <div className="col-span-full">
                <p className="text-gray-500 font-semibold">Password</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-gray-700 tracking-widest">
                    •••••••••••••••
                  </p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    Change
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-700 text-white px-6 py-4">
              <h3 className="text-lg font-semibold">Contact Details</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
              <div>
                <p className="text-gray-500 font-semibold">Primary</p>
                <p className="text-gray-700 font-medium">
                  {selectedUser?.phone|| "***********"}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Change Password Modal */}
      {showModal && (
        <div
          id="admin-modal"
          className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center backdrop-blur-sm"
          onClick={(e) => e.target.id === "admin-modal" && setShowModal(false)}
        >
          <div className="bg-white w-full max-w-md mx-4 p-6 rounded-2xl shadow-2xl space-y-5 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">
                Change Password
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  required
                />
              </div>

              <div className="text-center pt-2">
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg transition flex items-center justify-center gap-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
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

export default Profile;