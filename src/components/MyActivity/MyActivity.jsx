import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useUser } from "@/UserContext/UserContext";
import Loading from "@/components/shared/Loading";
import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaClock, FaDesktop, FaExclamationTriangle, FaGlobe, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";

const MyActivity = () => {
    const [activityLog, setActivityLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { selectedUser } = useUser();
    
    const axiosSecure = useAxiosSecure();
    const limit = 10;
     const { user } = useSelector((state) => state.auth);
     const { isLoading: usersLoading, error: usersError } = useGetUsersQuery(user.referralCode,currentPage,limit );
    useEffect(() => {
        const fetchActivityLog = async () => {
            if (!user) return;

            try {
                setLoading(true);
                

                const response = await axiosSecure.get(
                    `/api/v1/system-setting/activity-log?page=${currentPage}&limit=${limit}&username=${user.username}`
                );

                if (response.data.success) {
                    setActivityLog(response.data.data.results);
                    setTotalPages(response.data.data.pageCount);
                }
            } catch (err) {
                
            } finally {
                setLoading(false);
            }
        };

        fetchActivityLog();
    }, [currentPage, selectedUser, user, axiosSecure]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    if (loading || usersLoading) {
        return <Loading />;
    }
    if (usersError) {
        console.log(usersError)
        return <div className="mt-16 text-center text-red-500">Error loading users data</div>;
    }

    return (
        <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen">
          <div className="flex-1">
                    <div className=" mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">My Activity</h2>
                    </div>

                    {/* Activity Logs */}
                    <div className="space-y-4">
                        {activityLog.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No activity logs found
                            </div>
                        ) : (
                            activityLog.map((log) => (
                                <div
                                    key={log._id}
                                    className="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                                >
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold">
                                                <FaUser className="inline" /> {log.username}
                                            </span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
                                                ${log.method === "GET" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                                                {log.method}
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-50 text-gray-700 text-xs font-semibold">
                                                {log.action}
                                            </span>
                                            {log.isSuspicious ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-semibold">
                                                    <FaExclamationTriangle className="inline" /> Suspicious
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs font-semibold">
                                                    <FaCheckCircle className="inline" /> Safe
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <FaClock className="text-gray-400" /> {moment(log.timestamp).format("YYYY-MM-DD HH:mm:ss")}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaGlobe className="text-gray-400" /> {log.ip}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaMapMarkerAlt className="text-gray-400" /> {log.location.city}, {log.location.country}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FaDesktop className="text-gray-400" /> {log.browser} / {log.os}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 break-all">
                                            <span className="font-semibold">Route:</span> {log.route}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {activityLog.length > 0 && (
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 px-4 rounded-md mr-2 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="py-1.5 px-4 text-gray-700">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 px-4 rounded-md ml-2 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
        </div>
    );
};

export default MyActivity;