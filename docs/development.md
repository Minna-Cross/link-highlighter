# 🔍 Development Guide

Comprehensive guide for developers working on the Link Highlighter extension.

## 📚 Table of Contents
- [🚀 Quick Start](#-quick-start)
- [📁 Project Architecture](#-project-architecture)
- [🔧 Core Components](#-core-components)
- [🛠️ Development Setup](#️-development-setup)
- [🔄 Development Workflow](#-development-workflow)
- [🪰 Debugging](#-debugging)
- [🌐 Browser Considerations](#-browser-specific-considerations)
- [⚡ Performance](#-performance-optimization)
- [🔒 Security](#-security--privacy)
- [📊 Configuration](#-advanced-configuration)
- [🧪 Testing](#-testing-strategies)
- [🚀 Build](#-build-process)
- [🤝 Contributing](#-contributing)
- [🔄 Release](#-release-process)
- [🆘 Troubleshooting](#-troubleshooting)


## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/yourusername/link-highlighter.git
cd link-highlighter

# Load in browser (Chrome/Edge)
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the project folder
```

## 📁 Project Architecture
```bash
src/
├── manifest.json          # Extension configuration
├── content.js             # Main content script (90% of logic)
├── popup.html             # Popup user interface
├── popup.js               # Popup functionality
└── icons/                 # Extension icons
```

## 🔧 Core Components

### content.js - Main Logic

```mermaid
A   [User clicks link]  --> B {Visited before?}
                            B -->   |Yes| C [Highlight link]
                            B -->   |No | D [Leave default style]
```
#### Responsibilities:
- Link highlighting based on browser history
- Performance optimization and caching
- Dynamic content handling (MutationObserver)
- Cross-browser compatibility

#### Key Features:
- Adaptive batching: Processes links in configurable batches
- Memory management: Caches visit data for performance
- SPA support: Handles dynamic page changes
- Error handling: Graceful degradation on errors
- popup.html/js - User Interface

#### Features:
- Enable/disable toggle
- Performance statistics
- Cache management
- Advanced configuration
- manifest.json - Extension Configuration

#### Key permissions:
- history: Access browser history for visit data
- activeTab: Access current tab content
- storage: Save user preferences

## 🛠️ Development Setup

### Prerequisites
- Chrome, Firefox, or Edge browser
- Basic knowledge of JavaScript and browser extensions

### Loading the Extension

#### Chrome/Edge:
- Visit chrome://extensions/
- Enable "Developer mode"
- Click "Load unpacked"
- Select your project folder

#### Firefox:
- Visit about:debugging
- Click "This Firefox"
- Click "Load Temporary Add-on"
- Select any file in your project

## 🔄 Development Workflow

### Making Changes
- Edit files in the src/ directory
- Reload extension in browser (no need to reload page)
- Test changes on various websites
- Use browser devtools for debugging

## 🪰 Debugging
```java
// Add debug statements
console.log('Link Highlighter:', message);

// Inspect extension background
chrome://extensions/ > Extension ID > "background page"

// Content script logs
DevTools > Console > Filter by "Link Highlighter"
```

```
⚠️ Note: Firefox uses Manifest V2/V3 with slight differences.
✅ Tip: Reload the extension after editing `src/` files.
```
### Testing Checklist
- Test on static HTML pages
- Test on dynamic sites (React, Vue, etc.)
- Test with large numbers of links
- Test browser navigation (back/forward)
- Test privacy-sensitive pages (banking, etc.)

## 🌐 Browser-Specific Considerations
### Chrome/Edge (Manifest V3)
- Uses service workers for background processes
- Limited to Manifest V3 features
- Best performance and integration

### Firefox (WebExtensions)
Compatible with Chrome APIs
Minor Manifest V2/V3 differences
Good cross-browser compatibility

## ⚡ Performance Optimization
### Link Processing
- Batching: Processes links in configurable batches (1-10 links)
- Debouncing: Avoids excessive DOM updates
- Caching: Stores visit data to minimize API calls
- Adaptive delays: Adjusts timing based on page complexity

### Memory Management
- Cache limits: Prevents memory leaks
- Cleanup: Properly removes event listeners
- SPA handling: Detects and handles page navigation

## 🔒 Security & Privacy

### Data Handling
- Local processing: All history queries happen locally
- No external calls: No data leaves the browser
- Minimum permissions: Only requests necessary APIs

### URL Validation
- Protocol filtering: Only processes http/https/file protocols
- Malicious URL detection: Basic pattern matching
- Length limits: Prevents processing extremely long URLs

## 📊 Advanced Configuration
### Performance Settings

```java
// Available in popup advanced settings
{
  processingDelay: 50,             // ms between batches
  maxLinksPerBatch: 5,            // links processed per batch
  throttleDynamicContent: true,  // throttle DOM updates
  throttleDelay: 500            // ms throttle delay
}
```
### Customization Options
- Color schemes for different visit times
- Protocol allowlist for link processing
- Performance tuning parameters
- Accessibility settings

## 🧪 Testing Strategies
### Manual Testing
- Basic functionality: Visit Wikipedia and test link highlighting
- Dynamic content: Test on Twitter, Reddit, or news sites
- Performance: Pages with 100+ links
- Edge cases: Hidden links, malformed URLs, iframes

### Automated Testing (Future)
```java
// Potential test structure
describe('Link Highlighter', () => {
  it('should highlight visited links', () => {});
  it('should handle dynamic content', () => {});
  it('should respect user preferences', () => {});
});
```

## 🚀 Build Process
### Manual Packaging
```bash
# Create distribution ZIP
zip -r link-highlighter.zip src/ -x ".*" "__*"
```

### Chrome Web Store
- Pack extension in Chrome
- Upload ZIP to developer dashboard
- Submit for review

### Firefox Add-ons
- Package with web-ext
- Submit to addons.mozilla.org

## 🤝 Contributing
### Code Standards
- ES6+: Use modern JavaScript features
- Error handling: Always use try/catch with meaningful errors
- Comments: Document complex logic
- Performance: Consider memory and processing impact

### Pull Request Checklist
- Tested on multiple browsers
- No performance regressions
- Updated documentation if needed
- Follows existing code style

## 🔄 Release Process
- Update version in manifest.json
- Update changelog in README.md
- Test on all target browsers
- Package and submit to stores
- Update documentation

## 🆘 Troubleshooting
### Common Issues
#### Extension not loading:
- Check manifest.json syntax
- Verify permissions in browser console
- Check for conflicting extensions

#### Links not highlighting:
- Verify history permission is granted
- Check browser console for errors
- Test on different websites

#### Performance issues:
- Reduce batch size in settings
- Enable throttling for dynamic content
- Clear extension cache

### Getting Help
- Create an issue on GitHub
- Check browser extension documentation
- Review similar open-source extensions

---

> For more details, see the README.md or create an issue on GitHub. 

[⬆ Back to top](#-development-guide)

[![Quick Start](https://img.shields.io/badge/section-Quick_Start-blue)](#-quick-start)
[![Architecture](https://img.shields.io/badge/section-Architecture-green)](#-project-architecture)
[![Debugging](https://img.shields.io/badge/section-Debugging-red)](#-debugging)
