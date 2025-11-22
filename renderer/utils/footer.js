/**
 * Footer loader utility
 * Loads the footer HTML into the page dynamically
 */

(function() {
  'use strict';

  /**
   * Loads the footer component into a container
   * @param {string} containerId - The ID of the container element (optional)
   */
  function loadFooter(containerId = 'footer-container') {
    const container = containerId ? document.getElementById(containerId) : document.body;
    
    if (!container) {
      console.warn(`[footer.js] Container with ID "${containerId}" not found, appending to body`);
    }

    // Fetch and insert footer
    fetch('footer.html')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load footer: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        if (container) {
          container.innerHTML = html;
        } else {
          // Append to body if no container found
          const footerDiv = document.createElement('div');
          footerDiv.innerHTML = html;
          document.body.appendChild(footerDiv.firstElementChild);
        }
      })
      .catch(error => {
        console.error('[footer.js] Error loading footer:', error);
      });
  }

  // Auto-load footer when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => loadFooter());
  } else {
    loadFooter();
  }

  // Expose to window for manual loading if needed
  window.loadFooter = loadFooter;
})();
