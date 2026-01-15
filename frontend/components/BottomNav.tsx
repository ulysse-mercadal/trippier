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
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaMapMarkedAlt, FaCalendarAlt, FaUser } from 'react-icons/fa';
import clsx from 'clsx';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Discover',
      href: '/discover',
      icon: FaMapMarkedAlt,
    },
    {
      name: 'Plan',
      href: '/plan',
      icon: FaCalendarAlt,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: FaUser,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe md:top-0 md:left-0 md:bottom-0 md:w-64 md:border-r md:border-t-0 md:flex md:flex-col md:h-screen z-50">
      <div className="flex justify-around items-center h-16 md:flex-col md:h-full md:justify-start md:pt-10">
        <div className="hidden md:block text-2xl font-bold mb-10 px-6">Trippier</div>
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <div key={item.name} className="flex-1 md:flex-none md:w-full md:px-4 md:mb-2">
              <Link
                href={item.href}
                className={clsx(
                  'flex flex-col items-center justify-center w-full h-full md:flex-row md:justify-start md:px-4 md:py-3 md:rounded-lg transition-colors',
                  isActive
                    ? 'text-black md:bg-gray-100'
                    : 'text-gray-400 hover:text-gray-600 md:hover:bg-gray-50',
                )}>
                <item.icon size={24} className="mb-1 md:mb-0 md:mr-3" />
                <span className="text-xs md:text-base font-medium">{item.name}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
