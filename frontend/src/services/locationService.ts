import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export interface LocationCoords {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

// 位置权限检查和请求
export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    // Web平台处理
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.permissions.query({ name: 'geolocation' }).then((permission) => {
          resolve(permission.state === 'granted' || permission.state === 'prompt');
        }).catch(() => {
          resolve(false);
        });
      } else {
        resolve(false);
      }
    });
  }

  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '位置权限申请',
          message: 'MobiLiF需要访问您的位置信息来查找附近的健身场馆',
          buttonNeutral: '稍后询问',
          buttonNegative: '拒绝',
          buttonPositive: '允许',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Failed to request location permission:', err);
      return false;
    }
  }

  // iOS不需要显式请求权限，会在第一次使用时自动弹出
  return true;
};

// 获取当前位置
export const getCurrentLocation = async (options?: {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}): Promise<LocationCoords | null> => {
  const {
    timeout = 15000,
    maximumAge = 300000, // 5分钟
    enableHighAccuracy = true,
  } = options || {};

  // 检查权限
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    throw new Error('位置权限被拒绝');
  }

  if (Platform.OS === 'web') {
    // Web平台处理
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('当前设备不支持地理定位'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let message = '获取位置信息失败';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = '位置权限被拒绝';
              break;
            case error.POSITION_UNAVAILABLE:
              message = '位置信息不可用';
              break;
            case error.TIMEOUT:
              message = '获取位置信息超时';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }

  // React Native处理
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = '获取位置信息失败';
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            message = '位置权限被拒绝';
            break;
          case 2: // POSITION_UNAVAILABLE
            message = '位置信息不可用';
            break;
          case 3: // TIMEOUT
            message = '获取位置信息超时';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );
  });
};

// 监听位置变化
export const watchPosition = (
  callback: (location: LocationCoords) => void,
  errorCallback?: (error: LocationError) => void,
  options?: {
    timeout?: number;
    maximumAge?: number;
    enableHighAccuracy?: boolean;
    distanceFilter?: number;
  }
) => {
  const {
    timeout = 15000,
    maximumAge = 60000, // 1分钟
    enableHighAccuracy = true,
    distanceFilter = 100, // 100米
  } = options || {};

  if (Platform.OS === 'web') {
    if (!('geolocation' in navigator)) {
      errorCallback?.({ code: -1, message: '当前设备不支持地理定位' });
      return null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = '获取位置信息失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = '位置权限被拒绝';
            break;
          case error.POSITION_UNAVAILABLE:
            message = '位置信息不可用';
            break;
          case error.TIMEOUT:
            message = '获取位置信息超时';
            break;
        }
        errorCallback?.({ code: error.code, message });
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }

  // React Native处理
  const watchId = Geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => {
      let message = '获取位置信息失败';
      switch (error.code) {
        case 1: // PERMISSION_DENIED
          message = '位置权限被拒绝';
          break;
        case 2: // POSITION_UNAVAILABLE
          message = '位置信息不可用';
          break;
        case 3: // TIMEOUT
          message = '获取位置信息超时';
          break;
      }
      errorCallback?.({ code: error.code, message });
    },
    {
      enableHighAccuracy,
      timeout,
      maximumAge,
      distanceFilter,
    }
  );

  return () => Geolocation.clearWatch(watchId);
};

// 计算两点间距离（单位：公里）
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // 地球半径，单位：公里
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // 保留2位小数
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

// 位置服务配置
export const locationConfig = {
  // 默认配置
  defaultTimeout: 15000,
  defaultMaximumAge: 300000,
  defaultEnableHighAccuracy: true,
  
  // 缓存配置
  cacheMaxAge: 300000, // 5分钟
  cacheKey: 'cached_location',
  
  // 权限提示文案
  permissionMessages: {
    title: '位置权限申请',
    message: 'MobiLiF需要访问您的位置信息来查找附近的健身场馆',
    buttonNeutral: '稍后询问',
    buttonNegative: '拒绝',
    buttonPositive: '允许',
  },
};