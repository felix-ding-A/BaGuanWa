const app = getApp();

Page({
  data: {
    prizes: [],
    spinDuration: 3000,
    totalProb: 100,
    forcedPrizeName: ''
  },

  onLoad() {
    this.setData({
      prizes: JSON.parse(JSON.stringify(app.globalData.prizes)),
      spinDuration: app.globalData.spinDuration
    });
    this.calculateTotal();
  },

  calculateTotal() {
    const total = this.data.prizes.reduce((sum, p) => sum + (Number(p.probability) || 0), 0);
    this.setData({ totalProb: total });
  },

  onDurationInput(e) {
    this.setData({ spinDuration: Number(e.detail.value) });
  },

  onPrizeNameInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const key = `prizes[${index}].name`;
    this.setData({ [key]: value });
  },

  onPrizeProbInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = Number(e.detail.value);
    const key = `prizes[${index}].probability`;
    this.setData({ [key]: value }, this.calculateTotal);
  },

  changeColor(e) {
    const index = e.currentTarget.dataset.index;
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#A78BFA', '#F472B6', '#34D399'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const key = `prizes[${index}].color`;
    this.setData({ [key]: randomColor });
  },

  deletePrize(e) {
    const index = e.currentTarget.dataset.index;
    const prizes = this.data.prizes;
    if (prizes.length <= 2) {
      wx.showToast({ title: '至少保留2个奖项', icon: 'none' });
      return;
    }
    prizes.splice(index, 1);
    this.setData({ prizes }, this.calculateTotal);
  },

  addPrize() {
    const prizes = this.data.prizes;
    if (prizes.length >= 10) {
      wx.showToast({ title: '最多10个奖项', icon: 'none' });
      return;
    }
    const newPrize = {
      id: Date.now().toString(),
      name: '新奖品',
      color: '#A78BFA',
      probability: 0
    };
    prizes.push(newPrize);
    this.setData({ prizes }, this.calculateTotal);
  },

  randomizeProbabilities() {
    let prizes = this.data.prizes;
    let n = prizes.length;
    if (n === 0) return;
    if (n === 1) {
      prizes[0].probability = 100;
    } else {
      // 使用切分法(Stick Cutting)生成和为100的随机整数
      let cuts = [];
      for (let i = 0; i < n - 1; i++) {
        cuts.push(Math.floor(Math.random() * 101));
      }
      cuts.push(0);
      cuts.push(100);
      cuts.sort((a, b) => a - b);
      
      for (let i = 0; i < n; i++) {
        prizes[i].probability = cuts[i + 1] - cuts[i];
      }
    }
    this.setData({ prizes }, this.calculateTotal);
    wx.showToast({ title: '已随机分配概率', icon: 'none' });
  },

  onInterventionChange(e) {
    const index = e.detail.value;
    const prize = this.data.prizes[index];
    this.setData({ forcedPrizeName: prize.name });
    wx.setStorageSync('forcedPrizeId', prize.id);
    wx.showToast({ title: '干预设置成功', icon: 'none' });
  },

  saveConfig() {
    if (this.data.totalProb !== 100) {
      wx.showToast({ title: '总概率必须等于100', icon: 'none' });
      return;
    }
    
    if (this.data.spinDuration < 1000 || this.data.spinDuration > 10000 || isNaN(this.data.spinDuration)) {
      wx.showToast({ title: '旋转时间必须在1000到10000毫秒之间', icon: 'none' });
      return;
    }
    
    app.globalData.prizes = this.data.prizes;
    app.globalData.spinDuration = this.data.spinDuration;
    
    wx.setStorageSync('prizes', this.data.prizes);
    wx.setStorageSync('spinDuration', this.data.spinDuration);
    
    wx.showToast({ title: '保存成功' });
    
    setTimeout(() => {
      wx.navigateBack({ delta: 2 });
    }, 1500);
  },

  logout() {
    app.globalData.isAdmin = false;
    wx.removeStorageSync('isAdmin');
    wx.navigateBack({ delta: 2 });
  }
});