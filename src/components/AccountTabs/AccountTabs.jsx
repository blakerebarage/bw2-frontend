import { Activity, CreditCard, FileText, User, Users } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

const AccountTabs = ({id,username}) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Helper function to apply active class
  const isActive = (path) => location.pathname === path;
  return (
    <div>
      <ul className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6 ">
        {/* Position Section */}
        <li className="border-b border-gray-200">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Position
            </h3>
          </div>
        </li>

        <Link to={`/accountstatementtabs/${id}`}>
          <li>
            <a
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive("/accountstatementtabs")
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
              }`}
            >
              <FileText className="w-4 h-4" />
              Account Statement
            </a>
          </li>
        </Link>

        <Link to={`/accountsummary/${id}`}>
          <li>
            <a
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive("/accountsummary")
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Account Summary
            </a>
          </li>
        </Link>

        {/* Account Details Section */}
        <li className="border-b border-gray-200">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Account Details
            </h3>
          </div>
        </li>

        <Link to={`/profile/${id}`}>
          <li>
            <a
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive("/profile")
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </a>
          </li>
        </Link>

        <Link to={`/downlist/${id}`}>
          <li>
            <a
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                isActive("/downlist")
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
              }`}
            >
              <Users className="w-4 h-4" />
              Downlist
            </a>
          </li>
        </Link>
        {
          user.role === "super-admin" &&  <Link to={`/activitylog/${username}`}>
          <li>
          <a
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive("/activitylog")
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                }`}
              >
              <Activity className="w-4 h-4" />
              Activity Log
            </a>
          </li>
          </Link>
        }
       <Link to={`/betlist/${id}`}>
          <li>
          <a
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive("/activitylog")
                    ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                }`}
              >
              <Activity className="w-4 h-4" />
              Bet List
            </a>
          </li>
          </Link>
      </ul>
    </div>
  );
};

export default AccountTabs;
