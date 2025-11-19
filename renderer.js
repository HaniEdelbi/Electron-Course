// Electron renderer process: dialog demo button handler
const { ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
	const dialogDemoBtn = document.getElementById('dialog-demo-btn');
	if (dialogDemoBtn) {
		dialogDemoBtn.addEventListener('click', async () => {
			await ipcRenderer.invoke('run-dialog-demo');
		});
	}
});
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
