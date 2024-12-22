<template>
  <view class="container">
     <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-left" @click="goBack">
        <image src="/static/back-icon.png" class="back-icon"></image>
      </view>
      <view class="nav-center">
        <text>课程详情</text>
      </view>
       <!-- 占位元素：确保与系统按钮对齐 -->
      <view class="header-placeholder"></view>
    </view>

    <!-- 顶部课程信息 -->
    <view class="course-info">
      <view class="info-row">
        <text class="label">课程名称</text>
        <text class="text">英语基础语法</text>
      </view>
      <view class="info-row">
        <text class="label">上课时间</text>
        <text class="text">14:00~15:00</text>
      </view>
      <view class="info-row">
        <text class="label">英语级别</text>
        <text class="text">A01</text>
      </view>
      <view class="info-row">
        <text class="label">课程进度</text>
        <text class="text">Unit 3</text>
      </view>
    </view>

    <!-- 选项卡 -->
    <view class="tab-container">
       <!-- Tab 切换栏 -->
        <view class="tab-bar">
        <view 
            :class="['tab-item', currentTab === 'before' ? 'active' : '']" 
            @click="switchTab('before')"
        >
            课前
        </view>
        <view 
            :class="['tab-item', currentTab === 'after' ? 'active' : '']" 
            @click="switchTab('after')"
        >
            课后
        </view>
        </view>

        <!-- 内容区 -->
        <view v-if="currentTab === 'before'" class="content">
            <!-- 作业文本 -->
            <view class="task-content">
                <text class="text">{{ beforeHomework }}</text>
            </view>

            <!-- 附件 -->
            <view class="attachment-list">
                <block v-for="(file, index) in beforeFiles" :key="index">
                <view class="file-item">
                    <image src="/static/file-icon.png" class="file-icon" />
                    <text class="file-name" @click="downloadFile(file.url)">
                    {{ file.name }}
                    </text>
                </view>
                </block>
            </view>

           
        </view>

        <view v-else class="content">
            <!-- 作业文本 -->
            <view class="task-content">
                <text class="text">{{ afterHomework }}</text>
            </view>

            <!-- 附件 -->
            <view class="attachment-list">
                <block v-for="(file, index) in afterFiles" :key="index">
                <view class="file-item">
                    <image src="/static/file-icon.png" class="file-icon" />
                    <text class="file-name" @click="downloadFile(file.url)">
                    {{ file.name }}
                    </text>
                </view>
                </block>
            </view>
        </view>
        <!-- 上传文件按钮 -->
        <view class="upload-section" >
            <image src="/static/upload-icon.png" class="upload-icon" @click="chooseFile"></image>
            <view class="upload-btn" >点击上传</view>
            <text class="upload-tips">最多可上传5个附件，每个附件大小不超过3M</text>
            <!-- 上传文件进度 -->
            <block v-for="(upload, index) in uploadFiles" :key="index">
               <!-- 上传状态：成功 -->
              <view v-if="file.status === 'success'" class="file-info">
                <text class="file-name success">{{ file.name }}</text>
                <text class="file-size">{{ file.size }}kb</text>
                <button class="delete-btn" @click="deleteFile(index)">×</button>
              </view>

              <!-- 上传状态：进行中 -->
              <view v-else-if="file.status === 'uploading'" class="file-info">
                <text class="file-name uploading">{{ file.name }}</text>
                <view class="progress-bar">
                  <view class="progress" :style="{ width: file.progress + '%' }"></view>
                </view>
                <text class="file-progress">{{ file.size }}kb {{ file.progress }}%</text>
                <button class="cancel-btn" @click="cancelUpload(index)">×</button>
                <progress  :percent="upload.progress" />
              </view>

              <!-- 上传状态：失败 -->
              <view v-else-if="file.status === 'error'" class="file-info">
                <text class="file-name error">{{ file.name }}</text>
                <button class="retry-btn" @click="retryUpload(index)">⟲</button>
              </view>
              <view class="upload-progress">
                <view class="filename">{{ upload.name }} 
                    <image src="/static/delete-icon.png" class="delete-icon" @click="removeFile(index)" />
                </view>
                <progress  :percent="upload.progress" />
              </view>
            </block>
        </view>
    </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'before', // 当前选中的Tab
      deadline: '2024.11.24 10:22', // 截止日期
      beforeHomework: '1. Complete 1 post-class reading\n2. Listen and read for 30 minutes',
      afterHomework: '1. Submit your notes\n2. Review the recorded class content',
      beforeFiles: [
        { name: 'zujianku0929.png', url: '/static/leave.png' }
      ],
      afterFiles: [
        { name: 'zujianku0929.png', url: '/static/leave.png' }
      ],
      uploads: [],
      uploadFiles: [], // 文件上传进度
      files: [
        // 示例数据
        { name: 'zujianku0929.png', size: 103, status: 'success' },
        { name: 'zujianku0929.png', size: 365, progress: 100, status: 'uploading' },
        { name: 'zujianku0929.png', size: 365, status: 'error' },
      ],
    };
  },
  methods: {
     // 切换Tab
    switchTab(tab) {
      this.currentTab = tab;
    },
    // 下载文件
    downloadFile(url) {
      uni.downloadFile({
        url: url,
        success: (res) => {
          uni.showToast({
            title: '下载成功',
            icon: 'success'
          });
        }
      });
    },
     // 上传文件并显示进度
    uploadFile(file) {
      // 监听上传进度
      let uploadItem = {
        name: file.name,
        progress: 0
      };
      this.uploadFiles.push(uploadItem);
      console.log("uploadItem", uploadItem);
      const uploadTask = uni.uploadFile({
        url: 'https://demo/classroom/upload', // 替换为实际接口
        filePath: file.path,
        name: 'file',
        success: async (response) => {
          let res = JSON.parse(response.data);
          console.log("res", res);
          if(res.code==0){
            let fpath = res.data.filePath;
             console.log("fpath", fpath);
            if (fpath.length > 30) {
              uploadItem.name = fpath.slice(0, 30) +"."+ fpath.split('.').pop();
            }
            console.log("uploadItem", uploadItem);
            uni.showToast({ title: '上传成功', icon: 'success' });
          }else{
            uni.showToast({ title: '上传失败', icon: 'none' });
          }
        }
      });

      uploadTask.onProgressUpdate((res) => {
        uploadItem.progress = res.progress;
      });
    },
    // 选择文件上传
    chooseFile() {
      const that = this;
      uni.chooseImage({
        count: 5,
        success: (res) => {
          res.tempFiles.forEach(file => {
            console.log(file);
            this.uploadFile(file);
          });
        }
      });
    },
    fakeUploadProgress(file) {
      const interval = setInterval(() => {
        file.progress += 10;
        if (file.progress >= 100) clearInterval(interval);
      }, 200);
    },
     // 删除文件
    deleteFile(index) {
      this.files.splice(index, 1);
    },
    // 取消上传
    cancelUpload(index) {
      this.files[index].status = 'error';
    },
    // 重试上传
    retryUpload(index) {
      this.files[index].status = 'uploading';
      this.files[index].progress = 0;

      // 模拟重新上传
      const interval = setInterval(() => {
        if (this.files[index].progress < 100) {
          this.files[index].progress += 10;
        } else {
          clearInterval(interval);
          this.files[index].status = 'success';
        }
      }, 200);
    },
   
    goBack() {
      uni.navigateBack();
    },
    // 删除文件
    removeFile(index) {
      this.uploadFiles.splice(index, 1);
    }
  }
};
</script>

