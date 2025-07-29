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
import { GymFilters } from '../../types/gym';
import { colors, spacing, typography, borderRadius } from '../../styles';

interface Props {
  visible: boolean;
  filters: GymFilters;
  onApply: (filters: GymFilters) => void;
  onClose: () => void;
}

// 筛选选项配置
const FILTER_OPTIONS = {
  gymType: [
    { value: '', label: '全部类型' },
    { value: 'crossfit_certified', label: 'CrossFit认证场馆' },
    { value: 'comprehensive', label: '综合训练馆' },
    { value: 'specialty', label: '专项训练馆' },
  ],
  programs: [
    { value: 'CrossFit', label: 'CrossFit' },
    { value: 'Olympic Lifting', label: 'Olympic Lifting' },
    { value: 'Hyrox', label: 'Hyrox' },
    { value: 'Gymnastics', label: 'Gymnastics' },
    { value: 'Powerlifting', label: 'Powerlifting' },
    { value: 'Functional Fitness', label: 'Functional Fitness' },
  ],
  sortBy: [
    { value: 'distance', label: '距离优先' },
    { value: 'rating', label: '评分优先' },
    { value: 'name', label: '名称排序' },
  ],
};

const FilterModal: React.FC<Props> = ({
  visible,
  filters,
  onApply,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<GymFilters>(filters);

  useEffect(() => {
    if (visible) {
      setLocalFilters(filters);
    }
  }, [visible, filters]);

  const handleGymTypeChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      gymType: value || undefined,
    }));
  };

  const handleProgramToggle = (program: string) => {
    setLocalFilters(prev => {
      const currentPrograms = prev.programs || [];
      const newPrograms = currentPrograms.includes(program)
        ? currentPrograms.filter(p => p !== program)
        : [...currentPrograms, program];
      
      return {
        ...prev,
        programs: newPrograms.length > 0 ? newPrograms : undefined,
      };
    });
  };

  const handleSortByChange = (value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      sortBy: value,
    }));
  };

  const handleReset = () => {
    setLocalFilters({});
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} style={styles.headerButton}>
        <Text style={styles.cancelText}>取消</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>筛选</Text>
      <TouchableOpacity onPress={handleReset} style={styles.headerButton}>
        <Text style={styles.resetText}>重置</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGymTypeFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>场馆类型</Text>
      <View style={styles.optionsList}>
        {FILTER_OPTIONS.gymType.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionItem,
              (localFilters.gymType || '') === option.value && styles.selectedOption
            ]}
            onPress={() => handleGymTypeChange(option.value)}
          >
            <Text style={[
              styles.optionText,
              (localFilters.gymType || '') === option.value && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
            {(localFilters.gymType || '') === option.value && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderProgramsFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>课程类型</Text>
      <View style={styles.tagsContainer}>
        {FILTER_OPTIONS.programs.map((option) => {
          const isSelected = (localFilters.programs || []).includes(option.value);
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.tagItem,
                isSelected && styles.selectedTag
              ]}
              onPress={() => handleProgramToggle(option.value)}
            >
              <Text style={[
                styles.tagText,
                isSelected && styles.selectedTagText
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderSortByFilter = () => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>排序方式</Text>
      <View style={styles.optionsList}>
        {FILTER_OPTIONS.sortBy.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.optionItem,
              (localFilters.sortBy || 'distance') === option.value && styles.selectedOption
            ]}
            onPress={() => handleSortByChange(option.value)}
          >
            <Text style={[
              styles.optionText,
              (localFilters.sortBy || 'distance') === option.value && styles.selectedOptionText
            ]}>
              {option.label}
            </Text>
            {(localFilters.sortBy || 'distance') === option.value && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.applyButton}
        onPress={handleApply}
      >
        <Text style={styles.applyButtonText}>应用筛选</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderGymTypeFilter()}
          {renderProgramsFilter()}
          {renderSortByFilter()}
        </ScrollView>
        
        {renderFooter()}
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
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerButton: {
    padding: spacing.xs,
    minWidth: 50,
  },
  cancelText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  resetText: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  filterSection: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    paddingVertical: spacing.lg,
  },
  filterTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  optionsList: {
    paddingHorizontal: spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  selectedOption: {
    backgroundColor: colors.primary + '10',
  },
  optionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
  },
  selectedOptionText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  checkmark: {
    fontSize: typography.fontSize.base,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginHorizontal: -spacing.xs,
  },
  tagItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedTag: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  selectedTagText: {
    color: colors.white,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});

export default FilterModal;