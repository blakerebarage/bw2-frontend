import {
  useAddUserMutation,
  useGetUsersQuery,
} from "@/redux/features/allApis/usersApi/usersApi";
import debounce from 'lodash.debounce';
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
// import ProviderStatsDashboard from "../GameAPIComponet/ProviderStatsDashboard";
import useAxiosSecure from "@/Hook/useAxiosSecure";
import { useCurrency } from "@/Hook/useCurrency";
import moment from 'moment';
import { FaHouseUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import TransactionSummaryCards from '../TransactionSummaryCards/TransactionSummaryCards';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const axiosSecure = useAxiosSecure();
  const { data: users } = useGetUsersQuery();
  const [addUser, { isLoading }] = useAddUserMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
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
  // const [selectedCommission, setSelectedCommission] = useState(null);
  // const [selectedExposure, setSelectedExposure] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState(null);
 
  // Stat data state
  const [statData, setStatData] = useState(null);

  const { formatCurrency } = useCurrency();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isUserControlsExpanded, setIsUserControlsExpanded] = useState(false);
  const [hasSearchError, setHasSearchError] = useState(false);

  // Create a debounced search function
  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setKeyword(searchValue);
    }, 500),
    []
  );

  // Update the search input handler
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  useEffect(() => {
    // Reset error state on mount
    setHasSearchError(false);
    
    // Fetch stat data on mount - only for super-admin
    const fetchStatData = async () => {
      if (user?.role !== 'super-admin') {
        return; // Don't fetch stat data for non-super-admin users
      }
      
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
    
    // Only fetch if user is properly loaded
    if (user?.role && user?._id) {
      fetchStatData();
    }
  }, [axiosSecure, addToast, user?.role, user?._id]);

  useEffect(() => {
    const fetchInitialData = async () => {
      // Don't fetch if user is not properly loaded
      if (!user?.role || !user?._id) {
        return;
      }

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
        
        // Add referredBy filter for non-super-admin users
        if (user?.role !== 'super-admin' && user?.referralCode) {
          params.append('referredBy', user.referralCode);
        }
         
        const res = await axiosSecure.get(`/api/v1/user/all?${params.toString()}`);
        if (res.data.success) {
          // Filter out super-admin data for non-super-admin users
          let filteredData = res.data.data.users || [];
          if (user?.role !== 'super-admin') {
            filteredData = filteredData.filter(userd => 
              userd.referredBy === user.referralCode
            );
          }
          setFilteredUsers(filteredData);
          setTotalPages(Math.ceil(filteredData.length / limit));
          setTotalItems(filteredData.length);
          setHasSearchError(false);
        } else {
          // Handle API success but no data case
          setFilteredUsers([]);
          setTotalPages(0);
          setTotalItems(0);
          setHasSearchError(false);
        }
      } catch (err) {
        // Only show toast for actual errors, not for no data found
        if (err.response?.status !== 404) {
          setHasSearchError(true);
         
        } else {
          // Handle 404 - no users found case
          setFilteredUsers([]);
          setTotalPages(0);
          setTotalItems(0);
          setHasSearchError(false);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [page, keyword, selectedRole, selectedStatus, axiosSecure, user?.role, user?._id, user?.referralCode]);
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
    
    // Validate role permissions
    const allowedUserCreationRoles = {
      "super-admin": [
        "super-admin",
        "admin",
        "sub-admin",
        "agent",
        "user",
      ],
      "admin": ["sub-admin", "agent"],
      "sub-admin": ["agent"],
      "agent": ["user","agent"],
    };

    const allowedRoles = allowedUserCreationRoles[user?.role] || [];
    
    if (!allowedRoles.includes(userInfo.role)) {
      addToast(`You don't have permission to create users with the role: ${userInfo.role}`, {
        appearance: "error",
        autoDismiss: true,
      });
      return;
    }
    
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
      requesterUserId: user?._id, // Add requester user ID for tracking
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
    // Don't search if user is not properly loaded
    if (!user?.role || !user?._id) {
      return;
    }

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

      // Add referredBy filter for non-super-admin users
      if (user?.role !== 'super-admin' && user?.referralCode) {
        params.append('referredBy', user.referralCode);
      }

      const res = await axiosSecure.get(`/api/v1/user/all?${params.toString()}`);
      
      if (res.data.success) {
        const users = res.data.data.users || [];
        setFilteredUsers(users);
        setTotalPages(Math.ceil((res.data.data.totalItems || users.length) / limit));
        setTotalItems(res.data.data.totalItems || users.length);
        setHasSearchError(false);
      } else {
        // Handle API success but no data case
        setFilteredUsers([]);
        setTotalPages(0);
        setTotalItems(0);
        setHasSearchError(false);
      }
    } catch (err) {
      // Only show toast for actual errors, not for no data found
      if (err.response?.status !== 404) {
        setHasSearchError(true);
        
      } else {
        // Handle 404 - no users found case
        setFilteredUsers([]);
        setTotalPages(0);
        setTotalItems(0);
        setHasSearchError(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Only set timeout if user is properly loaded
    if (!user?.role || !user?._id) {
      return;
    }

    const timeout = setTimeout(() => {
      handleSearch();
    }, 500);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [page, keyword, selectedRole, selectedStatus, user?.role, user?._id, user?.referralCode]);

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
      } else if (editingProperty.type === 'deviceCount') {
        updateData.allowedDeviceCount = parseInt(editingProperty.value);
      }

      const response = await axiosSecure.patch(`/api/v1/user/update/${editingProperty.username}`, updateData);

      if (response.data.success) {
        addToast(`${editingProperty.type === 'commission' ? 'Commission Percentage' : 
                     editingProperty.type === 'exposure' ? 'Exposure Limit' : 'Allowed Device Count'} updated successfully`, {
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
    // Define allowed user creation roles hierarchy
    const allowedUserCreationRoles = {
      "super-admin": [
        "admin",
        "sub-admin",
        "agent",
        
        "user",
      ],
      "admin": ["sub-admin","agent","user"],
      "sub-admin": ["agent","user"],
      "agent": ["user","agent"],
      "user": [],
    };

    // Get allowed roles for current user
    const allowedRoles = allowedUserCreationRoles[user?.role] || [];

    // Role mapping for display
    const roleDisplayMap = {
      "super-admin": "Super Admin",
      "admin": "Admin",
      "sub-admin": "Sub Admin",
      "agent": "Agent",
      "user": "User"
    };

    // Return only the roles that the current user can create
    return allowedRoles.map(role => ({
      value: role,
      label: roleDisplayMap[role] || role
    }));
  };

  // Update the role options for filtering - show all roles for visibility but limit creation
  const getFilterRoleOptions = () => {
    const baseRoles = [
      
    ];

    // Only show super-admin option for super-admin users
    if (user?.role === 'super-admin') {
      baseRoles.unshift({ value: "super-admin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "sub-admin", label: "Sub Admin" },
        { value: "agent", label: "Agent" },
        { value: "user", label: "User" }
      );

    }
    if (user?.role === 'admin') {
      baseRoles.unshift({ value: "admin", label: "Admin" },
        { value: "sub-admin", label: "Sub Admin" },
        { value: "agent", label: "Agent" },
        { value: "user", label: "User" }
      );
    }
    if (user?.role === 'sub-admin') {
      baseRoles.unshift({ value: "sub-admin", label: "Sub Admin" },
        { value: "agent", label: "Agent" },
        { value: "user", label: "User" }
      );
    }
    if (user?.role === 'agent') { 
      baseRoles.unshift({ value: "agent", label: "Agent" },
        { value: "user", label: "User" }
      );
    }
    if (user?.role === 'user') {
      baseRoles.unshift({ value: "user", label: "User" }
      );
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

  // Add TableSkeleton component for loading state
  function TableSkeleton({ rows = 8 }) {
    const colCount = user?.role === 'super-admin' ? 7 : 6; // Extra column for device count
    return (
      <>
        {[...Array(rows)].map((_, idx) => (
          <tr key={idx}>
            {[...Array(colCount)].map((_, colIdx) => (
              <td key={colIdx} className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              </td>
            ))}
          </tr>
        ))}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50"> 
      {/* Show loading spinner if user is not loaded yet */}
      {!user?.role || !user?._id ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937]"></div>
            <p className="text-[#1f2937] font-medium">Loading user data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards Section - Only for super-admin */}
          {user?.role === 'super-admin' && (
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
          )}

          {/* Transaction Summary Cards Section */}
          <div className="p-4 md:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">Transaction Summary (Last 30 Days)</h3>
              <p className="text-sm text-gray-600">Overview of your deposits, withdrawals, and net balance</p>
            </div>
            <TransactionSummaryCards />
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
                        {getFilterRoleOptions().map(role => (
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
                        <option value="active">Active</option>
                        <option value="">All Status</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    {/* Search Bar */}
                    <div className="flex-1 min-w-[180px] relative">
                      <input
                        type="text"
                        onChange={handleSearchInputChange}
                        placeholder="Search users..."
                        className="w-full h-11 px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                      />
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#1f2937]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0118 0z" />
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
                     
                      <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Email</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Balance</th>
                      <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Role</th>
                      {/* Only show Device Count column for super-admin */}
                      {user?.role === 'super-admin' && (
                        <th scope="col" className="px-4 py-3.5 text-left text-sm font-semibold text-[#1f2937]">Device Count</th>
                      )}
                      <th scope="col" className="px-4 py-3.5 text-center text-sm font-semibold text-[#1f2937]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                      <TableSkeleton rows={8} />
                    ) : hasSearchError ? (
                      <tr>
                        <td colSpan={user?.role === 'super-admin' ? "7" : "6"} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-medium text-[#1f2937] mb-1">Unable to load users</h3>
                              <p className="text-sm text-gray-500 mb-3">
                                There was an error loading the user data. Please try again.
                              </p>
                              <button
                                onClick={() => {
                                  setHasSearchError(false);
                                  handleSearch();
                                }}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2V19M20 4v5h-.581" />
                                </svg>
                                Try Again
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={user?.role === 'super-admin' ? "7" : "6"} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-medium text-[#1f2937] mb-1">No users found</h3>
                              <p className="text-sm text-gray-500">
                                {keyword || selectedRole || selectedStatus !== "active" 
                                  ? "Try adjusting your search filters to find what you're looking for" 
                                  : "No users have been created yet"}
                              </p>
                              {(keyword || selectedRole || selectedStatus !== "active") && (
                                <button
                                  onClick={() => {
                                    setKeyword("");
                                    setSelectedRole("");
                                    setSelectedStatus("active");
                                    // Clear the search input
                                    const searchInput = document.querySelector('input[placeholder="Search users..."]');
                                    if (searchInput) searchInput.value = "";
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
                      filteredUsers.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium text-white
                                ${row?.role === "super-admin" ? "bg-red-600" :
                                  row?.role === "admin" ? "bg-purple-600" :
                                  row?.role === "sub-admin" ? "bg-blue-600" :
                                  row?.role === "super-agent" ? "bg-indigo-600" :
                                  row?.role === "master-agent" ? "bg-pink-600" :
                                  row?.role === "agent" ? "bg-green-600" :
                                  "bg-gray-600"}`}>
                                {row?.role === "super-admin" ? "SA" :
                                 row?.role === "sub-admin" ? "SUB" :
                                 row?.role === "super-agent" ? "SPR" :
                                 row?.role === "master-agent" ? "MST" :
                                 row?.role?.slice(0, 2).toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-[#1f2937]">
                                <Link to={`/profile/${row._id}`}>{row.phone}</Link>
                              </span>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-4 py-4">
                            <span className="text-sm text-[#1f2937]">
                              <Link to={`/profile/${row._id}`}>{row.username}</Link>
                            </span>
                          </td>
                          
                          
                          <td className="whitespace-nowrap px-4 py-4">
                            <span className="text-sm text-[#1f2937]">{row.email}</span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <span className="text-sm font-medium text-[#1f2937]">{formatCurrency(row?.balance)}</span>
                          </td>
                          
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                                ${row?.role === "super-admin" ? "bg-red-100 text-red-800" :
                                  row?.role === "admin" ? "bg-purple-100 text-purple-800" :
                                  row?.role === "sub-admin" ? "bg-blue-100 text-blue-800" :
                                  row?.role === "super-agent" ? "bg-indigo-100 text-indigo-800" :
                                  row?.role === "master-agent" ? "bg-pink-100 text-pink-800" :
                                  row?.role === "agent" ? "bg-green-100 text-green-800" :
                                  "bg-gray-100 text-gray-800"}`}>
                                {row?.role === "super-admin" ? "Super Admin" :
                                 row?.role === "sub-admin" ? "Sub Admin" :
                                 row?.role === "super-agent" ? "Super Agent" :
                                 row?.role === "master-agent" ? "Master Agent" :
                                 row?.role?.charAt(0).toUpperCase() + row?.role?.slice(1)}
                              </span>
                              {(row?.role === "super-admin" || row?.role === "admin") && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  {row?.role === "super-admin" ? "System" : "High Level"}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Only show Device Count column for super-admin */}
                          {user?.role === 'super-admin' && (
                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                                  </svg>
                                  {row?.allowedDeviceCount || 1}
                                </span>
                              </div>
                            </td>
                          )}
                          
                          <td className="whitespace-nowrap px-4 py-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedUserForAction(row);
                                setActionModalOpen(true);
                              }}
                              className="inline-flex items-center justify-center w-8 h-8 text-[#1f2937] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
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

                {/* Role Information Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Role Creation Permissions</p>
                      <p className="text-xs text-blue-600 mt-1">
                        As a <span className="font-semibold">{user?.role?.replace('-', ' ')}</span>, you can create: {getRoleOptions().map(role => role.label).join(', ')}
                      </p>
                    </div>
                  </div>
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
                      type="text"
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
                      {getRoleOptions().map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
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
                    Edit {editingProperty.type === 'commission' ? 'Commission Percentage' : 
                         editingProperty.type === 'exposure' ? 'Exposure Limit' : 'Allowed Device Count'}
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
                      {editingProperty.type === 'commission' ? 'Commission Percentage (%)' : 
                       editingProperty.type === 'exposure' ? 'Exposure Limit ($)' : 'Allowed Device Count'}
                    </label>
                    <input
                      type="number"
                      step={editingProperty.type === 'deviceCount' ? "1" : "0.01"}
                      min={editingProperty.type === 'deviceCount' ? "1" : "0"}
                      max={editingProperty.type === 'commission' ? "100" : editingProperty.type === 'deviceCount' ? "10" : undefined}
                      value={editingProperty.value}
                      onChange={(e) => setEditingProperty({...editingProperty, value: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                    />
                    {editingProperty.type === 'deviceCount' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Number of devices this user can log in from simultaneously (1-10)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Update {editingProperty.type === 'commission' ? 'Commission' : 
                           editingProperty.type === 'exposure' ? 'Exposure Limit' : 'Device Count'}
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

          {/* User Action Modal */}
          {actionModalOpen && selectedUserForAction && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
              <div className="bg-white rounded-xl shadow-2xl w-[450px] max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-[#1f2937]">User Actions</h1>
                    <button
                      onClick={() => {
                        setActionModalOpen(false);
                        setSelectedUserForAction(null);
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
                  {/* User Info Section */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-[#1f2937] mb-3">User Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={`font-medium ${selectedUserForAction.status === "active" ? "text-green-600" : "text-red-600"}`}>
                          {selectedUserForAction.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                     
                      <div className="flex justify-between">
                        <span className="text-gray-600">Referral Code:</span>
                        <span className="font-medium text-[#1f2937]">{selectedUserForAction.referralCode || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Commission:</span>
                        <span className="font-medium text-[#1f2937]">{selectedUserForAction.commissionPercentage || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exposure Limit:</span>
                        <span className="font-medium text-[#1f2937]">{formatCurrency(selectedUserForAction.exposureLimit)}</span>
                      </div>
                      {/* Only show Device Count for super-admin */}
                      {user?.role === 'super-admin' && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Allowed Device Count:</span>
                          <span className="font-medium text-[#1f2937]">{selectedUserForAction.allowedDeviceCount || 1}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Login:</span>
                        <span className="font-medium text-[#1f2937]">{selectedUserForAction.lastLoginAt ? moment(selectedUserForAction.lastLoginAt).fromNow() : "Never"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Referred By:</span>
                        <span className="font-medium text-[#1f2937]">{selectedUserForAction.referredBy || "-"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedUserForAction.username, selectedUserForAction.status === "active" ? "inactive" : "active");
                        setActionModalOpen(false);
                        setSelectedUserForAction(null);
                      }}
                      disabled={updatingStatus}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <svg 
                        className={`w-5 h-5 ${selectedUserForAction.status === "active" ? "text-red-500" : "text-green-500"}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        {selectedUserForAction.status === "active" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      <span>{selectedUserForAction.status === "active" ? "Deactivate User" : "Activate User"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setActionModalOpen(false);
                        setSelectedUserForAction(null);
                        setEditingProperty({
                          type: 'commission',
                          username: selectedUserForAction.username,
                          value: selectedUserForAction.commissionPercentage || 0
                        });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Edit Commission</span>
                    </button>

                    <button
                      onClick={() => {
                        setActionModalOpen(false);
                        setSelectedUserForAction(null);
                        setEditingProperty({
                          type: 'exposure',
                          username: selectedUserForAction.username,
                          value: selectedUserForAction.exposureLimit || 0
                        });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Edit Exposure Limit</span>
                    </button>

                    {/* Only show Device Count edit for super-admin */}
                    {user?.role === 'super-admin' && (
                      <button
                        onClick={() => {
                          setActionModalOpen(false);
                          setSelectedUserForAction(null);
                          setEditingProperty({
                            type: 'deviceCount',
                            username: selectedUserForAction.username,
                            value: selectedUserForAction.allowedDeviceCount || 1
                          });
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Edit Device Count</span>
                      </button>
                    )}

                    <Link
                      to={`/admindashboard/userprofile/${selectedUserForAction._id}`}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => {
                        setActionModalOpen(false);
                        setSelectedUserForAction(null);
                      }}
                    >
                      <FaHouseUser className="w-5 h-5 text-green-500" />
                      <span>View Profile</span>
                    </Link>

                    <button
                      onClick={() => {
                        setActionModalOpen(false);
                        setSelectedUserForAction(null);
                        setUserToDelete(selectedUserForAction);
                        setDeleteModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete User</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
