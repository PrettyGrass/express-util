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

      <el-form-item label="日志">
        <el-input type="textarea" :autosize="{ minRows: 16, maxRows: 16}" v-model="conf.desc"></el-input>
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
  import {ipcRenderer} from 'electron'

  const fs = require('fs')
  const path = require('path')
  const xlsx = require('xlsx')
  const trans = require('../../../cli/excel-to-string')

  export default {
    data() {
      return {
        conf: {
          outPath: '',
          excelPath: '',
          desc: '',

        },
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
          title: '选择Excel文件'
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

        trans.log = (msg) => {
          this.conf.desc += `${msg}\n`
        }
        trans.conf.h5 = true
        trans.conf.ios = true
        trans.conf.android = true
        trans.conf.excelPath = this.conf.excelPath
        trans.conf.outPath = this.conf.outPath
        trans.transAction()
      },
      outPathAction() {
        var action = `action${Date.now()}`
        ipcRenderer.once(action, (e, file) => {
          this.conf.outPath = file.toString()
        })
        ipcRenderer.send('app.system.select.dir', {
          action: action,
          name: action,
          title: '保存语言文目录件'
        })
      }
    }

  }
</script>

<style scoped>
  .app-container {
    height: 100%;
    width: 100%;
  }
</style>
