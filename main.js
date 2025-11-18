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

  // --- SESSION COOKIES LOGIC DEMO ---
  const ses = mainWindow.webContents.session;

  // Helper to get and log all cookies
  function getCookies(filter = {}) {
    ses.cookies
      .get(filter)
      .then((cookies) => {
        console.log("Cookies:", cookies);
      })
      .catch((error) => {
        console.error("Get cookies error:", error);
      });
  }
  // 1. Load remote content
  mainWindow.loadFile("index.html");

  // Once content is loaded, perform cookie operations
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("Loaded remote content, reading cookies:");
    getCookies();

    // 2. Set a session cookie (no expiration)
    const sessionCookie = {
      url: "https://myapp.domain.com",
      name: "cookie1",
      value: "electron",
    };
    ses.cookies
      .set(sessionCookie)
      .then(() => {
        console.log("Session cookie1 set");
        getCookies();

        // 3. Set a persistent cookie (with expiration)
        const persistentCookie = {
          url: "https://myapp.domain.com",
          name: "cookie2",
          value: "persisted",
          expirationDate: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year
        };
        return ses.cookies.set(persistentCookie);
      })
      .then(() => {
        console.log("Persistent cookie2 set");
        getCookies();

        // 4. Get a specific cookie by name
        return ses.cookies.get({ name: "cookie1" });
      })
      .then((cookies) => {
        console.log("cookie1 only:", cookies);

        // 5. Remove a cookie
        return ses.cookies.remove("https://myapp.domain.com", "cookie1");
      })
      .then(() => {
        console.log("cookie1 removed");
        getCookies();
      })
      .catch((error) => {
        console.error("Cookie operation error:", error);
      });
  });

  // Open DevTools - Remove for PRODUCTION!
  mainWindow.webContents.openDevTools();

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
