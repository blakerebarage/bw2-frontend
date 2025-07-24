import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useLazyGetActiveOtpQuery } from '../redux/features/allApis/usersApi/usersApi';

const useOtpSocket = () => {
  const { socket, isConnected } = useSocket();
  const [activeOtpData, setActiveOtpData] = useState(null);
  const [hasNewOtp, setHasNewOtp] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [getActiveOtp] = useLazyGetActiveOtpQuery();

  // Memoized callbacks to prevent re-renders
  const clearNewOtpFlag = useCallback(() => {
    setHasNewOtp(false);
  }, []);

  const clearLastEvent = useCallback(() => {
    setLastEvent(null);
  }, []);

  // Listen for active OTP updates
  const handleActiveOtpUpdate = useCallback((payload) => {
    // Handle both payload structures (with and without success property)
    if (payload && payload.data) {
      setActiveOtpData(payload.data);
      setHasNewOtp(true);
      setLastEvent({ type: 'active_otp_update', payload });
    } else if (payload && (payload.otp || payload.amount)) {
      // Handle case where data is directly in payload
      setActiveOtpData(payload);
      setHasNewOtp(true);
      setLastEvent({ type: 'active_otp_update', payload });
    }
  }, []);

  const handleOtpExpired = useCallback((payload) => {
    setActiveOtpData(null);
    setHasNewOtp(false);
    setLastEvent({ type: 'otp_expired', payload });
  }, []);

  const handleOtpCompleted = useCallback((payload) => {
    setActiveOtpData(null);
    setHasNewOtp(false);
    setLastEvent({ type: 'otp_completed', payload });
  }, []);

  // Fetch OTP from API as fallback when socket is not connected
  useEffect(() => {
    if (!isConnected && !activeOtpData) {
      const fetchOtpFromApi = async () => {
        try {
          const result = await getActiveOtp();
          if (result.data && result.data.success && result.data.data) {
            setActiveOtpData(result.data.data);
            setHasNewOtp(true);
          }
        } catch (error) {
          console.error('Failed to fetch OTP from API:', error);
        }
      };
      
      fetchOtpFromApi();
    }
  }, [isConnected, activeOtpData, getActiveOtp]);



  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Set up event listeners
    socket.on('active_otp_update', handleActiveOtpUpdate);
    socket.on('otp_expired', handleOtpExpired);
    socket.on('otp_completed', handleOtpCompleted);

    // Cleanup event listeners
    return () => {
      socket.off('active_otp_update', handleActiveOtpUpdate);
      socket.off('otp_expired', handleOtpExpired);
      socket.off('otp_completed', handleOtpCompleted);
    };
  }, [socket, isConnected, handleActiveOtpUpdate, handleOtpExpired, handleOtpCompleted]);

  // Memoize the return value to prevent unnecessary re-renders
  const result = useMemo(() => ({
    activeOtpData,
    hasNewOtp,
    lastEvent,
    clearNewOtpFlag,
    clearLastEvent,
    isSocketConnected: isConnected
  }), [activeOtpData, hasNewOtp, lastEvent, clearNewOtpFlag, clearLastEvent, isConnected]);

  return result;
};

export default useOtpSocket; 