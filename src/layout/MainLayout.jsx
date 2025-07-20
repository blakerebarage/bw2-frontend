import ContactWidget from "@/components/ContactWidget";
import OtpDisplay from "@/components/OtpDisplay";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import bgimage from "../../public/bgimage.webp";
import { trackPageView } from "../lib/facebookPixel"; // Adjust path if needed

const MainLayout = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Track a page view or a custom event
    trackPageView("MainLayout Page");
    // Or use trackCustomEvent('MainLayoutVisit', { ... });

    // Check if device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      style={{
        backgroundImage: isMobile ? 'none' : `url(${bgimage})`,
        backgroundSize: "cover",
        backgroundPosition: "top",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
      className="flex justify-center"
    >
      <div className="hidden lg:flex w-[30%] md:w-[20%] items-center justify-center">
        
      </div>
      {/* color1:  bg-gradient-to-b from-[#1e1b4b] via-[#312e81] to-[#000000] */}
      {/* color2:  bg-gradient-to-tl from-[#0d1117] via-[#161b22] to-[#1f2937] */}
      {/* color2:  bg-gradient-to-b from-[#0c0c0c] via-[#1a1a1a] to-[#000000] */}
      {/* me:  bg-gradient-to-br from-green-200 via-blue-300 to-green-200 */}
      {/* bg-[url('https://i.ibb.co.com/BHFQ5w9r/8868.jpg')] */}
      <div className="w-full md:w-[60%] lg:w-[40%] xl:w-[30%] bg-[#1B1F23] bg-cover bg-center bg-no-repeat flex flex-col h-[100vh] overflow-y-auto overflow-x-hidden scrollbar-hide">
        <Navbar />
        <ContactWidget />
        <div className="flex-grow">
          <Outlet />
        </div>
        <Footer />
      </div>
      <div className="hidden lg:block md:w-[20%] w-[30%]"></div>
      
      {/* OTP Display Overlay - Similar to Welcome Message */}
      <OtpDisplay />
    </div>
  );
};

export default MainLayout;
