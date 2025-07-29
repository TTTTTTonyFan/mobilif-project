// 颜色系统
export const colors = {
  // 主色调
  primary: '#FF6B00',
  primaryLight: '#FF8533',
  primaryDark: '#CC5500',
  
  // 辅助色
  secondary: '#00A8FF',
  secondaryLight: '#33B9FF',
  secondaryDark: '#0087CC',
  
  // 状态色
  success: '#2ED573',
  successLight: '#57E089',
  successDark: '#25AA5C',
  
  warning: '#FFA726',
  warningLight: '#FFB951',
  warningDark: '#CC851E',
  
  error: '#FF3838',
  errorLight: '#FF5C5C',
  errorDark: '#CC2D2D',
  
  info: '#2196F3',
  infoLight: '#47A6F5',
  infoDark: '#1B78C2',
  
  // 中性色
  white: '#FFFFFF',
  black: '#000000',
  
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // 背景色
  background: '#F8F9FA',
  surface: '#FFFFFF',
  
  // 边框色
  border: '#E0E0E0',
  divider: '#F0F0F0',
  
  // 文本色
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
  },
  
  // 透明度变体
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
};

// 间距系统
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// 字体系统
export const typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
  },
  
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// 圆角系统
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

// 阴影系统
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  
  xl: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16,
  },
};

// 动画时长
export const animations = {
  duration: {
    fast: 150,
    normal: 250,
    slow: 350,
  },
  
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// 布局相关
export const layout = {
  // 容器最大宽度
  maxWidth: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // 标准间距
  gutter: spacing.md,
  
  // 安全区域
  safeArea: {
    top: 44, // iOS状态栏高度
    bottom: 34, // iOS底部安全区域
  },
};

// 响应式断点
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

// 导出所有样式常量
export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  animations,
  layout,
  breakpoints,
};