const app = getApp();

Page({
  data: {
    showAd: false,
    showPwd: false,
    adCountdown: 5,
    generatedPwd: ''
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  goBack() {
    wx.navigateBack();
  },

  goToLogin() {
    if (app.globalData.isAdmin) {
      wx.navigateTo({ url: '/pages/admin/admin' });
      return;
    }
    
    // 开始播放模拟广告
    this.setData({ 
      showAd: true, 
      adCountdown: 5 
    });
    
    this.adTimer = setInterval(() => {
      if (this.data.adCountdown <= 1) {
        this.finishAd();
      } else {
        this.setData({ adCountdown: this.data.adCountdown - 1 });
      }
    }, 1000);
  },

  skipAd() {
    this.finishAd();
  },

  finishAd() {
    if (this.adTimer) clearInterval(this.adTimer);
    
    // 生成8位随机密码
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let pwd = '';
    for (let i = 0; i < 8; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // 保存动态密码
    wx.setStorageSync('dynamicAdminPwd', pwd);
    
    this.setData({
      showAd: false,
      showPwd: true,
      generatedPwd: pwd
    });
  },

  copyAndLogin() {
    wx.setClipboardData({
      data: this.data.generatedPwd,
      success: () => {
        this.setData({ showPwd: false });
        wx.navigateTo({ url: '/pages/login/login' });
      }
    });
  },

  onUnload() {
    if (this.adTimer) clearInterval(this.adTimer);
  },

  onShareAppMessage() {
    return {
      title: '幸运大转盘 - 活动规则说明',
      path: '/pages/rules/rules'
    };
  },

  onShareTimeline() {
    return {
      title: '幸运大转盘 - 活动规则说明',
      query: ''
    };
  }
});