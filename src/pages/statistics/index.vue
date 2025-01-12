<template>
  <view class="container">
    <!-- 自定义顶部导航栏 -->
    <view class="custom-header">
      <view class="nav-left" @click="goBack">
        <image src="@/static/back-icon.png" class="back-icon"></image>
      </view>
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

    <view class="page">
      <!-- 用户信息 -->
      <view class="user-card">
        <view class="user-info">
          <view class="user-name">
            <view class="icon1"></view>
            <view class="name">{{ students[selectedStudentIndex].name }}</view>
          </view>
          <view class="edit-icon" @click="editChild">
            <image class="edit-icon" src="/static/icons/edit.png" mode="scaleToFill" />
          </view>
        </view>
        <view class="user-details">
          <view class="user-name">
            🎂 年龄
          </view>
          <view>
            {{ getBirth() }}周岁
          </view>
        </view>
        <view class="user-details">
          <view class="user-name">
            📍 英语等级
          </view>
          <view>
            {{ studentLevel || '-' }}
          </view>
        </view>
      </view>

      <!-- 统计结果 -->
      <view class="titlecss">
        <text>统计结果</text>
      </view>

      <view class="stat-section">
        <view class="stat-item">
          <text class="label">课程总时长</text>
          <text class="stat-value">{{ totalData.hour }} h</text>
        </view>
        <view class="stat-item">
          <text class="label">课程总节数</text>
          <text class="stat-value">{{ totalData.count }}</text>
        </view>
        <view class="stat-item">
          <text class="label">下次续订日期</text>
          <text class="stat-value">{{ totalData.nextDate }}</text>
        </view>
        <view class="stat-item">
          <text class="label">教务顾问</text>
          <text class="stat-value">{{ totalData.consultant }}</text>
        </view>
      </view>

      <!-- 课程列表 -->
      <!-- <view class="titlecss">
        <text>课程历史</text>
      </view> -->
      <view class="course-history">
        <scroll-view class="contentdiv" scroll-x="true">
          <view class="table">
            <!-- 表头 -->
            <view class="table-row table-header">
              <view class="table-cell">课程</view>
              <view class="table-cell">日期</view>
              <view class="table-cell">教师</view>
              <view class="table-cell">出勤</view>
            </view>

            <!-- 表格内容 -->
            <view v-if="visibleRows.length == 0" class="table-row">
              <text class="nonedata">暂无课程</text>
            </view>
            <view v-else class="table-row" v-for="(item, index) in visibleRows" :key="index">
              <view class="table-cell">{{ item.title }}</view>
              <view class="table-cell">{{ item.time }}</view>
              <view class="table-cell">{{ item.teacher }}</view>
              <view class="table-cell">{{ formatState(item.state) }}</view>
            </view>
          </view>
        </scroll-view>
        <view class="course-footer">
          <view class="expand-btn" @tap="toggleExpand">
            <text class="expend"> {{ isExpanded ? '收起' : '展开' }}</text>
            <image class="icon-down" :src="getIcon()" mode="scaleToFill" />
          </view>
          <view class="download-pdf" @click="course_downloadPDF">下载 PDF</view>
        </view>
      </view>

      <!-- 历史订单 -->
      <view class="titlecss">
        <text>历史订单</text>
      </view>

      <view class="course-history">
        <scroll-view class="contentdiv" scroll-x="true">
          <view class="table">
            <!-- 表头 -->
            <view class="table-row table-header">
              <view class="table-cell">课程</view>
              <view class="table-cell">签订日期</view>
              <view class="table-cell">到期日期</view>
              <view class="table-cell">金额</view>
            </view>

            <!-- 表格内容 -->
            <view v-if="visibleRowsOrder.length == 0" class="table-row">
              <text class="nonedata">暂无订单</text>
            </view>
            <view v-else class="table-row" v-for="(item, index) in visibleRowsOrder" :key="index">
              <view class="table-cell">{{ item.course_type }}</view>
              <view class="table-cell">{{ item.sign_dt }}</view>
              <view class="table-cell">{{ item.sign_dt }}</view>
              <view class="table-cell">{{ item.contract_amount }}</view>
            </view>
          </view>
        </scroll-view>
        <view class="course-footer">
          <view class="expand-btn" @tap="toggleExpandOrder" :disabled="visibleRowsOrder.length == 0">
            <text class="expend"> {{ isExpandedOrder ? '收起' : '展开' }}</text>
            <image class="icon-down" :src="getIconOrder()" mode="scaleToFill" />
          </view>
          <view class="download-pdf" @click="order_downloadPDF">下载 PDF</view>
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
    <StudentPopup :isVisible="isVisible" :studentList="students" :selectedStudentCode="studentCode"
      @updateStudent="handleUpdateStudent" @update:isVisible="val => isVisible = val" @logout="handleLogout" />
    <!-- child Info Modal -->
    <view v-if="isShow" class="modal">
      <view class="modal-content">
        <view class="wechatInfo">
          <view class="viewname">昵称：</view>
          <view class="viewname">
            <input class="picker" type="text" placeholder="修改用户昵称" maxlength="20" v-model="studentName" />
          </view>
        </view>
        <view class="wechatInfo">
          <view class="viewname">生日：</view>
          <view class="viewname">
            <picker mode="date" :value="birth" @change="onBirthChange">
              <view class="picker" placeholder="修改用户昵称">{{ birth || '--请选择出生年月--' }}</view>
            </picker>
          </view>
        </view>
        <view class="calendar-header">
          <button class="btn cancel" @tap="closeModal">取消</button>
          <button class="btn confirm" @tap="save">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import calendarPopup from '@/components/CalendarPopup.vue';
