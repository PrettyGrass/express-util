// 在主进程中.
const {ipcMain} = require('electron')
const path = require('path')

ipcMain.on('asynchronous-message', (event, arg) => {
  event.sender.send('asynchronous-reply', 'pong')

  var gitPath = path.join(global.__root, 'assets/gitSource.sh')
  var exec = require('child_process').exec;
  var cmdStr = 'sh ' + gitPath + ' --help';
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
    } else {
      event.sender.send('asynchronous-reply', stdout)
    }
  });
})

ipcMain.on('synchronous-message', (event, arg) => {
  event.returnValue = 'pong'
})
