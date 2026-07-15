// **************************************************************************
//
//  Trippier Project - Mobile App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React from 'react';
import ProfileGuestScreen from '../profile/ProfileGuestScreen';
import { useAuth } from '../../context/AuthContext';
import YouSignedInScreen from './YouSignedInScreen';

/**
 * You tab entry point. Routes between the existing guest fallback and the
 * full signed-in profile based on the {@link useAuth} state.
 *
 * @returns The active You screen for the current auth state.
 */
const YouScreen: React.FC = () => {
  const { user } = useAuth();
  if (user) {
    return <YouSignedInScreen user={user} />;
  }
  return <ProfileGuestScreen />;
};

export default YouScreen;
