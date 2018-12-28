// 在主进程中.
const {ipcMain, app} = require('electron')
const path = require('path')
const fs = require('fs')
const UUID = require('uuid')
const spawn = require('child_process').spawn
var os = require('os');

const CMD = {

  // 输出命令
  outLine: {},
  init: function () {
    // 同执行命令
    ipcMain.on('app.cmd.exec.sync', (event, arg) => {
      let action = arg.action
      if (!action || action === '') {
        event.returnValue = 'action 不能为空'
        return
      }
      event.returnValue = this.addConfig(event, arg)
    })

    // 异步执行命令
    ipcMain.on('app.cmd.exec.async', (event, arg) => {
      let action = arg.action
      if (!action || action === '') {
        event.returnValue = 'action 不能为空'
        return
      }
      // 退出
      if (this.outLine[arg.action] && arg.code && arg.code == 1) {
        this.outLine[arg.action].kill('SIGHUP')
        delete this.outLine[arg.action]
        return
      }
      // var gitPath = path.join(global.__root, 'assets/gitSource.sh')
      // console.log('---', gitPath)
      // 正式执行命令
      let shell = arg.shell
      var temParams = arg.params
      if (arg.fromAssets == true && arg.scriptName !== '') {
        var scriptPath = path.join(global.__root, `assets/${arg.scriptName}`)
        temParams.unshift(scriptPath)
      }
      console.log("######脚本参数:",temParams)
      let params = temParams || []
      var shellSpawn = spawn(shell, params)
      shellSpawn.stdout.on('data', function (s) {
        event.sender.send(arg.action, {data: s.toString(), code: 0})
      });

      shellSpawn.stdout.on('end', function () {
        event.sender.send(arg.action, {data: 'end', code: 1})
      })

      this.outLine[arg.action] = shellSpawn
    })

    // 异步停止执行命令
    ipcMain.on('app.cmd.exec.async.cancel', (event, arg) => {
      let action = arg.action
      if (!action || action === '') {
        event.returnValue = 'action 不能为空'
        return
      }
      // 退出
      if (this.outLine[arg.action]) {
        this.outLine[arg.action].kill('SIGHUP')
        delete this.outLine[arg.action]
      }
    })
  }
}

CMD.init()
export default CMD
