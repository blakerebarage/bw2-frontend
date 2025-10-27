import soundNotification from '@/lib/soundNotification';
import { useCallback } from 'react';

const useSoundNotification = () => {
  const handleOtpEvent = useCallback(() => {
    soundNotification.playOtpReceived();
  }, []);

  const handleDepositEvent = useCallback((eventType, data) => {
    switch (eventType) {
      case 'deposit_success':
        soundNotification.playDepositSuccess();
        break;
      case 'deposit_pending':
        soundNotification.playDepositPending();
        break;
      case 'deposit_error':
        soundNotification.playError();
        break;
      default:
        soundNotification.playNotification();
    }
  }, []);

  const handleWithdrawEvent = useCallback((eventType, data) => {
    switch (eventType) {
      case 'withdraw_success':
        soundNotification.playWithdrawSuccess();
        break;
      case 'withdraw_pending':
        soundNotification.playWithdrawPending();
        break;
      case 'withdraw_error':
        soundNotification.playError();
        break;
      default:
        soundNotification.playNotification();
    }
  }, []);

  return {
    handleOtpEvent,
    handleDepositEvent,
    handleWithdrawEvent,
    isSoundEnabled: soundNotification.isSoundEnabled(),
    enableSound: () => soundNotification.enable(),
    disableSound: () => soundNotification.disable(),
    toggleSound: () => soundNotification.toggle(),
    testSound: () => soundNotification.testSound(),
  };
};

export default useSoundNotification;

