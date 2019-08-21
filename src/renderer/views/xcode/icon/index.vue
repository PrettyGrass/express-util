<template>
  <div class="app-container">
    <el-form ref="form" label-width="160px">
      <h3 style="text-align: center">python 环境需要依赖PIL库</h3>
      <h4 style="text-align: center">$ pip install PIL</h4>

       <el-col :span="14" style="text-align: center">
       </el-col>
      </el-form-item>

      <el-form-item label="源图片目录">
        <el-col :span="16" style="text-align: center">
        <el-input type="text" placeholder="图标或者启动图目录" v-model="originPath"></el-input>
      </el-col>
        <el-col :span="2" style="text-align: center">
          <el-button @click="originPathAction">选择</el-button>
        </el-col>
      </el-form-item>

      <el-form-item label="新图片目录">
        <el-col :span="16" style="text-align: center">
          <el-input placeholder="新素材目录" v-model="newPath" > </el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">
          <el-button @click="newPathAction">选择</el-button>
        </el-col>
      </el-form-item>

      <el-form-item label="日志">
        <el-col :span="18">
          <el-input type="textarea" :autosize="{ minRows: 12, maxRows: 12}" v-model="desc"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!newPath || !originPath" type="primary"
                   @click="renameAction">开始替换
        </el-button>

      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  import {logout} from "../../../api/login";
  // import app from "../../../store/modules/app";
  var fs = require('fs')
  var path = require('path')
  const { app } = require('electron')
  // const xcodeConf = ipcRenderer.sendSync('app.user.config.name', {name: "xcode"})

  export default {
    data() {
      return {
        originPath: '',
        newPath: '',
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
      newPathAction() {
        var action = `action${Date.now()}`
        ipcRenderer.once(action, (e, file) => {
          this.newPath = file.toString()
        })
        ipcRenderer.send('app.system.select.dir', {
          action: action,
          name: action,
          title: '新素材图片文件目录',
          extensions: ['md']
        })
      },
      renameAction() {
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
          scriptName: "export.py"
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

