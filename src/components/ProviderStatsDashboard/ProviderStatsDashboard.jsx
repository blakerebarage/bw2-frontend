return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#1f2937]">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-[#1f2937]">{stat.value}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-[#1f2937]">Provider Statistics</h2>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-200 focus:outline-none focus:ring-[#1f2937] focus:border-[#1f2937] sm:text-sm rounded-lg"
                  >
                    <option value="">All Providers</option>
                    {providers.map((provider) => (
                      <option key={provider._id} value={provider._id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-[#1f2937] focus:border-[#1f2937] sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-[#1f2937]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#1f2937] uppercase tracking-wider"
                  >
                    Provider
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#1f2937] uppercase tracking-wider"
                  >
                    Total Transactions
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#1f2937] uppercase tracking-wider"
                  >
                    Success Rate
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#1f2937] uppercase tracking-wider"
                  >
                    Total Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-[#1f2937] uppercase tracking-wider"
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-[#1f2937] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[#1f2937]">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStats.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-[#1f2937]">
                      No statistics found
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((stat) => (
                    <tr key={stat._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-[#1f2937] flex items-center justify-center text-white">
                              {stat.providerName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-[#1f2937]">
                              {stat.providerName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#1f2937]">{stat.totalTransactions}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#1f2937]">{stat.successRate}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-[#1f2937]">
                          {formatCurrency(stat.totalAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            stat.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {stat.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-[#1f2937]">
                  Showing {filteredStats.length} of {totalItems} results
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg ${
                    page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#1f2937] text-white hover:bg-gray-800"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-lg ${
                    page === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-[#1f2937] text-white hover:bg-gray-800"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 