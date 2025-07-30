import useSoundNotification from '@/Hook/useSoundNotification';
import { FaPlay, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';

const SoundDemo = () => {
  const {
    playOtpReceived,
    playDepositSuccess,
    playWithdrawSuccess,
    playDepositPending,
    playWithdrawPending,
    playError,
    playNotification,
    testSound,
    isSoundEnabled,
    toggleSound
  } = useSoundNotification();

  const handleTestSound = (soundType) => {
    switch (soundType) {
      case 'otp':
        playOtpReceived();
        break;
      case 'deposit_success':
        playDepositSuccess();
        break;
      case 'withdraw_success':
        playWithdrawSuccess();
        break;
      case 'deposit_pending':
        playDepositPending();
        break;
      case 'withdraw_pending':
        playWithdrawPending();
        break;
      case 'error':
        playError();
        break;
      case 'notification':
        playNotification();
        break;
      default:
        testSound();
    }
  };

  const soundTests = [
    { type: 'otp', label: 'OTP Received', color: 'bg-blue-500' },
    { type: 'deposit_success', label: 'Deposit Success', color: 'bg-green-500' },
    { type: 'withdraw_success', label: 'Withdraw Success', color: 'bg-green-600' },
    { type: 'deposit_pending', label: 'Deposit Pending', color: 'bg-yellow-500' },
    { type: 'withdraw_pending', label: 'Withdraw Pending', color: 'bg-yellow-600' },
    { type: 'error', label: 'Error', color: 'bg-red-500' },
    { type: 'notification', label: 'General Notification', color: 'bg-purple-500' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Sound Notification Demo</h2>
        <button
          onClick={toggleSound}
          className={`p-2 rounded-full transition-colors duration-200 ${
            isSoundEnabled() 
              ? 'bg-green-100 text-green-600 hover:bg-green-200' 
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
          title={isSoundEnabled() ? 'Disable Sound' : 'Enable Sound'}
        >
          {isSoundEnabled() ? <FaVolumeUp /> : <FaVolumeMute />}
        </button>
      </div>

      <div className="space-y-3">
        {soundTests.map((test) => (
          <button
            key={test.type}
            onClick={() => handleTestSound(test.type)}
            disabled={!isSoundEnabled()}
            className={`w-full flex items-center justify-between p-3 rounded-lg text-white transition-all duration-200 hover:scale-105 ${
              test.color
            } ${!isSoundEnabled() ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
          >
            <span className="font-medium">{test.label}</span>
            <FaPlay className="text-sm" />
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Instructions:</h3>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Click any button to test the corresponding sound</li>
          <li>• Use the volume icon to enable/disable sounds</li>
          <li>• Different sounds for different notification types</li>
          <li>• Sounds are automatically played during real events</li>
        </ul>
      </div>
    </div>
  );
};

export default SoundDemo; 