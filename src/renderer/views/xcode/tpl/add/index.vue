<template>
  <div class="app-container">
    <el-form label-width="160px">


      <el-form-item label="工程目录">
        <el-col :span="18">
          <el-input disabled type="text" v-model="projectPath"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="添加目标目录">
        <el-col :span="18">
          <el-input disabled type="text" v-model="addRootPath"></el-input>
        </el-col>
      </el-form-item>

      <el-form-item label="添加模块类型">
        <el-col :span="18">

          <el-radio-group v-model="type">
            <el-radio label="vc">控制器</el-radio>
            <el-radio label="view">视图</el-radio>
            <el-radio label="tablecell">Table Cell</el-radio>
            <el-radio label="collectcell">Collect Cell</el-radio>
          </el-radio-group>
        </el-col>
      </el-form-item>

      <el-form-item v-if="type === 'vc'" label="添加模块类型">
        <el-col :span="18">

          <el-checkbox-group v-model="subTypes">
            <el-checkbox label="view"></el-checkbox>
            <el-checkbox label="tablecell"></el-checkbox>
            <el-checkbox label="collectcell"></el-checkbox>
            <el-checkbox label="submod">建子模块</el-checkbox>
            <!--<el-checkbox label="选中且禁用" disabled></el-checkbox>-->
          </el-checkbox-group>
        </el-col>
      </el-form-item>

      <el-form-item v-if="type === 'vc'" label="控制器">
        <el-col :span="6">
          <el-input clearable type="text" v-model="vcName"></el-input>
        </el-col>
        <el-col :span="4">
          <!-- <el-input type="text" v-model="projectPath"></el-input> -->
          <el-select clearable style="width: 90%;padding-left: 12px" v-model="vcType"
                     placeholder="控制器类型">
            <el-option v-for="path in vcTypes" :label="path.name" :key="path.name" :value="path.file">
            </el-option>

          </el-select>
        </el-col>
        <el-col :span="6">
          <div>文件名: {{vcNameFull}}</div>
        </el-col>
      </el-form-item>

      <el-form-item v-if="subTypes.includes('view') || type == 'view'" label="视图">
        <el-col :span="6">
          <el-input clearable type="text" v-model="viewName"></el-input>
        </el-col>
        <el-col :span="4">
          <!-- <el-input type="text" v-model="projectPath"></el-input> -->
          <el-select clearable style="width: 90%;padding-left: 12px" v-model="viewType"
                     placeholder="视图类型">
            <el-option v-for="path in viewTypes" :label="path.name" :key="path.name" :value="path.file">
            </el-option>

          </el-select>
        </el-col>
        <el-col :span="6">
          <div>文件名: {{viewNameFull}}</div>
        </el-col>
      </el-form-item>

      <el-form-item v-if="subTypes.includes('tablecell') || type == 'tablecell'" label="Table Cell">
        <el-col :span="6">
          <el-input clearable type="text" v-model="tabCellName"></el-input>
        </el-col>
        <el-col :span="6">
          <div>文件名: {{tabCellNameFull}}</div>
        </el-col>
      </el-form-item>

      <el-form-item v-if="subTypes.includes('collectcell') || type == 'collectcell'" label="Collect Cell">
        <el-col :span="6">
          <el-input clearable type="text" v-model="collectCellName"></el-input>
        </el-col>
        <el-col :span="6">
          <div>文件名: {{collectCellNameFull}}</div>
        </el-col>
      </el-form-item>


      <!-- <el-form-item label="要重命名的段落">
          <el-col :span="7">
            <el-input v-model="oldName" placeholder="请输入重命名的段落" clearable></el-input>
          </el-col>
          <el-col class="line" :span="2">重新命名</el-col>
          <el-col :span="7">
            <el-input v-model="newName" placeholder="请输入新的段落名" clearable></el-input>
          </el-col>
          <el-col :span="2" style="text-align: center">
            <el-button @click="projectPathAction">添加</el-button>
          </el-col>
        </el-form-item> -->

      <el-form-item>
        <!--<el-button type="primary" @click="initPod">初始化-->
        <!--</el-button>-->
        <el-button @click="install">安装</el-button>
        <!--<el-button @click="updateAll">更新全部</el-button>-->
        <!--<el-button @click="updateAllInner">更新自研组件</el-button>-->
        <!--<el-button :disabled="this.originPodContent === this.podContent" @click="savePodfile">保存podfile</el-button>-->
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {
    ipcRenderer
  } from 'electron'

  var fs = require('fs')
  var path = require('path')
  const currentConfig = ipcRenderer.sendSync('app.user.config.current', {
    sync: true
  })

  export default {
    data() {
      return {
        projectPath: '',
        addRootPath: '',
        addRootPathName: '',

        vcTypes: [
          {name: '静态Table', file: '静态Table'},
          {name: '动态Table', file: '动态Table'}
        ],
        vcType: '',
        viewTypes: [
          {name: 'View', file: 'View'},
          {name: 'View(xib)', file: 'View(xib)'},
        ],
        viewType: '',

        type: 'vc', /// vc控制器, view视图, tablecell collectcell
        subTypes: [],
        vcName: '',
        viewName: '',
        tabCellName: '',
        collectCellName: '',

        vcNameFull: '',
        viewNameFull: '',
        tabCellNameFull: '',
        collectCellNameFull: ''
      }
    },
    created() {
      this.projectPath = this.$route.query.proj
      this.addRootPath = this.$route.query.path
      this.addRootPathName = this.$route.query.name

    },
    watch: {
      tabCellName(val) {
        this.tabCellNameFull = this.toUpper(`${val} cell`)
      },
      collectCellName(val) {
        this.collectCellNameFull = this.toUpper(`${val} coll`)
      },
      viewName(val) {
        this.viewNameFull = this.toUpper(`${val} view`)
      },
      vcName(val) {
        this.vcNameFull = this.toUpper(`${val} controller`)
        if (this.viewName === '')
          this.viewNameFull = this.toUpper(`${val} view`)
      },
      type(val) {
        if (val !== 'vc')
          while (this.subTypes.length) {
            this.subTypes.pop()
          }
      }
    },
    methods: {
      install() {
        // 模板改名

      },
      toUpper(str = '') {
        let strs = str.replace('  ', ' ').split(' ')
        var targetStr = ''
        for (let i = 0; i < strs.length; i++) {
          let s = strs[i]
          targetStr += s.replace(/(\w)/, function (all, letter) {
            return letter.toUpperCase();
          });
        }
        return targetStr
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
