// components/city-selector/city-selector.js
// 城市选择器组件 - 基于UI设计
Component({
  properties: {
    currentCity: {
      type: String,
      value: '北京'
    },
    venueCount: {
      type: Number,
      value: 0
    }
  },

  data: {
    
  },

  methods: {
    onCityTap() {
      this.triggerEvent('citychange', {
        currentCity: this.data.currentCity
      });
    }
  }
});
