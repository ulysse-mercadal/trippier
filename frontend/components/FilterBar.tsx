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
import { AnimatePresence, motion, useAnimation, PanInfo } from 'framer-motion';
import clsx from 'clsx';
import { POI, Map } from '../lib/types';
import PoiListView from './FilterBar/PoiListView';
import PoiDetailView from './FilterBar/PoiDetailView';
import MapListView from './FilterBar/MapListView';
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
  onZoom?: (poi: POI) => void;
  focusedPoi?: POI | null;
  maps?: Map[];
  onDeleteMap?: (id: number) => void;
  onUpdateMap?: (id: number, data: Partial<Map>) => void;
  onMapCreated?: () => void;
  onMapsRefresh?: () => void;
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
  onZoom,
  focusedPoi,
  maps = [],
  onDeleteMap,
  onUpdateMap,
  onMapCreated,
  onMapsRefresh,
}: FilterBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const controls = useAnimation();
  const [mobileState, setMobileState] = useState<'hidden' | 'low' | 'medium' | 'high'>('hidden');
  const [viewMode, setViewMode] = useState<'search' | 'maps'>('search');

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (inputValue.trim() !== '' && viewMode === 'maps') {
      const timer = setTimeout(() => setViewMode('search'), 0);
      return () => clearTimeout(timer);
    }
  }, [inputValue, viewMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch && viewMode === 'search') {
        onSearch(inputValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inputValue, onSearch, viewMode]);

  const handleMyMapsClick = () => {
    setViewMode('maps');
    onToggle(true);
    if (isSmallScreen) {
      setMobileState('medium');
    }
  };

  useEffect(() => {
    if (!isSmallScreen) {
      return;
    }
    if (selectedPoi) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileState('high');
    } else if (isExpanded) {
      if (mobileState === 'hidden') {
        setMobileState('medium');
      }
    } else {
      setMobileState('hidden');
    }
  }, [isExpanded, selectedPoi, isSmallScreen, mobileState]);
  useEffect(() => {
    if (isSmallScreen) {
      controls.start(mobileState);
    } else {
      controls.set({ y: 0, height: '100%' });
    }
  }, [mobileState, isSmallScreen, controls]);

  const collapseSearch = () => {
    onToggle(false);
    setInputValue('');
    if (onSearch) {
      onSearch('');
    }
    if (onPoiSelect) {
      onPoiSelect(null);
    }
    if (isSmallScreen) {
      setMobileState('hidden');
    }
    setViewMode('search');
  };

  const handleZoom = (poi: POI) => {
    if (onZoom) {
      onZoom(poi);
    }
    if (isSmallScreen) {
      setMobileState('low');
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!isSmallScreen) {
      return;
    }
    const { offset, velocity } = info;
    const swipeThreshold = 50;
    const velocityThreshold = 500;
    let nextState = mobileState;
    if (offset.y > swipeThreshold || velocity.y > velocityThreshold) {
      if (mobileState === 'high') {
        nextState = 'medium';
      } else if (mobileState === 'medium') {
        nextState = 'low';
      } else if (mobileState === 'low') {
        nextState = 'hidden';
      }
    } else if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
      if (mobileState === 'hidden') {
        nextState = 'low';
      } else if (mobileState === 'low') {
        nextState = 'medium';
      } else if (mobileState === 'medium') {
        nextState = 'high';
      }
    }
    setMobileState(nextState);
    if (nextState === 'hidden') {
      collapseSearch();
    } else {
      if (!isExpanded) {
        onToggle(true);
      }
    }
  };

  const variants = {
    hidden: { y: '100%' },
    low: { y: '66%' },
    medium: { y: '33%' },
    high: { y: '0%' },
  };
  return (
    <>
      <motion.div
        drag={isSmallScreen ? 'y' : false}
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={isSmallScreen ? controls : undefined}
        variants={isSmallScreen ? variants : undefined}
        initial={isSmallScreen ? 'hidden' : undefined}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={clsx(
          'fixed bg-white flex flex-col shadow-2xl overflow-hidden',
          isSmallScreen
            ? 'bottom-0 left-0 w-full rounded-t-3xl z-30'
            : 'top-0 left-0 h-full z-0 transition-all duration-300',
          selectedPoi ? 'pt-0' : isSmallScreen ? 'pt-0' : 'pt-20',
        )}
        style={{
          width: isSmallScreen ? '100vw' : '33vw',
          height: isSmallScreen ? '100vh' : '100%',
          touchAction: 'none',
        }}>
        {isSmallScreen && (
          <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing bg-white z-40 shrink-0">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}
        <div
          className={clsx('flex-1 flex flex-col min-h-0', !isSmallScreen && selectedPoi && 'pt-6')}>
          <AnimatePresence mode="wait">
            {viewMode === 'maps' && !selectedPoi ? (
              <MapListView
                maps={maps}
                onDelete={onDeleteMap || (() => {})}
                onUpdate={onUpdateMap || (() => {})}
                onMapCreated={onMapCreated || (() => {})}
                onClick={m => console.log('Clicked map', m.id)}
              />
            ) : !selectedPoi ? (
              <PoiListView
                isExpanded={isExpanded}
                searchQuery={searchQuery}
                searchResults={searchResults}
                nearbyPois={nearbyPois}
                loading={loading}
                onPoiSelect={onPoiSelect}
                isSmallScreen={isSmallScreen}
                onZoom={handleZoom}
                focusedPoi={focusedPoi}
                onMapsChange={onMapsRefresh}
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
      </motion.div>
      <AnimatePresence>
        {!selectedPoi && (
          <SearchInput
            isExpanded={isExpanded}
            loading={loading}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onToggle={expanded => {
              onToggle(expanded);
              if (expanded) {
                setViewMode('search');
              }
            }}
            inputRef={inputRef}
            isSmallScreen={isSmallScreen}
            collapseSearch={collapseSearch}
            onMyMapsClick={handleMyMapsClick}
          />
        )}
      </AnimatePresence>
    </>
  );
}
