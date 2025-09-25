const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

function fsExistsSync(p) {
  try { return fs.existsSync(p); } catch (e) { return false; }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  if (app.isPackaged) {
    const indexFile = path.join(process.resourcesPath || __dirname, '..', 'build', 'public', 'index.html');
    if (fsExistsSync(indexFile)) {
      mainWindow.loadFile(indexFile);
    } else {
      mainWindow.loadFile(path.join(__dirname, '..', 'build', 'public', 'index.html'))
        .catch(err => console.error('Failed loading packaged index.html', err));
    }
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }

  if (app.isPackaged) {
    mainWindow.webContents.on('devtools-opened', () => mainWindow.webContents.closeDevTools());
  }
}

app.whenReady().then(() => {
  // Ensure first-run setup (copy seed DB if needed) when packaged
  try {
    if (app.isPackaged) {
      const firstRun = require(path.join(__dirname, '..', 'scripts', 'first-run.js'));
      const userDataPath = app.getPath('userData');
      firstRun(userDataPath).catch(err => console.error('first-run error', err));
    }
  } catch (e) {
    console.error('Error during first-run setup', e);
  }

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
