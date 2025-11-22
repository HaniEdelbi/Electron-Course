# Light Mode Theme

A complete light mode theme for the Warframe Market Price Monitor app.

## Overview

This theme provides a clean, modern light mode alternative to the dark Warframe aesthetic while maintaining the app's professional look and feel.

## Color Palette

### Primary Colors

- **Primary Blue**: `#2196f3` - Main accent color
- **Dark Blue**: `#1976d2` - Headings and important elements
- **Light Blue**: `#e3f2fd` - Backgrounds and highlights

### Text Colors

- **Primary Text**: `#263238` - Main content
- **Secondary Text**: `#455a64` - Descriptions, secondary info
- **Tertiary Text**: `#546e7a` - Links, less important text

### Backgrounds

- **Main Background**: Linear gradient from `#e3f2fd` to `#f5f5f5`
- **Container Background**: `rgba(255, 255, 255, 0.95)` - Semi-transparent white
- **Navbar Background**: `rgba(255, 255, 255, 0.95)` - Bright white

## Usage

### Basic Implementation

Add the light mode theme after your main CSS files:

```html
<link rel="stylesheet" href="../design/background.css" />
<link rel="stylesheet" href="../design/about.css" />
<!-- Add light mode theme -->
<link rel="stylesheet" href="../design/light-mode/theme.css" />
```

### Dynamic Theme Switching

Use JavaScript to toggle between dark and light modes:

```javascript
const themeLink = document.createElement("link");
themeLink.rel = "stylesheet";
themeLink.id = "theme-css";

// Switch to light mode
themeLink.href = "../design/light-mode/theme.css";
document.head.appendChild(themeLink);

// Switch back to dark mode
document.getElementById("theme-css")?.remove();
```

## Features

✅ **Complete Coverage**: Overrides all dark mode elements
✅ **Accessible**: High contrast ratios for readability  
✅ **Consistent**: Maintains design language across all pages
✅ **Professional**: Clean, modern aesthetic suitable for trading apps
✅ **Smooth Transitions**: All color changes are CSS-based

## Components Styled

- ✨ Navbar and navigation elements
- 🎨 Side panel menu
- 📝 Content containers and cards
- 🔍 Search inputs and forms
- 📊 Tables and data displays
- 🖱️ Buttons and interactive elements
- 📜 Scrollbars
- 🎯 Toggle components

## Browser Compatibility

- ✅ Chrome/Electron (primary target)
- ✅ Edge
- ✅ Firefox
- ✅ Safari

## Notes

- This theme uses CSS custom properties for easy customization
- All colors maintain the Warframe aesthetic but in a lighter palette
- Shadows are softer and more subtle than dark mode
- Blue accent colors replace the cyan/teal from dark mode
