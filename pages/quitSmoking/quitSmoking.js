Page({
  data: {
    age: '',
    cigsPerDay: '',
    smokingYears: '',
    quitDate: '',
    activeFocus: '',
    showResultModal: false,
    resultYears: 0,
    resultMonths: 0,
    resultDays: 0,
    resultMoney: 0,
    resultSpeechText: ''
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onReady() {
    // 页面加载完毕后立即播放语音提示
    this.speak('医学研究表明，每吸一支烟大约会缩短20分钟的寿命。请填写老爸吸烟情况');
  },

  onUnload() {
    if (this.voiceAudio) this.voiceAudio.destroy();
  },

  speak(text) {
    if (this.voiceAudio) {
      this.voiceAudio.destroy();
    }
    this.voiceAudio = wx.createInnerAudioContext();
    this.voiceAudio.autoplay = true;
    this.voiceAudio.src = `https://fanyi.baidu.com/gettts?lan=zh&text=${encodeURIComponent(text)}&spd=5&source=web&per=4&vol=15`;
    this.voiceAudio.onError((res) => {
      console.warn('语音播放提示失败', res);
    });
  },

  // 通用失焦处理
  onInputBlur() {
    this.setData({ activeFocus: '' });
  },

  // 1. 年龄输入与语音提示
  onAgeInput(e) {
    this.setData({ age: e.detail.value.trim() });
  },
  onAgeFocus() {
    this.setData({ activeFocus: 'age' });
    this.speak('请输入你爸的年龄');
  },

  // 2. 抽几根/天输入与语音提示
  onCigsInput(e) {
    this.setData({ cigsPerDay: e.detail.value.trim() });
  },
  onCigsFocus() {
    this.setData({ activeFocus: 'cigsPerDay' });
    this.speak('请输入你爸每天抽几根，一盒是20根');
  },

  // 3. 几年了输入与语音提示
  onYearsInput(e) {
    this.setData({ smokingYears: e.detail.value.trim() });
  },
  onYearsFocus() {
    this.setData({ activeFocus: 'smokingYears' });
    this.speak('请输入你爸抽烟多少年？');
  },

  // 4. 开始戒烟日期选择与语音提示
  onQuitDateTap() {
    this.setData({ activeFocus: 'quitDate' });
    this.speak('请选择你爸开始戒烟的日期');
  },
  onQuitDateChange(e) {
    this.setData({ quitDate: e.detail.value, activeFocus: '' });
  },

  // 开始计算生命增益
  calculateGain() {
    const { age, cigsPerDay, smokingYears, quitDate } = this.data;
    
    // 如果某个输入框或者选择框为空则播报“有未填项请检查”，并弹出提示框
    if (!age || !cigsPerDay || !smokingYears || !quitDate) {
      this.speak('有未填项请检查');
      wx.showToast({
        title: '有未填项请检查',
        icon: 'none'
      });
      return;
    }

    const cigs = Number(cigsPerDay);
    const now = new Date();
    const quit = new Date(quitDate);

    // 计算戒烟天数 (至少按1天计算)
    let diffTime = now.getTime() - quit.getTime();
    let daysQuit = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (isNaN(daysQuit) || daysQuit <= 0) {
      daysQuit = 1; // 今天或未选过去日期，按基准1天增益计算
    }

    // 每吸1支烟缩短20分钟寿命 -> 戒烟每根节省出20分钟寿命
    const totalMinutesSaved = daysQuit * cigs * 20;
    const totalDaysSaved = totalMinutesSaved / (24 * 60);

    // 计算总天数：不足一天用小数表示
    let daysFormatted = totalDaysSaved >= 1 
      ? Number(totalDaysSaved.toFixed(2)) 
      : Number(totalDaysSaved.toFixed(3));

    if (daysFormatted === 0 && totalDaysSaved > 0) {
      daysFormatted = Number(totalDaysSaved.toFixed(4));
    }

    // 节省零花钱（1支烟按1元计算）
    const moneySaved = daysQuit * cigs * 1;

    const speechText = `恭喜您你爸的生命增益为：${daysFormatted}天，心脏病、糖尿病、癌症、牙齿脱落的风险正在降低。预计为你节省零花钱${moneySaved}元。`;

    this.setData({
      showResultModal: true,
      resultDays: daysFormatted,
      resultMoney: moneySaved,
      resultSpeechText: speechText
    });

    // 自动播放计算结果语音
    this.speak(speechText);
  },

  replayVoice() {
    if (this.data.resultSpeechText) {
      this.speak(this.data.resultSpeechText);
    }
  },

  closeResultModal() {
    if (this.voiceAudio) this.voiceAudio.stop();
    this.setData({ showResultModal: false });
  },

  onShareAppMessage() {
    return {
      title: '娃管爸 - 戒烟计算器：算算老爸戒烟带来的生命增益！',
      path: '/pages/quitSmoking/quitSmoking'
    };
  },

  onShareTimeline() {
    return {
      title: '娃管爸 - 戒烟计算器：守护老爸健康与钱包！',
      query: ''
    };
  }
});
