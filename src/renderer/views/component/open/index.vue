<template>
  <div class="app-container">
    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <el-input placeholder="搜索" v-model="searchText" style="width: 200px" clearable></el-input>
        <el-button @click="fetchData">刷新</el-button>

        <router-link class="inlineBlock" to="/component/create/open">
          <el-button>添加组件</el-button>
        </router-link>
      </el-header>

      <el-main>
        <el-table :data="listShow" v-loading.body="listLoading" element-loading-text="Loading" border fit
                  highlight-current-row>
          <el-table-column align="center" label='序号' width="60">
            <template slot-scope="scope">
              {{scope.$index}}
            </template>
          </el-table-column>
          <el-table-column label="组件名" align="center" width="200">
            <template slot-scope="scope">
              <span>{{scope.row.podName}}</span>
            </template>
          </el-table-column>
          <el-table-column class-name="status-col" label="版本" align="left">
            <template slot-scope="scope">
              <el-button style="padding: 4px" v-for="ver in scope.row.vers" :type="ver | statusFilter"
                         @click="selectedPodVer(scope.row.podName, ver)">{{ver}}
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="created_at" label="操作" width="120">
            <template slot-scope="scope">
              <!--<i class="el-icon-time"></i>-->
              <!--<span>{{scope.row.url}}</span>-->
              <el-button style="padding: 4px" @click="addVersion(scope.row.podName)">添加新版本</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>

  </div>
</template>

<script>
  // import {getList} from '@/api/table'
  import {clipboard, ipcRenderer} from 'electron'

  export default {
    data() {
      return {
        listFull: null,
        listShow: null,
        listLoading: true,
        sid: '',
        searchText: '',
        type: '',
        libDir: ''
      }
    },
    watch: {
      searchText(val) {
        this.searchAction()
      },
      '$route'(to, from) {
        this.sid = ''
        this.searchText = ''
        this.fetchData()
      }
    },
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'gray',
          deleted: 'danger'
        }
        return statusMap[status]
      }
    },
    created() {
      ipcRenderer.on('app.qiniu.file.update', (event, arg) => {
        this.listLoading = false
        this.parseList(arg)
      })
      this.fetchData()
    },
    methods: {
      parseList(res) {
        var items = []
        res.items.forEach((item) => {
          let extType = item.name.split('.').pop()
          if (extType !== 'podspec') {
            return
          }
          var component = item
          component.podName = component.key.replace(res.dir, '').split('/')[0]
          let ver = component.name.replace('.podspec', '')
          this.appendPod(items, component, ver)
        })
        this.listFull = items
        this.searchAction()
      },
      /// 同一组件多版本情况
      appendPod(components, component, ver) {
        var pod = null
        components.forEach(function (item) {
          if (component.podName === item.podName) {
            pod = item
          }
        })
        if (pod) {
          pod.vers.push(ver)
        } else {
          component.vers = [ver]
          components.push(component)
        }
      },
      fetchData() {
        this.type = this.$route.path.split('/').pop()
        var current = ipcRenderer.sendSync('app.user.config.current', {sync: true})
        switch (this.type) {
          case 'open':
            this.libDir = current.openSourceDir
            break
          case 'close':
            this.libDir = current.closeSourceDir
            break
        }
        this.listLoading = true

        ipcRenderer.send('app.qiniu.file.list', {
          sid: this.sid,
          dir: this.libDir,
          size: 500
        })
      },
      searchAction() {
        var items = []
        if (this.searchText.length > 0) {
          for (let index in this.listFull) {
            let item = this.listFull[index]
            if (item.podName.toLowerCase().indexOf(this.searchText.toLowerCase()) >= 0)
              items.push(item)
          }
        } else {
          items = this.listFull
        }
        this.listShow = items
      },
      addVersion(name) {
        this.$router.push('/component/create/' + this.type + '?podName=' + name)
      },
      selectedPodVer(name, ver) {
        let pod = `pod '${name}',  :podspec => ${this.libDir.replace('/', '')}+'${name}/${ver}.podspec'`
        clipboard.writeText(pod)
        this.$message.success('依赖项已复制到剪切板!')
      }
    }
  }
</script>
