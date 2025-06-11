import PageHeader from "@/components/shared/PageHeader";
import { Activity } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import ActivityLog from "../activity-log/ActivityLog";

const MyProfile = () => {
  const { user } = useSelector((state) => state.auth);
  
  
  const [showActivity, setShowActivity] = useState(false);

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <PageHeader title="My Profile" />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:shadow-2xl transition-all duration-300">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-[#1b1f23] to-[#2d3748] p-8 text-white relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl transform -translate-y-1/2 translate-x-1/2"></div>
              <div className="flex items-center space-x-6 relative z-10">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-3xl font-bold shadow-lg transform hover:scale-105 transition-transform">
                  {user?.fullName?.charAt(0) || user?.username?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-3xl font-bold tracking-wide">{user?.username || "User"}</h2>
                  <p className="text-gray-300 mt-1">{user?.email || "No email provided"}</p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { label: "Full Name", value: user?.fullName },
                  { label: "Username", value: user?.username },
                  { label: "Email", value: user?.email },
                  { label: "Phone Number", value: user?.phone },
                  { label: "Last Login", value: user?.lastLoginAt },
                ].map(({ label, value }) => (
                  <div key={label} className="group bg-gray-50 p-4 rounded-xl hover:bg-gray-100 transition-all duration-300">
                    <p className="text-sm font-medium text-gray-500 group-hover:text-[#1b1f23] transition-colors">
                      {label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 group-hover:text-[#1b1f23] transition-colors">
                      {value || "--"}
                    </p>
                  </div>
                ))}

                {/* Password Section */}
               {
                user?.role !== "user" && 
                 <div className="col-span-full">
                 <div className="bg-gray-50 rounded-xl group hover:bg-gray-100 transition-all duration-300">
                   <div className="flex items-center justify-around">
                     <div className="flex gap-4">
                       <button
                         onClick={() => setShowActivity(!showActivity)}
                         className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105"
                       >
                         <Activity className="w-4 h-4" />
                         {showActivity ? "Hide Activity" : "Show Activity"}
                       </button>
                      
                     </div>
                   </div>
                 </div>
               </div>
               }
              </div>
            </div>
          </div>

          {/* Activity Section */}
          {showActivity && (
            
              
                <ActivityLog />
              
           
          )}
        </div>
      </div>

      
    </div>
  );
};

export default MyProfile;

