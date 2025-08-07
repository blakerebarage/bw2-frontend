import useAxiosSecure from "@/Hook/useAxiosSecure";
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useToasts } from "react-toast-notifications";
import Swal from "sweetalert2";
import logo from "../../../public/logoBlack.png";

const AddBank = () => {
  const { user } = useSelector((state) => state.auth);
  const axiosSecure = useAxiosSecure();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bankType, setBankType] = useState("");
  const [selectBankLimit, setSelectBankLimit] = useState(10);
  const [channel, setChannel] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [banks, setBanks] = useState([]);
  const { addToast } = useToasts();
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dailyLimit, setDailyLimit] = useState("");
  const [editingBank, setEditingBank] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");

  // New state variables for bank details
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [balance, setBalance] = useState("");

  const fetchBanks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: selectBankLimit,
        username: user?.username || '',
      });
      
      if (bankType) {
        params.append('search', bankType);
      }
      if (selectedPurpose) {
        params.append('purpose', selectedPurpose);
      }
      
      const res = await axiosSecure.get(`/api/v1/finance/bank-list?${params.toString()}`);
      // console.log(res)
      if (res.data.success) {
        setBanks(res.data.data.results || []);
        setTotalPages(Math.ceil((res.data.data.total || 0) / parseInt(selectBankLimit)));
      } else {
        setBanks([]);
        setTotalPages(1);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        addToast("Failed to fetch banks", {
          appearance: "error",
          autoDismiss: true,
        });
      } else {
        setBanks([]);
        setTotalPages(1);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectBankLimit, bankType, selectedPurpose, axiosSecure, addToast, user?.username]);

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
        setPurpose("");
        setBalance("");
        setEditingBank(null);
      }
      return !prevState;
    });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (bankType === "Bank") {
      if (!bankName || !branchName || !accountNumber || !accountHolderName || !districtName || !routingNumber || !purpose) {
        addToast("All bank fields are required!", {
          appearance: "error",
          autoDismiss: true,
        });
        return;
      }
    } else {
      if (!bankType || !channel || !accountNumber || !purpose) {
        addToast("All fields are required!", {
          appearance: "error",
          autoDismiss: true,
        });
        return;
      }
    }
    
    // Validate balance (optional field but should be a valid number if provided)
    if (balance && isNaN(Number(balance))) {
      addToast("Balance must be a valid number!", {
        appearance: "error",
        autoDismiss: true,
      });
      return;
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
      dailyLimit: dailyLimit || "0",
      balance: balance || "0",
      purpose
    } : {
      username: user?.username,
      bankType,
      channel,
      accountNumber,
      dailyLimit: dailyLimit || "0",
      balance: balance || "0",
      purpose
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
  }, [bankType, channel, accountNumber, bankName, branchName, accountHolderName, districtName, routingNumber, dailyLimit, balance, user?.username, axiosSecure, toggleModal, fetchBanks, addToast, editingBank]);

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
    setBalance(bank.balance || "");
    setPurpose(bank.purpose || "");
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
            {/* Filter/Search Controls - Responsive */}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 mb-2 w-full">
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 flex-1">
                <select
                  className="w-full md:w-auto p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] text-sm"
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
                  className="w-full md:w-auto p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] text-sm"
                  value={selectedPurpose}
                  onChange={(e) => setSelectedPurpose(e.target.value)}
                >
                  <option value="">Select Purpose</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdraw">Withdraw</option>
                  <option value="Send-Money">Send-Money</option>
                </select>
                <select
                  className="w-full md:w-auto p-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] text-sm"
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
                  className="btn bg-[#1f2937] hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 text-sm"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </div>
              <button
                className="bg-[#1f2937] hover:bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 text-sm mt-2 md:mt-0"
                onClick={toggleModal}
              >
                <span>+</span>
                <span>Add Bank</span>
              </button>
            </div>
            
            
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto mt-6 rounded-lg shadow w-full">
          <table className="min-w-full bg-white text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-50 text-[#1f2937]">
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Sr no.</th>
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Bank Name</th>
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Channel</th>
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Account Number</th>
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Purpose</th>
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Daily Limit</th>
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Balance</th>
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Remaining Limit</th>
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Total Received Today</th>
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Status</th>
                <th className="py-2 px-2 md:py-3 md:px-4 border-b">Action/View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-8">
                    <div className="flex-col flex justify-center items-center space-y-4">
                      <div className="w-12 h-12 border-4 border-[#1f2937] border-t-transparent rounded-full animate-spin"></div>
                      <img src={logo} alt="" className="h-12" />
                    </div>
                  </td>
                </tr>
              ) : banks?.length === 0 ? (
                <tr>
                    <td colSpan="11" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div className="text-center">
                          <h3 className="text-lg font-medium text-[#1f2937] mb-1">No banks found</h3>
                          <p className="text-sm text-gray-500">
                            {bankType || selectedPurpose 
                              ? "Try adjusting your search filters to find what you're looking for" 
                              : "No bank information has been added yet"}
                          </p>
                          {(bankType || selectedPurpose) && (
                            <button
                              onClick={() => {
                                setBankType("");
                                setSelectedPurpose("");
                              }}
                              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
              ) : (
                banks.map((bank, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">{index + 1}</td>
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">{ bank.bankType === "Bank" ? bank.bankName : bank.bankType}</td>
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">{bank.channel}</td>
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">{bank.accountNumber}</td>
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                        ${bank.purpose === "Deposit" ? "bg-green-100 text-green-800" :
                          bank.purpose === "Withdraw" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"}`}>
                        {bank.purpose || "N/A"}
                      </span>
                    </td>
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">{bank.dailyLimit || "0"}</td>
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">{bank.balance || "0"}</td>
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">{bank.remainingDailyLimit || "0"}</td>
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">{bank.totalReceivedToday || "0"}</td>
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                        ${bank.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {bank.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-2 px-2 md:py-3 md:px-4 border-b text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleStatusbtn(bank._id, bank.status === "active")}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg transition-colors duration-200 text-xs font-medium ${
                            bank.status === "active" 
                              ? "text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200" 
                              : "text-green-600 hover:text-green-800 hover:bg-green-50 border border-green-200"
                          }`}
                          title={bank.status === "active" ? "Deactivate" : "Activate"}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {bank.status === "active" ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                          <span>{bank.status === "active" ? "Deactivate" : "Activate"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBank(bank);
                            setActionModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 text-[#1f2937] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="More Actions"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Buttons - Responsive */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-6 w-full">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs md:text-sm ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#1f2937] text-white hover:bg-gray-800"
            }`}
          >
            Previous
          </button>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm text-xs md:text-sm">
            <span className="text-gray-600">Page</span>
            <span className="font-semibold text-[#1f2937]">{currentPage}</span>
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || banks?.length === 0}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs md:text-sm ${
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
                  onChange={(e) => {
                    const newBankType = e.target.value;
                    setBankType(newBankType);
                    // Auto-set channel for Bank and Crypto
                    if (newBankType === "Bank" || newBankType === "Crypto") {
                      setChannel("Send-Money");
                    } else {
                      setChannel("");
                    }
                  }}
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
                      {bankType === "Bank" || bankType === "Crypto" ? (
                        <option value="Send-Money">Send-Money</option>
                      ) : (
                        <>
                          <option value="Cash-Out">Cash-Out</option>
                          <option value="Send-Money">Send-Money</option>
                          <option value="Cash-In">Cash-In</option>
                          <option value="Make-Payment">Make-Payment</option>
                          <option value="Bank-Transfer">Bank-Transfer</option>
                        </>
                      )}
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
                  Purpose*
                </label>
                <select
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <option value="">Select Purpose</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdraw">Withdraw</option>
                </select>
              </div>

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

              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">
                  Balance
                </label>
                <input
                  type="number"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-[#1f2937] transition-all duration-200"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="Enter balance"
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

      {/* Action Modal */}
      {actionModalOpen && selectedBank && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white rounded-xl shadow-2xl w-[400px] max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-[#1f2937]">Bank Actions</h1>
                <button
                  onClick={() => {
                    setActionModalOpen(false);
                    setSelectedBank(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Bank Info Section */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-[#1f2937] mb-3">Bank Information</h3>
                <div className="space-y-2 text-sm"> 
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created Date:</span>
                    <span className="font-medium text-[#1f2937]">{new Date(selectedBank.createdAt).toISOString().split('T')[0]}</span>
                  </div>
                </div>
              </div>

                             {/* Action Buttons */}
               <div className="space-y-3">
                 <button
                   onClick={() => {
                     setActionModalOpen(false);
                     setSelectedBank(null);
                     handleEdit(selectedBank);
                   }}
                   className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                 >
                   <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                   <span>Edit Bank</span>
                 </button>

                 <Link
                   to={`/admindashboard/bank-details/${selectedBank.accountNumber}`}
                   className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                   onClick={() => {
                     setActionModalOpen(false);
                     setSelectedBank(null);
                   }}
                 >
                   <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                   </svg>
                   <span>View Details</span>
                 </Link>

                 <button
                   onClick={() => {
                     setActionModalOpen(false);
                     setSelectedBank(null);
                     handleDelete(selectedBank._id);
                   }}
                   className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                   <span>Delete Bank</span>
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBank;
