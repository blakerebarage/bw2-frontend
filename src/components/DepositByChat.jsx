  import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useEffect, useState } from 'react';
import { FaLink, FaPhone, FaTelegram, FaWhatsapp } from "react-icons/fa";

  const DepositByChat = () => {
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

    const getIcon = (method) => {
      const methodLower = method.toLowerCase();
      if (methodLower.includes('whatsapp')) return FaWhatsapp;
      if (methodLower.includes('telegram')) return FaTelegram;
      return FaPhone;
    };

    return (
      <div className="min-h-[60vh] mt-12 py-12 px-4 bg-gradient-to-b from-[#009245]/5 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 text-[#009245]">Deposit by Chat Support</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Get instant assistance with your deposits through our dedicated support channels
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 text-[#009245]">
              <div className="w-5 h-5 border-2 border-[#009245] border-t-transparent rounded-full animate-spin"></div>
              <span>Loading support contacts...</span>
            </div>
          ) : depositWithdrawNumbers.length === 0 ? (
            <div className="text-center bg-white p-8 rounded-xl border border-[#009245]/20 shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#009245]/10 flex items-center justify-center">
                <FaLink className="text-[#009245] text-2xl" />
              </div>
              <p className="text-lg font-medium text-gray-800 mb-2">No deposit numbers available</p>
              <p className="text-gray-600">Please check back later or contact our main support</p>
            </div>
          ) : (
            <div className="grid grid-cols-1  gap-6">
              {depositWithdrawNumbers.map((item, idx) => {
                const Icon = getIcon(item.method);
                return (
                  <div
                    key={`deposit-${idx}`}
                    className="bg-white rounded-xl shadow-lg p-6 border border-[#009245]/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[#009245]/10">
                        <Icon className="text-[#009245] text-2xl" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg text-gray-800">{item.method}</h3>
                          <span className="px-3 py-1 rounded-full bg-[#009245]/10 text-[#009245] text-xs font-medium">
                            Active
                          </span>
                        </div>
                        <a
                          href={`tel:${item.number}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-[#009245] transition-colors group"
                        >
                          <span className="font-medium">Contact:</span>
                          <span className="group-hover:underline">{item.number}</span>
                        </a>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm text-gray-500">
                            Available 24/7 for instant support
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-12 bg-white rounded-xl shadow-lg p-8 border border-[#009245]/20">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Need Help?</h3>
              <p className="text-gray-600 mb-6">
                Our support team is available 24/7 to assist you with your deposits
              </p>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#009245] to-[#009245]/90 text-white rounded-lg hover:from-[#009245]/90 hover:to-[#009245] transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <FaPhone className="text-xl" />
                  <span>Call Support</span>
                </button>
                <button className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-[#009245] to-[#009245]/90 text-white rounded-lg hover:from-[#009245]/90 hover:to-[#009245] transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                  <FaWhatsapp className="text-xl" />
                  <span>WhatsApp Support</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default DepositByChat;