// 在主进程中.
const {ipcMain, app} = require('electron')
const path = require('path')
const fs = require('fs')
var UUID = require('uuid')
const config = require('../config/config').default
const qiniu = require('qiniu')

const File = {
  init: function () {
    ipcMain.on('app.qiniu.file.list', (event, arg) => {
      this.getFiles(event, arg)
    })
  },

  getFiles: function (event, arg) {
    var curt = config.getCurrentConfig()
    console.log('curt', curt)
    var mac = new qiniu.auth.digest.Mac(curt.qiniuAccessKey, curt.qiniuSecretKey);
    var qiniuConf = new qiniu.conf.Config();
    var bucketManager = new qiniu.rs.BucketManager(mac, qiniuConf);

    var bucket = curt.qiniuBucket;
    // @param options 列举操作的可选参数
    //                prefix    列举的文件前缀
    //                marker    上一次列举返回的位置标记，作为本次列举的起点信息
    //                limit     每次返回的最大列举文件数量
    //                delimiter 指定目录分隔符
    var options = {
      limit: 10,
      prefix: 'ios-close-lib/',
    };
    bucketManager.listPrefix(bucket, options, function(err, respBody, respInfo) {
      if (err) {
        console.log(err);
        throw err;
      }
      if (respInfo.statusCode == 200) {
        //如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
        //指定options里面的marker为这个值
        var nextMarker = respBody.marker;
        var commonPrefixes = respBody.commonPrefixes;
        console.log(nextMarker);
        console.log(commonPrefixes);
        var items = respBody.items;
        items.forEach(function(item) {
          console.log(item.key);
          // console.log(item.putTime);
          // console.log(item.hash);
          // console.log(item.fsize);
          // console.log(item.mimeType);
          // console.log(item.endUser);
          // console.log(item.type);
        });
      } else {
        console.log(respInfo.statusCode);
        console.log(respBody);
      }
      event.sender.send('app.qiniu.file.update', respBody)
    });
  },
  addFile: function (event, config) {
    if (config) {
      config.id = UUID.v1()
      this._config.confs[config.id] = config
      this._config.currentConfId = config.id
    }
    this.saveFiles(event)
  },
  delFiles: function (event, config) {
    if (config) {
      delete this._config.confs[config.id]
    }
    this._config.currentConfId = 'add'
    this.saveFiles(event)
  },
  updateFiles: function (event, config) {
    if (config) {
      var old = this._config.confs[config.id]
      for (let key in config) {
        old[key] = config[key]
      }
      this._config.currentConfId = config.id
    }
    this.saveFiles(event)

  },
  saveFiles: function (event) {
    var json = JSON.stringify(this._config)
    fs.writeFileSync(this._configPath, json)
    if (event) {
      event.sender.send('app.user.config.update', this._config)
    }
    return ''
  }
}

File.init()
export default File
