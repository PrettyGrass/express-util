import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import App from './App'
import router from './router'
import store from './store'
import mavonEditor from 'mavon-editor'
import VueCodemirror from 'vue-codemirror'

// require styles
import 'mavon-editor/dist/css/index.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/idea.css'

import '@/icons' // icon
import '@/permission' // permission control

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.use(ElementUI, {locale})
Vue.use(mavonEditor)
Vue.use(VueCodemirror, {
  options: {
    theme: 'idea',
    tabSize: 4,
    styleActiveLine: true,
    lineNumbers: true,
    line: true,
    mode: 'text/javascript',
    lineWrapping: true,
    // theme: 'default'
  }
})
Vue.config.productionTip = false

new Vue({
  components: {App},
  router,
  store,
  template: '<App/>'
}).$mount('#app')
