// Modules
const { app, BrowserWindow, session } = require("electron");
const colors = require("colors");

setTimeout(() => {
  console.log("Checking App: " + app.isReady());
}, 1000);

// Keep a global reference of the window objects
let mainWindow, secWindow;

// Create new BrowserWindows when `app` is ready
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 800,
    frame: false, // Disable window frame thus removing standard window controls
    minHeight: 720,
    minWidth: 1280,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
    backgroundColor: "#2b2e3b",
  });


  // Download logic using session's will-download event
  const ses = mainWindow.webContents.session;
  const path = require('path');

  mainWindow.loadFile("index.html");

  // Listen for download events
  ses.on('will-download', (event, item, webContents) => {
    console.log('Starting download...');
    const fileName = item.getFilename();
    const totalBytes = item.getTotalBytes();
    console.log('File name:', fileName);
    console.log('Total size:', totalBytes, 'bytes');

    // Save to Desktop automatically (no prompt)
    const savePath = path.join(app.getPath('desktop'), fileName);
    item.setSavePath(savePath);

    // Track download progress
    item.on('updated', (event, state) => {
      if (state === 'progressing') {
        const received = item.getReceivedBytes();
        if (received && totalBytes) {
          const progress = Math.round((received / totalBytes) * 100);
          console.log(`Progress: ${progress}%`);
          // Update progress bar in renderer
          webContents.executeJavaScript(`if(window.progress){window.progress.value=${progress};}`);
        }
      } else if (state === 'interrupted') {
        console.log('Download interrupted');
      }
    });

    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('Download successfully');
      } else {
        console.log(`Download failed: ${state}`);
      }
    });
  });

  // Open DevTools - Remove for PRODUCTION!
    // mainWindow.webContents.openDevTools();

  // Listen for window being closed
  mainWindow.on("closed", () => {
    console.log(colors.red("Main window closed."));
    mainWindow = null;
  });
}

// Electron `app` is ready
app.on("ready", () => {
  console.log(colors.green("App is ready."));
  createWindow();
});

// Quit when all windows are closed - (Not macOS - Darwin)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// When app icon is clicked and app is running, (macOS) recreate the BrowserWindow
app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
