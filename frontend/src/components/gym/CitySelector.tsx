import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { fetchSupportedCities, fetchSupportedCountries } from '../../store/slices/gymSlice';
import { colors, spacing, typography, borderRadius } from '../../styles';

interface Props {
  visible: boolean;
  currentCity: string;
  onCitySelect: (city: string) => void;
  onClose: () => void;
}

// 热门城市数据
const HOT_CITIES = [
  '北京', '上海', '广州', '深圳', '杭州', '成都', 
  '南京', '武汉', '西安', '苏州', '天津', '重庆'
];

// 国家城市数据（示例）
const COUNTRIES_CITIES = {
  '中国': ['北京', '上海', '广州', '深圳', '杭州', '成都', '南京', '武汉', '西安', '苏州'],
  '美国': ['纽约', '洛杉矶', '芝加哥', '休斯顿', '费城', '凤凰城'],
  '英国': ['伦敦', '曼彻斯特', '伯明翰', '利兹', '格拉斯哥'],
  '澳大利亚': ['悉尼', '墨尔本', '布里斯班', '珀斯', '阿德莱德'],
};

const CitySelector: React.FC<Props> = ({
  visible,
  currentCity,
  onCitySelect,
  onClose,
}) => {
  const dispatch = useDispatch();
  const [selectedCountry, setSelectedCountry] = useState<string>('中国');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (visible) {
      // 加载城市数据
      dispatch(fetchSupportedCities() as any);
      dispatch(fetchSupportedCountries() as any);
    }
  }, [visible, dispatch]);

  const handleCityPress = (city: string) => {
    onCitySelect(city);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>选择城市</Text>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHotCities = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>热门城市</Text>
      <View style={styles.cityGrid}>
        {HOT_CITIES.map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.cityItem,
              city === currentCity && styles.selectedCityItem
            ]}
            onPress={() => handleCityPress(city)}
          >
            <Text style={[
              styles.cityText,
              city === currentCity && styles.selectedCityText
            ]}>
              {city}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBreadcrumb = () => (
    <View style={styles.breadcrumb}>
      <Text style={styles.breadcrumbText}>{selectedCountry} &gt; 北京</Text>
    </View>
  );

  const renderCountryTabs = () => (
    <View style={styles.countryTabs}>
      {Object.keys(COUNTRIES_CITIES).map((country) => (
        <TouchableOpacity
          key={country}
          style={[
            styles.countryTab,
            country === selectedCountry && styles.selectedCountryTab
          ]}
          onPress={() => setSelectedCountry(country)}
        >
          <Text style={[
            styles.countryTabText,
            country === selectedCountry && styles.selectedCountryTabText
          ]}>
            {country}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCountryCities = () => {
    const cities = COUNTRIES_CITIES[selectedCountry] || [];
    
    return (
      <View style={styles.cityList}>
        {cities.map((city) => (
          <TouchableOpacity
            key={city}
            style={[
              styles.cityListItem,
              city === currentCity && styles.selectedCityListItem
            ]}
            onPress={() => handleCityPress(city)}
          >
            <View>
              <Text style={[
                styles.cityListText,
                city === currentCity && styles.selectedCityListText
              ]}>
                {city}市
              </Text>
              <Text style={styles.cityListDesc}>
                12个训练场馆
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderBreadcrumb()}
          {renderCountryCities()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    height: 60,
  },
  closeButton: {
    padding: spacing.sm,
    minWidth: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  breadcrumb: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    opacity: 0.7,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  cityItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
  },
  selectedCityItem: {
    backgroundColor: colors.primary,
  },
  cityText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  selectedCityText: {
    color: colors.white,
  },
  countryTabs: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  countryTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedCountryTab: {
    borderBottomColor: colors.primary,
  },
  countryTabText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  selectedCountryTabText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  cityList: {
    // 城市列表样式
  },
  cityListItem: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  selectedCityListItem: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  cityListText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 4,
  },
  selectedCityListText: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  cityListDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  checkmark: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
});

export default CitySelector;