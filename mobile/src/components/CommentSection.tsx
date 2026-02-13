// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import client from '../api/client';
import { Comment, POI } from '../lib/types';
import { useAuth } from '../context/AuthContext';

interface CommentSectionProps {
  poi: POI;
}

export default function CommentSection({ poi }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      const response = await client.get(`/comments?poiId=${poi.place_id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  }, [poi.place_id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      return;
    }
    setLoading(true);
    try {
      if (editingComment) {
        await client.patch(`/comments/${editingComment.id}`, {
          text,
          isPublic: editingComment.isPublic,
        });
      } else {
        await client.post('/comments', {
          text,
          isPublic: replyTo ? true : isPublic,
          poiId: poi.place_id,
          poiName: poi.name,
          poiLat: poi.lat,
          poiLng: poi.lng,
          parentId: replyTo?.id,
        });
      }
      setText('');
      setReplyTo(null);
      setEditingComment(null);
      fetchComments();
    } catch (error) {
      console.error('Failed to save comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setText(comment.text);
    setReplyTo(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await client.delete(`/comments/${id}`);
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <View
      key={comment.id}
      style={[
        styles.commentContainer,
        isReply && styles.replyContainer,
        user?.id === comment.userId && !isReply && styles.ownComment,
      ]}>
      <View style={styles.commentHeader}>
        <View style={styles.commentInfo}>
          <Text style={styles.userName}>{comment.user.name}</Text>
          <Text style={styles.dateText}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
          {!comment.isPublic && (
            <View style={styles.privateBadge}>
              <Ionicons name="lock-closed" size={10} color="#3B82F6" />
              <Text style={styles.privateText}>Private</Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          {user?.id === comment.userId && (
            <TouchableOpacity onPress={() => handleEdit(comment)} style={styles.actionButton}>
              <Ionicons name="pencil" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          )}
          {(user?.id === comment.userId || user?.role === 'ADMIN') && (
            <TouchableOpacity onPress={() => handleDelete(comment.id)} style={styles.actionButton}>
              <Ionicons name="trash" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
      {user && comment.isPublic && !isReply && (
        <TouchableOpacity onPress={() => setReplyTo(comment)} style={styles.replyButton}>
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      )}
      {comment.replies?.map(reply => renderComment(reply, true))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" />
        <Text style={styles.title}>NOTES & COMMENTS</Text>
      </View>

      {!user ? (
        <View style={styles.loginPrompt}>
          <Text style={styles.promptText}>
            Join the community to share your experience or save private notes about this place.
          </Text>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login or Register</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          {(replyTo || editingComment) && (
            <View style={styles.contextBar}>
              <Text style={styles.contextText}>
                {editingComment ? (
                  'Editing your comment'
                ) : (
                  <>
                    Replying to <Text style={styles.bold}>{replyTo?.user.name}</Text>
                  </>
                )}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setReplyTo(null);
                  setEditingComment(null);
                  setText('');
                }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            style={styles.input}
            multiline
            value={text}
            onChangeText={setText}
            placeholder={replyTo ? 'Write a reply...' : 'Add a private note or public comment...'}
            placeholderTextColor="#9CA3AF"
          />
          <View style={styles.formFooter}>
            {!replyTo && !editingComment && (
              <View style={styles.visibilityButtons}>
                <TouchableOpacity
                  onPress={() => setIsPublic(false)}
                  style={[styles.visibilityButton, !isPublic && styles.activeVisibilityButton]}>
                  <Text style={[styles.visibilityText, !isPublic && styles.activeVisibilityText]}>
                    Private Note
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsPublic(true)}
                  style={[styles.visibilityButton, isPublic && styles.activeVisibilityButton]}>
                  <Text style={[styles.visibilityText, isPublic && styles.activeVisibilityText]}>
                    Public Comment
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !text.trim()}
              style={[styles.submitButton, (loading || !text.trim()) && styles.disabledButton]}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="send" size={18} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.commentsList}>
        {comments.filter(c => !c.parentId).map(comment => renderComment(comment))}
        {comments.length === 0 && <Text style={styles.noComments}>No notes or comments yet.</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
    letterSpacing: 1,
  },
  loginPrompt: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    alignItems: 'center',
    marginBottom: 24,
  },
  promptText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  loginButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#000',
    borderRadius: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  form: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 24,
  },
  contextBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },
  contextText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bold: {
    fontWeight: 'bold',
  },
  cancelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  input: {
    fontSize: 14,
    color: '#111827',
    height: 80,
    textAlignVertical: 'top',
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  visibilityButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeVisibilityButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  visibilityText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  activeVisibilityText: {
    color: '#FFF',
  },
  submitButton: {
    padding: 8,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  commentsList: {
    gap: 24,
  },
  commentContainer: {
    gap: 8,
  },
  replyContainer: {
    marginLeft: 32,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#F3F4F6',
    paddingLeft: 16,
  },
  ownComment: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  privateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3B82F6',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  replyButton: {
    marginTop: 4,
  },
  replyButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  noComments: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 16,
  },
});
