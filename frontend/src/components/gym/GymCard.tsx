import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { GymListItemDto } from '../../types/gym';
import { colors, spacing, typography, borderRadius } from '../../styles';

interface Props {
  gym: GymListItemDto;
  onPress: () => void;
  showDistance?: boolean;
  style?: ViewStyle;
}

const GymCard: React.FC<Props> = ({ gym, onPress, showDistance = false, style }) => {
  const renderBusinessStatus = () => {
    const isOpen = gym.businessStatus === '营业中';
    return (
      <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
        <Text style={[styles.statusText, isOpen ? styles.openText : styles.closedText]}>
          {gym.businessStatus}
        </Text>
      </View>
    );
  };

  const renderGymType = () => {
    const isCertified = gym.crossfitCertified;
    return (
      <View style={[styles.typeBadge, isCertified ? styles.certifiedBadge : styles.comprehensiveBadge]}>
        <Text style={[styles.typeText, isCertified ? styles.certifiedText : styles.comprehensiveText]}>
          {gym.gymType}
        </Text>
      </View>
    );
  };

  const renderProgramTags = () => {
    if (!gym.supportedPrograms || gym.supportedPrograms.length === 0) {
      return null;
    }

    return (
      <View style={styles.programContainer}>
        {gym.supportedPrograms.slice(0, 3).map((program, index) => (
          <View key={index} style={styles.programTag}>
            <Text style={styles.programText}>{program}</Text>
          </View>
        ))}
        {gym.supportedPrograms.length > 3 && (
          <Text style={styles.morePrograms}>+{gym.supportedPrograms.length - 3}</Text>
        )}
      </View>
    );
  };

  const renderRating = () => (
    <View style={styles.ratingContainer}>
      <Text style={styles.ratingText}>⭐ {gym.rating.toFixed(1)}</Text>
      <Text style={styles.reviewText}>({gym.reviewCount}条评价)</Text>
    </View>
  );

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* 场馆图片 */}
      <View style={styles.imageContainer}>
        {gym.images && gym.images.length > 0 ? (
          <Image source={{ uri: gym.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🏃‍♂️</Text>
          </View>
        )}
        
        {/* 认证标志 */}
        {gym.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓</Text>
          </View>
        )}
        
        {/* 推荐标志 */}
        {gym.featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>推荐</Text>
          </View>
        )}
      </View>

      {/* 场馆信息 */}
      <View style={styles.infoContainer}>
        {/* 第一行：场馆名称和营业状态 */}
        <View style={styles.headerRow}>
          <Text style={styles.gymName} numberOfLines={1}>
            {gym.name}
          </Text>
          {renderBusinessStatus()}
        </View>

        {/* 第二行：地址和距离 */}
        <View style={styles.locationRow}>
          <Text style={styles.address} numberOfLines={1}>
            📍 {gym.city}-{gym.district}
          </Text>
          {showDistance && gym.distance !== null && (
            <Text style={styles.distance}>{gym.distance}km</Text>
          )}
        </View>

        {/* 第三行：营业时间 */}
        <Text style={styles.hours} numberOfLines={1}>
          🕐 {gym.todayHours}
        </Text>

        {/* 第四行：场馆类型和评分 */}
        <View style={styles.detailRow}>
          {renderGymType()}
          {renderRating()}
        </View>

        {/* 第五行：支持的课程标签 */}
        {renderProgramTags()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  verifiedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  featuredText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  infoContainer: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  gymName: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  openBadge: {
    backgroundColor: colors.success + '20',
  },
  closedBadge: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  openText: {
    color: colors.success,
  },
  closedText: {
    color: colors.error,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  address: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
  distance: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  hours: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  certifiedBadge: {
    backgroundColor: colors.warning + '20',
  },
  comprehensiveBadge: {
    backgroundColor: colors.info + '20',
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  certifiedText: {
    color: colors.warning,
  },
  comprehensiveText: {
    color: colors.info,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.xs,
  },
  reviewText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  programContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  programTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  programText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  morePrograms: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
});

export default GymCard;