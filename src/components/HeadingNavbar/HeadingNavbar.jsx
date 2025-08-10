import Logo from "@/components/Logo/Logo";
import usePendingRequests from "@/Hook/usePendingRequests";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IoNotifications } from "react-icons/io5";
import { PiHandDepositFill } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { logout } from "../../redux/slices/authSlice";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import MenuItem from "./MenuItem";

const HeadingNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(location.pathname);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const { pendingDeposits, pendingWithdraws } = usePendingRequests();
  const navRef = useRef(null);

  const menuItems = useMemo(() => [
    {
      label: "Dashboard",
      path: "/admindashboard",
      roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
    },
    {
      label: "Setting",
      path: null,
      roles: ["super-admin"],
      subItems: [
        {
          label: "Admin Setting",
          path: "/admindashboard/adminsetting",
          roles: ['super-admin'],
        },
        {
          label: "Home Control",
          path: "/admindashboard/homecontrol",
          roles: ['super-admin'],
        },
        {
          label: "Deposit To Main Balance",
          path: "/admindashboard/addbalance",
          roles: ["super-admin"],
        },
      ],
    },
    {
      label: "My Account",
      path: "/admindashboard/myaccount/MyDashboardProfile",
      roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
    },
    {
      label: "BetList",
      path: "admindashboard/all-bets-history",
      roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
    },
    {
      label: "Casino",
      path: null,
      roles: ["super-admin"],
      subItems: [
        {
          label: "Provider control",
          path: "/admindashboard/gamestatuschanges",
          roles: ['super-admin'],
        }
      ],
    },
    {
      label: "Bank",
      path: null,
      roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
      subItems: [
        {
          label: "Direct Banking",
          path: "/admindashboard/banking",
          roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
        },
        {
          label: "Bank List",
          path: "/admindashboard/addBank",
          roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
        },
        {
          label: "All Transactions",
          path: "/admindashboard/all-transactions",
          roles: ["super-admin"],
        },
        {
          label: "Transaction Summary",
          path: "/admindashboard/transaction-summary",
          roles: ["super-admin"],
        },
      ],
    },
    {
      label: "Finances",
      path: null,
      roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
      subItems: [
        {
          label: "Withdraw request",
          path: "/admindashboard/allwithdrawrequest",
          roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
          badge: pendingWithdraws > 0 ? pendingWithdraws : null,
        },
        {
          label: "Deposite Request",
          path: "/admindashboard/depositewallet",
          roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
          badge: pendingDeposits > 0 ? pendingDeposits : null,
        },
        {
          label: "Turnover Management",
          path: "/admindashboard/turnover-management",
          roles: ["admin", "sub-admin", "super-admin"],
        },
        {
          label: "Payment Messages",
          path: "/admindashboard/payment-messages",
          roles: ["super-admin"],
        },
        {
          label: "All Commission Cashagent",
          path: "/admindashboard/all-commission-cashagent",
          roles: ["super-admin"],
        },
        {
          label: "All Commission Wallet Agent",
          path: "/admindashboard/all-commission-walletagent",
          roles: ["super-admin"],
        },
        {
          label: "Generate Commission",
          path: "/admindashboard/generate-commission",
          roles: ["super-admin"],
        },
      ],
    },
    {
      label: "Game Center",
      path: null,
      roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
      subItems: [
        {
          label: "Game Category Control",
          path: "/admindashboard/gamecontrol",
          roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
        },
        {
          label: "Game Image Control",
          path: "/admindashboard/gameimagecontrol",
          roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
        },
        {
          label: "Most Played Games",
          path: "/admindashboard/mostplayedgamescontrol",
          roles: ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"],
        },
      ],
    },
  ], [pendingDeposits, pendingWithdraws]);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const handleTabClick = useCallback((path) => {
    setActiveTab(path);
    navigate(path);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/login");
  }, [dispatch, navigate]);

  // Filter menu items based on user role
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // If user has no role, show nothing
      if (!user?.role) return false;

      // Check if the item has roles and if user's role is included
      if (item.roles && !item.roles.includes(user.role)) return false;

      // If item has subItems, filter them based on roles
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter(subItem => 
          subItem.roles && subItem.roles.includes(user.role)
        );
        
        // Only show menu items that have accessible subitems
        return filteredSubItems.length > 0;
      }

      return true;
    });
  }, [menuItems, user?.role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenSubmenu(null);
      }
    };

    if (openSubmenu !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openSubmenu]);

  useEffect(() => {
    setOpenSubmenu(null);
  }, [location.pathname]);

  const handleSubmenuToggle = useCallback((itemIndex) => {
    setOpenSubmenu(openSubmenu === itemIndex ? null : itemIndex);
  }, [openSubmenu]);

  return (
    <header className="w-full shadow-md" ref={navRef}>
      {/* Top Bar */}
      <div className="bg-[#1f2937] flex items-center justify-between px-4 py-3 w-full">
        {/* Logo */}
        <div className="flex items-center gap-1">
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="default" className="w-auto" />
          </Link>
        </div>
        {/* User Info */}
        <div className="flex items-center gap-2">
          {/* Language Switcher - only show on md and up */}
          <LanguageSwitcher variant="navbar" className="mr-2 hidden md:inline-block" />
          
          {/* Withdraw Request Icon */}
          {user?.role && ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"].includes(user.role) && (
            <div className="relative">
              <Link to="/admindashboard/allwithdrawrequest" className="text-white hover:text-yellow-400 transition">
               <IoNotifications className="text-2xl"/>
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingWithdraws || 0}
                  </span>
                
              </Link>
            </div>
          )}
          
          {/* Deposit Request Icon */}
          {user?.role && ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"].includes(user.role) && (
            <div className="relative">
              <Link to="/admindashboard/depositewallet" className="text-white hover:text-yellow-400 transition">
                <PiHandDepositFill className="text-2xl"/>
                
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {pendingDeposits || 0}
                  </span>
                
              </Link>
            </div>
          )}

          <span className="text-white text-base md:text-lg font-medium flex items-center gap-2">
            {user?.username}
            <span className="text-yellow-400 font-normal ml-2">{t('balance')}:</span>
            <span className="text-yellow-300 font-bold ml-1 flex items-center gap-1">
              {user?.balance?.toFixed(2).toLocaleString() || "0.00"}
              <span className="text-lg">৳</span>
            </span>
          </span>
          <button onClick={handleLogout} className="text-white hover:text-yellow-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        {/* Hamburger for mobile */}
        <button
          className="lg:hidden ml-4 text-white hover:text-yellow-400 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Menu Bar */}
      <nav className="bg-[#1f2937] w-full border-t border-[#232e3e]">
        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center justify-center py-2">
          {filteredMenuItems.map((item, index) => (
            <MenuItem
              key={index}
              item={item}
              itemIndex={index}
              activeTab={activeTab}
              handleTabClick={handleTabClick}
              openSubmenu={openSubmenu}
              onSubmenuToggle={handleSubmenuToggle}
            />
          ))}
        </ul>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <div
          className={`lg:hidden fixed top-0 right-0 h-full w-[280px] bg-[#1f2937] z-50 transform ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out shadow-lg flex flex-col`}
        >
          {/* Mobile Menu Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#232e3e] bg-[#1f2937]">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setMenuOpen(false)}>
                <Logo size="default" className="w-auto" />
              </Link>
            </div>
            <button 
              onClick={() => setMenuOpen(false)} 
              className="text-white hover:text-yellow-400 transition p-2 rounded-full hover:bg-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Language Switcher for mobile */}
          <div className="block md:hidden px-4 py-2 border-b border-[#232e3e]">
            <LanguageSwitcher variant="navbar" />
          </div>

          {/* Mobile Menu Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <ul className="py-2 px-2 space-y-1">
              {filteredMenuItems.map((item, index) => (
                <MenuItem
                  key={index}
                  item={item}
                  itemIndex={index}
                  activeTab={activeTab}
                  handleTabClick={(path) => {
                    handleTabClick(path);
                    setMenuOpen(false);
                  }}
                  openSubmenu={openSubmenu}
                  onSubmenuToggle={handleSubmenuToggle}
                  isMobile={true}
                />
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default HeadingNavbar;
