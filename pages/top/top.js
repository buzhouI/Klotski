// pages/top/top.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    top: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let top = wx.getStorageSync('top')
    this.setData({
      top:top
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