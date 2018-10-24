<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="160px">


      <el-form-item label="重命名的目录">
        <el-col :span="16" style="text-align: center">
          <el-input type="text" v-model="outPath"></el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">
          <el-button @click="outPathAction">选择</el-button>
        </el-col>
      </el-form-item>

      <el-form-item label="要重命名的段落">
        <el-col :span="7">
          <el-input v-model="oldName" placeholder="请输入重命名的段落" clearable></el-input>
        </el-col>
        <el-col class="line" :span="2">重新命名</el-col>
        <el-col :span="7">
          <el-input v-model="newName" placeholder="请输入新的段落名" clearable></el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">
          <el-button @click="outPathAction">添加</el-button>
        </el-col>
      </el-form-item>
      <el-form-item label="日志">
        <el-col :span="18">
          <el-input type="textarea" :autosize="{ minRows: 12, maxRows: 12}" v-model="desc"></el-input>
        </el-col>
      </el-form-item>
      <el-form-item>
        <el-button :disabled="!oldName || !newName || !outPath" type="primary"
                   @click="renameAction">开始
        </el-button>
        <!--<el-button @click="onCancel">Cancel</el-button>-->
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'

  var fs = require('fs')
  const currentConfig = ipcRenderer.sendSync('app.user.config.current', {sync: true})

  export default {
    data() {
      return {
        outPath: '',
        oldName: '',
        newName: '',
        desc: '',
      }
    },
    created() {
      let podName = this.$route.query.podName
      if (podName && podName.length > 0) {
        this.form.podName = podName
        this.disablePodName = true
      }
      this.form.podType = this.$route.params.type
    },
    methods: {
      outPathAction() {
        var action = `action${Date.now()}`
        ipcRenderer.once(action, (e, file) => {
          this.outPath = file.toString()
        })
        ipcRenderer.send('app.system.select.dir', {
          action: action,
          name: action,
          title: '保存语言文目录件',
          extensions: ['md']
        })
      },
      renameAction() {

      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>

