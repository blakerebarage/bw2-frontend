import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useEffect, useState } from 'react';
import { FaEnvelope, FaMoneyBillTransfer, FaMoneyBillWave, FaPhone, FaUser, FaUserShield, FaWallet } from "react-icons/fa";
import { useSelector } from 'react-redux';

const MyProfile = () => {
  const axiosSecure = useAxiosSecure();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
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
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Deposits',
      value: formatCurrency(profileData?.totalDeposits || 0),
      icon: FaMoneyBillWave,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Withdrawals',
      value: formatCurrency(profileData?.totalWithdrawals || 0),
      icon: FaMoneyBillTransfer,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="min-h-[60vh] mt-12 py-12 px-4 bg-gradient-to-b from-[#009245]/5 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-[#009245]">My Profile</h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            View and manage your account information
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 text-[#009245]">
            <div className="w-5 h-5 border-2 border-[#009245] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading profile data...</span>
          </div>
        ) : !profileData ? (
          <div className="text-center bg-white p-8 rounded-xl border border-[#009245]/20 shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#009245]/10 flex items-center justify-center">
              <FaUser className="text-[#009245] text-2xl" />
            </div>
            <p className="text-lg font-medium text-gray-800 mb-2">Profile not available</p>
            <p className="text-gray-600">Please try again later</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-lg p-6 border border-[#009245]/20"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`${stat.color} text-2xl`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                      <p className="text-xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#009245]/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <FaUser className="text-[#009245] text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium text-gray-800">{user?.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <FaEnvelope className="text-[#009245] text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-800">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <FaPhone className="text-[#009245] text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800">{profileData?.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <FaUserShield className="text-[#009245] text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Account Type</p>
                    <p className="font-medium text-gray-800 capitalize">{user?.role || 'User'}</p>
                  </div>
                </div>
              </div>

              {profileData?.additionalInfo && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(profileData.additionalInfo).map(([key, value]) => (
                      <div key={key} className="p-3 rounded-lg bg-gray-50">
                        <p className="text-sm text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="font-medium text-gray-800">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyProfile; 