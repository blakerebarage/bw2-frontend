import { useUser } from "@/UserContext/UserContext";
import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaHouseUser } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import logo from "../../assets/ourbet.png";
import AccountTabs from "../AccountTabs/AccountTabs";
import CommonNavMenu from "../CommonNavMenu/CommonNavMenu";

const Downlist = () => {
  
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [referredUsers, setReferredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const usersPerPage = 20;
  const { id } = useParams();
  const { selectedUser, setSelectedUser } = useUser();
 

  useEffect(() => {
    const foundUser = users?.data?.users.find((user) => user._id === id);
    if (foundUser) {
      setSelectedUser(foundUser);
    }
  }, [id, users, setSelectedUser]);
  useEffect(() => {
    if (!isLoading && !error && selectedUser && users) {
      const filteredUsers = users?.data?.users?.filter(
        (user) => user.referredBy === selectedUser.referralCode
      );
      
      setReferredUsers(filteredUsers || []);
      setTotalPages(Math.ceil((filteredUsers?.length || 0) / usersPerPage));
    }
  }, [selectedUser, users, isLoading, error]);

  // Filter users based on search query
  const filteredUsers = referredUsers.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: { bg: "bg-blue-100", text: "text-blue-800", label: "AD" },
      "sub-admin": { bg: "bg-purple-100", text: "text-purple-800", label: "SA" },
      agent: { bg: "bg-green-100", text: "text-green-800", label: "AG" },
      "sub-agent": { bg: "bg-yellow-100", text: "text-yellow-800", label: "SG" },
      user: { bg: "bg-gray-100", text: "text-gray-800", label: "US" }
    };
    return badges[role] || { bg: "bg-gray-100", text: "text-gray-800", label: role?.slice(0, 2).toUpperCase() };
  };
  
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                  {isLoading ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-12 h-12 border-2 border-blue-500 border-dashed rounded-full animate-spin"></div>
                          <img src={logo} alt="Loading..." className="h-8 w-auto" />
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-red-600">
                        Error loading users. Please try again later.
                      </td>
                    </tr>
                  ) : currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((row, index) => {
                      const roleBadge = getRoleBadge(row.role);
                      return (
                        <tr key={index} className="hover:bg-yellow-50 transition-colors duration-200">
                          <td className="border-b px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${roleBadge.bg} ${roleBadge.text} font-medium text-sm`}>
                                {roleBadge.label}
                              </span>
                              <span className="text-blue-600 font-medium">{row.phonenumber}</span>
                            </div>
                          </td>
                          <td className="border-b px-4 py-3 whitespace-nowrap text-sm text-gray-900 capitalize">
                            {row?.username}
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
                              to={`/admindashboard/userprofile/${row?._id}`}
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

            {/* Pagination */}
            <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
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
                      className="w-16 px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      onClick={() => handlePageChange(currentPage)}
                      className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 rounded-md transition-colors duration-200"
                    >
                      Go
                    </button>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Downlist;
