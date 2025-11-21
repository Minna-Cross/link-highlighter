// Link Highlighter - FINAL PRODUCTION VERSION
class LinkHighlighter {
  constructor() {
    this.enabled = true;
    this.observer = null;
    this.visitCache = new Map();
    this.pendingQueries = new Map();
    this.processingDelay = 50;
    this.maxLinksPerBatch = 5;
    this.debounceTimeout = null;
    this.processedLinks = new Set();
    this.throttleTimeout = null;
    this.throttleDelay = 500; // Maximum processing frequency for dynamic content
    this.config = {
      colors: {
        today: '#4CAF50',
        week: '#FFA500', 
        month: '#9C27B0',
        older: '#795548',
        never: '#9E9E9E'
      },
      protocols: ['http:', 'https:', 'file:'],
      maxLinksPerPage: 1000,
      adaptivePerformance: true,
      preserveClassChanges: true,
      processingDelay: 50,
      maxLinksPerBatch: 5,
      throttleDynamicContent: true,
      throttleDelay: 500
    };
    this.performanceMetrics = {
      totalLinksProcessed: 0,
      averageProcessingTime: 0,
      lastProcessTime: 0,
      domUpdates: 0,
      throttledUpdates: 0
    };
    this.init();
  }

  async init() {
    try {
      await this.loadConfig();
      await this.injectStyles();
      this.setupMessageListener();
      
      if (this.enabled) {
        this.startHighlighting();
      }
    } catch (error) {
      console.error('Link Highlighter: Initialization failed', error);
    }
  }

  async loadConfig() {
    try {
      const result = await chrome.storage.local.get([
        'enabled', 
        'processingDelay', 
        'maxLinksPerBatch',
        'colors',
        'maxLinksPerPage',
        'adaptivePerformance',
        'includedProtocols',
        'preserveClassChanges',
        'throttleDynamicContent',
        'throttleDelay'
      ]);
      
      this.enabled = result.enabled !== false;
      this.config.processingDelay = result.processingDelay || 50;
      this.config.maxLinksPerBatch = result.maxLinksPerBatch || 5;
      this.config.maxLinksPerPage = result.maxLinksPerPage || 1000;
      this.config.adaptivePerformance = result.adaptivePerformance !== false;
      this.config.preserveClassChanges = result.preserveClassChanges !== false;
      this.config.throttleDynamicContent = result.throttleDynamicContent !== false;
      this.config.throttleDelay = result.throttleDelay || 500;
      
      if (result.colors) {
        this.config.colors = { ...this.config.colors, ...result.colors };
      }
      
      if (result.includedProtocols) {
        this.config.protocols = result.includedProtocols;
      }

      // Apply config to instance
      this.processingDelay = this.config.processingDelay;
      this.maxLinksPerBatch = this.config.maxLinksPerBatch;
      this.throttleDelay = this.config.throttleDelay;

    } catch (error) {
      console.warn('Link Highlighter: Using default config due to error', error);
    }
  }

