// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulysse.mercadal@trippier.com
//
// **************************************************************************

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSearch, IoArrowBack } from 'react-icons/io5';
import clsx from 'clsx';

interface FilterBarProps {
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
  isSmallScreen?: boolean;
}

export default function FilterBar({ isExpanded, onToggle, isSmallScreen = false }: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  const toggleSearch = () => {
    if (!isExpanded) {
      onToggle(true);
    }
  };

  const collapseSearch = () => {
    onToggle(false);
    setSearchText('');
  };

  return (
    <>
      <div
        className="fixed top-0 left-0 h-full bg-white z-0 pt-20"
        style={{ width: isSmallScreen ? '100vw' : '33vw' }}>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="h-full overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-6">Explore</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Recent Searches
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <IoSearch size={14} /> <span>Paris, France</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <IoSearch size={14} /> <span>London, UK</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        layout
        initial={false}
        animate={{
          width: isExpanded
            ? isSmallScreen
              ? 'calc(100vw - 24px)'
              : 'calc(33vw - 40px)'
            : isSmallScreen
              ? 'calc(100vw - 40px)'
              : '350px',
          height: '48px',
          borderRadius: '999px',
          top: 20,
          left: isSmallScreen && isExpanded ? 12 : 20,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={clsx(
          'fixed z-20 bg-white border-2 flex flex-col overflow-hidden transition-colors duration-300',
          isExpanded ? 'border-black' : 'border-transparent',
          !isExpanded && 'cursor-pointer',
        )}
        onClick={!isExpanded ? toggleSearch : undefined}>
        <div className="flex items-center min-h-12 px-4 relative bg-white">
          <AnimatePresence>
            {isExpanded && (
              <motion.button
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 32, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center justify-center mr-2"
                onClick={e => {
                  e.stopPropagation();
                  collapseSearch();
                }}>
                <IoArrowBack size={20} className="text-gray-800" />
              </motion.button>
            )}
          </AnimatePresence>
          <IoSearch size={18} className="text-gray-800 mr-2" />
          <input
            ref={inputRef}
            type="text"
            className={clsx(
              'flex-1 bg-transparent border-none outline-none text-gray-800 text-base placeholder-gray-500 h-full',
              !isExpanded && 'pointer-events-none',
            )}
            placeholder="Discover new places"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            disabled={!isExpanded}
          />
        </div>
      </motion.div>
    </>
  );
}
