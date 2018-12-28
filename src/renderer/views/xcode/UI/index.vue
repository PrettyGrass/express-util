<template>

  <el-form ref="form" :model="form" label-width="160px">

    <el-form-item label="工程目录">
      <el-col :span="16">
        <!-- <el-input type="text" v-model="projectPath"></el-input> -->
        <el-select clearable style="width: 100%;" v-model="xcodeConf.currentPath" @change="projectChange"
                   placeholder="请选择工程目录">
          <el-option v-for="path in xcodeConf.projPaths" :key="path" :label="path" :value="path">
          </el-option>

        </el-select>
      </el-col>
      <el-col :span="2" style="text-align: center">
        <el-button @click="projectPathAction">选择项目</el-button>
      </el-col>
    </el-form-item>

    <el-form-item label="工程结构">
      <el-col :span="18" style="padding: 12px">
        <el-tree lazy :load="loadSrcTree" :render-content="renderContent" class="filter-tree" :props="srcTreeProps"
                 highlight-current>

        </el-tree>
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
                 @click="applyAction">Apply
      </el-button>
      <!--<el-button @click="onCancel">Cancel</el-button>-->
    </el-form-item>
  </el-form>

</template>

<script>
  import {ipcRenderer} from 'electron'

  const filePath = require('../../../utils/file.path')

  var fs = require('fs')
  export default {
    data() {
      return {
        outPath: '',
        oldName: '',
        newName: '',
        desc: '',
        form: {},
        projectPath: '',
        xcodeConf: {
          projPaths: [],
          currentPath: ''
        },
        srcTreeProps: {
          label: 'name',
          children: 'subdir',
          isLeaf: 'isFile'
        }
      }
    },
    created() {
      var xcodeConf = ipcRenderer.sendSync('app.user.config.name', {name: "xcode"})
      this.xcodeConf.projPaths = this.xcodeConf.projPaths.concat(xcodeConf.projPaths)
      this.xcodeConf.currentPath = xcodeConf.currentPath
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
      applyAction() {

      },
      saveConf() {
        ipcRenderer.sendSync('app.user.config.name', {name: 'xcode', conf: this.xcodeConf})
      },
      projectPathAction() {
        var action = `action${Date.now()}`
        ipcRenderer.once(action, (e, file) => {
          if (this.xcodeConf.projPaths.indexOf(file.toString()) >= 0) {
            this.$message.warning('该项目记录已存在!')
            return
          }
          this.projectPath = file.toString()
          this.xcodeConf.projPaths.push(file.toString())
          this.xcodeConf.currentPath = this.projectPath
          this.projectChange()
        })
        ipcRenderer.send('app.system.select.dir', {
          action: action,
          name: action,
          title: '保存语言文目录件',
          extensions: ['md']
        })
      },
      projectChange() {
        this.saveConf()
      },
      saveConf() {
        ipcRenderer.sendSync('app.user.config.name', {name: 'xcode', conf: this.xcodeConf})
      },
      loadSrcTree(node, resolve) {
        if (node.level === 0) {
          return resolve([{
            name: '项目:' + this.xcodeConf.currentPath,
            path: this.xcodeConf.currentPath,
            hasSub: true,
          }]);
        }
        if (node.data.hasSub) {
          const data = filePath.subFiles(node.data.path)
          return resolve(data);
        } else {
          return resolve([])
        }
      },
      renderContent(h, {node, data, store}) {
        return h({
          template: `
                <span class="custom-tree-node">
            <span>{{node.label}}</span>
            <span @click.stop>
              <el-button v-if="!data.isFile" size="mini" type="text" @click="clickHandler(data)">添加</el-button>
              <!--<el-button size="mini" type="text" on-click={ () => this.remove(node, data) }>Delete</el-button>-->
            </span>
          </span>
            `,
          data: function () {
            return {
              node: node,
              data: data
            }
          },
          methods: {
            clickHandler: this.addNode
          }
        })
      },
      addNode(data) {
        this.$router.push(`/xcode/addtpl?path=${data.path}&name=${data.name}&proj=${this.xcodeConf.currentPath}`)
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
