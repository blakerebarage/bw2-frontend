import { Activity, CreditCard, FileText, User, Users } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, Outlet, useLocation } from "react-router-dom";

const MyAccount = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className=" mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-72 flex-shrink-0">
            {/* Mobile Header */}
            <div className="lg:hidden mb-4">
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your account settings</p>
            </div>

            {/* Navigation Menu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Position Section */}
              <div className="border-b border-gray-200">
                <div className="px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Position
                  </h3>
                </div>

                <ul className="divide-y divide-gray-100">
                  <li>
                    <Link
                      to="/admindashboard/myaccount/myAccountStatementtabs"
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        isActive("/admindashboard/myaccount/myAccountStatementtabs")
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      Account Statement
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/admindashboard/myaccount/myAccountSummary"
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        isActive("/admindashboard/myaccount/myAccountSummary")
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      Account Summary
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Account Details Section */}
              <div>
                <div className="px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                    Account Details
                  </h3>
                </div>

                <ul className="divide-y divide-gray-100">
                  <li>
                    <Link
                      to="/admindashboard/myaccount/MyDashboardProfile"
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        isActive("/admindashboard/myaccount/MyDashboardProfile")
                          ? "bg-[#1f2937] text-white border-l-4 border-[#1f2937]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#1f2937] border-l-4 border-transparent"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/admindashboard/myaccount/downlist"
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        isActive("/admindashboard/myaccount/downlist")
                          ? "bg-[#1f2937] text-white border-l-4 border-[#1f2937]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#1f2937] border-l-4 border-transparent"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Downlist
                    </Link>
                  </li>
                  {
                    user.role === "super-admin" && <li>
                    <Link
                      to="/admindashboard/myaccount/myActivity"
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        isActive("/admindashboard/myaccount/myActivity")
                          ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      Activity Log
                    </Link>
                  </li>
                  }
                 
                </ul>
              </div>
            </div>

            {/* Quick Stats - Mobile Only */}
            <div className="lg:hidden mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">$1,234.56</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm text-gray-600">Active Status</p>
                <p className="text-lg font-semibold text-green-600 mt-1">Active</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
