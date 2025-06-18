import useAxiosSecure from "@/Hook/useAxiosSecure";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaClock, FaDesktop, FaExclamationTriangle, FaGlobe, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";

// Skeleton component for activity log entries
const ActivityLogSkeleton = () => {
  return (
    <div className="animate-pulse bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="h-6 bg-[#22282e] rounded w-20"></div>
        <div className="h-6 bg-[#22282e] rounded w-16"></div>
        <div className="h-6 bg-[#22282e] rounded w-12"></div>
      </div>
      <div className="flex flex-wrap gap-4 mb-2">
        <div className="h-4 bg-[#22282e] rounded w-32"></div>
        <div className="h-4 bg-[#22282e] rounded w-24"></div>
        <div className="h-4 bg-[#22282e] rounded w-28"></div>
        <div className="h-4 bg-[#22282e] rounded w-36"></div>
      </div>
      <div className="h-3 bg-[#22282e] rounded w-3/4 mt-2"></div>
    </div>
  );
};

const ActivityLog = () => {
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const  axiosSecure  = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  const limit = 2;

  useEffect(() => {
    const fetchActivityLog = async () => {
      try {
        setLoading(true);
        const response = await axiosSecure.get(`/api/v1/system-setting/activity-log?page=${currentPage}&limit=${limit}&username=${user.username}`);

        if (response.data.success) {
          setActivityLog(response.data.data.results);
          setTotalPages(response.data.data.pageCount);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityLog();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (error) {
    return (
      <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-red-500/20 p-6">
        <div className="text-center text-red-400">
          <FaExclamationTriangle className="mx-auto mb-2 text-2xl" />
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <ActivityLogSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Activity Log Content */}
      {!loading && (
        <>
          <div className="space-y-4">
            {activityLog.length === 0 ? (
              <div className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-8">
                <div className="text-center text-gray-400">
                  <FaClock className="mx-auto mb-3 text-3xl" />
                  <p className="text-lg font-medium">No activity found</p>
                  <p className="text-sm mt-1">Your activity log will appear here</p>
                </div>
              </div>
            ) : (
              activityLog.map((log) => (
                <div
                  key={log._id}
                  className="bg-[#1a1f24] rounded-lg shadow-sm border border-[#facc15]/20 p-4 hover:border-[#facc15]/40 transition-all duration-200"
                >
                  <div className="flex-1">
                    {/* Header badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#facc15] text-[#1a1f24] text-xs font-semibold">
                        <FaUser className="w-3 h-3" /> {log.username}
                      </span>
                      {user.role === "super-admin" && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#22282e] text-[#facc15] border border-[#facc15]/30">
                          {log.method}
                        </span>
                      )}
                      {log.isSuspicious ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30">
                          <FaExclamationTriangle className="w-3 h-3" /> Suspicious
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                          <FaCheckCircle className="w-3 h-3" /> Safe
                        </span>
                      )}
                    </div>

                    {/* Activity details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-[#22282e] flex items-center justify-center">
                          <FaClock className="w-4 h-4 text-[#facc15]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Timestamp</p>
                          <p className="text-white font-medium">{moment(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-[#22282e] flex items-center justify-center">
                          <FaGlobe className="w-4 h-4 text-[#facc15]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">IP Address</p>
                          <p className="text-white font-medium">{log.ip}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-[#22282e] flex items-center justify-center">
                          <FaMapMarkerAlt className="w-4 h-4 text-[#facc15]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Location</p>
                          <p className="text-white font-medium">{log.location.city}, {log.location.country}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-300">
                        <div className="w-8 h-8 rounded-lg bg-[#22282e] flex items-center justify-center">
                          <FaDesktop className="w-4 h-4 text-[#facc15]" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide">Device</p>
                          <p className="text-white font-medium">{log.browser} / {log.os}</p>
                        </div>
                      </div>
                    </div>

                    {/* Route info for super-admin */}
                    {user.role === "super-admin" && (
                      <div className="mt-4 p-3 bg-[#22282e] rounded-lg border border-[#facc15]/20">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Route</p>
                        <p className="text-sm text-[#facc15] break-all font-mono">{log.route}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-[#1a1f24] text-gray-300 rounded-lg hover:bg-[#22282e] transition-colors border border-[#facc15]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-2">
                <span className="px-3 py-2 text-[#facc15] font-medium">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-[#facc15] text-[#1a1f24] rounded-lg hover:bg-[#e6b800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActivityLog;
