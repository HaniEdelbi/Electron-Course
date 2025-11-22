// Notifications utility for Warframe Market Price Monitor
// Handles desktop notifications and sound alerts

class NotificationManager {
  constructor() {
    this.soundEnabled = false;
    this.notificationsEnabled = false;
    this.audioContext = null;
    this.loadSettings();
    this.requestPermission();
    this.initializeAudio();
  }

  // Initialize audio context after user interaction
  initializeAudio() {
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
          }
        } catch (error) {
          console.warn('Could not initialize audio context:', error);
        }
      }
    }, { once: true });
  }

  // Load notification settings from localStorage
  loadSettings() {
    const saved = localStorage.getItem('warframe-monitor-settings');
    const defaultSettings = {
      enableNotifications: true,
      enableSounds: false
    };
    const settings = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    
    this.notificationsEnabled = settings.enableNotifications;
    this.soundEnabled = settings.enableSounds;
  }

  // Request notification permission from the browser
  async requestPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }

  // Check if notifications are available and enabled
  canShowNotifications() {
    return (
      this.notificationsEnabled &&
      'Notification' in window &&
      Notification.permission === 'granted'
    );
  }

  // Play notification sound
  playSound() {
    if (!this.soundEnabled) return;
    
    try {
      // Use existing audio context or create new one
      let audioContext = this.audioContext;
      
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioContext = audioContext;
      }
      
      // Resume audio context if it's suspended (required after user interaction)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          this.createBeepSound(audioContext);
        });
      } else {
        this.createBeepSound(audioContext);
      }
    } catch (error) {
      console.warn('Web Audio API failed, trying fallback sound:', error);
      this.playFallbackSound();
    }
  }

  // Create beep sound with Web Audio API
  createBeepSound(audioContext) {
    try {
      // Use existing audio context if available
      const ctx = this.audioContext || audioContext;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      // Create a more noticeable beep
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.type = 'sine';
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.warn('Beep sound creation failed:', error);
      this.playFallbackSound();
    }
  }

  // Fallback sound using HTML Audio element
  playFallbackSound() {
    try {
      // Create a simple tone using data URI
      const frequencies = [800, 1000, 800];
      let delay = 0;
      
      frequencies.forEach(freq => {
        setTimeout(() => {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
          
          oscillator.type = 'sine';
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.1);
        }, delay);
        delay += 100;
      });
    } catch (error) {
      console.warn('All sound methods failed:', error);
      // Try system beep as absolute last resort
      if (window.require) {
        try {
          const { shell } = window.require('electron');
          shell.beep();
        } catch (e) {
          console.warn('System beep also failed:', e);
        }
      }
    }
  }

  // Show price alert notification
  showPriceAlert(itemName, price, type = 'sell', inRange = false) {
    this.loadSettings(); // Refresh settings in case they changed
    
    if (!this.canShowNotifications()) return;

    const title = inRange 
      ? `💰 Price Alert - ${itemName}`
      : `📈 New ${type === 'sell' ? 'Sell' : 'Buy'} Order - ${itemName}`;
    
    const body = inRange
      ? `Found ${type === 'sell' ? 'sell' : 'buy'} order for ${price}p (within your price range!)`
      : `New ${type === 'sell' ? 'sell' : 'buy'} order available for ${price}p`;

    const notification = new Notification(title, {
      body: body,
      icon: '../images/tray-icon.webp', // Use your tray icon
      badge: '../images/tray-icon.webp',
      requireInteraction: inRange, // Keep important alerts visible longer
      silent: !this.soundEnabled,
      tag: `price-alert-${itemName}-${type}` // Prevent duplicate notifications
    });

    // Auto-close after 5 seconds (unless requireInteraction is true)
    if (!inRange) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Play sound if enabled
    if (inRange) {
      this.playSound();
    }

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Show general info notification
  showInfo(title, message, duration = 3000) {
    this.loadSettings();
    
    if (!this.canShowNotifications()) return;

    const notification = new Notification(title, {
      body: message,
      icon: '../images/tray-icon.webp',
      silent: true,
      tag: 'info-notification'
    });

    setTimeout(() => {
      notification.close();
    }, duration);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Check if orders match user's price criteria
  checkPriceAlerts(orders, itemName, minPrice = null, maxPrice = null) {
    if (!orders || orders.length === 0) return;

    orders.forEach(order => {
      const price = order.platinum;
      const type = order.order_type; // 'sell' or 'buy'
      
      let inRange = false;
      
      if (type === 'sell') {
        // For sell orders, alert if price is within our buying range
        if (minPrice !== null && maxPrice !== null) {
          inRange = price >= minPrice && price <= maxPrice;
        } else if (maxPrice !== null) {
          inRange = price <= maxPrice;
        } else if (minPrice !== null) {
          inRange = price >= minPrice;
        }
      } else if (type === 'buy') {
        // For buy orders, alert if price is good for selling
        if (minPrice !== null) {
          inRange = price >= minPrice;
        }
      }

      if (inRange) {
        this.showPriceAlert(itemName, price, type, true);
      }
    });
  }
}

// Create global notification manager
window.notificationManager = new NotificationManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}