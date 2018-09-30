<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <div class="dashboard-text">开发工具:</div>
      <div class="dashboard-text">配置</div>
      <el-button type="primary" @click="pullAction">拉取内容</el-button>
      <el-button @click="pushAction">推送内容</el-button>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default {
    name: 'dashboard',
    computed: {
      ...mapGetters([
        'name',
        'roles'
      ])
    },
    mounted() {
      this.$message({
        message: '开始拉取',
        type: 'info'
      })
    },
    methods: {
      pullAction(event) {
        this.$message({
          message: 'pullAction',
          type: 'info'
        })
      },
      pushAction(event) {
        this.$message({
          message: 'pushAction',
          type: 'info'
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  .dashboard {
    &-content {
      margin: 30px;
    }
    &-container {

    }
    &-text {
      font-size: 30px;
      line-height: 46px;
    }
  }
</style>
