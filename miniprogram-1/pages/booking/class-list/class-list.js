// pages/booking/class-list/class-list.js
Page({
  data: {
    gymId: null
  },
  
  onLoad: function (options) {
    this.setData({
      gymId: options.gymId
    });
  }
});