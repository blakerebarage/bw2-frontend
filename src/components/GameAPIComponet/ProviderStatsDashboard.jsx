// import useAxiosSecure from "@/Hook/useAxiosSecure";
// import React, { useEffect, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// export default function ProviderStatsDashboard() {
//   const axiosSecure = useAxiosSecure();
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     axiosSecure
//       .get(`/casino/get-manager-dashboard`)
//       .then((res) => {
//         setData(res.data.individualProviderStats);

//         setLoading(false);
//       })
//       .catch((err) => {
//         
//         setError("Failed to load data.");
//         setLoading(false);
//       });
//   }, [axiosSecure]);

//   const formatNumber = (num) => {
//     return Number(num).toLocaleString("en-US");
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-40">
//         <div className="w-10 h-10 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
//         <span className="ml-2">Loading...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return <p className="p-6 text-red-500">{error}</p>;
//   }

//   return (
//     <div className="p-6 space-y-8">
//       <h2 className="text-2xl font-bold dark:text-white">
//         Provider Wise Profit/Loss Chart
//       </h2>

//       <div className="w-full h-80 bg-white dark:bg-gray-800 shadow rounded-xl p-4">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={data}>
//             <XAxis dataKey="provider" stroke="#8884d8" />
//             <YAxis />
//             <Tooltip />
//             <Bar dataKey="profitLoss" fill="#38bdf8" radius={[4, 4, 0, 0]} />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       <h2 className="text-2xl font-bold dark:text-white">
//         Provider Wise Full Data
//       </h2>

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
//           <thead className="bg-gray-100 dark:bg-gray-700 dark:text-white">
//             <tr>
//               <th className="px-4 py-2 text-left font-semibold">Provider</th>
//               <th className="px-4 py-2 text-left font-semibold">Total Bets</th>
//               <th className="px-4 py-2 text-left font-semibold">
//                 Total Bet Amount
//               </th>
//               <th className="px-4 py-2 text-left font-semibold">
//                 Total Win Amount
//               </th>
//               <th className="px-4 py-2 text-left font-semibold">
//                 Profit / Loss
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-100 dark:divide-gray-600 dark:text-white">
//             {data.map((item, idx) => (
//               <tr key={idx}>
//                 <td className="px-4 py-2 font-medium">{item.provider}</td>
//                 <td className="px-4 py-2">{formatNumber(item.totalBets)}</td>
//                 <td className="px-4 py-2">
//                   {formatNumber(item.stats.totalBetAmount)}
//                 </td>
//                 <td className="px-4 py-2">
//                   {formatNumber(item.stats.totalWinAmount)}
//                 </td>
//                 <td
//                   className={`px-4 py-2 font-semibold ${
//                     item.stats.totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"
//                   }`}
//                 >
//                   {formatNumber(item.stats.totalProfitLoss)}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const data = [
  { provider: "evolution", profitLoss: 8583.32, totalBetAmount: 276855, totalWinAmount: 268271.68, totalBets: 1398 },
  { provider: "ezugi", profitLoss: 860, totalBetAmount: 860, totalWinAmount: 0, totalBets: 8 },
  { provider: "ongaming", profitLoss: 15, totalBetAmount: 1000, totalWinAmount: 985, totalBets: 2 },
  { provider: "sagaming", profitLoss: 5611.9, totalBetAmount: 7472, totalWinAmount: 1860.1, totalBets: 7 },
  { provider: "sexygaming", profitLoss: 1060, totalBetAmount: 1060, totalWinAmount: 0, totalBets: 6 },
  { provider: "bflottobit", profitLoss: 110, totalBetAmount: 895, totalWinAmount: 785, totalBets: 7 },
  { provider: "cq9", profitLoss: -21.94, totalBetAmount: 1316.46, totalWinAmount: 1338.4, totalBets: 230 },
  { provider: "eazygaming", profitLoss: -51, totalBetAmount: 888.5, totalWinAmount: 939.5, totalBets: 299 },
  { provider: "jdb", profitLoss: -964, totalBetAmount: 55350.6, totalWinAmount: 56314.6, totalBets: 8283 },
  { provider: "jili", profitLoss: -60180.87, totalBetAmount: 2993322.25, totalWinAmount: 3053503.12, totalBets: 24817 },
  { provider: "spribe", profitLoss: 90656.62, totalBetAmount: 6946409.47, totalWinAmount: 6855752.85, totalBets: 85648 },
  { provider: "btisports", profitLoss: 84535.78, totalBetAmount: 2258069.85, totalWinAmount: 2173534.07, totalBets: 2415 },
];

export default function ProviderStatsDashboard() {
  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-[#1f2937]">Provider Wise Profit/Loss Chart</h2>

      <div className="w-full h-80 bg-white shadow rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="provider" stroke="#1f2937" />
            <YAxis stroke="#1f2937" />
            <Tooltip />
            <Bar dataKey="profitLoss" fill="#1f2937" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-2xl font-bold text-[#1f2937]">Provider Wise Full Data</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-[#1f2937]">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-white">Provider</th>
              <th className="px-4 py-2 text-left font-semibold text-white">Total Bets</th>
              <th className="px-4 py-2 text-left font-semibold text-white">Total Bet Amount</th>
              <th className="px-4 py-2 text-left font-semibold text-white">Total Win Amount</th>
              <th className="px-4 py-2 text-left font-semibold text-white">Profit / Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-[#1f2937]">{item.provider}</td>
                <td className="px-4 py-2 text-[#1f2937]">{item.totalBets}</td>
                <td className="px-4 py-2 text-[#1f2937]">{item.totalBetAmount}</td>
                <td className="px-4 py-2 text-[#1f2937]">{item.totalWinAmount}</td>
                <td className={`px-4 py-2 font-semibold ${item.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {item.profitLoss.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// {
//   "provider": "evolution",
//   "stats": {
//     "_id": "evolution",
//     "totalBets": 1398,
//     "totalBetAmount": 276855,
//     "totalWinAmount": 268271.68,
//     "totalProfitLoss": 8583.32000000001
//   }
// },