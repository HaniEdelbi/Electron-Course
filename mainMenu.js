// mainMenu.js
// Main menu template for Electron app
let save = [
  { label: "Save", submenu: [{ label: "Save As" }, { label: "Save All" }] },
];
module.exports = [
  {
    label: "Electron",
    submenu: [{ label: "Item One" }, { label: "Item Two" }, save[0]],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { role: "copy" },
      { role: "paste" },
    ],
  },
  {
    label: "Actions",
    submenu: [
      { label: "Dev Tools", role: "toggleDevTools" },
      { role: "togglefullscreen" },
      {
        label: "Greet",
        accelerator: "Shift+Alt+G",
        click: () => {
          console.log("Hello from main menu");
        },
      },
      { label: "Action Two", enabled: false },
      { label: "Action Three" },
    ],
  },
];
