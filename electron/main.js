const { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, screen } = require('electron');
const { exec } = require('child_process');
const path = require('path');
require('dotenv').config();

let mainWindow;
let tray;
let isQuiting = false;

function createWindow() {
    // 화면 크기 가져오기
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    mainWindow = new BrowserWindow({
        width: 500,
        height: 600,
        x: width - 520, // 오른쪽에 위치
        y: 100,
        show: false,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.loadFile('./src/frontend/index.html');

    // 윈도우가 닫힐 때 숨김 처리
    mainWindow.on('close', (event) => {
        if (!isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // 윈도우 포커스 잃으면 자동 숨김
    mainWindow.on('blur', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        }
    });

    // 개발 시 개발자 도구 열기
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

function createTray() {
    // 트레이 아이콘 생성 (실제 앱에서는 아이콘 파일 필요)
    tray = new Tray(path.join(__dirname, 'assets', 'icon.png'));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: () => {mainWindow.show();
            }
        },
        {
            label: 'Quit',
            click: () => {
                isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Gemini Chat App');
    tray.setContextMenu(contextMenu);

    // 트레이 아이콘 클릭 시 토글
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
}

function registerGlobalShortcuts() {
    // Option+Space 단축키 등록
    const ret = globalShortcut.register('Option+Space', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    if (!ret) {
        console.log('Option+Space 단축키 등록 실패');
    }

    // ESC 키로 창 숨기기
    globalShortcut.register('Escape', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        }
    });
}

// 앱 준비 완료
app.whenReady().then(() => {
    createWindow();
    try {
        createTray();
    } catch (error) {
        console.log('트레이 생성을 건너뜁니다:', error.message);
    }
    registerGlobalShortcuts();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// 모든 창이 닫혔을 때
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 앱 종료 시 단축키 해제
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

// 렌더러에서 창 제어 요청 처리
ipcMain.on('hide-window', () => {
    mainWindow.hide();
});

ipcMain.on('close-app', () => {
    isQuiting = true;
    app.quit();
});

// 렌더러에서 받은 메시지를 Gemini CLI로 전송
ipcMain.on('send-to-gemini', (event, message) => {
    // Sanitize message to prevent command injection
    const sanitizedMessage = message.replace(/"/g, '\"');
    const command = `echo "${sanitizedMessage}" | gemini -m "gemini-2.5-flash"`;
    console.log(`Executing: ${command}`);

    exec(command, { env: process.env }, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            console.error('Gemini CLI Stderr:', stderr);
            mainWindow.webContents.send('gemini-error', stderr || error.message);
            return;
        }

        // Filter out the cached credentials message
        const filteredStdout = stdout.replace(/^Loaded cached credentials\.\n/i, '');

        console.log('Gemini response:', filteredStdout);
        mainWindow.webContents.send('gemini-response', filteredStdout);
    });
});