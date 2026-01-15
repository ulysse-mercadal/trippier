// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulysse.mercadal@trippier.com
//
// **************************************************************************

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import FilterBar from '../../components/FilterBar';

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
      Loading Map...
    </div>
  ),
});

export default function DiscoverPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsSmallScreen(window.innerWidth < 1000);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      <FilterBar isExpanded={isExpanded} onToggle={setIsExpanded} isSmallScreen={isSmallScreen} />
      <motion.div
        className="absolute z-10 overflow-hidden shadow-2xl"
        initial={false}
        animate={{
          top: isExpanded ? 12 : 0,
          left: isExpanded ? (isSmallScreen ? '100vw' : '33vw') : 0,
          right: isExpanded ? 12 : 0,
          bottom: isExpanded ? 12 : 0,
          borderRadius: isExpanded ? 24 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <Map />
      </motion.div>
    </div>
  );
}
