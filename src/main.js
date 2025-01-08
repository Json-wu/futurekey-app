import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'

import share from './utils/share.js'  //注意路径是上一步新建文件的路径
Vue.mixin(share)
Vue.config.productionTip = false;

Vue.prototype.$global = {
  studentCode: null,
  phone: '51741898',
  timezones:[
    { name: "上海", value: "Asia/Shanghai" },
    { name: "洛杉矶", value: "America/Los_Angeles" },
    { name: "丹佛", value: "America/Denver" },
    { name: "芝加哥", value: "America/Chicago" },
    { name: "纽约", value: "America/New_York" },
    { name: "马德里", value: "Europe/Madrid" }
  ],
  share: {
    title: '科爱小信',
    path: '/pages/index/index', // 分享路径
    imageUrl: '/static/illustration.png' // 分享图片URL
  }
};

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
