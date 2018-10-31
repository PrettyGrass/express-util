<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="160px">
      <el-form-item label="组件名">
        <el-col :span="10">
          <el-input :disabled="disablePodName" v-model="form.podName" placeholder="请输入组件名" clearable></el-input>
        </el-col>
        <el-col class="line" :span="4">版本号</el-col>
        <el-col :span="10">
          <el-input v-model="form.podVer" placeholder="请输入版本号" clearable></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="组件资源包">
        <el-upload
                class="upload-demo"
                ref="podZipFile"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-change="handleZipChance"
                :show-file-list="false"
                :auto-upload="false"
                :disabled="form.podVer.length === 0 || form.podName.length === 0"
        >
          <el-button slot="trigger" size="small" :disabled="form.podVer.length === 0 || form.podName.length === 0">
            {{this.podZipFile ? '更换资源:' + this.podZipFile.name:
            '选择组件资源zip包'}}
          </el-button>
          <el-button v-if="this.podZipFile" style="margin-left: 10px;" size="small"
                     @click="zipUpload" :disabled="form.podVer.length === 0 || form.podName.length === 0">上传
          </el-button>
          <div slot="tip" class="el-upload__tip">{{podZipFileUrl}}</div>
        </el-upload>
      </el-form-item>

      <el-form-item label="podspec文件">
        <el-upload
                class="upload-demo"
                ref="podspecFile"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-change="handlePodspecChance"
                :show-file-list="false"
                :auto-upload="false"
                :disabled="form.podVer.length === 0 || form.podName.length === 0"
        >
          <el-button slot="trigger" size="small" :disabled="form.podVer.length === 0 || form.podName.length === 0">
            {{this.podspecFile ? '依赖文件:' + this.podspecFile.name:
            '选择podspec文件'}}
          </el-button>
          <!--<el-button v-if="this.podspecFile" style="margin-left: 10px;" size="small"-->
          <!--@click="submitUpload" :disabled="form.podVer.length === 0 || form.podName.length === 0">上传-->
          <!--</el-button>-->
          <!--<div slot="tip" class="el-upload__tip">{{podspecFileUrl}}</div>-->
        </el-upload>
      </el-form-item>

      <el-form-item>
        <el-button :disabled="!podspecFile || !podZipFile || !form.podVer || !form.podName" type="primary"
                   @click="podspecUpload">确认上传 {{form.podName}}: {{form.podVer}}
        </el-button>
        <!--<el-button @click="onCancel">Cancel</el-button>-->
      </el-form-item>
      <el-form-item label="修改podspec内容">
        <el-input type="textarea" rows="20" v-model="form.podContent"
                  :disabled="form.podVer.length === 0 || form.podName.length === 0"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  // import * as qiniu from 'qiniu-js'
  var qiniu = require('qiniu')
  var fs = require('fs')
  const currentConfig = ipcRenderer.sendSync('app.user.config.current', {sync: true})

  export default {
    data() {
      return {
        disablePodName: false,
        fileList: [],
        podZipFile: null,
        podZipFileUrl: null,
        podspecFile: null,
        podspecFileUrl: null,
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
      this.form.podType = this.$route.params.type
    },
    methods: {
      zipUpload() {
        var type = ''
        switch (this.form.podType) {
          case 'open':
            type = currentConfig.openSourceDir
            break
          case 'opensfw':
            type = currentConfig.openSourceSFWDir
            break
          case 'close':
            type = currentConfig.closeSourceDir
            break
        }

        if (currentConfig.fileCloud === 'qiniu') {
          let key = `${type}/${this.form.podName}/${this.form.podVer}/${this.form.podName}-${this.form.podVer}-libs.zip`
          key = key.replace('//', '/')
          var bucketDomain = currentConfig.qiniuBucketDomain
          this.uploadQiniu(this.podZipFile, key, null, (respErr, respBody, respInfo) => {
            if (respErr) {
              throw respErr;
            }
            if (respInfo.statusCode == 200) {
              this.podZipFileUrl = `${bucketDomain}/${key}`
            } else {
              console.log(respInfo.statusCode);
              console.log(respBody);
            }
          })
        } else {
          return this.$message.warning('暂未支持的云盘')
        }
      },
      uploadQiniu(file, key, mimeType = null, callback) {
        var accessKey = currentConfig.qiniuAccessKey;
        var secretKey = currentConfig.qiniuSecretKey;
        var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        var config = new qiniu.conf.Config();
        var options = {
          scope: currentConfig.qiniuBucket,
        };
        var putPolicy = new qiniu.rs.PutPolicy(options);
        var uploadToken = putPolicy.uploadToken(mac);
        var formUploader = new qiniu.form_up.FormUploader(config);
        var putExtra = new qiniu.form_up.PutExtra();
        if (mimeType) {
          putExtra.mimeType = mimeType
        }
        // 文件上传
        if (file && file.raw && file.raw.path) {
          file = file.raw.path
          formUploader.putFile(uploadToken, key, file, putExtra, callback);
        } else {
          formUploader.put(uploadToken, key, file, putExtra, callback);
        }
      },
      podspecUpload() {
        var type = ''
        switch (this.form.podType) {
          case 'open':
            type = currentConfig.openSourceDir
            break
          case 'close':
            type = currentConfig.closeSourceDir
            break
        }

        if (currentConfig.fileCloud === 'qiniu') {
          let key = `${type}/${this.form.podName}/${this.form.podVer}.podspec`
          key = key.replace('//', '/')
          var bucketDomain = currentConfig.qiniuBucketDomain
          var blob = Buffer(this.form.podContent);
          this.uploadQiniu(blob, key, 'text/plain; charset=utf-8', (respErr, respBody, respInfo) => {
            if (respErr) {
              throw respErr;
            }
            if (respInfo.statusCode == 200) {
              this.podspecFileUrl = `${bucketDomain}/${key}`.replace('//', '/')
              this.$router.go(-1)
              return this.$message.success('上传成功!')
            } else {
              console.log(respInfo.statusCode);
              console.log(respBody);
            }
          })
        } else {
          return this.$message.warning('暂未支持的云盘')
        }
      },
      handleZipChance(file) {

        if (file.name.split('.').pop().toLowerCase() !== 'zip') {
          return this.$message.warning('需要选择zip文件!')
        }
        this.podZipFile = file
      },
      handlePodspecChance(file) {

        if (file.name.split('.').pop().toLowerCase() !== 'podspec') {
          return this.$message.warning('需要选择podspec文件!')
        }
        this.podspecFile = file
        fs.readFile(file.raw.path, 'utf8', (err, data) => {
          this.form.podContent = data;
        });
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>

