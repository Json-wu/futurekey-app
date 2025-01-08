<template>
  <view>
    <!-- 遮罩层 -->
    <view class="mask" v-if="show" @click="closeAgreement"></view>

    <!-- 协议内容 -->
    <view class="agreement-container" :style="{ transform: `translateY(${translateY})` }">
      <!-- 标题栏 -->
      <view class="header">
        <text class="title">{{ title }}</text>
        <text class="close-btn" @click="closeAgreement">×</text>
      </view>

      <!-- 协议内容 -->
      <scroll-view class="content" scroll-y="true">
        <view class="page-container">
          <view class="header">
            <text class="text-title">科爱信-开心英语小程序 用户隐私协议</text>
          </view>

          <view class="section">
            <text class="effective-time">生效时间：2024 年 11 月 25 日</text>
          </view>

          <view class="section">
            <text class="subtitle">隐私政策</text>
            <text class="content">
              科爱信-开心英语是一个面向学生家长的专业服务平台。科爱信-开心英语非常重视用户的隐私，非常感谢您的信任，选择科爱信-开心英语为您提供服务。为更好地保障用户隐私，科爱信-开心英语特别从如下几方面对您在使用科爱信-开心英语小程序服务过程中，我们是如何收集、使用、存储、分享您的个人信息，以及我们为您提供的访问、更新、删除和保护这些信息的方式做出如下具体说明。
            </text>
          </view>

          <view class="section">
            <text class="subtitle">一、科爱信-开心英语小程序可能收集的信息内容</text>
            <text class="content">
              科爱信-开心英语小程序收集的个人信息主要包括您主动提供的个人信息以及在使用科爱信-开心英语小程序及服务过程中授权科爱信-开心英语获取的信息以及第三方分享有关您的信息。个人信息指您的 手机号码
              、上传的学生作业资料。
            </text>
          </view>

          <view class="section">
            <text class="subtitle">1.1 主动提供的信息</text>
            <text class="content">
              （1）您在注册或使用科爱信-开心英语小程序及服务过程中，您主动提供的手机号信息。您选择使用第三方账号登陆时，科爱信-开心英语会收集您微信、QQ、微博、AppleID的第三方账号、图像、昵称信息。
              <br />
              （2）您在使用科爱信-开心英语小程序及服务过程中上传的手机号、相册信息。
              <br />
              （3）您在参加科爱信-开心英语小程序举办的线上及线下活动过程中提供的姓名、手机号、微信、QQ信息。
            </text>
          </view>

          <view class="section">
            <text class="subtitle">1.2 我们如何收集和使用个人信息</text>
            <text class="content">
              我们会按照如下方式收集您在使用服务时主动提供的，以及通过自动化手段收集您在使用功能或接受服务过程中产生的信息：
              <br />
              (1) 开展内部数据分析和研究，第三方SDK统计服务，改善我们的产品或服务
              <br />
              我们收集数据是根据您与我们的互动和您所做出的选择，包括您的隐私设置以及您使用的产品和功能。
            </text>
          </view>

          <view class="section">
            <text class="subtitle">1.3 注册、登录、认证、找回</text>
            <text class="content">
              a. 当您注册、登录科爱信-开心英语小程序及相关服务时，您可以通过手机号创建帐号，并且您可以完善相关的网络身份识别信息（头像、昵称、密码），收集这些信息是为了帮助您完成注册。
              <br />
              b. 您也可以使用第三方帐号登录并使用，您将授权我们获取您在第三方平台注册的公开信息（头像、昵称以及您授权的其他信息）。
            </text>
          </view>

          <view class="section">
            <text class="subtitle">1.4 资讯浏览</text>
            <text class="content">
              科爱信-开心英语可能会向您推荐更感兴趣的信息，为实现这一功能，我们可能会收集必要的日志信息，包括您提交的感兴趣和不感兴趣的信息。
              <br />
              我们收集、使用的上述信息进行了去标识化处理，数据分析仅对应特定的、无法直接关联您身份的编码，不会与您的真实身份相关联。
            </text>
          </view>

          <view class="section">
            <text class="subtitle">二、如何使用Cookie和同类技术</text>
            <text class="content">
              （此处可以继续加入协议的详细内容...）
            </text>
          </view>

          <view class="section">
            <text class="subtitle">九、如何联系我们</text>
            <text class="content">
              （此处可以继续加入协议的详细内容...）
            </text>
          </view>

          <view class="footer">
            <text>© 2024 科爱信-开心英语</text>
          </view>
        </view>
        <!-- <view class="text-content" v-for="(item, index) in content" :key="index">{{ item }}</view> -->
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: "UserAgreement",
  props: {
    show: {
      type: Boolean,
      default: false, // 控制显示隐藏
    },
    title: {
      type: String,
      default: "用户隐私协议", // 标题
    },
    content: {
      type: Array,
      default: () => [
        "欢迎您使用XXX服务，本协议是为保护双方的合法权益......",
        "请您仔细阅读以下内容，继续使用服务即表示同意以下条款......",
      ],
    },
  },
  data() {
    return {
      translateY: "100%", // 初始隐藏在屏幕下方
    };
  },
  watch: {
    // 监听 show 属性，控制弹窗动画
    show(val) {
      this.translateY = val ? "0%" : "100%"; // 显示到屏幕中间高度50%
    },
  },
  methods: {
    // 关闭协议弹窗
    closeAgreement() {
      this.$emit("close"); // 通知父组件关闭
    },
  },
};
</script>

<style scoped>
.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* 半透明遮罩 */
  z-index: 1000;
}

.agreement-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  /* 设置协议淡出的高度为屏幕的 50% */
  background-color: #fff;
  /* 白色背景 */
  border-radius: 16rpx 16rpx 0 0;
  /* 顶部圆角 */
  box-shadow: 0 -10rpx 20rpx rgba(0, 0, 0, 0.1);
  /* 阴影效果 */
  z-index: 1001;
  transform: translateY(100%);
  /* 初始状态：隐藏在屏幕下方 */
  transition: transform 0.3s ease;
  /* 动画效果 */
}

.header {
  display: flex;
  justify-content: space-between;
  /* 左右对齐 */
  align-items: center;
  /* 垂直居中 */
  padding: 20rpx;
  /* 内边距 */
  background-color: #f7f7f7;
  /* 浅灰背景 */
  border-bottom: 1rpx solid #eaeaea;
  /* 底部分割线 */
}

.title {
  width: 90%;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.close-btn {
  font-size: 40rpx;
  font-weight: bold;
  color: #888;
  cursor: pointer;
}

.content {
  height: 80%;
  padding: 20rpx 40rpx 20rpx 20rpx;
  overflow-y: scroll;
  font-size: 28rpx;
  color: #555;
  line-height: 1.6;
}

.text-content {
  margin-bottom: 20rpx;
  text-indent: 2em;
  margin-right: 20rpx;
}

/* 设置滚动条样式（仅部分支持） */
.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  /* 滑块颜色 */
  border-radius: 4px;
}

.content::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* 滑块轨道颜色 */
}

.page-container {
  padding: 20px;
  background-color: #fff;
}

.header {
  text-align: center;
  margin-bottom: 20px;
}

.text-title {
  font-size: 18px;
  font-weight: bold;
}

.effective-time {
  font-size: 14px;
  color: #888;
}

.section {
  margin-bottom: 20px;
}

.subtitle {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.content {
  font-size: 14px;
  line-height: 1.5;
}

.footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #888;
}
</style>
