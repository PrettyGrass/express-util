<template>
  <div class="app-container">
    <el-form ref="form" :model="currentConf" label-width="120px">
      <el-form-item label="配置名">
        <el-col :span="5">
          <el-select v-model="currentConfId" @change="configChange(this)" placeholder="请选择配置">
            <el-option
                    v-for="conf in confs"
                    :key="conf.id"
                    :label="conf.name"
                    :value="conf.id">
            </el-option>

          </el-select>

        </el-col>
        <el-col :span="2" style="text-align: center">配置</el-col>
        <el-col :span="5" style="margin-right: 12px">
          <el-input v-model="newName" placeholder="输入配置名称"></el-input>
        </el-col>
        <el-button v-if="currentConf.id !== 'add'" type="primary" @click="updateAction">更新</el-button>
        <el-button v-if="currentConf.id === 'add'" type="primary" :disabled="newName === ''" @click="addAction">创建
        </el-button>
        <el-button v-if="currentConf.id !== 'add'" type="danger" @click="delAction">删除</el-button>
      </el-form-item>

      <el-form-item label="配置地址">
        {{config.confPath}}
      </el-form-item>

      <el-form-item label="七牛 AccessKey">
        <el-col :span="4">
          <el-input type="text" v-model="currentConf.qiniuAccessKey"></el-input>
        </el-col>
        <el-col class="line" :span="3">七牛 SecretKey</el-col>
        <el-col :span="4">
          <el-input type="text" v-model="currentConf.qiniuSecretKey"></el-input>
        </el-col>
        <el-col class="line" :span="3">七牛 bucket</el-col>
        <el-col :span="4">
          <el-input type="text" v-model="currentConf.qiniuBucket"></el-input>
        </el-col>
      </el-form-item>


      <el-form-item label="OSS AccessKey">
        <el-col :span="4">
          <el-input type="text" v-model="currentConf.aliossAccessKey"></el-input>
        </el-col>
        <el-col class="line" :span="3">OSS SecretKey</el-col>
        <el-col :span="4">
          <el-input type="text" v-model="currentConf.aliossSecretKey"></el-input>
        </el-col>
        <el-col class="line" :span="3">OSS bucket</el-col>
        <el-col :span="4">
          <el-input type="text" v-model="currentConf.aliossBucket"></el-input>
        </el-col>

      </el-form-item>

      <el-form-item label="OSS RoleArn">

        <el-col :span="4">
          <el-input type="text" v-model="currentConf.aliossRoleArn"></el-input>
        </el-col>
        <el-col class="line" :span="3">OSS policy</el-col>
        <el-col :span="4">
          <el-input type="text" v-model="currentConf.aliossPolicy"></el-input>
        </el-col>
        <el-col class="line" :span="3">OSS region</el-col>
        <el-col :span="4">
          <el-input type="text" v-model="currentConf.aliossRegion"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="GIT内容仓库" v-for="git in gits">
        <el-col :span="5">
          <el-input v-model="git.url" placeholder="GIT内容仓库地址"></el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">分支</el-col>
        <el-col :span="5" style="margin-right: 12px">
          <el-input v-model="git.branch" placeholder="输入分支"></el-input>
        </el-col>
        <el-button type="danger" @click="delGitAction(git)">删除</el-button>
      </el-form-item>

      <el-form-item label="添加GIT内容仓库">
        <el-col :span="5">
          <el-input v-model="newGit.url" placeholder="GIT内容仓库地址"></el-input>
        </el-col>
        <el-col :span="2" style="text-align: center">分支</el-col>
        <el-col :span="5" style="margin-right: 12px">
          <el-input v-model="newGit.branch" placeholder="输入分支"></el-input>
        </el-col>
        <el-button type="primary" :disabled="newGit.url === ''" @click="addGitAction(newGit)">创建</el-button>
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
        newGit: {branch: 'msater'},
        currentConfId: 'add',
        newName: '',
        currentConf: {},
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
        ipcRenderer.send('app.user.config.del', this.currentConf)
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
        this.newGit = {branch: 'master'}
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

