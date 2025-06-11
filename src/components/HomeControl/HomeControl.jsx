import useAxiosSecure from "@/Hook/useAxiosSecure";
import useMedia from "@/Hook/useMedia";
import { useEffect, useState } from "react";
import { FaUpload } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";
import Swal from "sweetalert2";

const HomeControl = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useSelector((state) => state.auth);
  const [refresh, setRefresh] = useState(false);
  const [notices, setNotices] = useState([]);
  const [refCodes, setRefCodes] = useState([]);
  const [bannerImages, setBannerImages] = useState([]);
  const { addToast } = useToasts();

  const [logoLoading, setLogoLoading] = useState(false);
  const { refreshMedia,logo} = useMedia()
  // Fetch notices on load
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await axiosSecure.get("/api/v1/content/all-notice");
        setNotices(res.data.data);
      } catch (err) {
       
        addToast("Failed to fetch notices", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    };

    fetchNotices();
  }, [axiosSecure]);

  // Fetch logo on load
  useEffect(() => {
    refreshMedia()
  }, [axiosSecure]);

  // Upload new notice
  const handleUpload = async (e) => {
    e.preventDefault();

    const title = e.target.title.value;
    const description = e.target.description.value;
    
    const noticeData = {
      title,
      description
    };

    try {
      await axiosSecure.post("/api/v1/content/create-notice", noticeData);
      addToast("Notice created successfully!", {
        appearance: "success",
        autoDismiss: true,
      });
      e.target.reset();

      // Refresh notices list
      const res = await axiosSecure.get("/api/v1/content/all-notice");
      setNotices(res.data.data);
    } catch (err) {
     
      addToast("Failed to create notice", {
        appearance: "error",
        autoDismiss: true,
      });
    }
  };

  // Delete notice
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axiosSecure.delete(`/api/v1/content/delete-notice/${id}`);
        setNotices(notices.filter((notice) => notice._id !== id));
        addToast("Notice deleted successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
      } catch (err) {
        
        addToast("Failed to delete notice", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  };

  // Update notice
  const handleUpdate = async (id, currentNotice) => {
    const { value: formValues } = await Swal.fire({
      title: '<strong>Update Notice</strong>',
      html: `
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="swal-title">
            Title
          </label>
          <input 
            id="swal-title" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            type="text" 
            value="${currentNotice.title}"
            placeholder="Enter notice title"
          >
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="swal-description">
            Description
          </label>
          <textarea 
            id="swal-description" 
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            rows="4"
            placeholder="Enter notice description"
          >${currentNotice.description}</textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Notice',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      focusConfirm: false,
      customClass: {
        popup: 'swal-wide',
        title: 'text-2xl font-bold text-gray-800',
        confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded',
        cancelButton: 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded'
      },
      preConfirm: () => {
        const title = document.getElementById('swal-title').value;
        const description = document.getElementById('swal-description').value;
        if (!title) {
          Swal.showValidationMessage('Please enter a title');
          return false;
        }
        if (!description) {
          Swal.showValidationMessage('Please enter a description');
          return false;
        }
        return { title, description };
      }
    });

    if (formValues) {
      try {
        await axiosSecure.patch(`/api/v1/content/update-notice/${id}`, {
          title: formValues.title,
          description: formValues.description
        });
        const updated = notices.map((notice) =>
          notice._id === id ? { ...notice, title: formValues.title, description: formValues.description } : notice
        );
        setNotices(updated);
        addToast("Notice updated successfully!", {
          appearance: "success",
          autoDismiss: true,
        });
      } catch (err) {
        
        addToast("Failed to update notice", {
          appearance: "error",
          autoDismiss: true,
        });
      }
    }
  };

  // set refer code and get
  const hundleRefCode = async (e) => {
    e.preventDefault();

    const latestNotice = e.target.refCode.value;
    const data = {
      refCode: latestNotice,
    };
    try {
      await axiosSecure.post("/refCode", data);
      addToast("add successful", {
        appearance: "success",
        autoDismiss: true,
      });
      e.target.reset();

      const res = await axiosSecure.get("/refCode");
      setRefCodes(res.data);
    } catch (err) {
      
    }
  };

  useEffect(() => {
    axiosSecure.get("/refCode").then((res) => setRefCodes(res.data));
  }, []);

  // get the banner from db
  useEffect(() => {
    axiosSecure.get("/api/v1/content/all-banner").then((res) => setBannerImages(res?.data?.data));
  }, [refresh]);

  // Banner Upload
  const handleBannerUpload = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const imageFile = e.target.image.files[0];
    const title = e.target.title?.value || "Banner";
    
    if (!imageFile) {
      Swal.fire({
        icon: "error",
        title: "No file selected!",
        text: "Please select an image file to upload.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    formData.append('image', imageFile);
    formData.append('title', title);

    // Log FormData contents
    for (let pair of formData.entries()) {
      
    }

    try {
      const response = await axiosSecure.post("/api/v1/content/create-banner", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        }
      });

      

      if (response.data.success) {
        setRefresh((prev) => !prev);
        Swal.fire({
          icon: "success",
          title: "Banner added!",
          text: "Your banner was uploaded successfully.",
          confirmButtonColor: "#3085d6",
        });
        e.target.reset();
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (err) {
      
      
      
      let errorMessage = "Something went wrong. Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Swal.fire({
        icon: "error",
        title: "Upload failed!",
        text: errorMessage,
        confirmButtonColor: "#d33",
      });
    }
  };
  // Banner Delete
  const handleBannerDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/api/v1/content/delete-banner/${id}`);
        
        if (res.data.success) {
          const remaining = bannerImages.filter((img) => img._id !== id);
          setBannerImages(remaining);
          setRefresh((prev) => !prev);

          Swal.fire("Deleted!", "Your banner has been deleted.", "success");
        } else {
          Swal.fire("Error!", "Failed to delete the banner.", "error");
        }
      } catch (error) {
      
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };
   const handleDeleteRef = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/refCode/${id}`);
        const data = res.data;
        window.location.reload();
        if (data.success) {
          const remaining = refCodes.filter((code) => code._id !== id);
          setRefCodes(remaining);
        
          Swal.fire("Deleted!", "Your Refer Code has been deleted.", "success");
        } else {
          // Swal.fire("Error!", "Failed to delete the refer code.", "error");
        }
      } catch (error) {
        
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const imageFile = e.target.logo.files[0];
    
    if (!imageFile) {
      Swal.fire({
        icon: "error",
        title: "No file selected!",
        text: "Please select an image file to upload.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    formData.append('image', imageFile);

    try {
      const response = await axiosSecure.patch("/api/v1/content/update-logo", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setLogo(response.data.data);
        Swal.fire({
          icon: "success",
          title: "Logo updated!",
          text: "Your logo was updated successfully.",
          confirmButtonColor: "#3085d6",
        });
        e.target.reset();
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (err) {
      
      Swal.fire({
        icon: "error",
        title: "Update failed!",
        text: err.response?.data?.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Add this CSS to your component or global styles
  useEffect(() => {
    // Add custom styles for the SweetAlert modal
    const style = document.createElement('style');
    style.textContent = `
      .swal-wide {
        width: 500px !important;
        max-width: 90vw !important;
      }
      .swal2-popup {
        font-size: 1rem !important;
      }
      .swal2-title {
        color: #1a202c !important;
        font-size: 1.5rem !important;
        margin-bottom: 1.5rem !important;
      }
      .swal2-html-container {
        margin: 1rem 0 !important;
      }
      .swal2-input, .swal2-textarea {
        margin: 0.5rem 0 !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 0.375rem !important;
        padding: 0.5rem !important;
        width: 100% !important;
      }
      .swal2-confirm {
        background-color: #3085d6 !important;
        border-radius: 0.375rem !important;
        padding: 0.5rem 1rem !important;
      }
      .swal2-cancel {
        background-color: #d33 !important;
        border-radius: 0.375rem !important;
        padding: 0.5rem 1rem !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center">
              Home Control Panel
            </h1>
            <p className="text-gray-300 text-center mt-1">
              Manage your website content and settings
            </p>
          </div>
        </div>

        {/* Logo Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <FaUpload className="mr-2" /> Logo Management
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Logo Display */}
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200">
                <h3 className="text-lg font-medium text-[#1f2937] mb-4">Current Logo</h3>
                {logoLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1f2937]"></div>
                  </div>
                ) : logo ? (
                  <div className="relative group">
                    <img
                      src={`${import.meta.env.VITE_BASE_API_URL}${logo.url}`}
                      alt="Current Logo"
                      className="w-full h-32 object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Current Logo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No logo uploaded</p>
                  </div>
                )}
              </div>

              {/* Logo Upload Form */}
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-200">
                <h3 className="text-lg font-medium text-[#1f2937] mb-4">Update Logo</h3>
                <form onSubmit={handleLogoUpload} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select New Logo
                    </label>
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-[#1f2937] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937] transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FaUpload className="mr-2" /> Update Logo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Banner Management</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleBannerUpload} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Title
                </label>
                <input
                  type="text"
                  name="title"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                  placeholder="Enter banner title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-[#1f2937] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FaUpload className="mr-2" /> Upload Banner
                </button>
              </div>
            </form>

            {/* Banner Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bannerImages.map((image) => (
                <div
                  key={image._id}
                  className="relative group rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <img
                    src={`${import.meta.env.VITE_BASE_API_URL}${image.url}`}
                    alt={image.title || "Banner Image"}
                    className="w-full h-48 object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleBannerDelete(image._id)}
                      className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notice Section */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Notice Management</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleUpload} className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Title
                </label>
                <input
                  type="text"
                  name="title"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                  placeholder="Enter notice title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  className="w-full px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                  placeholder="Enter notice description..."
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-[#1f2937] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937] transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Add Notice
                </button>
              </div>
            </form>

            {/* Notices List */}
            <div className="space-y-4">
              {notices.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No notices found</p>
                </div>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice._id}
                    className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-[#1f2937]">{notice.title}</h3>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleUpdate(notice._id, notice)}
                          className="px-4 py-2 bg-[#1f2937] text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2 transition-colors duration-200"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDelete(notice._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{notice.description}</p>
                    <p className="text-sm text-gray-500 mt-4">
                      Created: {new Date(notice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Referral Code Section */}
        {user?.role === "admin" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#1f2937] to-gray-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Referral Code Management</h2>
            </div>
            
            <div className="p-6">
              <form onSubmit={hundleRefCode} className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Referral Code
                  </label>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      name="refCode"
                      className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-[#1f2937] focus:ring-2 focus:ring-[#1f2937] focus:ring-opacity-20 transition-all duration-200 outline-none text-gray-700"
                      placeholder="Enter referral code..."
                      required
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#1f2937] text-white font-medium rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1f2937] focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Add Code
                    </button>
                  </div>
                </div>
              </form>

              {/* Referral Codes List */}
              <div className="space-y-4">
                {refCodes.map((code) => (
                  <div
                    key={code._id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <span className="text-lg font-medium text-[#1f2937]">
                      Code: {code.refCode}
                    </span>
                    <button
                      onClick={() => handleDeleteRef(code._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeControl;
