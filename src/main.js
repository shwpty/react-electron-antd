// electron 模块可以用来控制应用的生命周期和创建原生浏览窗口
const { app, BrowserWindow, Menu } = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')

const createWindow = () => {
    // 创建浏览窗口
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    )

    if (isDev) {
        // 只有开发环境才打开开发者工具
        mainWindow.webContents.openDevTools()   
    }

    // createMenu()
}

// 设置菜单栏
function createMenu() {
    // darwin表示macOS,针对macOS的设置
    if (process.platform === 'darwin') {
        const template = [
            {
                label: 'App Demo',
                submenu: [
                    {
                        role: 'about'
                    },
                    {
                        role: 'quit'
                    }
                ]
            }
        ]
        let menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    }
    else {
        // windows及linux系统
        Menu.setApplicationMenu(null)
    }
}
// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        // 在 macOS 系统内, 如果没有已开启的应用窗口
        // 点击托盘图标时通常会重新创建一个新窗口
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此, 通常
// 对应用程序和它们的菜单栏来说应该时刻保持激活状态,
// 直到用户使用 Cmd + Q 明确退出
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// 在当前文件中可以引入所有的主进程代码
// 也可以拆分成几个文件，然后用 require 导入。
require('./api/operations')