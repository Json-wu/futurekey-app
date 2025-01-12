// utils/api.js
import { request } from './request'; // 引入自定义的request函数

// 定义API的基础URL
const BASE_URL = 'https://www.futurekey.com/classroom';

// 封装获取学生列表的API
export function getStudentList(phone) {
  return request({
    url: `${BASE_URL}/student/getstudentList?code=${phone}`,
    method: 'GET',
  });
}
// 封装获取课程列表的API
export function getCourseList(params = {}) {
  return request({
    url: `${BASE_URL}/course/courses`,
    method: 'POST',
    data: params,
  });
}
// 封装获取课程详情的API
export function getCourseInfo(params = {}) {
  return request({
    url: `${BASE_URL}/course/queryinfo?id=${params.id}&code=${params.code}&timezone=${params.timezone}`,
    method: 'GET',
  });
}
// 封装删除文件的API
export function deleteFile(params = {}) {
  return request({
    url: `${BASE_URL}/deleteCustom`,
    method: 'POST',
    data: params,
  });
}
// 封装获取学生统计的API
export function getStudentTotal(params = {}) {
  return request({
    url: `${BASE_URL}/student/total`,
    method: 'POST',
    data: params,
  });
}
// 封装获取学生订单列表接口
export function getOrderList(params = {}) {
  return request({
    url: `${BASE_URL}/student/order`,
    method: 'POST',
    data: params,
  });
}
// 封装用户退出登录接口
export function logout(params = {}) {
  return request({
    url: `${BASE_URL}/wechat/logout`,
    method: 'POST',
    data: params,
  });
}
// 封装用户保存信息接口
export function saveInfo(params = {}) {
  return request({
    url: `${BASE_URL}/student/save`,
    method: 'POST',
    data: params,
  });
}
// 封装课程记录下载pdf接口
export function downloadPDF_course(params = {}) {
  return request({
    url: `${BASE_URL}/course/pdf`,
    method: 'POST',
    data: params,
  });
}
// 封装课程记录下载pdf接口
export function downloadPDF_order(params = {}) {
  return request({
    url: `${BASE_URL}/course/orderpdf`,
    method: 'POST',
    data: params,
  });
}