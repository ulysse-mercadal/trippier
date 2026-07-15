// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import client from './client';
import { Comment } from '../lib/types';

export interface ListCommentsQuery {
  poiId: string;
}

export interface CreateCommentInput {
  text: string;
  poiId: string;
  poiName: string;
  poiLat: number;
  poiLng: number;
  isPublic?: boolean;
  parentId?: number;
}

export interface UpdateCommentInput {
  text?: string;
  isPublic?: boolean;
  hidden?: boolean;
}

/**
 * Lists comments attached to a given POI.
 *
 * @param query - The `poiId` filter (`place_id`).
 * @returns Array of comments served by the NestJS backend.
 */
export async function listComments(query: ListCommentsQuery): Promise<Comment[]> {
  const { data } = await client.get<Comment[]>('/comments', { params: query });
  return data;
}

/**
 * Creates a comment on a POI.
 *
 * @param input - The comment payload (must include `poiId` + coordinates).
 * @returns The freshly created comment.
 */
export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const { data } = await client.post<Comment>('/comments', input);
  return data;
}

/**
 * Partially updates an existing comment.
 *
 * @param id - The comment identifier.
 * @param input - The fields to update (text or visibility).
 * @returns The updated comment.
 */
export async function updateComment(id: number, input: UpdateCommentInput): Promise<Comment> {
  const { data } = await client.patch<Comment>(`/comments/${id}`, input);
  return data;
}

/**
 * Deletes a comment owned by the current user (or any when admin).
 *
 * @param id - The comment identifier.
 * @returns A promise resolving once the deletion succeeds.
 */
export async function deleteComment(id: number): Promise<void> {
  await client.delete(`/comments/${id}`);
}
