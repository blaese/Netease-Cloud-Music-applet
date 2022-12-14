import App from './App'

import {request} from './utils/request'
Vue.prototype.$request = request


// #ifndef VUE3
import Vue from 'vue'
Vue.prototype.$bus = new Vue()

Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif