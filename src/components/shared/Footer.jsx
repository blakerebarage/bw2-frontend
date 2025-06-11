import eighteenPlus from "@/assets/Footer/18+.png";
import gcGaming from "@/assets/Footer/gc_gaming.png";
import { FaFacebook, FaTelegram, FaWhatsappSquare, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-[#1f2937] mt-auto drop-shadow-lg">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-4">
          {/* App Download Section */}
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <Link className="transform hover:scale-105 transition-transform duration-200">
              <img
                className="w-36"
                src="https://www.wickspin24.live/images/btn-android-dl.webp"
                alt="Download App"
              />
            </Link>
          
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <Link
              target="_blank"
              rel="noreferrer noopenner"
              to="https://www.youtube.com/@play9"
              className="text-gray-300 hover:text-red-700 transition-colors duration-200"
            >
              <FaYoutube className="text-3xl sm:text-4xl" />
            </Link>
          <Link
              target="_blank"
              rel="noreferrer noopenner"
              to="https://www.facebook.com/oracletechnologyindia"
              className="text-gray-300 hover:text-blue-500 transition-colors duration-200"
            >
              <FaFacebook className="text-3xl sm:text-4xl" />
            </Link>
            <Link
              target="_blank"
              rel="noreferrer noopenner"
              to="https://wa.me/+33756757364"
              className="text-gray-300 hover:text-green-400 transition-colors duration-200"
            >
              <FaWhatsappSquare className="text-3xl sm:text-4xl" />
            </Link>
            <Link
              target="_blank"
              rel="noreferrer noopenner"
              to="https://t.me/+fHC2LQO4BAg2MmRk"
              className="text-gray-300 hover:text-blue-400 transition-colors duration-200"
            >
              <FaTelegram className="text-3xl sm:text-4xl" />
            </Link>
           
            
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <Link 
              to="/privacy-policy" 
              className="text-gray-300 hover:text-white px-3 py-1 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-500">•</span>
            <Link 
              to="/terms-conditions" 
              className="text-gray-300 hover:text-white px-3 py-1 transition-colors duration-200"
            >
              Terms & Conditions
            </Link>
            <span className="text-gray-500">•</span>
            <Link 
              to="/responsible-gaming" 
              className="text-gray-300 hover:text-white px-3 py-1 transition-colors duration-200"
            >
              Responsible Gaming
            </Link>
          </div>

          {/* GC Gaming and 18+ Images */}
          <div className="flex items-center justify-center gap-6 mt-2 ">
            <img src={gcGaming} alt="Gaming Curacao"  className="h-10"/>
            <img src={eighteenPlus} alt="18+"  className="h-18"/>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-4 border-t border-gray-700">
          <p className="text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Ourbet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
