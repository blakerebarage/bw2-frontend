import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaHouseUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logo from "../../../public/logoBlack.png";

const MyAccountDownList = () => {
  const { user } = useSelector((state) => state.auth);
  const [referredUsers, setReferredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;
  
  // Build query parameters based on user role
  const queryParams = {
    page: currentPage,
    limit: usersPerPage, // Get all users for client-side filtering
    ...(user?.role !== 'super-admin' && user?.referralCode && { referredBy: user.referralCode })
  };
  
  const { data: users, isLoading, error } = useGetUsersQuery(queryParams);

  useEffect(() => {
    if (!isLoading && !error && user && users?.data?.users) {
      const filteredUsers = users.data.users.filter(
        (u) => u.referredBy === user?.referralCode
      );
      setReferredUsers(filteredUsers);
    }
  }, [user, users, isLoading, error]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = referredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(referredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-600 font-semibold">
        Error loading users
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#fefefe] to-[#f3f3f3] min-h-screen p-4 w-full">
      {/* Header */}
      <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">My Referred Users</h2>
        <p className="mt-1 text-sm text-gray-600">
          View users you have referred ({referredUsers.length} total)
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-headerGray text-headingTextColor border-b border-gray-300">
                {[
                  "Phone",
                  "User Name", 
                  "Email",
                  "Balance",
                  "Joined At",
                  "Last Login",
                  "Status",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-gray-300 last:border-r-0"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8">
                    <div className="flex flex-col justify-center items-center space-y-3">
                      <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                      <img src={logo} alt="Loading" className="w-20 rounded-2xl" />
                      <p className="text-gray-500">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length > 0 ? (
                currentUsers.map((row, index) => (
                  <tr key={row._id || index} className="hover:bg-yellow-50 transition-colors duration-200">
                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                      <div className="flex items-center space-x-2">
                        <RoleBadge role={row?.role} />
                        <Link to={`/downlist/${row?._id}`} className="text-blue-600 font-medium">{row?.phone}</Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                      <Link to={`/downlist/${row?._id}`} className="text-blue-600 font-medium">{row?.username}</Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                      <span className="text-red-600">{row?.email}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                      <span className="text-gray-900 font-medium">${(row?.balance || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                      <span className="text-gray-600">{moment(row?.createdAt).format("MMM DD, YYYY")}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                      <span className="text-gray-600">
                        {row?.lastLoginAt
                          ? moment(row?.lastLoginAt).fromNow()
                          : "Never"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                      <div className="inline-flex items-center space-x-1 bg-green-100 rounded-full px-3 py-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-green-800 text-xs font-medium">Active</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <Link
                        to={`/downlist/${row?._id}`}
                        className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 transition-colors duration-200"
                        title="View Profile"
                      >
                        <FaHouseUser className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <FaHouseUser className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No referred users found</h3>
                        <p className="text-gray-500">You haven't referred any users yet.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, referredUsers.length)} of {referredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {renderPageNumbers()}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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
  );
};

const RoleBadge = ({ role }) => {
  const roleConfig = {
    "super-admin": { code: "SA", bg: "bg-red-500" },
    "admin": { code: "AD", bg: "bg-purple-500" },
    "sub-admin": { code: "SUB", bg: "bg-blue-500" },
    "super-agent": { code: "SPR", bg: "bg-indigo-500" },
    "master-agent": { code: "MST", bg: "bg-pink-500" },
    "agent": { code: "AG", bg: "bg-green-500" },
    "user": { code: "US", bg: "bg-gray-500" },
  };

  const config = roleConfig[role] || { code: "??", bg: "bg-gray-400" };

  return role ? (
    <div className={`inline-flex items-center justify-center w-8 h-8 ${config.bg} text-white text-xs font-semibold rounded-lg`}>
      {config.code}
    </div>
  ) : null;
};

export default MyAccountDownList;
