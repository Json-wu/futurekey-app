/**
 * 发起HTTP请求
 * @param {Object} options - 请求配置项
 * @returns {Promise} 返回Promise对象
 */
export function request(options) {
  const defaultOptions = {
    method: 'GET',
    header: {
      'content-type': 'application/json', // 默认为json格式
    },
    timeout: 10000, // 超时时间，默认10秒
  };

  const config = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    uni.request({
      ...config,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          showToast('请求失败，请稍后再试');
          reject(new Error(`HTTP error ${res.statusCode}: ${res.errMsg}`));
        }
      },
      fail(err) {
        showToast('网络请求失败，请检查网络连接');
        reject(new Error(`Network error: ${err.errMsg}`));
      }
    });
  });
}

/**
 * 显示Toast提示
 * @param {String} message - 提示信息
 */
export function showToast(message) {
  uni.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
}