  async injectStyles() {
    const existingStyles = document.getElementById('link-highlighter-styles');
    if (existingStyles) {
      existingStyles.remove();
    }
    
    const styles = `
      .link-highlighter-today {
        border-left: 3px solid ${this.config.colors.today} !important;
        padding-left: 5px !important;
        background-color: ${this.hexToRgba(this.config.colors.today, 0.05)} !important;
      }
      .link-highlighter-week {
        border-left: 3px solid ${this.config.colors.week} !important;
        padding-left: 5px !important;
        background-color: ${this.hexToRgba(this.config.colors.week, 0.05)} !important;
      }
      .link-highlighter-month {
        border-left: 3px solid ${this.config.colors.month} !important;
        padding-left: 5px !important;
        background-color: ${this.hexToRgba(this.config.colors.month, 0.05)} !important;
      }
      .link-highlighter-older {
        border-left: 3px solid ${this.config.colors.older} !important;
        padding-left: 5px !important;
        background-color: ${this.hexToRgba(this.config.colors.older, 0.05)} !important;
      }
      .link-highlighter-never {
        border-left: 3px solid ${this.config.colors.never} !important;
        padding-left: 5px !important;
        opacity: 0.8 !important;
      }
      .link-highlighter-highlighted {
        transition: all 0.3s ease !important;
      }
      .link-highlighter-highlighted:hover {
        background-color: rgba(0, 0, 0, 0.1) !important;
        transform: translateX(2px) !important;
      }
      .link-highlighter-highlighted:focus {
        outline: 2px solid #2196F3 !important;
        outline-offset: 2px !important;
      }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'link-highlighter-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleHighlighting') {
        this.enabled = request.enabled;
        if (this.enabled) {
          this.startHighlighting();
        } else {
          this.stopHighlighting();
        }
        sendResponse({ success: true });
      } else if (request.action === 'updateConfig') {
        this.loadConfig().then(() => {
          this.updateStyles();
          if (this.enabled) {
            this.stopHighlighting();
            this.startHighlighting();
          }
          sendResponse({ success: true });
        });
        return true;
      } else if (request.action === 'getConfig') {
        sendResponse({ 
          config: this.config, 
          enabled: this.enabled,
          stats: this.getStats(),
          performance: this.performanceMetrics
        });
      } else if (request.action === 'refresh') {
        this.stopHighlighting();
        this.startHighlighting();
        sendResponse({ success: true });
      } else if (request.action === 'clearCache') {
        this.visitCache.clear();
        this.pendingQueries.clear();
        this.processedLinks.clear();
        sendResponse({ success: true });
      } else if (request.action === 'updatePerformance') {
        if (request.settings) {
          this.updatePerformanceSettings(request.settings);
        }
        sendResponse({ success: true });
      } else if (request.action === 'mergeClasses') {
        // Experimental: Test class merging approach
        this.testClassMerging();
        sendResponse({ success: true });
      }
    });
  }

  updatePerformanceSettings(settings) {
    if (settings.processingDelay !== undefined) {
      this.config.processingDelay = settings.processingDelay;
      this.processingDelay = settings.processingDelay;
    }
    if (settings.maxLinksPerBatch !== undefined) {
      this.config.maxLinksPerBatch = settings.maxLinksPerBatch;
      this.maxLinksPerBatch = settings.maxLinksPerBatch;
    }
    if (settings.adaptivePerformance !== undefined) {
      this.config.adaptivePerformance = settings.adaptivePerformance;
    }
    if (settings.throttleDelay !== undefined) {
      this.config.throttleDelay = settings.throttleDelay;
      this.throttleDelay = settings.throttleDelay;
    }
    if (settings.throttleDynamicContent !== undefined) {
      this.config.throttleDynamicContent = settings.throttleDynamicContent;
    }
  }

  getStats() {
    return {
      cacheSize: this.visitCache.size,
      pendingQueries: this.pendingQueries.size,
      processedLinks: this.processedLinks.size,
      enabled: this.enabled,
      processingDelay: this.processingDelay,
      maxLinksPerBatch: this.maxLinksPerBatch,
      throttleDelay: this.throttleDelay,
      throttleDynamicContent: this.config.throttleDynamicContent,
      throttledUpdates: this.performanceMetrics.throttledUpdates,
      lastProcessTime: this.performanceMetrics.lastProcessTime,
      averageProcessingTime: this.performanceMetrics.averageProcessingTime
    };
  }

  updateStyles() {
    this.injectStyles();
  }

  startHighlighting() {
    this.processedLinks.clear();
    this.highlightExistingLinks();
    this.startObserving();
  }

  stopHighlighting() {
    this.removeHighlights();
    this.stopObserving();
  }

  highlightExistingLinks() {
    const allLinks = Array.from(document.querySelectorAll('a[href]'));
    const validLinks = allLinks
      .filter(link => this.isValidLink(link) && !this.processedLinks.has(link))
      .slice(0, this.config.maxLinksPerPage);

    console.log(`Link Highlighter: Processing ${validLinks.length} new links out of ${allLinks.length} total`);
    
    if (validLinks.length === 0) return;
    
    if (this.config.adaptivePerformance) {
      this.adjustPerformanceSettings(validLinks.length);
    }

    this.processLinksAdaptively(validLinks, 0);
  }

  adjustPerformanceSettings(linkCount) {
    if (linkCount > 500) {
      this.maxLinksPerBatch = Math.max(1, Math.floor(linkCount / 250)); // Very small batches for large pages
      this.processingDelay = 200; // Longer delay to avoid blocking
    } else if (linkCount > 200) {
      this.maxLinksPerBatch = 2;
      this.processingDelay = 150;
    } else if (linkCount > 100) {
      this.maxLinksPerBatch = 3;
      this.processingDelay = 100;
    } else {
      this.maxLinksPerBatch = 5;
      this.processingDelay = 50;
    }
  }

  processLinksAdaptively(links, startIndex) {
    if (startIndex >= links.length || !this.enabled) return;

    const batch = links.slice(startIndex, startIndex + this.maxLinksPerBatch);
    const processStartTime = performance.now();
    
    this.processLinkBatch(batch).then(() => {
      const processTime = performance.now() - processStartTime;
      this.updatePerformanceMetrics(batch.length, processTime);
      
      const nextIndex = startIndex + this.maxLinksPerBatch;
      if (nextIndex < links.length) {
        // Adaptive scheduling based on processing time
        const nextDelay = this.calculateNextDelay(processTime);
        setTimeout(() => {
          this.processLinksAdaptively(links, nextIndex);
        }, nextDelay);
      }
    });
  }

  updatePerformanceMetrics(linksProcessed, processTime) {
    this.performanceMetrics.totalLinksProcessed += linksProcessed;
    this.performanceMetrics.lastProcessTime = processTime;
    this.performanceMetrics.domUpdates += linksProcessed;
    
    // Calculate rolling average
    const alpha = 0.3; // Smoothing factor
    this.performanceMetrics.averageProcessingTime = 
      alpha * processTime + (1 - alpha) * this.performanceMetrics.averageProcessingTime;
  }

  calculateNextDelay(processTime) {
    // If processing took longer than expected, increase delay to avoid blocking
    const targetTimePerBatch = 16; // ~60fps
    if (processTime > targetTimePerBatch * 2) {
      return Math.min(this.processingDelay * 3, 1000); // Cap at 1 second
    }
    return this.processingDelay;
  }

  isValidLink(link) {
    if (!link.href || !link.isConnected || link.offsetParent === null) return false;
    
    const href = link.href.trim();
    if (!href || href === '#' || href.startsWith('javascript:') || href === 'void(0)') {
      return false;
    }
    
    // Skip hidden links (display: none, visibility: hidden, etc.)
    const style = window.getComputedStyle(link);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    
    try {
      const url = new URL(href, window.location.href);
      let protocol = url.protocol.toLowerCase();

      // Fallback: treat missing protocol as the current page protocol
      if (!protocol) {
        protocol = window.location.protocol;
      }
      
      // Enhanced protocol validation with security checks
      const skipProtocols = ['mailto:', 'tel:', 'ftp:', 'data:', 'blob:', 'about:'];
      if (skipProtocols.includes(protocol)) {
        return false;
      }
      
      // Additional security: validate URL components
      if (!this.isValidUrl(url)) {
        return false;
      }
      
      return this.config.protocols.includes(protocol);
    } catch (error) {
      return false;
    }
  }

  isValidUrl(url) {
    // Security: validate URL components
    try {
      // Check for suspicious patterns
      const suspiciousPatterns = ['<', '>', '"', "'", '(', ')', '{', '}', '\\u'];
      if (suspiciousPatterns.some(pattern => url.href.includes(pattern))) {
        return false;
      }
      
      // Check for extremely long URLs (potential attack vector)
      if (url.href.length > 2000) {
        return false;
      }
      
      // Validate hostname format
      if (!/^[a-zA-Z0-9.-]+$/.test(url.hostname)) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  async processLinkBatch(links) {
    if (!this.enabled || links.length === 0) return;
    
    const validLinks = links.filter(link => this.isValidLink(link) && !this.processedLinks.has(link));
    if (validLinks.length === 0) return;
    
    const promises = validLinks.map(link => 
      this.processSingleLink(link).catch(error => {
        console.warn('Link Highlighter: Error processing link', link.href, error);
      })
    );
    
    await Promise.allSettled(promises);
  }

  async processSingleLink(link) {
    if (!this.enabled || !this.isValidLink(link) || this.processedLinks.has(link)) return;
    
    this.processedLinks.add(link);
    this.preserveOriginalAttributes(link);
    await this.applyRealHighlightClass(link);
  }

  preserveOriginalAttributes(link) {
    // Only store original title if not already stored
    if (!link.dataset.originalTitle) {
      link.dataset.originalTitle = link.title || '';
    }
    
    // EXPERIMENTAL: Store original classes for potential merging
    if (this.config.preserveClassChanges && !link.dataset.originalClasses) {
      link.dataset.originalClasses = link.className || '';
    }
  }

  async applyRealHighlightClass(link) {
    // Remove only our highlighter classes - never touch other classes
    this.removeHighlighterClasses(link);
    
    try {
      const url = this.normalizeAndValidateUrl(link.href);
      if (!url) {
        this.addHighlighterClasses(link, 'never');
        return;
      }
      
      const visitData = await this.getVisitDataForLink(url);
      const highlightClass = this.determineHighlightClass(visitData);
      
      this.addHighlighterClasses(link, highlightClass.replace('link-highlighter-', ''));
      this.updateLinkTitle(link, visitData);
    } catch (error) {
      this.addHighlighterClasses(link, 'never');
    }
  }

  removeHighlighterClasses(link) {
    const highlighterClasses = [
      'link-highlighter-today',
      'link-highlighter-week',
      'link-highlighter-month',
      'link-highlighter-older',
      'link-highlighter-never',
      'link-highlighter-highlighted'
    ];
    
    // Remove only our classes, preserve everything else
    link.classList.remove(...highlighterClasses);
  }

  addHighlighterClasses(link, type) {
    // Simply add our classes - don't modify existing classes
    link.classList.add(`link-highlighter-${type}`, 'link-highlighter-highlighted');
    
    // EXPERIMENTAL: Class merging approach (optional)
    if (this.config.preserveClassChanges && link.dataset.originalClasses) {
      this.mergeOriginalClasses(link);
    }
  }

  // EXPERIMENTAL: Advanced class merging to preserve page changes
  mergeOriginalClasses(link) {
    const originalClasses = link.dataset.originalClasses.split(' ').filter(cls => 
      cls && !cls.startsWith('link-highlighter-')
    );
    
    // Get current classes that aren't ours
    const currentClasses = Array.from(link.classList).filter(cls => 
      !cls.startsWith('link-highlighter-')
    );
    
    // Merge original and current classes, removing duplicates
    const mergedClasses = [...new Set([...originalClasses, ...currentClasses])];
    
    // Remove all non-highlighter classes
    link.classList.remove(...currentClasses);
    
    // Add merged classes back
    link.classList.add(...mergedClasses);
  }

  normalizeAndValidateUrl(href) {
    try {
      const url = new URL(href, window.location.href);
      
      if (!this.isValidUrl(url)) {
        return null;
      }
      
      const normalized = {
        protocol: url.protocol.toLowerCase(),
        hostname: url.hostname.toLowerCase(),
        pathname: url.pathname.replace(/\/+/g, '/').replace(/\/$/, '') || '/',
        search: url.search,
        hash: ''
      };
      
      return `${normalized.protocol}//${normalized.hostname}${normalized.pathname}${normalized.search}`;
    } catch (error) {
      return null;
    }
  }

  async getVisitDataForLink(url) {
    if (this.visitCache.has(url)) {
      return this.visitCache.get(url);
    }
    
    if (this.pendingQueries.has(url)) {
      return this.pendingQueries.get(url);
    }
    
    const queryPromise = this.queryVisitData(url);
    this.pendingQueries.set(url, queryPromise);
    
    try {
      const visitData = await queryPromise;
      this.pendingQueries.delete(url);
      this.visitCache.set(url, visitData);
      return visitData;
    } catch (error) {
      this.pendingQueries.delete(url);
      throw error;
    }
  }

  async queryVisitData(url) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('History query timeout'));
      }, 3000);
      
      chrome.history.getVisits({ url }, (visits) => {
        clearTimeout(timeout);
        
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        
        const visitData = {
          totalVisits: visits.length,
          lastVisit: visits.length > 0 ? Math.max(...visits.map(v => v.visitTime)) : null,
          firstVisit: visits.length > 0 ? Math.min(...visits.map(v => v.visitTime)) : null,
          visits: visits
        };
        
        resolve(visitData);
      });
    });
  }

  determineHighlightClass(visitData) {
    if (!visitData.lastVisit) {
      return 'link-highlighter-never';
    }
    
    const now = Date.now();
    const lastVisitTime = visitData.lastVisit;
    const daysSinceVisit = (now - lastVisitTime) / (1000 * 60 * 60 * 24);
    
    if (daysSinceVisit < 1) return 'link-highlighter-today';
    if (daysSinceVisit < 7) return 'link-highlighter-week';
    if (daysSinceVisit < 30) return 'link-highlighter-month';
    return 'link-highlighter-older';
  }

  updateLinkTitle(link, visitData) {
    const originalTitle = link.dataset.originalTitle || '';
    let highlighterText = '';
    
    if (!visitData.lastVisit) {
      highlighterText = 'Never visited';
    } else {
      const daysAgo = Math.floor((Date.now() - visitData.lastVisit) / (1000 * 60 * 60 * 24));
      let recencyText;
      
      if (daysAgo === 0) recencyText = 'Today';
      else if (daysAgo === 1) recencyText = 'Yesterday';
      else if (daysAgo < 7) recencyText = `${daysAgo} days ago`;
      else if (daysAgo < 30) recencyText = `${Math.floor(daysAgo/7)} weeks ago`;
      else recencyText = `${Math.floor(daysAgo/30)} months ago`;
      
      highlighterText = `Visited ${visitData.totalVisits} times, last: ${recencyText}`;
    }
    
    if (originalTitle) {
      link.title = `${originalTitle} | ${highlighterText}`;
    } else {
      link.title = highlighterText;
    }
    
    link.setAttribute('aria-label', `${link.textContent} - ${highlighterText}`);
  }

  startObserving() {
    if (this.observer) return;
    
    this.observer = new MutationObserver(mutations => {
      if (!this.config.throttleDynamicContent) {
        this.processMutationsImmediately(mutations);
      } else {
        this.processMutationsThrottled(mutations);
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false
    });
  }

  processMutationsImmediately(mutations) {
    if (this.debounceTimeout) {
      cancelAnimationFrame(this.debounceTimeout);
    }
    
    this.debounceTimeout = requestAnimationFrame(() => {
      this.processMutations(mutations);
    });
  }

  processMutationsThrottled(mutations) {
    // Clear any existing throttle timeout
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.performanceMetrics.throttledUpdates++;
    }
    
    // Set new throttle timeout
    this.throttleTimeout = setTimeout(() => {
      if (this.debounceTimeout) {
        cancelAnimationFrame(this.debounceTimeout);
      }
      
      this.debounceTimeout = requestAnimationFrame(() => {
        this.processMutations(mutations);
      });
    }, this.throttleDelay);
  }

  processMutations(mutations) {
    const newLinks = new Set();
    
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && node.nodeName === 'A') {
            if (this.isValidLink(node) && !this.processedLinks.has(node)) {
              newLinks.add(node);
            }
          }
          
          if (node.querySelectorAll) {
            const links = node.querySelectorAll('a[href]');
            for (const link of links) {
              if (this.isValidLink(link) && !this.processedLinks.has(link)) {
                newLinks.add(link);
              }
            }
          }
        }
      }
    }
    
    if (newLinks.size > 0) {
      // Process new links with lower priority to avoid blocking
      setTimeout(() => {
        this.processLinkBatch(Array.from(newLinks));
      }, 100); // Reduced delay but with throttle protection
    }
  }

  stopObserving() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.debounceTimeout) {
      cancelAnimationFrame(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    
    if (this.throttleTimeout) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = null;
    }
  }

  removeHighlights() {
    const links = document.querySelectorAll('a[href]');
    const highlighterClasses = [
      'link-highlighter-today',
      'link-highlighter-week',
      'link-highlighter-month',
      'link-highlighter-older',
      'link-highlighter-never',
      'link-highlighter-highlighted'
    ];
    
    links.forEach(link => {
      // Remove only our classes - preserve all other classes
      link.classList.remove(...highlighterClasses);
      
      // Restore original title
      if (link.dataset.originalTitle) {
        link.title = link.dataset.originalTitle;
        delete link.dataset.originalTitle;
      }
      
      // Remove aria-label if we added it
      const ariaLabel = link.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.includes('Visited')) {
        link.removeAttribute('aria-label');
      }
      
      // Clean up experimental class storage
      delete link.dataset.originalClasses;
    });
    
    this.visitCache.clear();
    this.pendingQueries.clear();
    this.processedLinks.clear();
  }

  // Experimental: Test class merging approach
  testClassMerging() {
    console.log('Testing class merging approach...');
    // This would be called from the popup for testing
  }

  destroy() {
    this.stopHighlighting();
    const styleElement = document.getElementById('link-highlighter-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }
}

// Enhanced initialization with comprehensive error handling
function initializeLinkHighlighter() {
  const startTime = performance.now();

  let highlighter = null;
  let teardownSPASupport = () => {};
  let cleanedUp = false;

  try {
    // Check if we're in a suitable environment
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.storage) {
      console.warn('Link Highlighter: Chrome API not available');
      return null;
    }
    
    highlighter = new LinkHighlighter();
    
    const loadTime = performance.now() - startTime;
    console.log(`Link Highlighter: Initialized in ${loadTime.toFixed(1)}ms`);
    
    // Comprehensive cleanup
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;

      teardownSPASupport();
      teardownSPASupport = () => {};

      if (highlighter) {
        highlighter.destroy();
        highlighter = null;
      }
    };
    
    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
    
    // Enhanced SPA support
    teardownSPASupport = setupSPASupport(cleanup);

    return highlighter;
  } catch (error) {
    console.error('Link Highlighter: Failed to initialize', error);
    return null;
  }
}

