// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulysse.mercadal@trippier.com
//
// **************************************************************************

'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '../context/AuthContext';
import FloatingNav from './FloatingNav';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/';

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <main className="h-screen w-full">{children}</main>
        {!isAuthPage && <FloatingNav />}
      </div>
    </AuthProvider>
  );
}
