import { useLanguage } from "@/contexts/LanguageContext";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useEffect, useState } from 'react';
import { FaFacebookMessenger, FaLink, FaTelegram, FaWhatsapp } from "react-icons/fa";
import { FaSignalMessenger } from "react-icons/fa6";
import { SiViber } from "react-icons/si";

const iconForProvider = (providerName) => {
  if (!providerName) return <FaLink className="text-gray-400" size={20} />;
  const name = providerName.toLowerCase();
  if (name.includes("whatsapp")) return <FaWhatsapp className="text-green-500 w-4 h-4 sm:w-5 sm:h-5" />;
  if (name.includes("telegram")) return <FaTelegram className="text-[#229ED9] w-4 h-4 sm:w-5 sm:h-5" />;
  if (name.includes("signal")) return <FaSignalMessenger className="text-blue-700 w-4 h-4 sm:w-5 sm:h-5" />;
  if (name.includes("messenger")) return <FaFacebookMessenger className="text-blue-700 w-4 h-4 sm:w-5 sm:h-5" />;
  if (name.includes("imo")) return <SiViber className="text-sky-500 w-4 h-4 sm:w-5 sm:h-5" />;
  return <FaLink className="text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />;
};

const WithdrawByChat = () => {
  const { t } = useLanguage();
  const axiosSecure = useAxiosSecure();
  const [depositWithdrawNumbers, setDepositWithdrawNumbers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosSecure.get('/api/v1/system-setting');
        if (res.data.success && res.data.data) {
          setDepositWithdrawNumbers(res.data.data.depositWithdrawNumbers || []);
        }
      } catch (err) {
        setDepositWithdrawNumbers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axiosSecure]);

  return (
    <div className="min-h-[50vh] sm:min-h-[60vh] mt-8 sm:mt-12 flex flex-col items-center justify-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6 bg-[#1a1f24]">
      <div className="text-center mb-6 sm:mb-8 w-full max-w-4xl">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3 text-[#facc15] px-2">
          {t('withdrawByChatSupport')}
        </h2>
        <p className="text-sm sm:text-base text-gray-300 max-w-sm sm:max-w-md md:max-w-xl mx-auto leading-relaxed px-2">
          {t('getInstantAssistanceWithdrawals')}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 sm:gap-3 text-[#facc15] px-4">
          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm sm:text-base">{t('loading')}</span>
        </div>
      ) : depositWithdrawNumbers.length === 0 ? (
        <div className="text-gray-300 text-center bg-[#1a1f24] p-4 sm:p-6 md:p-8 rounded-xl border border-[#facc15]/20 w-full max-w-sm sm:max-w-md md:max-w-lg mx-2">
          <p className="text-base sm:text-lg mb-2">No withdraw numbers available</p>
          <p className="text-xs sm:text-sm text-gray-400">Please check back later or contact our main support</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl px-2">
          {depositWithdrawNumbers.map((item, idx) => (
            <div 
              key={`withdraw-${idx}`} 
              className="bg-[#1a1f24] backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg p-3 sm:p-4 md:p-5 flex items-start gap-3 sm:gap-4 hover:shadow-2xl transition-all duration-300 border border-[#facc15]/20 hover:border-[#facc15]/40 group"
            >
              <div className="flex-shrink-0 p-2 sm:p-3 rounded-lg bg-[#facc15]/10 group-hover:bg-[#facc15]/20 transition-colors duration-300">
                {iconForProvider(item.method)}
              </div>
              <div className="flex-grow min-w-0">
                <div className="font-bold text-base sm:text-lg md:text-xl text-[#facc15] mb-1 sm:mb-2 flex items-center gap-2 flex-wrap">
                  <span className="truncate">{item.method === 'Whatsapp' ? t('whatsapp') : item.method === 'Messenger' ? t('messenger') : item.method === 'Signal' ? t('signal') : item.method}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-[#facc15]/20 text-[#facc15] whitespace-nowrap">
                    {t('account')}
                  </span>
                </div>
                <a
                  href={`tel:${item.number}`}
                  className="flex items-start sm:items-center gap-2 text-gray-300 hover:text-[#facc15] transition-colors group/link"
                >
                  <span className="font-semibold text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                    {t('number')}:
                  </span>
                  <span className="group-hover/link:underline text-xs sm:text-sm break-all">
                    {item.number}
                  </span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 sm:mt-10 md:mt-12 text-center text-gray-300 text-xs sm:text-sm w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-[#1a1f24] p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-xl border border-[#facc15]/20">
        <p className="mb-2 leading-relaxed">
          {t('forInstantWithdrawHelp')}
        </p>
        <p className="text-gray-400 leading-relaxed">
          {t('ourAgentsAvailable')}
        </p>
      </div>
    </div>
  );
};

export default WithdrawByChat;