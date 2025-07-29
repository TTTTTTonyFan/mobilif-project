import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../styles';

interface Props extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  onClear?: () => void;
  showClearButton?: boolean;
}

const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  placeholder = '搜索...',
  style,
  onClear,
  showClearButton = true,
  ...props
}) => {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.hint}
          returnKeyType="search"
          clearButtonMode="never" // 使用自定义清除按钮
          {...props}
        />
        
        {showClearButton && value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.clearIcon}>
              <View style={styles.clearIconLine1} />
              <View style={styles.clearIconLine2} />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 40,
    position: 'relative',
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    padding: 0, // 移除默认padding
  },
  clearButton: {
    marginLeft: spacing.xs,
    padding: spacing.xs,
  },
  clearIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clearIconLine1: {
    position: 'absolute',
    width: 12,
    height: 1,
    backgroundColor: colors.text.secondary,
    transform: [{ rotate: '45deg' }],
  },
  clearIconLine2: {
    position: 'absolute',
    width: 12,
    height: 1,
    backgroundColor: colors.text.secondary,
    transform: [{ rotate: '-45deg' }],
  },
});

export default SearchBar;