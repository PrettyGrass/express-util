<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="120px">
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
        <el-button v-if="currentConf.id === 'add'" type="primary" :disabled="newName === ''" @click="addAction">创建</el-button>
        <el-button v-if="currentConf.id !== 'add'" type="danger" @click="delAction">删除</el-button>
      </el-form-item>


      <el-form-item label="七牛 Appkey">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="七牛 Appkey">
        <el-select v-model="form.region" placeholder="please select your zone">
          <el-option label="Zone one" value="shanghai"></el-option>
          <el-option label="Zone two" value="beijing"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Activity time">
        <el-col :span="11">
          <el-date-picker type="date" placeholder="Pick a date" v-model="form.date1"
                          style="width: 100%;"></el-date-picker>
        </el-col>
        <el-col class="line" :span="2">-</el-col>
        <el-col :span="11">
          <el-time-picker type="fixed-time" placeholder="Pick a time" v-model="form.date2"
                          style="width: 100%;"></el-time-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="Instant delivery">
        <el-switch v-model="form.delivery"></el-switch>
      </el-form-item>
      <el-form-item label="Activity type">
        <el-checkbox-group v-model="form.type">
          <el-checkbox label="Online activities" name="type"></el-checkbox>
          <el-checkbox label="Promotion activities" name="type"></el-checkbox>
          <el-checkbox label="Offline activities" name="type"></el-checkbox>
          <el-checkbox label="Simple brand exposure" name="type"></el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="Resources">
        <el-radio-group v-model="form.resource">
          <el-radio label="Sponsor"></el-radio>
          <el-radio label="Venue"></el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Activity form">
        <el-input type="textarea" v-model="form.desc"></el-input>
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
        currentConfId: 'add',
        newName: '',
        currentConf: {},
        fileList: [],
        form: {
          name: '',
          region: '',
          date1: '',
          date2: '',
          delivery: false,
          type: [],
          resource: '',
          desc: ''
        }
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
          name: '<添加新配置>'
        }
        this.currentConfId = this.config.currentConfId || 'add'
        this.currentConf = this.confs[this.config.currentConfId] || {}
        this.form.desc = JSON.stringify(this.config)
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
      configChange() {
        this.currentConf = this.confs[this.currentConfId]
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>

