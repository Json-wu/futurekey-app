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
        <button class="login-button" @click="onLogin">本机号码一键登录</button>
        <view class="login-tip">未注册的手机号将自动注册并登录</view>
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
            同意<text class="highlight" @click="showAgreement">《账号服务与隐私协议》</text>并授权科爱信获取本机号码
        </view>
      </view>
    </view>

    <!-- 用户协议组件 -->
    <AgreementPopup
      :show="isAgreementVisible"
      title="用户协议"
      :content="agreementContent"
      @close="isAgreementVisible = false"
    />
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
      agreementContent: [
        "本网站及其对应的客户端、自媒体平台、其他主要运营网站等（以下简称“FUTUREKEY”）为K-12学生提供教育服务。本版权及免责声明旨在保障FUTUREKEY的正常运营，保护用户的合法权益，其初衷是为了给用户提供不间断的优质服务。FUTUREKEY始终尊重他人的知识产权，并保护自己的知识产权。因此，建议您在接受FUTUREKEY服务前，仔细阅读本声明。",
        "FUTUREKEY运营方根据合理信赖的原则要求并认为用户对FUTUREKEY中传输的所有文章、文档、音频、视频、图片、课程、软件、源代码等内容（以下统称“作品”）拥有所有权及知识产权或者事先取得原作者发表、传播该作品所需的所有授权，并注明原作者名称及作品来源；对于因用户缺乏完整的所有权、知识产权或合法授权而产生的任何侵权或违法行为，用户应当承担该侵权或违法行为的法律责任，FUTUREKEY运营方不承担任何法律责任。",
        "用户上传至FUTUREKEY的作品仅代表作者或用户的观点和立场，与FUTUREKEY无关。因用户的行为或用户上传、存储、发布、传播的任何作品、信息和内容所引起的任何纠纷，或由此产生的任何直接、间接、意外和特殊的损害，均由用户自行承担，FUTUREKEY运营者不承担任何责任；如因用户的行为造成的任何损失或不利影响，FUTUREKEY运营者保留追究相关用户法律责任的权利。"
      ],
    };
  },
  methods: {
    // 切换协议复选框状态
    toggleAgreement(e) {
       this.isAgreed = e.detail.value.includes('agree');
      console.log('是否同意协议:', this.isAgreed);
    },

    // 点击登录按钮
    onLogin() {
      if (!this.isAgreed) {
        uni.showToast({
          title: "请同意协议后继续",
          icon: "none",
        });
        return;
      }
      uni.showToast({
        title: "正在登录...",
        icon: "loading",
      });
      // 登录逻辑
      setTimeout(() => {
        uni.showToast({
          title: "登录成功！",
          icon: "success",
        });
        this.$global.phone = "51741898";
        // 跳转至首页index
        uni.navigateTo({
          url: "/pages/home/index",
        });
      }, 1500);
    },

    // 显示用户协议
    showAgreement() {
      this.isAgreementVisible = true;
    },
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
  text-decoration: underline;
  margin: 0 5rpx;
  cursor: pointer;
}

</style>
