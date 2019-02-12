<template>
  <div class="app-container">
    <el-form ref="form" label-width="200px">
      <h3 style="text-align: center">需要拉取DTAppUITemplate仓库</h3>

      <el-col :span="14" style="text-align: center">
      </el-col>
      </el-form-item>

      <el-form-item label="目录">
        <el-col :span="7" style="text-align: center">
          <el-input type="text" placeholder="DTAppUITemplate目录" v-model="sourcePath"></el-input>
        </el-col>
              <el-col :span="2" style="text-align: center">
                <el-button @click="sourcePathAction">选择</el-button>
              </el-col>

              <el-col :span="7" style="text-align: center">
                <el-input placeholder="创建目录" v-model="newPath" > </el-input>
          </el-col>
          <el-col :span="2" style="text-align: center">
            <el-button @click="newPathAction">选择</el-button>
          </el-col>

      </el-form-item>

      <el-form-item label="工程参数必选">

        <el-col :span="3" style="text-align: center">
          <el-input placeholder="项目名" v-model="projectName" > </el-input>
        </el-col>

        <el-col :span="3">
          <el-input type="text" placeholder="项目前缀" v-model="prefixName"></el-input>
        </el-col>

        <el-col :span="3">
          <el-input type="text" placeholder="BundleId" v-model="bundleId"></el-input>
        </el-col>

        <el-col :span="3">
          <el-input type="text" placeholder="应用名" v-model="displayName"></el-input>
        </el-col>


      </el-form-item>

      <el-form-item label="工程参数可选">

        <el-col :span="5" style="text-align: center">
          <el-input type="text" placeholder="开发target名  " v-model="developTarget"></el-input>
        </el-col>
        <el-col :span="5" style="text-align: center">
          <el-input type="text" placeholder="发布target名" v-model="productTarget"></el-input>
        </el-col>
        <el-col :span="5" style="text-align: center">
          <el-input type="text" placeholder="内部应用名(默认 = 应用名)" v-model="displayInnerName"></el-input>
        </el-col>

      </el-form-item>

      <el-form-item label="日志">
        <el-col :span="18">
          <el-input type="textarea" :autosize="{ minRows: 12, maxRows: 12}" v-model="desc"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item>
        <el-button :disabled="!sourcePath || !newPath|| !prefixName|| !projectName|| !bundleId|| !displayName" type="primary"
                   @click="creatAction">开始创建
        </el-button>

      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  var fs = require('fs')
  var path = require('path')
  const { app } = require('electron')

  export default {
    data() {
      return {
        sourcePath: '',
        newPath: '',
        prefixName: '',
        projectName: '',
        bundleId:'',
        displayName:'',
        displayInnerName:'',
        developTarget:'app-dev',
        productTarget:'app-store',
        desc:''
      }
    },

    methods: {
      sourcePathAction() {

        var action = `action${Date.now()}`
        let self = this
        ipcRenderer.once(action,(e, file) => {
          self.sourcePath = file.toString()
        })
        ipcRenderer.send('app.system.select.dir', {
          action: action,
          name: action,
          title: '文件目录',
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
          title: '文件目录',
          extensions: ['md']
        })
      },
      creatAction() {
        this.desc = ""
        var action = `action${Date.now()}`
        ipcRenderer.on(action, (e, data) => {
          if (data.code == 0) {
            this.desc += data.data
          }
        })

        if (this.displayInnerName == '') {
          this.displayInnerName = this.displayName
        }
       // alert([this.prefixName,this.projectName,this.bundleId,this.displayName,this.displayInnerName ,this.developTarget,this.productTarget,this.newPath])
        ipcRenderer.send('app.cmd.exec.async', {
          shell: 'bash',
          params: [this.prefixName,this.projectName,this.bundleId,this.displayName,this.displayInnerName ,this.developTarget,this.productTarget,this.newPath,this.sourcePath],
          action: action,
          fromAssets: false,
          scriptPath: `${this.sourcePath}/一键新建项目脚本.sh`
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

