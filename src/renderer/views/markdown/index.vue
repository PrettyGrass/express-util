<template>
  <div style="padding: 0" class="app-container">
    <el-row>
      <mavon-editor style="min-sheight: 888px" v-model="content"/>
    </el-row>
    <!--<el-input type="textarea" v-model="content" rows="20" placeholder="Markdown"></el-input>-->
    <!--<el-button type="primary" :disabled="content === ''" @click="copyAction">复制Markdown</el-button>-->
  </div>
</template>

<script>
  import {ipcRenderer, remote} from 'electron'

  export default {
    data() {
      return {
        content: ''
      }
    },
    created() {
      let listen = this.$route.query.listen
      let listenback = this.$route.query.listenback
      ipcRenderer.on(listen, (event, arg) => {
        this.content = arg
      })
      var allWebContents = remote.webContents.getAllWebContents();
      for (var t in allWebContents) {
        allWebContents[t].webContents.send(listenback);
      }
    },
    methods: {

      copyAction() {

      }
    }
  }
</script>

<style scoped>
  .app-container {
    /*flex: 1;*/
    height: 100%;
    width: 100%;

  }
</style>

