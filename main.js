// Main application modules
const { app, BrowserWindow } = require("electron");
const { createTray } = require("./tray.js");

// Global reference for main window
let mainWindow;

// Function to create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    frame: false,
    webPreferences: {
      // --- !! IMPORTANT !! ---
      // Disable 'contextIsolation' to allow 'nodeIntegration'
      // 'contextIsolation' defaults to "true" as from Electron v12
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  // Load the price monitor HTML file
  mainWindow.loadFile("renderer/price-monitor.html");

  // Open Developer Tools for debugging
  mainWindow.webContents.openDevTools();

  // Handle window close event
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Create tray icon using external module
  createTray(mainWindow);
}

// Application is ready to create windows
app.on("ready", createWindow);

// Quit application when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Recreate window on app icon click (macOS)
app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
