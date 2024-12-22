// utils/api.js
import { request } from './request'; // 引入自定义的request函数

// 定义API的基础URL
const BASE_URL = 'https://www.futurekey.com/classroom';

// 封装获取课程列表的API
export function getCourseList(params = {}) {
  return request({
    url: `${BASE_URL}/course/courses`,
    method: 'POST',
    data: params,
  });
}

// 其他API接口可以类似地封装在这里