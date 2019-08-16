<template>
  <div class="app-container">
    <el-form :model="currentConf" label-width="160px" ref="form">
      <el-form-item label="配置">
        <el-col :span="5">
          <el-select @change="configChange(this)" placeholder="请选择配置" v-model="currentConfId">
            <el-option
                    :key="conf.id"
                    :label="conf.name"
                    :value="conf.id"
                    v-for="conf in confs">
            </el-option>

          </el-select>

        </el-col>
        <el-col :span="2" style="text-align: center">新名称</el-col>
        <el-col :span="5" style="margin-right: 12px">
          <el-input placeholder="输入配置名称" v-model="newName"></el-input>
        </el-col>
        <el-button @click="updateAction" type="primary" v-if="currentConf.id !== 'add'">更新</el-button>
        <el-button :disabled="newName === ''" @click="addAction" type="primary" v-if="currentConf.id === 'add'">创建
        </el-button>
        <el-button @click="delAction" type="danger" v-if="currentConf.id !== 'add'">删除</el-button>
      </el-form-item>

      <el-form-item label="配置文件地址">{{config.confPath}}</el-form-item>

      <el-form-item label="文件服务器">
        <el-select placeholder="请选择文件服务器" v-model="currentConf.fileCloud">
          <el-option
                  :key="conf.type"
                  :label="conf.name"
                  :value="conf.type"
                  v-for="conf in fileClouds">
          </el-option>

        </el-select>
      </el-form-item>

      <el-form-item label="开源组件目录">
        <el-input type="text" v-model="currentConf.openSourceDir"></el-input>
      </el-form-item>
      <!--<el-form-item label="定制组件目录">-->
      <!--<el-input type="text" v-model="currentConf.openSourceCustomDir"></el-input>-->
      <!--</el-form-item>-->
      <el-form-item label="开源组件静态FW目录">
        <el-input type="text" v-model="currentConf.openSourceSFWDir"></el-input>
      </el-form-item>
      <el-form-item label="开源组件源码镜像目录">
        <el-input type="text" v-model="currentConf.openSourceMirrorDir"></el-input>
      </el-form-item>
      <el-form-item label="闭源组件目录">
        <el-input type="text" v-model="currentConf.closeSourceDir"></el-input>
      </el-form-item>
      <el-form-item label="内部组件目录">
        <el-input type="text" v-model="currentConf.innerSourceDir"></el-input>
      </el-form-item>

      <el-form-item label="域名">
        <el-input type="text" v-model="currentConf.qiniuBucketDomain"></el-input>
      </el-form-item>

      <div v-if="currentConf.fileCloud === 'qiniu'">
        <el-form-item label="七牛 AccessKey">
          <el-input type="text" v-model="currentConf.qiniuAccessKey"></el-input>
        </el-form-item>
        <el-form-item label="七牛 SecretKey">
          <el-input type="text" v-model="currentConf.qiniuSecretKey"></el-input>
        </el-form-item>
        <el-form-item label="七牛 bucket">
          <el-input type="text" v-model="currentConf.qiniuBucket"></el-input>
        </el-form-item>
      </div>

      <div v-if="currentConf.fileCloud === 'oss'">
        <el-form-item label="OSS AccessKey">
          <el-input type="text" v-model="currentConf.aliossAccessKey"></el-input>
        </el-form-item>
        <el-form-item label="OSS SecretKey">
          <el-input type="text" v-model="currentConf.aliossSecretKey"></el-input>
        </el-form-item>
        <el-form-item label="OSS bucket">
          <el-input type="text" v-model="currentConf.aliossBucket"></el-input>
        </el-form-item>
        <el-form-item label="OSS RoleArn">
          <el-input type="text" v-model="currentConf.aliossRoleArn"></el-input>
        </el-form-item>
        <el-form-item label="OSS Policy">
          <el-input type="text" v-model="currentConf.aliossPolicy"></el-input>
        </el-form-item>
        <el-form-item label="OSS Region">
          <el-input type="text" v-model="currentConf.aliossRegion"></el-input>
        </el-form-item>
      </div>
      <el-form-item label="GIT内容仓库" v-for="git in gits">
        <el-col :span="10">
          <el-input disabled placeholder="GIT内容仓库地址" v-model="git.url"></el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">分支</el-col>
        <el-col :span="5" style="margin-right: 12px">
          <el-input disabled placeholder="输入分支" v-model="git.branch"></el-input>
        </el-col>
        <el-button @click="delGitAction(git)" type="danger">删除</el-button>
      </el-form-item>
      <el-form-item label="添加GIT内容仓库">
        <el-col :span="10">
          <el-input placeholder="GIT内容仓库地址" v-model="newGit.url"></el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">分支</el-col>
        <el-col :span="5" style="margin-right: 12px">
          <el-input placeholder="输入分支" v-model="newGit.branch"></el-input>
        </el-col>
        <el-button :disabled="newGit.url === ''" @click="addGitAction(newGit)" type="primary">创建</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'

  export default {
    data() {
      return {
        config: {},
        confs: {},
        gits: [],
        newGit: {branch: 'msater', url: ''},
        currentConfId: 'add',
        newName: '',
        currentConf: {},
        fileClouds: [{name: '七牛', type: 'qiniu'}, {name: '阿里OSS', type: 'oss'}]
      }
    },
    created() {
      ipcRenderer.on('app.user.config.update', (event, arg) => {
        this.getAction(arg)
      })
      ipcRenderer.send('app.user.config.get')
    },
    methods: {

      addAction() {
        if (!this.newName) {
          return
        }
        this.currentConf.name = this.newName
        ipcRenderer.send('app.user.config.add', this.currentConf)
      },
      getAction(config) {
        this.config = config
        this.confs = this.config.confs
        this.confs.add = {
          id: 'add',
          name: '<增加新配置>'
        }
        this.currentConfId = this.config.currentConfId || 'add'
        this.configChange()
      },
      delAction() {
        this.$confirm('删除配置后无法恢复, 是否继续?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          ipcRenderer.send('app.user.config.del', this.currentConf)
        }).catch(() => {
        });
      },
      updateAction() {
        if (this.newName.length) {
          this.currentConf.name = this.newName
        }
        ipcRenderer.send('app.user.config.update', this.currentConf)
      },

      addGitAction(git) {
        var newGit = {}
        for (let key in git) {
          newGit[key] = git[key]
        }
        this.newGit = {branch: 'master', url: ''}
        this.gits.push(newGit)
      },
      delGitAction(git) {
        this.gits.splice(this.gits.indexOf(git), 1)
      },
      configChange() {
        this.currentConf = this.confs[this.currentConfId]
        this.newName = ''
        if (!this.currentConf.gits) {
          this.currentConf.gits = []
        }
        this.gits = this.currentConf.gits
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>

