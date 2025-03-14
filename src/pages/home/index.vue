<template>
  <view class="container">
    <!-- 自定义顶部导航栏 -->
    <view class="custom-header">
      <image src="/static/keai-logo.png" class="header-logo" @click="showAboutUs" />
      <view class="centered-picker-container" @tap="showModal">
        <view class="student-select">{{ students[selectIndex].name }} ▼</view>
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
      <view class="month-title">课程列表</view>
      <view v-if="courses.length == 0" class="course-card-null">
        <text>暂无课程</text>
      </view>
      <view v-else class="course-card" v-for="(course, index) in courses" :key="index">
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
        <view class="course-status" @tap="goToDetail(course.id)">
          <view class="status-container">
            <view class="status-icon" :class="course.css"></view>
            <text class="status-text">{{ getState(course.state) }}</text>
          </view>
          <view class="course-arrow">
            <view class="circle-arrow">
              <view class="arrow"></view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

      <!-- 底部按钮区域 -->
      <!-- <view class="bottom-container">
        <view class="bottom-buttons">
          <view class="button-item" @click="showStatistics">
            <image src="/static/total.png" class="icon" mode="widthFix"></image>
            <text class="button-text">统计</text>
          </view>
          <view class="viewider"></view>
          <view class="button-item" @click="showLeave">
            <image src="/static/leave.png" class="icon" mode="widthFix"></image>
            <text class="button-text">请假</text>
          </view>
        </view>
      </view> -->

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
    <StudentPopup :isVisible="isVisible" :studentList="students" :selectedStudentCode="studentCode"
      @updateStudent="handleUpdateStudent" @update:isVisible="val => isVisible = val" />

    <UserTermPopup :showUserTerm="showUserTerm" @update:showUserTerm="val => showUserTerm = val" />
    
  </view>
</template>

<script>
import aboutUsPopup from '@/components/AboutUsPopup.vue';
import calendarPopup from '@/components/CalendarPopup.vue';
import studentPopup from '@/components/StudentPopup.vue';
import UserTermPopup from '@/components/UserTermPopup.vue';

import { getCourseList, getStudentList, getSetting } from '../../utils/api';
import { onLoad } from '@dcloudio/uni-app';

