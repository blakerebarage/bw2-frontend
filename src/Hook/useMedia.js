import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToasts } from 'react-toast-notifications';
import { setBanner, setError, setLoading, setLogo } from '../redux/slices/mediaSlice';
import useAxiosSecure from './useAxiosSecure';

const useMedia = () => {
  const dispatch = useDispatch();
  const { logo, banner, loading, error } = useSelector((state) => state.media);
  const axiosSecure = useAxiosSecure();
  const { addToast } = useToasts();

  const fetchMedia = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // Fetch logo
      const logoResponse = await axiosSecure.get('/api/v1/content/get-logo');
      dispatch(setLogo(logoResponse.data.data));

      // Fetch banner
      const bannerResponse = await axiosSecure.get('/api/v1/content/all-banner');
      dispatch(setBanner(bannerResponse.data.data));
    } catch (err) {
      dispatch(setError(err.message));
      addToast("Failed to fetch Media", {
        appearance: "error",
        autoDismiss: true,
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const refreshMedia = () => {
    fetchMedia();
  };

  return {
    logo,
    banner,
    loading,
    error,
    refreshMedia
  };
};

export default useMedia; 