import studentPopup from '@/components/StudentPopup.vue';

import { getStudentTotal, getCourseList, getOrderList, saveInfo, downloadPDF_course, downloadPDF_order } from '../../utils/api';

export default {
  components: {
    calendarPopup,
    studentPopup
  },
  data() {
    return {
      hasCourses: false,
      hasOrders: false,
      isVisible: false,
      isExpanded: false, // 是否展开
      isExpandedOrder: false, // 是否展开
      loading: true,
      studentCode: "202408392",
      studentName: '',
      studentBirth: '', // 出生年月
      studentAge: '--',
      studentLevel: '-',
      birth: '',
      isShow: false,
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
      dateRange: "2024-01-09 - 2024-01-26", // 日期范围
      courses: [],
      states: {
        0: "待出席",
        1: "已出席",
        2: "已请假"
      },
      // 示例课程数据
      courseList: [

      ],
      // 示例订单数据
      orderList: [

      ],
      totalData: {
        hour: 0,
        count: 0,
        nextDate: '-',
        consultant: '无'
      },
    };
  },
  computed: {
    // 计算属性，根据 isExpanded 状态控制显示的行数
    visibleRows() {
      console.log('visibleRows', this.courseList);
      if (this.courseList.length > 0) {
        if (this.isExpanded) {
          return this.courseList;
        } else {
          return this.courseList.length > 3 ? this.courseList.slice(0, 3) : this.courseList;
        }
      } else {
        return this.courseList;
      }
    },
    visibleRowsOrder() {
      if (this.orderList.length > 0) {
        if (this.isExpandedOrder) {
          return this.orderList;
        } else {
          return this.orderList.length > 3 ? this.orderList.slice(0, 3) : this.orderList;
        }
      } else {
        return this.orderList;
      }
    },
    getStudentName() {
      console.log('getStudentName', this.$global.studentList);
      console.log('getStudentName', this.$global.selectIndex);
      return this.$global.studentList[this.$global.selectIndex].name;
    }
  },
  created() {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.timezones = this.$global.timezones;
    this.students = this.$global.studentList;
    this.studentCode = this.$global.studentCode;
    this.selectedStudentIndex = this.$global.selectIndex;
    this.studentName = this.students[this.selectedStudentIndex].name;
    this.studentBirth = this.students[this.selectedStudentIndex].value4;
    this.birth = this.studentBirth;
    this.studentLevel = this.students[this.selectedStudentIndex].value5;
    this.selectedTimeZoneIndex = uni.getStorageSync("timezoneIndex") || 0;
    this.timezone = this.timezones[this.selectedTimeZoneIndex].value;
  },
  methods: {
    getBirth() {
      if (!this.studentBirth) return '----/--';

      return this.studentBirth.substr(0, 4) + '/' + this.getAge();
    },
    editChild() {
      this.isShow = true;
    },
    closeModal() {
      this.birth = this.studentBirth;
      this.isShow = false;
    },
    async save() {
      console.log('save', this.studentName, this.birth);
      try {
        // 显示加载提示
        uni.showLoading({
          title: '保存中...'
        });

        const res = await saveInfo({
          "birth": this.birth,
          "studentCode": this.studentCode
        });
        // 处理返回的数据
        if (res.code == 0) {
          uni.hideLoading();
          this.isShow = false;
          this.studentBirth = this.birth;
          this.students[this.selectedStudentIndex].value4 = this.birth;
          uni.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 1000
          });
        }
      } catch (error) {
        console.error('显示加载提示失败:', error);
        uni.hideLoading();
        this.isShow = false;
        this.birth = this.studentBirth;
        uni.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1000
        });
      }
    },
    formatState(state) {
      switch (state) {
        case 0:
          return '待出席';
        case 1:
          return '已出席';
        case 2:
          return '已请假';
        case 3:
          return '缺勤';
        default:
          return '未知';
      }
    },
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
      this.studentName = this.students[this.selectedStudentIndex].name;
      this.$global.studentCode = this.studentCode;
      this.studentBirth = this.students[this.selectedStudentIndex].value4;
      this.birth = this.studentBirth;
      this.studentLevel = this.students[this.selectedStudentIndex].value5;
      console.log('选中的学生代码:', this.studentCode, this.$global.studentCode);
      this.hideModal();
    },
    handleLogout() {
      console.log("退出登录");
      this.$global.studentCode = null;
      this.$global.phone = null;
      this.$global.isLogin = false;
      this.$global.studentList = [];
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
    getIcon() {
      return this.isExpanded ? "/static/icons/up.png" : "/static/icons/down.png";
    },
    getIconOrder() {
      return this.isExpandedOrder ? "/static/icons/up.png" : "/static/icons/down.png";
    },
    goBack() {
      uni.navigateBack();
    },
    getAge() {
      if (this.studentBirth == '----') return '--';

      const birthDate = new Date(this.studentBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      // 如果当前月份还没到生日月份，或者到了生日月份但还没到生日，则年龄减一
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
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
      const firstDayOfMonth = new Date('2024-10-01');//new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDayOfMonth = new Date('2024-10-31');//new Date(today.getFullYear(), today.getMonth() + 1, 0);
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
        await this.getStudentTotal();
        await this.fetchCourseData();
        await this.fetchOrderData();
      } catch (error) {
        console.error('显示加载提示失败:', error);
      } finally {
        // 隐藏加载提示
        uni.hideLoading();
        this.loading = false;
      }
    },
    async fetchCourseData() {
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
          this.courseList = res.data;
          this.hasCourses = this.courseList.length > 0;
          console.log('hasCourses:', this.hasCourses);

        }
      } catch (error) {
        console.error('显示加载提示失败:', error);
      } finally {
        // 隐藏加载提示
        uni.hideLoading();
        this.loading = false;
      }
    },
    async getStudentTotal() {
      try {
        console.log('getStudentTotal开始时间', this.startDate, this.endDate, this.timezone, this.studentCode);
        const res = await getStudentTotal({
          "start_dt": this.startDate,
          "end_dt": this.endDate,
          "studentCode": this.studentCode,
          "timezone": this.timezone
        });
        console.log('课程列表:', res);
        // 处理返回的数据
        if (res.code == 0) {
          this.totalData = res.data;
        }
      } catch (error) {
        console.error('显示加载提示失败:', error);
      }
    },
    async fetchOrderData() {
      try {
        console.log('开始时间', this.startDate, this.endDate, this.timezone, this.studentCode);
        const res = await getOrderList({
          "phone": this.$global.phone,
          "start_dt": this.startDate,
          "end_dt": this.endDate,
          "studentCode": this.studentCode,
          "timezone": this.timezone
        });
        console.log('订单列表:', res);
        // 处理返回的数据
        if (res.code == 0) {
          this.orderList = res.data;
          this.hasOrders = this.orderList.length > 0;
        }
      } catch (error) {
        console.error('订单列表加载提示失败:', error);
      }
    },
    async init() {
      this.setDefaultWeek(); // 初始化默认本周日期
      this.fetchData();
    },
    async course_downloadPDF() {
      try {
        if (!this.hasCourses) {
          uni.showToast({
            title: '暂无课程数据',
            icon: 'none'
          });
          return;
        }
        uni.showLoading({
          title: '下载中...'
        });
        const res = await downloadPDF_course({
          "start_dt": this.startDate,
          "end_dt": this.endDate,
          "studentCode": this.studentCode,
          "studentName": this.studentName,
          "timezone": this.timezone
        });
        console.log('downloadPDF_course:', res);
        // 处理返回的数据
        if (res.code == 0) {
          const downloadUrl = `https://www.futurekey.com/classroom/downloadtemp/${res.filename}`
          uni.downloadFile({
            url: downloadUrl, 
            success: (downloadResult) => {
              console.log('下载结果:', downloadResult);
              if (downloadResult.statusCode === 200) {
                // 打开预览
                uni.openDocument({
                  filePath: downloadResult.tempFilePath,
                  success: () => {
                    uni.hideLoading();
                    console.log('打开文档成功');
                  },
                  fail: (err) => {
                    uni.hideLoading();
                    uni.showToast({
                      title: '打开文档失败',
                      icon: 'none'
                    });
                    console.error('打开文档失败:', err);
                  }
                });
              } else {
                uni.hideLoading();
                uni.showToast({
                  title: '下载失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              uni.hideLoading();
              uni.showToast({
                title: '下载失败',
                icon: 'none'
              });
              console.error('下载失败:', err);
            }
          });
        }
      } catch (error) {
        console.error('下载过程中出错:', error);
      }
    },
    async order_downloadPDF() {
      try {
        if (!this.hasOrders) {
          uni.showToast({
            title: '暂无订单数据',
            icon: 'none'
          });
          return;
        }
        uni.showLoading({
          title: '下载中...'
        });
        const res = await downloadPDF_order({
          "start_dt": this.startDate,
          "end_dt": this.endDate,
          "studentCode": this.studentCode,
          "studentName": this.studentName,
          "timezone": this.timezone
        });
        console.log('downloadPDF_order:', res);
        // 处理返回的数据
        if (res.code == 0) {
          const downloadUrl = `https://www.futurekey.com/classroom/downloadtemp/${res.filename}`
          uni.downloadFile({
            url: downloadUrl, 
            success: (downloadResult) => {
              console.log('下载结果:', downloadResult);
              if (downloadResult.statusCode === 200) {
                // 打开预览
                uni.openDocument({
                  filePath: downloadResult.tempFilePath,
                  success: () => {
                    uni.hideLoading();
                    console.log('打开文档成功');
                  },
                  fail: (err) => {
                    uni.hideLoading();
                    uni.showToast({
                      title: '打开文档失败',
                      icon: 'none'
                    });
                    console.error('打开文档失败:', err);
                  }
                });
              } else {
                uni.hideLoading();
                uni.showToast({
                  title: '下载失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              uni.hideLoading();
              uni.showToast({
                title: '下载失败',
                icon: 'none'
              });
              console.error('下载失败:', err);
            }
          });
        }
      } catch (error) {
        console.error('下载过程中出错:', error);
      }
    },
    // 切换展开状态
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      console.log(this.isExpanded);
    },
    // 切换展开状态
    toggleExpandOrder() {
      this.isExpandedOrder = !this.isExpandedOrder;
      console.log(this.isExpandedOrder);
    },
    onBirthChange(event) {
      this.birth = event.detail.value;
    }
  },
  onLoad() {
    console.log('onLoad');
    this.init();
    this.initCalendar();   // 初始化日历
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
  background: linear-gradient(to bottom, #2F51FF, #c4cdd9);
  flex-direction: column;
  height: 100vh;
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

.back-icon {
  width: 20rpx;
  height: 40rpx;
  margin-left: 20rpx;
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

.icon {
  font-size: 20rpx;
  margin-left: 5rpx;
}


/* 课程列表 */
.course-list {
  flex: 1;
  margin-bottom: 40rpx;
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

.page {
  padding: 36rpx;
}

.user-card {
  background-color: #fff;
  border-radius: 8rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.65);
  font-family: "PingFang SC";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.name {
  font-size: 32rpx;
  font-weight: bold;
  color: #2F51FF;
  margin-left: 10rpx;
}

.user-name {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.edit-icon {
  width: 42px;
  height: 18px;
}

.user-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
}

.stat-section {
  margin-bottom: 20rpx;
  border-radius: 10rpx;
}

.stat-item {
  border-radius: 6px;
  padding: 8px 16px 8px 16px;
  gap: 28px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  margin-bottom: 14rpx;
}

.stat-value {
  font-size: 14px;
  line-height: 20px;
  text-align: right;
}

.course-section {
  margin-top: 30rpx;
  background-color: #fff;
  border-radius: 8rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.course-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
}

.course-header {
  font-weight: bold;
  border-bottom: 1rpx solid #e5e5e5;
  margin-bottom: 12rpx;
  display: flex;
  justify-content: space-between;
  background-color: #f5f5f5;
  padding: 10px;
}

.course-footer {
  display: flex;
  padding: 20rpx;
  justify-content: space-between;
}

.expand-btn {
  padding-top: 16rpx;
}

.download-pdf {
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 4%;
  font-size: 16px;
  padding: 6px 14px;
}

.titlecss {
  text-align: center;
  color: #FFFFFF;
  margin: 20rpx auto 20rpx auto;
}

.icon1 {
  width: 4px;
  height: 20px;
  border-radius: 4%;
  background: #2F51FF;
}

.label {
  width: 200rpx;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  color: #00000083;
}

.course-history {
  background: #FFFFFF;
  border-radius: 10px;
}

.order-history {
  background: #FFFFFF;
  border-radius: 10px;
}

.contentdiv {
  height: auto;
  width: 100%;
  /* 必须定义容器宽度 */
  /* overflow-x: scroll;  */
  white-space: nowrap;
  /* 防止子元素换行 */
  font-size: 28rpx;
  color: #555;
  line-height: 1.6;
}

/* 设置滚动条样式（仅部分支持） */
.contentdiv::-webkit-scrollbar {
  width: 4px;
}

.contentdiv::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  /* 滑块颜色 */
  border-radius: 4px;
}

.contentdiv::-webkit-scrollbar-track {
  background: #f1f1f1;
  /* 滑块轨道颜色 */
}

.expend {
  color: #2F51FF;
  text-align: center;
  font-family: "PingFang SC";
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  /* 128.571% */
  margin-right: 4rpx;
}

.icon-down {
  width: 14px;
  height: 14px;
}

.table {
  display: flex;
  flex-direction: column;
  width: 1000rpx;
}

.table-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1rpx solid #e5e5e5;
}

.table-header {
  border-radius: 10px;
  font-weight: bold;
  border-bottom: 1rpx solid #e5e5e5;
  margin-bottom: 12rpx;
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: rgba(47, 81, 255, 0.05);
}

.table-cell {
  flex: 1;
  padding: 4px;
  text-align: center;
  white-space: normal;
}

.order-history {
  text-align: center;
  color: #353333;
  padding: 30rpx;
}

.nonedata {
  margin-left: 60rpx;
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
  border-radius: 5px;
  width: 80%;
}

.wechatInfo {
  display: flex;
  padding: 20rpx;
  justify-content: center;
  align-items: center;
  margin: 10rpx 0;
}

.viewname {
  font-size: 16px;
  color: #333;
}

.calendar-header {
  margin: 30rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  font-weight: bold;
}

.btn {
  flex: 1;
  margin: 0 5rpx;
  height: 80rpx;
  border-radius: 20rpx;
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
  margin-left: 30rpx;
}

.cancel {
  color: #007aff;
  background-color: #fff;
  border: #007aff 1px solid;
}

.picker {
  width: 280rpx;
  padding: 20rpx;
  justify-content: center;
  align-items: center;
  border-radius: 10rpx;
  background-color: #f5f5f5;
}
</style>
