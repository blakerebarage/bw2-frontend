import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useEffect, useState } from 'react';
import { FaLink } from "react-icons/fa";

const WithdrawByChat = () => {
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
    <div className="min-h-[60vh] mt-12 flex flex-col items-center justify-center py-12 px-4 bg-[#1a1f24]">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-[#facc15]">Withdraw by Chat Support</h2>
        <p className="text-gray-300 max-w-xl mx-auto">Get instant assistance with your withdrawals through our dedicated support channels</p>
      </div>
      {loading ? (
        <div className="flex items-center gap-3 text-[#facc15]">
          <div className="w-5 h-5 border-2 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading support contacts...</span>
        </div>
      ) : depositWithdrawNumbers.length === 0 ? (
        <div className="text-gray-300 text-center bg-[#1a1f24] p-8 rounded-xl border border-[#facc15]/20">
          <p className="text-lg mb-2">No withdraw numbers available</p>
          <p className="text-sm text-gray-400">Please check back later or contact our main support</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-xl">
          {depositWithdrawNumbers.map((item, idx) => (
            <div 
              key={`withdraw-${idx}`} 
              className="bg-[#1a1f24] backdrop-blur-sm rounded-xl shadow-lg p-5 flex items-start gap-4 hover:shadow-2xl transition-all duration-300 border border-[#facc15]/20 hover:border-[#facc15]/40 group"
            >
              <div className="flex-shrink-0 p-3 rounded-lg bg-[#facc15]/10 group-hover:bg-[#facc15]/20 transition-colors duration-300">
                <FaLink className="text-[#facc15]" size={24} />
              </div>
              <div className="flex-grow">
                <div className="font-bold text-xl text-[#facc15] mb-2 flex items-center gap-2">
                  {item.method}
                  <span className="text-xs px-2 py-1 rounded-full bg-[#facc15]/20 text-[#facc15]">Account</span>
                </div>
                <a
                  href={`tel:${item.number}`}
                  className="flex items-center gap-2 text-gray-300 hover:text-[#facc15] transition-colors group/link"
                >
                  <span className="font-semibold text-gray-400">Number:</span>
                  <span className="group-hover/link:underline">{item.number}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-12 text-center text-gray-300 text-sm max-w-xl mx-auto bg-[#1a1f24] p-6 rounded-xl border border-[#facc15]/20">
        <p className="mb-2">For instant withdrawal help, contact our support team via your preferred method above.</p>
        <p className="text-gray-400">Our agents are available 24/7 to assist you!</p>
      </div>
    </div>
  );
};

export default WithdrawByChat;