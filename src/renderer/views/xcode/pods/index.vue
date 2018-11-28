<template>
  <div class="app-container">
    <el-form label-width="160px">


      <el-form-item label="工程目录">
        <el-col :span="16">
          <!-- <el-input type="text" v-model="projectPath"></el-input> -->
          <el-select clearable style="width: 100%;" v-model="currentPath" @change="projectChange"
                     placeholder="请选择工程目录">
            <el-option v-for="path in projPaths" :key="path" :label="path" :value="path">
            </el-option>

          </el-select>
        </el-col>
        <el-col :span="2" style="text-align: center">
          <el-button @click="projectPathAction">选择项目</el-button>
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
      <!--<el-form-item label="Podfile">-->
        <!--<el-col :span="18">-->
          <!--<codemirror v-model="podContent" :options="codeOption"></codemirror>-->
          <!--&lt;!&ndash;<el-input type="textarea" :autosize="{ minRows: 12, maxRows: 12}" v-model="podContent"></el-input>&ndash;&gt;-->
        <!--</el-col>-->
      <!--</el-form-item>-->
      <el-form-item>
        <el-button type="primary" @click="initPod">初始化
        </el-button>
        <el-button @click="install">安装</el-button>
        <el-button @click="updateAll">更新全部</el-button>
        <el-button @click="updateAllInner">更新自研组件</el-button>
        <el-button :disabled="this.originPodContent === this.podContent" @click="savePodfile">保存podfile</el-button>
      </el-form-item>
      <el-main v-if="pods.length">
        <el-table :data="pods" border fit
                  highlight-current-row>
          <el-table-column align="center" label='序号' width="60">
            <template slot-scope="scope">
              {{scope.$index + 1}}
            </template>
          </el-table-column>
          <el-table-column label="组件名" align="center" width="200">
            <template slot-scope="scope">
              <span>{{scope.row.name}}</span>
            </template>
          </el-table-column>
          <el-table-column class-name="status-col" label="版本" align="left">
            <template slot-scope="scope">
              <span>{{scope.row.ver}}</span>
            </template>
          </el-table-column>
          <!--<el-table-column class-name="status-col" label="版本" align="left">-->
          <!--<template slot-scope="scope">-->
          <!--<el-button style="padding: 4px" v-for="ver in scope.row.vers" :type="ver | statusFilter"-->
          <!--@click="selectedPodVer(scope.row.podName, ver)">{{ver}}-->
          <!--</el-button>-->
          <!--</template>-->
          <!--</el-table-column>-->
          <el-table-column align="center" prop="created_at" label="操作" width="120">
            <template slot-scope="scope">
              <!--<i class="el-icon-time"></i>-->
              <!--<span>{{scope.row.url}}</span>-->
              <el-button style="padding: 4px" @click="updateOne(scope.row.name)">更新</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-form>
    <!--<codemirror v-model="podContent" :options="codeOption"></codemirror>-->
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
        projPaths: [''],
        currentPath: '',
        projectPath: '',
        oldName: '',
        newName: '',
        podContent: '',
        originPodContent: '',
        pods: [],
        currentAction: null,
        codeOption: {

        }
      }
    },
    created() {
      // let podName = this.$route.query.podName
      // if (podName && podName.length > 0) {
      //   this.form.podName = podName
      //   this.disablePodName = true
      // }
      // this.form.podType = this.$route.params.type
    },
    methods: {
      projectPathAction() {
        var action = `action${Date.now()}`
        ipcRenderer.once(action, (e, file) => {
          if (this.projPaths.indexOf(file.toString()) >= 0) {
            this.$message.warning('该项目记录已存在!')
            return
          }
          this.projectPath = file.toString()
          this.projPaths.push(file.toString())
          this.currentPath = this.projectPath
          this.projectChange()
        })
        ipcRenderer.send('app.system.select.dir', {
          action: action,
          name: action,
          title: '保存语言文目录件',
          extensions: ['md']
        })
      },
      initPod() {

        if (this.currentAction) {
          ipcRenderer.send('app.cmd.exec.async', {
            code: 1,
            action: this.currentAction
          })
          this.currentAction = null
          return
        }

        var action = `action${Date.now()}`
        this.currentAction = action
        ipcRenderer.on(action, (e, data) => {
          //this.$message.success('文件已保存至:' + data.data)
          console.log('data', data)
        })
        ipcRenderer.send('app.cmd.exec.async', {
          shell: 'top',
          params: [],
          action: action
        })
      },
      install() {

      },
      updateAll() {

      },
      updateOne(name) {

      },
      updateAllInner() {

      },
      savePodfile() {
        var podFile = path.join(this.currentPath, 'Podfile')
        fs.writeFileSync(podFile, this.podContent)
        this.readPodfile()
        this.$message.success('保存成功!')
      },
      projectChange() {
        this.readPodfile()
      },
      readPodfile() {
        var podFile = path.join(this.currentPath, 'Podfile')
        if (fs.existsSync(podFile)) {
          this.podContent = fs.readFileSync(podFile).toString()
          this.originPodContent = this.podContent
          var strs = this.podContent.match(/pod.*?(?=\n)/g)
          this.pods = []
          for (var index in strs) {
            var ret = strs[index].match(/[\'|\"].*?.[\'|\"]/g)
            var pod = {
              name: '',
              ver: 'n/a'
            }
            if (ret && ret.length > 0) {
              pod.name = ret[0].replace(/[\'|\"]/g, '')
              this.pods.push(pod)
            }
            pod.ver = this.getVer(ret)

          }
        }

      },
      getVer(list) {
        for (var index in list) {
          var val = list[index].replace(/[\ |\.|\=|\'|\"|static\/]/g, '')
          var reg = /^[\d]+$/
          if (reg.test(val)) {
            return list[index].replace(/[|\=|\'|\"|static\/]/g, '')
          }
        }
        return null
      }
    }
  }
</script>

<style scoped>
  .line {
    text-align: center;
  }
</style>
