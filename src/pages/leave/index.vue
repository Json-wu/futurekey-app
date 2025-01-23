<template>
  <view class="container">
    <!-- 自定义顶部导航栏 -->
    <view class="custom-header">
      <image src="/static/keai-logo.png" class="header-logo" @click="showAboutUs" />
      <view class="centered-picker-container" @tap="showModal">
        <view class="student-select">{{ students[selectedStudentIndex].name }} ▼</view>
      </view>
      <!-- 占位元素：确保与系统按钮对齐 -->
      <view class="header-placeholder"></view>
    </view>

    <view class="date-filter">
      <!-- 日期选择器 -->
      <view class="date-range" @tap="openCalendar">
        <text class="date-text">{{ startDate || '请选择' }}</text>
        <text class="separator">一</text>
        <text class="date-text">{{ endDate || '请选择' }}</text>
      </view>
    </view>

    <!-- 滚动课程列表 -->
    <scroll-view class="course-list" :style="{ 'padding-bottom': showbutton ? '90px' : '0'}" scroll-y>
      <view class="month-title">待出席课程列表</view>
      <view v-if="courses.length == 0" class="course-card-null">
        <text>暂无待出席课程</text>
      </view>
      <view v-else class="course-card" v-for="(course, index) in courses" :key="index"  @tap="toggleCheck(course.id)">
        <view>
          <image :src="course.class_category == 'writing' ? '/static/write.png' : '/static/default.png'"
            class="course-icon"></image>
        </view>
        <view class="course-info">
          <view class="course-title">{{ course.title }}</view>
          <view class="course-time">
            <image src='/static/icons/time.png' class="who-icon"></image>
            {{ course.time }}
          </view>
          <view class="course-teacher">
            <image src='/static/icons/who.png' class="who-icon"></image>
            {{ course.student }}
          </view>
        </view>
        <view class="course-status">
          <view class="checkbox-container">
            <view class="custom-checkbox" :class="{'checked': course.isSelected, 'disabled': course.state !== 0}">
              <view v-if="course.isSelected" class="checkmark">
                <view class="checkmark-inner"></view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

     <!-- 底部固定栏 -->
     <view class="bottom-bar" v-if = "showbutton">
      <view class="allcheck" @tap="toggleCheckAll()">
        <view class="custom-checkbox" :class="{'checked': checkall}">
          <view v-if="checkall" class="checkmark">
            <view class="checkmark-inner"></view>
          </view>
        </view>
        <text class="status-text">全选</text>
      </view>
      <button class="btn cancel" @tap="cancel()">取消</button>
      <button class="btn confirm" @tap="commit()">确定</button>
    </view>

      <!-- Modal -->
    <view v-if="isShow" class="modal">
      <view class="modal-content">
        <view class="calendar-header">
          <text class="datechoose-text">请假申请</text>
          <view class="close-btn" @tap="closeModal">×</view>
        </view>

        <view class="tips">
          <li>注：1.每月享有1次补课机会</li>
          <li>&nbsp;2.24h内请假，由代课老师补课，不能指定老师</li>
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
          <button class="btn cancel" @tap="closeModal">取消</button>
          <button class="btn confirm" @tap="confirmLeave">确定</button>
        </view>
      </view>
    </view>

    <!-- 引入 CalendarPopup 组件 -->
    <CalendarPopup :showCalendar="showCalendar" :currentYear="currentYear" :currentMonth="currentMonth"
      :startDate="startDate" :endDate="endDate" :tempStartDate="tempStartDate" :tempEndDate="tempEndDate"
      :weekDays="weekDays" :calendar="calendar" :currentStep="currentStep"
      @update:showCalendar="val => showCalendar = val" @update:currentYear="val => currentYear = val"
      @update:currentMonth="val => currentMonth = val" @update:startDate="val => startDate = val"
      @update:endDate="val => endDate = val" @update:tempStartDate="val => tempStartDate = val"
      @update:tempEndDate="val => tempEndDate = val" @update:currentStep="val => currentStep = val"
      @initCalendar="initCalendar" @fetchData="fetchData" />

      <!-- 引用 StudentPopup 组件 -->
      <StudentPopup
          :isVisible="isVisible"
          :studentList="students"
          :selectedStudentCode="studentCode"
          @updateStudent="handleUpdateStudent"
          @update:isVisible="val => isVisible = val"
          @logout="handleLogout"
        />

      <AboutUsPopup :showAbout="showAbout" @update:showAbout="val => showAbout = val" />
  </view>
