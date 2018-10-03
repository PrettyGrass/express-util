<template>
  <div style="padding: 0" class="app-container">
    <el-row class="row">
      <mavon-editor @save="saveAction" :externalLink="externalLink" style="min-height: 100%; max-height: 100%"
                    v-model="content"/>
    </el-row>
    <!--<el-row class="bottom">-->
    <!--<el-button type="primary" :disabled="content === ''" @click="copyAction">复制Markdown</el-button>-->
    <!--</el-row>-->
  </div>
</template>

<script>
  import {ipcRenderer, remote} from 'electron'

  const fs = require('fs')

  export default {
    data() {
      return {
        content: '',
        externalLink: {
          markdown_css: function () {
            // 这是markdown css文件路径
            return '/markdown/github-markdown.min.css';
          },
          hljs_js: function () {
            // 这是hljs文件路径
            return '/highlightjs/highlight.min.js';
          },
          hljs_css: function (css) {
            // 这是代码高亮配色文件路径
            return '/highlightjs/styles/' + css + '.min.css';
          },
          hljs_lang: function (lang) {
            // 这是代码高亮语言解析路径
            return '/highlightjs/languages/' + lang + '.min.js';
          },
          katex_css: function () {
            // 这是katex配色方案路径路径
            return '/katex/katex.min.css';
          },
          katex_js: function () {
            // 这是katex.js路径
            return '/katex/katex.min.js';
          },
        }
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

      },
      saveAction() {
        var action = `action${Date.now()}`
        ipcRenderer.once(action, (e, file) => {
          fs.writeFileSync(file, this.content)
          this.$message.success('文件已保存至:' + file.toString())
        })
        ipcRenderer.send('app.system.save.file', {
          action: action,
          name: action,
          title: '保存Markdown文件',
          extensions: ['md']
        })

      }
    }
  }
</script>

<style scoped>
  .app-container {
    height: 100%;
    width: 100%;
  }

  .row {
    height: 100%;
    width: 100%;
  }

  .bottom {
    height: 120px;
  }
</style>

