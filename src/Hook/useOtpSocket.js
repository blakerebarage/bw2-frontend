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

  // Handle OTP used event
  const handleOtpUsed = useCallback((payload) => {
    console.log('useOtpSocket: handleOtpUsed called with payload:', payload);
    setActiveOtpData(null);
    setHasNewOtp(false);
    setLastEvent({ type: 'otp_used', payload });
  }, []);

  const handleOtpExpired = useCallback((payload) => {
    console.log('useOtpSocket: handleOtpExpired called with payload:', payload);
    setActiveOtpData(null);
    setHasNewOtp(false);
    setLastEvent({ type: 'otp_expired', payload });
  }, []);

  const handleOtpCompleted = useCallback((payload) => {
    console.log('useOtpSocket: handleOtpCompleted called with payload:', payload);
    setActiveOtpData(null);
    setHasNewOtp(false);
    setLastEvent({ type: 'otp_completed', payload });
  }, []);

  // Handle new OTP event
  const handleNewOtp = useCallback((payload) => {
    console.log('useOtpSocket: handleNewOtp called with payload:', payload);
    if (payload && payload.data) {
      setActiveOtpData(payload.data);
      setHasNewOtp(true);
      setLastEvent({ type: 'new_otp', payload });
    } else if (payload && (payload.otp || payload.amount)) {
      setActiveOtpData(payload);
      setHasNewOtp(true);
      setLastEvent({ type: 'new_otp', payload });
    }
  }, []);

  // Listen for active OTP updates
  const handleActiveOtpUpdate = useCallback((payload) => {
    console.log('useOtpSocket: handleActiveOtpUpdate called with payload:', payload);
    
    // Check if this is actually an otp_used event (has otpId but no otp/amount)
    if (payload && payload.otpId && !payload.otp && !payload.amount) {
      console.log('useOtpSocket: Detected otp_used event in active_otp_update, ignoring');
      return;
    }
    
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
    socket.on('new_otp', handleNewOtp);
    socket.on('otp_used', handleOtpUsed);
    socket.on('otp_expired', handleOtpExpired);
    socket.on('otp_completed', handleOtpCompleted);

    // Cleanup event listeners
    return () => {
      socket.off('active_otp_update', handleActiveOtpUpdate);
      socket.off('new_otp', handleNewOtp);
      socket.off('otp_used', handleOtpUsed);
      socket.off('otp_expired', handleOtpExpired);
      socket.off('otp_completed', handleOtpCompleted);
    };
  }, [socket, isConnected, handleActiveOtpUpdate, handleNewOtp, handleOtpUsed, handleOtpExpired, handleOtpCompleted]);

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