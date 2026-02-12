// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  IoSend,
  IoChatbubbleOutline,
  IoLockClosedOutline,
  IoEyeOffOutline,
  IoTrashOutline,
  IoPencilOutline,
} from 'react-icons/io5';
import client from '../../lib/client';
import { Comment, POI } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          poiLat: typeof poi.lat === 'string' ? parseFloat(poi.lat) : poi.lat,
          poiLng: typeof poi.lng === 'string' ? parseFloat(poi.lng) : poi.lng,
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
    <div
      key={comment.id}
      className={clsx(
        'flex flex-col gap-2',
        isReply && 'ml-8 mt-2 border-l-2 border-gray-100 pl-4',
        user?.id === comment.userId &&
          !isReply &&
          'bg-blue-50/30 p-3 rounded-2xl border border-blue-100/50',
      )}>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-gray-900">{comment.user.name}</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
          {!comment.isPublic && (
            <span className="flex items-center gap-1 text-[10px] text-blue-500 font-bold uppercase bg-blue-50 px-2 py-0.5 rounded-full">
              <IoLockClosedOutline /> Private
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {user?.id === comment.userId && (
            <button
              onClick={() => handleEdit(comment)}
              className="text-gray-400 hover:text-black transition-colors">
              <IoPencilOutline size={14} />
            </button>
          )}
          {(user?.id === comment.userId || user?.role === 'ADMIN') && (
            <button
              onClick={() => handleDelete(comment.id)}
              className="text-gray-400 hover:text-red-500 transition-colors">
              <IoTrashOutline size={14} />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
      {comment.isPublic && !isReply && (
        <button
          onClick={() => setReplyTo(comment)}
          className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-black transition-colors w-fit">
          Reply
        </button>
      )}
      {comment.replies?.map(reply => renderComment(reply, true))}
    </div>
  );

  return (
    <section className="mt-8 pt-8 border-t border-gray-100">
      <div className="flex items-center text-gray-400 mb-6">
        <IoChatbubbleOutline size={20} className="mr-2" />
        <h4 className="text-xs font-bold uppercase tracking-wider">Notes & Comments</h4>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
        {(replyTo || editingComment) && (
          <div className="mb-2 flex justify-between items-center bg-white p-2 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500">
              {editingComment ? (
                'Editing your comment'
              ) : (
                <>
                  Replying to <span className="font-bold">{replyTo?.user.name}</span>
                </>
              )}
            </span>
            <button
              onClick={() => {
                setReplyTo(null);
                setEditingComment(null);
                setText('');
              }}
              className="text-xs font-bold text-red-500">
              Cancel
            </button>
          </div>
        )}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={replyTo ? 'Write a reply...' : 'Add a private note or public comment...'}
          className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 placeholder-gray-400 resize-none h-20"
        />
        <div className="flex justify-between items-center mt-2">
          {!replyTo && !editingComment && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all',
                  !isPublic
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-400 border border-gray-200',
                )}>
                Private Note
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all',
                  isPublic
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-400 border border-gray-200',
                )}>
                Public Comment
              </button>
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="ml-auto p-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
            <IoSend size={18} />
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {comments
          .filter(c => !c.parentId)
          .map(comment => renderComment(comment))}
        {comments.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-4 italic">No notes or comments yet.</p>
        )}
      </div>
    </section>
  );
}
