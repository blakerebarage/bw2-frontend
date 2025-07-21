import baseApi from "../../baseApi";

const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Register a user
    addUser: builder.mutation({
      query: (data) => ({
        url: "/api/v1/user/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["users", "balance"],
    }),

    // Login a user
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/user/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["profile", "balance"],
    }),

    // Fetch authenticated user
    getAuthenticatedUser: builder.query({
      query: (token) => ({
        url: "/api/v1/user/profile",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      providesTags: ["profile"],
    }),

    // get all users
    getUsers: builder.query({
      query: (params = {}) => {
        const { referredBy, page, limit } = params;
        
        const urlParams = new URLSearchParams({
          page: page?.toString() || '1',
          limit: limit?.toString() || '10'
        });
        
        if (referredBy) {
          urlParams.append('referredBy', referredBy);
        }
        
        return `/api/v1/user/all?${urlParams.toString()}`;
      },
      providesTags: (result) => 
        result?.data?.users
          ? [
              ...result.data.users.map(({ _id }) => ({ type: 'users', id: _id })),
              { type: 'users', id: 'LIST' },
            ]
          : [{ type: 'users', id: 'LIST' }],
      // Add cache invalidation on focus and reconnect
      keepUnusedDataFor: 30,
      refetchOnMountOrArgChange: 20,
    }),

    // Get single user
    getSingleUser: builder.query({
      query: (userId) => `/api/v1/user/single/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'users', id: userId }],
      keepUnusedDataFor: 60,
    }),

    updateBalance: builder.mutation({
      query: (params = {}) => {
        const { username, type, amount } = params;
        return {
          url: `/api/v1/finance/create-transaction`,
          method: "POST",
          body: { type, amount, username },
        };
      },
      invalidatesTags: ["users", "balance", "transactions"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate and refetch user data
          dispatch(baseApi.util.invalidateTags(['users', 'balance', 'transactions']));
        } catch (error) {
          console.error('Error updating balance:', error);
        }
      },
    }),

    getUserTransactions: builder.query({
      query: ({ username, page, limit }) => ({
        url: `/api/v1/finance/all-transactions/${username}?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: (result, error, { username }) => [
        { type: 'transactions', id: username },
        { type: 'transactions', id: 'LIST' },
      ],
      keepUnusedDataFor: 30,
    }),

    // Send balance mutation
    sendBalance: builder.mutation({
      query: (data) => ({
        url: "/api/v1/finance/deposit-by-cash-agent",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["users", "balance", "transactions"],
    }),

    // Initiate withdrawal - Step 1
    initiateWithdrawal: builder.mutation({
      query: (data) => ({
        url: "/api/v1/finance/initiate-withdrawal",
        method: "POST",
        body: data,
      }),
    }),

    // Complete withdrawal - Step 2
    completeWithdrawal: builder.mutation({
      query: (data) => ({
        url: "/api/v1/finance/complete-withdrawal",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["users", "balance", "transactions"],
    }),

    // Get active OTP
    getActiveOtp: builder.query({
      query: () => ({
        url: "/api/v1/finance/active-otp",
        method: "GET",
      }),
      // Don't cache this query as OTPs change frequently
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useAddUserMutation,
  useLoginUserMutation,
  useLazyGetAuthenticatedUserQuery,
  useGetUsersQuery,
  useGetSingleUserQuery,
  useUpdateBalanceMutation,
  useGetUserTransactionsQuery,
  useSendBalanceMutation,
  useInitiateWithdrawalMutation,
  useCompleteWithdrawalMutation,
  useGetActiveOtpQuery,
  useLazyGetActiveOtpQuery
} = usersApi;

export default usersApi;