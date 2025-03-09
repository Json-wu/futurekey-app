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
        <div class="text-content">
          {{ courseData.preview || '' }}
        </div>
          
        <block v-for="(file, index) in courseData.previewFiles" :key="index">
          <view class="file-item">
            <image src="@/static/file-icon.png" class="file-icon" />
            <text class="file-name" @click="downloadFile(file)">
              {{ file }}
            </text>
          </view>
        </block>
        
      </view>

      <view v-else class="content">
        <!-- 作业文本 -->
        <div class="text-content">
          {{ courseData.homework || '' }}
        </div>
        <block v-for="(file, index) in courseData.homeworkFiles" :key="index">
          <view class="file-item">
            <image src="@/static/file-icon.png" class="file-icon" />
            <text class="file-name" @click="downloadFile(file)">
              {{ file }}
            </text>
          </view>
        </block>
      </view>
      <!-- 上传文件按钮 -->
      <view class="fileSection">
        <image src="@/static/upload-icon.png" class="upload-icon" @click="chooseFile"></image>
        <view class="upload-btn">点击上传</view>
        <text class="upload-tips">最多可上传5个附件，每个附件大小不超过3M</text>
      </view>
       <!-- 上传文件进度 -->
      <view class="file-list">
        <block v-for="(file, index) in uploadFiles" :key="index">
          <!-- 上传状态：成功 -->
          <view v-if="file.status === 'success'" class="file-info">
            <image class="icon-del" :src="file.icon_file" @click="downloadFile(file.filename)"></image>
            <text class="file-name success" :class = "file.fontcss" @click="downloadFile(file.filename)">{{ file.name }}</text>
            <text class="file-size" :class = "file.fontcss">{{ file.size }}kb</text>
            <image class="icon-del" :src="file.icon_del" @click="deleteFile(index, file.filename)"></image>
          </view>

          <!-- 上传状态：进行中 -->
          <view v-else-if="file.status === 'uploading'" class="file-info">
            <image class="icon-del" :src="file.icon_file"></image>
            <text class="file-name uploading" :class = "file.fontcss">{{ file.name }}</text>
            <text class="file-size" :class = "file.fontcss">{{ file.size }}kb</text>
          
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

    <!-- 底部按钮区域 -->
    <view class="bottom-container">
      <view class="bottom-buttons">
        <!-- 统计按钮 -->
        <view class="button-item" @click="showLate">
          <image src="/static/late.png" class="icon" mode="widthFix"></image>
          <text class="button-text">迟到</text>
        </view>
        <!-- 分割线 -->
        <view class="viewider"></view>
        <!-- 请假按钮 -->
        <view class="button-item" @click="showLeave">
          <image src="/static/leave.png" class="icon" mode="widthFix"></image>
          <text class="button-text">请假</text>
        </view>
      </view>
    </view>

    <!-- Modal -->
    <view v-show="isShow" class="modal">
      <view class="modal-content">
        <view class="calendar-header">
          <text class="datechoose-text">请假申请</text>
          <view class="close-btn" @tap="hideLeave">×</view>
        </view>

        <view class="rule-section"> 
          <view class="rule-header">
            <view>本次请假<text v-if="courseData.checkLeave.status==0 || courseData.checkLeave.status==1">不扣除</text><text v-else>扣除1</text>课时，查看<text class="rule-text" @click="toggleRule">请假规则</text></view>
          </view>
          <view class="tips" v-show="isShowRule">
            <li style="color: red;">⚠ {{courseData.checkLeave.message}}</li>
            <li>请假规则如下：</li>
            <li class="tipli">每4周可有 1 次不扣课时的请假，需提前 24 小时请假，并在两周内申请补课。</li>
            <li class="tipli">以下情况课时不退：无故缺课、未提前 24 小时请假、或超出每月 1 次请假机会。</li>
            <li class="tipli2"> - 若课程有回放，仅提供回放，不安排补课；</li>
            <li class="tipli2"> - 若课程无回放，可在两周内申请补课。</li>
            <li class="tipli">如需连续请假 2 节以上，需提前一周通知，课时可顺延，并可申请补课。</li>
            <li class="tipli">（1v1 课程）学生迟到 5 分钟后，老师有权退出教室。若学生未成功出席，可在两周内申请补课。</li>
            <li class="tipli">因老师原因调整课程，不计入学生请假次数，课时不受影响。</li>
          </view>
        </view>
        
        <!-- Leave Reason Selection -->
        <view class="leave-reason-selection">
          <picker mode="selector" :range="leaveReasons" @change="onReasonChange">
            <view class="picker">
              请假原因：  {{ leaveReasons[selectedReason] }} ▼
            </view>
          </picker>
          
          <!-- Remarks Input -->
          <textarea 
            class="textarea" 
            placeholder="请输入备注" 
            maxlength="200"
            v-model="remarks"
            auto-height
          />
        </view>
        <!-- Action Buttons -->
        <view class="calendar-header">
          <button class="btn cancel" @tap="hideLeave">取消</button>
          <button class="btn confirm" @tap="confirmLeave">确定</button>
        </view>
      </view>
    </view>
    <!-- End Modal -->

    <!-- Modal 迟到弹窗，选择预计迟到分钟数（15分钟以内），备注-->
     <view v-show="isShowLate" class="modal">
      <view class="modal-content">
        <view class="calendar-header">
          <text class="datechoose-text">迟到申请</text>
          <view class="close-btn" @tap="hideLate">×</view>  
        </view>

        <view class="rule-section"> 
          <view class="rule-header">
            <view>选择预计迟到分钟数、迟到原因，通知老师课堂等待！！！</view>
          </view>
        </view> 
        <view class="leave-reason-selection">
          <picker mode="selector" :range="lateMinutes" @change="onLateChange">
            <view class="picker">
              预计迟到分钟数：  {{ lateMinutes[selectLateMinute] }} ▼
            </view>
          </picker>

          <picker mode="selector" :range="lateReasons" @change="onReasonChange">
            <view class="picker">
              迟到原因：  {{ lateReasons[selectLateReason] }} ▼
            </view>
          </picker>
          
          <!-- Remarks Input -->
          <!-- <textarea 
            class="textarea" 
            placeholder="请输入备注" 
            maxlength="200"
            v-model="lateremarks"
            auto-height
          /> -->
        </view>

        <view class="calendar-header">
          <button class="btn cancel" @tap="hideLate">取消</button>
          <button class="btn confirm" @tap="confirmLate">确定</button>
        </view>
      </view>
     </view>

     <UserTermPopup :showUserTerm="showUserTerm" @update:showUserTerm="val => showUserTerm = val" />
  </view>
