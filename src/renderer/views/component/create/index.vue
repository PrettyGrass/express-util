<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="160px">
      <el-form-item label="组件名">
        <el-col :span="11">
          <el-input :disabled="disablePodName" v-model="form.podName" placeholder="请输入组件名"></el-input>
        </el-col>
        <el-col class="line" :span="2">- 版本号</el-col>
        <el-col :span="11">
          <el-input v-model="form.podVer" placeholder="请输入版本号"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="上传组件资源包">
        <el-upload
                :auto-upload="false"
                class="upload-demo"
                drag
                action="https://jsonplaceholder.typicode.com/posts/"
                multiple>
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-form-item>

      <el-form-item label="上传组件依赖文件">
        <el-upload
                class="upload-demo"
                ref="upload"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :file-list="fileList"
                :auto-upload="false">
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
      </el-form-item>

      <el-form-item label="修改podspec内容">
        <el-input type="textarea" rows="20" v-model="form.podContent"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSubmit">Create</el-button>
        <el-button @click="onCancel">Cancel</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  import * as qiniu from 'qiniu-js'

  export default {
    data() {
      return {
        disablePodName: false,
        fileList: [],
        form: {
          podName: '',
          podVer: '',
          podType: '',
          podContent: ''
        }
      }
    },
    created() {
      let podName = this.$route.query.podName
      if (podName && podName.length > 0) {
        this.form.podName = podName
        this.disablePodName = true
      }
      this.podType = this.$route.params.type

      ipcRenderer.on('asynchronous-reply', (event, arg) => {
        this.form.desc = arg
      })
    },
    methods: {
      onSubmit() {
        this.$message('submit!')
        ipcRenderer.send('test', 'ping')
        //this.form.desc = ipcRenderer.sendSync('app.path', 'userData')

      },
      onCancel() {
        this.$message({
          message: 'cancel!',
          type: 'warning'
        })
      },
      submitUpload() {
        console.log('上传', qiniu, this.$refs.upload, this.fileList);
      },
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePreview(file) {
        console.log(file);
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>

