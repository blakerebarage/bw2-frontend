import useAxiosSecure from "@/Hook/useAxiosSecure";
import Loading from "@/components/shared/Loading";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { FaCheckCircle, FaClock, FaDesktop, FaExclamationTriangle, FaGlobe, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import { useParams } from "react-router-dom";
import AccountTabs from "../AccountTabs/AccountTabs";
import CommonNavMenu from "../CommonNavMenu/CommonNavMenu";

const Activity = () => {
    const [activityLog, setActivityLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLoading, setUserLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState(null);
   
    const axiosSecure = useAxiosSecure();
    const limit = 10;
    
    const { id } = useParams();
    const [selectedUser, setSelectedUser] = useState(null);

    // Memoize the getSingleUser function to prevent unnecessary re-renders
    const getSingleUser = useCallback(async () => {
        if (!id) return;
        
        try {
            setUserLoading(true);
            setError(null);
            const response = await axiosSecure.get(`/api/v1/user/single/${id}`);
            if (response.data.success) {
                setSelectedUser(response.data.data);
            } else {
                setError('Failed to fetch user data');
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            setError(err.response?.data?.message || 'Failed to fetch user data');
        } finally {
            setUserLoading(false);
        }
    }, [id, axiosSecure]);

    // Fetch single user when component mounts or id changes
    useEffect(() => {
        getSingleUser();
    }, [getSingleUser]);

    // Fetch activity log when selectedUser or currentPage changes
    useEffect(() => {
        const fetchActivityLog = async () => {
            if (!selectedUser) {
                setActivityLog([]);
                setTotalPages(1);
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                setError(null);
                const response = await axiosSecure.get(
                    `/api/v1/system-setting/activity-log?page=${currentPage}&limit=${limit}&username=${selectedUser.username}`
                );
                
                if (response.data.success) {
                    setActivityLog(response.data.data.results || []);
                    setTotalPages(response.data.data.pageCount || 1);
                } else {
                    setActivityLog([]);
                    setTotalPages(1);
                    setError('Failed to fetch activity log');
                }
            } catch (err) {
                console.error('Error fetching activity log:', err);
                setActivityLog([]);
                setTotalPages(1);
                setError(err.response?.data?.message || 'Failed to fetch activity log');
            } finally {
                setLoading(false);
            }
        };

        fetchActivityLog();
    }, [currentPage, selectedUser, axiosSecure, limit]);

    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    }, [totalPages]);

    // Show loading state
    if (userLoading) {
        return <Loading />;
    }

    // Show error state
    if (error) {
        return (
            <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen">
                <CommonNavMenu />
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center text-red-500">
                        <p className="text-xl font-semibold mb-2">Error</p>
                        <p>{error || 'Failed to load data'}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show user not found state
    if (!selectedUser && !userLoading) {
        return (
            <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen">
                <CommonNavMenu />
                <div className="flex justify-center items-center min-h-[400px]">
                    <div className="text-center text-gray-500">
                        <p className="text-xl font-semibold mb-2">User Not Found</p>
                        <p>The requested user could not be found.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen">
            <CommonNavMenu />
            <div className="flex flex-col md:flex-row px-4 py-6 gap-6">
                <AccountTabs id={id} />
                <div className="flex-1 border border-gray-200 rounded-lg p-4 drop-shadow-lg  mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Activity Log {selectedUser && `- ${selectedUser.username}`}
                    </h2>

                    {/* Loading state for activity log */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <>
                            {/* Activity Logs */}
                            <div className="space-y-4">
                                {activityLog.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                        <svg className="w-16 h-16 mb-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-2xl font-semibold mb-2 text-gray-700">No Activity Logs</p>
                                        <p className="text-base text-gray-400">There are no activity logs for this user yet.</p>
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
                                                        <FaMapMarkerAlt className="text-gray-400" /> {log.location?.city}, {log.location?.country}
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
                            {activityLog.length > 0 && totalPages > 1 && (
                                <div className="flex justify-center mt-6">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 px-4 rounded-md mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="py-1.5 px-4 text-gray-700">Page {currentPage} of {totalPages}</span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 px-4 rounded-md ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Activity;