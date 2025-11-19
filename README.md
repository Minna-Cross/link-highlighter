

# 🔗 Link Highlighter

A browser extension that highlights visited links with different colors based on when you visited them.

## ✨ Features

- 🎨 **Color-codes links by visit time** (today, week, month, older, never)
- ⚡ **Adaptive performance** for large pages and dynamic content
- 🔒 **Privacy-focused**: All processing happens locally
- 🌐 **Works on all websites** including SPAs and dynamic pages
- ⚙️ **Configurable** colors, performance settings, and protocols
- ♿ **Accessibility support** with ARIA labels

## 🚀 Installation

### Development Setup
1. Clone this repository
2. Load the extension in Chrome/Edge/Firefox (see [docs/development.md](docs/installation.md))
3. Start developing!

### Quick Start
```bash
git clone https://github.com/yourusername/link-highlighter.git
cd link-highlighter
# Load extension in browser developer mode
```

## 📁 Project Structure
```bash 
link-highlighter/
├── src/                        # Source code
│   ├── manifest.json           # Extension configuration
│   ├── content.js              # Link highlighting logic (main feature)
│   ├── popup.html              # Popup interface
│   ├── popup.js                # Popup functionality
│   └── icons/                  # Extension icons
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── docs/                       # Documentation
│   ├── installation.md
│   ├── development.md
│   └── privacy.md              # Privacy information
├── scripts/                    # Build scripts
│   └── build.js
├── dist/                       # Built extensions (gitignored)
├── screenshots/                # Store listing images
│   ├── promo-1400x560.png
│   └── screenshot-1280x800.png
├── .gitignore                  # Git ignore rules
├── README.md                   # Project documentation
├── LICENSE                     # MIT License
└── package.json                # For build tools
```

## 🔧 Development
Browser Support
Chrome/Edge: Full support
Firefox: Full support
SPAs: Advanced support for React, Angular, Vue, etc.
See development.md for details.

## 🗝️ Key Files
content.js      - Main extension logic with performance optimizations
manifest.json   - Extension configuration and permissions
popup.html/js   - User interface for toggling features

## 🔒 Privacy
This extension requires browser history access to function. All processing happens locally on your device - no data is sent to external servers. See privacy.md for details.

## 📋 TODO
 Add advanced configuration options page
 Create extension store listing images
 Add automated testing
 Support for more browser-specific features

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
MIT License - see LICENSE file for details.


---

[⬆ Back to top](#-development-guide)

[![Quick Start](https://img.shields.io/badge/section-Quick_Start-blue)](#-quick-start)
[![Architecture](https://img.shields.io/badge/section-Architecture-green)](#-project-architecture)
[![Debugging](https://img.shields.io/badge/section-Debugging-red)](#-debugging)
