import { useState } from "react";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const MenuItem = ({ item, activeTab, handleTabClick, isMobile = false }) => {
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  // Filter subItems based on user role
  const filteredSubItems = item.subItems?.filter(
    (subItem) =>
      Array.isArray(subItem.roles) && subItem.roles.includes(user?.role)
  );

  const toggleSubmenu = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleClick = (path) => {
    if (path) {
      handleTabClick(path);
    } else {
      toggleSubmenu();
    }
  };

  const isActive = activeTab === item.path || (item.subItems && item.subItems.some(subItem => activeTab === subItem.path));

  if (isMobile) {
    return (
      <li className="w-full">
        {item.subItems ? (
          <div className="w-full">
            <button
              onClick={toggleSubmenu}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
                isActive ? "bg-white/10 text-yellow-400" : "text-white hover:bg-white/10"
              }`}
            >
              <span>{item.label}</span>
              <IoIosArrowForward className={`transform transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
            </button>
            
            {/* Mobile Submenu */}
            <div
              className={`${
                isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              } transition-all duration-300 ease-in-out overflow-hidden`}
            >
              <ul className="pl-4 space-y-1 mt-1">
                {filteredSubItems?.map((subItem, index) => (
                  <li key={index}>
                    <Link
                      to={subItem.path}
                      onClick={() => handleClick(subItem.path)}
                      className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                        activeTab === subItem.path ? "bg-white/10 text-yellow-400" : "text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{subItem.label}</span>
                        {subItem.badge && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                            {subItem.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <Link
            to={item.path}
            onClick={() => handleClick(item.path)}
            className={`block px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
              isActive ? "bg-white/10 text-yellow-400" : "text-white hover:bg-white/10"
            }`}
          >
            {item.label}
          </Link>
        )}
      </li>
    );
  }

  // Desktop Menu Item
  return (
    <li className="relative">
      {item.subItems ? (
        <div className="relative group">
          <button
            onClick={toggleSubmenu}
            className={`flex items-center justify-between px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
              isActive ? "bg-white/10 text-yellow-400" : "text-white hover:bg-white/10"
            }`}
          >
            <span>{item.label}</span>
            <IoIosArrowDown className={`transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>
          
          {/* Desktop Submenu */}
          <div
            className={`${
              isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            } transition-all duration-300 ease-in-out overflow-hidden absolute top-full left-0 min-w-[200px] bg-[#1f2937] rounded-lg shadow-lg z-50`}
          >
            <ul className="py-2">
              {filteredSubItems?.map((subItem, index) => (
                <li key={index}>
                  <Link
                    to={subItem.path}
                    onClick={() => handleClick(subItem.path)}
                    className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      activeTab === subItem.path ? "bg-white/10 text-yellow-400" : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{subItem.label}</span>
                      {subItem.badge && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                          {subItem.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <Link
          to={item.path}
          onClick={() => handleClick(item.path)}
          className={`block px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
            isActive ? "bg-white/10 text-yellow-400" : "text-white hover:bg-white/10"
          }`}
        >
          {item.label}
        </Link>
      )}
    </li>
  );
};

export default MenuItem;
