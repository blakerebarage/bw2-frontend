import useAxiosSecure from "@/Hook/useAxiosSecure";
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import Swal from "sweetalert2";
import logo from "../../assets/ourbet.png";

const AddBank = () => {
  const { user } = useSelector((state) => state.auth);
  const axiosSecure = useAxiosSecure();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankType, setBankType] = useState("");
  const [selectBankLimit, setSelectBankLimit] = useState("10");
  const [channel, setChannel] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [banks, setBanks] = useState([]);
  const { addToast } = useToasts();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dailyLimit, setDailyLimit] = useState("");
  const [editingBank, setEditingBank] = useState(null);

  // New state variables for bank details
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [bankChannel, setBankChannel] = useState("");

  const fetchBanks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosSecure.get(
        `/api/v1/finance/bank-list?page=${currentPage}&limit=${selectBankLimit}&search=${bankType}&username=${user?.username}`
      );
      
      setBanks(res.data.data.results);
      setTotalPages(Math.ceil(res.data.data.total / parseInt(selectBankLimit)));
    } catch (err) {
      addToast("Failed to fetch banks", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectBankLimit, bankType, axiosSecure, addToast, user?.username]);

  const debouncedSearch = useMemo(
    () => debounce(() => {
      setCurrentPage(1);
      fetchBanks();
    }, 500),
    [fetchBanks]
  );

  useEffect(() => {
    fetchBanks();
    return () => {
      debouncedSearch.cancel();
    };
  }, [fetchBanks, debouncedSearch]);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);

  const toggleModal = useCallback(() => {
    setIsModalOpen(prevState => {
      if (!prevState) {
        setBankType("");
        setChannel("");
        setAccountNumber("");
        setBankName("");
        setBranchName("");
        setAccountHolderName("");
        setDistrictName("");
        setRoutingNumber("");
        setDailyLimit("");
        setEditingBank(null);
      }
      return !prevState;
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (bankType === "Bank") {
      if (!bankName || !branchName || !accountNumber || !accountHolderName || !districtName || !routingNumber) {
        addToast("All bank fields are required!", {
          appearance: "error",
          autoDismiss: true,
        });
        return;
      }
    } else {
      if (!bankType || !channel || !accountNumber) {
        addToast("All fields are required!", {
          appearance: "error",
          autoDismiss: true,
        });
        return;
      }
    }

    const newBank = bankType === "Bank" ? {
      username: user?.username,
      bankType,
      bankName,
      branchName,
      accountNumber,
      accountHolderName,
      districtName,
      routingNumber,
      channel: "Bank-Transfer",
      dailyLimit: dailyLimit || "0"
    } : {
      username: user?.username,
      bankType,
      channel,
      accountNumber,
      dailyLimit: dailyLimit || "0"
    };
    try {
      if (editingBank) {
        const res = await axiosSecure.patch(`/api/v1/finance/update-bank/${editingBank._id}`, newBank);
        if (res.data.success) {
          Swal.fire({
            title: "Success!",
            text: "Bank information updated successfully.",
            icon: "success",
            confirmButtonText: "OK",
          });
          toggleModal();
          fetchBanks();
        }
      } else {
        const res = await axiosSecure.post("/api/v1/finance/create-bank", newBank);
        
        if (res.data.success) {
          Swal.fire({
            title: "Success!",
            text: "Bank information added successfully.",
            icon: "success",
            confirmButtonText: "OK",
          });
          toggleModal();
          fetchBanks();
        }
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  }, [bankType, channel, accountNumber, bankName, branchName, accountHolderName, districtName, routingNumber, dailyLimit, user?.username, axiosSecure, toggleModal, fetchBanks, addToast, editingBank]);

  const handleEdit = (bank) => {
    setEditingBank(bank);
    setBankType(bank.bankType);
    setChannel(bank.channel);
    setAccountNumber(bank.accountNumber);
    setBankName(bank.bankName || "");
    setBranchName(bank.branchName || "");
    setAccountHolderName(bank.accountHolderName || "");
    setDistrictName(bank.districtName || "");
    setRoutingNumber(bank.routingNumber || "");
    setDailyLimit(bank.dailyLimit || "");
    setIsModalOpen(true);
  };

  const handleStatusbtn = useCallback(async (id, type) => {
    try {
      const res = await axiosSecure.patch(`/api/v1/finance/update-bank/${id}`, {
        status: type ? "deactive" : "active",
      });
      if (res.data.success) {
        addToast(type ? "Bank activated!" : "Bank deactivated!", {
          appearance: "success",
          autoDismiss: true,
        });
        fetchBanks();
      }
    } catch (err) {
      addToast("Failed to update status.", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  }, [axiosSecure, addToast, fetchBanks]);

  const handleDelete = useCallback((id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axiosSecure.delete(`/api/v1/finance/delete-bank/${id}`);
          if (res.data.success) {
            Swal.fire("Deleted!", "The bank has been deleted.", "success");
            fetchBanks();
          }
        } catch (error) {
          Swal.fire("Error!", "Failed to delete the bank.", "error");
        }
      }
    });
  }, [axiosSecure, fetchBanks]);

  const handleSearch = useCallback(() => {
    debouncedSearch();
  }, [debouncedSearch]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-6">
            <h1 className="text-2xl font-bold text-white text-center">
              Bank Management
            </h1>
            <p className="text-gray-300 text-center mt-2">
              Manage and update user bank information efficiently
            </p>
          </div>
        </div>
        <div className="navbar bg-white rounded-lg p-4 shadow-sm">
          <div className="flex justify-between w-full">
            <div className="flex justify-between space-x-4">
              <select
                className="select bg-white border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-[#1f2937] focus:ring-2 focus:ring-gray-200 transition-all duration-200 w-48"
                value={bankType}
                onChange={(e) => setBankType(e.target.value)}
              >
                <option value="">Select Bank Type</option>
                <option value="Bkash">Bkash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Upay">Upay</option>
                <option value="Tap">Tap</option>
                <option value="OkWallet">OkWallet</option>
                <option value="Crypto">Crypto</option>
                <option value="Bank">Bank</option>
              </select>
              
              <select
                className="select bg-white border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-[#1f2937] focus:ring-2 focus:ring-gray-200 transition-all duration-200 w-32"
                value={selectBankLimit}
                onChange={(e) => setSelectBankLimit(e.target.value)}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
              </select>
              
              <button
                className="btn bg-[#1f2937] hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                onClick={handleSearch}
              >
                Search
              </button>
            </div>
            
            <button
              className="bg-[#1f2937] hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              onClick={toggleModal}
            >
              <span>+</span>
              <span>Add Bank</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-6 rounded-lg shadow">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 text-[#1f2937]">
                <th className="py-3 px-4 border-b">Sr no.</th>
                <th className="py-3 px-4 border-b">Bank Name</th>
                <th className="py-3 px-4 border-b">Channel</th>
                <th className="py-3 px-4 border-b">Account Number</th>
                <th className="py-3 px-4 border-b">Daily Limit</th>
                <th className="py-3 px-4 border-b">Remaining Limit</th>
                <th className="py-3 px-4 border-b">Total Received Today</th>
                <th className="py-3 px-4 border-b">Created Date</th>
                <th className="py-3 px-4 border-b">Action</th>
                <th className="py-3 px-4 border-b">View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-8">
                    <div className="flex-col flex justify-center items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-[#1f2937] border-t-transparent rounded-full animate-spin"></div>
                      <img src={logo} alt="" className="h-12" />
                    </div>
                  </td>
                </tr>
              ) : banks?.length === 0 ? (
                <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium">No Data Found</p>
                        <p className="text-sm">There are no bank information found</p>
                      </div>
                    </td>
                  </tr>
              ) : (
                banks.map((bank, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-3 px-4 border-b text-center">{index + 1}</td>
                    <td className="py-3 px-4 border-b text-center">{ bank.bankType === "Bank" ? bank.bankName : bank.bankType}</td>
                    <td className="py-3 px-4 border-b text-center">{bank.channel}</td>
                    <td className="py-3 px-4 border-b text-center">{bank.accountNumber}</td>
                    <td className="py-3 px-4 border-b text-center">{bank.dailyLimit || "0"}</td>
                    <td className="py-3 px-4 border-b text-center">{bank.remainingDailyLimit || "0"}</td>
                    <td className="py-3 px-4 border-b text-center">{bank.totalReceivedToday || "0"}</td>

                    <td className="py-3 px-4 border-b text-center">{new Date(bank.createdAt).toISOString().split('T')[0]}</td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => handleEdit(bank)}
                          className="px-4 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleStatusbtn(bank._id, bank.status === "active")}
                          className={`px-4 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                            bank.status === "active"
                              ? "bg-green-100 text-green-600 hover:bg-green-200"
                              : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                          }`}
                        >
                          {bank.status}
                        </button>
                        <button
                          onClick={() => handleDelete(bank._id)}
                          className="px-4 py-1 rounded-full text-sm font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b">
                      <Link
                        to={`/admindashboard/bank-details/${bank.accountNumber}`}
                        className="px-4 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all duration-200"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#1f2937] text-white hover:bg-gray-800"
            }`}
          >
            Previous
          </button>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-gray-600">Page</span>
            <span className="font-semibold text-[#1f2937]">{currentPage}</span>
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || banks?.length === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#1f2937] text-white hover:bg-gray-800"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-[500px] max-h-[90vh] overflow-y-auto">
            <h1 className="text-2xl font-bold text-[#1f2937] mb-6">
              {editingBank ? "Edit Bank" : "Add Bank"}
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">
                  Method Name
                </label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                  value={bankType}
                  onChange={(e) => setBankType(e.target.value)}
                >
                  <option value="">Select Bank Type</option>
                  <option value="Bkash">Bkash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Upay">Upay</option>
                  <option value="Tap">Tap</option>
                  <option value="OkWallet">OkWallet</option>
                  <option value="Crypto">Crypto</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>

              {bankType === "Bank" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-1">
                      Bank Name
                    </label>
                    <select
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    >
                      <option value="">Select Bank Name</option>
                      <option value="DutchBangla">Dutch Bangla Bank</option>
                      <option value="Islami">Islami Bank</option>
                      <option value="ShajalalIslami">Shajalal Islami Bank</option>
                      <option value="Brack">Brack Bank</option>
                      <option value="City">City Bank</option>
                      <option value="Prime">Prime Bank</option>
                      <option value="Agrani">Agrani Bank</option>
                      <option value="Sonali">Sonali Bank</option>
                      <option value="Pubali">Pubali Bank</option>
                      <option value="Uttara">Uttara Bank</option>
                      <option value="Dhaka">Dhaka Bank</option>
                      <option value="Jamuna">Jamuna Bank</option>
                      <option value="One">One Bank</option>
                      <option value="UnitedCommercial">United Commercial Bank</option>
                      
                      

                      
                    </select>
                    
                  </div>
                 
                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-1">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="Enter branch name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Enter account holder name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-1">
                      District Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                      value={districtName}
                      onChange={(e) => setDistrictName(e.target.value)}
                      placeholder="Enter district name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-1">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      placeholder="Enter routing number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-1">
                      Channel Type
                    </label>
                    <select
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                    >
                      <option value="">Select Channel Type</option>
                      <option value="Cash-Out">Cash-Out</option>
                      <option value="Send-Money">Send-Money</option>
                      <option value="Cash-In">Cash-In</option>
                      <option value="Make-Payment">Make-Payment</option>
                      <option value="Bank-Transfer">Bank-Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1f2937] mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">
                  Daily Limit
                </label>
                <input
                  type="number"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  placeholder="Enter daily limit"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
                  onClick={toggleModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium"
                >
                  {editingBank ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBank;
