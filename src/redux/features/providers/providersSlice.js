import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Create axios instance for the slice
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
});

// Add request interceptor to include token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Async thunk for fetching providers
export const fetchProviders = createAsyncThunk(
  "providers/fetchProviders",
  async ({ page = 1, limit = 50, search = "" } = {}) => {
    try {
      const response = await axiosInstance.get("/api/v1/game/providers", {
        params: {
          page,
          limit,
          search,
        },
      });
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }
);

const initialState = {
  providers: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

const providersSlice = createSlice({
  name: "providers",
  initialState,
  reducers: {
    clearProviders: (state) => {
      state.providers = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProviders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProviders.fulfilled, (state, action) => {
        state.loading = false;
        state.providers = action.payload.results;
        state.totalPages = action.payload.pageCount;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchProviders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearProviders } = providersSlice.actions;
export default providersSlice.reducer; 