// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { POI } from '../lib/types';
import PoiListView from './FilterBar/PoiListView';
import PoiDetailView from './FilterBar/PoiDetailView';
import SearchInput from './FilterBar/SearchInput';

interface FilterBarProps {
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
  isSmallScreen?: boolean;
  nearbyPois?: POI[];
  searchResults?: POI[];
  searchQuery?: string;
  loading?: boolean;
  onSearch?: (text: string) => void;
  onPoiSelect?: (poi: POI | null) => void;
  selectedPoi?: POI | null;
}

export default function FilterBar({
  isExpanded,
  onToggle,
  isSmallScreen = false,
  nearbyPois = [],
  searchResults = [],
  searchQuery = '',
  loading = false,
  onSearch,
  onPoiSelect,
  selectedPoi,
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(inputValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  const collapseSearch = () => {
    onToggle(false);
    setInputValue('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <>
      <div
        className={clsx(
          'fixed top-0 left-0 h-full bg-white z-0 flex flex-col shadow-2xl transition-all duration-300',
          selectedPoi ? 'pt-6' : 'pt-20',
        )}
        style={{ width: isSmallScreen ? '100vw' : '33vw' }}>
        <AnimatePresence mode="wait">
          {!selectedPoi ? (
            <PoiListView
              isExpanded={isExpanded}
              searchQuery={searchQuery}
              searchResults={searchResults}
              nearbyPois={nearbyPois}
              loading={loading}
              onPoiSelect={onPoiSelect}
            />
          ) : (
            <PoiDetailView
              selectedPoi={selectedPoi}
              onPoiSelect={onPoiSelect}
              loading={loading}
              onSearch={onSearch}
              setInputValue={setInputValue}
            />
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {!selectedPoi && (
          <SearchInput
            isExpanded={isExpanded}
            loading={loading}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onToggle={onToggle}
            inputRef={inputRef}
            isSmallScreen={isSmallScreen}
            collapseSearch={collapseSearch}
          />
        )}
      </AnimatePresence>
    </>
  );
}
