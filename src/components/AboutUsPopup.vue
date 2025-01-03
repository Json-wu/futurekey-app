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
          <image src="/static/icons/website.png" class="icon" />
          <text class="text">{{ data.website.text }}</text>
          <text class="title">{{ data.website.title }}</text>
        </view>
        <!-- 客服电话 -->
        <view class="item" @click="callPhone(data.phone.number)">
          <image src="/static/icons/phone.png" class="icon" />
          <text class="text">{{ data.phone.text }}</text>
          <text class="title">{{ data.phone.number }}</text>
        </view>
        <!-- 用户协议 -->
        <view class="item" @click="openLink(data.agreement.url)">
          <image src="/static/icons/agreement.png" class="icon" />
          <text class="text">{{ data.agreement.text }}</text>
          <text class="title">{{ data.agreement.title }}</text>
        </view>
      </view>

      <!-- 分享部分 -->
      <view class="popup-footer">
        <text class="share-text">觉得不错？分享到：</text>
        <view class="share-buttons">
          <image src="/static/icons/wechat.png" class="share-icon" @click="share('wechat')" />
          <image src="/static/icons/moments.png" class="share-icon" @click="share('wechatMoments')" />
          <image src="/static/icons/weibo.png" class="share-icon" @click="share('weibo')" />
          <image src="/static/icons/qq.png" class="share-icon" @click="share('qq')" />
          <image src="/static/icons/copy-link.png" class="share-icon" @click="copyLink()" />
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
        phone: { text: "客服电话", number: "400-189-0866" },
        agreement: { text: "用户协议", url: "https://futurekey.com/private", title: "《用户隐私协议》" },
        shareData: {
          title: '科爱信',
          path: '/pages/index/index', // 分享路径
          imageUrl: 'https://futurekey.com/favicon.ico' // 分享图片URL
        }
      }),
    },
    miniProgramLink: {
      type: String,
      default: "https://futurekey.com"
    },
  },
  methods: {
    closeAbout(){
       this.$emit('update:showAbout', false);
    },
    // 打开外部链接
    openLink(url) {
      uni.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(url)}`,
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
    share(platform) {
      if (platform === 'wechat') {
        this.shareToWeChat();
      } else if (platform === 'wechatMoments') {
        this.shareToWeChatMoments();
      } else if (platform === 'qq') {
        this.shareToQQ();
      } else if (platform === 'weibo') {
        this.shareToWeibo();
      }
    },

    showShareMenu(menus) {
      uni.showShareMenu({
        withShareTicket: true,
        menus: menus
      });
    },

    shareToWeChat() {
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareAppMessage', 'shareTimeline']
      });
      this.$emit('update:shareTarget', 'wechat');
    },

    shareToWeChatMoments() {
      uni.showShareMenu({
        withShareTicket: true,
        menus: ['shareTimeline']
      });
      this.$emit('update:shareTarget', 'wechatMoments');
    },

    shareToQQ() {
      uni.showToast({ title: 'QQ 分享暂不支持', icon: 'none' });
    },

    shareToWeibo() {
      uni.showToast({ title: '微博分享暂不支持', icon: 'none' });
    }
  },
  onShareAppMessage(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: this.shareData.title,
        path: this.shareData.path,
        imageUrl: this.shareData.imageUrl
      };
    }
  },
  onShareTimeline() {
    return {
      title: this.shareData.title,
      path: this.shareData.path,
      imageUrl: this.shareData.imageUrl
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
  z-index: 9999; /* 保证最上层 */
}
.popup {
  background-color: #ffffff;
  width: 80%;
  border-radius: 10px;
  padding: 20rpx;
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
.icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
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
.share-buttons {
  margin-top: 18rpx;
  display: flex;
  justify-content: space-around;
}
.share-icon {
  width: 48px;
  height: 60px;
  gap: 8px;
  opacity: 0px;
}
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  font-weight: bold;
  padding: 10rpx 30rpx;
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
</style>
