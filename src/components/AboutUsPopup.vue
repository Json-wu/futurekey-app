<template>
  <view v-if="showAbout" class="about-us-page">
    <!-- 弹窗主体 -->
    <view class="popup">
      <view class="calendar-header">
        <text class="datechoose-text">关于我们</text>
        <view class="close-btn" @tap="closeAbout">×</view>
      </view>
      <view class="popup-content">
        <!-- 官方网站 -->
        <view class="item" @click="openLink(data.website.url)">
          <image src="/static/icons/website.png" class="icon-link" />
          <text class="text">{{ data.website.text }}</text>
          <text class="title">{{ data.website.title }}</text>
        </view>
        <!-- 客服电话 -->
        <view class="item" @click="callPhone(data.phone.number)">
          <image src="/static/icons/phone.png" class="icon-link" />
          <text class="text">{{ data.phone.text }}</text>
          <text class="title">{{ data.phone.number }}</text>
        </view>
        <!-- 用户协议 -->
        <view class="item" @click="openLink(data.agreement.url)">
          <image src="/static/icons/agreement.png" class="icon-link" />
          <text class="text">{{ data.agreement.text }}</text>
          <text class="title">{{ data.agreement.title }}</text>
        </view>
      </view>

      <!-- 分享部分 -->
      <view class="popup-footer">
        <text class="share-text">觉得不错？分享到：</text>
        <view class="share-container">
          <button class="custom-button" open-type="share">
            <image src="/static/icons/wechat.png" class="icon-share"></image>
            <text class="label">微信好友</text>
          </button>
          <button class="custom-button" @click="shareWxQ">
            <image src="/static/icons/friends.png" class="icon-share"></image>
            <text class="label">朋友圈</text>
          </button>
          <button class="custom-button" @tap="shareToWeibo()">
            <image src="/static/icons/weibo.png" class="icon-share"></image>
            <text class="label">微博</text>
          </button>
          <button class="custom-button" @tap="shareToQQ()">
            <image src="/static/icons/qq.png" class="icon-share"></image>
            <text class="label">QQ</text>
          </button>
          <button class="custom-button" @tap="copyLink()">
            <image src="/static/icons/link.png" class="icon-share"></image>
            <text class="label">复制链接</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: "AboutUsPopup",
  props: {
    showAbout: {
      type: Boolean,
      required: true,
    },
    data: {
      type: Object,
      default: () => ({
        website: { text: "官方网站", url: "https://www.futurekey.com", title: "www.futurekey.com" },
        phone: { text: "客服电话", number: "400-189-0866400" },
        agreement: { text: "用户协议", url: "https://futurekey.com/private", title: "《用户隐私协议》" }
      }),
    },
    miniProgramLink: {
      type: String,
      default: "https://futurekey.com"
    },
  },
  methods: {
    shareWxQ() {  
        uni.share({  
            provider: "weixin",  
            scene: "WXSceneTimeline",  
            type: 2,  
            imageUrl: 'https://ask.dcloud.net.cn/uploads/nav_menu/10.jpg',  
            success: function(res) {  
                console.log("success:" + JSON.stringify(res));  
            },  
            fail: function(err) {  
                console.log("fail:" + JSON.stringify(err));  
            }  
        });  
    },  
    closeAbout() {
      this.$emit('update:showAbout', false);
    },
    // 打开外部链接
    openLink(url) {
      uni.navigateTo({
        url: `/pages/webview/index?url=${encodeURIComponent(url)}`,
      });
    },
    // 拨打电话
    callPhone(phoneNumber) {
      uni.makePhoneCall({
        phoneNumber,
      });
    },
    // 复制链接
    copyLink() {
      uni.setClipboardData({
        data: this.miniProgramLink,
        success: () => {
          uni.showToast({
            title: "链接已复制",
            icon: "success",
          });
        },
      });
    },
    shareToQQ() {
      uni.showToast({ title: 'QQ 分享暂不支持', icon: 'none' });
    },
    shareToWeibo() {
      uni.showToast({ title: '微博分享暂不支持', icon: 'none' });
    }
  },
  onShareTimeline() {
    return {
      title: '分享到朋友圈的标题', // 分享的标题
      query: 'key=value', // 分享的参数
      imageUrl: '/static/icons/share-image.png' // 分享的图片路径
    };
  }
};
</script>

<style>
.about-us-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  /* 保证最上层 */
}

.popup {
  background-color: #ffffff;
  width: 80%;
  border-radius: 10px;
  padding: 0 20rpx 20rpx 20rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
}

.popup-header {
  font-size: 36rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20rpx;
}

.popup-content {
  margin-bottom: 20rpx;
}

.item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.text {
  font-size: 32rpx;
  color: #333333;
}

.title {
  font-size: 30rpx;
  color: #0d09ec;
  text-align: right;
  width: 400rpx;
}

.popup-footer {
  text-align: center;
}

.share-text {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 10rpx;
}

.calendar-header {
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  font-weight: bold;
}

.datechoose-text {
  width: 670rpx;
  font-weight: bold;
  font-size: 32rpx;
  color: #333;
}

.close-btn {
  font-size: 50rpx;
  color: #999;
  cursor: pointer;
}

.share-container {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  padding: 10rpx 0;
  margin-top: 10rpx;
}

.share-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 120rpx;
  padding: 0;
}

.icon-link {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
  margin-left: 10rpx;
}

.icon-share {
  width: 64rpx;
  height: 64rpx;
}

.label {
  font-size: 24rpx;
  color: #333;
}

button.custom-button {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 120rpx;
  padding: 0;
  background-color: #ffffff;
}

button.custom-button::after {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 120rpx;
  padding: 0;
  border: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
}

button.custom-button::before {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 120rpx;
  padding: 0;
  border: none !important;
  background-color: transparent !important;
  box-shadow: none !important;
}
</style>
