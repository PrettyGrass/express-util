<template>
  <div class="app-container">
    <el-container>
      <el-header style="text-align: right; font-size: 12px">
        <!--<el-dropdown>-->
        <!--<i class="el-icon-setting" style="margin-right: 15px"></i>-->
        <!--<el-dropdown-menu slot="dropdown">-->
        <!--<el-dropdown-item>查看</el-dropdown-item>-->
        <!--<el-dropdown-item>新增</el-dropdown-item>-->
        <!--<el-dropdown-item>删除</el-dropdown-item>-->
        <!--</el-dropdown-menu>-->
        <!--</el-dropdown>-->
        <!--<span>王小虎</span>-->
        <el-button>刷新</el-button>
        <el-button>新增组件</el-button>
      </el-header>

      <el-main>
        <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit
                  highlight-current-row>
          <el-table-column align="center" label='序号' width="95">
            <template slot-scope="scope">
              {{scope.$index}}
            </template>
          </el-table-column>
          <el-table-column label="组件名" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.podName}}</span>
            </template>
          </el-table-column>
          <el-table-column class-name="status-col" label="版本" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.vers | statusFilter">{{scope.row.vers}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="created_at" label="操作">
            <template slot-scope="scope">
              <el-button>复制依赖</el-button>
              <!--<i class="el-icon-time"></i>-->
              <!--<span>{{scope.row.url}}</span>-->
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>

  </div>
</template>

<script>
  // import {getList} from '@/api/table'
  import {ipcRenderer} from 'electron'

  export default {
    data() {
      return {
        list: null,
        listLoading: true,
        sid: ''
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
        this.list = items
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
        this.listLoading = true

        ipcRenderer.send('app.qiniu.file.list', {
          sid: this.sid,
          dir: 'ios-close-lib/',
          size: 500
        })
        // getList(this.listQuery).then(response => {
        //   this.list = response.data.items
        //   this.listLoading = false
        // })
      }
    }
  }
</script>
