import { useCurrency } from "@/Hook/useCurrency";
import usePendingRequests from "@/Hook/usePendingRequests";

import useMedia from "@/Hook/useMedia";
import { useEffect, useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { IoMdLogIn } from "react-icons/io";
import { IoMenu, IoNotifications } from "react-icons/io5";
import { PiHandDepositFill, PiHandWithdrawFill } from "react-icons/pi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import PrimaryButton from "./PrimaryButton";

const Navbar = () => {
   
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
  const bgImage = import.meta.env.VITE_BASE_API_URL + logo?.url;
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
               {
          token && userData?.role === "user" &&  <div className="flex flex-row items-center gap-2">
          <Link to="/balance-deposite" className="transition group relative">
              <button className="bg-white text-[#facc15] px-1 py-1 rounded-md flex items-center gap-2  transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
               <PiHandDepositFill className="text-xl text-[#facc15]"/>
             </button>
             
          </Link>
          <Link to="/balance-withdraw" className=" transition group relative">
             <button className="bg-[#facc15] text-white px-1 py-1 rounded-md flex items-center gap-2 hover:bg-[#facc15]/80 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
               <PiHandWithdrawFill className="text-xl text-white"/>
             </button>
             
          </Link>
        </div>
         }
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

              <div className="flex flex-col text-white">
                <p className="text-white text-end">
                  {/* @****{userData?.phoneOrUserName?.slice(-4)} */}
                  {userData?.username}
                  
                </p>

                <div className="flex flex-row items-center gap-1 text-sm">
                  <p className="">
                    <u className="text-yellow-400 no-underline">
                      {formatCurrency(userData?.balance)}
                    </u>
                  </p>
                  
                </div>
              </div>
            </div>
          )}

          {!token && !user && (
            <div className="flex items-center justify-center gap-3">
              <Link
                // target="_blank"
                rel="noreferrer noopenner"
                to="/signup"
              >
                <PrimaryButton icon={FiPlusCircle} background={""}>
                  SignUp
                </PrimaryButton>
              </Link>
              <Link to="/login">
                <PrimaryButton icon={IoMdLogIn} background={"red"}>
                  Login
                </PrimaryButton>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
