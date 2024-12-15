<template>
  <view class="container">
    <!-- 自定义顶部导航栏 -->
    <view class="custom-header">
      <image src="/static/logo.png" class="header-logo" />
      <picker @change="onStudentChange" :value="selectedStudentIndex" :range="students" range-key="name">
        <view class="student-select">{{ students[selectedStudentIndex].name }} ▼</view>
      </picker>
      <!-- 占位元素：确保与系统按钮对齐 -->
      <view class="header-placeholder"></view>
    </view>

    <!-- 日期选择器 -->
    <view class="date-picker">
      <view class="date-range">{{ dateRange }}</view>
      <text class="calendar-icon">🗓️</text>
    </view>

    <!-- 滚动课程列表 -->
    <scroll-view class="course-list" scroll-y>
      <view class="month-title">2024年1月</view>
      <view class="course-card" v-for="(course, index) in courses" :key="index">
        <view class="course-left">
          <image :src="course.icon" class="course-icon"></image>
        </view>
        <view class="course-info">
          <view class="course-title">{{ course.title }}</view>
          <view class="course-time">{{ course.time }}</view>
          <view class="course-teacher">{{ course.teacher }}</view>
        </view>
        <view class="course-status">
          <text :class="[statusClass(course.status)]">{{ course.status }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部固定按钮 -->
    <view class="footer">
      <button class="footer-btn stat-btn">统计</button>
      <button class="footer-btn leave-btn">请假</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedStudentIndex: 0, // 当前选中学生索引
      students: [
        { name: "王一言" },
        { name: "李晓明" },
        { name: "张伟" }
      ],
      dateRange: "2024-01-09 - 2024-01-26", // 日期范围
      courses: [
        {
          icon: "/static/course1.png",
          title: "英语基础语法",
          time: "2024-01-20 14:00-14:27",
          teacher: "John Wilson",
          status: "待出席"
        },
        {
          icon: "/static/course2.png",
          title: "英语写作",
          time: "2024-01-20 14:00-14:27",
          teacher: "John Wilson",
          status: "待出席"
        },
        {
          icon: "/static/course3.png",
          title: "阅读理解专项",
          time: "2024-01-20 14:00-14:27",
          teacher: "John Wilson",
          status: "待出席"
        },
        {
          icon: "/static/course1.png",
          title: "英语基础语法",
          time: "2024-01-09 14:00-14:27",
          teacher: "John Wilson",
          status: "已出席"
        },
        {
          icon: "/static/course4.png",
          title: "欧洲艺术鉴赏",
          time: "2024-01-09 15:00-15:27",
          teacher: "John Wilson",
          status: "已请假"
        }
      ]
    };
  },
  methods: {
    onStudentChange(event) {
      this.selectedStudentIndex = event.detail.value;
    },
    statusClass(status) {
      return {
        'status-pending': status === '待出席',
        'status-attended': status === '已出席',
        'status-leave': status === '已请假'
      };
    }
  }
};
</script>

<style scoped>
/* 页面背景 */
.container {
  background: linear-gradient(to bottom, #4c9aff, #ffffff);
  height: 100vh;
  flex-direction: column;
}

/* 顶部导航栏 */
/* 自定义导航栏样式 */
.custom-header {
  align-items: center;
  justify-content: space-between;
  height: 44px; /* 小程序导航栏高度 */
  background-color: #4c9aff;
  color: #fff;
}

.header-logo {
  width: 100px;
  height: 20px;
}

.student-select {
  flex: 1;
  text-align: center;
  font-size: 16px;
  color: #fff;
  font-weight: bold;
}

/* 日期选择器 */
.date-picker {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  border-radius: 10px;
  margin: 10px 15px;
  padding: 5px 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.date-range {
  font-size: 14px;
}

.calendar-icon {
  margin-left: 10px;
  font-size: 18px;
}

/* 课程列表 */
.course-list {
  flex: 1;
  margin-bottom: 60px; /* 留出底部按钮位置 */
  padding: 10px 15px;
}

.month-title {
  font-size: 14px;
  color: #333;
  margin: 10px 0;
}

.course-card {
  display: flex;
  background: #fff;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.course-icon {
  width: 40px;
  height: 40px;
}

.course-info {
  flex: 1;
  padding-left: 10px;
}

.course-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.course-time,
.course-teacher {
  font-size: 12px;
  color: #666;
}

.course-status {
  display: flex;
  align-items: center;
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
</style>