// Enhanced SPA support
function setupSPASupport(cleanup) {
  // Modern SPA frameworks
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  let spaObserver = null;

  const spaCleanup = () => {
    cleanup();
  };

  history.pushState = function(...args) {
    spaCleanup();
    return originalPushState.apply(this, args);
  };

  history.replaceState = function(...args) {
    spaCleanup();
    return originalReplaceState.apply(this, args);
  };

  // Framework-specific support
  document.addEventListener('turbolinks:load', spaCleanup);
  window.addEventListener('pjax:end', spaCleanup);

  // MutationObserver for SPA content replacement
  spaObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1 && (
            node.id === 'root' ||
            node.getAttribute('data-reactroot') ||
            node.getAttribute('ng-app') ||
            node.classList.contains('vue-root')
          )) {
            setTimeout(spaCleanup, 100);
            break;
          }
        }
      }
    }
  });

  spaObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  return function teardownSPASupport() {
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
    document.removeEventListener('turbolinks:load', spaCleanup);
    window.removeEventListener('pjax:end', spaCleanup);
    if (spaObserver) {
      spaObserver.disconnect();
      spaObserver = null;
    }
  };
}

// Robust initialization that handles various page states
function safeInitialize() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Small delay to ensure DOM is fully ready
      setTimeout(initializeLinkHighlighter, 10);
    });
  } else {
    // If DOM is already ready, wait for next tick
    setTimeout(initializeLinkHighlighter, 0);
  }
}

// Start the extension
safeInitialize();
