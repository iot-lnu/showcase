const { app, BrowserWindow, session, globalShortcut, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

let homeAssistantWindow;
let localAppWindow;
let activeWindow;

// Disable hardware acceleration
app.disableHardwareAcceleration();

// Optimize for low-end devices
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

// Update this function for logging errors
function logError(message) {
  const logPath = path.join(__dirname, 'error.log');
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  
  fs.appendFile(logPath, logMessage, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
}

function createWindow(url, title, retryCount = 0) {
  const win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.js'
    },
    // Optimize for Raspberry Pi
    backgroundColor: '#000000',
    show: false,
    frame: false
  });

  win.webContents.session.setCertificateVerifyProc((request, callback) => {
    callback(0);
  });

  win.loadURL(url).catch(error => {
    const errorMessage = `Failed to load ${title}: ${error}`;
    console.error(errorMessage);
    logError(errorMessage);
    if (retryCount < 3) {
      console.log(`Retrying to load ${title} (attempt ${retryCount + 1})...`);
      setTimeout(() => createWindow(url, title, retryCount + 1), 5000);
    } else {
      const failureMessage = `Failed to load ${title} after 3 attempts`;
      console.error(failureMessage);
      logError(failureMessage);
      // You might want to show an error message to the user here
    }
  });

  // Inject CSS for smooth transition and hide cursor
  win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(`
      body {
        transition: opacity 0.3s ease-in-out;
        cursor: none !important;
      }
      body.fade-out {
        opacity: 0;
      }
      * {
        cursor: none !important;
      }
    `);
    win.show();
  });

  // Optimize memory usage
  win.webContents.on('dom-ready', () => {
    win.webContents.setZoomFactor(1);
    win.webContents.setVisualZoomLevelLimits(1, 1);
  });

  return win;
}

function createHomeAssistantWindow() {
  homeAssistantWindow = createWindow('https://192.168.1.39:8123', 'Home Assistant');
  activeWindow = homeAssistantWindow;
}

function createLocalAppWindow() {
  localAppWindow = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#ffffff', // Change to white to see if it's loading
    show: true, // Show the window immediately
    frame: false
  });

  console.log('Loading local app from:', path.join(__dirname, 'public', 'index.html'));
  localAppWindow.loadFile(path.join(__dirname, 'public', 'index.html'));

  // Add error logging
  localAppWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load local app:', errorDescription);
    logError(`Failed to load local app: ${errorDescription}`);
  });

  // Add console logging
  localAppWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('Renderer Console:', message);
  });

  // Handle IPC message for getting playlist
  ipcMain.handle('get-playlist', () => {
    return getPlaylist();
  });

  localAppWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    localAppWindow.show();
  });
}

function switchWindow() {
  const fadeOut = `document.body.classList.add('fade-out');`;
  const fadeIn = `document.body.classList.remove('fade-out');`;

  if (activeWindow === homeAssistantWindow) {
    homeAssistantWindow.webContents.executeJavaScript(fadeOut)
      .then(() => {
        setTimeout(() => {
          homeAssistantWindow.hide();
          localAppWindow.show();
          localAppWindow.focus();
          localAppWindow.webContents.executeJavaScript(fadeIn);
          activeWindow = localAppWindow;
        }, 500);
      });
  } else {
    localAppWindow.webContents.executeJavaScript(fadeOut)
      .then(() => {
        setTimeout(() => {
          localAppWindow.hide();
          homeAssistantWindow.show();
          homeAssistantWindow.focus();
          homeAssistantWindow.webContents.executeJavaScript(fadeIn);
          activeWindow = homeAssistantWindow;
        }, 500);
      });
  }
}

// function setupAutoLaunch() {
//   if (process.platform === 'linux') {
//     const homeDir = os.homedir();
//     const appDir = app.getAppPath();
//     const startScriptPath = path.join(appDir, 'start_app.sh');
//     const desktopEntryPath = path.join(homeDir, '.config', 'autostart', 'home-assistant-kiosk.desktop');

//     // Create start_app.sh
//     const startScriptContent = `#!/bin/bash
//       cd ${appDir}
//       npm run start-rpi`;
//     fs.writeFileSync(startScriptPath, startScriptContent);
//     fs.chmodSync(startScriptPath, '755');

//     // Create desktop entry
//     const desktopEntryContent = `[Desktop Entry]
// Type=Application
// Name=Home Assistant Kiosk
// Exec=${startScriptPath}`;
    
//     if (!fs.existsSync(path.dirname(desktopEntryPath))) {
//       fs.mkdirSync(path.dirname(desktopEntryPath), { recursive: true });
//     }
//     fs.writeFileSync(desktopEntryPath, desktopEntryContent);

//     console.log('Auto-launch setup completed');
//   } else {
//     console.log('Auto-launch setup is only supported on Linux');
//   }
// }

app.whenReady().then(() => {
  session.defaultSession.setCertificateVerifyProc((request, callback) => {
    callback(0);
  });

  createLocalAppWindow();
  createHomeAssistantWindow();
  // setupAutoLaunch();

  // globalShortcut.register('CommandOrControl+Tab', switchWindow);
  globalShortcut.register('Space', switchWindow);
}).catch(error => {
  const errorMessage = `Failed to initialize app: ${error}`;
  console.error(errorMessage);
  logError(errorMessage);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createHomeAssistantWindow();
    createLocalAppWindow();
  }
});

ipcMain.handle('get-videos', () => {
    const videoDir = path.join(__dirname, 'public', 'videos');
    const files = fs.readdirSync(videoDir);
    
    return files
        .filter(file => path.extname(file).toLowerCase() === '.mp4')
        .map(file => ({
            title: path.basename(file, '.mp4'),
            description: `Video file: ${file}`,
            src: `videos/${file}`,
            thumbnail: `videos/${path.basename(file, '.mp4')}.jpg`
        }));
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
