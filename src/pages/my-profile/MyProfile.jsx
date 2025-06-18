import PageHeader from "@/components/shared/PageHeader";
import { Activity, Calendar, Eye, EyeOff, Mail, Phone, Shield, User } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import ActivityLog from "../activity-log/ActivityLog";

const MyProfile = () => {
  const { user } = useSelector((state) => state.auth);
  const [showActivity, setShowActivity] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f24] to-[#0f1419]">
      <PageHeader title="My Profile" />
      
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
                {user?.email || "No email provided"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#facc15] text-[#1a1f24]">
                  {user?.role || "User"}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#1a1f24] text-gray-300 rounded-lg hover:bg-[#22282e] transition-colors border border-[#facc15]/20"
          >
            {showSensitiveInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm font-medium">{showSensitiveInfo ? "Hide Info" : "Show Info"}</span>
          </button>
          {user?.role !== "user" && (
            <button
              onClick={() => setShowActivity(!showActivity)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#facc15] text-[#1a1f24] rounded-lg hover:bg-[#e6b800] transition-colors"
            >
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">{showActivity ? "Hide Activity" : "Activity"}</span>
            </button>
          )}
        </div>

        {/* Profile Details */}
        <div className="space-y-3">
          {[
            { 
              label: "Full Name", 
              value: user?.fullName, 
              icon: User,
              sensitive: false
            },
            { 
              label: "Username", 
              value: user?.username, 
              icon: User,
              sensitive: false
            },
            { 
              label: "Email", 
              value: user?.email, 
              icon: Mail,
              sensitive: true
            },
            { 
              label: "Phone Number", 
              value: user?.phone, 
              icon: Phone,
              sensitive: true
            },
            { 
              label: "Last Login", 
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
                Activity Log
              </h3>
            </div>
            <div className="p-4">
              <ActivityLog />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;

