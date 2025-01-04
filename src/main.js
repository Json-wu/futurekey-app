import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'

Vue.config.productionTip = false;

Vue.prototype.$global = {
  timezone: null,
  studentCode: null,
  phone: ''
};

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
