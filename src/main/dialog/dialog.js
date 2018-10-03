// 在主进程中.
const {ipcMain, dialog} = require('electron')
const path = require('path')

const Dialog = {
  init: function () {

    ipcMain.on('app.system.select.dir', (event, arg) => {
      dialog.showOpenDialog({
        properties: ['openDirectory']
      }, (files) => {
        if (files && arg.action) {
          event.sender.send(arg.action, files)
        }
      })
    })
    ipcMain.on('app.system.select.file', (event, arg) => {
      dialog.showOpenDialog({
        properties: ['openFile']
      }, (files) => {
        if (files && arg.action) {
          event.sender.send(arg.action, files)
        }
      })
    })
    ipcMain.on('app.system.save.file', (event, arg) => {

      const options = {
        title: arg.title || '保存文件',
        filters: [
          { name: arg.name || '文件名' , extensions: arg.extensions || ['*'] }
        ]
      }
      console.log('optionsoptions', options)
      dialog.showSaveDialog(options, (filename) => {
        if (filename && arg.action) {
          event.sender.send(arg.action, filename)
        }
      })
    })
  }
}

Dialog.init()
export default Dialog
