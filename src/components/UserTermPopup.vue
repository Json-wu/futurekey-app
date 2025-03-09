<template>
  <view v-if="showUserTerm">
    <!-- 遮罩层 -->
    <view class="term-mask">
      <view class="term-modal-content">
        <view class="term-calendar-header">
          <text class="term-datechoose-text">{{title}}</text>
        </view>

        <view class="term-scroll-container"> 
          <div v-html="compiledMarkdown"></div>
        </view>
        <view class="userbutton">
          <view class="cancel" @tap="cancel">取消</view>
          <view class="confirm" @tap="agree">阅读并同意</view>
        </view>
      </view>
    </view>

   
  </view>
</template>

<script>
// import { marked } from 'marked';
// 替换后
import MarkdownIt from 'markdown-it';
const md = new MarkdownIt();
// const html = md.render('# Hello, Markdown!');
export default {
  name: "UserTermPopup",
  data (){
    return {
      title: 'FutureKey 课程请假规则',
    }
  },
  props: {
    showUserTerm: {
      type: Boolean,
      default: false, // 控制显示隐藏
    }
  },
  computed: {
    compiledMarkdown() {
      console.log(uni.getStorageSync('userTermContent'));
      return md.render(uni.getStorageSync('userTermContent'));
    },
  },
  methods: {
    // 关闭协议弹窗
    cancel() {
      this.$emit('update:showUserTerm', false);
    },
    agree() {
      this.$emit('update:showUserTerm', false);
      // 缓存同意状态
      uni.setStorageSync('userTermAgree', true);
    },
  },
};
</script>

<style scoped>
.term-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* 半透明遮罩 */
  z-index: 1000;
}

.term-modal-content {
  width: 94%;
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.5);
  z-index: 1001;
  margin: 20vh auto;
  padding-bottom: 10px;
}
.term-calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  font-weight: bold;
  padding: 20rpx 30rpx;
}
.term-datechoose-text {
  width: 670rpx;
  font-weight: bold;
  font-size: 1.5rem;
  color: #333;
}
.term-scroll-container {
  max-height: 50vh;
  overflow-y: scroll;
  padding: 20px;
  font-size: 1rem;
  line-height: 2rem;
}
.userbutton {
  display: flex;
  justify-content: space-around;
  align-items: center;
  text-align: center;
  font-weight: bold;
  padding: 20rpx 30rpx;
}
.cancel {
  border: none;
  background: transparent;
  padding: .5rem 3rem;
}
.confirm {
  border: none;
  background: transparent;
  color: #d28e11;
  padding: 0.5rem 1rem;
}
</style>
