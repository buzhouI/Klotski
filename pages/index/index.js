Page({

  /**
   * 页面的初始数据
   */
  data: {
    difficulty: 3,    // 当前难度系数, 默认值为3 
    isAudioPlay: true,   //是否播放滑块移动音效
    top:[                 //每个难度过关的最快速度
      {difficulty:3,m:60,s:60},//分：秒，限定小于1小时
      {difficulty:4,m:60,s:60},
      {difficulty:5,m:60,s:60},
      {difficulty:6,m:60,s:60},
      {difficulty:7,m:60,s:60},
      {difficulty:8,m:60,s:60}
    ]
  },

  //开始游戏
  goGame: function () {
    wx.navigateTo({
      url:`/pages/game/game?difficulty=${this.data.difficulty}&isAudioPlay=${this.data.isAudioPlay}`
    })
  },

  //难度选择
  difficulty: function () {
    let that = this, difficulty = this.data.difficulty
    wx.showActionSheet({
      itemList: ['3 x 3','4 x 4','5 × 5', '6 × 6', '7 × 7', '8 × 8'],
      success(res) {
        if (res.tapIndex + 3 != difficulty) {
          that.setData({ difficulty: res.tapIndex + 3 })
        }
      }
    })
  },

  //Top榜
  top: function () {
    wx.navigateTo({
      url: `/pages/top/top`
    })
  },

  //音效开关
  turnAudio: function () {
    this.setData({
      isAudioPlay:!this.data.isAudioPlay
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getStorage({//第一次进入游戏，创建top榜数据格式，并存入缓存
      key:"top",  //缓存中的数据大约只能储存7天
      fail (res) {
        wx.setStorage({
          key:"top",
          data:that.data.top
          })
        }
    })
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