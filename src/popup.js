// Enhanced popup.js with advanced features
document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const statusDiv = document.getElementById('status');
  const refreshBtn = document.getElementById('refreshBtn');
  const clearCacheBtn = document.getElementById('clearCacheBtn');
  const advancedToggle = document.getElementById('advancedToggle');
  const advancedSettings = document.getElementById('advancedSettings');
  
  try {
    // Load current settings
    const result = await chrome.storage.local.get(['enabled']);
    enableToggle.checked = result.enabled !== false;
    
    // Get extension stats
    await updateStats();
    
  } catch (error) {
    console.warn('Failed to load settings:', error);
    enableToggle.checked = true;
    showStatus('Error loading settings', 'error');
  }

  // Toggle highlighting
  enableToggle.addEventListener('change', async () => {
    try {
      await chrome.storage.local.set({ enabled: enableToggle.checked });
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'toggleHighlighting', 
        enabled: enableToggle.checked 
      });
      
      if (response && response.success) {
        showStatus(`Highlighting ${enableToggle.checked ? 'enabled' : 'disabled'}`, 'success');
      }
      
      // Update stats after toggle
      await updateStats();
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      showStatus('Failed to update settings', 'error');
    }
  });

  // Refresh highlighting
  refreshBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'refresh'
      });
      
      if (response && response.success) {
        showStatus('Links refreshed', 'success');
        await updateStats();
      }
    } catch (error) {
      console.error('Refresh failed:', error);
      showStatus('Refresh failed', 'error');
    }
  });

  // Clear cache
  clearCacheBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'clearCache'
      });
      
      if (response && response.success) {
        showStatus('Cache cleared', 'success');
        await updateStats();
      }
    } catch (error) {
      console.error('Clear cache failed:', error);
      showStatus('Clear cache failed', 'error');
    }
  });

  // Toggle advanced settings
  advancedToggle.addEventListener('change', () => {
    advancedSettings.style.display = advancedToggle.checked ? 'block' : 'none';
  });

  // Update performance settings
  document.getElementById('applySettings').addEventListener('click', async () => {
    try {
      const settings = {
        processingDelay: parseInt(document.getElementById('processingDelay').value) || 50,
        maxLinksPerBatch: parseInt(document.getElementById('maxLinksPerBatch').value) || 5,
        throttleDynamicContent: document.getElementById('throttleDynamicContent').checked,
        throttleDelay: parseInt(document.getElementById('throttleDelay').value) || 500
      };

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'updatePerformance',
        settings: settings
      });
      
      if (response && response.success) {
        showStatus('Performance settings updated', 'success');
        await updateStats();
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      showStatus('Failed to update settings', 'error');
    }
  });

  // Get extension stats
  async function updateStats() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { 
        action: 'getConfig'
      });
      
      if (response) {
        updateStatsDisplay(response);
      }
    } catch (error) {
      console.warn('Could not get stats:', error);
      // This is normal if the content script isn't loaded on the page
    }
  }

  function updateStatsDisplay(data) {
    const statsDiv = document.getElementById('stats');
    if (!statsDiv) return;
    
    if (data.stats) {
      statsDiv.innerHTML = `
        <div style="font-size: 12px; color: #666; margin-top: 10px;">
          <strong>Stats:</strong><br>
          Cache: ${data.stats.cacheSize} URLs<br>
          Processed: ${data.stats.processedLinks} links<br>
          Delay: ${data.stats.processingDelay}ms<br>
          Batch: ${data.stats.maxLinksPerBatch} links
        </div>
      `;
    }
  }

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
    
    setTimeout(() => {
      statusDiv.style.display = 'none';
    }, 3000);
  }
});
