const { ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
ipcMain.on('synchronous-message', (event, arg) => {
  var shellPath = path.join(global.__root, 'assets/gitSource.sh')
  var data = fs.readFileSync(shellPath)
  event.returnValue = shellPath + data
})
