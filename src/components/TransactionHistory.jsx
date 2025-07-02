import { useLanguage } from "@/contexts/LanguageContext";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useEffect, useState } from 'react';
import { FaArrowDown, FaArrowUp, FaExchangeAlt, FaHistory } from "react-icons/fa";

const TransactionHistory = () => {
  const { t } = useLanguage();
  const axiosSecure = useAxiosSecure();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosSecure.get('/api/v1/transactions');
        if (res.data.success) {
          setTransactions(res.data.data);
        }
      } catch (err) {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axiosSecure]);

  const getTransactionIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return <FaArrowDown className="text-emerald-500" />;
      case 'withdrawal':
        return <FaArrowUp className="text-rose-500" />;
      default:
        return <FaExchangeAlt className="text-indigo-500" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'text-emerald-600';
      case 'withdrawal':
        return 'text-rose-600';
      default:
        return 'text-indigo-600';
    }
  };

  return (
    <div className="min-h-[60vh] mt-12 py-12 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t('transactionHistory')}</h2>
          <p className="text-slate-600 max-w-xl mx-auto">
            View your deposit and withdrawal history
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 text-indigo-600">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span>{t('loading')}</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-xl border border-indigo-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              <FaHistory className="text-indigo-600 text-2xl" />
            </div>
            <p className="text-lg font-medium text-slate-800 mb-2">No transactions available</p>
            <p className="text-slate-600">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-indigo-100 hover:shadow-xl transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-indigo-50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">{t('date')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">{t('status')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">{t('description')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-indigo-50 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(transaction.type)}
                          <span className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === 'deposit' ? t('deposit') : transaction.type === 'withdrawal' ? t('withdraw') : transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-indigo-600">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                            : transaction.status === 'pending'
                            ? 'bg-amber-100 text-amber-600 border border-amber-200'
                            : 'bg-rose-100 text-rose-600 border border-rose-200'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {transaction.description || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionHistory; 