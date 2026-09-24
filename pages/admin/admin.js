const app = getApp();

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

Page({
  data: {
    prizes: [],
    spinDuration: 3000,
    totalProb: 100,
    forcedPrizeName: '',
    showBgModal: false,
    activeTab: 'image', // 'image' | 'color' | 'effect'
    tempBgType: 'default', // 'default' | 'image' | 'color' | 'effect'
    tempBgImage: '',
    tempBgColor: '#3B82F6',
    tempBgEffect: 'aurora',
    hueValue: 215,
    effectList: [
      { id: 'aurora', name: '极光流动', icon: '🌌', desc: '丝绸流光溢彩，全屏灵动变换', tag: '高级流光' },
      { id: 'marquee', name: '街机跑马灯', icon: '🎪', desc: '转盘外圈灯珠，抽奖飞速追光', tag: '经典刺激' },
      { id: 'disco', name: '迪斯科闪屏', icon: '🪩', desc: '动感节拍脉冲，狂欢派对爆闪', tag: '动感嗨翻' },
      { id: 'stars', name: '星空流星雨', icon: '🌠', desc: '静谧璀璨星海，梦幻流星划过', tag: '浪漫梦幻' },
      { id: 'cyber', name: '赛博霓虹', icon: '🕹️', desc: '80s复古科技，透视滚动网格', tag: '未来潮流' },
      { id: 'spotlight', name: '聚光灯特写', icon: '🔦', desc: '抽奖全场聚光，转盘悬念特写', tag: '电影仪式' }
    ],
    presetColors: [
      { name: '暗夜曜黑', value: 'linear-gradient(135deg, #0F172A, #1E293B)' },
      { name: '深邃夜蓝', value: 'linear-gradient(135deg, #1E1B4B, #312E81)' },
      { name: '落日金辉', value: 'linear-gradient(135deg, #EA580C, #F97316)' },
      { name: '翡翠墨绿', value: 'linear-gradient(135deg, #064E3B, #059669)' },
      { name: '魅惑紫晶', value: 'linear-gradient(135deg, #581C87, #9333EA)' },
      { name: '碧海青天', value: 'linear-gradient(135deg, #0369A1, #0EA5E9)' },
      { name: '浪漫纯紫', value: '#8B5CF6' },
      { name: '科技亮蓝', value: '#3B82F6' },
      { name: '活力暖橙', value: '#F97316' },
      { name: '清新薄荷', value: '#10B981' },
      { name: '热烈绯红', value: '#EF4444' },
      { name: '复古深灰', value: '#334155' }
    ]
  },

  onLoad() {
    const wheelBg = app.globalData.wheelBg || wx.getStorageSync('wheelBg');
    let tempBgType = 'default';
    let tempBgImage = '';
    let tempBgColor = '#3B82F6';
    let tempBgEffect = 'aurora';
    let activeTab = 'effect'; // 默认优先引导酷炫动效

    if (wheelBg) {
      if (wheelBg.type === 'image') {
        tempBgType = 'image';
        tempBgImage = wheelBg.value;
        activeTab = 'image';
      } else if (wheelBg.type === 'color') {
        tempBgType = 'color';
        tempBgColor = wheelBg.value;
        activeTab = 'color';
      } else if (wheelBg.type === 'effect') {
        tempBgType = 'effect';
        tempBgEffect = wheelBg.value;
        activeTab = 'effect';
      }
    }

    this.setData({
      prizes: JSON.parse(JSON.stringify(app.globalData.prizes)),
      spinDuration: app.globalData.spinDuration,
      tempBgType,
      tempBgImage,
      tempBgColor,
      tempBgEffect,
      activeTab
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
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#A78BFA', '#F472B6', '#34D399', '#FBBF24', '#60A5FA', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#14B8A6', '#6366F1', '#D946EF'];
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
    if (prizes.length >= 20) {
      wx.showToast({ title: '最多20个奖项', icon: 'none' });
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

  averageProbabilities() {
    let prizes = this.data.prizes;
    let n = prizes.length;
    if (n === 0) return;
    
    let avg = Math.floor(100 / n);
    let remainder = 100 % n;
    
    prizes.forEach((p, index) => {
      p.probability = avg + (index < remainder ? 1 : 0);
    });
    
    this.setData({ prizes }, this.calculateTotal);
    wx.showToast({ title: '已平均分配概率', icon: 'none' });
  },

  randomizeColors() {
    let prizes = this.data.prizes;
    let availableColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#A78BFA', '#F472B6', '#34D399', '#FBBF24', '#60A5FA', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#14B8A6', '#6366F1', '#D946EF'];
    
    for (let i = availableColors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableColors[i], availableColors[j]] = [availableColors[j], availableColors[i]];
    }
    
    prizes.forEach((p, index) => {
      p.color = availableColors[index % availableColors.length];
    });
    this.setData({ prizes });
    wx.showToast({ title: '已随机所有颜色', icon: 'none' });
  },

  onInterventionChange(e) {
    const index = e.detail.value;
    const prize = this.data.prizes[index];
    this.setData({ forcedPrizeName: prize.name });
    wx.setStorageSync('forcedPrizeId', prize.id);
    wx.showToast({ title: '干预设置成功', icon: 'none' });
  },

  openBgModal() {
    // 重新同步最新生效的背景
    const wheelBg = app.globalData.wheelBg || wx.getStorageSync('wheelBg');
    let tempBgType = 'default';
    let tempBgImage = '';
    let tempBgColor = '#3B82F6';
    let tempBgEffect = 'aurora';
    let activeTab = 'effect';

    if (wheelBg) {
      if (wheelBg.type === 'image') {
        tempBgType = 'image';
        tempBgImage = wheelBg.value;
        activeTab = 'image';
      } else if (wheelBg.type === 'color') {
        tempBgType = 'color';
        tempBgColor = wheelBg.value;
        activeTab = 'color';
      } else if (wheelBg.type === 'effect') {
        tempBgType = 'effect';
        tempBgEffect = wheelBg.value;
        activeTab = 'effect';
      }
    }

    this.setData({
      showBgModal: true,
      tempBgType,
      tempBgImage,
      tempBgColor,
      tempBgEffect,
      activeTab
    });
  },

  selectEffect(e) {
    const effect = e.currentTarget.dataset.effect;
    this.setData({
      tempBgType: 'effect',
      tempBgEffect: effect
    });
  },

  closeBgModal() {
    this.setData({ showBgModal: false });
  },

  preventTouchMove() {},
  preventBubble() {},

  switchBgTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  chooseBgImage() {
    const launchPicker = () => {
      // 优先调用现代基础库推荐的 chooseMedia（无多余参数）
      if (wx.chooseMedia) {
        wx.chooseMedia({
          count: 1,
          mediaType: ['image'],
          sourceType: ['album', 'camera'],
          camera: 'back',
          success: (res) => {
            if (res.tempFiles && res.tempFiles.length > 0) {
              const tempPath = res.tempFiles[0].tempFilePath;
              this.applyChosenImage(tempPath);
            }
          },
          fail: (mediaErr) => {
            console.warn('chooseMedia fail:', mediaErr);
            if (mediaErr && mediaErr.errMsg && mediaErr.errMsg.indexOf('cancel') > -1) {
              return;
            }
            // 回退尝试 chooseImage
            this.fallbackChooseImage(mediaErr);
          }
        });
      } else {
        this.fallbackChooseImage();
      }
    };

    // 如果基础库支持隐私协议授权检查，先触发隐私检查确认
    if (wx.requirePrivacyAuthorize) {
      wx.requirePrivacyAuthorize({
        success: () => {
          launchPicker();
        },
        fail: (pErr) => {
          console.warn('requirePrivacyAuthorize fail:', pErr);
          // 无论是否报错，依然尝试调用唤起相册
          launchPicker();
        }
      });
    } else {
      launchPicker();
    }
  },

  fallbackChooseImage(previousErr) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        if (res.tempFilePaths && res.tempFilePaths.length > 0) {
          this.applyChosenImage(res.tempFilePaths[0]);
        }
      },
      fail: (err) => {
        console.error('chooseImage fail:', err);
        if (err && err.errMsg && err.errMsg.indexOf('cancel') > -1) {
          return;
        }

        const msg = (err && err.errMsg) || (previousErr && previousErr.errMsg) || '未知原因';
        // 如果是因为微信隐私协议未配置相册
        if (msg.indexOf('privacy') > -1 || msg.indexOf('scope') > -1) {
          wx.showModal({
            title: '微信隐私权限提示',
            content: '当前小程序尚未在微信公众平台《用户隐私保护指引》中声明相册/相机权限。请前往微信公众平台(mp.weixin.qq.com)“设置->服务内容声明”中勾选“相册”权限。',
            showCancel: false
          });
        } else {
          wx.showModal({
            title: '无法打开相册',
            content: `手机返回原因: ${msg}。请检查手机系统“设置->微信->照片”是否开启了权限。`,
            showCancel: false
          });
        }
      }
    });
  },

  applyChosenImage(filePath) {
    let finalPath = filePath;
    try {
      const fs = wx.getFileSystemManager();
      const localPath = `${wx.env.USER_DATA_PATH}/wheel_bg_${Date.now()}.jpg`;
      fs.copyFileSync(filePath, localPath);
      finalPath = localPath;
    } catch (e) {
      console.warn('本地文件拷贝备用，继续使用原路径', e);
    }

    this.setData({
      tempBgType: 'image',
      tempBgImage: finalPath
    });
    wx.showToast({ title: '已选取图片', icon: 'success' });
  },

  clearBgImage() {
    this.setData({
      tempBgImage: '',
      tempBgType: 'default'
    });
  },

  selectPresetColor(e) {
    const color = e.currentTarget.dataset.color;
    this.setData({
      tempBgType: 'color',
      tempBgColor: color
    });
  },

  onHueChange(e) {
    const hue = e.detail.value;
    const hex = hslToHex(hue, 85, 55);
    this.setData({
      hueValue: hue,
      tempBgType: 'color',
      tempBgColor: hex
    });
  },

  onHexInput(e) {
    const val = e.detail.value.trim();
    this.setData({
      tempBgColor: val,
      tempBgType: 'color'
    });
  },

  saveBgSetting() {
    const { tempBgType, tempBgImage, tempBgColor, tempBgEffect } = this.data;
    let bgConfig = null;

    if (tempBgType === 'image' && tempBgImage) {
      bgConfig = {
        type: 'image',
        value: tempBgImage
      };
    } else if (tempBgType === 'color' && tempBgColor) {
      bgConfig = {
        type: 'color',
        value: tempBgColor
      };
    } else if (tempBgType === 'effect' && tempBgEffect) {
      bgConfig = {
        type: 'effect',
        value: tempBgEffect
      };
    }

    if (bgConfig) {
      app.globalData.wheelBg = bgConfig;
      wx.setStorageSync('wheelBg', bgConfig);
      wx.showToast({ title: '背景动效已生效', icon: 'success' });
    } else {
      app.globalData.wheelBg = null;
      wx.removeStorageSync('wheelBg');
      wx.showToast({ title: '已恢复默认背景', icon: 'none' });
    }

    this.setData({
      showBgModal: false
    });
  },

  resetDefaultBg() {
    this.setData({
      tempBgType: 'default',
      tempBgImage: '',
      tempBgColor: '#3B82F6',
      tempBgEffect: 'aurora',
      hueValue: 215,
      showBgModal: false
    });
    app.globalData.wheelBg = null;
    wx.removeStorageSync('wheelBg');
    wx.showToast({ title: '已恢复默认背景', icon: 'success' });
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
    
    // 保存配置后自动退出登录状态，增加广告观看次数
    app.globalData.isAdmin = false;
    wx.removeStorageSync('isAdmin');
    
    wx.showToast({ title: '保存成功并退出' });
    
    setTimeout(() => {
      wx.navigateBack({ delta: 2 });
    }, 1500);
  },

  logout() {
    app.globalData.isAdmin = false;
    wx.removeStorageSync('isAdmin');
    wx.navigateBack({ delta: 2 });
  },

  onUnload() {
    // 只要离开控制面板（不论是保存、退出还是直接返回），都销毁登录状态
    app.globalData.isAdmin = false;
    wx.removeStorageSync('isAdmin');
  }
});