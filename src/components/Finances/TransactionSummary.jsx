import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const TransactionSummary = () => {
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const response = await axiosSecure.get("/api/v1/finance/transaction-summary");
      if (response.data.success) {
        setSummary(response.data.data);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "deposit":
        return "#10B981"; // green-500
      case "withdraw":
        return "#EF4444"; // red-500
      case "transfer":
        return "#3B82F6"; // blue-500
      default:
        return "#6B7280"; // gray-500
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{payload[0].payload.type.toUpperCase()}</p>
          <p className="text-sm text-gray-600">
            Amount: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-600">
            Count: {payload[0].payload.count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Transaction Summary
            </h1>
            <p className="text-gray-300 text-center mt-2">
              Manage and update user transaction summary efficiently
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {summary.map((item) => (
            <div
              key={item.type}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {item.type}
                </h3>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getTypeColor(item.type) }}
                />
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(item.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transaction Count</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {item.count}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Transaction Overview
          </h2>
          <div className="h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="totalAmount"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionSummary; 