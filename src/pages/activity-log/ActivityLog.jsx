import Loading from "@/components/shared/Loading";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaClock, FaDesktop, FaExclamationTriangle, FaGlobe, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";

const ActivityLog = () => {
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const  axiosSecure  = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  const limit = 1;
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
    return <div className="mt-16 text-center text-red-500">Error: {error}</div>;
  }
  return (
    <div className="px-2 max-w-3xl mx-auto pb-4 drop-shadow-xl border border-[#facc15]/20 rounded-2xl">
      {loading && (
          <div className="flex justify-center items-center py-8">
            <Loading />
          </div>
        )}
      <div className="space-y-6 mt-6">
        {activityLog.map((log) => (
          <div
            key={log._id}
            className=" rounded-xl shadow-md border drop-shadow-lg p-4 flex flex-col sm:flex-row sm:items-center gap-2 text-[#facc15]"
          >
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#facc15] text-[#1a1f24] text-xs font-semibold">
                  <FaUser className="inline" /> {log.username}
                </span>
                {
                  user.role === "super-admin" && <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
                    ${log.method === "GET" ? "bg-[#facc15] text-[#1a1f24]" : "bg-[#facc15] text-[#1a1f24]"}`}>
                    {log.method}
                  </span>
                }
                {
                  user.role === "super-admin" && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#facc15] text-[#1a1f24] text-xs font-semibold"></span>
                }
                {log.isSuspicious ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#facc15] text-[#1a1f24] text-xs font-semibold">
                    <FaExclamationTriangle className="inline" /> Suspicious
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#facc15] text-[#1a1f24] text-xs font-semibold">
                    <FaCheckCircle className="inline" /> Safe
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[#facc15]">
                <div className="flex items-center gap-1">
                  <FaClock /> {moment(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                </div>
                <div className="flex items-center gap-1">
                  <FaGlobe /> {log.ip}
                </div>
                <div className="flex items-center gap-1">
                  <FaMapMarkerAlt /> {log.location.city}, {log.location.country}
                </div>
                <div className="flex items-center gap-1">
                  <FaDesktop /> {log.browser} / {log.os}
                </div>
              </div>
              
               {
                 user.role === "super-admin" && <div className="mt-2 text-xs text-[#facc15] break-all">
                 <span className="font-semibold">Route:</span> {log.route}
               </div>
               }
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-[#facc15] hover:bg-[#facc15] text-[#1a1f24] font-bold py-1.5 px-4 rounded-md mr-2"
        >
          Previous
        </button>
        <span className="py-1.5 px-4 text-[#facc15]">Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
            className="bg-[#facc15] hover:bg-[#facc15] text-[#1a1f24] font-bold py-1.5 px-4 rounded-md ml-2"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ActivityLog;
