const app = getApp();

Page({
  data: {
    orientation: 'portrait',
    rotation: 0,
    isSpinning: false,
    result: null,
    spinDuration: 3000,
    prizes: [],
    animationData: {},
    bgConfig: null,
    containerBgStyle: ''
  },

  onLoad() {
    this.applyBackground();
    this.setData({
      prizes: app.globalData.prizes,
      spinDuration: app.globalData.spinDuration
    });
    
    // 开启微信分享功能（包含发送给朋友和分享到朋友圈）
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    // 初始化 WebAudioContext 用于生成滴答声
    try {
      this.audioCtx = wx.createWebAudioContext();
    } catch (e) {
      console.warn('当前基础库不支持 WebAudioContext', e);
    }
  },

  applyBackground() {
    const wheelBg = app.globalData.wheelBg || wx.getStorageSync('wheelBg') || null;
    let containerBgStyle = '';
    if (wheelBg && wheelBg.type === 'color' && wheelBg.value) {
      containerBgStyle = `background: ${wheelBg.value} !important;`;
    }
    this.setData({
      bgConfig: wheelBg,
      containerBgStyle: containerBgStyle
    });
  },

  onUnload() {
    if (this.winAudio) this.winAudio.destroy();
  },

  onShow() {
    this.applyBackground();
    this.setData({
      prizes: app.globalData.prizes,
      spinDuration: app.globalData.spinDuration
    }, () => {
      // 延迟一小段时间确保 Canvas 节点完全渲染出来，防止 exec 发生 timeout 错误
      setTimeout(() => {
        this.drawWheel();
      }, 100);
    });
  },

  playTick() {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
    gain.gain.setValueAtTime(1, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, this.audioCtx.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.1);
  },

  speak(text) {
    if (this.winAudio) {
      this.winAudio.destroy();
    }
    
    this.winAudio = wx.createInnerAudioContext();
    this.winAudio.autoplay = true;
    this.winAudio.src = `https://fanyi.baidu.com/gettts?lan=zh&text=${encodeURIComponent('恭喜获得' + text)}&spd=5&source=web&per=4&vol=15`;
    
    this.winAudio.onError((res) => {
      console.error('语音播报失败', res);
    });
  },

  drawWheel() {
    const query = wx.createSelectorQuery();
    query.select('#wheelCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0]) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = res[0].width;
        const height = res[0].height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY);
        
        const prizes = this.data.prizes;
        const anglePerPrize = (2 * Math.PI) / prizes.length;
        
        ctx.clearRect(0, 0, width, height);
        
        prizes.forEach((prize, index) => {
          const startAngle = index * anglePerPrize - Math.PI / 2;
          const endAngle = startAngle + anglePerPrize;
          
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.fillStyle = prize.color;
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.save();
          const textAngle = startAngle + anglePerPrize / 2;
          ctx.translate(
            centerX + Math.cos(textAngle) * (radius * 0.85),
            centerY + Math.sin(textAngle) * (radius * 0.85)
          );
          ctx.rotate(textAngle);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(prize.name, 0, 0);
          ctx.restore();
        });
        
        // 中心圆
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.stroke();
      });
  },

  goToRules() {
    wx.navigateTo({ url: '/pages/rules/rules' });
  },

  toggleOrientation() {
    this.setData({
      orientation: this.data.orientation === 'portrait' ? 'landscape' : 'portrait'
    });
    setTimeout(() => {
      this.drawWheel();
    }, 300);
  },

  spinWheel() {
    if (this.data.isSpinning) return;
    
    // 解锁移动端音频（必须在用户点击事件中触发）
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    this.setData({ isSpinning: true, result: null });
    
    // 模拟转动时的滴答声（每隔一段时间响一下，随时间变慢）
    let tickCount = 0;
    const maxTicks = 20;
    const tickInterval = this.data.spinDuration / maxTicks;
    
    this.vibrateInterval = setInterval(() => {
      if (tickCount < maxTicks) {
        this.playTick();
        wx.vibrateShort();
        tickCount++;
      } else {
        clearInterval(this.vibrateInterval);
      }
    }, tickInterval);
    
    const prizes = this.data.prizes;
    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize = prizes[0];
    let prizeIndex = 0;
    
    for (let i = 0; i < prizes.length; i++) {
      cumulative += prizes[i].probability;
      if (random <= cumulative) {
        selectedPrize = prizes[i];
        prizeIndex = i;
        break;
      }
    }
    
    // Check for admin intervention
    const forcedId = wx.getStorageSync('forcedPrizeId');
    if (forcedId) {
      const fIndex = prizes.findIndex(p => p.id === forcedId);
      if (fIndex > -1) {
        selectedPrize = prizes[fIndex];
        prizeIndex = fIndex;
      }
      wx.removeStorageSync('forcedPrizeId');
    }
    
    const anglePerPrize = 360 / prizes.length;
    const targetAngle = this.data.rotation + 360 * 5 + (360 - (prizeIndex * anglePerPrize + anglePerPrize / 2)) - (this.data.rotation % 360);
    
    const animation = wx.createAnimation({
      duration: this.data.spinDuration,
      timingFunction: 'ease-out'
    });
    
    animation.rotate(targetAngle).step();
    
    this.setData({ 
      rotation: targetAngle,
      animationData: animation.export()
    });
    
    setTimeout(() => {
      // 停止震动和滴答声
      if (this.vibrateInterval) clearInterval(this.vibrateInterval);
      
      // 语音播报中奖结果
      this.speak(selectedPrize.name);
      
      this.setData({
        isSpinning: false,
        result: selectedPrize.name
      });
      wx.vibrateLong();
    }, this.data.spinDuration);
  },

  closeResult() {
    if (this.winAudio) this.winAudio.stop();
    this.setData({ result: null });
  },

  /**
   * 用户点击右上角分享（发送给朋友）
   */
  onShareAppMessage() {
    return {
      title: '幸运大转盘 - 看看你的好运气！',
      path: '/pages/index/index'
    };
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '幸运大转盘 - 决定今天谁洗碗/看电视/写作业！',
      query: ''
    };
  }
});