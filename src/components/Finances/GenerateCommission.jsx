import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import moment from "moment";
import { useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";

const GenerateCommission = () => {
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  
  // Commission Generation Dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Commission Filter Dates (separate from generation dates)
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [referralCommissions, setReferralCommissions] = useState(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);

  // Fetch referral commissions on component mount (without date filtering)
  useEffect(() => {
    fetchReferralCommissions();
  }, []);

  const fetchReferralCommissions = async (withDates = false) => {
    try {
      setIsLoadingReferrals(true);
      let url = `/api/v1/finance/all-cw-referral-commissions`;
      
      // Only add date parameters if explicitly requested
      if (withDates && filterStartDate && filterEndDate) {
        url += `?startDate=${filterStartDate}&endDate=${filterEndDate}`;
      }

      const response = await axiosSecure.get(url);

      if (response.data.success) {
        setReferralCommissions(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch referral commissions:", error);
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  const handleGenerateCommission = async () => {
    if (!startDate || !endDate) {
      addToast("Please select both start and end dates", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      addToast("Start date cannot be after end date", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axiosSecure.post(
        "/api/v1/finance/generate-cash-and-wallet-agent-commission",
        {
          startDate,
          endDate,
        }
      );

      if (response.data.success) {
      await fetchReferralCommissions()
        // Only show toast, don't store or display the data
        addToast("Commission generated successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
        // Clear the form
        setStartDate("");
        setEndDate("");
      } else {
        throw new Error(response.data.message || "Failed to generate commission");
      }
    } catch (error) {
      addToast(error.message || "Failed to generate commission", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setReferralCommissions(null);
    setStartDate("");
    setEndDate("");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const formatDate = (dateString) => {
    return moment(dateString).format("MMM D, YYYY");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Generate Commission
            </h1>
            <p className="text-gray-300 text-center mt-2">
              Generate cash and wallet agent commissions for specified date ranges
            </p>
          </div>

          {/* Commission Generation Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Commission</h2>
            <div className="flex flex-col gap-6">
              {/* Commission Generation Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateCommission}
                    disabled={loading}
                    className="w-full px-4 py-2.5 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                    {loading ? "Generating..." : "Generate Commission"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Filter Section */}
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Referral Commissions</h2>
            <div className="flex flex-col gap-6">
              {/* Commission Filter Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Filter Start Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Filter End Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => fetchReferralCommissions(true)}
                    disabled={!filterStartDate || !filterEndDate}
                    className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                    </svg>
                    Filter by Date
                  </button>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearData}
                    className="w-full px-4 py-2.5 bg-white text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="p-6">
            {/* Referral Commissions Results */}
            {referralCommissions && (
              <div className="space-y-6 mb-8">
                {/* Referral Summary Cards - Only Period */}
                {referralCommissions?.commissions && (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 rounded-lg p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Period</p>
                          <p className="text-lg font-bold">
                            {referralCommissions.commissions[0]?.metadata?.period || "N/A"}
                          </p>
                        </div>
                        <div className="text-3xl opacity-80">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Referral Commissions Table */}
                {referralCommissions?.commissions && (
                  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Referral Commission Details</h3>
                      <p className="text-sm text-gray-500">
                        {filterStartDate && filterEndDate 
                          ? `Filtered for ${formatDate(filterStartDate)} to ${formatDate(filterEndDate)}`
                          : "Showing all referral commissions"
                        }
                      </p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Earning Agent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Referred Agent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Commission Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {referralCommissions.commissions.map((commission, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {commission.earningAgentUsername}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {commission.earningAgentRole}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {commission.referredAgentUsername}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {commission.referredAgentRole}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {commission.commissionType}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(commission.commissionAmount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  commission.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : commission.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {commission.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(commission.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Loading State for Referrals */}
            {isLoadingReferrals && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading referral commissions...</p>
              </div>
            )}

            {/* Initial State */}
            {!referralCommissions && !loading && !isLoadingReferrals && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Commissions</h3>
                <p className="text-gray-500">Select a date range above to generate new commissions or filter existing referral commissions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateCommission;