</template>

<script>
import { getCourseInfo, deleteFile, leaveSubmit, lateSubmit } from '../../utils/api';
import UserTermPopup from '@/components/UserTermPopup.vue';

export default {
  components: {
    UserTermPopup
  },
  data() {
    return {
      courseData: {},
      currentCourseId: '',
      currentTab: 'before', // 当前选中的Tab
      showUserTerm: false,
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
      timezones: [],
      selectedTimeZoneIndex: 0,
      openfilesPath: [],
      isShow: false, // Controls modal visibility
      leaveReasons: ['事假', '病假', '其他'], // Leave reasons
      leaveReasons_en: ['Personal leave', 'Sick leave', 'Other'], // Leave reasons
      selectedReason: 0, // Index of selected leave reason
      leaveCount: 0, // 本月请假次数
      remarks: '', 
      isShowRule: false,
      isShowLate: false,
      lateMinutes: [3, 5, 10, 15],
      lateMinutes_en: ['Three', 'Five', 'Ten', 'Fifteen'],
      selectLateMinute: 0,
      lateremarks: '',
      lateReasons: ['时间冲突 📅','身体不适 🤒','网络连接不稳定 🌐','其他原因'],
      lateReasons_en: ['Time conflict 📅','Feeling unwell 🤒','Unstable internet connection 🌐','Other reasons'],
      selectLateReason: 0,
      modalHeight: 17
    };
  },
  created() {
    this.timezones = this.$global.timezones;
    this.selectedTimeZoneIndex = uni.getStorageSync("timezoneIndex") || 0;
    this.$global.timezone = this.timezones[this.selectedTimeZoneIndex].value;
  },
  methods: {
    subFilename(fname) {
      console.log('fname', fname);
      if (fname.split('-').length > 1) {
        return fname.split('-').pop();
      }
      if (fname.length > 20) {
        return fname.slice(0, 20) + "." + fname.split('.').pop();
      }
      return fname;
    },
    // 切换Tab
    switchTab(tab) {
      this.currentTab = tab;
    },
    // 上传文件并显示进度
    uploadFile(file) {
      console.log("file", file);
      // 监听上传进度
      let ffname = file.path.split('/').pop()

      let uploadItem = {
        name: this.subFilename(ffname),
        size: Math.floor(file.size / 1000),
        status: 'uploading',
        progress: 0,
        fontcss: "upload",
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
            uploadItem.name = this.subFilename(uploadItem.filename);
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
        size: 3072 * 1000,
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
            // }
            x.name = this.subFilename(x.filename);
            x.status = 'success';
            x.size = x.size;
            x.icon_del = "/static/icons/del-his.png";
            x.icon_file = "/static/file-his.png";
            x.fontcss = "upload-his";
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
        }
      });
    },

    // 下载文件并保存到本地缓存
    downloadAndSaveFile(url, fileKey, fileType) {
      uni.showLoading({
        title: '下载中...',
        mask: true,
      });
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
                uni.hideLoading()
                uni.showToast({
                  title: '文件保存失败',
                  icon: 'none'
                });
              }
            });
          } else {
            console.error('文件下载失败，状态码：', res.statusCode);
            uni.hideLoading()
            uni.showToast({
              title: '下载失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('文件下载失败：', err);
          uni.hideLoading()
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
            uni.hideLoading();
          },
          fail: (err) => {
            console.error('文档文件打开失败：', err);
            uni.hideLoading();
            uni.showToast({
              title: '文件打开失败',
              icon: 'none'
            });
          }
        });
      } else if (fileType === 'png' || fileType === 'jpg' || fileType === 'gif' || fileType === 'webp') {
        // 打开图片文件
        uni.previewImage({
          urls: this.openfilesPath.length>0 ? this.openfilesPath: [filePath], // 图片路径数组
          current: filePath // 当前图片路径
        }).then(() => {
          console.log('图片文件打开成功');
          this.openfilesPath.push(filePath);
          uni.hideLoading();
        }).catch((err) => {
          console.error('图片文件打开失败：', err);
          uni.hideLoading();
          uni.showToast({
            title: '图片打开失败',
            icon: 'none'
          });
        });
      } else if (fileType === 'mp4' || fileType === 'avi' || fileType === 'mov') {
        // 视频文件暂时通过提示方式打开
        uni.hideLoading();
        uni.showToast({
          title: '请使用视频播放器播放此文件',
          icon: 'none'
        });
      } else {
        console.error('不支持的文件类型：', fileType);
        uni.hideLoading();
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
    },
    showLeave() {
      if(!uni.getStorageSync("userTermAgree")) {
        this.showUserTerm = true;
        return;
      }
      if(this.courseData.state==1) {
        uni.showToast({
          title: '课程已结束，无法请假',
          icon: 'none'
        });
        return;
      }
      if(this.courseData.state==2) {
        uni.showToast({
          title: '课程已请假，无法请假',
          icon: 'none'
        });
        return;
      }
      this.isShow = true; // Show the modal
      this.selectedReason = 0;
      this.remarks="";
    },
    hideLeave() {
      this.isShow = false; // Hide the modal
      this.isShowRule = false;
      this.modalHeight = 17;
    },
    onReasonChange(e) {
      this.selectedReason = e.detail.value; // Update selected reason
    },
    confirmLeave() {
      if(this.remarks.trim().length ==0) {
        uni.showToast({
          title: '请输入备注信息',
          icon: 'none'
        });
        return;
      }
      // 弹出确认弹窗
      uni.showModal({
        title: '确定请假',
        content: '确定知晓请假规则，并提交？',
        success: (res) => {
          if (res.confirm) {
            // 这里添加提交操作的代码，例如向服务器发送请求等
            console.log("提交操作");
            this.handleLeave();
          } else if (res.cancel) {
            console.log('取消操作');
          }
        }
      });
    },
    async handleLeave() {
      // Handle leave confirmation logic here
      const reason = this.leaveReasons_en[this.selectedReason];
      const remarks = this.remarks;
      this.hideLeave();
      uni.showLoading({
        title: '提交中...'
      });
      const res = await leaveSubmit({
        "studentCode": this.$global.studentCode,
        "courseIds": [this.currentCourseId],
        "reason": reason,
        "remarks": remarks,
      });
      uni.hideLoading();
      if (res.code !== 0) {
        uni.showToast({
          title: '请假提交失败',
          icon: 'none'
        });
        return;
      }
      console.log('请假已提交-0', new Date());
      uni.showToast({
        title: '请假已提交',
        icon: 'success',
        duration: 2000
      });
      setTimeout(() => {
        console.log('请假已提交-1', new Date());
        this.fetchData();
      }, 2000);
    },
    toggleRule() {
      this.isShowRule = !this.isShowRule;
      this.modalHeight = this.isShowRule ? 41 : 17;
      console.log('isShowRule', this.isShowRule);
    },
    showLate(){
      if(this.courseData.state==1) {
        uni.showToast({
          title: '课程已结束，无法上报迟到',
          icon: 'none'
        });
        return;
      }
      if(this.courseData.state==2) {
        uni.showToast({
          title: '课程已请假，无法上报迟到',
          icon: 'none'
        });
       return;
      }
      this.isShowLate = true;
    },
    hideLate() {
      this.isShowLate = false; // Hide the modal
    },
    onLateChange(e) {
      this.selectLateMinute = e.detail.value; // Update selected reason
    },
    onReasonChange(e) {
      this.selectLateReason = e.detail.value; // Update selected reason
    },
    confirmLate() {
      // if(this.lateremarks.trim().length ==0) {
      //   uni.showToast({
      //     title: '请输入备注信息',
      //     icon: 'none'
      //   });
      //   return;
      // }
      // 弹出确认弹窗
      uni.showModal({
        title: '确定迟到',
        content: '确定上报迟到，通知老师等待？',
        success: (res) => {
          if (res.confirm) {
            // 这里添加提交操作的代码，例如向服务器发送请求等
            console.log("提交操作");
            this.handleLate();
          } else if (res.cancel) {
            console.log('取消操作');
          }
        }
      });
    },
    async handleLate() {
      const minute = this.lateMinutes_en[this.selectLateMinute];
      const lateremarks = this.lateReasons_en[this.selectLateReason];
      this.hideLate();
      uni.showLoading({
        title: '提交中...'
      });
      const res = await lateSubmit({
        "studentCode": this.$global.studentCode,
        "courseId": this.currentCourseId,
        "minute": minute,
        "remarks": lateremarks,
      });
      uni.hideLoading();
      if (res.code !== 0) {
        uni.showToast({
          title: '迟到提交失败',
          icon: 'none'
        });
        return;
      }
      console.log('迟到已提交-0', new Date());
      uni.showToast({
        title: '迟到已提交',
        icon: 'success',
        duration: 2000
      });
      setTimeout(() => {
        console.log('迟到已提交-1', new Date());
        this.fetchData();
      }, 2000);
    },
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
  height: auto;
  flex-direction: column;
  padding-bottom: 140rpx;
}

