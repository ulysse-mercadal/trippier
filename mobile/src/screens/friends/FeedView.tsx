// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuthGate } from '../../hooks/useAuthGate';
import FeedPostCard from './FeedPostCard';
import { MOCK_POSTS } from './feed-data';

/**
 * Friends feed sub-view — vertical scroll of {@link FeedPostCard}s rendered
 * from the wave-4 stub data. Each post action is routed through
 * {@link useAuthGate} so guests see the auth sheet before write actions land.
 *
 * @returns The rendered feed list.
 */
const FeedView: React.FC = () => {
  const { gate } = useAuthGate();

  const handleLike = useCallback(
    (id: string): void => {
      gate('save', () => {
        console.warn('action stubbed: like', id);
      });
    },
    [gate],
  );

  const handleComment = useCallback(
    (id: string): void => {
      gate('comment', () => {
        console.warn('action stubbed: comment', id);
      });
    },
    [gate],
  );

  const handleShare = useCallback(
    (id: string): void => {
      gate('generic', () => {
        console.warn('action stubbed: share', id);
      });
    },
    [gate],
  );

  const handleSave = useCallback(
    (id: string): void => {
      gate('save', () => {
        console.warn('action stubbed: save', id);
      });
    },
    [gate],
  );

  return (
    <View style={styles.root}>
      {MOCK_POSTS.map(post => (
        <FeedPostCard
          key={post.id}
          post={post}
          onLike={() => handleLike(post.id)}
          onComment={() => handleComment(post.id)}
          onShare={() => handleShare(post.id)}
          onSave={() => handleSave(post.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 14,
  },
});

export default FeedView;
