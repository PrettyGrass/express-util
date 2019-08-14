// 在主进程中.
const {ipcMain, app} = require('electron')
const fs = require('fs')
var UUID = require('uuid')
const config = require('../config/config').default
const OSS = require('ali-oss')

const OSSFile = {
  init: function () {
    ipcMain.on('app.alioss.file.list', (event, arg) => {
      this.getFiles(event, arg)
    })
  },

  getFiles: async function (event, params) {
    var curt = config.getCurrentConfig()
    var bucketDomain = curt.qiniuBucketDomain;
    var options = {
      limit: params.size,
      prefix: params.dir,
      marker: params.sid
    };

    let client = new OSS({
      region: curt.aliossRegion,
      accessKeyId: curt.aliossAccessKey,
      accessKeySecret: curt.aliossSecretKey,
      bucket: curt.aliossBucket
    });

    // 不带任何参数，默认最多返回1000个文件。

    var objects = []
    var isTruncated = true
    var nextMarker = null
    while (isTruncated) {

      var opt = {prefix: params.dir}
      if (nextMarker !== null) {
        opt.marker = nextMarker
      }
      let result = await client.list(opt);
      objects = objects.concat(result.objects)
      nextMarker = result.nextMarker
      isTruncated = result.isTruncated
      if (!isTruncated) {
        break
      }
    }

    var result = {
      sid: nextMarker,
      items: [],
      dir: options.prefix
    }
    var items = result.items
    objects.forEach(function (item) {

      //var url = bucketManager.publicDownloadUrl(bucketDomain, item.key)
      let file = {}
      items.push(file)
      file.cdnHost = bucketDomain
      file.url = item.url
      file.hash = item.etag
      file.key = item.name
      file.type = item.type
      file.mimeType = item.mimeType
      file.name = item.name.split('/').pop()
    });

    event.sender.send('app.alioss.file.update', result)
  },
}

OSSFile.init()
export default OSSFile
