<template>
  <div class="app-container">
    <el-form ref="form" label-width="160px">
      </el-form-item>
      <el-form-item label="xcode工程目录">
        <el-col :span="16" style="text-align: center">
          <el-input type="text" placeholder="根目录下的class目录" v-model="originPath"></el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">
          <el-button @click="originPathAction">选择</el-button>
        </el-col>
      </el-form-item>

      <el-form-item label="日志">
        <el-col :span="18">
          <el-input type="textarea" :autosize="{ minRows: 12, maxRows: 12}" v-model="desc"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!originPath" type="primary"
                   @click="searchAction">查找
        </el-button>

      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  import {logout} from "../../../api/login";
  var fs = require('fs')
  var path = require('path')
  const { app } = require('electron')

  export default {
    data() {
      return {
        originPath: '',
        desc: '',
      }
    },

    methods: {
      originPathAction() {

        var action = `action${Date.now()}`
        let self = this
        ipcRenderer.once(action,(e, file) => {
          self.originPath = file.toString()
        })
        ipcRenderer.send('app.system.select.dir', {
          action: action,
          name: action,
          title: '源目标图片文件目录',
          extensions: ['md']
        })
      },

      searchAction() {
        this.desc = ""
        var action = `action${Date.now()}`
        ipcRenderer.on(action, (e, data) => {
          if (data.code == 0) {
            this.desc = data.data
          }
        })
        ipcRenderer.send('app.cmd.exec.async', {
          shell: 'python',
          params: [this.originPath ,this.newPath],
          action: action,
          fromAssets: true,
          scriptName: "replaceAppIcon.py"
        })
      },
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>

