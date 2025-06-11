// import { useMemo } from "react";
// import axios from "axios";

// const useAxiosSecure = () => {
//   const axiosSecure = useMemo(() => {
//     return axios.create({
//       baseURL: import.meta.env.VITE_BASE_API_URL, 
//     });
//   }, []); 

//   return axiosSecure;
// };

// export default useAxiosSecure;
import axios from "axios";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { useToasts } from "react-toast-notifications";
import { logout } from "../redux/slices/authSlice";

const useAxiosSecure = () => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();

  const axiosSecure = useMemo(() => {
    const instance = axios.create({
      baseURL: import.meta.env.VITE_BASE_API_URL,
    });

    // Add Authorization header interceptor
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token") || null;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle session expiration
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && 
            error.response?.data?.message === "Session expired. Please log in again.") {
          // Clear local storage and Redux state
          localStorage.removeItem("token");
          dispatch(logout());
          
          // Show notification to user
          addToast("Your session has expired. Please log in again.", {
            appearance: "error",
            autoDismiss: true,
          });

          // Redirect to login page if not already there
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [dispatch, addToast]);

  return axiosSecure;
};

export default useAxiosSecure;
