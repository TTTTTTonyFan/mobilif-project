import { apiClient } from './client';
import { GymSearchParamsDto, GetGymListDto } from '../../types/gym';

export const gymAPI = {
  // 获取场馆列表
  async getGymList(params: GymSearchParamsDto) {
    const response = await apiClient.get<GetGymListDto>('/api/gyms', { params });
    return response;
  },

  // 获取支持的城市列表
  async getSupportedCities() {
    const response = await apiClient.get<string[]>('/api/gyms/cities');
    return response;
  },

  // 获取支持的国家列表
  async getSupportedCountries() {
    const response = await apiClient.get<{ [key: string]: string[] }>('/api/gyms/countries');
    return response;
  },
};