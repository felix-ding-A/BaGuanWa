App({
  globalData: {
    prizes: [
      { id: '1', name: '洗碗', color: '#FF6B6B', probability: 16 },
      { id: '2', name: '看电视', color: '#4ECDC4', probability: 16 },
      { id: '3', name: '扫地', color: '#45B7D1', probability: 16 },
      { id: '4', name: '写作业', color: '#FFA07A', probability: 20 },
      { id: '5', name: '洗衣服', color: '#98D8C8', probability: 16 },
      { id: '6', name: '去游乐园', color: '#F7DC6F', probability: 16 }
    ],
    spinDuration: 3000,
    isAdmin: false,
    wheelBg: null
  },
  onLaunch() {
    const prizes = wx.getStorageSync('prizes');
    if (prizes) {
      this.globalData.prizes = prizes;
    }
    const duration = wx.getStorageSync('spinDuration');
    if (duration) {
      this.globalData.spinDuration = duration;
    }
    const isAdmin = wx.getStorageSync('isAdmin');
    if (isAdmin) {
      this.globalData.isAdmin = isAdmin;
    }
    const wheelBg = wx.getStorageSync('wheelBg');
    if (wheelBg) {
      this.globalData.wheelBg = wheelBg;
    }
  }
})