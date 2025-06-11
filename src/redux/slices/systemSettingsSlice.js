import useAxiosSecure from "@/Hook/useAxiosSecure";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  defaultCurrency: "BDT", // Default fallback
  loading: false,
  error: null,
};

const systemSettingsSlice = createSlice({
  name: "systemSettings",
  initialState,
  reducers: {
    setSystemSettings: (state, { payload }) => {
      state.defaultCurrency = payload.defaultCurrency;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
  },
});

export const { setSystemSettings, setLoading, setError } = systemSettingsSlice.actions;

// Thunk for fetching system settings
export const fetchSystemSettings = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const axiosSecure = useAxiosSecure();
    const response = await axiosSecure.get("/api/v1/system-setting");
    
    if (response.data.success) {
      dispatch(setSystemSettings(response.data.data));
    }
    dispatch(setError(null));
  } catch (error) {
    
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export default systemSettingsSlice.reducer; 