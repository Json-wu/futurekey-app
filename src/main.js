import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'

import share from './utils/share.js'  //注意路径是上一步新建文件的路径
Vue.mixin(share)
Vue.config.productionTip = false;

Vue.prototype.$global = {
  studentList: [],
  studentCode: null,
  selectIndex: 0,
  phone: '',
  timezones:[
    { name: "上海", value: "Asia/Shanghai" },
    { name: "洛杉矶", value: "America/Los_Angeles" },
    { name: "丹佛", value: "America/Denver" },
    { name: "芝加哥", value: "America/Chicago" },
    { name: "纽约", value: "America/New_York" },
    { name: "马德里", value: "Europe/Madrid" }
  ],
  timezoneIndex: 0,
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth() + 1,
  stratDate: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-01',
  endDate: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate(),
  illustration: "/static/illustration.png"//'https://futurekey.com/classroom/download/1737727298280-1737727298280.png',
};

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
