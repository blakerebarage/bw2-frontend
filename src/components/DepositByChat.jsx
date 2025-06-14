import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useEffect, useState } from 'react';
import { FaLink } from "react-icons/fa";

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

  return (
    <div className="min-h-[60vh] mt-12 flex flex-col items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(to bottom, #111827cc, #1f2937cc)' }}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-white">Deposit by Chat Support</h2>
        <p className="text-gray-400 max-w-xl mx-auto">Get instant assistance with your deposits through our dedicated support channels</p>
      </div>
      {loading ? (
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading support contacts...</span>
        </div>
      ) : depositWithdrawNumbers.length === 0 ? (
        <div className="text-gray-400 text-center bg-gray-800/50 p-8 rounded-xl border border-gray-700">
          <p className="text-lg mb-2">No deposit numbers available</p>
          <p className="text-sm">Please check back later or contact our main support</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-xl">
          {depositWithdrawNumbers.map((item, idx) => (
            <div 
              key={`deposit-${idx}`} 
              className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-5 flex items-start gap-4 hover:shadow-2xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50 group"
            >
              <div className="flex-shrink-0 p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-300">
                <FaLink className="text-gray-400" size={24} />
              </div>
              <div className="flex-grow">
                <div className="font-bold text-xl text-white mb-2 flex items-center gap-2">
                  {item.method}
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">Account</span>
                </div>
                <a
                  href={`tel:${item.number}`}
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors group/link"
                >
                  <span className="font-semibold text-gray-400">Number:</span>
                  <span className="group-hover/link:underline">{item.number}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-12 text-center text-gray-400 text-sm max-w-xl mx-auto bg-gray-800/50 p-6 rounded-xl border border-gray-700/50">
        <p className="mb-2">For instant deposit help, contact our support team via your preferred method above.</p>
        <p className="text-gray-500">Our agents are available 24/7 to assist you!</p>
      </div>
    </div>
  );
};

export default DepositByChat;