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
      invalidatesTags: ["users"],
    }),

    // Login a user
    loginUser: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/user/login",
        method: "POST",
        body: credentials,
      }),
      providesTags: ["users"],
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
      providesTags: ["users"],
    }),

    // get all users
    getUsers: builder.query({
      query: (referredBy,page,limit) => {
        if(referredBy){
          return `/api/v1/user/all?limit=${limit}&page=${page}&referredBy=${referredBy}`;
        }
        return `/api/v1/user/all?limit=${limit}&page=${page}`;
      },
      providesTags: ["users"],
    }),

    updateBalance: builder.mutation({
      query: ({ username, type, amount }) => ({
        url: `/api/v1/finance/create-transaction`,
        method: "POST",
        body: { type, amount, username },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate and refetch user data
          dispatch(baseApi.util.invalidateTags(['users']));
          
        } catch (error) {
         
        }
      },
    }),
    getUserTransactions: builder.query({
      query: ({ username, page, limit }) => ({
        url: `/api/v1/finance/all-transactions/${username}?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["users"],
    }),
  }),
});

export const {
  useAddUserMutation,
  useLoginUserMutation,
  useLazyGetAuthenticatedUserQuery,
  useGetUsersQuery,
  useUpdateBalanceMutation,
  useGetUserTransactionsQuery
} = usersApi;


// import baseApi from "../../baseApi";

// // Function to generate a random referral code
// const generateReferralCode = (length = 6) => {
//   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   let code = "";
//   for (let i = 0; i < length; i++) {
//     code += chars.charAt(Math.floor(Math.random() * chars.length));
//   }
//   return code;
// };
// const usersApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     // Register a user with referral code
//     addUser: builder.mutation({
//       query: (data) => {
//         const referralCode = generateReferralCode(); // Generate unique referral code
//         return {
//           url: "/users/register",
//           method: "POST",
//           body: { ...data, referralCode }, // Add referralCode to request
//         };
//       },
//       invalidatesTags: ["users"],
//     }),

//     // Login a user
//     loginUser: builder.mutation({
//       query: (credentials) => ({
//         url: "/users/login",
//         method: "POST",
//         body: credentials,
//       }),
//       providesTags: ["users"],
//     }),

//     // Fetch authenticated user
//     getAuthenticatedUser: builder.query({
//       query: (token) => ({
//         url: "/users/profile",
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }),
//       providesTags: ["users"],
//     }),

//     // Get all users
//     getUsers: builder.query({
//       query: () => "/users",
//       providesTags: ["users"],
//     }),

//     // Update balance
//     updateBalance: builder.mutation({
//       query: ({ userId, type, amount }) => ({
//         url: `/users/balance/${userId}`,
//         method: "PUT",
//         body: { type, amount },
//       }),
//       invalidatesTags: ["users"],
//     }),
//   }),
// });

// export const {
//   useAddUserMutation,
//   useLoginUserMutation,
//   useLazyGetAuthenticatedUserQuery,
//   useGetUsersQuery,
//   useUpdateBalanceMutation,
// } = usersApi;