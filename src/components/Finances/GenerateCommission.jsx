import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import moment from "moment";
import { useState } from "react";
import { useToasts } from "react-toast-notifications";

const GenerateCommission = () => {
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

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
        setGeneratedData(response.data.data);
        addToast("Commission generated successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
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
    setGeneratedData(null);
    setStartDate("");
    setEndDate("");
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

          {/* Form Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col gap-6">
              {/* Date Selection */}
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
                <div className="flex items-end gap-3">
                  <button
                    onClick={handleGenerateCommission}
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <button
                    onClick={clearData}
                    className="flex-1 px-4 py-2.5 bg-white text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
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
            {generatedData && (
              <div className="space-y-6">
                {/* Summary Cards */}
                {generatedData?.data?.summary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Total Wallet Commissions</p>
                        <p className="text-2xl font-bold">{formatCurrency(generatedData.data.summary.totalWalletCommissions)}</p>
                      </div>
                      <div className="text-3xl opacity-80">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Total Cash Commissions</p>
                        <p className="text-2xl font-bold">{formatCurrency(generatedData.data.summary.totalCashCommissions)}</p>
                      </div>
                      <div className="text-3xl opacity-80">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Processed Wallet Agents</p>
                        <p className="text-2xl font-bold">{generatedData.data.summary.processedWalletAgents}</p>
                      </div>
                      <div className="text-3xl opacity-80">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Processed Cash Agents</p>
                        <p className="text-2xl font-bold">{generatedData.data.summary.processedCashAgents}</p>
                      </div>
                      <div className="text-3xl opacity-80">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* Commission Details */}
                {generatedData?.data && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Wallet Agent Commissions */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Wallet Agent Commissions</h3>
                      <p className="text-sm text-gray-500">Generated for {formatDate(startDate)} to {formatDate(endDate)}</p>
                    </div>
                    <div className="p-4">
                      {generatedData.data.walletAgentCommissions && generatedData.data.walletAgentCommissions.length > 0 ? (
                        <div className="space-y-3">
                          {generatedData.data.walletAgentCommissions.map((commission, index) => (
                            <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-blue-900">{commission.agentUsername || 'Agent'}</span>
                                <span className="text-sm text-blue-600 font-bold">
                                  {formatCurrency(commission.commissionAmount || 0)}
                                </span>
                              </div>
                              <p className="text-sm text-blue-700">{commission.description || 'Commission generated'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                          </div>
                          <p className="text-gray-500">No wallet agent commissions generated</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cash Agent Commissions */}
                  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Cash Agent Commissions</h3>
                      <p className="text-sm text-gray-500">Generated for {formatDate(startDate)} to {formatDate(endDate)}</p>
                    </div>
                    <div className="p-4">
                      {generatedData.data.cashAgentCommissions && generatedData.data.cashAgentCommissions.length > 0 ? (
                        <div className="space-y-3">
                          {generatedData.data.cashAgentCommissions.map((commission, index) => (
                            <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-green-900">{commission.agentUsername || 'Agent'}</span>
                                <span className="text-sm text-green-600 font-bold">
                                  {formatCurrency(commission.commissionAmount || 0)}
                                </span>
                              </div>
                              <p className="text-sm text-green-700">{commission.description || 'Commission generated'}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-400 mb-2">
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <p className="text-gray-500">No cash agent commissions generated</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                )}

                {/* Success Message */}
                {generatedData?.data && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        {generatedData.data.message || "Commission generation completed successfully"}
                      </p>
                    </div>
                  </div>
                </div>
                )}
              </div>
            )}

            {/* Initial State */}
            {!generatedData && !loading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Generate Commissions</h3>
                <p className="text-gray-500">Select a date range above and click "Generate Commission" to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateCommission;
