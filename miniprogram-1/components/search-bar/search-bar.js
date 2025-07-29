// components/search-bar/search-bar.js
// 搜索栏组件 - 基于UI设计
Component({
  properties: {
    placeholder: {
      type: String,
      value: '搜索场馆名称、地址'
    },
    value: {
      type: String,
      value: ''
    }
  },

  data: {
    focused: false
  },

  methods: {
    onInput(e) {
      this.triggerEvent('input', {
        value: e.detail.value
      });
    },

    onFocus() {
      this.setData({ focused: true });
      this.triggerEvent('focus');
    },

    onBlur() {
      this.setData({ focused: false });
      this.triggerEvent('blur');
    },

    onFilterTap() {
      this.triggerEvent('filter');
    },

    onClear() {
      this.triggerEvent('input', {
        value: ''
      });
      this.triggerEvent('clear');
    }
  }
});