<style>
.container {
  background: linear-gradient(to bottom, #2F51FF, #F7F9FC);;
  height: 100vh;
  flex-direction: column;
}
.custom-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 45px;
  color: #fff;
  padding-top: 44px;
}

.nav-left {
  display: flex;
  align-items: center;
}

.back-icon {
  width: 20rpx;
  height: 40rpx;
  margin-left: 20rpx;
}

.nav-center {
    flex: 1;
    text-align: center;
    font-size: 30rpx;
    font-weight: bold;
    margin-right: 100rpx;
}

.course-info {
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}
.info-row {
    border-radius: 6px;
    padding: 6px 16px 6px 16px;
    gap: 28px;
    opacity: 0px;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10rpx;
}
.label {
    font-family: PingFang SC;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    text-align: left;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    color: #00000083;
}

.text{
    width: 253px;
    height: 20px;
    font-family: PingFang SC;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    text-underline-position: from-font;
    text-decoration-skip-ink: none;
    gap: 0px;
    opacity: 0px;
    text-align: left;
    color: #2D2D2D3;
}

.tab-container {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  overflow: hidden;
}
.tab-bar {
  display: flex;
  border-bottom: 2rpx solid #f0f0f0;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  color: #007aff;
  background-color: #FFFFFF;
}
.active {
  background-color: #007aff;
  color: #FFFFFF;
}
.red-dot {
  display: inline-block;
  width: 10rpx;
  height: 10rpx;
  background-color: red;
  border-radius: 50%;
  margin-left: 5rpx;
}

.content {
    padding: 20rpx 40rpx 20rpx 40rpx;
}
/* 作业文本内容 */
.task-content {
  margin: 20rpx 0;
}

.title {
  font-size: 28rpx;
  font-weight: bold;
}

.text {
  font-size: 26rpx;
  line-height: 40rpx;
}

/* 文件列表 */
.attachment-list {
  margin: 20rpx 0;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10rpx 0;
}

.file-icon {
  width: 30rpx;
  height: 30rpx;
  margin-right: 10rpx;
}

.file-name {
  color: #007aff;
  text-decoration: underline;
}

/* 上传区域 */
.upload-section {
  border: 2rpx dashed gray;
  width: 340px;
  min-height: 180px;
  gap: 0px;
  opacity: 0px;
  text-align: center;
  margin: 20rpx auto;
  padding: 70rpx 0;
}

.upload-icon {
    width:100rpx;
    height:100rpx;
}

.upload-btn {
    font-weight: bold;
    color: #007aff;
    padding: 10rpx 0;
    margin: 10rpx 0;
}

.upload-tips {
  font-size: 24rpx;
  color: #999;
}

.filename {
    text-align: left;
    font-size: 28rpx;
    white-space: normal;
    margin-bottom: 10rpx;
}

.upload-progress {
    margin: 10rpx;
    padding: 10rpx;
    background: #2F82FF1A;
}
.delete-icon {
    width: 24rpx;
    height: 24rpx;
    margin-left: 10rpx;
    cursor: pointer;
}
</style>
