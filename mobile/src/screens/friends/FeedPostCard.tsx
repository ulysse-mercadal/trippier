// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Avatar from '../../components/Avatar';
import Card, { CardBody, CardMedia } from '../../components/Card';
import IconButton from '../../components/IconButton';
import Meta from '../../components/Meta';
import PreviewMap from '../../components/PreviewMap';
import Tag from '../../components/Tag';
import {
  Bookmark as BookmarkIcon,
  Comment as CommentIcon,
  Heart as HeartIcon,
  MapPin as MapPinIcon,
  Share as ShareIcon,
} from '../../components/icons';
import { useTheme } from '../../theme/useTheme';
import type { FeedPost } from './feed-data';

export interface FeedPostCardProps {
  post: FeedPost;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
}

/**
 * Single post card rendered in the Friends feed sub-view.
 *
 * Wraps a {@link PreviewMap} thumbnail, an author header and an action row
 * with heart / comment / share / bookmark icon buttons.
 *
 * @param props - {@link FeedPostCardProps}.
 * @returns The rendered post card.
 */
const FeedPostCard: React.FC<FeedPostCardProps> = ({ post, onLike, onComment, onShare, onSave }) => {
  const { theme, mapTheme } = useTheme();
  return (
    <Card style={styles.card}>
      <CardMedia height={150}>
        <PreviewMap palette={mapTheme} surfaceColor={theme.colors.surface} height={150} />
      </CardMedia>
      <CardBody padding={16}>
        <View style={styles.header}>
          <Avatar name={post.author} size={52} />
          <View style={styles.headerText}>
            <Text
              style={[
                styles.authorName,
                { color: theme.colors.ink, fontFamily: theme.fonts.display },
              ]}>
              {post.author}
            </Text>
            <Meta>{`${post.location} · ${post.when} ago`}</Meta>
          </View>
          <Tag variant="default">{post.location}</Tag>
        </View>
        <Text
          style={[
            styles.caption,
            { color: theme.colors.ink, fontFamily: theme.fonts.display },
          ]}>
          {post.caption}
        </Text>
        <View style={styles.actions}>
          <IconButton accessibilityLabel="Like post" variant="flat" onPress={onLike}>
            <HeartIcon size={20} color={theme.colors.ink2} />
          </IconButton>
          <Text style={[styles.count, { color: theme.colors.mute, fontFamily: theme.fonts.mono }]}>
            {post.likes}
          </Text>
          <IconButton accessibilityLabel="Comment on post" variant="flat" onPress={onComment}>
            <CommentIcon size={20} color={theme.colors.ink2} />
          </IconButton>
          <Text style={[styles.count, { color: theme.colors.mute, fontFamily: theme.fonts.mono }]}>
            {post.comments}
          </Text>
          <IconButton accessibilityLabel="Share post" variant="flat" onPress={onShare}>
            <ShareIcon size={20} color={theme.colors.ink2} />
          </IconButton>
          <View style={styles.spacer} />
          <IconButton accessibilityLabel="Save post" variant="flat" onPress={onSave}>
            <BookmarkIcon size={20} color={theme.colors.emeraldDeep} />
          </IconButton>
        </View>
        <View style={styles.pinRow}>
          <MapPinIcon size={12} color={theme.colors.mute} />
          <Meta style={styles.pinMeta}>{post.location}</Meta>
        </View>
      </CardBody>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  caption: {
    fontSize: 14.5,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  count: {
    fontSize: 12.5,
    marginRight: 6,
  },
  spacer: {
    flex: 1,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  pinMeta: {
    fontSize: 11.5,
  },
});

export default FeedPostCard;
