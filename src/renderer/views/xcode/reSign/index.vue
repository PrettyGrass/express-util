<template>
  <div class="app-container">
    <el-form ref="form" label-width="160px">
      </el-form-item>
      <el-form-item label="ipa路径">
        <el-col :span="14" style="text-align: center">
          <el-input type="text" placeholder="iap全路径" v-model="ipaPath"></el-input>
        </el-col>
        <el-col :span="3" style="text-align: center">
          <el-button @click="originPathAction">选择</el-button>
        </el-col>
      </el-form-item>

      <el-form-item label="输出文件夹">
        <el-col :span="14" style="text-align: center">
          <el-input type="text" placeholder="重签输出路径" v-model="outPutPath"></el-input>
        </el-col>
        <el-col :span="3" style="text-align: center">
          <el-button @click="outPutPathAction">选择</el-button>
        </el-col>
      </el-form-item>

      <el-form-item label="moblieprovision路径">
        <el-col :span="14" style="text-align: center">
          <el-input type="text" placeholder="描述文件全路径" v-model="moblieProvisionPath"></el-input>
        </el-col>
        <!--<el-col :span="3" style="text-align: center">-->
          <!--<el-button style="background: #0E9A00 ; color: #ffffff;"  @click="moblieProvisiondDefaultAction">默认</el-button>-->
        <!--</el-col>-->
        <el-col :span="3" style="text-align: center">
          <el-button @click="moblieProvisionAction">选择</el-button>
        </el-col>
      </el-form-item>

      <el-form-item label="证书名称">
        <el-col :span="16" style="text-align: center">
          <el-input type="text" placeholder="证书全名称" v-model="distrubutionName"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="日志">
        <el-col :span="16">
          <el-input type="textarea" :autosize="{ minRows: 12, maxRows: 12}" v-model="desc"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!ipaPath || !moblieProvisionPath || !distrubutionName" type="primary"
                   @click="reSignAction">重签
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
        ipaPath: '',
        outPutPath:'',
        moblieProvisionPath:'',
        distrubutionName:'iPhone Distribution: Shenzhen Big Head Brothers Culture Communication Co., Ltd.',
        desc: '',
      }
    },

    methods: {

      originPathAction() {

        var action = `action${Date.now()}`
        let self = this
        ipcRenderer.once(action,(e, file) => {
          self.ipaPath = file.toString()
        })
        ipcRenderer.send('app.system.select.file', {
          action: action,
          name: action,
          title: 'ipa文件目录',
          extensions: ['.ipa']
        })
      },

      outPutPathAction() {

        var action = `action${Date.now()}`
        let self = this
        ipcRenderer.once(action,(e, file) => {
          self.outPutPath = file.toString()
        })
        ipcRenderer.send('app.system.select.dir', {
          action: action,
          name: action,
          title: 'outPut',
          extensions: ['md']
        })
      },

      moblieProvisionAction() {

        var action = `action${Date.now()}`
        let self = this
        ipcRenderer.once(action,(e, file) => {
          self.moblieProvisionPath = file.toString()
        })
        ipcRenderer.send('app.system.select.file', {
          action: action,
          name: action,
          title: 'mob文件目录',
          extensions: ['md']
        })
      },

      moblieProvisiondDefaultAction() {
        //
        // alert(__dirname)
        // app.getPath(home)
        //
        // alert(app)
        // alert(app.getPath("ent_qutui36020170908.mobileprovision"))
        // path = path.join(global.__root, `assets/ent_qutui36020170908.mobileprovision`)
        // alert("path")
      },


      reSignAction() {
        this.desc = ""
        var action = `action${Date.now()}`
        ipcRenderer.on(action, (e, data) => {
          if (data.code == 0) {
            this.desc += data.data
          }
        })

        ipcRenderer.send('app.cmd.exec.async', {
          shell: 'sh',
          params: [this.ipaPath ,this.distrubutionName,this.moblieProvisionPath,this.outPutPath],
          action: action,
          fromAssets: true,
          scriptName: "reSignApp.sh",
          scriptPath: ""
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

