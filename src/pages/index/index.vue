<template>
  <view class="container">
    <!-- Logo -->
    <view class="logo">
      <image src="@/static/keai-logo.png" class="logo-image" mode="aspectFit" />
    </view>

    <!-- Illustration -->
    <view class="illustration">
      <image src="@/static/illustration.png" class="illustration-image" mode="aspectFit" />
    </view>

    <view class="login-container">
      <!-- 手机号展示 -->
      <view class="phone-number">{{ phone }}</view>

      <!-- 登录按钮 -->
      <view class="login-section">
        <button v-if="!isAgreed" class="login-button" @tap="handleAgree">手机号一键登录</button>
        <button v-if="isAgreed" class="login-button" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
          手机号一键登录
        </button>
        <view class="login-tip">
          请使用家长手机号/<text class="greencolor" @click="showWechat">Wechat ID</text>登录
        </view>
      </view>

      <!-- 协议 -->
      <view class="agreement-section">
        <checkbox-group @change="toggleAgreement">
          <label class="checkbox-container">
            <checkbox value="agree" :checked="isAgreed" />
          </label>
        </checkbox-group>
        <view>
          同意<text class="highlight" @click="showAgreement">《用户隐私协议》</text>并授权科爱信获取信息
        </view>
      </view>
    </view>

    <!-- 用户协议组件 -->
    <AgreementPopup :show="isAgreementVisible" title="用户隐私协议" :content="agreementContent"
      @close="isAgreementVisible = false" />

    <!-- Wechat ID Modal -->
    <view v-if="isShow" class="modal">
      <view class="modal-content">
        <view class="modal-header">
          <text class="datechoose-text">微信号登录</text>
        </view>
        <view class="wechatInfo">
          <view class="viewname">Wechat ID：</view>
          <view class="viewname">
            <input type="text" placeholder="长按粘贴Wechat ID" maxlength="20" v-model="wechatID" />
          </view>
        </view>
        <view class="calendar-header">
          <button class="btn cancel" @tap="closeModal">取消</button>
          <button class="btn confirm" @tap="save">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import AgreementPopup from "@/components/AgreementPopup.vue";

