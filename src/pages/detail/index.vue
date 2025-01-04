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
        <text class="text">{{courseData.title}}</text>
      </view>
      <view class="info-row">
        <text class="label">上课时间</text>
        <text class="text">{{courseData.time}}</text>
      </view>
      <view class="info-row">
        <text class="label">英语级别</text>
        <text class="text">{{courseData.class_level}}</text>
      </view>
      <view class="info-row">
        <text class="label">课程进度</text>
        <text class="text">{{courseData.process}}</text>
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
                <text class="text">{{ courseData.preview }}</text>
            </view>

            <!-- 附件 -->
            <view class="attachment-list">
                <block v-for="(file, index) in courseData.previewFiles" :key="index">
                <view class="file-item">
                    <image src="/static/file-icon.png" class="file-icon" />
                    <text class="file-name" @click="downloadFile(file)">
                    {{ file }}
                    </text>
                </view>
                </block>
            </view>
        </view>

        <view v-else class="content">
            <!-- 作业文本 -->
            <view class="task-content">
                <text class="text">{{ courseData.homework }}</text>
            </view>

            <!-- 附件 -->
            <view class="attachment-list">
                <block v-for="(file, index) in courseData.homeworkFiles" :key="index">
                <view class="file-item">
                    <image src="/static/file-icon.png" class="file-icon" />
                    <text class="file-name" @click="downloadFile(file)">
                    {{ file }}
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
            <block v-for="(file, index) in uploadFiles" :key="index">
               <!-- 上传状态：成功 -->
              <view v-if="file.status === 'success'" class="file-info">
                <text class="file-name success">{{ file.name }}</text>
                <text class="file-size">{{ file.size}}kb</text>
                <view class="delete-icon" @click="deleteFile(index, file.filename)">×</view>
              </view>

              <!-- 上传状态：进行中 -->
              <view v-else-if="file.status === 'uploading'" class="file-info">
                <text class="file-name uploading">{{ file.name }}</text>
                <view class="progress-bar">
                  <view class="progress" :style="{ width: file.progress + '%' }"></view>
                </view>
                <text class="file-size">{{ file.progress }}%</text>
                <view class="cancel-btn" @click="cancelUpload(index)">×</view>
              </view>

              <!-- 上传状态：失败 -->
              <view v-else-if="file.status === 'error'" class="file-info">
                <text class="file-name error">{{ file.name }}</text>
                <view class="retry-btn" @click="retryUpload(index)">⟲</view>
              </view>
              <progress class = "upload-progress" :percent="file.progress" v-if="file.status === 'uploading'"/>
            </block>
        </view>
    </view>
    </view>
  </view>
</template>

<script>
 import { getCourseInfo, deleteFile } from '../../utils/api';

export default {
  data() {
    return {
      courseData: {},
      currentCourseId: '',
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
      uploadFiles: [],
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
        url: `https://www.futurekey.com/classroom/download/${url}`,
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
       console.log("file", file);
      // 监听上传进度
      let ffname = file.path.split('/').pop()
      if (ffname.length > 20) {
        ffname = ffname.slice(0, 20) +"."+ ffname.split('.').pop();
      }
      let uploadItem = {
        name: ffname, //file.path.split('/').pop(),
        size: Math.floor(file.size/1000),
        status: 'uploading',
        progress: 0
      };
      this.uploadFiles.push(uploadItem);
      console.log("uploadItem", uploadItem);
      const uploadTask = uni.uploadFile({
        url: `https://www.futurekey.com/classroom/uploadCustom?cid=${this.currentCourseId}&code=${this.$global.studentCode}&size=${uploadItem.size}`, // 替换为实际接口
        filePath: file.path,
        name: 'file',
        success: async (response) => {
          let res = JSON.parse(response.data);
          console.log("res", res);
          if(res.code==0){
            uploadItem.filename = res.data.filePath;
            let fpath = res.data.filePath.split('-').pop();
             console.log("fpath", fpath);
            if (fpath.length > 20) {
              uploadItem.name = fpath.slice(0, 20) +"."+ fpath.split('.').pop();
            }
            console.log("uploadItem.name", uploadItem.name);
            uploadItem.status = 'success';
            console.log("uploadItem", uploadItem);
            uni.showToast({ title: '上传成功', icon: 'success' });
          }else{
            uploadItem.status = 'error';
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
      let count = 5 - this.uploadFiles.length;
      console.log('count', count);
      uni.chooseImage({
        count: count,
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
    async deleteFile(index, filename) {
      this.uploadFiles.splice(index, 1);
      const res = await deleteFile({
        code: this.$global.studentCode,
        filename: filename
      });
      console.log('删除文件:', res);
      // 处理返回的数据
      if(res.code==0){
        console.log('删除文件成功')
      }
    },
    // 取消上传
    cancelUpload(index) {
      this.uploadFiles[index].status = 'error';
    },
    // 重试上传
    retryUpload(index) {
      this.uploadFiles[index].status = 'uploading';
      this.uploadFiles[index].progress = 0;

      // 模拟重新上传
      const interval = setInterval(() => {
        if (this.uploadFiles[index].progress < 100) {
          this.uploadFiles[index].progress += 10;
        } else {
          clearInterval(interval);
          this.uploadFiles[index].status = 'success';
        }
      }, 200);
    },
   
    goBack() {
      uni.navigateBack();
    },
    async fetchData() {
      try {
        // 显示加载提示
        uni.showLoading({
          title: '加载中...'
        });
        this.loading = true;

        const res = await getCourseInfo({
          id: this.currentCourseId,
          timezone: this.$global.timezone,
          code: this.$global.studentCode
        });
        console.log('课程信息:', res);
        // 处理返回的数据
        if(res.code==0){
          this.courseData = res.data;
          this.uploadFiles = res.data.customFiles.map(x=> {
            if (x.filename.length > 20) {
              x.name = x.filename.slice(0, 20) +"."+ x.filename.split('.').pop();
            }
            x.status = 'success';
            return x;
          });
          console.log("this.uploadFiles", this.uploadFiles);
        }
      } catch (error) {
        console.error('显示加载提示失败:', error);
      } finally {
        // 隐藏加载提示
        uni.hideLoading();
        this.loading = false;
      }
    },
  },
  onLoad(options) {
    // options 是一个对象，包含了所有传递的参数
    console.log(options); // 输出传递的 id 参数
    this.currentCourseId = options.id;
    // 你可以在这里根据 courseId 进行相应的操作
    console.log(this.currentCourseId, this.$global);
    this.fetchData();
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
  min-height: 200rpx;
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
  color: #ff4d4f;
  font-size: 40rpx;
  width: 24rpx;
  margin-left: 10rpx;
  cursor: pointer;
}

.cancel-btn {
  color: #999;
}

.retry-btn {
  color: orange;
}

.file-info {
  background: #2F82FF1A;
  display: flex;
  align-items: center;
  margin-top: 10rpx;
}

.file-name.success {
  width: 470rpx;
  text-align: left;
  color: #2D2D2D;
  padding-left: 20rpx;
}

.file-name.uploading {
  width: 470rpx;
  text-align: left;
  color: blue;
  padding-left: 20rpx;
}

.file-name.error {
  color: orange;
}

.file-size {
  font-size: 14px;
  margin-left: 10px;
  color: #999;
}
</style>
