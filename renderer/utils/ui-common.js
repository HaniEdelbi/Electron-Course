// Shared UI logic for Warframe Market Price Monitor
// Handles hamburger/side menu and platform dropdown for all pages

document.addEventListener('DOMContentLoaded', () => {
  // Hamburger/side menu (left)
  const hamburgerMenu = document.getElementById('hamburger-menu');
  const sidePanel = document.getElementById('side-panel');
  const sidePanelClose = document.getElementById('side-close');
  if (hamburgerMenu && sidePanel && sidePanelClose) {
    hamburgerMenu.addEventListener('click', () => {
      sidePanel.classList.add('open');
    });
    sidePanelClose.addEventListener('click', () => {
      sidePanel.classList.remove('open');
    });
    document.addEventListener('click', (e) => {
      if (
        sidePanel.classList.contains('open') &&
        !sidePanel.contains(e.target) &&
        !hamburgerMenu.contains(e.target)
      ) {
        sidePanel.classList.remove('open');
      }
    });
  }

  // Right side menu (for price-monitor.html)
  const menuToggle = document.querySelector('.wm-menu-toggle');
  const sideMenu = document.getElementById('wm-side-menu');
  const sideClose = document.getElementById('wm-side-close');
  if (menuToggle && sideMenu && sideClose) {
    menuToggle.addEventListener('click', () => {
      sideMenu.classList.add('open');
    });
    sideClose.addEventListener('click', () => {
      sideMenu.classList.remove('open');
    });
    document.addEventListener('click', (e) => {
      if (
        sideMenu.classList.contains('open') &&
        !sideMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
      ) {
        sideMenu.classList.remove('open');
      }
    });
  }

  // Platform dropdown
  const platformBtn = document.querySelector('.wm-platform-btn');
  const platformDropdown = document.querySelector('.wm-platform-dropdown');
  if (platformBtn && platformDropdown) {
    platformBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      platformDropdown.classList.toggle('open');
    });
    platformDropdown.addEventListener('click', (e) => {
      if (e.target.tagName === 'LI') {
        platformBtn.querySelector('span').textContent = e.target.textContent;
        platformDropdown.classList.remove('open');
      }
    });
    document.addEventListener('click', (e) => {
      if (
        !platformBtn.contains(e.target) &&
        !platformDropdown.contains(e.target)
      ) {
        platformDropdown.classList.remove('open');
      }
    });
  }
});