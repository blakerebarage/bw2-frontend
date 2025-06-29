import { logout } from "@/redux/slices/authSlice";
import { useEffect, useState } from "react";
import { BsGlobe2 } from "react-icons/bs";
import { FaGear } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import menuItems from "../components/MenuItems";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const { user } = useSelector((state) => state.auth);
  const [timezone, setTimezone] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Get user's timezone
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = new Date().getTimezoneOffset();
    const hours = Math.abs(Math.floor(offset / 60));
    const minutes = Math.abs(offset % 60);
    const sign = offset <= 0 ? '+' : '-';
    const formattedTimezone = `GMT${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    setTimezone(formattedTimezone);

    // Update time every second
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTime(timeString);
    };

    // Initial update
    updateTime();

    // Set up interval for updates
    const intervalId = setInterval(updateTime, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    addToast("Logout successful", {
      appearance: "success",
      autoDismiss: true,
    });
    navigate("/");
    toggleSidebar();
  };

  return (
    <div
      className={`absolute top-0 left-0 bg-[#eef6fb] w-3/5 h-screen z-30 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-200 ease-in-out flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
        <h1 className="text-xl font-semibold text-gray-800 pl-2">Menu</h1>
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 active:scale-95"
        >
          <IoClose className="text-2xl text-gray-600" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-hide">
        {/* Main Menu Items */}
        <ul className="bg-white/80 backdrop-blur-sm mx-4 rounded-2xl shadow-sm">
          {menuItems.map(({ id, label, Icon, link, count }, index) => {
            // Define colors for specific menu items
            const isDeposit = label === "Deposite Balance";
            const isWithdraw = label === "Withdraw Balance";
            
            const getItemClasses = () => {
              if (isDeposit) {
                return "flex items-center justify-between p-4 text-green-700 hover:bg-green-50/80 transition-all duration-200 active:scale-[0.99] bg-green-50/30";
              }
              if (isWithdraw) {
                return "flex items-center justify-between p-4 text-red-700 hover:bg-red-50/80 transition-all duration-200 active:scale-[0.99] bg-red-50/30";
              }
              return "flex items-center justify-between p-4 text-gray-700 hover:bg-gray-50/80 transition-all duration-200 active:scale-[0.99]";
            };

            const getIconClasses = () => {
              if (isDeposit) return "text-xl text-green-600";
              if (isWithdraw) return "text-xl text-red-600";
              return "text-xl text-gray-600";
            };

            return (
              <li
                key={id}
                className={`border-b border-gray-100 last:border-b-0 ${
                  index === 0 ? 'rounded-t-2xl' : ''
                } ${index === menuItems.length - 1 ? 'rounded-b-2xl' : ''}`}
              >
                <Link
                  to={link}
                  className={getItemClasses()}
                  onClick={toggleSidebar}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={getIconClasses()} />
                    <span className="text-base font-medium">{label}</span>
                    {count !== undefined && (
                      <span className="ml-2 px-2.5 py-0.5 text-sm font-semibold bg-yellow-500/90 text-gray-900 rounded-md">
                        {count}
                      </span>
                    )}
                  </div>
                  <IoIosArrowForward className="text-xl text-gray-400" />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Additional Menu Items */}
        <div className="mt-4 mx-4 space-y-3">
          <Link
            to="/setting"
            className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl shadow-sm hover:bg-gray-50/80 transition-all duration-200 active:scale-[0.99]"
            onClick={toggleSidebar}
          >
            <div className="flex items-center gap-3">
              <FaGear className="text-xl text-gray-600" />
              <span className="text-base font-medium">Setting</span>
            </div>
            <IoIosArrowForward className="text-xl text-gray-400" />
          </Link>

          {
            user.role !== "user" && <Link
              to="/admindashboard"
              className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm text-gray-700 rounded-2xl shadow-sm hover:bg-gray-50/80 transition-all duration-200 active:scale-[0.99]"
              onClick={toggleSidebar}
            >
              <div className="flex items-center gap-3">
                <MdDashboard className="text-xl text-gray-600" />
                <span className="text-base font-medium">Dashboard</span>
              </div>
              <IoIosArrowForward className="text-xl text-gray-400" />
            </Link>
          }

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-[#d4e0e5] text-gray-700 rounded-2xl shadow-sm hover:bg-gray-200/80 transition-all duration-200 active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <RiLogoutCircleLine className="text-xl text-gray-600" />
              <span className="text-base font-medium">Logout</span>
            </div>
            <IoIosArrowForward className="text-xl text-gray-400" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 bg-white/50 backdrop-blur-sm border-t border-gray-200/50">
        <div className="flex flex-col items-center gap-1 text-gray-600">
          <div className="flex items-center gap-2">
            <BsGlobe2 className="text-lg" />
            <span className="text-sm font-medium">Time Zone: {timezone}</span>
          </div>
          <div className="text-sm font-medium">
            {currentTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 