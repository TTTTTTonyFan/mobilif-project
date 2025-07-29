import React, { useRef, useEffect } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing } from '../../styles';

interface Props {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
}

const LoadingSpinner: React.FC<Props> = ({
  size = 'medium',
  color = colors.primary,
  style,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = () => {
      spinValue.setValue(0);
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => spin());
    };

    spin();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const spinnerSize = getSize();

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderColor: color + '30',
            borderTopColor: color,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  spinner: {
    borderWidth: 2,
    borderRadius: 50,
  },
});

export default LoadingSpinner;