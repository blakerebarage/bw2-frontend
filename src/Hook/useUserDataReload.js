import useAxiosSecure from '@/Hook/useAxiosSecure';
import { logout, setError, setLoading, updateUserData } from '@/redux/slices/authSlice';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Manual version: does NOT auto-call on mount or route change
const useManualUserDataReload = () => {
  const dispatch = useDispatch();
  const axiosSecure = useAxiosSecure();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Function to reload user data
  const reloadUserData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      dispatch(setLoading(true));
      const response = await axiosSecure.get("/api/v1/user/profile");
      if (response?.data?.data) {
        dispatch(updateUserData(response.data.data));
        dispatch(setError(null));
      }
    } catch (error) {
      if (error.response?.data?.message ==="Session expired. Please log in again." && error.response.status === 401) {
        dispatch(logout());
      }
      dispatch(setError(error.response?.data?.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, isAuthenticated, axiosSecure]);

  return { reloadUserData };
};

export default useManualUserDataReload; 