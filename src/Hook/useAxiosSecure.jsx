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

const useAxiosSecure = () => {
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

    return instance;
  }, []);

  return axiosSecure;
};

export default useAxiosSecure;
