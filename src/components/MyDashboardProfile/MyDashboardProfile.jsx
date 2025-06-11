return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-[#1f2937]">Profile Information</h2>
          </div>

          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Profile Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[#1f2937] mb-4">Personal Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1f2937]">Username</label>
                      <input
                        type="text"
                        value={userData.username || ''}
                        disabled
                        className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#1f2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1f2937]">Email</label>
                      <input
                        type="email"
                        value={userData.email || ''}
                        disabled
                        className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#1f2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1f2937]">Phone</label>
                      <input
                        type="tel"
                        value={userData.phone || ''}
                        disabled
                        className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#1f2937]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-[#1f2937] mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#1f2937]">Role</label>
                      <input
                        type="text"
                        value={userData.role || ''}
                        disabled
                        className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#1f2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1f2937]">Balance</label>
                      <input
                        type="text"
                        value={formatCurrency(userData.balance || 0)}
                        disabled
                        className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#1f2937]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1f2937]">Commission Percentage</label>
                      <input
                        type="text"
                        value={`${userData.commissionPercentage || 0}%`}
                        disabled
                        className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#1f2937]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Change Password */}
              <div>
                <h3 className="text-lg font-medium text-[#1f2937] mb-4">Change Password</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1f2937]">Current Password</label>
                    <input
                      type="password"
                      {...register("currentPassword", { required: "Current password is required" })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1f2937]">New Password</label>
                    <input
                      type="password"
                      {...register("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters"
                        }
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1f2937]">Confirm New Password</label>
                    <input
                      type="password"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: value => value === watch("newPassword") || "Passwords do not match"
                      })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#1f2937] focus:border-[#1f2937] outline-none transition-colors"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#1f2937] hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 