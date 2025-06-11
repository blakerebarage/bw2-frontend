import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import { setDeviceId } from '../redux/slices/authSlice';
import useAxiosSecure from './useAxiosSecure';

const useDeviceManager = () => {
  const dispatch = useDispatch();
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();
  const { deviceId, isAuthenticated } = useSelector((state) => state.auth);

  // Generate a unique device ID
  const generateDeviceId = () => {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  };

  // Initialize device ID on component mount
  useEffect(() => {
    if (isAuthenticated && !deviceId) {
      const newDeviceId = generateDeviceId();
      dispatch(setDeviceId(newDeviceId));
    }
  }, [isAuthenticated, deviceId, dispatch]);

  // Add device ID to all requests
  useEffect(() => {
    if (deviceId) {
      axiosSecure.interceptors.request.use(
        (config) => {
          config.headers['X-Device-ID'] = deviceId;
          return config;
        },
        (error) => Promise.reject(error)
      );
    }
  }, [deviceId, axiosSecure]);

  return {
    deviceId,
    generateDeviceId
  };
};

export default useDeviceManager; 