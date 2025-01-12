<template>
  <view class="container">
    <!-- 自定义顶部导航栏 -->
    <view class="custom-header">
      <image src="@/static/keai-logo.png" class="header-logo" @click="showAboutUs" />
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

      <!-- 筛选按钮 -->
      <view class="filter-button">
        <picker @change="onTimeZoneChange" :value="selectedTimeZoneIndex" :range="timezones" range-key="name">
          <view class="timezone-select">{{ timezones[selectedTimeZoneIndex].name }} ▼</view>
        </picker>
      </view>
    </view>

    <!-- 滚动课程列表 -->
    <scroll-view class="course-list" scroll-y>
      <view class="month-title">{{ currentYear }}年{{ currentMonth }}月</view>
      <view v-if="courses.length == 0" class="course-card">
        <text>暂无课程</text>
      </view>
      <view v-else class="course-card" v-for="(course, index) in courses" :key="index">
        <view :class="course.css">
          <image :src="course.class_category == 'writing' ? '../../static/write.png' : '../../static/default.png'"
            class="course-icon"></image>
        </view>
        <view class="course-info">
          <view class="course-title">{{ course.title }}</view>
          <view class="course-time">
            <image src='../../static/icons/time.png' class="who-icon"></image>
            {{ course.time }}
          </view>
          <view class="course-teacher">
            <image src='../../static/icons/who.png' class="who-icon"></image>
            {{ course.student }}
          </view>
        </view>
        <view class="course-status">
          <view class="status-container">
            <!-- 状态图标 -->
            <view class="status-icon"
              :class="course.state == 1 ? 'status-attended' : (course.state == 2 ? 'status-leave' : 'status-pending')">
            </view>
            <!-- 状态文本 -->
            <text class="status-text">{{ getState(course.state) }}</text>
          </view>
          <view class="course-arrow" @tap="goToDetail(course.id)">
            <!-- 圆形背景 + 箭头 -->
            <view class="circle-arrow">
              <view class="arrow"></view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="bottom-container" v-if="!showCalendar">
      <!-- 底部按钮区域 -->
      <view class="bottom-buttons">
        <!-- 统计按钮 -->
        <view class="button-item" @click="showStatistics">
          <image src="/static/total.png" class="icon" mode="widthFix"></image>
          <text class="button-text">统计</text>
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

    <!-- 引入 CalendarPopup 组件 -->
    <CalendarPopup :showCalendar="showCalendar" :currentYear="currentYear" :currentMonth="currentMonth"
      :startDate="startDate" :endDate="endDate" :tempStartDate="tempStartDate" :tempEndDate="tempEndDate"
      :weekDays="weekDays" :calendar="calendar" :currentStep="currentStep"
      @update:showCalendar="val => showCalendar = val" @update:currentYear="val => currentYear = val"
      @update:currentMonth="val => currentMonth = val" @update:startDate="val => startDate = val"
      @update:endDate="val => endDate = val" @update:tempStartDate="val => tempStartDate = val"
      @update:tempEndDate="val => tempEndDate = val" @update:currentStep="val => currentStep = val"
      @initCalendar="initCalendar" @fetchData="fetchData" />

    <!-- 引用 AboutUsPopup 组件 -->
    <AboutUsPopup :showAbout="showAbout" @update:showAbout="val => showAbout = val" />

    <!-- 引用 StudentPopup 组件 -->
    <StudentPopup
      :isVisible="isVisible"
      :studentList="students"
      :selectedStudentCode="studentCode"
      @updateStudent="handleUpdateStudent"
      @update:isVisible="val => isVisible = val"
    />
  </view>
</template>

<script>
import aboutUsPopup from '@/components/AboutUsPopup.vue';
import calendarPopup from '@/components/CalendarPopup.vue';
import studentPopup from '@/components/StudentPopup.vue';

import { getCourseList, getStudentList } from '../../utils/api';

