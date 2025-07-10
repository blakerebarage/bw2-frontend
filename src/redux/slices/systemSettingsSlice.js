import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  defaultCurrency: "BDT",
  loading: false,
  error: null,
};

// Create async thunk for fetching system settings
export const fetchSystemSettings = createAsyncThunk(
  'systemSettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_API_URL}/api/v1/system-setting`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue('Failed to fetch system settings');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Network error');
    }
  }
);

const systemSettingsSlice = createSlice({
  name: "systemSettings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.defaultCurrency = payload.defaultCurrency;
        state.error = null;
      })
      .addCase(fetchSystemSettings.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      });
  },
});

export default systemSettingsSlice.reducer; 