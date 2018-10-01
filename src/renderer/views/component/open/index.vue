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
        <el-table :data="list" v-loading.body="listLoading" element-loading-text="Loading" border fit highlight-current-row>
          <el-table-column align="center" label='ID' width="95">
            <template slot-scope="scope">
              {{scope.$index}}
            </template>
          </el-table-column>
          <!--<el-table-column label="Title">-->
          <!--<template slot-scope="scope">-->
          <!--{{scope.row.title}}-->
          <!--</template>-->
          <!--</el-table-column>-->
          <el-table-column label="Author" width="110" align="center">
            <template slot-scope="scope">
              <span>{{scope.row.author}}</span>
            </template>
          </el-table-column>
          <el-table-column label="Pageviews" width="110" align="center">
            <template slot-scope="scope">
              {{scope.row.pageviews}}
            </template>
          </el-table-column>
          <el-table-column class-name="status-col" label="Status" width="110" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status | statusFilter">{{scope.row.status}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="created_at" label="Display_time" width="200">
            <template slot-scope="scope">
              <i class="el-icon-time"></i>
              <span>{{scope.row.display_time}}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>

  </div>
</template>

<script>
import { getList } from '@/api/table'
import {ipcRenderer} from 'electron'

export default {
  data() {
    return {
      list: null,
      listLoading: true
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
      console.log('app.qiniu.file.update', arg)
      this.list = arg
    })
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true

      ipcRenderer.send('app.qiniu.file.list')
        this.listLoading = false
      // getList(this.listQuery).then(response => {
      //   this.list = response.data.items
      //   this.listLoading = false
      // })
    }
  }
}
</script>
