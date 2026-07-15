// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Eyebrow from '../../components/Eyebrow';
import IconButton from '../../components/IconButton';
import MapTilerMap from '../../components/MapTilerMap';
import Meta from '../../components/Meta';
import SourcesSection from './SourcesSection';
import Tag from '../../components/Tag';
import TitleDot from '../../components/TitleDot';
import {
  ArrowLeft,
  Bookmark,
  Clock,
  ExternalLink,
  Globe,
  MapPin as MapPinIcon,
  Phone,
  Share,
} from '../../components/icons';
import { useTheme } from '../../theme/useTheme';
import type { DiscoverStackParamList } from '../../navigation/types';
import type { PoiType } from '../../api/pois';

type Nav = NativeStackNavigationProp<DiscoverStackParamList, 'PoiDetail'>;
type Props = NativeStackScreenProps<DiscoverStackParamList, 'PoiDetail'>['route'];

/**
 * Geometry constants mirrored from the Discover screen so the POI detail
 * map renders inside the **exact same** rectangle as the default-open
 * Discover cutout. Kept in lockstep with DiscoverScreen's SEARCH_BAR_H +
 * FRAME — if either of those moves there, they move here too.
 */
const SEARCH_BAR_H = 52;
const FRAME = 12;
/**
 * Default-open Discover drawer covers 2/3 of the useful vertical space,
 * leaving 1/3 for the map cutout. We reuse the same denominator here so
 * the detail map keeps the same on-screen footprint as the framed map on
 * the previous screen.
 */
const MAP_HEIGHT_FRACTION = 1 / 3;
/** Tilt the camera into a strong 3D angle so buildings stand up. */
const MAP_PITCH_DEG = 60;
/** Zoom level for the orbiting camera — close enough to read the area. */
const MAP_ZOOM = 17;

/**
 * Maps the public-API POI type to the human-readable eyebrow label.
 *
 * @param type - POI category as returned by the API.
 * @returns A short capitalised label.
 */
function typeEyebrow(type: PoiType): string {
  switch (type) {
    case 'see':
      return 'Monument · Sight';
    case 'eat':
      return 'Restaurant';
    case 'drink':
      return 'Bar · Café';
    case 'do':
      return 'Activity';
    case 'buy':
      return 'Market · Shop';
    case 'sleep':
      return 'Stay';
    case 'event':
      return 'Event';
    case 'generic':
    default:
      return 'Place';
  }
}

interface ContactSectionProps {
  contact?: {
    website?: string;
    phone?: string;
    email?: string;
    opening_hours?: string;
  };
  onOpen: (url: string) => void;
}

/**
 * Detail-screen "Contact" section. Renders one row per non-empty contact
 * field. Tappable rows (website / phone / email) launch the matching system
 * intent (browser, dialer, mail composer). Opening hours is informational
 * only. The section hides itself when nothing relevant is set.
 *
 * @param props - {@link ContactSectionProps}.
 * @returns The Contact card, or `null` when the bundle is empty.
 */
