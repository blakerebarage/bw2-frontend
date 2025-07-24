import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useLazyGetActiveOtpQuery } from '../redux/features/allApis/usersApi/usersApi';

const useRechargeSocket = () => {
  const { socket, isConnected } = useSocket();
  const [rechargeData, setRechargeData] = useState(null);
  const [hasNewRecharge, setHasNewRecharge] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [getActiveOtp] = useLazyGetActiveOtpQuery();

  // Memoized callbacks to prevent re-renders
  const clearNewRechargeFlag = useCallback(() => {
    setHasNewRecharge(false);
  }, []);

  const clearLastEvent = useCallback(() => {
    setLastEvent(null);
  }, []);

  // Listen for recharge request updates
  const handleRechargeRequestUpdate = useCallback((payload) => {
    if (payload && payload.data) {
      setRechargeData(payload.data);
      setHasNewRecharge(true);
      setLastEvent({ type: 'recharge_request_update', payload });
    }
  }, []);

  // Fetch recharge data from API as fallback when socket is not connected
  useEffect(() => {
    if (!isConnected && !rechargeData) {
      const fetchRechargeFromApi = async () => {
        try {
          const result = await getActiveOtp();
          if (result.data && result.data.success && result.data.data) {
            setRechargeData(result.data.data);
            setHasNewRecharge(true);
          }
        } catch (error) {
          console.error('Failed to fetch recharge data from API:', error);
        }
      };
      
      fetchRechargeFromApi();
    }
  }, [isConnected, rechargeData, getActiveOtp]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Set up event listeners
    socket.on('recharge_request_update', handleRechargeRequestUpdate);

    // Cleanup event listeners
    return () => {
      socket.off('recharge_request_update', handleRechargeRequestUpdate);
    };
  }, [socket, isConnected, handleRechargeRequestUpdate]);

  // Memoize the return value to prevent unnecessary re-renders
  const result = useMemo(() => ({
    rechargeData,
    hasNewRecharge,
    lastEvent,
    clearNewRechargeFlag,
    clearLastEvent,
    isSocketConnected: isConnected
  }), [rechargeData, hasNewRecharge, lastEvent, clearNewRechargeFlag, clearLastEvent, isConnected]);

  return result;
};

export default useRechargeSocket; 