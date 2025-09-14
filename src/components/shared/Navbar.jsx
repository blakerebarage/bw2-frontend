import { useCurrency } from "@/Hook/useCurrency";
import usePendingRequests from "@/Hook/usePendingRequests";

import { useLanguage } from "@/contexts/LanguageContext";
import useMedia from "@/Hook/useMedia";
import { useEffect, useState } from "react";
import { IoMenu, IoNotifications } from "react-icons/io5";
import { PiHandDepositFill } from "react-icons/pi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";

const Navbar = () => {
  const { t } = useLanguage();
  const { token, user } = useSelector((state) => state.auth);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { formatCurrency } = useCurrency();
  const { pendingDeposits, pendingWithdraws } =usePendingRequests();


  const userData = user;
  
  const {refreshMedia,logo} = useMedia()

  useEffect(()=>{
    refreshMedia()
  },[])



  
  // const currentUserData = users?.find(
  //   (u) => u.phoneOrUserName === userData?.phoneOrUserName
  // );
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  return (
    <div className="fixed top-0 z-20 w-full md:w-[60%] lg:w-[40%] xl:w-[30%] shadow-lg drop-shadow-lg">
      <div className="relative">
        {isSidebarOpen && (
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />
        )}
        <div className="bg-[#1b1f23] flex items-center justify-between px-3 py-2 ">
          <div className="flex flex-row items-center gap-2">
            {token && userData && (
              <IoMenu
                className="text-white text-3xl cursor-pointer"
                onClick={toggleSidebar}
              />
            )}
            <Link to="/">
            {/* <div
            className="bg-cover bg-center h-[36px] w-[100px] mt-[-10px]"
            style={{
              backgroundImage: `url(${import.meta.env.VITE_BASE_API_URL}${logo?.url})`
            }}
            /> */}
              <img
                className=" h-[36px]  select-none pointer-events-none mt-[5px]"
                src={`${import.meta.env.VITE_BASE_API_URL}${logo?.url}`}
                alt=""
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </Link>
          </div>
          
          {token && userData && (
            <div className="flex flex-row items-center gap-2">
               
        
              {/* Withdraw Request Icon */}
              {userData?.role && ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"].includes(userData.role) && (
                <div className="relative">
                  <Link to="/admindashboard/allwithdrawrequest" className="text-white hover:text-yellow-400 transition
                   
                  ">
                  <IoNotifications className="text-2xl"/>
                    
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {pendingWithdraws || 0}
                    </span>
                   
                  </Link>
                </div>
              )}
               
              {/* Deposit Request Icon */}
              {userData?.role && ["sub-agent", "agent", "master", "sub-admin", "admin", "super-admin"].includes(userData.role) && (
                <div className="relative">
                  <Link to="/admindashboard/depositewallet" className="text-white hover:text-yellow-400 transition">
                    <PiHandDepositFill className="text-2xl"/>
                    
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {pendingDeposits || 0}
                      </span>
                   
                  </Link>
                </div>
              )}
             
              <div className="flex flex-col text-white ml-1">
                
                <button className="text-white text-sm bg-gray-700 pl-2 flex items-center">
                  <u className="text-yellow-400 no-underline pr-2">
                      {formatCurrency(userData?.balance)}
                    </u>
                    <Link to="/balance-deposite">
                    <button className=" px-2  bg-green-600  font-bold text-xl flex items-center">
                      +
                    </button>
                    </Link>
                </button>
                
               
              </div>
            </div>
          )}

          {!token && !user && (
            <div className="flex items-center justify-center gap-2">
              <Link
                // target="_blank"
                rel="noreferrer noopenner"
                to="/signup"
              >
                <button className="bg-yellow-500 text-white px-3 py-1  flex items-center gap-1 hover:bg-yellow-500/80 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                  
                  {t('signUp')}
                </button>
              </Link>
              <Link to="/login">
                <button className="bg-red-500 text-white px-3 py-1  flex items-center gap-1 hover:bg-red-500/80 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                  
                  {t('login')}
                </button>
              </Link>
            </div>
          )}
          
        </div>
        
      </div>
    </div>
  );
};

export default Navbar;
