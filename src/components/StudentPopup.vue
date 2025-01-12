<template>
    <view class="modal" v-if="isVisible">
        <view class="modal-content">
            <view class="modal-header">
                <text class="datechoose-text">轻触切换学生</text>
                <view class="close-btn" @tap="closeVisible">×</view>
            </view>
            <view class="student-list">
                <view v-for="(student, index) in studentList" :key="index" class="student-item"
                    @tap="switchStudent(index)">
                    <text class="student-name">{{ student.name }}（{{ student.code }}）</text>
                    <view v-if="selectedStudentCode === student.code" class="current-tag">当前</view>

                </view>
            </view>
            <button class="logout-btn" @tap="logout">退出登录</button>
        </view>
    </view>
</template>

<script>
export default {
    props: {
        isVisible: {
            type: Boolean,
            required: true,
        },
        studentList: {
            type: Array,
            required: true,
        },
        selectedStudentCode: {
            type: String,
            required: true,
        }
    },
    methods: {
        closeVisible() {
            this.$emit('update:isVisible', false);
        },
        switchStudent(index) {
            // 更新全局变量中的当前选中学生 ID
            // 可以加入切换逻辑，比如通知其他页面刷新数据
            this.$emit("updateStudent", index);
        },
        logout() {
            uni.showLoading({
                title: '退出登录中...',
                mask: true
            });
            // 退出登录逻辑
            // this.$emit("logout");
            console.log("退出登录");
            const token = uni.getStorageSync('token');
            console.log("token",token);
            this.$global.studentCode = null;
            this.$global.phone = null;
            this.$global.isLogin = false;
            this.$global.studentList=[];
            uni.removeStorageSync('timezoneIndex');
            uni.removeStorageSync('studentCode');
            uni.removeStorageSync('phone');
            uni.removeStorageSync('isLogin');
            uni.removeStorageSync('studentList');
            uni.removeStorageSync('isAgreed');

            // 调用后端接口退出
            uni.request({
              url: 'https://www.futurekey.com/classroom/wechat/logout',
              method: 'POST',
              data: {
                token: token
              },
              success: (response) => {
                let result = response.data;
                if (result.code == 0) {
                    uni.removeStorageSync('token');
                    uni.navigateTo({
                        url: '/pages/index/index',
                        success() {
                            uni.hideLoading();
                            uni.showToast({
                                title: '退出登录成功',
                                icon: 'success',
                                duration: 2000
                            });
                        }
                    });
                } else {
                  uni.hideLoading();
                  uni.showToast({
                    title: '退出失败',
                    icon: 'none'
                  });
                }
              },
              fail: (err) => {
                console.error('请求失败:', err);
                uni.hideLoading();
                uni.showToast({
                  title: '网络异常，请联系客服处理',
                  icon: 'none'
                });
              },
            });
            
            this.closeVisible();
        },
    },
};
</script>

<style>
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
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
}

.modal-content {
    background-color: #fff;
    width: 80%;
    border-radius: 10px;
    padding: 20px;
    text-align: center;
}

.modal-header {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    font-weight: bold;
}

.student-list {
    margin-bottom: 20px;
}

.student-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
}

.student-name {
    font-size: 16px;
}

.student-id {
    font-size: 14px;
    color: #888;
}

.current-tag {
    color: #fff;
    background-color: #007aff;
    font-size: 14px;
    padding: 2px 8px;
    border-radius: 4px;
}

.logout-btn {
    background-color: #007aff;
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 4px 20px;
    font-size: 16px;
}
</style>