const app = getApp();

Page({
  data: {
    password: '',
    error: ''
  },

  onInput(e) {
    this.setData({ password: e.detail.value, error: '' });
  },

  goBack() {
    wx.navigateBack();
  },

  login() {
    const validPwd = wx.getStorageSync('dynamicAdminPwd');
    
    // 如果存在动态密码则校验动态密码，如果没有则为了防止卡死可以保留个兜底密码 888888
    if (this.data.password === validPwd || (this.data.password === '888888' && !validPwd)) {
      app.globalData.isAdmin = true;
      wx.setStorageSync('isAdmin', true);
      // 登录成功后销毁该临时密码
      wx.removeStorageSync('dynamicAdminPwd');
      wx.redirectTo({ url: '/pages/admin/admin' });
    } else {
      this.setData({ error: '密码错误' });
    }
  }
});