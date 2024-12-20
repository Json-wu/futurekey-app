<template>
  <view class="webview-container">
    <!-- WebView 组件加载外部网页 -->
    <web-view :src="url"></web-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: "", // 外部网页链接
    };
  },
  onLoad(options) {
    // 接收传递过来的 URL 参数并解码
    if (options.url) {
      this.url = decodeURIComponent(options.url);
    } else {
      uni.showToast({
        title: "URL 无效",
        icon: "none",
      });
    }
  },
};
</script>

<style>
.webview-container {
  width: 100%;
  height: 100%;
}
</style>