export default {
  components: {
    aboutUsPopup,
    calendarPopup,
    studentPopup,
    UserTermPopup
  },
  data() {
    return {
      isVisible: false,
      loading: true,
      studentCode: "",
      showAbout: false, // 控制弹窗显示/隐藏x
      showUserTerm: false,
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
      selectIndex: 0, // 当前选中学生索引
      selectedTimeZoneIndex: 0, // 当前选中时区索引
      timezone: "Asia/Shanghai",
      students: [
        { name: '', code: '', birth: '', level: '' }
      ],
      timezones: [],
      dateRange: "", // 日期范围
      courses: [],
      states: {
        0: "待出席",
        1: "已出席",
        2: "已请假",
        3: "已缺课",
        4: "上课中"
      },
      wechatSet: {
        show_remain: false,
        show_order: false,
        show_exprire: false,
        user_term:''
      },
      userTermContent: `
**甲方**：FutureKey 开心英语（以下简称“甲方”）  
**乙方**：客户（以下简称“乙方”）

为保障课程的顺利进行，明确请假与补课相关事宜，甲乙双方就课程请假规则达成如下协议，以共同遵守。

## **第一条 每月请假规定**
1. 乙方每月可享有 **1 次不扣课时的请假**，需提前 **24 小时** 申请，并在**两周内申请补课**。

## **第二条 课时不退情形**
在以下情况下，乙方的课时**不予退还**：
1. **无故缺课**，即乙方未提前提交请假申请且未出席课程；
2. **未提前 24 小时请假**；
3. **超过每月 1 次的请假机会**。

对于因上述原因缺课的处理方式：
- **若课程有回放**，甲方将仅提供回放，不安排补课；
- **若课程无回放**，乙方可在**两周内申请补课**。

## **第三条 连续请假规定**
1. 乙方如需连续请假 **2 节及以上**，应**提前一周通知**甲方，所请假课时可顺延，并可申请补课。
2. 乙方未提前一周通知的，甲方有权按**第二条**相关规定处理。

## **第四条 1v1 课程的特殊规定**
1. 乙方迟到 **5 分钟后**，甲方授课老师有权退出教室，课程将按正常进行处理，课时不予退还。
2. 若乙方未成功出席该节课，可在**两周内申请补课**。

## **第五条 因甲方原因调整课程**
1. 因甲方原因调整课程的，不计入乙方请假次数，且课时不受影响。
2. 甲方将与乙方协商调整后的上课时间。

## **第六条 请假方式**
1. 乙方请假需通过甲方指定的小程序自助申请。
2. 如遇特殊情况需要帮助，乙方可联系课程顾问协助处理。

## **第七条 其他**
1. 本规则适用于乙方报名的所有 FutureKey英语课程，自签署或接受之日起生效。
2. 甲方有权根据实际运营情况对本规则进行调整，并提前通知乙方，调整后的规则适用于所有后续课程。
3. 本规则未尽事宜，双方可协商解决，如有争议，双方同意按照友好协商原则解决。`
    }
  },
  created() {
    this.timezones = this.$global.timezones;
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.selectedTimeZoneIndex = uni.getStorageSync("timezoneIndex") || 0;
    this.$global.timezone = this.$global.timezones[this.selectedTimeZoneIndex].value;
    this.selectIndex = uni.getStorageSync("selectIndex") || 0;
    this.studentCode = uni.getStorageSync("studentCode") || '';
    uni.setStorageSync('userTermContent', this.userTermContent);
  },
  methods: {
    getSetting() {
      getSetting().then(res => {
        if (res.code == 0) {
          this.wechatSet = res.data;
          if(this.wechatSet.user_term) {
            this.userTermContent = this.wechatSet.user_term;
          }
          uni.setStorageSync('userTermContent', this.userTermContent);
          this.showUserTerm = true;
        }
      });
    },
    showModal() {
      this.isVisible = true;
    },
    hideModal() {
      this.isVisible = false;
    },
    handleUpdateStudent(index) {
      this.selectIndex = index;
      this.$global.selectIndex = index;
      this.studentCode = this.students[this.selectIndex].code;
      this.$global.studentCode = this.studentCode;
      uni.setStorageSync('studentCode', this.studentCode);
      uni.setStorageSync('selectIndex', this.selectIndex);
      console.log('选中的学生代码:', this.studentCode, this.$global.studentCode);
      this.hideModal();
      this.fetchData();
    },
    showAboutUs() {
      this.showAbout = true;
    },
    onTimeZoneChange(event) {
      this.selectedTimeZoneIndex = event.detail.value;
      this.selectedTimeZone = this.timezones[this.selectedTimeZoneIndex]; // 根据索引获取对应的时区对象
      this.$global.timezone = this.selectedTimeZone.value;
      uni.setStorageSync('timezoneIndex', this.selectedTimeZoneIndex);
      this.fetchData(); // 获取数据列表
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
      this.$global.startDate = this.startDate;
      this.$global.endDate = this.endDate;
      this.currentYear = today.getFullYear();
      this.currentMonth = today.getMonth() + 1;

      this.tempStartDate = this.startDate;
      this.tempEndDate = this.endDate;
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
        if (!this.studentCode) return;
        // 显示加载提示
        uni.showLoading({
          title: '加载中...'
        });
        this.loading = true;

        console.log('开始时间', this.startDate, this.endDate, this.$global.timezone, this.studentCode);
        const res = await getCourseList({
          "start_dt": this.startDate,
          "end_dt": this.endDate,
          "studentCode": this.studentCode,
          "timezone": this.$global.timezone
        });
        console.log('课程列表:', res);
        // 处理返回的数据
        if (res.code == 0) {
          this.courses = res.data;
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
    async init() {
      const res = await getStudentList(this.$global.phone);
      if (res.code == 0) {
        this.students = res.data;
        // .map((x,i)=> {
        //   x.class_size = i==0 ?"1:1": "1:4";
        //   return x;
        // });

        this.$global.studentList = this.students.map(item => {
          item.name = uni.getStorageSync(item.code) || item.name;
          return item;
        });
        this.$global.selectIndex = uni.getStorageSync("selectIndex") || 0;
        this.studentCode = this.students[this.$global.selectIndex].code;
        uni.setStorageSync("studentCode", this.studentCode);
        this.$global.studentCode = this.studentCode;
        this.fetchData(); // 获取数据列表
      } else {
        uni.showToast({
          title: '暂无学生信息',
          icon: 'none'
        });
      }
    },
    load() {
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
     
      this.init();
    }
  },

  onShow() {
    if(uni.getStorageSync("isFirst")){
      if(!uni.getStorageSync("userTermAgree")) {
        this.getSetting();
      }
      uni.setStorageSync("isFirst", false);
    }
    this.setDefaultWeek(); // 初始化默认本周日期
    this.initCalendar();   // 初始化日历
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
/* 页面背景 */
.container {
  background: linear-gradient(to bottom, #2F51FF, #F7F9FC);
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
  border-radius: 10rpx;
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

/* 上课中 */
.status-teaching {
  background-color: #ce1a06;
}

.course-arrow {
  margin-top: 20rpx;
  margin-left: 20px;
  font-size: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.arrow-icon {
  height: 24px;
  width: 24px;
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
  border-radius: 10rpx;
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
  height: 510px;
}

.scroll-container {
  height: 400px; /* 设置固定高度 */
  overflow-y: scroll; /* 启用纵向滚动 */
  padding: 10px;
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
  background: transparent
}
.confirm {
  border: none;
  background: transparent;
  color: #d28e11;
}
</style>
