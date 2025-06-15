import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useEffect, useState } from "react";
import { FaGamepad } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { useToasts } from "react-toast-notifications";

const GameStatusChanges = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingProvider, setUpdatingProvider] = useState(null);
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  
  // Common currency options
  const currencyOptions = [
    { code: "BDT", name: "Bangladeshi Taka" },
    { code: "USD", name: "US Dollar" },
    { code: "EUR", name: "Euro" },
    { code: "GBP", name: "British Pound" },
    { code: "INR", name: "Indian Rupee" },
    { code: "NGN", name: "Nigerian Naira" },
    { code: "PKR", name: "Pakistani Rupee" },
    {code:"VND", name:"Vietnamese Dong"},
    {code:"JPY", name:"Japanese Yen"},
    {code:"ARS", name:"Argentine Peso"},
    {code:"USDT", name:"Tether"},
  ];
  
  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosSecure.get('/api/v1/game/providers', {
        params: {
          page,
          limit: 50,
          search: searchQuery
        }
      });

      if (response?.data?.data) {
        setProviders(response.data.data.results);
        setTotalPages(response.data.data.pageCount);
      }
    } catch (error) {
      setError('Failed to fetch providers. Please try again later.');
      addToast("Failed to fetch providers", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [page, searchQuery]);

  const handleStatusChange = async (providerName, currentStatus, currencyCode) => {
    setUpdatingProvider(providerName);
    try {
      await axiosSecure.patch(`/api/v1/game/providers/${providerName}`, {
        isActive: !currentStatus,
        currencyCode: currencyCode
      });

      // Update local state
      setProviders(prevProviders =>
        prevProviders.map(provider =>
          provider.name === providerName
            ? { ...provider, isActive: !currentStatus, currencyCode }
            : provider
        )
      );

      addToast(`Provider ${providerName} status updated successfully`, {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      addToast(`Failed to update ${providerName} status`, {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setUpdatingProvider(null);
    }
  };

  const handleCurrencyChange = async (providerName, currentStatus, newCurrency) => {
    setUpdatingProvider(providerName);
    try {
      await axiosSecure.patch(`/api/v1/game/providers/${providerName}`, {
        isActive: currentStatus,
        currencyCode: newCurrency
      });

      // Update local state
      setProviders(prevProviders =>
        prevProviders.map(provider =>
          provider.name === providerName
            ? { ...provider, currencyCode: newCurrency }
            : provider
        )
      );

      addToast(`Provider ${providerName} currency updated successfully`, {
        appearance: "success",
        autoDismiss: true,
      });
    } catch (error) {
      addToast(`Failed to update ${providerName} currency`, {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setUpdatingProvider(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaGamepad className="text-red-500" />
          Game Providers Status
        </h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search providers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={() => fetchProviders()}
            className="p-2 text-gray-600 hover:text-red-500 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {providers.map((provider) => (
            <div
              key={provider._id}
              className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 capitalize">
                      {provider.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Last updated: {new Date(provider.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={provider.isActive}
                      onChange={() => handleStatusChange(provider.name, provider.isActive, provider.currencyCode || 'BDT')}
                      disabled={updatingProvider === provider.name}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Currency:</label>
                  <select
                    value={provider.currencyCode || 'BDT'}
                    onChange={(e) => handleCurrencyChange(provider.name, provider.isActive, e.target.value)}
                    disabled={updatingProvider === provider.name}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                {updatingProvider === provider.name && (
                  <div className="mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && providers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No providers found</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-red-500 text-white rounded-lg">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GameStatusChanges; 