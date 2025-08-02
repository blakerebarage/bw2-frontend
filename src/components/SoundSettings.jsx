import useSoundNotification from '@/Hook/useSoundNotification';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaVolumeDown, FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { IoMdSettings } from 'react-icons/io';

const SoundSettings = ({ className = '' }) => {
  const {
    isSoundEnabled,
    toggleSound,
    setVolume,
    getVolume,
    testSound
  } = useSoundNotification();

  const [volume, setLocalVolume] = useState(0.8);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync with the actual sound notification state
  useEffect(() => {
    setLocalVolume(getVolume());
    setSoundEnabled(isSoundEnabled());
  }, [getVolume, isSoundEnabled]);

  // Update local state when sound state changes
  useEffect(() => {
    const updateSoundState = () => {
      setSoundEnabled(isSoundEnabled());
    };

    // Update state immediately
    updateSoundState();

    // Set up an interval to check for state changes
    const interval = setInterval(updateSoundState, 100);
    
    return () => clearInterval(interval);
  }, [isSoundEnabled]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    setVolume(newVolume);
  };

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
  };

  const handleTestSound = () => {
    testSound();
  };

  const getVolumeIcon = () => {
    if (!soundEnabled) return <FaVolumeMute className="text-gray-400" />;
    if (volume === 0) return <FaVolumeMute className="text-gray-400" />;
    if (volume < 0.3) return <FaVolumeDown className="text-blue-500" />;
    if (volume < 0.7) return <FaVolumeUp className="text-blue-500" />;
    return <FaVolumeUp className="text-blue-500" />;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        title="Sound Settings"
      >
        <IoMdSettings className="w-5 h-5 text-gray-600" />
      </button>

      {/* Settings Panel - Using Portal */}
      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0  !z-[999998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Modal */}
          <div className="fixed right-4 top-20 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-64  !z-[999999]">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Sound Settings</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Sound Notifications</span>
                <button
                  onClick={handleToggleSound}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    soundEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Volume Control */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Volume</span>
                  {getVolumeIcon()}
                </div>
                <div className="flex items-center space-x-2">
                  <FaVolumeMute className="w-4 h-4 text-gray-400" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    disabled={!soundEnabled}
                  />
                  <FaVolumeUp className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {Math.round(volume * 100)}%
                </div>
              </div>

              {/* Test Sound Button */}
              <div className="pt-2">
                <button
                  onClick={handleTestSound}
                  disabled={!soundEnabled}
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium transition-colors duration-200 ${
                    soundEnabled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Test Sound
                </button>
              </div>

              {/* Info */}
              <div className="text-xs text-gray-500 border-t pt-2">
                <p>Sound notifications will play for:</p>
                <ul className="mt-1 space-y-1">
                  <li>• New OTP received</li>
                  <li>• Deposit/Withdraw success</li>
                  <li>• Transaction errors</li>
                  <li>• Pending requests</li>
                </ul>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default SoundSettings; 