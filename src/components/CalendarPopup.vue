<template>
<view v-if="showCalendar">
   <!-- 遮罩层 -->
  <view class="mask"  @tap="closeCalendar"></view>
  <view class="calendar-popup">
    <view class="calendar-header">
      <text class="datechoose-text">请选择日期</text>
      <view class="close-btn" @tap="closeCalendar">×</view>
    </view>

    <!-- 月份切换栏 -->
    <view class="month-switch">
      <view class="circle-arrow2" @click="changeMonth(-1)">
        <view class="arrow-left"></view>
      </view>
      <text class="month">{{ currentYear }}年{{ currentMonth }}月</text>
      <view class="circle-arrow2" @click="changeMonth(1)">
        <view class="arrow-right"></view>
      </view>
    </view>

    <!-- 星期显示栏 -->
    <view class="week-days">
      <view v-for="(day, index) in weekDays" :key="index" class="week-day">
        {{ day }}
      </view>
    </view>

    <!-- 日历表格 -->
    <view class="calendar">
      <block v-for="(week, wIndex) in calendar" :key="wIndex">
        <view class="calendar-row">
          <block v-for="(day, dIndex) in week" :key="dIndex">
            <view
              class="calendar-day"
              :class="{
                'selected': day.date === tempStartDate || day.date === tempEndDate,
                'in-range': isInRange(day.date),
                'other-month': day.isOtherMonth
              }"
              @tap="selectDate(day.date, day.isOtherMonth)"
            >
              <text>{{ day.day }}</text>
            </view>
          </block>
        </view>
      </block>
    </view>
    <button class="confirm-btn" @tap="confirmDates">确认</button>
  </view>
</view>
</template>

<script>
export default {
  props: {
    showCalendar: Boolean,
    currentYear: Number,
    currentMonth: Number,
    startDate: String,
    endDate: String,
    tempStartDate: String,
    tempEndDate: String,
    weekDays: Array,
    calendar: Array,
    currentStep: Number
  },
  methods: {
    closeCalendar() {
      this.$emit('update:currentStep', 0);
      this.$emit('update:showCalendar', false);
    },
    changeMonth(step) {
      let newMonth = this.currentMonth + step;
      if (newMonth > 12) {
        this.$emit('update:currentYear', this.currentYear + 1);
        this.$emit('update:currentMonth', 1);
        this.currentMonth = 1;
      } else if (newMonth < 1) {
        this.$emit('update:currentYear', this.currentYear - 1);
        this.$emit('update:currentMonth', 12);
        this.currentMonth = 12;
      } else {
        this.$emit('update:currentMonth', newMonth);
        this.currentMonth = newMonth;
      }
      this.$emit('initCalendar');
    },
    isInRange(date) {
      console.log('isInRange', date, this.tempStartDate, this.tempEndDate);
      if (this.tempStartDate && this.tempEndDate) {
        return date > this.tempStartDate && date < this.tempEndDate;
      }
      return false;
    },
    selectDate(date, isOtherMonth) {
      if (isOtherMonth) return;
      if (this.currentStep === 0) {
        if (date < this.tempEndDate) {
          this.$emit('update:tempStartDate', date);
          this.$emit('update:currentStep', 1);
        }else{
          this.$emit('update:tempStartDate', this.tempEndDate);
          this.$emit('update:tempEndDate', date);
          this.$emit('update:currentStep', 1);
        }
      } else {
        if (date >= this.tempStartDate) {
          this.$emit('update:tempEndDate', date);
          this.$emit('update:currentStep', 0);
        } else {
          this.$emit('update:tempStartDate', date);
          this.$emit('update:tempEndDate', this.tempStartDate);
          this.$emit('update:currentStep', 0);
        }
      }
    },
    confirmDates() {
      if(!this.tempStartDate) {
        uni.showToast({ title: '请选择开始日期', icon: 'none' });
        return;
      }
      if(!this.tempEndDate) {
        uni.showToast({ title: '请选择截止日期', icon: 'none' });
        return;
      }
      this.$global.startDate = this.tempStartDate;
      this.$global.endDate = this.tempEndDate;
      console.log(this.tempStartDate, this.tempEndDate, this.currentMonth);
      this.$emit('update:startDate', this.tempStartDate);
      this.$emit('update:endDate', this.tempEndDate);
      this.$emit('update:currentStep', 0);
      this.$emit('update:showCalendar', false);
      this.$emit('fetchData');
    }
  }
};
</script>

<style scoped>
.mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明遮罩 */
  z-index: 1000;
}
.calendar-popup {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.5);
  z-index: 1001; /* 保证最上层 */
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
  color: #333;
}
.close-btn {
  font-size: 50rpx;
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

.arrow {
  width: 5px;
  height: 5px;
  border-right: 2px solid #1E90FF;
  border-bottom: 2px solid #1E90FF;
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