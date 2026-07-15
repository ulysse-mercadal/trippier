// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import client from './client';
import { User } from '../lib/types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

/**
 * Authenticates the user with the NestJS backend.
 *
 * @param input - Email + password credentials.
 * @returns The JWT token and the user profile.
 */
export async function login(input: LoginInput): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/login', input);
  return data;
}

/**
 * Registers a new user against the NestJS backend.
 *
 * @param input - Email, password and optional display name.
 * @returns The JWT token and the freshly created user profile.
 */
export async function register(input: RegisterInput): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/auth/register', input);
  return data;
}

/**
 * Fetches the profile of the currently authenticated user.
 *
 * @returns The {@link User} profile served by `GET /auth/me`.
 */
export async function me(): Promise<User> {
  const { data } = await client.get<User>('/auth/me');
  return data;
}
