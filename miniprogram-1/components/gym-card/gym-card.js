// components/gym-card/gym-card.js
// 场馆卡片组件 - 支持新的数据结构
Component({
  properties: {
    gym: {
      type: Object,
      value: {}
    }
  },

  data: {
    
  },

  methods: {
    onCardTap() {
      this.triggerEvent('tap', {
        gym: this.data.gym
      });
    },

    formatStatus(status) {
      return status; // 直接返回，数据服务已格式化
    },

    getStatusClass(status) {
      if (status === '营业中') {
        return 'gym-card__status--open';
      } else {
        return 'gym-card__status--closed';
      }
    },

    getBadgeClass(gymType) {
      const typeMap = {
        'crossfit_certified': 'gym-card__badge--crossfit',
        'comprehensive': 'gym-card__badge--comprehensive'
      };
      return typeMap[gymType] || 'gym-card__badge--default';
    },

    getBadgeText(gymType) {
      const textMap = {
        'crossfit_certified': 'CrossFit认证',
        'comprehensive': '综合训练馆'
      };
      return textMap[gymType] || '训练馆';
    },

    getTagClass(programType) {
      const tagMap = {
        'CrossFit': 'gym-card__tag--crossfit',
        '举重': 'gym-card__tag--weightlifting',
        'Hyrox': 'gym-card__tag--hyrox',
        '体操': 'gym-card__tag--gymnastics',
        '拉伸放松': 'gym-card__tag--stretching',
        '瑜伽': 'gym-card__tag--yoga'
      };
      return tagMap[programType] || 'gym-card__tag--default';
    }
  }
});
