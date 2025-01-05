import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'

import share from './utils/share.js'  //注意路径是上一步新建文件的路径
Vue.mixin(share)
Vue.config.productionTip = false;

Vue.prototype.$global = {
  timezone: null,
  studentCode: null,
  phone: '51741898'
};

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
