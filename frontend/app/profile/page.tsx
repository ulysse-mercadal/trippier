// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-10 text-center text-black">Profile</h1>
        {user && (
          <div className="mb-10">
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-lg font-medium text-black">{user.email}</p>
            </div>
            {user.name && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="text-lg font-medium text-black">{user.name}</p>
              </div>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className="w-full h-12 border border-red-500 rounded-lg flex items-center justify-center text-red-500 font-bold hover:bg-red-50 transition-colors">
          Logout
        </button>
      </div>
    </div>
  );
}
