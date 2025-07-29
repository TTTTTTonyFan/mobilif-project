import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API基础配置
const API_BASE_URL = __DEV__ 
  ? (Platform.OS === 'ios' ? 'http://localhost:3000' : 'http://10.0.2.2:3000')
  : 'https://api.mobilif.com';

// 统一响应格式
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp: number;
  requestId?: string;
}

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // 添加认证token
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 添加设备信息
      const deviceInfo = await AsyncStorage.getItem('device_info');
      if (deviceInfo) {
        config.headers['X-Device-Info'] = deviceInfo;
      }

      // 添加用户位置信息（如果有）
      const userLocation = await AsyncStorage.getItem('user_location');
      if (userLocation) {
        config.headers['X-User-Location'] = userLocation;
      }

      // 添加请求ID用于追踪
      config.headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      code: data.code,
      message: data.message,
    });

    // 检查业务状态码
    if (data.code !== 0) {
      const error = new Error(data.message || '请求失败');
      (error as any).code = data.code;
      return Promise.reject(error);
    }

    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const { response, request } = error;

    console.error(`[API Error]`, {
      url: request?.responseURL || 'unknown',
      status: response?.status,
      message: response?.data?.message || error.message,
    });

    // 处理网络错误
    if (!response) {
      if (error.code === 'ECONNABORTED') {
        error.message = '请求超时，请检查网络连接';
      } else if (error.message === 'Network Error') {
        error.message = '网络连接失败，请检查网络设置';
      }
      return Promise.reject(error);
    }

    // 处理HTTP状态码错误
    const { status, data } = response;
    
    switch (status) {
      case 401:
        // 未授权，清除token并跳转到登录页
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        // 这里可以发送事件通知应用跳转到登录页
        error.message = data?.message || '登录已过期，请重新登录';
        break;
      
      case 403:
        error.message = data?.message || '权限不足';
        break;
      
      case 404:
        error.message = data?.message || '请求的资源不存在';
        break;
      
      case 422:
        error.message = data?.message || '请求参数错误';
        break;
      
      case 429:
        error.message = data?.message || '请求过于频繁，请稍后再试';
        break;
      
      case 500:
        error.message = data?.message || '服务器内部错误';
        break;
      
      default:
        error.message = data?.message || `请求失败 (${status})`;
    }

    return Promise.reject(error);
  }
);

// 封装常用的HTTP方法
const apiMethods = {
  get: <T = any>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> => 
    apiClient.get(url, config),
  
  post: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> => 
    apiClient.post(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> => 
    apiClient.put(url, data, config),
  
  delete: <T = any>(url: string, config?: any): Promise<AxiosResponse<ApiResponse<T>>> => 
    apiClient.delete(url, config),
  
  patch: <T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<ApiResponse<T>>> => 
    apiClient.patch(url, data, config),
};

export { apiClient, apiMethods as api };
export default apiMethods;