.custom-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
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
  /* border-radius: 10rpx;
  padding: 10px 16px 10px 16px;
  gap: 28px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx; */
  display: flex;
  border-radius: 10rpx;
  padding: 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
}

.label {
  width: 150rpx;
  padding: 10rpx;
  /* font-size: 14px; */
  font-weight: 400;
  line-height: 20px;
  text-align: left;
  color: #6d6a6a;
}

.courseContent {
  padding: 10rpx;
  width: 500rpx;
  height: auto;
  /* font-size: 14px; */
  font-weight: 400;
  line-height: 20px;
  text-align: left;
  color: rgba(45, 45, 45, 1);;
  word-wrap: break-word;
  white-space: normal;
}

.tab-container {
  margin: 20rpx;
  background-color: #fff;
  border-radius: 10rpx;
  min-height: 58vh;
  padding-bottom: 40rpx;
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
  margin: 20rpx;
  min-height: 200rpx;
  height: auto;
  border-radius: 10rpx;
  padding-bottom: 10rpx;
  background-color: rgba(43, 41, 41, 0.031);
}

/* 作业文本内容 */
.text-content {
  padding: 20rpx;
  min-height: 160rpx;
  height: auto;
  border-radius: 10rpx;
  word-wrap: break-word;
  white-space: normal;
  color: rgba(45, 45, 45, 1);
}

