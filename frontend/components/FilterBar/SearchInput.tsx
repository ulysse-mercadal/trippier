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
import { motion, AnimatePresence } from 'framer-motion';
import { IoSearch, IoArrowBack } from 'react-icons/io5';
import clsx from 'clsx';

interface SearchInputProps {
  isExpanded: boolean;
  loading: boolean;
  inputValue: string;
  setInputValue: (val: string) => void;
  onToggle: (expanded: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isSmallScreen: boolean;
  collapseSearch: () => void;
}

export default function SearchInput({
  isExpanded,
  loading,
  inputValue,
  setInputValue,
  onToggle,
  inputRef,
  isSmallScreen,
  collapseSearch,
}: SearchInputProps) {
  const toggleSearch = () => {
    if (!isExpanded) {
      onToggle(true);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={clsx(
        'fixed z-20 bg-white border-2 flex flex-col overflow-hidden transition-colors duration-300',
        isExpanded ? 'border-black' : 'border-transparent',
        !isExpanded && 'cursor-pointer shadow-lg',
      )}
      style={{
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
        <div className="relative mr-2 flex items-center justify-center w-5 h-5">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{
                  rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
                  opacity: { duration: 0.2 },
                }}
                className="absolute w-4 h-4 border-2 border-gray-200 border-t-black rounded-full"
              />
            ) : (
              <motion.div
                key="search-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}>
                <IoSearch size={18} className="text-gray-800" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <input
          ref={inputRef}
          type="text"
          className={clsx(
            'flex-1 bg-transparent border-none outline-none text-gray-800 text-base placeholder-gray-500 h-full',
            !isExpanded && 'pointer-events-none',
          )}
          placeholder="Discover new places"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          disabled={!isExpanded}
        />
      </div>
    </motion.div>
  );
}
