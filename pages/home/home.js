Page({
  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  goToDadApp() {
    wx.navigateTo({
      url: '/pages/index/index'
    });
  },

  goToKidApp() {
    wx.navigateTo({
      url: '/pages/quitSmoking/quitSmoking'
    });
  },

  onShareAppMessage() {
    return {
      title: '爸管娃 & 娃管爸 - 趣味家庭互动小程序',
      path: '/pages/home/home'
    };
  },

  onShareTimeline() {
    return {
      title: '爸管娃 & 娃管爸 - 趣味家庭互动小程序',
      query: ''
    };
  }
});
