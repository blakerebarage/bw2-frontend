import useMedia from '@/Hook/useMedia';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { FaHeadset, FaMoneyBillWave, FaTrophy } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { useWelcome } from '../../UserContext/WelcomeContext';
const WelcomeMessage = () => {
  const { showWelcome, setShowWelcome } = useWelcome();
  const {logo} = useMedia();
  
  const pathname = useLocation();
  useEffect(() => {
    if (showWelcome) {
      // Prevent background scroll
      document.body.style.overflow = 'hidden';
      // Hide the message after 10 seconds
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 10000);
      return () => {
        document.body.style.overflow = '';
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [showWelcome, setShowWelcome]);

  const features = [
    {
      icon: <FaTrophy className="text-xl sm:text-2xl text-yellow-500" />,
      text: "📊 প্রতিটি গেমে ট্রান্সপারেন্ট অডস ও হিস্ট্রি দেখা যায়"
    },
    {
      icon: <FaMoneyBillWave className="text-xl sm:text-2xl text-green-500" />,
      text: "$ দ্রুত এবং ঝামেলামুক্ত পেআউট গ্যারান্টি"
    },
    {
      icon: <FaHeadset className="text-xl sm:text-2xl text-blue-500" />,
      text: "২৪/৭ ফোন কলের মাধ্যমে কাস্টমার সাপোর্ট"
    }
  ];

  return (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowWelcome(false)}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-[95vw] max-w-[420px] mx-auto bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-yellow-500/20 p-4 sm:p-6"
            style={{ zIndex: 60 }}
          >
            {/* Close Icon */}
            <button
              onClick={() => setShowWelcome(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-full p-2 transition-colors duration-200"
              aria-label="Close welcome message"
              style={{ touchAction: 'manipulation' }}
            >
              <FiX size={24} />
            </button>
            <div className="text-center mb-4 sm:mb-6">
              <div className='flex items-center justify-center gap-2'>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-500 mb-1 sm:mb-2">
                Welcome to 
              </h1>
              <img src={`${import.meta.env.VITE_BASE_API_URL}/${logo?.url}`} alt="logo" className=" bg-cover h-8 mt-[5px]" />
              </div>
             
              <p className="text-gray-300 text-base sm:text-lg md:text-xl">
                যেখানে ভাগ্য বদলায় এক ক্লিকে
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <p className="text-gray-200 text-sm sm:text-base text-center">
                আপনার {pathname.pathname === "/login" ? "রেজিস্ট্রেশন " : "লগইন "}
                 সম্পূর্ণ হয়েছে এবং গেমের রোমাঞ্চ উপভোগ করতে প্রস্তুত হোন! স্পোর্টস বেটিং এর বিশ্ব এখন আপনার হাতের নাগালে। আপনার বেটের জন্য শুভকামনা!
              </p>
            </div>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 sm:space-x-3 bg-gray-800/30 p-2 sm:p-3 rounded-lg"
                >
                  {feature.icon}
                  <span className="text-gray-200 text-sm sm:text-base">{feature.text}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="mt-4 sm:mt-6 w-full bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors duration-300 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
              style={{ touchAction: 'manipulation' }}
            >
              Let's Play!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeMessage; 