</template>

<script>
import aboutUsPopup from '@/components/AboutUsPopup.vue';
import calendarPopup from '@/components/CalendarPopup.vue';
import studentPopup from '@/components/StudentPopup.vue';
import { getCourseList, leaveSubmit } from '../../utils/api';

export default {
  components: {
    aboutUsPopup,
    calendarPopup,
    studentPopup
  },
  data() {
    return {
      showbutton: false,
      showAbout: false,
      isVisible: false,
      checkall: false,
      loading: true,
      studentCode: "",
      currentYear: 0, // 当前年份
      currentMonth: 0, // 当前月份
      startDate: '',       // 开始日期
      endDate: '',         // 截止日期
      weekDays: ["日", "一", "二", "三", "四", "五", "六"],
      tempStartDate: '',   // 临时记录开始日期
      tempEndDate: '',     // 临时记录截止日期
      showCalendar: false, // 控制日历弹窗显示
      calendar: [],        // 存储生成的日历
      currentStep: 0,     // 记录选择的步骤 (0: 第一步, 1: 第二步)
      selectedStudentIndex: 0, // 当前选中学生索引
      selectedTimeZoneIndex: 0, // 当前选中时区索引
      timezone: "Asia/Shanghai",
      students: [
      ],
      timezones: [],
      dateRange: "", // 日期范围
      courses: [],
      isShow: false, // Controls modal visibility
      leaveReasons: ['事假', '病假', '其他'], // Leave reasons
      selectedReason: 0, // Index of selected leave reason
      leaveCount: 0, // 本月请假次数
      remarks: '', // Remarks input
      states: {
        0: "待出席",
        1: "已出席",
        2: "已请假",
        3: "已缺课"
      }
    };
  },
  created() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.timezones = this.$global.timezones;
    this.students = this.$global.studentList;
    this.studentCode = this.$global.studentCode;
    this.selectedStudentIndex = this.$global.selectIndex;
    this.selectedTimeZoneIndex = uni.getStorageSync("timezoneIndex") || 0;
    this.startDate = this.$global.startDate;
    this.endDate = this.$global.endDate;
  },
  computed: {
    dynamicStyles() {
      return {
        'padding-bottom': this.showbutton ? '90px' : '0'
      };
    }
  },
  methods: {
    getState(state) {
      return this.states[state];
    },
    showAboutUs() {
      this.showAbout = true;
    },
    showModal() {
      this.isVisible = true;
    },
    hideModal() {
      this.isVisible = false;
    },
    openModal() {
      this.isShow = true; // Show the modal
      this.selectedReason = 0;
      this.remarks="";
    },
    closeModal() {
      this.isShow = false; // Hide the modal
      
    },
    onReasonChange(e) {
      this.selectedReason = e.detail.value; // Update selected reason
    },
    async confirmLeave() {
      // Handle leave confirmation logic here
      const reason = this.leaveReasons[this.selectedReason];
      const remarks = this.remarks;
      const selectedCourses = this.courses.filter(course => course.isSelected).map(course => course.id);
      this.closeModal();
      uni.showLoading({
        title: '提交中...'
      });
      const res = await leaveSubmit({
        "studentCode": this.studentCode,
        "courseIds": selectedCourses,
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
        this.cancel();
        this.fetchData();
      }, 2000);
    },
    cancel() {
      this.showbutton = false;
      uni.showTabBar();
      this.courses.forEach(course => {
        if(course.state !== 0) return;
        course.isSelected = false;
      });
    },
    onTimeZoneChange(event) {
      this.selectedTimeZoneIndex = event.detail.value;
      this.selectedTimeZone = this.timezones[this.selectedTimeZoneIndex]; // 根据索引获取对应的时区对象
      this.$global.timezone = this.selectedTimeZone.value;
      uni.setStorageSync('timezoneIndex', this.selectedTimeZoneIndex);
      this.fetchData(); // 获取数据列表
    },
    // 设置默认本周的开始和结束日期
    setDefaultWeek() {
      const today = new Date();
      this.currentYear = today.getFullYear();
      this.currentMonth = today.getMonth() + 1;

      this.tempStartDate = this.startDate;
      this.tempEndDate = this.endDate;
      this.initCalendar();
    },
    // 打开日历
    openCalendar() {
      this.tempStartDate = this.startDate;
      this.tempEndDate = this.endDate;
      this.showCalendar = true;
    },
    // 生成日历数据，补齐完整的周数据
    initCalendar() {
      let year = this.currentYear;
      let month = this.currentMonth;
      const firstDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const daysInMonth = new Date(year, month, 0).getDate(); // 当月天数
      const firstDay = new Date(firstDate).getDay(); // 当月1号是星期几 (0-6, 0代表周日)

      // 上个月的相关数据
      const prevMonthYear = month === 1 ? year - 1 : year; // 上个月的年份
      const prevMonth = month === 1 ? 12 : month - 1; // 上个月的月份
      const prevMonthDays = new Date(prevMonthYear, prevMonth, 0).getDate(); // 上个月的总天数

      // 下个月的相关数据
      const nextMonthYear = month === 12 ? year + 1 : year; // 下个月的年份
      const nextMonth = month === 12 ? 1 : month + 1; // 下个月的月份

      let calendar = [];
      let week = [];

      // 补齐空白天数（上个月的日期）
      for (let i = firstDay - 1; i >= 0; i--) {
        let day = prevMonthDays - i;
        let date = `${prevMonthYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        week.push({ day, date, isOtherMonth: true });
      }

      // 生成当前月的天数
      for (let i = 1; i <= daysInMonth; i++) {
        let date = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        week.push({ day: i, date, isOtherMonth: false });

        if (week.length === 7) {
          calendar.push(week);
          week = [];
        }
      }

      // 补齐空白天数（下个月的日期）
      let nextMonthDay = 1;
      while (week.length < 7) {
        let date = `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-${String(nextMonthDay).padStart(2, '0')}`;
        week.push({ day: nextMonthDay, date, isOtherMonth: true });
        nextMonthDay++;
      }

      // 添加最后一周到日历
      if (week.length > 0) {
        calendar.push(week);
      }

      this.calendar = calendar;
    },
    // 格式化日期
    formatDate(date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    },
    goToDetail(courseId) {
      uni.navigateTo({
        url: `/pages/detail/index?id=${courseId}`
      });
    },
    async fetchData() {
      try {
        if(!this.studentCode) return; 
        // 显示加载提示
        uni.showLoading({
          title: '加载中...'
        });
        this.loading = true;

        const res = await getCourseList({
          "start_dt": this.startDate,
          "end_dt": this.endDate,
          "studentCode": this.studentCode,
          "timezone": this.$global.timezone,
          "type": 'leave'
        });
        console.log('课程列表:', res);
        // 处理返回的数据
        if (res.code == 0) {
          this.courses = res.data;
          this.selectedStudentIndex = uni.getStorageSync("selectIndex") || 0;
          this.$global.selectIndex = this.selectedStudentIndex;
          this.studentCode = this.students[this.selectedStudentIndex].code;
          this.$global.studentCode = uni.getStorageSync("studentCode");

          this.$global.startDate = this.startDate;
          this.$global.endDate = this.endDate;
        }
      } catch (error) {
        console.error('显示加载提示失败:', error);
      } finally {
        // 隐藏加载提示
        uni.hideLoading();
        this.loading = false;
      }
    },
    toggleCheck(id) {
      let course = this.courses.find(item => item.id === id);
      course.isSelected = !course.isSelected;
      console.log('toggleCheck', course.isSelected);
      if(!this.courses.find(x=>!x.isSelected && x.state == 0)){
        this.checkall = true;
      }else{
        this.checkall = false;
      }
      this.changeTabbar();
    },
    changeTabbar(){
      if(this.courses.find(x=>x.isSelected && x.state == 0)){
        this.showbutton = true;
        uni.hideTabBar();
      }else{
        this.showbutton = false;
        uni.showTabBar();
      }
    },
    toggleCheckAll() {
      console.log('selectAll',this.checkall);
      this.checkall = !this.checkall;
      this.courses.forEach(course => {
        if(course.state !== 0) return;
        course.isSelected = this.checkall;
        console.log(course);
      });
    },
    commit() {
      const selectedCourses = this.courses.filter(course => course.isSelected);
      console.log('Selected courses:', selectedCourses);
      
      if(selectedCourses.length == 0){
        uni.showToast({
          title: '请选择课程',
          icon: 'none',
          duration: 2000
        });
      }else{ 
        this.openModal();
        return; 
      }
    },
    handleUpdateStudent(index) {
      this.selectedStudentIndex = index;
      this.$global.selectIndex = index;
      this.studentCode = this.students[this.selectedStudentIndex].code;
      this.$global.studentCode = this.studentCode;
      uni.setStorageSync('studentCode', this.studentCode);
      uni.setStorageSync('selectIndex', this.selectedStudentIndex);
      console.log('选中的学生代码:', this.studentCode, this.$global.studentCode);
      this.fetchData();
      this.hideModal();
    },
    handleLogout() {
      console.log("退出登录");
      this.$global.studentCode = null;
      this.$global.phone = null;
      this.$global.isLogin = false;
      this.$global.studentList=[];
      uni.removeStorage('timezoneIndex');
      uni.removeStorage('studentCode');
      uni.removeStorage('phone');
      uni.removeStorage('isLogin');
      uni.removeStorage('studentList');

      uni.navigateTo({
        url: '/pages/index/index',
      });
      this.hideModal();
    },
    load() {
      console.log('加载数据');
      console.log(`startDate: ${this.startDate}, endDate: ${this.endDate}, timezone: ${this.$global.timezone}, studentCode: ${this.studentCode}`);
      this.timezones = this.$global.timezones;
      const now = new Date();
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth() + 1;
      this.selectIndex = uni.getStorageSync("selectIndex") || 0;
      this.studentCode = uni.getStorageSync("studentCode") || '';
      this.startDate = this.$global.startDate;
      this.endDate = this.$global.endDate;
      this.selectIndex = uni.getStorageSync("selectIndex") || 0;
      this.selectedTimeZoneIndex = uni.getStorageSync("timezoneIndex") || 0;
      this.selectedTimeZone = this.timezones[this.selectedTimeZoneIndex]; // 根据索引获取对应的时区对象
      this.$global.timezone = this.selectedTimeZone.value;
      uni.setStorageSync('timezoneIndex', this.selectedTimeZoneIndex);
      uni.setStorageSync('selectIndex', this.selectIndex);
      this.fetchData();
    }
  },
  onLoad() {
    this.setDefaultWeek(); // 初始化默认本周日期
    this.initCalendar();   // 初始化日历
    this.load();
  },
  onShow() {
    console.log('onShow');
    this.load();
  },
  onPullDownRefresh() {
    this.fetchData(); // 获取数据列表
    setTimeout(() => {
      uni.stopPullDownRefresh();
    }, 800);
  }
};
</script>

<style scoped>
.nav-left {
  padding-right: 20rpx;
  padding-left: 20rpx;
}
/* 页面背景 */
.container {
  background: linear-gradient(to bottom, #2F51FF, #F7F9FC);
  height: 100vh;
  flex-direction: column;
}

/* 顶部导航栏 */
.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  color: #fff;
  padding-top: 44px;
}

.back-icon {
  width: 20rpx;
  height: 40rpx;
  margin-left: 20rpx;
}

.centered-picker-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  padding-right: 16px;
}

.header-placeholder {
  width: 50px;
  /* 根据实际占位元素大小调整 */
}

.student-select {
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: #fff;
  font-weight: bold;
}

/* 日期选择器 */
.date-filter {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: #f5f5f5;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  width: 90%;
  margin: 10rpx auto;
}

.date-range {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  padding: 20rpx;
  width: 96%;
  justify-content: space-between;
  padding-left: 80rpx;
  padding-right: 80rpx;
}

.date-text {
  font-size: 28rpx;
  color: #4c4949;
}

.separator {
  font-size: 28rpx;
  color: #4c4949;
  margin-left: 20px;
  margin-right: 20rpx;
}

/* 筛选按钮区域 */
.filter-button {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  margin-left: 20rpx;
}

/* 课程列表 */
.course-list {
  flex: 1;
}

.month-title {
  font-size: 14px;
  color: #FFFFFF;
  margin-top: 10px;
  text-align: center;
}

.course-card-null {
  display: flex;
  background: #f3f6ff;
  border-radius: 10rpx;
  padding: 20px;
  margin: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.course-card {
  display: flex;
  background: #f3f6ff;
  border-radius: 10rpx;
  padding: 10px;
  margin: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.course-icon {
  width: 40px;
  height: 40px;
}

.who-icon {
  width: 14px;
  height: 14px;
  margin-right: 10rpx;
}

.course-info {
  flex: 1;
  padding-left: 10px;
}

.course-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  max-width: 420rpx;
}

.course-time,
.course-teacher {
  font-size: 12px;
  color: #666;
  margin: 14rpx;
}

.checkbox-container {
  display: flex;
  align-items: center;
  height: 8vh;
}

.custom-checkbox {
  width: 30rpx;
  height: 30rpx;
  border: 2rpx solid #ccc;
  border-radius: 50%; /* 圆形 */
  margin-right: 10rpx;
  /* position: relative; */
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-checkbox.checked {
  background-color: #007aff;
  border-color: #007aff;
}

.custom-checkbox.checked .checkmark {
  width: 40rpx;
  height: 40rpx;
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.checkmark-inner {
  width: 14rpx;
  height: 10rpx;
  border-left: 2rpx solid white;
  border-bottom: 2rpx solid white;
  transform: rotate(-45deg);
}

.custom-checkbox.disabled {
  opacity: 0.5;
}

/* 底部固定栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  padding: 30rpx 20rpx 50rpx 20rpx;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

.allcheck {
  display: flex;
  flex: 1;
  align-items: center;
}

.btn {
  flex: 1;
  margin: 0 10rpx;
  height: 80rpx;
  border-radius: 10rpx;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  align-items: center;
  vertical-align: middle;
  line-height: 40rpx;
  padding: 20rpx;
}

.confirm {
  color: #fff;
  background-color: #007aff;
}

.cancel {
  color: #007aff;
  background-color: #fff;
  border: #007aff 1px solid;
}

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
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
  margin: 0 10rpx 40rpx 10rpx;
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

.header-logo {
  width: 55px;
  height: 32px;
  margin-top: 6px;
  margin-left: 10px;
}


.course-status {
  font-size: 22rpx;
  align-items: center;
  margin-right: 10px;
}

/* 状态容器 */
.status-container {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
}

/* 状态图标基础样式 */
.status-icon {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

/* 待出席状态 - 灰色 */
.status-pending {
  background-color: #9c9898;
  /* 灰色 */
}

/* 已出席状态 - 蓝色 */
.status-attend {
  background-color: #4A90E2;
  /* 蓝色 */
}

/* 已请假状态 - 绿色 */
.status-leave {
  background-color: #00C878;
  /* 绿色 */
}

/* 已缺课 */
.status-absent {
  background-color: #ff9900;
}
</style>