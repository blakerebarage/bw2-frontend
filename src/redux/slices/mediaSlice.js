import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  logo: null,
  banner: null,
  loading: false,
  error: null
};

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setLogo: (state, action) => {
      state.logo = action.payload;
    },
    setBanner: (state, action) => {
      state.banner = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearMedia: (state) => {
      state.logo = null;
      state.banner = null;
      state.error = null;
    }
  }
});

export const { setLogo, setBanner, setLoading, setError, clearMedia } = mediaSlice.actions;
export default mediaSlice.reducer; 