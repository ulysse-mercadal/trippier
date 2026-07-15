// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import Card from '../../components/Card';
import Eyebrow from '../../components/Eyebrow';
import { ChevronDown, ExternalLink, Globe } from '../../components/icons';
import { useTheme } from '../../theme/useTheme';
import type { PoiSourceLink } from '../../navigation/types';
import { providerLabel } from './poiSources';

export interface SourcesSectionProps {
  sources?: PoiSourceLink[];
  /**
   * Optional Wikidata Q-id. When set, an extra "Wikidata" link is appended
   * to the section even though Wikidata is not itself a Provider.
   */
  wikidataId?: string;
}

interface RowDef {
  key: string;
  label: string;
  url: string;
}

/** Fixed embedded preview height — tall enough to read a headline + lead
 *  paragraph on Wikipedia-style pages without dominating the detail screen. */
const PREVIEW_HEIGHT = 460;
/** Chevron rotation duration when expanding / collapsing — kept short so it
 *  feels like a single gesture together with the LayoutAnimation. */
const CHEVRON_MS = 200;

/**
 * Forces the embedded page to lay out against the WebView's own pixel width
 * instead of the device-width that some sites assume by default. Injected
 * *before* the page's own scripts run — the override sticks even when the
 * page sets its own viewport meta later (we overwrite the attribute again
 * on DOMContentLoaded as a safety net for SPAs that mutate `<head>` late).
 */
const VIEWPORT_FIX_JS = `
  (function() {
    function applyViewport() {
      var existing = document.querySelector('meta[name=viewport]');
      if (existing) { existing.remove(); }
      var meta = document.createElement('meta');
      meta.setAttribute('name', 'viewport');
      meta.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes'
      );
      (document.head || document.documentElement).appendChild(meta);
      if (!document.getElementById('__rn_preview_fit')) {
        var style = document.createElement('style');
        style.id = '__rn_preview_fit';
        // Pages with implicit min-widths (sidebars, fixed-px tables, oversized
        // images) cause a few pixels of horizontal overflow even when the
        // viewport meta is correct. Clamp everything to the WebView width and
        // hide horizontal scroll — vertical scroll is preserved.
        style.textContent =
          'html, body { max-width: 100vw !important; overflow-x: hidden !important; } ' +
          'body { margin: 0 !important; } ' +
          'img, video, iframe, table, pre { max-width: 100% !important; height: auto !important; }';
        (document.head || document.documentElement).appendChild(style);
      }
    }
    // Mobile Wikipedia / Wikivoyage collapse every section by default. When
    // the URL carries a #fragment pointing inside a collapsed section, the
    // browser's native scroll-to-anchor lands at the (still-collapsed)
    // heading instead of the actual content. We open every collapsible
    // block, then re-fire scrollIntoView on the fragment target so the
    // preview lands exactly where the source URL points.
    function expandAndScrollToFragment() {
      try {
        var headings = document.querySelectorAll(
          '.collapsible-heading.collapsed, .section-heading.collapsed'
        );
        for (var i = 0; i < headings.length; i++) {
          try { headings[i].click(); } catch (_) {}
        }
      } catch (_) {}
      var hash = window.location.hash;
      if (!hash || hash.length < 2) { return; }
      var id = decodeURIComponent(hash.slice(1));
      var target =
        document.getElementById(id) ||
        document.querySelector('[id="' + id.replace(/"/g, '\\\\"') + '"]') ||
        document.querySelector('a[name="' + id.replace(/"/g, '\\\\"') + '"]');
      if (target && target.scrollIntoView) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    }
    applyViewport();
    document.addEventListener('DOMContentLoaded', function() {
      applyViewport();
      // Wikipedia hydrates collapsible sections after DOMContentLoaded, so
      // retry on a couple of frames before giving up.
      setTimeout(expandAndScrollToFragment, 50);
      setTimeout(expandAndScrollToFragment, 400);
      setTimeout(expandAndScrollToFragment, 1200);
    });
    window.addEventListener('load', expandAndScrollToFragment);
  })();
  true;
`;

/**
 * Rewrites known-provider URLs to their mobile-friendly variants so the
 * embedded WebView shows a layout actually designed for narrow viewports.
 * Wikipedia and Wikivoyage have first-party mobile subdomains
 * (`en.m.wikipedia.org`) that ship a much lighter, single-column layout
 * than `en.wikipedia.org`'s responsive desktop template. The "Open in
 * browser" affordance still points to the *original* canonical URL so we
 * never trap the user on the mobile subdomain.
 *
 * @param url - The canonical source URL coming from the API.
 * @returns A URL suitable for in-app preview.
 */
