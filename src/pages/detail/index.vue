<template>
  <view class="container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-left" @click="goBack">
        <image src="@/static/back-icon.png" class="back-icon"></image>
      </view>
      <view class="nav-center">
        <text>课程详情</text>
      </view>
      <!-- 占位元素：确保与系统按钮对齐 -->
      <view class="header-placeholder"></view>
    </view>

    <!-- 顶部课程信息 -->
    <view class="course-info">
      <view class="coursediv">
        <text class="label">课程名称</text>
        <text class="courseContent">{{ courseData.title }}</text>
      </view>
      <view class="coursediv">
        <text class="label">上课时间</text>
        <text class="courseContent">{{ courseData.time }}</text>
      </view>
      <view class="coursediv">
        <text class="label">英语级别</text>
        <text class="courseContent">{{ courseData.class_level }}</text>
      </view>
      <view class="coursediv">
        <text class="label">课程进度</text>
        <text class="courseContent">{{ courseData.process }}</text>
      </view>
    </view>

    <!-- 选项卡 -->
    <view class="tab-container">
      <!-- Tab 切换栏 -->
      <view class="tab-bar">
        <view :class="['tab-item', currentTab === 'before' ? 'active' : '']" @click="switchTab('before')">
          课前
        </view>
        <view :class="['tab-item', currentTab === 'after' ? 'active' : '']" @click="switchTab('after')">
          课后
        </view>
      </view>

      <!-- 内容区 -->
      <view v-if="currentTab === 'before'" class="content">
        <!-- 作业文本 -->
        <view class="task-content">
          <text class="courseContent">{{ courseData.preview }}</text>
        </view>

        <!-- 附件 -->
        <view class="attachment-list">
          <block v-for="(file, index) in courseData.previewFiles" :key="index">
            <view class="file-item">
              <image src="@/static/file-icon.png" class="file-icon" />
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
          <text class="courseContent">{{ courseData.homework }}</text>
        </view>

        <!-- 附件 -->
        <view class="attachment-list">
          <block v-for="(file, index) in courseData.homeworkFiles" :key="index">
            <view class="file-item">
              <image src="@/static/file-icon.png" class="file-icon" />
              <text class="file-name" @click="downloadFile(file)">
                {{ file }}
              </text>
            </view>
          </block>
        </view>
      </view>
      <!-- 上传文件按钮 -->
      <view class="fileSection">
        <image src="@/static/upload-icon.png" class="upload-icon" @click="chooseFile"></image>
        <view class="upload-btn">点击上传</view>
        <text class="upload-tips">最多可上传5个附件，每个附件大小不超过3M</text>
        <!-- 上传文件进度 -->
        <block v-for="(file, index) in uploadFiles" :key="index">
          <!-- 上传状态：成功 -->
          <view v-if="file.status === 'success'" class="file-info">
            <image class="icon-del" :src="file.icon_file" @click="downloadFile(file.filename)"></image>
            <text class="file-name success" @click="downloadFile(file.filename)">{{ file.name }}</text>
            <text class="file-size">{{ file.size }}kb</text>
            <image class="icon-del" :src="file.icon_del" @click="deleteFile(index, file.filename)"></image>
          </view>

          <!-- 上传状态：进行中 -->
          <view v-else-if="file.status === 'uploading'" class="file-info">
            <image class="icon-del" :src="file.icon_file"></image>
            <text class="file-name uploading">{{ file.name }}</text>
            <text class="file-size">{{ file.size }}kb</text>
            <view class="progress-bar">
              <view class="progress" :style="{ width: file.progress + '%' }"></view>
            </view>
            <image class="icon-del" :src="file.icon_del" @click="cancelUpload(index)"></image>
          </view>

          <!-- 上传状态：失败 -->
          <view v-else-if="file.status === 'error'" class="file-info">
            <image class="icon-del" src="file.icon_file"></image>
            <text class="file-name error">{{ file.name }}</text>
            <image class="icon-del" :src="file.icon_del" @click="cancelUpload(index)"></image>
          </view>
          <progress class="upload-progress" :percent="file.progress" v-if="file.status === 'uploading'" />
        </block>
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
      deadline: '', // 截止日期
      beforeHomework: '',
      afterHomework: '',
      beforeFiles: [
      ],
      afterFiles: [
      ],
      uploadFiles: [],
      files: [
      ],
    };
  },
  methods: {
    // 切换Tab
    switchTab(tab) {
      this.currentTab = tab;
    },
    // 上传文件并显示进度
    uploadFile(file) {
      console.log("file", file);
      // 监听上传进度
      let ffname = file.path.split('/').pop()
      if (ffname.length > 30) {
        ffname = ffname.slice(0, 30) + "." + ffname.split('.').pop();
      }
      let uploadItem = {
        name: ffname,
        size: Math.floor(file.size / 1000),
        status: 'uploading',
        progress: 0,
        icon_del: "/static/icons/del.png",
        icon_file: "/static/file-icon.png"
      };
      this.uploadFiles.push(uploadItem);
      console.log("uploadItem", uploadItem);
      const uTask = uni.uploadFile({
        url: `https://www.futurekey.com/classroom/uploadCustom?cid=${this.currentCourseId}&code=${this.$global.studentCode}&size=${uploadItem.size}`, // 替换为实际接口
        filePath: file.path,
        name: 'file',
        success: async (response) => {
          let res = JSON.parse(response.data);
          console.log("res", res);
          if (res.code == 0) {
            uploadItem.filename = res.data.filePath;
            uploadItem.name = uploadItem.filename;
            uploadItem.status = 'success';
            console.log("uploadItem", uploadItem);
            uni.showToast({ title: '上传成功', icon: 'success' });
          } else {
            uploadItem.status = 'error';
            uni.showToast({ title: '上传失败', icon: 'none' });
            // 移除这个文件
            this.uploadFiles.splice(this.uploadFiles.indexOf(uploadItem), 1);
          }
        }
      });

      uTask.onProgressUpdate((res) => {
        uploadItem.progress = res.progress;
      });
    },
    // 选择文件上传
    chooseFile() {
      const that = this;
      let count = 5 - this.uploadFiles.length;
      console.log('count', count);
      if (count <= 0) {
        return uni.showToast({
          title: "最多上传5个文件",
          icon: "none",
        });
      }
      uni.chooseImage({
        count: count,
        size: 3072*1000,
        success: (res) => {
          const maxSize = 3 * 1024 * 1024; // 3MB in bytes
          res.tempFiles.forEach(file => {
            console.log('file', file);
            if (file.size <= maxSize) {
              console.log(file);
              this.uploadFile(file);
            } else {
              uni.showToast({
                title: '文件大小不能超过3MB',
                icon: 'none',
                duration: 2000
              });
            }
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
      if (res.code == 0) {
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
        if (res.code == 0) {
          this.courseData = res.data;
          this.uploadFiles = res.data.customFiles.map(x => {
            // if (x.filename.length > 20) {
            //  x.name = x.filename.slice(0, 20) +"."+ x.filename.split('.').pop();
            //}
            x.name = x.filename;
            x.status = 'success';
            x.size = x.size;
            x.icon_del = "/static/icons/del-his.png";
            x.icon_file = "/static/file-his.png";
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
    downloadAndOpenFile(url, fileType) {
      // 显示加载提示
      uni.showLoading({
        title: '文件加载中...'
      });

      // 使用 URL 的唯一部分作为文件缓存的 key
      const fileKey = `cache_${url}`;

      // 检查本地是否已有缓存
      uni.getStorage({
        key: fileKey,
        success: (res) => {
          // 文件已缓存，直接打开
          console.log('文件已缓存，路径：', res.data);
          this.openFile(res.data, fileType);
        },
        fail: () => {
          // 文件未缓存，执行下载操作
          console.log('文件未缓存，开始下载...');
          this.downloadAndSaveFile(url, fileKey, fileType);
        },
        complete: () => {
          // 下载完成，执行回调函数
          console.log('下载完成，执行回调函数...');
          uni.hideLoading();
        },
      });
    },

    // 下载文件并保存到本地缓存
    downloadAndSaveFile(url, fileKey, fileType) {
      uni.downloadFile({
        url: url, // 文件的下载地址
        success: (res) => {
          if (res.statusCode === 200) {
            console.log('文件下载成功，临时路径：', res.tempFilePath);

            // 保存文件到本地
            uni.saveFile({
              tempFilePath: res.tempFilePath, // 临时文件路径
              success: (saveRes) => {
                console.log('文件已保存到本地，路径：', saveRes.savedFilePath);

                // 缓存文件路径到本地存储
                uni.setStorage({
                  key: fileKey,
                  data: saveRes.savedFilePath,
                  success: () => {
                    console.log('文件路径已缓存');
                  }
                });

                // 保存完成后打开文件
                this.openFile(saveRes.savedFilePath, fileType);
              },
              fail: (err) => {
                console.error('文件保存失败：', err);
                uni.showToast({
                  title: '文件保存失败',
                  icon: 'none'
                });
              }
            });
          } else {
            console.error('文件下载失败，状态码：', res.statusCode);
            uni.showToast({
              title: '下载失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('文件下载失败：', err);
          uni.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    },

    // 打开文件
    openFile(filePath, fileType) {
      if (fileType === 'pdf' || fileType === 'doc' || fileType === 'docx') {
        // 打开文档文件
        uni.openDocument({
          filePath: filePath,
          success: () => {
            console.log('文档文件打开成功');
          },
          fail: (err) => {
            console.error('文档文件打开失败：', err);
            uni.showToast({
              title: '文件打开失败',
              icon: 'none'
            });
          }
        });
      } else if (fileType === 'png' || fileType === 'jpg' || fileType === 'gif' || fileType === 'webp') {
        // 打开图片文件
        uni.previewImage({
          urls: [filePath], // 图片路径数组
          current: filePath // 当前图片路径
        });
      } else if (fileType === 'mp4' || fileType === 'avi' || fileType === 'mov') {
        // 视频文件暂时通过提示方式打开
        uni.showToast({
          title: '请使用视频播放器播放此文件',
          icon: 'none'
        });
      } else {
        console.error('不支持的文件类型：', fileType);
        uni.showToast({
          title: '不支持的文件类型',
          icon: 'none'
        });
      }
    },
    downloadFile(url) {
      console.log("url", url);
      const fileType = url.split('.').pop().toLowerCase(); // 根据文件后缀获取类型
      const furl = `https://www.futurekey.com/classroom/download/${url}`;
      this.downloadAndOpenFile(furl, fileType);
    }
  },
  onLoad(options) {
    // options 是一个对象，包含了所有传递的参数
    console.log(options); // 输出传递的 id 参数
    this.currentCourseId = options.id;
    // 你可以在这里根据 courseId 进行相应的操作
    console.log(this.currentCourseId, this.$global);
    this.fetchData();
  },
  onPullDownRefresh() {
    this.fetchData(); // 获取数据列表
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 800);
  }
};
</script>

<style>
.container {
  background: linear-gradient(to bottom, #2F51FF, #F7F9FC);
  ;
  height: 100vh;
  flex-direction: column;
  overflow-y: hidden;
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
  padding-right: 10rpx;
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
  margin-right: 110rpx;
}

.course-info {
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.coursediv {
  border-radius: 6px;
  padding: 10px 16px 10px 16px;
  gap: 28px;
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

.courseContent {
  width: 253px;
  height: 20px;
  font-family: PingFang SC;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  gap: 0px;
  text-align: left;
  color: #2D2D2D;
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
  min-height: 200rpx;
  margin: 20rpx 0;
}

.title {
  font-size: 28rpx;
  font-weight: bold;
}

/* 文件列表 */
.attachment-list {
  margin: 20rpx 0;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10rpx 0;
  color: #2F51FF;
  font-size: 24rpx;
}

.file-icon {
  width: 30rpx;
  height: 30rpx;
  margin-right: 10rpx;
}

/* 上传区域 */
.fileSection {
  border: 2rpx dashed gray;
  width: 340px;
  min-height: 180px;
  gap: 0px;
  text-align: center;
  margin: 20rpx auto;
  padding-top: 70rpx;
}

.upload-icon {
  width: 100rpx;
  height: 100rpx;
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
  margin: 10rpx 20rpx 10rpx 20rpx;
  font-size: 24rpx;
  padding: 10rpx;
  border-radius: 4px;
}

.file-name.success {
  width: 470rpx;
  text-align: left;
  color: #2D2D2D;
}

.file-name.uploading {
  width: 470rpx;
  text-align: left;
  color: blue;
}

.file-name.error {
  color: orange;
}

.file-size {
  width: 90rpx;
  text-align: right;
  color: #999;
}

.icon-del {
  margin-left: 8rpx;
  width: 32rpx;
  height: 32rpx;
}
</style>
