import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import useManualUserDataReload from "@/Hook/useUserDataReload";
import { setCredentials } from "@/redux/slices/authSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import logo from "../../assets/ourbet.png";

const AllWithdraw = () => {
  const axiosSecure = useAxiosSecure();
  const {formatCurrency} = useCurrency();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [withdraws, setWithdraws] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const itemsPerPage = 50;
  const { reloadUserData } = useManualUserDataReload();
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
       
        const res = await axiosSecure.get(`/api/v1/finance/all-withdraw-request?limit=${itemsPerPage}&page=${currentPage}&${
          statusFilter === "all" ? "" : `status=${statusFilter}`
        }`);
        const filteredWithdraws = res?.data?.data?.results.filter(
          (item) => item?.referralCode === user?.referralCode
        );
        setWithdraws(filteredWithdraws);
        setTotalPages((res.data.data.pageCount));
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };

    if (user?.referralCode) {
      fetchData();
    }
  }, [axiosSecure, user?.referralCode, currentPage, statusFilter]);

  const handleApprove = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to approve this withdraw?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve it!",
      });

      if (result.isConfirmed) {
        const withdrawRequest = withdraws.find(item => item._id === id);
        if (!withdrawRequest) {
          throw new Error("Withdrawal request not found");
        }

        const userResponse = await axiosSecure.get(`/api/v1/user/profile`);
        const currentUserData = userResponse.data.data;

        const currentBalance = parseFloat(currentUserData.balance);
        const withdrawAmount = parseFloat(withdrawRequest.amount);
        const newBalance = currentBalance - withdrawAmount;

        if (newBalance < 0) {
          Swal.fire("Error!", "Insufficient balance for withdrawal.", "error");
          return;
        }

        const updatedUserData = {
          ...currentUserData,
          balance: newBalance
        };

        dispatch(setCredentials({
          token: localStorage.getItem("token"),
          user: updatedUserData
        }));

        await axiosSecure.patch(`/api/v1/finance/update-withdraw-request-status/${id}`, {
          status: "approved"
        });
        const updatedWithdraws = withdraws.map((item) =>
          item._id === id ? { ...item, status: "success" } : item
        );
        setWithdraws(updatedWithdraws);

        Swal.fire({
          title: "Approved!",
          html: `<p>The withdraw request has been approved.</p>`,
          icon: "success"
        });

        const refreshedWithdraws = await axiosSecure.get(`/api/v1/finance/all-withdraw-request?limit=${itemsPerPage}&page=${currentPage}`);
        const filteredWithdraws = refreshedWithdraws?.data?.data?.results.filter(
          (item) => item?.referralCode === user?.referralCode
        );
        setWithdraws(filteredWithdraws);
        reloadUserData();
      }
    } catch (error) {
      
      Swal.fire("Error!", error.message || "Something went wrong while approving.", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to reject this withdraw request?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, reject it!",
      });

      if (result.isConfirmed) {
        await axiosSecure.patch(`/api/v1/finance/update-withdraw-request-status/${id}`,
          {
            status: "cancelled"
          }
        );

        const updatedWithdraws = withdraws.map((item) =>
          item._id === id ? { ...item, status: "rejected" } : item
        );
        setWithdraws(updatedWithdraws);

        Swal.fire({
          title: "Rejected!",
          html: `<p>The withdraw request has been rejected.</p>`,
          icon: "success"
        });

        const refreshedWithdraws = await axiosSecure.get(`/api/v1/finance/all-withdraw-request?limit=${itemsPerPage}&page=${currentPage}`);
        const filteredWithdraws = refreshedWithdraws?.data?.data?.results.filter(
          (item) => item?.referralCode === user?.referralCode
        );
        setWithdraws(filteredWithdraws);
        reloadUserData();
      }
    } catch (error) {
      
      Swal.fire("Error!", error.message || "Something went wrong while rejecting.", "error");
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Withdraw Requests
            </h1>
            <p className="text-gray-300 text-center mt-2">
              Manage and update user withdraw requests efficiently
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-12 h-12 border-4 border-[#1f2937] border-t-transparent rounded-full animate-spin"></div>
            <img src={logo} alt="" className="w-16 h-16 bg-blue-400 rounded-2xl shadow-lg" />
          </div>
        ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
            <div className="w-full sm:w-auto p-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors duration-200"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="success">Success</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#1f2937]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    User Name / Phone
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Bank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Mobile Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Referred By
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdraws.length ? (
                  withdraws.map((withdraw) => (
                    <tr key={withdraw._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#1f2937] text-white text-sm font-semibold rounded-lg">
                            {withdraw?.username?.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="text-[#1f2937] font-medium">{withdraw?.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {withdraw?.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1f2937]">
                        {formatCurrency(withdraw?.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {withdraw?.withdrawAccountNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {withdraw?.channel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {withdraw?.referralCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(withdraw?.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(withdraw?.status)}`}>
                          <svg className="w-2 h-2 mr-1.5" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          {withdraw?.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {withdraw?.status === "pending" && (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleApprove(withdraw._id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(withdraw._id)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
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
                        <p className="text-sm">There are no withdrawal requests matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700">
              Showing page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#1f2937] text-white hover:bg-[#1f2937]/90"
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!withdraws.length}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  !withdraws.length
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-[#1f2937] text-white hover:bg-[#1f2937]/90"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllWithdraw;
