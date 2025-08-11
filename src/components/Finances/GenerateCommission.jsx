import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";

const GenerateCommission = () => {
  const { formatCurrency } = useCurrency();
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  
  // Commission Generation Month
  const [selectedMonth, setSelectedMonth] = useState("");
  
  // Commission Filter Month (separate from generation month)
  const [filterMonth, setFilterMonth] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [referralCommissions, setReferralCommissions] = useState(null);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(false);
  
  // Commission Approval States
  const [selectedCommissions, setSelectedCommissions] = useState([]);
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Fetch referral commissions on component mount (show all data by default)
  useEffect(() => {
    fetchReferralCommissions(false);
  }, []);

  const fetchReferralCommissions = async (withMonth = false) => {
    try {
      setIsLoadingReferrals(true);
      let url = `/api/v1/finance/all-cw-referral-commissions`;
      
      // Only add month parameter if explicitly requested
      if (withMonth && filterMonth) {
        url += `?month=${filterMonth}`;
      }

      const response = await axiosSecure.get(url);
     
      if (response.data.success) {
        setReferralCommissions(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch referral commissions");
      }
    } catch (error) {
      console.error("Failed to fetch referral commissions:", error);
      addToast(error.message || "Failed to fetch referral commissions", {
        appearance: "error",
        autoDismiss: true,
      });
      setReferralCommissions(null);
    } finally {
      setIsLoadingReferrals(false);
    }
  };

  const handleGenerateCommission = async () => {
    if (!selectedMonth) {
      addToast("Please select a month", {
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
          month: selectedMonth,
        }
      );

      if (response.data.success) {
        // Refresh referral commissions after successful generation
        await fetchReferralCommissions(false);
        
        addToast("Commission generated successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
        
        // Clear the form
        setSelectedMonth("");
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
    setSelectedMonth("");
    setFilterMonth("");
    // Reload all data after clearing
    fetchReferralCommissions(false);
  };

  const handleApproveCommissions = async () => {
    if (selectedCommissions.length === 0) {
      addToast("Please select commissions to approve", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }

    try {
      setApprovalLoading(true);
      const response = await axiosSecure.patch(
        "/api/v1/finance/approve-commission-for-wallet-and-cash-agent",
        {
          commissionIds: selectedCommissions,
        }
      );

      if (response.data.success) {
        addToast("Commissions approved successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
        
        // Clear selections and refresh data
        setSelectedCommissions([]);
        
        // Refresh the commissions list
        await fetchReferralCommissions(filterMonth ? true : false);
      } else {
        throw new Error(response.data.message || "Failed to approve commissions");
      }
    } catch (error) {
      addToast(error.message || "Failed to approve commissions", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleCommissionSelection = (commissionId) => {
    setSelectedCommissions(prev => {
      if (prev.includes(commissionId)) {
        return prev.filter(id => id !== commissionId);
      } else {
        return [...prev, commissionId];
      }
    });
  };

  const handleSelectAllCommissions = () => {
    if (referralCommissions?.commissions) {
      if (selectedCommissions.length === referralCommissions.commissions.length) {
        setSelectedCommissions([]);
      } else {
        setSelectedCommissions(referralCommissions.commissions.map(c => c._id || c.id));
      }
    }
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
              Generate cash and wallet agent commissions for specified months
            </p>
          </div>

          {/* Commission Generation Section */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate New Commission</h2>
            <div className="flex flex-col gap-6">
              {/* Commission Generation Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Select Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  >
                    <option value="">Choose Month</option>
                    <option value="january">January</option>
                    <option value="february">February</option>
                    <option value="march">March</option>
                    <option value="april">April</option>
                    <option value="may">May</option>
                    <option value="june">June</option>
                    <option value="july">July</option>
                    <option value="august">August</option>
                    <option value="september">September</option>
                    <option value="october">October</option>
                    <option value="november">November</option>
                    <option value="december">December</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleGenerateCommission}
                    disabled={loading || !selectedMonth}
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
              {/* Commission Filter Month Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Filter Month</label>
                  <select
                    value={filterMonth}
                    onChange={(e) => {
                      setFilterMonth(e.target.value);
                      if (e.target.value) {
                        fetchReferralCommissions(true);
                      } else {
                        fetchReferralCommissions(false);
                      }
                    }}
                    className="px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all duration-200 outline-none text-sm"
                  >
                    <option value="">All Months</option>
                    <option value="january">January</option>
                    <option value="february">February</option>
                    <option value="march">March</option>
                    <option value="april">April</option>
                    <option value="may">May</option>
                    <option value="june">June</option>
                    <option value="july">July</option>
                    <option value="august">August</option>
                    <option value="september">September</option>
                    <option value="october">October</option>
                    <option value="november">November</option>
                    <option value="december">December</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearData}
                    className="w-full px-4 py-2.5 bg-white text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filter
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
                {/* Referral Commissions Table */}
                {referralCommissions?.commissions && (
                  <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Referral Commission Details</h3>
                          <p className="text-sm text-gray-500">
                            {filterMonth 
                              ? `Filtered for ${filterMonth.charAt(0).toUpperCase() + filterMonth.slice(1)}`
                              : "Showing all referral commissions"
                            }
                          </p>
                          {referralCommissions?.commissions && (
                            <p className="text-sm text-gray-600 mt-1">
                              Total Commissions: {referralCommissions.commissions.length}
                            </p>
                          )}
                        </div>
                        
                        {/* Commission Selection Controls */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedCommissions.length === referralCommissions.commissions.length && referralCommissions.commissions.length > 0}
                              onChange={handleSelectAllCommissions}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-600">
                              Select All ({selectedCommissions.length}/{referralCommissions.commissions.length})
                            </span>
                          </div>
                          
                          {selectedCommissions.length > 0 && (
                            <button
                              onClick={handleApproveCommissions}
                              disabled={approvalLoading}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {approvalLoading ? "Approving..." : `Approve Selected (${selectedCommissions.length})`}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={selectedCommissions.length === referralCommissions.commissions.length && referralCommissions.commissions.length > 0}
                                onChange={handleSelectAllCommissions}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                              />
                            </th>
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
                              Commission Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Month 
                            </th>
                           
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {referralCommissions.commissions.map((commission, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedCommissions.includes(commission._id || commission.id)}
                                  onChange={() => handleCommissionSelection(commission._id || commission.id)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                              </td>
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
                                {formatCurrency(commission.baseCommissionAmount)}
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
                                {commission.month}
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
                <p className="text-gray-500">Select a month above to generate new commissions or filter existing referral commissions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default GenerateCommission;
