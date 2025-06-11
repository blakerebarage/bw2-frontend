import { createSlice } from "@reduxjs/toolkit";
import useAxiosSecure from "../../Hook/useAxiosSecure";

const initialState = {
  token: localStorage.getItem("token") || null,
  user: null,
  session: null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token = payload.token;
      state.user = payload.user;
      state.session = payload.session;
      state.isAuthenticated = true;
      
      // Only store token in localStorage
      localStorage.setItem("token", payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.session = null;
      state.isAuthenticated = false;
      
      // Only remove token from localStorage
      localStorage.removeItem("token");
    },
    updateUserData: (state, { payload }) => {
      state.user = payload;
    },
    updateSession: (state, { payload }) => {
      state.session = payload;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload;
    },
    setError: (state, { payload }) => {
      state.error = payload;
    },
  },
});

export const { 
  setCredentials, 
  logout, 
  updateUserData, 
  updateSession,
  setLoading, 
  setError 
} = authSlice.actions;

// Thunk for fetching user data
export const fetchUserData = () => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const axiosSecure = useAxiosSecure();
    const response = await axiosSecure.get("/api/v1/user/profile");
    dispatch(updateUserData(response.data.data));
    dispatch(setError(null));
  } catch (error) {
    
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer;

// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   token: localStorage.getItem("token") || null,
//   user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
//   isAuthenticated: !!localStorage.getItem("token"),
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setCredentials: (state, { payload }) => {
//       state.token = payload.token;
//       state.user = payload.user;
//       state.isAuthenticated = true;
//       localStorage.setItem("token", payload.token);
//       localStorage.setItem("user", JSON.stringify(payload.user));
//     },
//     logout: (state) => {
//       state.token = null;
//       state.user = null;
//       state.isAuthenticated = false;
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//     },
//   },
// });

// export const { setCredentials, logout } = authSlice.actions;
// export default authSlice.reducer;

