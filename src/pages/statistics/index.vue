<template>
  <view class="container">
    <view class="custom-header">
      <image src="/static/keai-logo.png" class="header-logo" @click="showAboutUs" />
      <view class="centered-picker-container" @tap="showModal">
        <view class="student-select">{{ students[selectedStudentIndex].name }} ▼</view>
      </view>
      <view class="header-placeholder"></view>
    </view>

    <view class="date-filter">
      <view class="date-range" @tap="openCalendar">
        <text class="date-text">{{ startDate || '请选择' }}</text>
        <text class="separator">一</text>
        <text class="date-text">{{ endDate || '请选择' }}</text>
      </view>
    </view>

    <view class="page">
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
            {{ totalData.level || '-' }}
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
          <text class="stat-value">{{ totalData.time }} h</text>
        </view>
        <view class="stat-item">
          <text class="label">课程总节数</text>
          <text class="stat-value">{{ totalData.count }}</text>
        </view>
        <view class="stat-item" v-if="wechatSet.show_exprire">
          <text class="label">下次续订日期</text>
          <text class="stat-value">{{ totalData.exprire_dt || '-' }}</text>
        </view>
        <view class="stat-item" v-if="wechatSet.show_remain">
          <text class="label">剩余课时</text>
          <text class="stat-value">{{ totalData.remain || '-' }}</text>
        </view>
        <view class="stat-item">
          <text class="label">教务顾问</text>
          <text class="stat-value">{{ totalData.consultant }}</text>
        </view>
      </view>

      <!-- 课程记录 -->
      <!-- <view class="titlehistory">
        <text>课程记录</text>
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
              <view class="table-cell">{{ item.title || '-' }}</view>
              <view class="table-cell">{{ item.time || '-' }}</view>
              <view class="table-cell">{{ item.teacher || '-' }}</view>
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

        <!-- 历史订单 -->
        <view class="titlehistory" v-if="wechatSet.show_order">
          <text>历史订单</text>
        </view>

        <scroll-view class="contentdiv" scroll-x="true" v-if="wechatSet.show_order">
          <view class="table">
            <!-- 表头 -->
            <view class="table-row table-header">
              <!-- <view class="table-cell">课程名称</view> -->
              <view class="table-cell">课程类型</view>
              <view class="table-cell">签订日期</view>
              <view class="table-cell">到期日期</view>
              <view class="table-cell">订单金额(元)</view>
            </view>
            <view v-if="visibleRowsOrder.length == 0" class="table-row">
              <text class="nonedata">暂无订单</text>
            </view>
            <view v-else class="table-row" v-for="(item, index) in visibleRowsOrder" :key="index">
              <!-- <view class="table-cell">{{ item.course_title || '-' }}</view> -->
              <view class="table-cell">{{ item.course_type || '-' }}</view>
              <view class="table-cell">{{ item.sign_dt || '-' }}</view>
              <view class="table-cell">{{ item.exprire_dt || '-' }}</view>
              <view class="table-cell">{{ item.contract_amount }}</view>
            </view>
          </view>
        </scroll-view>
        <!-- <view class="order-footer">
          <view class="expand-btn" @tap="toggleExpandOrder" :disabled="visibleRowsOrder.length == 0">
            <text class="expend"> {{ isExpandedOrder ? '收起' : '展开' }}</text>
            <image class="icon-down" :src="getIconOrder()" mode="scaleToFill" />
          </view>
          <view class="download-pdf" @click="order_downloadPDF">下载 PDF</view>
        </view> -->
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

    <AboutUsPopup :showAbout="showAbout" @update:showAbout="val => showAbout = val" />
    <!-- 引用 StudentPopup 组件 -->
    <StudentPopup :isVisible="isVisible" :studentList="students" :selectedStudentCode="studentCode"
      @updateStudent="handleUpdateStudent" @update:isVisible="val => isVisible = val" @logout="handleLogout" />
    <!-- child Info Modal -->
    <view v-if="isShow" class="modal">
      <view class="modal-content">
        <view class="calendar-header">
          <text class="datechoose-text">修改学生信息</text>
          <view class="close-btn" @tap="closeModal">×</view>
        </view>

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
import aboutUsPopup from '@/components/AboutUsPopup.vue';
import calendarPopup from '@/components/CalendarPopup.vue';
import studentPopup from '@/components/StudentPopup.vue';