export default {
  components: {
    AgreementPopup,
  },
  data() {
    return {
      phone: '', // 手机号
      isAgreed: false, // 是否同意协议
      isAgreementVisible: false, // 用户协议显示状态
      isShow: false, // Wechat ID 模态框显示状态
      wechatID: '', // Wechat ID
      agreementContent: '', // 用户协议内容
    };
  },
  methods: {
    // 显示用户协议
    showAgreement() {
      this.isAgreementVisible = true;
    },
    // 切换协议复选框状态
    toggleAgreement(e) {
      this.isAgreed = e.detail.value.includes('agree');
      console.log('是否同意协议:', this.isAgreed);
    },
    // 获取手机号
    getPhoneNumber(e) {
      if (e.detail.errMsg === "getPhoneNumber:ok") {
        const { encryptedData, iv } = e.detail;
        this.loginWithPhoneNumber(encryptedData, iv);
      } else {
        uni.showToast({
          title: '用户拒绝授权',
          icon: 'none',
        });
      }
    },
    // 使用手机号登录
    loginWithPhoneNumber(encryptedData, iv) {
      uni.showLoading({ title: '登录中...' });
      uni.request({
        url: 'https://www.futurekey.com/classroom/wechat/decryptPhone',
        method: 'POST',
        data: {
          session_key: uni.getStorageSync('session_key'),
          encryptedData,
          iv,
        },
        success: (response) => {
          let result = response.data;
          if (result.code == 0) {
            this.handleLoginSuccess(result.data.phone);
          } else {
            this.handleLoginFail(result.message);
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          this.handleLoginFail('网络异常，请联系客服处理');
        },
      });
    },
    // 处理登录成功
    handleLoginSuccess(phone) {
      this.$global.phone = phone;
      uni.setStorageSync('phone', phone);
      uni.setStorageSync('isLogin', true);
      uni.setStorageSync('isAgreed', true);
      uni.removeStorageSync('session_key');
      uni.navigateTo({
        url: "/pages/home/index",
        success: () => {
          uni.hideLoading();
        }
      });
    },
    // 处理登录失败
    handleLoginFail(message) {
      uni.hideLoading();
      uni.showToast({
        title: message,
        icon: 'none'
      });
    },
    // 调用登录接口
    onlogin() {
      uni.login({
        success: (res) => {
          if (res.code) {
            this.authCode(res.code);
          }
        },
        fail: (err) => {
          console.error('登录失败:', err);
          uni.showToast({
            title: '登录失败',
            icon: 'none'
          });
        },
      });
    },
    // 授权码登录
    authCode(code) {
      uni.request({
        url: 'https://www.futurekey.com/classroom/wechat/authCode',
        method: 'POST',
        data: { code },
        success: (response) => {
          let result = response.data;
          if (result.code == 0) {
            this.handleAuthCodeSuccess(result.data);
          } else {
            uni.showToast({
              title: result.message,
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          uni.showToast({
            title: '网络异常，请联系客服处理',
            icon: 'none'
          });
        },
      });
    },
    // 处理授权码登录成功
    handleAuthCodeSuccess(data) {
      if (data.phone) {
        this.handleLoginSuccess(data.phone);
      } else {
        uni.setStorageSync('session_key', data.session_key);
      }
      uni.setStorageSync('token', data.token);
    },
    // 点击登录按钮
    handleAgree() {
      if (!this.isAgreed) {
        uni.showToast({
          icon: "none",
          title: '请阅读并同意用户隐私协议，并授权科爱信获取信息',
          duration: 2000
        });
        return false;
      }
    },
    // 显示 Wechat ID 模态框
    showWechat() {
      if (!this.isAgreed) {
        uni.showToast({
          icon: "none",
          title: '请阅读并同意用户隐私协议，并授权科爱信获取信息',
          duration: 2000
        });
      } else {
        this.isShow = true;
      }
    },
    // 关闭模态框
    closeModal() {
      this.isShow = false;
    },
    // 保存 Wechat ID
    save() {
      if (!this.wechatID) {
        uni.showToast({
          title: '请输入Wechat ID',
          icon: 'none'
        });
        return;
      }
      this.isShow = false;
      this.loginWithWechatID();
    },
    // 使用 Wechat ID 登录
    loginWithWechatID() {
      uni.showLoading({ title: '登录中...' });
      uni.request({
        url: 'https://www.futurekey.com/classroom/wechat/login',
        method: 'POST',
        data: {
          wechatID: this.wechatID,
          token: uni.getStorageSync('token')
        },
        success: (response) => {
          let result = response.data;
          if (result.code == 0) {
            this.handleLoginSuccess(result.data.phone);
          } else {
            uni.showToast({
              title: result.message,
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('请求失败:', err);
          uni.showToast({
            title: '网络异常，请联系客服处理',
            icon: 'none'
          });
        },
      });
    },
  },
  onLoad() {
    console.log("Page Loaded");
    this.isAgreed = uni.getStorageSync('isAgreed');
    this.phone = uni.getStorageSync('phone');
    this.wechatID = this.phone;
    console.log("phone:", this.phone);
    this.$global.phone = this.phone;
    if (this.phone) {
      console.log("用户已登录，直接跳转！！");
      setTimeout(() => {
        uni.navigateTo({
          url: "/pages/home/index",
        });
      }, 100);
    } else {
      console.log("用户未登录，调用登录接口！！");
      this.onlogin();
    }
  },
  onShow() {
    console.log("Page Show");
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0058ff;
  width: 100%;
  height: 100vh;
  padding: 0 20rpx;
  box-sizing: border-box;
}

.logo {
  margin-top: 120rpx;
  margin-bottom: 40rpx;
  width: 100%;
}

.logo-image {
  margin-left: 20rpx;
  width: 139rpx;
  height: 80rpx;
}

.illustration {
  margin-bottom: 40rpx;
  margin-top: 40rpx;
}

.illustration-image {
  width: 609rpx;
  height: 520rpx;
}

.login-container {
  width: 80%;
  padding: 20rpx;
  text-align: center;
  align-items: center;
  margin-top: 100rpx;
}

.phone-number {
  font-size: 36rpx;
  color: #fff;
  margin-bottom: 30rpx;
}

.login-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
  margin-top: 60rpx;
}

.login-button {
  width: 80%;
  height: 80rpx;
  border-radius: 40rpx;
  background-color: #fff;
  color: #0058ff;
  font-size: 30rpx;
  font-weight: bold;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.1);
}

.login-tip {
  font-size: 24rpx;
  color: #fff;
  margin-top: 20rpx;
}

.agreement-section {
  width: 80%;
  display: flex;
  flex-direction: row;
  font-size: 24rpx;
  color: #fff;
  line-height: 1.5;
  text-align: left;
  margin-left: 11%;
}

.checkbox {
  margin-right: 10rpx;
}

.highlight {
  color: #fecd00;
  margin: 0 5rpx;
  cursor: pointer;
}

.greencolor {
  color: #32CD32;
  margin: 0 5rpx;
  cursor: pointer;
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 5px;
  width: 80%;
}

.wechatInfo {
  display: flex;
  padding: 40rpx 20rpx;
  justify-content: center;
  align-items: center;
  margin: 10rpx 0;
}

.viewname {
  font-size: 16px;
  color: #333;
}

input[type="text"] {
  flex: 1;
  padding: 10rpx;
  border: 1rpx solid #ccc;
  border-radius: 4rpx;
  width: 280rpx;
}

.calendar-header {
  margin: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  font-weight: bold;
}

.btn {
  flex: 1;
  margin: 0 5rpx;
  height: 80rpx;
  border-radius: 20rpx;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  align-items: center;
  vertical-align: middle;
  line-height: 40rpx;
  padding: 20rpx;
}

.confirm {
  color: #fff;
  background-color: #007aff;
  margin-left: 30rpx;
}

.cancel {
  color: #007aff;
  background-color: #fff;
  border: #007aff 1px solid;
}

.modal-header {
  font-size: 18px;
  margin-top: 20rpx;
  text-align: center;
  font-weight: bold;
}
.datachoose-text {
  width: 670rpx;
  font-weight: bold;
  font-size: 32rpx;
  color: #333;
}
</style>
