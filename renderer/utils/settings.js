// Settings page JavaScript - handles saving/loading settings to localStorage
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings-form');
  const resetBtn = document.getElementById('reset-settings');

  // Default settings
  const defaultSettings = {
    refreshInterval: 30,
    enableNotifications: true,
    enableSounds: false,
    defaultPlatform: 'pc',
    ordersPerColumn: 10,
    theme: 'dark',
    hideOffline: true,
    verifiedOnly: false,
    defaultMinPrice: '',
    defaultMaxPrice: '',
    minimizeToTray: true,
    startMinimized: false
  };

  // Load settings from localStorage
  function loadSettings() {
    const saved = localStorage.getItem('warframe-monitor-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  }

  // Save settings to localStorage
  function saveSettings(settings) {
    localStorage.setItem('warframe-monitor-settings', JSON.stringify(settings));
  }

  // Apply settings to form
  function applySettingsToForm(settings) {
    document.getElementById('refresh-interval').value = settings.refreshInterval;
    document.getElementById('enable-notifications').checked = settings.enableNotifications;
    document.getElementById('enable-sounds').checked = settings.enableSounds;
    document.getElementById('default-platform').value = settings.defaultPlatform;
    document.getElementById('orders-per-column').value = settings.ordersPerColumn;
    document.getElementById('theme').value = settings.theme;
    document.getElementById('hide-offline').checked = settings.hideOffline;
    document.getElementById('verified-only').checked = settings.verifiedOnly;
    document.getElementById('default-min-price').value = settings.defaultMinPrice;
    document.getElementById('default-max-price').value = settings.defaultMaxPrice;
    document.getElementById('minimize-to-tray').checked = settings.minimizeToTray;
    document.getElementById('start-minimized').checked = settings.startMinimized;
  }

  // Get settings from form
  function getSettingsFromForm() {
    return {
      refreshInterval: parseInt(document.getElementById('refresh-interval').value),
      enableNotifications: document.getElementById('enable-notifications').checked,
      enableSounds: document.getElementById('enable-sounds').checked,
      defaultPlatform: document.getElementById('default-platform').value,
      ordersPerColumn: parseInt(document.getElementById('orders-per-column').value),
      theme: document.getElementById('theme').value,
      hideOffline: document.getElementById('hide-offline').checked,
      verifiedOnly: document.getElementById('verified-only').checked,
      defaultMinPrice: document.getElementById('default-min-price').value,
      defaultMaxPrice: document.getElementById('default-max-price').value,
      minimizeToTray: document.getElementById('minimize-to-tray').checked,
      startMinimized: document.getElementById('start-minimized').checked
    };
  }

  // Show feedback message
  function showFeedback(message, type = 'success') {
    // Remove existing feedback
    const existing = document.querySelector('.feedback-message');
    if (existing) existing.remove();

    const feedback = document.createElement('div');
    feedback.className = `feedback-message feedback-${type}`;
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      transition: opacity 0.3s ease;
      background: ${type === 'success' ? '#00bdf4' : '#ff5f7a'};
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.style.opacity = '0';
      setTimeout(() => feedback.remove(), 300);
    }, 3000);
  }

  // Initialize form with saved settings
  const currentSettings = loadSettings();
  applySettingsToForm(currentSettings);

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const settings = getSettingsFromForm();
    saveSettings(settings);
    showFeedback('Settings saved successfully!');
    
    console.log('Settings saved:', settings);
  });

  // Handle reset to defaults
  resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      applySettingsToForm(defaultSettings);
      saveSettings(defaultSettings);
      showFeedback('Settings reset to defaults');
    }
  });

  // Test notification functionality
  const testNotificationBtn = document.getElementById('test-notifications');
  const testSoundBtn = document.getElementById('test-sound');

  if (testNotificationBtn) {
    testNotificationBtn.addEventListener('click', () => {
      if (window.notificationManager) {
        window.notificationManager.showPriceAlert(
          'Rubico Prime Set', 
          150, 
          'sell', 
          true
        );
      } else {
        showFeedback('Notification system not available', 'error');
      }
    });
  }

  if (testSoundBtn) {
    testSoundBtn.addEventListener('click', () => {
      if (window.notificationManager) {
        window.notificationManager.playSound();
      } else {
        showFeedback('Sound system not available', 'error');
      }
    });
  }
});

// Export function to get current settings for use in other modules
window.getSettings = function() {
  const saved = localStorage.getItem('warframe-monitor-settings');
  const defaultSettings = {
    refreshInterval: 30,
    enableNotifications: true,
    enableSounds: false,
    defaultPlatform: 'pc',
    ordersPerColumn: 10,
    theme: 'dark',
    hideOffline: true,
    verifiedOnly: false,
    defaultMinPrice: '',
    defaultMaxPrice: '',
    minimizeToTray: true,
    startMinimized: false
  };
  return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
};