import { getCourseList, getOrderList, saveInfo, downloadPDF_course, downloadPDF_order, getSetting } from '../../utils/api';

export default {
  components: {
    aboutUsPopup,
    calendarPopup,
    studentPopup
  },
  data() {
    return {
      showAbout: false,
      hasCourses: false,
      hasOrders: false,
      isVisible: false,
      isExpanded: false, // 是否展开
      isExpandedOrder: false, // 是否展开
      loading: true,
      studentCode: "",
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
      dateRange: "", // 日期范围
      courses: [],
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
        consultant: '无',
        remain: '-'
      },
      wechatSet: {
        show_remain: false,
        show_order: false,
        show_exprire: false,
        user_term:''
      }
    };
  },
  computed: {
    // 计算属性，根据 isExpanded 状态控制显示的行数
    visibleRows() {
      if (this.courseList.length > 0) {
        if (this.isExpanded) {
          return this.courseList;
        } else {
          return this.courseList.length > 1 ? this.courseList.slice(0, 1) : this.courseList;
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
          return this.orderList.length > 1 ? this.orderList.slice(0, 1) : this.orderList;
        }
      } else {
        return this.orderList;
      }
    },
    getStudentName() {
      const sdata = this.$global.studentList[this.$global.selectIndex];
      return uni.getStorageSync(sdata.studentCode) || sdata.name;
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
    const sdata = this.students[this.selectedStudentIndex];
    this.studentName = uni.getStorageSync(sdata.code) || sdata.name;
    this.studentBirth = this.students[this.selectedStudentIndex].value4;
    this.birth = this.studentBirth;
    this.studentLevel = this.students[this.selectedStudentIndex].value5;
    this.selectedTimeZoneIndex = uni.getStorageSync("timezoneIndex") || 0;
    this.startDate = this.$global.startDate;
    this.endDate = this.$global.endDate;
    this.getSetting();
  },
  methods: {
    async getSetting() {
      const res = await getSetting();
        if (res.code == 0) {
          this.wechatSet = res.data;
        }
    },
    showAboutUs() {
      this.showAbout = true;
    },
    getBirth() {
      console.log(this.studentBirth);
      if (!this.studentBirth || this.studentBirth == '-') return '----/--';

      return this.studentBirth.substr(0, 4) + '/' + this.getAge();
    },
    editChild() {
      this.birth = this.studentBirth;
      this.isShow = true;
    },
    closeModal() {
      this.birth = this.studentBirth;
      this.isShow = false;
    },
    async save() {
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
          this.students[this.selectedStudentIndex].name = this.studentName;
          uni.setStorageSync(this.studentCode, this.studentName);
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
          return '已缺课';
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
      const sdata = this.students[this.selectedStudentIndex];
      this.studentCode = sdata.code;
      this.studentName = uni.getStorageSync(sdata.code) || sdata.name;
      this.$global.studentCode = this.studentCode;
      uni.setStorageSync('studentCode', this.studentCode);
      uni.setStorageSync('selectIndex', this.selectedStudentIndex);
      console.log('选中的学生代码:', this.studentCode, this.$global.studentCode);
      this.hideModal();
      this.fetchData();
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

        const res = await getCourseList({
          "start_dt": this.startDate,
          "end_dt": this.endDate,
          "studentCode": this.studentCode,
          "timezone": this.$global.timezone,
          "type": "statics"
        });
        console.log('课程列表:', res);
        // 处理返回的数据
        if (res.code == 0) {
          this.courseList = res.data;
          this.totalData = res.total;
          console.log('this.totalData', this.totalData);
          this.studentBirth = this.totalData.birth;
          this.hasCourses = this.courseList.length > 0;

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
    async fetchOrderData() {
      try {
        const res = await getOrderList({
          "phone": this.$global.phone,
          "start_dt": this.startDate,
          "end_dt": this.endDate,
          "studentCode": this.studentCode,
          "timezone": this.$global.timezone
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
          "timezone": this.$global.timezone
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
          "timezone": this.$global.timezone
        });
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
      this.selectedTimeZoneIndex = uni.getStorageSync("timezoneIndex") || 0;
      this.selectedTimeZone = this.timezones[this.selectedTimeZoneIndex]; // 根据索引获取对应的时区对象
      this.$global.timezone = this.selectedTimeZone.value;
      uni.setStorageSync('timezoneIndex', this.selectedTimeZoneIndex);
      uni.setStorageSync('selectIndex', this.selectIndex);
      this.fetchData();
    }
  },
  // onLoad() {
  //   console.log('onLoad');
  //   this.setDefaultWeek(); // 初始化默认本周日期
  //   this.initCalendar();   // 初始化日历
  //   this.load();
  // },
  onShow() {
    console.log('onShow');
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
.nav-left {
  padding-right: 20rpx;
  padding-left: 20rpx;
}

/* 页面背景 */
.container {
  background: linear-gradient(to bottom, #2F51FF, #F7F9FC);
  flex-direction: column;
  height: auto;
  min-height: 100vh;
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

/* 按钮图标 */
.icon {
  width: 36rpx;
  height: 36rpx;
  margin-bottom: 6rpx;
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
  /* 调整字体大小 */
  color: #333;
}

.close-btn {
  font-size: 50rpx;
  /* 调整关闭按钮大小 */
  color: #999;
  cursor: pointer;
}
.month-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page {
  padding: 32rpx;
}

.user-card {
  background-color: #fff;
  border-radius: 10rpx;
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
  border-radius: 10rpx;
  padding: 20rpx;
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
  border-radius: 10rpx;
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

.order-footer {
  display: flex;
  padding: 20rpx;
  justify-content: space-between;
  background: #FFFFFF;
  border-radius: 0 0 10rpx 10rpx;
}

.expand-btn {
  align-items: center;
  justify-content: center;
  text-align: center;
}

.download-pdf {
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 10rpx;
  font-size: 16px;
  padding: 6px 14px;
}

.titlecss {
  text-align: center;
  color: #FFFFFF;
  margin: 20rpx auto 20rpx auto;
}

.titlehistory {
  text-align: center;
  color: #FFFFFF;
  margin: 20rpx auto 20rpx auto;
}

.icon1 {
  width: 4px;
  height: 20px;
  border-radius: 10rpx;
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
  display: flex;
  flex-direction: column;
}

.order-history {
  text-align: center;
  color: #353333;
  padding: 30rpx;
  background: #FFFFFF;
  border-radius: 10rpx;
}

.course-footer {
  display: flex;
  padding: 20rpx;
  justify-content: space-between;
  background: #FFFFFF;
  border-radius: 0rpx 0rpx 10rpx 10rpx;
}

.contentdiv {
  height: auto;
  width: 100%;
  white-space: nowrap;
  font-size: 28rpx;
  color: #555;
  line-height: 1.6;
  background: #FFFFFF;
  border-radius: 10rpx 10rpx 0px 0px;
}

/* 设置滚动条样式（仅部分支持） */
.contentdiv::-webkit-scrollbar {
  width: 4px;
}

.contentdiv::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  /* 滑块颜色 */
  border-radius: 10rpx;
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
  width: 1100rpx;
}

.table-row {
  display: flex;
  justify-content: space-between;
  border-bottom: 1rpx solid #e5e5e5;
}

.table-header {
  border-radius: 10rpx;
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
  border-radius: 10rpx;
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

.btn {
  flex: 1;
  margin: 0 5rpx;
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

.picker {
  width: 280rpx;
  padding: 20rpx; justify-content: center;
  align-items: center;
  border-radius: 10rpx;
  background-color: #f5f5f5;
}

.header-logo {
    width: 55px;
    height: 32px;
    margin-top: 6px;
    margin-left: 10px;
  }
</style>