function toPreviewUrl(url: string): string {
  try {
    const u = new URL(url);
    if (
      (u.hostname.endsWith('.wikipedia.org') ||
        u.hostname.endsWith('.wikivoyage.org')) &&
      !u.hostname.startsWith('m.') &&
      !u.hostname.includes('.m.')
    ) {
      const [lang, ...rest] = u.hostname.split('.');
      u.hostname = [lang, 'm', ...rest].join('.');
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

// LayoutAnimation requires an opt-in on Android before it animates the
// expand/collapse height transition. Calling once at module load is the
// pattern recommended by the RN docs.
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SourceRowProps {
  row: RowDef;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * Single source row. Tapping the row toggles an inline WebView preview that
 * slots **between this row and the next one**, mimicking the system-level
 * accordion pattern. The chevron rotates 180° in lockstep with the
 * expand/collapse to telegraph the affordance.
 *
 * The preview never replaces the row's original destination — a "Open …"
 * affordance under the WebView still lets the user kick the URL out to the
 * system browser for full navigation.
 *
 * @param props - {@link SourceRowProps}.
 * @returns The pressable row + (conditionally) its inline preview.
 */
const SourceRow: React.FC<SourceRowProps> = ({
  row,
  index,
  isExpanded,
  onToggle,
}) => {
  const { theme } = useTheme();
  const rotation = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    rotation.value = withTiming(isExpanded ? 1 : 0, { duration: CHEVRON_MS });
  }, [isExpanded, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  const handleOpenInBrowser = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(row.url);
      if (!supported) {
        Alert.alert("Can't open this link", row.url);
        return;
      }
      await Linking.openURL(row.url);
    } catch {
      Alert.alert("Can't open this link", row.url);
    }
  }, [row.url]);

  return (
    <View>
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${
          isExpanded ? 'Collapse' : 'Expand'
        } ${row.label} preview`}
        android_ripple={{ color: theme.colors.line }}
        style={({ pressed }) => [
          styles.row,
          index > 0 && {
            borderTopWidth: 1,
            borderTopColor: theme.colors.line,
          },
          pressed && { opacity: 0.6 },
        ]}>
        <View style={styles.rowLeft}>
          <Globe size={16} color={theme.colors.mute} />
          <Text
            style={[
              styles.rowLabel,
              { color: theme.colors.ink, fontFamily: theme.fonts.display },
            ]}
            numberOfLines={1}>
            {row.label}
          </Text>
        </View>
        <View style={styles.rowRight}>
          <Pressable
            onPress={handleOpenInBrowser}
            accessibilityRole="link"
            accessibilityLabel={`Open ${row.label} in browser`}
            hitSlop={10}
            android_ripple={{ color: theme.colors.line, borderless: true }}
            style={({ pressed }) => [
              styles.openIcon,
              pressed && { opacity: 0.5 },
            ]}>
            <ExternalLink size={16} color={theme.colors.mute} />
          </Pressable>
          <Animated.View style={chevronStyle}>
            <ChevronDown size={16} color={theme.colors.mute} />
          </Animated.View>
        </View>
      </Pressable>
      {isExpanded ? (
        <View
          style={[
            styles.previewWrap,
            {
              backgroundColor: theme.colors.surface2,
              borderTopColor: theme.colors.line,
            },
          ]}>
          <WebView
            source={{ uri: toPreviewUrl(row.url) }}
            style={styles.preview}
            startInLoadingState
            // Without this, Android intercepts every vertical drag inside
            // the WebView and bubbles it to the parent ScrollView, so the
            // user can never scroll the page content itself.
            nestedScrollEnabled
            setSupportMultipleWindows={false}
            originWhitelist={['*']}
            // Force the page to lay out against the WebView's own width
            // rather than the device width — without this the embedded
            // page renders zoomed because its viewport assumes the full
            // screen width, not the (narrower) component width.
            injectedJavaScriptBeforeContentLoaded={VIEWPORT_FIX_JS}
            scalesPageToFit
            renderLoading={() => (
              <View style={styles.previewLoading}>
                <ActivityIndicator
                  size="small"
                  color={theme.colors.emerald}
                />
              </View>
            )}
          />
        </View>
      ) : null}
    </View>
  );
};

/**
 * Detail-screen "Sources" section. Renders the canonical back-to-source
 * links (OpenStreetMap, Wikipedia, Wikivoyage, …) as an accordion of rows.
 * Tapping a row no longer hard-redirects to the system browser; instead it
 * expands an inline {@link WebView} preview of the URL between that row
 * and the next. Only one row stays expanded at a time so the section never
 * grows past one screen of content.
 *
 * The section hides itself entirely when there's nothing to show — callers
 * don't need to guard.
 *
 * @param props - {@link SourcesSectionProps}.
 * @returns The Sources accordion card, or `null` when no links are available.
 */
const SourcesSection: React.FC<SourcesSectionProps> = ({
  sources,
  wikidataId,
}) => {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const handleToggle = useCallback((key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedKey(prev => (prev === key ? null : key));
  }, []);

  const rows: RowDef[] = [];
  if (sources) {
    for (const s of sources) {
      rows.push({
        key: `src-${s.provider}`,
        label: providerLabel(s.provider),
        url: s.url,
      });
    }
  }
  if (wikidataId) {
    rows.push({
      key: 'wikidata',
      label: 'Wikidata',
      url: `https://www.wikidata.org/wiki/${wikidataId}`,
    });
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <Eyebrow>Sources</Eyebrow>
      <Card variant="flat" style={styles.card}>
        {rows.map((row, idx) => (
          <SourceRow
            key={row.key}
            row={row}
            index={idx}
            isExpanded={expandedKey === row.key}
            onToggle={() => handleToggle(row.key)}
          />
        ))}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    gap: 8,
  },
  card: {
    marginTop: 4,
    overflow: 'hidden',
  },
  row: {
    paddingVertical: 13,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  rowLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.15,
  },
  previewWrap: {
    borderTopWidth: 1,
  },
  preview: {
    height: PREVIEW_HEIGHT,
    backgroundColor: 'transparent',
  },
  previewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  openIcon: {
    padding: 2,
  },
});

export default SourcesSection;
