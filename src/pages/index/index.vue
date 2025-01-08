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
      <view class="phone-number">
        517***98
      </view>

      <!-- 登录按钮 -->
      <view class="login-section">
        <!-- 登录按钮 -->
        <button v-if="!isAgreed" class="login-button" @tap="handleAgree">
          手机号一键登录
        </button>
        <button v-if="isAgreed" class="login-button" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
          手机号一键登录
        </button>
        <view class="login-tip">请使用家长手机号登录</view>
      </view>

      <!-- 协议 -->
      <view class="agreement-section">
        <!-- 复选框组件 -->
        <checkbox-group @change="toggleAgreement">
          <label class="checkbox-container">
            <checkbox value="agree" :checked="isAgreed" />
          </label>
        </checkbox-group>
        <view>
          同意<text class="highlight" @click="showAgreement">《用户隐私协议》</text>并授权科爱信获取本机号码
        </view>
      </view>
    </view>

    <!-- 用户协议组件 -->
    <AgreementPopup :show="isAgreementVisible" title="用户隐私协议" :content="agreementContent"
      @close="isAgreementVisible = false" />
  </view>
</template>

<script>
import agreementPopup from "@/components/AgreementPopup.vue";

export default {
  components: {
    agreementPopup,
  },
  data() {
    return {
      isAgreed: false, // 是否同意协议
      isAgreementVisible: false, // 用户协议显示状态
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
      this.$global.phone = "51741898";
      // 跳转至首页index
      uni.navigateTo({
        url: "/pages/home/index",
      });
      return;
      console.log(e.detail.errMsg);
      if (e.detail.errMsg === "getPhoneNumber:ok") {
        const { encryptedData, iv } = e.detail;

        // 调用登录接口，获取临时登录凭证 code
        uni.login({
          success: (res) => {
            console.log('临时登录凭证:', res.code);
            if (res.code) {
              // 调用后端接口解密手机号
              uni.request({
                url: 'https://www.futurekey.com/classroom/wechat/decryptPhone', // 替换为后端接口
                method: 'POST',
                data: {
                  code: res.code,
                  encryptedData,
                  iv,
                },
                success: (response) => {
                  if (response.data.success) {
                    console.log('用户手机号:', response.data.phoneNumber);
                    uni.showToast({
                      title: '登录成功',
                      icon: 'success'
                    });
                    this.$global.phone = response.data.phoneNumber;
                    // 跳转至首页index
                    uni.navigateTo({
                      url: "/pages/home/index",
                    });
                  } else {
                    uni.showToast({
                      title: '获取手机号失败',
                      icon: 'none'
                    });
                  }
                },
                fail: (err) => {
                  console.error('请求失败:', err);
                  uni.showToast({
                    title: '服务器错误',
                    icon: 'none'
                  });
                },
              });
            }
          },
        });
      } else {
        uni.showToast({
          title: '用户拒绝授权',
          icon: 'none',
        });
      }
    },
    onlogin() {
      // 调用登录接口，获取临时登录凭证 code
      uni.login({
        success: (res) => {
          console.log('临时登录凭证:', res.code);
          if (res.code) {
            // 调用后端接口解密手机号
            uni.request({
              url: 'https://www.futurekey.com/classroom/wechat/decryptPhone', // 替换为后端接口
              method: 'POST',
              data: {
                code: res.code,
                encryptedData,
                iv,
              },
              success: (response) => {
                if (response.data.success) {
                  console.log('用户手机号:', response.data.phoneNumber);
                  uni.showToast({
                    title: '登录成功',
                    icon: 'success'
                  });
                  this.$global.phone = response.data.phoneNumber;
                  // 跳转至首页index
                  uni.navigateTo({
                    url: "/pages/home/index",
                  });
                } else {
                  uni.showToast({
                    title: '获取手机号失败',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                console.error('请求失败:', err);
                uni.showToast({
                  title: '服务器错误',
                  icon: 'none'
                });
              },
            });
          }
        },
      });
    },
    // 点击登录按钮
    handleAgree() {
      if (!this.isAgreed) {
        uni.showToast({
          icon: "none",
          title: '请阅读并同意平台服务协议及隐私协议',
          duration: 2000
        });
        return false;
      }
    },
  },
  onload() {

  }
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
</style>
