import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { 
  fetchGymList,
  setCurrentCity,
  setSearchKeyword,
  setFilters,
  clearGymList,
} from '../../store/slices/gymSlice';
import { getCurrentLocation } from '../../services/locationService';
import { RootState } from '../../store';
import { GymListItemDto } from '../../types/gym';
import { colors, spacing, typography } from '../../styles';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import GymCard from '../../components/gym/GymCard';
import CitySelector from '../../components/gym/CitySelector';
import FilterModal from '../../components/gym/FilterModal';
import SearchBar from '../../components/common/SearchBar';

interface Props {
  route?: any;
  navigation?: any;
}

const GymList: React.FC<Props> = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const nav = useNavigation();
  
  const {
    gymList,
    loading,
    currentCity,
    searchKeyword,
    filters,
    pagination,
    error,
  } = useSelector((state: RootState) => state.gym);

  const [refreshing, setRefreshing] = useState(false);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    loadGymList();
  }, [currentCity, searchKeyword, filters, userLocation]);

  const initializeLocation = async () => {
    try {
      // 尝试获取用户位置
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
        await AsyncStorage.setItem('userLocation', JSON.stringify(location));
      } else {
        // 如果无法获取位置，从缓存读取
        const cachedLocation = await AsyncStorage.getItem('userLocation');
        if (cachedLocation) {
          setUserLocation(JSON.parse(cachedLocation));
        }
      }
    } catch (error) {
      console.warn('Failed to get user location:', error);
      // 使用默认城市
      if (!currentCity) {
        dispatch(setCurrentCity('北京'));
      }
    }
  };

  const loadGymList = useCallback(async () => {
    try {
      const params = {
        lat: userLocation?.lat,
        lng: userLocation?.lng,
        city: currentCity,
        keyword: searchKeyword,
        ...filters,
        page: 1,
        pageSize: 20,
      };

      await dispatch(fetchGymList(params) as any);
    } catch (error) {
      console.error('Failed to load gym list:', error);
    }
  }, [dispatch, userLocation, currentCity, searchKeyword, filters]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await initializeLocation();
      await loadGymList();
    } finally {
      setRefreshing(false);
    }
  }, [loadGymList]);

  const handleLoadMore = useCallback(async () => {
    if (loading || !pagination.hasNext) return;

    try {
      const params = {
        lat: userLocation?.lat,
        lng: userLocation?.lng,
        city: currentCity,
        keyword: searchKeyword,
        ...filters,
        page: pagination.page + 1,
        pageSize: 20,
      };

      await dispatch(fetchGymList(params) as any);
    } catch (error) {
      console.error('Failed to load more gyms:', error);
    }
  }, [dispatch, loading, pagination, userLocation, currentCity, searchKeyword, filters]);

  const handleSearch = useCallback((keyword: string) => {
    dispatch(setSearchKeyword(keyword));
  }, [dispatch]);

  const handleCityChange = useCallback((city: string) => {
    dispatch(setCurrentCity(city));
    setShowCitySelector(false);
  }, [dispatch]);

  const handleFilterChange = useCallback((newFilters: any) => {
    dispatch(setFilters(newFilters));
    setShowFilterModal(false);
  }, [dispatch]);

  const handleGymPress = useCallback((gym: GymListItemDto) => {
    if (Platform.OS === 'web') {
      // Web端处理
      nav.navigate('GymDetail' as never, { gymId: gym.id } as never);
    } else {
      // React Native处理
      navigation?.navigate('GymDetail', { gymId: gym.id });
    }
  }, [nav, navigation]);

  const renderGymItem = useCallback(({ item, index }: { item: GymListItemDto; index: number }) => (
    <GymCard
      key={item.id}
      gym={item}
      onPress={() => handleGymPress(item)}
      showDistance={!!userLocation}
      style={[
        styles.gymCard,
        index === gymList.length - 1 && styles.lastGymCard
      ]}
    />
  ), [gymList.length, userLocation, handleGymPress]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* 城市选择器 */}
      <TouchableOpacity
        style={styles.citySelector}
        onPress={() => setShowCitySelector(true)}
      >
        <Text style={styles.cityText}>{currentCity}</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {/* 搜索栏 */}
      <SearchBar
        placeholder="搜索场馆名称"
        value={searchKeyword}
        onChangeText={handleSearch}
        style={styles.searchBar}
      />

      {/* 筛选按钮 */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilterModal(true)}
      >
        <Text style={styles.filterButtonText}>筛选</Text>
        {Object.keys(filters).length > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>
              {Object.keys(filters).length}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderContent = () => {
    if (loading && gymList.length === 0) {
      return <LoadingSpinner style={styles.loading} />;
    }

    if (error && gymList.length === 0) {
      return (
        <EmptyState
          title="加载失败"
          description={error}
          actionText="重试"
          onAction={loadGymList}
          style={styles.emptyState}
        />
      );
    }

    if (gymList.length === 0) {
      return (
        <EmptyState
          title="暂无场馆"
          description="当前区域暂无相关场馆，试试切换城市或调整筛选条件"
          actionText="切换城市"
          onAction={() => setShowCitySelector(true)}
          style={styles.emptyState}
        />
      );
    }

    return (
      <ScrollView
        style={styles.gymList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onScrollEndDrag={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            handleLoadMore();
          }
        }}
        showsVerticalScrollIndicator={false}
      >
        {gymList.map((gym, index) => renderGymItem({ item: gym, index }))}
        
        {loading && gymList.length > 0 && (
          <LoadingSpinner style={styles.loadMore} />
        )}
        
        {!pagination.hasNext && gymList.length > 0 && (
          <Text style={styles.endText}>已显示全部场馆</Text>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderContent()}

      {/* 城市选择器模态框 */}
      <CitySelector
        visible={showCitySelector}
        currentCity={currentCity}
        onCitySelect={handleCityChange}
        onClose={() => setShowCitySelector(false)}
      />

      {/* 筛选模态框 */}
      <FilterModal
        visible={showFilterModal}
        filters={filters}
        onApply={handleFilterChange}
        onClose={() => setShowFilterModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  cityText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  dropdownIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  searchBar: {
    marginBottom: spacing.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: spacing.sm,
    position: 'relative',
  },
  filterButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: -spacing.xs,
    right: -spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: spacing.xs,
    minWidth: spacing.md,
    height: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  gymList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  gymCard: {
    marginTop: spacing.md,
  },
  lastGymCard: {
    marginBottom: spacing.lg,
  },
  loading: {
    marginTop: spacing.xl,
  },
  loadMore: {
    marginVertical: spacing.lg,
  },
  emptyState: {
    marginTop: spacing.xl,
  },
  endText: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    paddingVertical: spacing.lg,
  },
});

export default GymList;