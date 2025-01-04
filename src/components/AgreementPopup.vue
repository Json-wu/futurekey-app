<template>
  <view>
    <!-- 遮罩层 -->
    <view class="mask" v-if="show" @click="closeAgreement"></view>
    
    <!-- 协议内容 -->
    <view
      class="agreement-container"
      :style="{ transform: `translateY(${translateY})` }"
    >
      <!-- 标题栏 -->
      <view class="header">
        <text class="title">{{ title }}</text>
        <text class="close-btn" @click="closeAgreement">×</text>
      </view>
      
      <!-- 协议内容 -->
      <scroll-view class="content" scroll-y="true">
        <view class="text-content" v-for="(item, index) in content" :key="index">{{ item }}</view>
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
      default: "用户协议", // 标题
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
  background-color: rgba(0, 0, 0, 0.5); /* 半透明遮罩 */
  z-index: 1000;
}

.agreement-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%; /* 设置协议淡出的高度为屏幕的 50% */
  background-color: #fff; /* 白色背景 */
  border-radius: 16rpx 16rpx 0 0; /* 顶部圆角 */
  box-shadow: 0 -10rpx 20rpx rgba(0, 0, 0, 0.1); /* 阴影效果 */
  z-index: 1001;
  transform: translateY(100%); /* 初始状态：隐藏在屏幕下方 */
  transition: transform 0.3s ease; /* 动画效果 */
}

.header {
  display: flex;
  justify-content: space-between; /* 左右对齐 */
  align-items: center; /* 垂直居中 */
  padding: 20rpx; /* 内边距 */
  background-color: #f7f7f7; /* 浅灰背景 */
  border-bottom: 1rpx solid #eaeaea; /* 底部分割线 */
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
  background: rgba(0, 0, 0, 0.2); /* 滑块颜色 */
  border-radius: 4px;
}

.content::-webkit-scrollbar-track {
  background: #f1f1f1; /* 滑块轨道颜色 */
}
</style>

