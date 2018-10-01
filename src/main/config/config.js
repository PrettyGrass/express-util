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

    ipcMain.on('app.path', (event, arg) => {
      event.returnValue = app.getPath(arg)
    })

    ipcMain.on('app.user.config.get', (event, arg) => {
      var c = this.getConfigs(event)
      c.confPath = this._configPath
      event.sender.send('app.user.config.update', c)
    })
    ipcMain.on('app.user.config.add', (event, arg) => {
      event.returnValue = this.addConfig(event, arg)
    })
    ipcMain.on('app.user.config.del', (event, arg) => {
      event.returnValue = this.delConfigs(event, arg)
    })
    ipcMain.on('app.user.config.update', (event, arg) => {
      event.returnValue = this.updateConfigs(event, arg)
    })
  },

  getConfigs: function (event) {
    var content = null
    if (fs.existsSync(this._configPath)) {
      content = fs.readFileSync(this._configPath)
    }
    if (content) {
      this._config = JSON.parse(content)
    } else {
      this._config = {
        confs: {},
        gits: [],
        currentConfId: 'add'
      }
      this.saveConfigs()
    }
    return this._config
  },
  getCurrentConfig: function () {
    console.log('this', this)
    this.getConfigs()
    var currentConf = this._config.confs[this._config.currentConfId]
    //console.log('currentConf', currentConf , this._config.currentConfId)
    return currentConf
  },
  addConfig: function (event, config) {
    if (config) {
      config.id = UUID.v1()
      this._config.confs[config.id] = config
      this._config.currentConfId = config.id
    }
    this.saveConfigs(event)
  },
  delConfigs: function (event, config) {
    if (config) {
      delete this._config.confs[config.id]
    }
    this._config.currentConfId = 'add'
    this.saveConfigs(event)
  },
  updateConfigs: function (event, config) {
    if (config) {
      var old = this._config.confs[config.id]
      for (let key in config) {
        old[key] = config[key]
      }
      this._config.currentConfId = config.id
    }
    this.saveConfigs(event)

  },
  saveConfigs: function (event) {
    var json = JSON.stringify(this._config)
    fs.writeFileSync(this._configPath, json)
    if (event) {
      event.sender.send('app.user.config.update', this._config)
    }
    return ''
  }
}

Config.init()
export default Config
