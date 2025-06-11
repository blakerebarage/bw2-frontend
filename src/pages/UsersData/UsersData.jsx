import { useCurrency } from "@/Hook/useCurrency";
import { useGetUsersQuery } from "@/redux/features/allApis/usersApi/usersApi";
import moment from "moment";
import { useEffect, useState } from "react";
import { FaHouseUser } from "react-icons/fa";
import { useParams } from "react-router-dom";

const UsersData = () => {
  const { data: users } = useGetUsersQuery();
  const [loading, setLoading] = useState(false);
  const [allusers, setUser] = useState([]);
  const { formatCurrency } = useCurrency()

  const { role } = useParams();
  useEffect(() => {
    setLoading(true);
    if (users?.data?.users) {
      setUser(users.data.users);
    }
    setLoading(false);
  }, [users]);
  const filteredUsers = allusers?.filter((user) =>
    user?.role ? user?.role === role : "user" === role
  );

  return (
    <div className="pt-6 px-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#1f2937]">User Management</h2>
          <p className="text-gray-600 mt-1">Manage and monitor user activities</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#1f2937]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Full Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Joined At
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Last login At
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers?.length ? (
                filteredUsers?.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {row?.role === "admin" ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#1f2937] text-white text-sm font-semibold rounded-lg">
                            AD
                          </span>
                        ) : row?.role === "sub-admin" ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#1f2937] text-white text-sm font-semibold rounded-lg">
                            SA
                          </span>
                        ) : row?.role === "agent" ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#1f2937] text-white text-sm font-semibold rounded-lg">
                            AG
                          </span>
                        ) : row?.role === "sub-agent" ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#1f2937] text-white text-sm font-semibold rounded-lg">
                            SG
                          </span>
                        ) : row?.role === "user" ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#1f2937] text-white text-sm font-semibold rounded-lg">
                            US
                          </span>
                        ) : null}
                        <span className="text-[#1f2937] font-medium">{row.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {row?.fullName} {row?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1f2937]">
                      {row?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1f2937]">
                      {formatCurrency(row?.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {moment(row?.createdAt).format("Do MMM YYYY, h:mm a")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {row?.lastLoginAt
                        ? moment(row?.lastLoginAt).fromNow()
                        : "No Data"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-semibold text-[#1f2937] bg-gray-100 rounded-full">
                        {row?.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <svg className="w-2 h-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button className="inline-flex items-center justify-center w-10 h-10 text-[#1f2937] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                        <FaHouseUser className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No Data Found</p>
                      <p className="text-sm">There are no users matching your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersData;
