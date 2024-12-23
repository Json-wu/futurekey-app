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
// 其他API接口可以类似地封装在这里