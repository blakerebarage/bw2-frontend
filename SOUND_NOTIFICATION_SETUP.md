# Sound Notification System Implementation

This document describes the implementation of a comprehensive sound notification system for OTP deposit and withdraw events in the project.

## Overview

The sound notification system provides real-time audio feedback for various transaction events, enhancing user experience by providing immediate audio cues for important events.

## Features

### 🎵 Sound Types
- **OTP Received**: Distinct ascending tone for new OTP notifications
- **Deposit Success**: Success tone for completed deposits
- **Withdraw Success**: Success tone for completed withdrawals
- **Deposit Pending**: Alert tone for pending deposit requests
- **Withdraw Pending**: Alert tone for pending withdrawal requests
- **Error**: Warning tone for transaction errors
- **General Notification**: Default notification tone

### 🔊 Audio Features
- **Volume Control**: Adjustable volume from 0% to 100%
- **Enable/Disable**: Toggle sound notifications on/off
- **Persistent Settings**: Settings saved to localStorage
- **Cross-browser Support**: Works with Web Audio API and fallbacks
- **Duplicate Prevention**: Prevents duplicate sounds for same events

## Implementation Details

### Core Components

#### 1. SoundNotification Class (`src/lib/soundNotification.js`)
- Singleton class managing all sound functionality
- Web Audio API implementation with fallbacks
- Different frequency patterns for each notification type
- Volume and preference management

#### 2. useSoundNotification Hook (`src/Hook/useSoundNotification.js`)
- React hook for integrating sound with components
- Event handling for OTP, deposit, and withdraw events
- Duplicate event prevention
- Sound control methods

#### 3. SoundSettings Component (`src/components/SoundSettings.jsx`)
- UI component for sound settings
- Volume slider with visual feedback
- Enable/disable toggle
- Test sound functionality

#### 4. SoundDemo Component (`src/components/SoundDemo.jsx`)
- Demo component for testing all sound types
- Interactive buttons for each notification type
- Useful for development and testing

### Integration Points

#### OTP Display Component
- Integrated with existing OTP socket events
- Plays sounds for: new OTP, OTP used, OTP expired, OTP completed

#### Cash Agent Panel
- Integrated with deposit/withdraw socket events
- Plays sounds for: deposit success, withdraw success, pending requests, errors

## Usage

### Basic Usage
```javascript
import useSoundNotification from '@/Hook/useSoundNotification';

const MyComponent = () => {
  const { playOtpReceived, playDepositSuccess } = useSoundNotification();
  
  // Play sounds when events occur
  const handleNewOtp = () => {
    playOtpReceived();
  };
};
```

### Sound Settings
```javascript
import SoundSettings from '@/components/SoundSettings';

// Add to your component
<SoundSettings />
```

### Testing Sounds
```javascript
import SoundDemo from '@/components/SoundDemo';

// Add to your component for testing
<SoundDemo />
```

## Configuration

### Browser Compatibility
- **Modern Browsers**: Full Web Audio API support
- **Older Browsers**: Fallback to HTML5 Audio
- **No Audio Support**: Graceful degradation

### Audio Context Initialization
The system automatically initializes audio contexts when needed and handles browser restrictions (e.g., requiring user interaction).

### Volume Settings
- Default volume: 50%
- Range: 0% to 100%
- Settings persist across browser sessions

## Event Integration

### OTP Events
- `new_otp`: Plays OTP received sound
- `active_otp_update`: Plays OTP received sound
- `otp_used`: Plays deposit success sound
- `otp_completed`: Plays deposit success sound
- `otp_expired`: Plays error sound

### Deposit Events
- `deposit_request_update` (pending): Plays deposit pending sound
- `deposit_request_update` (completed): Plays deposit success sound
- `deposit_success`: Plays deposit success sound
- `deposit_error`: Plays error sound

### Withdraw Events
- `withdraw_request_update` (pending): Plays withdraw pending sound
- `withdraw_request_update` (completed): Plays withdraw success sound
- `withdraw_success`: Plays withdraw success sound
- `withdraw_error`: Plays error sound

## Technical Details

### Audio Implementation
```javascript
// Web Audio API with oscillator
const oscillator = audioContext.createOscillator();
const gainNode = audioContext.createGain();

// Different frequency patterns for different sounds
switch (type) {
  case 'otp_received':
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
    break;
  // ... other patterns
}
```

### Event Deduplication
```javascript
const eventKey = `${eventType}_${data?.otpId || data?.otp || Date.now()}`;
if (lastOtpEvent.current === eventKey) {
  return; // Prevent duplicate sounds
}
```

## Browser Support

| Browser | Web Audio API | HTML5 Audio | Fallback |
|---------|---------------|-------------|----------|
| Chrome | ✅ | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Safari | ✅ | ✅ | ✅ |
| Edge | ✅ | ✅ | ✅ |
| IE11 | ❌ | ✅ | ✅ |

## Troubleshooting

### Common Issues

1. **No Sound Playing**
   - Check if sound is enabled in settings
   - Ensure browser allows audio
   - Check volume settings

2. **Audio Context Errors**
   - Browser may require user interaction
   - Check browser console for errors
   - System falls back to HTML5 Audio

3. **Duplicate Sounds**
   - System includes deduplication logic
   - Check event handling in components

### Debug Mode
Enable console logging by adding to `soundNotification.js`:
```javascript
console.log('Playing sound:', type);
```

## Future Enhancements

- [ ] Custom sound file support
- [ ] Different sound themes
- [ ] Sound scheduling
- [ ] Mobile-specific optimizations
- [ ] Accessibility features (visual indicators)

## Dependencies

- React 18+
- Web Audio API (built-in)
- HTML5 Audio (built-in)
- No external audio libraries required

## Performance Considerations

- Audio contexts are created on-demand
- Sounds are short (200ms) to minimize impact
- Event deduplication prevents excessive audio
- Settings are cached in localStorage

## Security Notes

- No external audio files loaded
- All sounds generated programmatically
- No audio data transmitted over network
- Settings stored locally only 