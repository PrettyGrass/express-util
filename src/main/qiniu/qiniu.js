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

  getFiles: function (event, params) {
    var curt = config.getCurrentConfig()
    var mac = new qiniu.auth.digest.Mac(curt.qiniuAccessKey, curt.qiniuSecretKey);
    var qiniuConf = new qiniu.conf.Config();
    var bucketManager = new qiniu.rs.BucketManager(mac, qiniuConf);

    var bucket = curt.qiniuBucket;
    var bucketDomain = curt.qiniuBucketDomain;
    // @param options 列举操作的可选参数
    //                prefix    列举的文件前缀
    //                marker    上一次列举返回的位置标记，作为本次列举的起点信息
    //                limit     每次返回的最大列举文件数量
    //                delimiter 指定目录分隔符
    var options = {
      limit: params.size,
      prefix: params.dir,
      marker: params.sid
    };
    bucketManager.listPrefix(bucket, options, function (err, respBody, respInfo) {
      if (err) {
        console.log(err);
        throw err;
      }
      var nextMarker = respBody.marker;
      var result = {
        sid: nextMarker,
        items: [],
        dir: options.prefix
      }

      var items = result.items
      if (respInfo.statusCode == 200) {
        //如果这个nextMarker不为空，那么还有未列举完毕的文件列表，下次调用listPrefix的时候，
        //指定options里面的marker为这个值
        respBody.items.forEach(function (item) {

          var url = bucketManager.publicDownloadUrl(bucketDomain, item.key)
          let file = {}
          items.push(file)
          file.url = url
          file.hash = item.hash
          file.key = item.key
          file.type = item.type
          file.mimeType = item.mimeType
          file.name = item.key.split('/').pop()
          //console.log(item.key);
          // console.log(item.putTime);
          // console.log(item.hash);
          // console.log(item.fsize);
          // console.log(item.mimeType);
          // console.log(item.endUser);
          // console.log(item.type);
        });
      } else {
        console.log('respBody', respBody, respInfo);
      }
      event.sender.send('app.qiniu.file.update', result)
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
