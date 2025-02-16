export default {
    data() {
        return {
            share: {
                title: '科爱信-开心英语',
                path: '/pages/index/index', // 分享路径
                imageUrl: '/static/sharehome.png'//'https://futurekey.com/classroom/download/1737727891005-1737727891005.jpeg' // 分享图片URL
              },
        }
    },
    //1.配置发送给朋友
    onShareAppMessage() {
        console.log('onShareAppMessage', this.share);
        return {
            title: this.share.title,
            path: this.share.path,
            imageUrl: this.share.imageUrl
        };
    },
    //2.配置分享到朋友圈
    onShareTimeline() {
        console.log('onShareTimeline', this.share);
        return {
            title: this.share.title,
            query: this.share.path,
            imageUrl: this.share.imageUrl
        }
    },
}