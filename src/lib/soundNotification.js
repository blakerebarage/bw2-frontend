class SoundNotification {
  constructor() {
    this.sounds = {};
    this.isEnabled = this.getSoundPreference();
    this.volume = 1; // Increased default volume from 0.5 to 0.8
    this.init();
  }

  // Initialize sound files
  init() {
    // Create audio contexts for different notification types
    this.sounds = {
      otpReceived: this.createAudioContext('otp_received'),
      depositSuccess: this.createAudioContext('deposit_success'),
      withdrawSuccess: this.createAudioContext('withdraw_success'),
      depositPending: this.createAudioContext('deposit_pending'),
      withdrawPending: this.createAudioContext('withdraw_pending'),
      error: this.createAudioContext('error'),
      notification: this.createAudioContext('notification')
    };
  }

  // Create audio context with fallback to simple beep
  createAudioContext(type) {
    try {
      // Create a simple audio context for different notification types
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      return {
        context: audioContext,
        type: type,
        play: (frequency = 800, duration = 200) => this.playTone(audioContext, frequency, duration, type)
      };
    } catch (error) {
      console.warn('AudioContext not supported, falling back to simple beep');
      return {
        context: null,
        type: type,
        play: () => this.playSimpleBeep()
      };
    }
  }

  // Play a tone using Web Audio API
  playTone(audioContext, frequency, duration, type) {
    if (!this.isEnabled || !audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set different frequencies and patterns for different notification types
      switch (type) {
        case 'otp_received':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.15);
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.3);
          break;
        case 'deposit_success':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.15);
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.3);
          break;
        case 'withdraw_success':
          oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.15);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3);
          break;
        case 'deposit_pending':
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.4);
          break;
        case 'withdraw_pending':
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.4);
          break;
        case 'error':
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(100, audioContext.currentTime + 0.2);
          break;
        case 'notification':
        default:
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          break;
      }

      oscillator.type = 'sine';
      // Increase volume and make it more noticeable
      gainNode.gain.setValueAtTime(this.volume * 1.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (duration * 1.5) / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + (duration * 1.5) / 1000);
    } catch (error) {
      console.warn('Error playing sound:', error);
      this.playSimpleBeep();
    }
  }

  // Fallback simple beep for browsers that don't support AudioContext
  playSimpleBeep() {
    if (!this.isEnabled) return;
    
    try {
      // Create a simple beep using HTML5 Audio
      const audio = new Audio();
      audio.volume = this.volume;
      
      // Create a simple beep sound using data URL
      const beepData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      audio.src = beepData;
      audio.play().catch(() => {
        // If audio play fails, try a different approach
        this.playSystemBeep();
      });
    } catch (error) {
      console.warn('Error playing beep:', error);
      this.playSystemBeep();
    }
  }

  // System beep as last resort
  playSystemBeep() {
    if (!this.isEnabled) return;
    
    try {
      // Try to use system beep (works in some browsers)
      const beep = new Audio();
      beep.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      beep.volume = this.volume;
      beep.play();
    } catch (error) {
      console.warn('System beep not available:', error);
    }
  }

  // Play specific notification sounds
  playOtpReceived() {
    this.sounds.otpReceived.play();
  }

  playDepositSuccess() {
    this.sounds.depositSuccess.play();
  }

  playWithdrawSuccess() {
    this.sounds.withdrawSuccess.play();
  }

  playDepositPending() {
   
    this.sounds.depositPending.play();
  }

  playWithdrawPending() {
    this.sounds.withdrawPending.play();
  }

  playError() {
    this.sounds.error.play();
  }

  playNotification() {
    this.sounds.notification.play();
  }

  // Enable/disable sound notifications
  enable() {
    this.isEnabled = true;
    this.saveSoundPreference();
  }

  disable() {
    this.isEnabled = false;
    this.saveSoundPreference();
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.saveSoundPreference();
    return this.isEnabled;
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveVolumePreference();
  }

  getVolume() {
    return this.volume;
  }

  isSoundEnabled() {
    return this.isEnabled;
  }

  // Save preferences to localStorage
  saveSoundPreference() {
    try {
      localStorage.setItem('soundNotifications', this.isEnabled.toString());
    } catch (error) {
      console.warn('Could not save sound preference:', error);
    }
  }

  saveVolumePreference() {
    try {
      localStorage.setItem('soundVolume', this.volume.toString());
    } catch (error) {
      console.warn('Could not save volume preference:', error);
    }
  }

  // Load preferences from localStorage
  getSoundPreference() {
    try {
      const saved = localStorage.getItem('soundNotifications');
      return saved === null ? true : saved === 'true';
    } catch (error) {
      console.warn('Could not load sound preference:', error);
      return true;
    }
  }

  getVolumePreference() {
    try {
      const saved = localStorage.getItem('soundVolume');
      return saved === null ? 0.8 : parseFloat(saved); // Increased default from 0.5 to 0.8
    } catch (error) {
      console.warn('Could not load volume preference:', error);
      return 0.8; // Increased default from 0.5 to 0.8
    }
  }

  // Test sound functionality
  testSound() {
    this.playNotification();
  }
}

// Create a singleton instance
const soundNotification = new SoundNotification();

export default soundNotification; 