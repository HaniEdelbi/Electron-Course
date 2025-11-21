// tray.js: Handles the system tray for the Electron app
const { Tray, Menu, app } = require('electron');
const path = require('path');

let tray = null;

function createTray(mainWindow) {
  if (tray) return tray;

  const iconPath = path.join(__dirname, 'images', 'tray.png');
  console.log('Tray icon path:', iconPath);  // <-- this is the safe log

  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Warframe Market Price Monitor');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  return tray;
}

module.exports = { createTray };
