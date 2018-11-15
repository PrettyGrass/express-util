const fs = require('fs')
const path = require('path')

const FileUtil = {
  subFiles: function (pPath) {

    var ignores = [
      /\\*.xcodeproj/,
      /\\*.xcworkspace/,
      /.lock/,
      /Pods/,
      /\\*.entitlements/,
      /\\*.md/,
      /build/,
      /\\*.xc/,
      /test/
    ]

    let files = fs.readdirSync(pPath)
    var fileObjs = []
    for (let i = 0; i < files.length; i++) {
      let file = files[i]
      if (this.testIgnore(file, ignores)) {
        continue
      }
      let fullPath = path.join(pPath, file)
      let state = fs.statSync(fullPath)
      var fileObj = {
        path: fullPath,
        name: file,
        icon: this.getIcon(file),
        isFile: state.isFile(),
        hasSub: !state.isFile()
      }
      fileObjs.push(fileObj)
    }
    return fileObjs
  },
  testIgnore: function (file, igs = []) {
    var ignores = [/.DS_Store/, /.git/, /.gitkeep/, /.gitignore/].concat(igs)
    for (let i = 0; i < ignores.length; i++) {
      let ignore = ignores[i]
      if (ignore.test(file))
        return true
    }
    return false
  },
  getIcon: function (file, nildefault = '') {
    return nildefault
  }
}
module.exports = FileUtil