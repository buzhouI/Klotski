const app = getApp();
const innerAudioContext = wx.createInnerAudioContext();
innerAudioContext.autoplay = true;
innerAudioContext.src = '/audio/click.mp3';

Page({
  data: {
    windowWidth: app.windowWidth, // 屏幕宽度

    numData: [],  //{num, isEmpty} 用于存储所有格子的数字
    m: '00',  // 分
    s: '00',  // 秒
    step: 0,  // 步数
    difficulty: 3,  //难度系数
    isAudioPlay: true
  },

  isPass: false,  //是否通关
  isStart: false, //是否已经开始游戏
  timer: null,  //计时器
  time: 0,  //时间

  onLoad(option) {
    this.setData({
      difficulty:option.difficulty,
      isAudioPlay:option.isAudioPlay
    })
    this.initNum(this.data.difficulty);
  },

  //开始游戏
  gameStart() {
    if (this.isStart) return;

    this.isStart = true;
    this.isPass = false;
    this.setData({
      m: '00', s: '00', step: 0
    })
    this.disorganize(this.data.numData); // 随机打乱题目顺序
    this.countdown();
  },

  // 重置游戏
  reset() {
    this.isStart = false;
    this.isPass = false;
    this.initNum(this.data.difficulty);
    clearInterval(this.timer);
    this.timer = null;
    this.time = 0;
  },

  // 游戏结束
  gameOver() {
    let numData = this.data.numData;
    // 如果最后一格为空的话 并且 倒数第二格值正确的话，再计算游戏是否结束
    if (numData[numData.length - 1].isEmpty && numData[numData.length - 2].num == numData.length - 1) {
      let isOver = true;
      for (let y in numData) {
        if (numData[y].num != parseInt(y) + 1) {
          isOver = false;
          break;
        }
      }

      if (isOver) {
        let top = wx.getStorageSync('top'),   //更新通过游戏最快时间
          index = this.data.difficulty - 3,
          m = Number(this.data.m),
          s = Number(this.data.s);
        if(m < top[index].m) {
          top[index].m = m
          top[index].s = s
        } 
        else if(m == top[index].m) {
          if(s < top[index].s) {
            top[index].s = s
          }
        }
        wx.setStorage({
          key:'top',
          data:top
        })

        clearInterval(this.timer);
        this.timer = null;
        this.time = 0;
        this.isPass = true;
        this.isStart = false;
        wx.showModal({
          title: '恭喜',
          content: '您已过关！',
          showCancel: false
        })
      }
    }
  },

  // 移动算法
  move(e) {
    if (this.isPass || !this.isStart) return;

    let index = e.currentTarget.dataset.index,
      difficulty = this.data.difficulty,
      numData = this.data.numData,
      step = this.data.step,
      isAudioPlay = this.data.isAudioPlay;

    for (let i in numData) {
      if (index == i) {
        let x = '';
        // 当前点击的 上下左右 方向如果有空位的话，就互换位置
        if (numData[index - difficulty] && numData[index - difficulty].isEmpty) {  // 下
          x = index - difficulty;
        } else if (numData[index + Number(difficulty)] && numData[index + Number(difficulty)].isEmpty) {  // 上
          x = index + Number(difficulty);
        } else if (numData[index - 1] && numData[index - 1].isEmpty) {  // 左
          // 如果是在最左边的话，禁止向左移动
          for (let h = 1; h < difficulty; h++) {
            if (index == difficulty * h) return;
          }
          x = index - 1;
        } else if (numData[index + 1] && numData[index + 1].isEmpty) {  // 右
          // 如果是在最右边的话，禁止向右移动
          for (let h = 1; h < difficulty; h++) {
            if (index == difficulty * h - 1) return;
          }
          x = index + 1;
        } else {
          return; // 没有空位不操作
        }

        [numData[i], numData[x]] = [numData[x], numData[i]];
        step += 1;
        if(isAudioPlay=="true") {
          innerAudioContext.play(); // 移动效果音乐
        }
        
        break;
      }
    }
    this.setData({ step, numData });
    this.gameOver();
  },

  // 初始化题目
  initNum(size) {
    let numData = [];
    for (let i = 1; i < size * size; i++) {
      numData.push({ num: i, isEmpty: false });
    }
    numData.push({ num: size * size, isEmpty: true });
    this.setData({
      m: '00', s: '00', step: 0, numData:numData
    })
  },

  //随机打乱题目顺序
  disorganize(numData) {
    numData.sort(() => { return (0.5 - Math.random()); }); // 随机打乱顺序
    while (!numData[numData.length - 1].isEmpty) {
      numData.sort(() => { return (0.5 - Math.random()); }); // 当前空格在最后一位就退出循环
    }

    let num = 0;
    for (let i = 0; i < numData.length; i++) {
      for (let x = i + 1; x < numData.length; x++) {
        // 计算逆序数总的数量
        if (numData[i].num > numData[x].num) {
          num += 1;
        }
      }
    }

    // 逆序数的数量 必须为偶数才有解
    if (num % 2 == 0) {
      this.setData({ numData });
    } else {
      // 递归调用，直到逆序数的数量为偶数才终止
      this.disorganize(numData);
    }
  },

  // 计时器
  countdown() {
    let that = this;
    clearInterval(that.timer);
    that.timer = null;
    that.timer = setInterval(function () {
      that.time += 1;

      // 超过1小时，游戏结束
      if (that.time > 3600) {
        clearInterval(that.timer);
        that.timer = null;
        that.time = 0;

        wx.showModal({
          title: '超时提示',
          content: '已超时，请重新开始游戏',
          showCancel: false,
          success(res) {
            that.isPass = true;
            that.isStart = false;
            that.setData({
              m: '00',
              s: '00',
              step: 0
            })
          }
        })
        return;
      }

      // 更新分、秒数
      if (that.time < 60) {
        that.setData({
          s: that.time < 10 ? '0' + that.time : that.time,
          m: '00'
        })
      } else {
        let mm = parseInt(that.time / 60);
        let ss = that.time - (mm * 60);
        that.setData({
          m: mm < 10 ? '0' + mm : mm,
          s: ss < 10 ? '0' + ss : ss
        })
      }
    }, 1000)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    return {
      title:"《数字华容道》小游戏（没有广告），快来试试！",
    }
  }
})