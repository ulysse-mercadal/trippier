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
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoGlobeOutline, IoCalendarOutline, IoPersonOutline } from 'react-icons/io5';
import { motion } from 'framer-motion';

export default function FloatingNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Discover', href: '/discover', icon: IoGlobeOutline },
    { name: 'Plan', href: '/plan', icon: IoCalendarOutline },
    { name: 'Profile', href: '/profile', icon: IoPersonOutline },
  ];

  const activeIndex = navItems.findIndex(item => item.href === pathname);
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className="fixed bottom-8 left-0 right-0 flex justify-center items-center z-50 pointer-events-none px-5">
      <div className="bg-white rounded-full shadow-2xl flex items-center p-1.5 pointer-events-auto relative h-15 w-full max-w-md md:max-w-md">
        <motion.div
          className="absolute bg-black rounded-full h-[86%] top-[7%]"
          initial={false}
          animate={{
            left: `${safeIndex * (100 / navItems.length) + 1}%`,
            width: `${100 / navItems.length - 2}%`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex-1 flex justify-center items-center h-full z-10">
              <item.icon
                size={24}
                color={isActive ? '#FFFFFF' : '#000000'}
                className="transition-colors duration-200"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
