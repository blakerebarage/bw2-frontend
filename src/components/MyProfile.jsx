import { useCurrency } from "@/Hook/useCurrency";
import { useEffect, useState } from "react";
import { FaEnvelope, FaMoneyBillTransfer, FaMoneyBillWave, FaPhone, FaUser, FaUserShield, FaWallet } from "react-icons/fa";
import { useSelector } from 'react-redux';
import useAxiosSecure from "../Hook/useAxiosSecure";

const MyProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const axiosSecure = useAxiosSecure();
  const { formatCurrency } = useCurrency();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosSecure.get('/api/v1/user/profile');
        if (res.data.success) {
          setProfileData(res.data.data);
        }
      } catch (err) {
        setProfileData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axiosSecure]);

  const stats = [
    {
      title: 'Current Balance',
      value: formatCurrency(profileData?.currentBalance || 0),
      icon: FaWallet,
      color: 'text-[#facc15]',
      bgColor: 'bg-[#1a1f24]',
      borderColor: 'border-[#facc15]/20'
    },
    {
      title: 'Total Deposits',
      value: formatCurrency(profileData?.totalDeposits || 0),
      icon: FaMoneyBillWave,
      color: 'text-[#facc15]',
      bgColor: 'bg-[#1a1f24]',
      borderColor: 'border-[#facc15]/20'
    },
    {
      title: 'Total Withdrawals',
      value: formatCurrency(profileData?.totalWithdrawals || 0),
      icon: FaMoneyBillTransfer,
      color: 'text-[#facc15]',
      bgColor: 'bg-[#1a1f24]',
      borderColor: 'border-[#facc15]/20'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] mt-12 py-12 px-4 bg-[#1a1f24]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 text-[#facc15]">My Profile</h2>
            <p className="text-gray-300">Loading your profile information...</p>
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-[#facc15] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] mt-12 py-12 px-4 bg-[#1a1f24]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-[#facc15]">My Profile</h2>
          <p className="text-gray-300">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bgColor} rounded-xl shadow-lg p-6 border ${stat.borderColor} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-300">{stat.title}</h3>
                  <div className="p-3 rounded-lg bg-[#facc15]/10">
                    <Icon className={`${stat.color} text-xl`} />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <div className="mt-4 pt-4 border-t border-[#facc15]/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-gray-300">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#1a1f24] rounded-xl shadow-lg p-6 border border-[#facc15]/20">
          <h3 className="text-xl font-semibold text-[#facc15] mb-6">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[#1a1f24] rounded-lg border border-[#facc15]/20 hover:border-[#facc15]/40 transition-all duration-300">
              <div className="p-2 rounded-lg bg-[#facc15]/10">
                <FaUser className="text-[#facc15] text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Username</p>
                <p className="text-gray-300 font-medium">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#1a1f24] rounded-lg border border-[#facc15]/20 hover:border-[#facc15]/40 transition-all duration-300">
              <div className="p-2 rounded-lg bg-[#facc15]/10">
                <FaEnvelope className="text-[#facc15] text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-gray-300 font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#1a1f24] rounded-lg border border-[#facc15]/20 hover:border-[#facc15]/40 transition-all duration-300">
              <div className="p-2 rounded-lg bg-[#facc15]/10">
                <FaPhone className="text-[#facc15] text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-gray-300 font-medium">{user?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[#1a1f24] rounded-lg border border-[#facc15]/20 hover:border-[#facc15]/40 transition-all duration-300">
              <div className="p-2 rounded-lg bg-[#facc15]/10">
                <FaUserShield className="text-[#facc15] text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Account Type</p>
                <p className="text-gray-300 font-medium capitalize">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile; 