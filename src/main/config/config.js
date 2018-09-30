// 在主进程中.
const {ipcMain, app} = require('electron')
const path = require('path')
const fs = require('fs')
var UUID = require('uuid')


const Config = {
  _config: {},
  _configPath: '',
  init: function () {
    if (this._configPath !== '') {
      return
    }
    this._configPath = path.join(app.getPath('userData'), 'app.config.json')
    // console.log('fs.readSync(this._configPath)', fs.readSync(this._configPath))
    // this._config = JSON.parse(fs.readSync(this._configPath))
    if (!this._config) {
      this._config = {
        confs: {},
        currentConf: ''
      }
    }

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

    ipcMain.on('app.path', (event, arg) => {
      event.returnValue = app.getPath(arg)
    })

    ipcMain.on('app.user.config.get', (event, arg) => {
      event.returnValue = this.getConfigs()
    })
    ipcMain.on('app.user.config.add', (event, arg) => {
      event.returnValue = this.addConfig(arg)
    })
    ipcMain.on('app.user.config.del', (event, arg) => {
      event.returnValue = this.delConfigs(arg)
    })
    ipcMain.on('app.user.config.update', (event, arg) => {
      event.returnValue = this.updateConfigs(arg)
    })
  },

  getConfigs: function () {
    return this._config.confs
  },
  addConfig: function (config) {
    var ID = UUID.v1()
    config.id = ID
    this._config.confs[config.id] = config
    this.saveConfigs()
  },
  delConfigs: function (id) {
    delete this._config.confs[id]
    this.saveConfigs()
  },
  updateConfigs: function (conf) {
    var old = this._config.confs[id]
    for (let key in conf) {
      old[key] = conf[key]
    }
    this.saveConfigs()
  },
  saveConfigs: function () {
    return [{name: '配置'}]
  }
}


Config.init()
module.exports = Config