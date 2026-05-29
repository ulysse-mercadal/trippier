// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BookmarkFilled, MapPin, Sparkles, Users } from '../../../components/icons';
import { useTheme } from '../../../theme/useTheme';

interface PinProps {
  top: number;
  left: number;
  Icon: React.ComponentType<{ size?: number; color?: string; stroke?: number }>;
  bg: string;
  iconColor: string;
  size?: number;
}

/**
 * One floating pin badge in the "save & curate" illustration.
 *
 * @param props - {@link PinProps}.
 * @returns A positioned circular badge with the supplied icon.
 */
const Pin: React.FC<PinProps> = ({ top, left, Icon, bg, iconColor, size = 56 }) => (
  <View
    style={[
      styles.pin,
      {
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
      },
    ]}>
    <Icon size={size * 0.42} color={iconColor} stroke={1.8} />
  </View>
);

/**
 * Hero illustration for the "Save & curate" slide — a constellation of
 * floating pins (bookmark + map pin + sparkles + users) over the
 * emerald-soft hero panel.
 *
 * @returns The composed illustration.
 */
const SaveIllustration: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View style={styles.illu}>
      <Pin
        top={28}
        left={40}
        Icon={BookmarkFilled}
        bg={theme.colors.emerald}
        iconColor={theme.colors.onEmerald}
        size={68}
      />
      <Pin
        top={80}
        left={170}
        Icon={MapPin}
        bg={theme.colors.surface}
        iconColor={theme.colors.emeraldDeep}
        size={52}
      />
      <Pin
        top={156}
        left={70}
        Icon={Sparkles}
        bg={theme.colors.surface}
        iconColor={theme.colors.emeraldDeep}
        size={46}
      />
      <Pin
        top={166}
        left={188}
        Icon={Users}
        bg={theme.colors.surface}
        iconColor={theme.colors.ink}
        size={50}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  illu: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  pin: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#18211d',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});

export default SaveIllustration;
