<template>
  <div class="app-container">
    <el-form ref="form" :model="conf" label-width="160px">
      <el-form-item label="Excel文案文件">
        <el-col :span="16" style="text-align: center">
          <el-input type="text" v-model="conf.excelPath"></el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">
          <el-button @click="excelPathAction">选择</el-button>
        </el-col>
      </el-form-item>

      <el-form-item label="输出目录">
        <el-col :span="16" style="text-align: center">
          <el-input type="text" v-model="conf.outPath"></el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">
          <el-button @click="outPathAction">选择</el-button>
        </el-col>
      </el-form-item>

      <el-form-item label="desc">
        <el-input type="textarea" :autosize="{ minRows: 16, maxRows: 32}" v-model="conf.desc"></el-input>
      </el-form-item>

      <el-form-item label="">
        <el-button :disabled="conf.excelPath === '' || conf.outPath === ''" type="primary" @click="transAction">转换
        </el-button>
        <!--<el-button :disabled="conf.id !== 'add'" type="primary" @click="saveAction">保存</el-button>-->
        <!--<el-button v-if="conf.id === 'add'" type="primary" :disabled="conf === ''" @click="addAction">创建-->
        <!--</el-button>-->
        <!--<el-button v-if="conf.id !== 'add'" type="danger" @click="delAction">删除</el-button>-->
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {ipcRenderer, remote} from 'electron'

  const fs = require('fs')
  const path = require('path')
  const xlsx = require('xlsx')

  export default {
    data() {
      return {
        content: '',
        conf: {
          outPath: '',
          excelPath: '',
          desc: '',

        },
        innerProps: ['description', 'key', 'index', 'module', 'area'],
        langs: {}
      }
    },
    methods: {

      excelPathAction() {

        var action = `action${Date.now()}`
        ipcRenderer.once(action, (e, file) => {
          this.conf.excelPath = file.toString()
        })
        ipcRenderer.send('app.system.select.file', {
          action: action,
          name: action,
          title: '选择Excel文件',
          extensions: ['md']
        })
      },
      saveAction() {

      },
      transAction() {
        if (!fs.existsSync(this.conf.excelPath)) {
          this.$message.warning('请选择Excel文件')
          return
        }
        if (!fs.existsSync(this.conf.outPath)) {
          this.$message.warning('请选择输出目录')
          return
        }

        var langs = this.transExcelFile(this.langs)
        console.log('langs:', langs)
        this.makeiOSFile(langs)
        this.makeAndroidFile(langs)
      },
      outPathAction() {
        var action = `action${Date.now()}`
        ipcRenderer.once(action, (e, file) => {
          this.conf.outPath = file.toString()
        })
        ipcRenderer.send('app.system.select.dir', {
          action: action,
          name: action,
          title: '保存语言文目录件',
          extensions: ['md']
        })

      },
      getProp(str = '') {
        var strs = this.getProps(str)
        return strs[0] || null
      },
      getProps(str = '') {
        // 匹配 <xxx>
        var strs = str.match(/\<.*?(?=\>)/g)
        strs = strs.map(function (s) {
          return s.replace('<', '')
        })
        return strs
      },
      isInnerProp(str = '') {
        return this.innerProps.indexOf(str) >= 0
      },
      isRemarkProp(str = '') {
        return str.indexOf('_remark_') >= 0
      },
      getRemarkProp(str = '') {
        return str + '_remark_'
      },
      getLang(str = '', langs = null) {
        langs = langs || this.langs
        var lang = langs[str]
        if (!lang) {
          lang = {}
          langs[str] = lang
        }
        return lang
      },
      makeiOSFile(langs) {

        // iOS
        for (let langKey in langs) {
          let lang = langs[langKey]

          var desc = `/**\
          \niOS 语言文件, 该文件自动生成, 不建议手动修改\
          \n如有调整, 联系 @author\
          \n语言: ${lang[this.getRemarkProp('lang')]}\
          \n创建时间: ${new Date()}\
          \n*/\n\n`
          for (let key in lang) {
            let val = lang[key]
            if (this.isInnerProp(key) || this.isRemarkProp(key)) {
              continue
            }
            desc += `/// ${val.remark} \n`
            desc += `"${key}"="${val.value}";\n`
          }
          this.conf.desc += desc
          if (fs.existsSync(this.conf.outPath)) {
            fs.writeFileSync(path.join(this.conf.outPath, langKey + '.strings'), desc)
          }
        }
      },
      makeAndroidFile(langs) {

        // Android
        for (let langKey in langs) {
          let lang = langs[langKey]

          var desc = `<?xml version="1.0" encoding="utf-8"?>\
          \n<!--Android 语言文件, 该文件自动生成, 不建议手动修改 -->\
          \n<!--如有调整, 联系 @author -->\
          \n<!--语言: ${lang[this.getRemarkProp('lang')]} -->\
          \n<!--创建时间: ${new Date()} -->\n
          \n<resources>\n`
          for (let key in lang) {
            let val = lang[key]
            if (this.isInnerProp(key) || this.isRemarkProp(key)) {
              continue
            }
            desc += `  <!-- ${val.remark} -->\n`
            desc += `  <string name="${key}">${val.value}</string>\n`
          }
          desc += `<resources>`
          this.conf.desc += desc
          if (fs.existsSync(this.conf.outPath)) {
            fs.writeFileSync(path.join(this.conf.outPath, 'string.' + langKey + '.xml'), desc)
          }
        }
      },

      transExcelFile(langs) {
        //workbook 对象，指的是整份 Excel 文档。我们在使用 js-xlsx 读取 Excel 文档之后就会获得 workbook 对象。
        var workbook = xlsx.readFile(this.conf.excelPath)
        // 获取 Excel 中所有表名
        const sheetNames = workbook.SheetNames;
        // 根据表名获取对应某张表
        const worksheet = workbook.Sheets[sheetNames[0]];
        //返回json数据
        var datas = xlsx.utils.sheet_to_json(worksheet);

        // 先找到语言支持数量
        var newDatas = []
        for (let index in datas) {
          let line = datas[index]

          var data = {}
          newDatas.push(data)
          for (let fullkey in line) {
            let key = this.getProp(fullkey)
            let cnMark = fullkey.replace(`<${key}>`, '')
            data[key] = line[fullkey]
            data[this.getRemarkProp(key)] = cnMark
          }
        }

        // 生成语言包 excel 结构转换 [{一条多个国家的文案}] 转成 [{一个国家的多条文案}]
        for (let index in newDatas) {
          let line = newDatas[index]

          // 枚举一条文案的所有翻译
          for (let prop in line) {
            if (this.isInnerProp(prop) || this.isRemarkProp(prop)) {
              continue
            }
            var lang = this.getLang(prop, langs)
            lang[this.getRemarkProp('lang')] = line[prop + '_remark_']
            // 添加国际化行
            lang[line['key']] = {
              key: line['key'],
              value: line[prop],
              remark: line['description']
            }
          }
        }
        return this.langs
      },
    }
  }
</script>

<style scoped>
  .app-container {
    height: 100%;
    width: 100%;
  }
</style>
