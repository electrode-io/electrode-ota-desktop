const {app, BrowserWindow, Menu, shell} = require('electron');
const path = require('path');

const devMode = (process.argv || []).indexOf('--dev') !== -1;

let filePath;
if (devMode) {
    const devPath = path.join(__dirname, '..', '..', 'node_modules');
    console.log('Development Path', devPath);
    // load the app dependencies
    require('module').globalPaths.push(devPath);
}

/*
if (process.env.NODE_ENV === 'development') {
    require('electron-debug')(); // eslint-disable-line global-require
}
*/

let menu;
let template;
let mainWindow = null;


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


const installExtensions = () => {
    if (process.env.NODE_ENV === 'development') {
        const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

        const extensions = [
            'REACT_DEVELOPER_TOOLS',
            'REDUX_DEVTOOLS'
        ];
        const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
        return Promise.all(extensions.map(name=> {
            try {
                return installer.default(installer[name], forceDownload)
            } catch (e) {
            } // eslint-disable-line
        }));
    }
    return Promise.resolve();
};

const pkg = require('../package.json');
const join = path.join.bind(path, __dirname, '..');
const loadUrl = 'file://' + (devMode ? join( 'index.html') : join('index.html') );
console.log('loading url', loadUrl);
app.on('ready', () =>installExtensions().then(()=> {

    mainWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728
    });
    mainWindow.loadURL(loadUrl);
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    if (devMode) {
        mainWindow.openDevTools();
    }
    mainWindow.webContents.on('context-menu', (e, props) => {
        const {x, y} = props;

        Menu.buildFromTemplate([{
            label: 'Inspect element',
            click() {
                mainWindow.inspectElement(x, y);
            }
        }]).popup(mainWindow);
    });

    if (process.platform === 'darwin') {
        template = [{
            label: 'Electrode OTA',
            submenu: [{
                label: 'About Electrode OTA',
                selector: 'orderFrontStandardAboutPanel:'
            }, {
                type: 'separator'
            }, {
                label: 'Services',
                submenu: []
            }, {
                type: 'separator'
            }, {
                label: 'Hide ElectronReact',
                accelerator: 'Command+H',
                selector: 'hide:'
            }, {
                label: 'Hide Others',
                accelerator: 'Command+Shift+H',
                selector: 'hideOtherApplications:'
            }, {
                label: 'Show All',
                selector: 'unhideAllApplications:'
            }, {
                type: 'separator'
            }, {
                label: 'Quit',
                accelerator: 'Command+Q',
                click() {
                    app.quit();
                }
            }]
        }, {
            label: 'Edit',
            submenu: [{
                label: 'Undo',
                accelerator: 'Command+Z',
                selector: 'undo:'
            }, {
                label: 'Redo',
                accelerator: 'Shift+Command+Z',
                selector: 'redo:'
            }, {
                type: 'separator'
            }, {
                label: 'Cut',
                accelerator: 'Command+X',
                selector: 'cut:'
            }, {
                label: 'Copy',
                accelerator: 'Command+C',
                selector: 'copy:'
            }, {
                label: 'Paste',
                accelerator: 'Command+V',
                selector: 'paste:'
            }, {
                label: 'Select All',
                accelerator: 'Command+A',
                selector: 'selectAll:'
            }]
        }, {
            label: 'View',
            submenu: (process.env.NODE_ENV === 'development') ? [{
                label: 'Reload',
                accelerator: 'Command+R',
                click() {
                    mainWindow.webContents.reload();
                }
            }, {
                label: 'Toggle Full Screen',
                accelerator: 'Ctrl+Command+F',
                click() {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }, {
                label: 'Toggle Developer Tools',
                accelerator: 'Alt+Command+I',
                click() {
                    mainWindow.toggleDevTools();
                }
            }] : [{
                label: 'Toggle Full Screen',
                accelerator: 'Ctrl+Command+F',
                click() {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }]
        }, {
            label: 'Window',
            submenu: [{
                label: 'Minimize',
                accelerator: 'Command+M',
                selector: 'performMiniaturize:'
            }, {
                label: 'Close',
                accelerator: 'Command+W',
                selector: 'performClose:'
            }, {
                type: 'separator'
            }, {
                label: 'Bring All to Front',
                selector: 'arrangeInFront:'
            }]
        }, {
            label: 'Help',
            submenu: [{
                label: 'Learn More',
                click() {
                    shell.openExternal('http://electron.atom.io');
                }
            }, {
                label: 'Documentation',
                click() {
                    shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
                }
            }, {
                label: 'Community Discussions',
                click() {
                    shell.openExternal('https://discuss.atom.io/c/electron');
                }
            }, {
                label: 'Search Issues',
                click() {
                    shell.openExternal('https://github.com/atom/electron/issues');
                }
            }]
        }];

        menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    } else {
        template = [{
            label: '&File',
            submenu: [{
                label: '&Open',
                accelerator: 'Ctrl+O'
            }, {
                label: '&Close',
                accelerator: 'Ctrl+W',
                click() {
                    mainWindow.close();
                }
            }]
        }, {
            label: '&View',
            submenu: (process.env.NODE_ENV === 'development') ? [{
                label: '&Reload',
                accelerator: 'Ctrl+R',
                click() {
                    mainWindow.webContents.reload();
                }
            }, {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click() {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }, {
                label: 'Toggle &Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click() {
                    mainWindow.toggleDevTools();
                }
            }] : [{
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click() {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }]
        }, {
            label: 'Help',
            submenu: [{
                label: 'Community Discussions',
                click() {
                    shell.openExternal(pkg.homepage);
                }
            }, {
                label: 'Search Issues',
                click() {
                    shell.openExternal(pkg.bugs.url);
                }
            }]
        }];
        menu = Menu.buildFromTemplate(template);
        mainWindow.setMenu(menu);
    }
}));

