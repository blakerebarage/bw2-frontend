import { useCurrency } from "@/Hook/useCurrency";
import { FaChartLine, FaExchangeAlt, FaWallet } from "react-icons/fa";
import { useSelector } from "react-redux";

const BalanceOverview = () => {
  const { user } = useSelector((state) => state.auth);
  const { formatCurrency } = useCurrency();

  const stats = [
    {
      title: "Current Balance",
      value: formatCurrency(user?.balance || 0),
      icon: FaWallet,
      color: "from-[#009245] to-[#009245]/90",
      textColor: "text-[#009245]",
    },
    {
      title: "Total Deposits",
      value: formatCurrency(user?.totalDeposits || 0),
      icon: FaChartLine,
      color: "from-[#009245] to-[#009245]/90",
      textColor: "text-[#009245]",
    },
    {
      title: "Total Withdrawals",
      value: formatCurrency(user?.totalWithdrawals || 0),
      icon: FaExchangeAlt,
      color: "from-[#FF0000] to-[#FF0000]/90",
      textColor: "text-[#FF0000]",
    },
  ];

  return (
    <div className="min-h-[60vh] mt-12 py-12 px-4 bg-gradient-to-b from-[#009245]/5 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-[#009245]">Balance Overview</h2>
          <p className="text-gray-600">Track your financial activity and balance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 border border-[#009245]/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{stat.title}</h3>
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                    <Icon className="text-white text-xl" />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="text-gray-700">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-[#009245]/20">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="w-full px-6 py-3 bg-gradient-to-r from-[#009245] to-[#009245]/90 text-white rounded-lg hover:from-[#009245]/90 hover:to-[#009245] transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              <FaWallet className="text-xl" />
              <span>Make a Deposit</span>
            </button>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-[#FF0000] to-[#FF0000]/90 text-white rounded-lg hover:from-[#FF0000]/90 hover:to-[#FF0000] transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2">
              <FaExchangeAlt className="text-xl" />
              <span>Withdraw Funds</span>
            </button>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-[#009245]/20">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    index % 2 === 0 ? 'bg-[#009245]/10' : 'bg-[#FF0000]/10'
                  }`}>
                    {index % 2 === 0 ? (
                      <FaChartLine className={`text-xl ${index % 2 === 0 ? 'text-[#009245]' : 'text-[#FF0000]'}`} />
                    ) : (
                      <FaExchangeAlt className={`text-xl ${index % 2 === 0 ? 'text-[#009245]' : 'text-[#FF0000]'}`} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {index % 2 === 0 ? 'Deposit' : 'Withdrawal'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${index % 2 === 0 ? 'text-[#009245]' : 'text-[#FF0000]'}`}>
                  {index % 2 === 0 ? '+' : '-'}{formatCurrency(1000)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceOverview; 