import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      // Add cache-busting parameter to prevent stale data
      headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      headers.set("Pragma", "no-cache");
      headers.set("Expires", "0");
      return headers;
    },
  }),
  tagTypes: [
    "users", 
    "transactions", 
    "balance", 
    "profile", 
    "bets", 
    "deposits", 
    "withdrawals",
    "system-settings"
  ],
  // Reduce cache behavior to prevent stale data
  keepUnusedDataFor: 10, // Reduce cache time to 10 seconds
  refetchOnMountOrArgChange: true, // Always refetch on mount or arg change
  refetchOnFocus: true, // Refetch when window gains focus
  refetchOnReconnect: true, // Refetch when network reconnects
  endpoints: () => ({}),
});

export default baseApi;
