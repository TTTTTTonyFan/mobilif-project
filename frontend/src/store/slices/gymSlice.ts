import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GymState, GymListItemDto, GymSearchParamsDto, GymFilters, GetGymListDto } from '../../types/gym';
import { gymAPI } from '../../services/api/gymAPI';

const initialState: GymState = {
  gymList: [],
  loading: false,
  error: null,
  currentCity: '北京',
  searchKeyword: '',
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  supportedCities: [],
  supportedCountries: {},
};

// 异步获取场馆列表
export const fetchGymList = createAsyncThunk(
  'gym/fetchGymList',
  async (params: GymSearchParamsDto, { rejectWithValue }) => {
    try {
      const response = await gymAPI.getGymList(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || '获取场馆列表失败');
    }
  }
);

// 异步获取支持的城市列表
export const fetchSupportedCities = createAsyncThunk(
  'gym/fetchSupportedCities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gymAPI.getSupportedCities();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || '获取城市列表失败');
    }
  }
);

// 异步获取支持的国家列表
export const fetchSupportedCountries = createAsyncThunk(
  'gym/fetchSupportedCountries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await gymAPI.getSupportedCountries();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || '获取国家列表失败');
    }
  }
);

const gymSlice = createSlice({
  name: 'gym',
  initialState,
  reducers: {
    // 设置当前城市
    setCurrentCity: (state, action: PayloadAction<string>) => {
      state.currentCity = action.payload;
      // 城市改变时重置分页
      state.pagination.page = 1;
    },

    // 设置搜索关键词
    setSearchKeyword: (state, action: PayloadAction<string>) => {
      state.searchKeyword = action.payload;
      // 搜索关键词改变时重置分页
      state.pagination.page = 1;
    },

    // 设置筛选条件
    setFilters: (state, action: PayloadAction<GymFilters>) => {
      state.filters = action.payload;
      // 筛选条件改变时重置分页
      state.pagination.page = 1;
    },

    // 清空场馆列表
    clearGymList: (state) => {
      state.gymList = [];
      state.pagination = initialState.pagination;
      state.error = null;
    },

    // 重置筛选条件
    resetFilters: (state) => {
      state.filters = {};
      state.searchKeyword = '';
      state.pagination.page = 1;
    },

    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 获取场馆列表
      .addCase(fetchGymList.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        
        // 如果是第一页，清空现有列表
        if (action.meta.arg.page === 1) {
          state.gymList = [];
        }
      })
      .addCase(fetchGymList.fulfilled, (state, action: PayloadAction<GetGymListDto>) => {
        state.loading = false;
        state.error = null;
        
        const { list, pagination, currentCity } = action.payload;
        
        // 如果是第一页，替换列表；否则追加到现有列表
        if (pagination.page === 1) {
          state.gymList = list;
        } else {
          state.gymList = [...state.gymList, ...list];
        }
        
        state.pagination = pagination;
        state.currentCity = currentCity;
      })
      .addCase(fetchGymList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 获取支持的城市列表
      .addCase(fetchSupportedCities.pending, (state) => {
        // 可以添加加载状态
      })
      .addCase(fetchSupportedCities.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.supportedCities = action.payload;
      })
      .addCase(fetchSupportedCities.rejected, (state, action) => {
        console.error('Failed to fetch supported cities:', action.payload);
      })

      // 获取支持的国家列表
      .addCase(fetchSupportedCountries.pending, (state) => {
        // 可以添加加载状态
      })
      .addCase(fetchSupportedCountries.fulfilled, (state, action: PayloadAction<{ [key: string]: string[] }>) => {
        state.supportedCountries = action.payload;
      })
      .addCase(fetchSupportedCountries.rejected, (state, action) => {
        console.error('Failed to fetch supported countries:', action.payload);
      });
  },
});

export const {
  setCurrentCity,
  setSearchKeyword,
  setFilters,
  clearGymList,
  resetFilters,
  clearError,
} = gymSlice.actions;

export default gymSlice.reducer;