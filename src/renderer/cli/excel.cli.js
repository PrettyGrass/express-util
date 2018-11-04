//
//
// #!/usr/bin/env node
//
'use strict'

const xlsx = require('xlsx')
const fs = require('fs')
const path = require('path')

var args = process.argv
const Trans = require('./excel-to-string')

function getProp(p) {
  switch (p) {
    case '-i':
      return 'excelPath'
      break
    case '-o':
      return 'excelPath'
      break
  }
  return null
}

for (let index in args) {
  let argv = args[index]
  let next = parseInt(index) + 1
  if (argv.startsWith('-') > 0) {
    switch (argv) {
      case '-i':
        Trans.conf.excelPath = args[next]
        break
      case '-o':
        Trans.conf.outPath = args[next]
        break
      case '-ios':
        Trans.conf.ios = true
        break
      case '-h5':
        Trans.conf.h5 = true
        break
      case '-android':
        Trans.conf.android = true
        break
      case '-h':
        console.log('-i execl文案文件, -o 输出目录, -ios -h5 -android 对应各平台是否需要生成')
        break
    }
  }
}
console.log('转换开始')
Trans.transAction()
console.log('转换结束')