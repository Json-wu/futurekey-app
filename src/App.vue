<script>
	export default {
		onLaunch: function() {
			const updateManager = wx.getUpdateManager();

			updateManager.onCheckForUpdate((res) => {
			if (res.hasUpdate) {
				console.log('检测到新版本');
			}
			});

			updateManager.onUpdateReady(() => {
			// 新版本下载完成
			wx.showModal({
				title: '更新提示',
				content: '发现新版本，请立即更新以继续使用',
				showCancel: false, // 隐藏“取消”按钮，强制用户更新
				success(res) {
				if (res.confirm) {
					// 用户点击“确定”，强制重启应用
					updateManager.applyUpdate();
				}
				},
			});
			});

			updateManager.onUpdateFailed(() => {
				// 新版本下载失败
				wx.showModal({
					title: '更新失败',
					content: '新版本下载失败，请退出后重新打开小程序',
					showCancel: false,
				});
			});
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>