const ContactSection: React.FC<ContactSectionProps> = ({ contact, onOpen }) => {
  const { theme } = useTheme();
  if (!contact) {return null;}
  const rows: Array<{
    key: string;
    label: string;
    value: string;
    icon: React.ReactNode;
    href?: string;
  }> = [];
  if (contact.website) {
    rows.push({
      key: 'website',
      label: 'Website',
      value: contact.website.replace(/^https?:\/\//, ''),
      icon: <Globe size={15} color={theme.colors.mute} />,
      href: contact.website,
    });
  }
  if (contact.phone) {
    rows.push({
      key: 'phone',
      label: 'Phone',
      value: contact.phone,
      icon: <Phone size={15} color={theme.colors.mute} />,
      href: `tel:${contact.phone.replace(/\s+/g, '')}`,
    });
  }
  if (contact.email) {
    rows.push({
      key: 'email',
      label: 'Email',
      value: contact.email,
      icon: <ExternalLink size={15} color={theme.colors.mute} />,
      href: `mailto:${contact.email}`,
    });
  }
  if (contact.opening_hours) {
    rows.push({
      key: 'hours',
      label: 'Hours',
      value: contact.opening_hours,
      icon: <Clock size={15} color={theme.colors.mute} />,
    });
  }
  if (rows.length === 0) {return null;}
  return (
    <View style={styles.contactWrapper}>
      <Eyebrow>Contact</Eyebrow>
      <Card variant="flat" style={styles.contactCard}>
        {rows.map((r, idx) => {
          const inner = (
            <View
              style={[
                styles.contactRow,
                idx > 0 && {
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.line,
                },
              ]}>
              <View style={styles.contactLeft}>
                {r.icon}
                <Text
                  style={[
                    styles.contactLabel,
                    {
                      color: theme.colors.mute,
                      fontFamily: theme.fonts.display,
                    },
                  ]}>
                  {r.label}
                </Text>
              </View>
              <Text
                style={[
                  styles.contactValue,
                  { color: theme.colors.ink, fontFamily: theme.fonts.display },
                ]}
                numberOfLines={1}>
                {r.value}
              </Text>
            </View>
          );
          if (!r.href) {
            return <View key={r.key}>{inner}</View>;
          }
          return (
            <Pressable
              key={r.key}
              onPress={() => onOpen(r.href!)}
              accessibilityRole="link"
              accessibilityLabel={`Open ${r.label}: ${r.value}`}
              android_ripple={{ color: theme.colors.line }}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              {inner}
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
};

/**
 * POI detail screen reached from the Discover drawer. Hero carousel that
 * cycles a live rotating map slide followed by every gallery image the
 * provider exposed; below the carousel comes the eyebrow + dotted title,
 * an optional description, a compact lat/lng line, a Contact card (when
 * the POI carries one) and the Sources accordion. A sticky action pair at
 * the bottom offers Directions + Save-to-trip.
 *
 * When the POI lacks coordinates the map slide is skipped — the carousel
 * still works, just starting on the first image, and the lat/lng line
 * disappears entirely.
 *
 * @returns The POI detail screen.
 */
type Slide =
  | { kind: 'map' }
  | { kind: 'image'; url: string };

const PoiDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Props>();
  const insets = useSafeAreaInsets();
  const { height: windowH, width: windowW } = useWindowDimensions();
  const [rootH, setRootH] = useState(windowH);
  const [slideIndex, setSlideIndex] = useState(0);
  const {
    name,
    type,
    lat,
    lng,
    description,
    thumbnail,
    images,
    contact,
    sources,
    wikidataId,
  } = route.params;
  const hasCoords = typeof lat === 'number' && typeof lng === 'number';

  // Mirror the Discover screen's frame math so the map rectangle here is
  // pixel-aligned with the framed cutout the user just left. See
  // DiscoverScreen for the original derivation of each constant.
  const safeTop = insets.top > 0 ? insets.top : 12;
  const searchTopOffset = safeTop + 14;
  const cutoutTop = searchTopOffset + SEARCH_BAR_H + FRAME;
  const usefulH = Math.max(0, rootH - cutoutTop);
  const mapH = usefulH * MAP_HEIGHT_FRACTION;
  const carouselW = windowW - FRAME * 2;

  // Build the slide deck: rotating live map first (when geolocated), then
  // thumbnail, then any additional gallery images. Dedupe so the lead
  // thumbnail isn't repeated as the second slide when it's already part of
  // `images`. Slide deck stays stable across re-renders so the FlatList
  // doesn't reset its scroll offset on every prop change.
  const slides = useMemo<Slide[]>(() => {
    const out: Slide[] = [];
    if (hasCoords) {
      out.push({ kind: 'map' });
    }
    const seen = new Set<string>();
    const pushImage = (url?: string): void => {
      if (!url || seen.has(url)) {return;}
      seen.add(url);
      out.push({ kind: 'image', url });
    };
    pushImage(thumbnail);
    if (images) {
      for (const url of images) { pushImage(url); }
    }
    return out;
  }, [hasCoords, thumbnail, images]);

  const handleCarouselScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (carouselW <= 0) {return;}
      const idx = Math.round(e.nativeEvent.contentOffset.x / carouselW);
      setSlideIndex(prev => (prev === idx ? prev : idx));
    },
    [carouselW],
  );

  const openLink = useCallback(async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Can't open this link", url);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Can't open this link", url);
    }
  }, []);

  return (
    <View
      style={[styles.root, { backgroundColor: theme.colors.bg }]}
      onLayout={e => {
        const h = e.nativeEvent.layout.height;
        if (h > 0 && h !== rootH) {setRootH(h);}
      }}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.media,
            {
              marginTop: cutoutTop,
              height: mapH,
              borderRadius: theme.radii.xl,
              backgroundColor: theme.colors.emeraldSoft,
            },
            theme.shadows.e1,
          ]}>
          {slides.length === 0 ? null : (
            <FlatList
              data={slides}
              keyExtractor={(s, i) =>
                s.kind === 'map' ? 'map' : `${i}:${s.url}`
              }
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleCarouselScroll}
              scrollEventThrottle={32}
              renderItem={({ item }) =>
                item.kind === 'map' ? (
                  <View style={{ width: carouselW, height: mapH }}>
                    <MapTilerMap
                      center={{ lat: lat!, lng: lng! }}
                      zoom={MAP_ZOOM}
                      pitch={MAP_PITCH_DEG}
                      autoRotate
                      markers={[{ id: 'poi-self', lat: lat!, lng: lng! }]}
                      staticPreview
                    />
                  </View>
                ) : (
                  <Image
                    source={{ uri: item.url }}
                    style={{ width: carouselW, height: mapH }}
                    resizeMode="cover"
                  />
                )
              }
            />
          )}
          <View pointerEvents="box-none" style={styles.mediaTags}>
            <Tag variant="ink">{typeEyebrow(type)}</Tag>
            {hasCoords ? (
              <Tag variant="emerald" dot>
                Located
              </Tag>
            ) : null}
          </View>
          {slides.length > 1 ? (
            <View pointerEvents="none" style={styles.dots}>
              {slides.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor:
                        i === slideIndex
                          ? theme.colors.onEmerald
                          : 'rgba(255,255,255,0.45)',
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          <Eyebrow>{typeEyebrow(type)}</Eyebrow>
          <Text
            style={[
              styles.h1,
              { color: theme.colors.ink, fontFamily: theme.fonts.display },
            ]}>
            {name}
            <TitleDot />
          </Text>

          {description ? (
            <Text
              style={[
                styles.bodyText,
                { color: theme.colors.ink2, fontFamily: theme.fonts.display },
              ]}>
              {description}
            </Text>
          ) : (
            <Meta>
              We don't have a description yet — open in maps or save it to a
              trip and we'll keep enriching it in the background.
            </Meta>
          )}

          {hasCoords ? (
            <View style={styles.coordsLine}>
              <MapPinIcon size={13} color={theme.colors.mute} />
              <Text
                style={[
                  styles.coordsText,
                  {
                    color: theme.colors.mute,
                    fontFamily: theme.fonts.mono,
                  },
                ]}>
                {lat!.toFixed(4)} · {lng!.toFixed(4)}
              </Text>
            </View>
          ) : null}

          <ContactSection contact={contact} onOpen={openLink} />

          <SourcesSection sources={sources} wikidataId={wikidataId} />
        </View>
      </ScrollView>

      <View
        pointerEvents="box-none"
        style={[styles.headerButtons, { top: searchTopOffset }]}>
        <IconButton
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={theme.colors.ink} />
        </IconButton>
        <IconButton accessibilityLabel="Share">
          <Share size={18} color={theme.colors.ink} />
        </IconButton>
      </View>

      <View
        style={[
          styles.stickyActions,
          {
            backgroundColor: theme.colors.bg,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          },
        ]}>
        <Button
          variant="outline"
          label="Directions"
          icon={<MapPinIcon size={17} color={theme.colors.ink} />}
          style={styles.actionLeft}
        />
        <Button
          label="Save to trip"
          icon={<Bookmark size={17} color={theme.colors.onEmerald} />}
          style={styles.actionRight}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 110,
  },
  media: {
    marginHorizontal: FRAME,
    overflow: 'hidden',
  },
  headerButtons: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaTags: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 22,
    gap: 12,
  },
  h1: {
    fontWeight: '700',
    fontSize: 32,
    letterSpacing: -0.96,
    marginTop: 8,
  },
  bodyText: {
    fontSize: 14.5,
    lineHeight: 22,
    marginTop: 4,
  },
  coordsLine: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coordsText: {
    fontSize: 12.5,
    letterSpacing: -0.1,
  },
  dots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  contactWrapper: {
    marginTop: 18,
    gap: 8,
  },
  contactCard: {
    marginTop: 4,
    overflow: 'hidden',
  },
  contactRow: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.15,
    flexShrink: 1,
    textAlign: 'right',
  },
  stickyActions: {
    paddingHorizontal: 18,
    paddingTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  actionLeft: {
    flex: 1,
  },
  actionRight: {
    flex: 1.3,
  },
});

export default PoiDetailScreen;
