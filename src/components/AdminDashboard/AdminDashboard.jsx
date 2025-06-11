import {
  useAddUserMutation,
  useGetUsersQuery,
} from "@/redux/features/allApis/usersApi/usersApi";
import moment from "moment";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
// import ProviderStatsDashboard from "../GameAPIComponet/ProviderStatsDashboard";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import { FaHouseUser } from "react-icons/fa";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const axiosSecure = useAxiosSecure();
  const { data: users } = useGetUsersQuery();
  const [addUser, { isLoading }] = useAddUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const { addToast } = useToasts();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [allusers, setUser] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 50;
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [editingUser, setEditingUser] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [selectedExposure, setSelectedExposure] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Stat data state
  const [statData, setStatData] = useState(null);

  const { formatCurrency } = useCurrency();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isUserControlsExpanded, setIsUserControlsExpanded] = useState(false);

  useEffect(() => {
    // Fetch stat data on mount
    const fetchStatData = async () => {
      try {
        const res = await axiosSecure.get("/api/v1/report/stat-data");
        if (res.data.success) {
          setStatData(res.data.data);
        }
      } catch (err) {
        // Optionally show a toast
        addToast("Failed to fetch stat data", { appearance: "error", autoDismiss: true });
      }
    };
    fetchStatData();
  }, [axiosSecure, addToast]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search: keyword,
        });
        
        // Add role and status to params if they're not empty
        if (selectedRole) {
          params.append('role', selectedRole);
        }
        if (selectedStatus) {
          params.append('status', selectedStatus);
        }
       
        const res = await axiosSecure.get(`/api/v1/user/all?${params.toString()}`);
        if (res.data.success) {
          // Filter out super-admin data for non-super-admin users
          let filteredData = res.data.data.users;
          if (user?.role !== 'super-admin') {
            filteredData = filteredData.filter(user => user.role !== 'super-admin');
          }
          setFilteredUsers(filteredData);
          setTotalPages(Math.ceil(filteredData.length / limit));
          setTotalItems(filteredData.length);
        }
      } catch (err) {
        
        addToast(err.response.data.message, {
          appearance: "error",
          autoDismiss: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [page, keyword, selectedRole, selectedStatus, axiosSecure, user?.role]);
  useEffect(() => {
    if (users?.data?.users) {
      setUser(users.data.users);
    }
  }, [users]);

  useEffect(() => {
    if (allusers && user?.referralCode) {
      const result = allusers.filter((u) => u.referredBy === user.referralCode);
      setFilteredUsers(result);
    }
  }, [allusers, user?.referralCode]);

  const generateReferralCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomPart = "";
    for (let i = 0; i < 8; i++) {
      randomPart += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return `${randomPart}`;
  };

  const onSubmit = async (data) => {
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...userInfo } = data;
    
    // Currently logged-in user's details
    
    const referrerCode = user?.referralCode || null;

    // Generate referral code for the new user
    const referralCode = generateReferralCode(
      userInfo.fullName
    );
    
    const finalUserInfo = {
      ...userInfo,
      referralCode,
      referredBy: referrerCode,
      superAdminId: user?._id,
    };
   
    
    const result = await addUser(finalUserInfo);
    
    if (result?.data?.success) {
      addToast("User created successfully", {
        appearance: "success",
        autoDismiss: true,
      });
      setIsModalOpen(false);
      reset();
    }

    if (result?.error) {
      addToast(result?.error?.data?.message, {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: keyword,
      });
      
      // Add role and status to params if they're not empty
      if (selectedRole) {
        params.append('role', selectedRole);
      }
      if (selectedStatus) {
        params.append('status', selectedStatus);
      }

      const res = await axiosSecure.get(`/api/v1/user/all?${params.toString()}`);
      
      if (res.data.success) {
        setFilteredUsers(res.data.data.users);
        setTotalPages(Math.ceil(res.data.data.totalItems / limit));
        setTotalItems(res.data.data.totalItems);
      }
    } catch (err) {
      addToast(err.response.data.message, {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      handleSearch();
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [page, keyword, selectedRole, selectedStatus]);

  const handleStatusUpdate = async (username, newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await axiosSecure.patch(`/api/v1/user/update/${username}`, {
        status: newStatus
      });


      if (response.data.success) {
        addToast(`User ${newStatus === "active" ? "activated" : "deactivated"} successfully`, {
          appearance: "success",
          autoDismiss: true,
        });
        // Refresh the users list
        handleSearch();
        setSelectedUser(null); // Close dropdown after successful update
      }
    } catch (error) {
      
      addToast("Failed to update user status", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally { 
      setUpdatingStatus(false);
    }
  };

  const handleUpdateLimits = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosSecure.patch(`/api/v1/user/update/${editingUser.username}`, {
        commissionPercentage: parseFloat(editingUser.commissionPercentage),
        exposureLimit: parseFloat(editingUser.exposureLimit)
      });

      if (response.data.success) {
        addToast("User limits updated successfully", {
          appearance: "success",
          autoDismiss: true,
        });
        handleSearch();
        setEditingUser(null);
      }
    } catch (error) {
      
      addToast("Failed to update user limits", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleUpdateSingleProperty = async (e) => {
    e.preventDefault();
    try {
      const updateData = {};
      if (editingProperty.type === 'commission') {
        updateData.commissionPercentage = parseFloat(editingProperty.value);
      } else if (editingProperty.type === 'exposure') {
        updateData.exposureLimit = parseFloat(editingProperty.value);
      }

      const response = await axiosSecure.patch(`/api/v1/user/update/${editingProperty.username}`, updateData);

      if (response.data.success) {
        addToast(`${editingProperty.type === 'commission' ? 'Commission Percentage' : 'Exposure Limit'} updated successfully`, {
          appearance: "success",
          autoDismiss: true,
        });
        handleSearch();
        setEditingProperty(null);
      }
    } catch (error) {
      
      addToast("Failed to update user property", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
    setPage(1); // Reset to first page when changing role
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setPage(1); // Reset to first page when changing status
  };

  // Update the role options in the select dropdown
  const getRoleOptions = () => {
    const baseRoles = [
      { value: "admin", label: "Admin" },
      { value: "sub-admin", label: "Sub Admin" },
      { value: "super-agent", label: "Super Agent" },
      { value: "master-agent", label: "Master Agent" },
      { value: "agent", label: "Agent" },
      { value: "sub-agent", label: "Sub Agent" },
      { value: "user", label: "User" }
    ];

    // Only show super-admin option for super-admin users
    if (user?.role === 'super-admin') {
      baseRoles.unshift({ value: "super-admin", label: "Super Admin" });
    }

    return baseRoles;
  };

  // Add delete user function
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await axiosSecure.delete(`/api/v1/user/delete/${userToDelete.username}`);
      
      if (response.data.success) {
        addToast("User deleted successfully", {
          appearance: "success",
          autoDismiss: true,
        });
        handleSearch(); // Refresh the user list
        setDeleteModalOpen(false);
        setUserToDelete(null);
      }
    } catch (error) {
      addToast(error.response?.data?.message || "Failed to delete user", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50"> 
      {/* Stats Cards Section */}
      <div className="p-4 md:p-6">
        {/* Mobile Stats Toggle */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
            className="w-full flex items-center justify-between px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <span className="text-[#1f2937] font-medium">Balance Overview</span>
            <svg
              className={`w-5 h-5 text-[#1f2937] transform transition-transform duration-200 ${
                isStatsExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Stats Cards Grid - Hidden on mobile unless expanded */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6 ${
          isStatsExpanded ? 'block' : 'hidden md:grid'
        }`}>
          {statData && [
            {
              label: "Total System Balance",
              value: formatCurrency(statData.totalSystemBalance),
              icon: "💵",
            },
            {
              label: "Total Admin Balance",
              value: formatCurrency(statData.totalAdminBalance),
              icon: "👤",
            },
            {
              label: "Remaining Balance",
              value: formatCurrency(statData.remainingBalance),
              icon: "💰",
            },
            {
              label: "Total Agent Balance",
              value: formatCurrency(statData.totalAgentBalance),
              icon: "👥",
            },
            {
              label: "Total Downline User Balance",
              value: formatCurrency(statData.totalDownlineUserBalance),
              icon: "📊",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-4 md:p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#1f2937]">{item.label}</p>
                  <h3 className="text-xl font-bold text-[#1f2937]">{item.value}</h3>
                </div>
                <span className="text-2xl">{item.icon}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Section */}
      <div className="p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-[#1f2937]">User Management</h2>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-medium text-[#1f2937]">Total Users:</span>
                <span className="text-sm font-bold text-[#1f2937]">{totalItems}</span>
              </div>
            </div>

            {/* Mobile Controls Toggle */}
            <div className="md:hidden w-full">
              <button
                onClick={() => setIsUserControlsExpanded(!isUserControlsExpanded)}
                className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="text-[#1f2937] font-medium">User Controls</span>
                <svg
                  className={`w-5 h-5 text-[#1f2937] transform transition-transform duration-200 ${
                    isUserControlsExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* User Controls - Hidden on mobile unless expanded */}
            <div className={`w-full ${isUserControlsExpanded ? 'block' : 'hidden md:flex'}`}>
              <div className="flex flex-col md:flex-row gap-3 w-full">
                {/* Role Filter */}
                <div className="flex-1 min-w-[140px]">
                  <select
                    value={selectedRole}
                    onChange={handleRoleChange}
                    className="w-full h-11 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                  >
                    <option value="">All Roles</option>
                    {getRoleOptions().map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex-1 min-w-[140px]">
                  <select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    className="w-full h-11 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Search Bar */}
                <div className="flex-1 min-w-[180px] relative">
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search users..."
                    className="w-full h-11 px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1f2937]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Add User Button */}
                <div className="flex-1 min-w-[120px] flex md:block">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full h-11 flex items-center justify-center gap-2 px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-900 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add User</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Phone</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">
                    User Name
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Full Name</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Email</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Balance</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Commission %</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Exposure Limit</th>
                  
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Last Login</th>
                  
                    <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Role</th>
                  
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Referral Code</th>
                  <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Referred By</th>
                  <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-[#1f2937]">Status</th>
                  <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-[#1f2937]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-[#1f2937] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[#1f2937]">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-[#1f2937]">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium text-white
                            ${row?.role === "admin" ? "bg-purple-600" :
                              row?.role === "sub-admin" ? "bg-blue-600" :
                              row?.role === "agent" ? "bg-green-600" :
                              row?.role === "sub-agent" ? "bg-yellow-600" :
                              "bg-gray-600"}`}>
                            {row?.role?.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-[#1f2937]">{row.phone}</span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm text-[#1f2937]">{row.username}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm text-[#1f2937] capitalize">{row?.fullName || "" }</span>
                      </td>
                      
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm text-[#1f2937]">{row.email}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm font-medium text-[#1f2937]">{formatCurrency(row?.balance)}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setSelectedCommission(selectedCommission === row._id ? null : row._id)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              selectedCommission === row._id ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {row?.commissionPercentage || 0}%
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </button>

                          {selectedCommission === row._id && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1">
                                <div className="px-4 py-2 text-sm font-medium text-[#1f2937] border-b border-gray-100">
                                  Current: <span className="font-semibold">{row?.commissionPercentage || 0}%</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedCommission(null);
                                    setEditingProperty({
                                      type: 'commission',
                                      username: row.username,
                                      value: row.commissionPercentage || 0
                                    });
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-[#1f2937] hover:bg-gray-50 transition-colors duration-200"
                                >
                                  Edit Commission
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setSelectedExposure(selectedExposure === row._id ? null : row._id)}
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                              selectedExposure === row._id ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {formatCurrency(row?.exposureLimit)}
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </span>
                          </button>

                          {selectedExposure === row._id && (
                            <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1">
                                <div className="px-4 py-2 text-sm font-medium text-[#1f2937] border-b border-gray-100">
                                  Current: <span className="font-semibold">${row?.exposureLimit || 0}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedExposure(null);
                                    setEditingProperty({
                                      type: 'exposure',
                                      username: row.username,
                                      value: row.exposureLimit || 0
                                    });
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-[#1f2937] hover:bg-gray-50 transition-colors duration-200"
                                >
                                  Edit Exposure Limit
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="text-sm text-[#1f2937]">
                          {row?.lastLoginAt ? moment(row?.lastLoginAt).fromNow() : "Never"}
                        </span>
                      </td>
                      
                         <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                              ${row?.role === "admin" ? "bg-purple-100 text-purple-800" :
                                row?.role === "sub-admin" ? "bg-blue-100 text-blue-800" :
                                row?.role === "super-agent" ? "bg-indigo-100 text-indigo-800" :
                                row?.role === "master-agent" ? "bg-pink-100 text-pink-800" :
                                row?.role === "agent" ? "bg-green-100 text-green-800" :
                                row?.role === "sub-agent" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"}`}>
                              {row?.role?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </span>
                            {row?.role === "admin" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Admin
                              </span>
                            )}
                          </div>
                        </td>
                      
                        
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="text-sm text-[#1f2937]">{row?.referralCode || "-"}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <span className="text-sm text-[#1f2937]">{row?.referredBy }</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-center">
                          <div className="relative">
                            <button
                              onClick={() => setSelectedUser(selectedUser === row._id ? null : row._id)}
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200
                                ${row.status === "active" 
                                  ? "bg-green-100 text-green-800 hover:bg-green-200" 
                                  : "bg-red-100 text-red-800 hover:bg-red-200"}`}
                            >
                              <span className="flex items-center gap-2">
                                <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
                                  <circle cx="4" cy="4" r="3" />
                                </svg>
                                {row.status === "active" ? "Active" : "Inactive"}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </span>
                            </button>

                            {selectedUser === row._id && (
                              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 overflow-hidden">
                                <div className="py-1" role="menu" aria-orientation="vertical">
                                  <div className="px-4 py-2 text-sm font-medium text-[#1f2937] border-b border-gray-100">
                                    Current Status: <span className={`font-semibold ${row.status === "active" ? "text-green-600" : "text-red-600"}`}>
                                      {row.status === "active" ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleStatusUpdate(row.username, row.status === "active" ? "inactive" : "active")}
                                    disabled={updatingStatus}
                                    className="w-full text-left px-4 py-3 text-sm text-[#1f2937] hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                                    role="menuitem"
                                  >
                                    <svg 
                                      className={`w-4 h-4 ${row.status === "active" ? "text-red-500" : "text-green-500"}`}
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      {row.status === "active" ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                      ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      )}
                                    </svg>
                                    {row.status === "active" ? "Deactivate User" : "Activate User"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(null);
                                      setEditingProperty({
                                        type: 'commission',
                                        username: row.username,
                                        value: row.commissionPercentage || 0
                                      });
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-[#1f2937] hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                                    role="menuitem"
                                  >
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Edit Commission
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedUser(null);
                                      setEditingProperty({
                                        type: 'exposure',
                                        username: row.username,
                                        value: row.exposureLimit || 0
                                      });
                                    }}
                                    className="w-full text-left px-4 py-3 text-sm text-[#1f2937] hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                                    role="menuitem"
                                  >
                                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Edit Exposure Limit
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              to={`/admindashboard/userprofile/${row?._id}`}
                              className="inline-flex items-center justify-center w-8 h-8 text-[#1f2937] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            >
                              <FaHouseUser className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => {
                                setUserToDelete(row);
                                setDeleteModalOpen(true);
                              }}
                              className="inline-flex items-center justify-center w-8 h-8 text-[#1f2937] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-[#1f2937]">
              Showing page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1 || totalPages === 0}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#1f2937] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages || totalPages === 0}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-[#1f2937] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Keep existing modal code but update styling */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold text-[#1f2937]">Create New User</h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                }}
                className="text-[#1f2937] hover:text-gray-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form fields with updated styling */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">User Name</label>
                <input
                  type="text"
                  {...register("username")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">Phone Number</label>
                <input
                  type="number"
                  {...register("phone")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">Role</label>
                <select
                  {...register("role", { required: "Role is required" })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                >
                  <option value="">Select a role</option>
                  {user.role === "admin" || user.role === "super-admin" && <option value="admin">Admin</option>}
                  <option value="sub-admin">Sub Admin</option>
                  <option value="super-agent">Super Agent</option>
                  <option value="master-agent">Master Agent</option>
                  <option value="agent">Agent</option>
                  <option value="sub-agent">Sub Agent</option>
                  <option value="user">User</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">Password*</label>
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">Confirm Password*</label>
                <input
                  type="password"
                  {...register("confirmPassword", {
                    required: "Confirm Password is required",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Limits Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleUpdateLimits}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold text-[#1f2937]">Edit User Limits</h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-[#1f2937] hover:text-gray-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">Commission Percentage (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={editingUser.commissionPercentage || 0}
                  onChange={(e) => setEditingUser({...editingUser, commissionPercentage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">Exposure Limit ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingUser.exposureLimit || 0}
                  onChange={(e) => setEditingUser({...editingUser, exposureLimit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Update Limits
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Single Property Edit Modal */}
      {editingProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleUpdateSingleProperty}
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold text-[#1f2937]">
                Edit {editingProperty.type === 'commission' ? 'Commission Percentage' : 'Exposure Limit'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="text-[#1f2937] hover:text-gray-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1f2937] mb-1">
                  {editingProperty.type === 'commission' ? 'Commission Percentage (%)' : 'Exposure Limit ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={editingProperty.type === 'commission' ? "100" : undefined}
                  value={editingProperty.value}
                  onChange={(e) => setEditingProperty({...editingProperty, value: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Update {editingProperty.type === 'commission' ? 'Commission' : 'Exposure Limit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Delete Confirmation Modal */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold text-[#1f2937]">Delete User</h3>
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="text-[#1f2937] hover:text-gray-500 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="py-4">
              <p className="text-[#1f2937] mb-4">
                Are you sure you want to delete user <span className="font-semibold">{userToDelete.username}</span>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-2 text-sm text-red-600 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Warning: This will permanently delete the user and all associated data.</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-[#1f2937] hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
