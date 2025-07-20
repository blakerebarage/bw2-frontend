import CommonNavMenu from "@/components/CommonNavMenu/CommonNavMenu";
import OtpDisplay from "@/components/OtpDisplay";
import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";

const DashboardLayout = () => {
  const location = useLocation();
  
  // Memoize the navbar to prevent re-renders
  const navbar = useMemo(() => <CommonNavMenu />, []);

  return (
    <div>
      {navbar}
      <div className="">
        <Outlet key={location.pathname} />
      </div>
      
      {/* OTP Display Overlay for Admin/Cash-Agent Users */}
      <OtpDisplay />
    </div>
  );
};

export default DashboardLayout;
