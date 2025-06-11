import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaHouseUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import logo from "../../assets/ourbet.png";

const MyAccountDownList = () => {
  const { user } = useSelector((state) => state.auth);
  const { data: users, isLoading, error } = useGetUsersQuery();
  const [referredUsers, setReferredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 20;
  
  useEffect(() => {
    if (!isLoading && !error && user && users.data.users) {
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
    setCurrentPage(pageNumber);
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
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-300">
          <thead className="bg-headerGray text-headingTextColor">
            <tr>
              {[
                "Phone/User",
                "Full Name",
                "Email",
                "Balance",
                "Joined At",
                "Last Login",
                "Role",
                "Status",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className=" bg-headerGray border-gray-300 px-4 py-2 text-left text-xs font-semibold uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="9">
                  <div className="flex flex-col justify-center items-center space-y-3 h-64">
                    <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
                    <img src={logo} alt="Loading" className="w-20 rounded-2xl" />
                  </div>
                </td>
              </tr>
            ) : currentUsers.length > 0 ? (
              currentUsers.map((row, index) => (
                <tr key={row._id || index} className="hover:bg-yellow-100">
                  <td className=" px-4 py-2 whitespace-nowrap text-sm text-gray-700 flex items-center space-x-2">
                    <RoleBadge role={row?.role} />
                    <span className="text-blue-500">{row?.phoneOrUserName}</span>
                  </td>
                  <td className=" px-4 py-2 capitalize text-sm text-gray-700">
                    {row?.fullName} {row?.lastName}
                  </td>
                  <td className=" px-4 py-2 text-sm text-red-700">
                    {row?.email}
                  </td>
                  <td className=" px-2 py-2 text-sm text-gray-700">
                    {row?.balance || 0}
                  </td>
                  <td className=" px-2 py-2 text-sm text-gray-700">
                    {moment(row?.createdAt).format("Do MMM YYYY, h:mm a")}
                  </td>
                  <td className=" px-4 py-2 text-sm text-gray-700">
                    {row?.lastLoginAt
                      ? moment(row?.lastLoginAt).fromNow()
                      : "No Data"}
                  </td>
                  <td className=" px-4 py-2 text-sm text-gray-700 capitalize">
                    {row?.role}
                  </td>
                  <td className=" px-4 py-2 text-center">
                    <div className="inline-flex items-center space-x-1 bg-green-100 rounded px-2 py-1">
                      <div className="w-2.5 h-2.5 bg-green-600 rounded-full"></div>
                      <span className="text-green-800 text-xs">Active</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Link
                      to={`/admindashboard/userprofile/${row?._id}`}
                      className="inline-flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-300 rounded-sm text-gray-700"
                    >
                      <FaHouseUser />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-10 text-gray-500">
                  No referred users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between space-x-4 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="font-semibold text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const RoleBadge = ({ role }) => {
  const roleMap = {
    admin: "AD",
    "sub-admin": "SA",
    agent: "AG",
    "sub-agent": "SG",
    user: "US",
  };

  return role ? (
    <button className="w-6 h-6 bg-green-500 font-sans text-white text-xs rounded-sm">
      {roleMap[role] || "??"}
    </button>
  ) : null;
};

export default MyAccountDownList;