.title {
  font-size: 28rpx;
  font-weight: bold;
}

/* 文件列表 */
.attachment-list {
  background-color: #c52424;
  margin-top: 40rpx;
  min-height: 6vh;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10rpx;
  color: #2F51FF;
  background-color: #f0eef7;
  margin: 10rpx 20rpx 10rpx 20rpx;
  border-radius: 10rpx;
}

.file-icon {
  width: 32rpx;
  height: 32rpx;
  margin-left: 8rpx;
}

/* 上传区域 */
.fileSection {
  border-radius: 10rpx;
  border: 1rpx dashed #D4D6D9;
  gap: 0px;
  text-align: center;
  margin: 20rpx;
  padding: 40rpx;
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

.upload-progress {
  margin: 20rpx;
  padding: 10rpx;
  border-radius: 10rpx;
  color: rgba(47, 81, 255, 1);
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
  padding: 10rpx;
  border-radius: 10rpx;
}

.file-name.success {
  width: 470rpx;
  text-align: left;
}

.file-name.uploading {
  width: 470rpx;
  text-align: left;
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

.upload {
  color: rgba(47, 81, 255, 1);
}

.upload-his {
  color: rgba(45, 45, 45, 1);
}

textarea {
  width: 100%; /* 确保宽度为 100% */
  height: auto; /* 高度根据内容自适应 */
  box-sizing: border-box; /* 包括 padding 和 border */
}


/* 整个底部容器 */
.bottom-container {
  position: fixed;
  bottom: 34rpx;
  /* 距离底部 */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

/* 按钮区域 */
.bottom-buttons {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 320rpx;
  height: 90rpx;
  background: linear-gradient(139.01deg, #6DB6E7 -2.19%, #2F51FF 97.65%);
  border-radius: 40rpx;
  box-shadow: 0px 0px 12px 0px rgb(47 81 255 / 80%);
  padding: 0 16rpx 0 16rpx;
  gap: 8px;
}

/* 每个按钮 */
.button-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
}

/* 按钮图标 */
.icon {
  width: 36rpx;
  height: 36rpx;
  margin-bottom: 6rpx;
}

/* 按钮文本 */
.button-text {
  font-size: 24rpx;
  color: #FFFFFF;
}

/* 分割线 */
.viewider {
  width: 1rpx;
  height: 40rpx;
  background-color: #FFFFFF;
  opacity: 0.5;
}


.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 10rpx;
  width: 80%;
}

.leave-reason-selection {
  display: flex;
  flex-direction: column;
  margin: 0 10rpx 50rpx 10rpx;
  padding: 10rpx;
}

.calendar-header {
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

.picker {
  margin: 10px 0;
}

.tips {
  padding: 20rpx;
    font-size: 28rpx;
    color: #8a581a;
}
.tipli::before {
  content: "•";
  color: #eec50e;
  margin-right: 10px;
}
.tipli2 {
  margin-left: 20px;
}

.rule-section {
  transition: max-height 0.5s;
  overflow: hidden;
  margin: 10rpx;
  padding: 20rpx;
  border-radius: 10rpx;
  background-color: #f0eef7;
}
.rule-section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
.rule-section-content {
  font-size: 24rpx;
  color: #333;
}
.arrow-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: 10rpx;
}
.rule-text {
  color: #007aff;
}
</style>