export default {
  components: {
    aboutUsPopup,
    calendarPopup,
    studentPopup
  },
  data() {
    return {
      isVisible: false,
      loading: true,
      studentCode: "",
      showAbout: false, // 控制弹窗显示/隐藏x
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
        {name:'',code:'',value4:''}
      ],
      timezones: [],
      dateRange: "", // 日期范围
      courses: [],
      states: {
        0: "待出席",
        1: "已出席",
        2: "已请假"
      },
    };
  },
  created() {
    console.log('timezones', this.$global.timezones);
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    console.log('timezoneIndex', uni.getStorageSync("timezoneIndex"));
    this.timezones = this.$global.timezones;
    this.selectedTimeZoneIndex = uni.getStorageSync("timezoneIndex") || 0;
    this.timezone = this.timezones[this.selectedTimeZoneIndex].value;
  },
  methods: {
    showModal() {
      this.isVisible = true;
    },
    hideModal() {
      this.isVisible = false;
    },
    handleUpdateStudent(index) {
      this.selectedStudentIndex = index;
      this.$global.selectIndex = index;
      this.studentCode = this.students[this.selectedStudentIndex].code;
      this.$global.studentCode = this.studentCode;
      console.log('选中的学生代码:', this.studentCode, this.$global.studentCode);
      this.fetchData();
      this.hideModal();
    },
    showAboutUs() {
      this.showAbout = true;
    },
    onStudentChange(event) {
      this.selectedStudentIndex = event.detail.value;
      this.studentCode = this.students[this.selectedStudentIndex].code;
      this.$global.studentCode = this.studentCode;
      console.log('选中的学生代码:', this.studentCode, this.$global.studentCode);
      this.fetchData();
    },
    onTimeZoneChange(event) {
      this.selectedTimeZoneIndex = event.detail.value;
      this.selectedTimeZone = this.timezones[this.selectedTimeZoneIndex]; // 根据索引获取对应的时区对象
      this.timezone = this.selectedTimeZone.value;
      uni.setStorageSync('timezoneIndex', this.selectedTimeZoneIndex);
      this.fetchData(); // 获取数据列表
      console.log('选中的时区:', this.timezone); // 输出选中的时区值
    },
    getState(state) {
      return this.states[state];
    },
    // 设置默认本周的开始和结束日期
    setDefaultWeek() {
      const today = new Date();
      // 获取上月第一天和最后一天
      const dayOfWeek = today.getDay() || 7; // 将周日转为 7
      const monday = new Date(today.getTime() - (dayOfWeek - 1) * 86400000); // 本周一
      const sunday = new Date(today.getTime() + (7 - dayOfWeek) * 86400000); // 本周日

      this.startDate = this.formatDate(monday);
      this.endDate = this.formatDate(sunday);
      this.currentYear = today.getFullYear();
      this.currentMonth = today.getMonth() + 1;

      this.tempStartDate = this.startDate;
      this.tempEndDate = this.endDate;
      this.initCalendar();
    },
    // 打开日历
    openCalendar() {
      this.showCalendar = true;
    },
    // 确认日期选择
    confirmDates() {
      this.startDate = this.tempStartDate;
      this.endDate = this.tempEndDate;
      console.log(this.startDate, this.endDate)
      this.showCalendar = false;
      this.fetchData();
    },
    // 判断是否在选中范围内
    isInRange(date) {
      if (this.tempStartDate && this.tempEndDate) {
        return date > this.tempStartDate && date < this.tempEndDate;
      }
      return false;
    },
    // 选择日期
    selectDate(date, isOtherMonth) {
      if (isOtherMonth) return;
      if (this.currentStep === 0) {
        this.tempStartDate = date;
        this.currentStep = 1; // 进入选择截止日期步骤
      } else {
        if (date >= this.tempStartDate) {
          this.tempEndDate = date;
          this.currentStep = 0; // 重置步骤
        } else {
          uni.showToast({ title: '截止日期不能小于开始日期', icon: 'none' });
        }
      }
    },
    // 切换月份
    changeMonth(step) {
      const newMonth = this.currentMonth + step;
      if (newMonth > 12) {
        this.currentYear++;
        this.currentMonth = 1;
      } else if (newMonth < 1) {
        this.currentYear--;
        this.currentMonth = 12;
      } else {
        this.currentMonth = newMonth;
      }
      this.initCalendar();
    },
    // 生成日历数据，补齐完整的周数据
    initCalendar() {
      let year = this.currentYear;
      let month = this.currentMonth;
      const daysInMonth = new Date(year, month, 0).getDate(); // 当月天数
      const firstDay = new Date(year, month, 1).getDay(); // 当月1号是星期几 (0-6, 0代表周日)

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
        // 显示加载提示
        uni.showLoading({
          title: '加载中...'
        });
        this.loading = true;

        console.log('开始时间', this.startDate, this.endDate, this.timezone, this.studentCode);
        const res = await getCourseList({
          "start_dt": this.startDate,
          "end_dt": this.endDate,
          "studentCode": this.studentCode,
          "timezone": this.timezone
        });
        console.log('课程列表:', res);
        // 处理返回的数据
        if (res.code == 0) {
          this.courses = res.data;
          this.$global.studentList = this.students;
        }
      } catch (error) {
        console.error('显示加载提示失败:', error);
      } finally {
        // 隐藏加载提示
        uni.hideLoading();
        this.loading = false;
      }
    },
    async init() {
      this.setDefaultWeek(); // 初始化默认本周日期
      const res = await getStudentList(this.$global.phone);
      if (res.code == 0) {
        this.students = res.data;
        this.$global.studentList = this.students;
        this.studentCode = res.data[0].code;
        this.$global.studentCode = this.studentCode;
        this.selectIndex = 0;
        this.fetchData(); // 获取数据列表
      } else {
        uni.showToast({
          title: '暂无学生信息',
          icon: 'none'
        });
      }
    },
    showStatistics() {
      console.log('跳转到统计页面');
      uni.navigateTo({
        url: '/pages/statistics/index'
      });
    },
    showLeave() {
      console.log('跳转到请假页面');
      uni.navigateTo({
        url: '/pages/leave/index'
      });
    }
  },
  onLoad() {
    this.init();
    this.initCalendar();   // 初始化日历
  },
  // onShow() {
  //   console.log('timezones', this.$global.timezones);
  //   console.log('studentList', this.$global.studentList);
  //   console.log('studentCode', this.$global.studentCode);
  //   console.log('selectIndex', this.$global.selectIndex);
  //   this.timezones = this.$global.timezones;
  //   this.students = this.$global.studentList;
  //   this.studentCode = this.$global.studentCode;
  //   this.selectedStudentIndex = this.$global.selectIndex;
  //   const currentStudent = this.students[this.selectedStudentIndex];
  //   this.studentName = currentStudent ? currentStudent.name: '';
  //   this.selectedTimeZoneIndex = uni.getStorageSync("timezoneIndex") || 0;
  //   this.timezone = this.timezones[this.selectedTimeZoneIndex].value;
  //   this.fetchData(); // 获取数据列表
  // },
  onShareAppMessage() {
      return {
          title: this.$global.share.title,
          path: this.$global.share.path,
          imageUrl: this.$global.share.imageUrl
      };
  },
  onShareTimeline() {
    return {
      title: this.$global.share.title, // 分享的标题
      query: this.$global.share.path, // 分享的参数
      imageUrl: this.$global.share.imageUrl, // 分享的图片路径
    };
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
/* 页面背景 */
.container {
  background: linear-gradient(to bottom, #2F51FF, #F7F9FC);
  ;
  height: 100vh;
  flex-direction: column;
}

/* 顶部导航栏 */
/* 自定义导航栏样式 */
.custom-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 54px;
  color: #fff;
  padding-top: 44px;
}

.header-logo {
  width: 55px;
  height: 32px;
  margin-top: 6px;
  margin-left: 10px;
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
/* 顶部筛选栏样式 */
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

/* 日期选择器区域 */
.date-range {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 20rpx;
  width: 70%;
  justify-content: space-between;
  padding-left: 30rpx;
  padding-right: 30rpx;
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

.icon {
  font-size: 20rpx;
  margin-left: 5rpx;
}


/* 课程列表 */
.course-list {
  flex: 1;
  margin-bottom: 60px;
  /* 留出底部按钮位置 */
}

.month-title {
  font-size: 14px;
  color: #FFFFFF;
  margin-top: 10px;
  text-align: center;
}

.course-card {
  display: flex;
  background: #f3f6ff;
  border-radius: 10px;
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
.status-attended {
  background-color: #4A90E2;
  /* 蓝色 */
}

/* 已请假状态 - 绿色 */
.status-leave {
  background-color: #00C878;
  /* 绿色 */
}


.course-arrow {
  margin-top: 40rpx;
  margin-left: 20px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}

.arrow-icon {
  height: 24px;
  width: 24px;
}

.status-pending {
  color: #ff9900;
}

.status-attended {
  color: #4caf50;
}

.status-leave {
  color: #2196f3;
}

/* 底部按钮 */
.footer {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
  padding: 10px;
  justify-content: space-around;
}

.footer-btn {
  flex: 1;
  margin: 0 5px;
  height: 40px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  line-height: 40px;
}

.stat-btn {
  background: #4c9aff;
}

.leave-btn {
  background: #4caf50;
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

.calendar-popup {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  font-weight: bold;
  padding: 20rpx 30rpx;
}

.datechoose-text {
  width: 670rpx;
  font-weight: bold;
  font-size: 32rpx;
  /* 调整字体大小 */
  color: #333;
}

.close-btn {
  font-size: 50rpx;
  /* 调整关闭按钮大小 */
  color: #999;
  cursor: pointer;
}

.calendar-row {
  display: flex;
}

.calendar-day {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60rpx;
  height: 60rpx;
  margin: 10rpx 26rpx 10rpx 26rpx;
  border-radius: 50%;
  text-align: center;
  background-color: transparent;
  color: #333;
  font-size: 28rpx;
}

.calendar-day.selected {
  background-color: #007aff;
  color: #fff;
}

.calendar-day.in-range {
  background-color: #d9ecff;
}

.confirm-btn {
  margin: 20rpx;
  background-color: #007aff;
  color: #fff;
}

.week-days {
  display: flex;
  text-align: center;
  font-size: 24rpx;
  color: #333;
}

.week-day {
  flex: 1;
}


.month-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.circle-arrow {
  width: 30px;
  height: 30px;
  background-color: rgba(100, 149, 237, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* 箭头样式 */
.arrow {
  width: 5px;
  height: 5px;
  border-right: 2px solid #1E90FF;
  border-bottom: 2px solid #1E90FF;
  /* -webkit-transform: rotate(-45deg); */
  transform: rotate(-45deg);
  position: absolute;
}

.circle-arrow2 {
  width: 40px;
  height: 30px;
  background-color: rgba(100, 149, 237, 0.2);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border-radius: 5rpx;
  padding: 5rpx 15rpx;
  margin-bottom: 10rpx;
}

/* 箭头样式 */
.arrow-left {
  width: 10px;
  height: 10px;
  border-right: 2px solid #1E90FF;
  border-bottom: 2px solid #1E90FF;
  transform: rotate(135deg);
  position: absolute;
}

.arrow-right {
  width: 10px;
  height: 10px;
  border-right: 2px solid #1E90FF;
  border-bottom: 2px solid #1E90FF;
  transform: rotate(-45deg);
  position: absolute;
}

.other-month {
  color: #ccc;
}
</style>
