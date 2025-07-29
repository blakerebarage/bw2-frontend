import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useUser } from "@/UserContext/UserContext";
import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { FaHouseUser } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import logo from "../../../public/logoBlack.png";
import AccountTabs from "../AccountTabs/AccountTabs";
import CommonNavMenu from "../CommonNavMenu/CommonNavMenu";

const Downlist = () => {
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const usersPerPage = 20;
  const { id } = useParams();
  const { selectedUser, setSelectedUser } = useUser();
  const axiosSecure = useAxiosSecure();

  // Fetch single user by ID
  const fetchSingleUser = useCallback(async (userId) => {
    if (!userId) return;
    
    setSelectedUserLoading(true);
    
    try {
      const response = await axiosSecure.get(`/api/v1/user/single/${userId}`);
      if (response.data?.success && response.data?.data) {
        setSelectedUser(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setSelectedUserLoading(false);
    }
  }, [axiosSecure, setSelectedUser]); 

  // Fetch selected user when ID changes
  useEffect(() => {
    if (id) {
      fetchSingleUser(id);
    }
  }, [id, fetchSingleUser]);

  // Build query parameters for server-side pagination
  const queryParams = {
    page: currentPage,
    limit: usersPerPage,
    // Filter by selectedUser's referral code if available
     referredBy: selectedUser?.referralCode
  };

  // Only fetch users if we have a selectedUser with referralCode
  const shouldFetchUsers = selectedUser?.referralCode;
  
  // Use RTK Query to fetch users with proper pagination
  const { data: users, isLoading, error, refetch, isFetching } = useGetUsersQuery(queryParams, {
    refetchOnMountOrArgChange: true,
    skip: !shouldFetchUsers, // Skip the query if no selectedUser
  });
   
  
  // Use API pagination data instead of client-side pagination
  const totalPages = users?.data?.pageCount || 0;
  const totalItems = users?.data?.totalItems || 0;
  const currentUsers = users?.data?.users || [];

  // Check if error is 404 (no users found) vs actual error
  const is404Error = error?.status === 404 || error?.originalStatus === 404;
  const hasActualError = error && !is404Error;

  // Filter users based on search query (client-side for now)
  const filteredUsers = currentUsers.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to page 1 when selectedUser changes
  useEffect(() => {
    if (selectedUser?.referralCode) {
      setCurrentPage(1);
    }
  }, [selectedUser?.referralCode]);

  // Force refetch when page changes or selectedUser changes
  useEffect(() => {
    if (selectedUser?.referralCode) {
      
      refetch();
    }
  }, [currentPage, selectedUser?.referralCode, refetch]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Reset to page 1 when search changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: "bg-blue-100", text: "text-blue-800", label: "AD" },
      "sub-admin": { bg: "bg-purple-100", text: "text-purple-800", label: "SA" },
      agent: { bg: "bg-green-100", text: "text-green-800", label: "AG" },
      "sub-agent": { bg: "bg-yellow-100", text: "text-yellow-800", label: "SG" },
      "cash-agent": { bg: "bg-orange-100", text: "text-orange-800", label: "CA" },
      "sub-cash-agent": { bg: "bg-red-100", text: "text-red-800", label: "SC" },
      user: { bg: "bg-gray-100", text: "text-gray-800", label: "US" }
    };
    return badges[role] || { bg: "bg-gray-100", text: "text-gray-800", label: role?.slice(0, 2).toUpperCase() };
  };

  const loading = selectedUserLoading || isLoading;
  
  return (
    <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen">
      <CommonNavMenu />
      <div className="flex flex-col md:flex-row px-4 py-6 gap-6">
        <AccountTabs id={id} />
        <div className="flex-1 ">
          {/* Header Section */}
          <div className="mt-6 mb-6 border border-gray-200 rounded-lg p-4 drop-shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900">Downline Users</h2>
            <p className="mt-1 text-sm text-gray-600">Manage and view referred users</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by username, name, or email..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
            {/* Loading Overlay */}
            {(isLoading || isFetching) && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="text-gray-700 font-medium">Loading users...</span>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-300">
                <thead className="bg-headerGray text-headingTextColor">
                  <tr>
                    <th className="border-y bg-headerGray border-gray-300 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="border-y bg-headerGray border-gray-300 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      User Name
                    </th>
                      <th className="border-y bg-headerGray border-gray-300 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                        Email
                      </th>
                    <th className="border-y bg-headerGray border-gray-300 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="border-y bg-headerGray border-gray-300 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Joined At
                    </th>
                    <th className="border-y bg-headerGray border-gray-300 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="border-y bg-headerGray border-gray-300 px-4 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      Role
                    </th>
                    <th className="border-y bg-headerGray border-gray-300 px-4 py-3 text-center text-sm font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="border-y bg-headerGray border-gray-300 px-4 py-3 text-center text-sm font-medium uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!shouldFetchUsers ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <p className="text-lg font-medium">Select a user to view their downline</p>
                          <p className="text-sm">Choose a user from the navigation to see their referred users</p>
                        </div>
                      </td>
                    </tr>
                  ) : (isLoading && !isFetching) ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 border-2 border-blue-500 border-dashed rounded-full animate-spin"></div>
                          <img src={logo} alt="Loading..." className="h-8 w-auto" />
                        </div>
                      </td>
                    </tr>
                  ) : hasActualError ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-red-600">
                        Error loading users. Please try again later.
                      </td>
                    </tr>
                  ) : (is404Error || filteredUsers.length === 0) ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                          </svg>
                          <p className="text-lg font-medium">No downline users found</p>
                          <p className="text-sm">This user hasn't referred anyone yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((row, index) => {
                      const roleBadge = getRoleBadge(row.role);
                      return (
                        <tr key={index} className="hover:bg-yellow-50 transition-colors duration-200">
                          <td className="border-b px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${roleBadge.bg} ${roleBadge.text} font-medium text-sm`}>
                                {roleBadge.label}
                              </span>
                              <Link to={`/downlist/${row?._id}`} className="text-blue-600 font-medium">{row.phone}</Link>
                            </div>
                          </td>
                          <td className="border-b px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                            <Link to={`/downlist/${row?._id}`} className="text-blue-600 font-medium">{row?.username}</Link>
                          </td>
                          <td className="border-b px-4 py-3 whitespace-nowrap text-sm text-red-600">
                            {row.email}
                          </td>
                          <td className="border-b px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${row?.balance?.toLocaleString() || 0}
                          </td>
                          <td className="border-b px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {moment(row.createdAt).format("Do MMM YYYY, h:mm a")}
                          </td>
                          <td className="border-b px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {row?.lastLoginAt ? moment(row?.lastLoginAt).fromNow() : "Never"}
                          </td>
                          <td className="border-b px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                              {row?.role}
                            </span>
                          </td>
                          <td className="border-b px-4 py-3 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <span className="w-2 h-2 mr-1.5 bg-green-500 rounded-full"></span>
                              Active
                            </span>
                          </td>
                          <td className="border-b px-4 py-3 whitespace-nowrap text-center">
                            <Link
                              to={`/profile/${row?._id}`}
                              className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                              title="View Profile"
                            >
                              <FaHouseUser className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - only show when we have users and are fetching data */}
            {shouldFetchUsers && !hasActualError && !is404Error && totalPages > 0 && (
              <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Showing page {currentPage} of {totalPages} ({totalItems} total users)
                    {isFetching && <span className="ml-2 text-blue-600">(Fetching...)</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isFetching}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Previous
                    </button>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => handlePageChange(Math.min(Math.max(1, parseInt(e.target.value) || 1), totalPages))}
                        disabled={isFetching}
                        className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      />
                      <button
                        onClick={() => handlePageChange(currentPage)}
                        disabled={isFetching}
                        className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Go
                      </button>
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isFetching}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downlist;
