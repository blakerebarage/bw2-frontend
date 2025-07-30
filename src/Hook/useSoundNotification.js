import soundNotification from '@/lib/soundNotification';
import { useCallback, useEffect, useRef } from 'react';

const useSoundNotification = () => {
  const lastOtpEvent = useRef(null);
  const lastDepositEvent = useRef(null);
  const lastWithdrawEvent = useRef(null);

  // Play OTP received sound
  const playOtpReceived = useCallback(() => {
    soundNotification.playOtpReceived();
  }, []);

  // Play deposit success sound
  const playDepositSuccess = useCallback(() => {
    soundNotification.playDepositSuccess();
  }, []);

  // Play withdraw success sound
  const playWithdrawSuccess = useCallback(() => {
    soundNotification.playWithdrawSuccess();
  }, []);

  // Play deposit pending sound
  const playDepositPending = useCallback(() => {
    console.log('Playing deposit pending sound');
    soundNotification.playDepositPending();
  }, []);

  // Play withdraw pending sound
  const playWithdrawPending = useCallback(() => {
    soundNotification.playWithdrawPending();
  }, []);

  // Play error sound
  const playError = useCallback(() => {
    soundNotification.playError();
  }, []);

  // Play general notification sound
  const playNotification = useCallback(() => {
    soundNotification.playNotification();
  }, []);

  // Test sound functionality
  const testSound = useCallback(() => {
    soundNotification.testSound();
  }, []);

  // Enable/disable sound notifications
  const enableSound = useCallback(() => {
    soundNotification.enable();
  }, []);

  const disableSound = useCallback(() => {
    soundNotification.disable();
  }, []);

  const toggleSound = useCallback(() => {
    return soundNotification.toggle();
  }, []);

  // Set volume
  const setVolume = useCallback((volume) => {
    soundNotification.setVolume(volume);
  }, []);

  // Get current settings
  const getVolume = useCallback(() => {
    return soundNotification.getVolume();
  }, []);

  const isSoundEnabled = useCallback(() => {
    return soundNotification.isSoundEnabled();
  }, []);

  // Handle OTP events with sound
  const handleOtpEvent = useCallback((eventType, data) => {
    const eventKey = `${eventType}_${data?.otpId || data?.otp || Date.now()}`;
    
    // Prevent duplicate sounds for the same event
    if (lastOtpEvent.current === eventKey) {
      return;
    }
    
    lastOtpEvent.current = eventKey;

    switch (eventType) {
      case 'new_otp':
      case 'active_otp_update':
        playOtpReceived();
        break;
      case 'otp_used':
      case 'otp_completed':
        playDepositSuccess();
        break;
      case 'otp_expired':
        playError();
        break;
      default:
        break;
    }
  }, [playOtpReceived, playDepositSuccess, playError]);

  // Handle deposit events with sound
  const handleDepositEvent = useCallback((eventType, data) => {
    console.log('handleDepositEvent called with:', eventType, data);
    const eventKey = `${eventType}_${data?.requestId || data?._id || Date.now()}`;
    
    // Prevent duplicate sounds for the same event
    if (lastDepositEvent.current === eventKey) {
      console.log('Duplicate deposit event, skipping sound');
      return;
    }
    
    lastDepositEvent.current = eventKey;

    switch (eventType) {
      case 'deposit_request_update':
        if (data?.status === 'pending') {
          playDepositPending();
        } else if (data?.status === 'completed' || data?.status === 'success') {
          playDepositSuccess();
        }
        break;
      case 'deposit_pending':
        playDepositPending();
        break;
      case 'deposit_success':
        playDepositSuccess();
        break;
      case 'deposit_error':
        playError();
        break;
      default:
        break;
    }
  }, [playDepositPending, playDepositSuccess, playError]);

  // Handle withdraw events with sound
  const handleWithdrawEvent = useCallback((eventType, data) => {
    const eventKey = `${eventType}_${data?.requestId || data?._id || Date.now()}`;
    
    // Prevent duplicate sounds for the same event
    if (lastWithdrawEvent.current === eventKey) {
      return;
    }
    
    lastWithdrawEvent.current = eventKey;

    switch (eventType) {
      case 'withdraw_request_update':
        if (data?.status === 'pending') {
          playWithdrawPending();
        } else if (data?.status === 'completed' || data?.status === 'success') {
          playWithdrawSuccess();
        }
        break;
      case 'withdraw_success':
        playWithdrawSuccess();
        break;
      case 'withdraw_error':
        playError();
        break;
      default:
        break;
    }
  }, [playWithdrawPending, playWithdrawSuccess, playError]);

  // Clear event refs after a delay to allow new events
  useEffect(() => {
    const clearEventRefs = () => {
      setTimeout(() => {
        lastOtpEvent.current = null;
        lastDepositEvent.current = null;
        lastWithdrawEvent.current = null;
      }, 1000);
    };

    const interval = setInterval(clearEventRefs, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    // Sound control methods
    playOtpReceived,
    playDepositSuccess,
    playWithdrawSuccess,
    playDepositPending,
    playWithdrawPending,
    playError,
    playNotification,
    testSound,
    
    // Settings control
    enableSound,
    disableSound,
    toggleSound,
    setVolume,
    getVolume,
    isSoundEnabled,
    
    // Event handlers
    handleOtpEvent,
    handleDepositEvent,
    handleWithdrawEvent
  };
};

export default useSoundNotification; 