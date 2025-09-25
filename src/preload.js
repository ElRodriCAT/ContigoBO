const { contextBridge, ipcRenderer } = require('electron');

// Exponer una API segura al renderer si se necesita en el futuro
contextBridge.exposeInMainWorld('electronAPI', {
  send: (channel, data) => {
    // whitelist channels
    const validChannels = [];
    if (validChannels.includes(channel)) ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    const validChannels = [];
    if (validChannels.includes(channel)) ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});
