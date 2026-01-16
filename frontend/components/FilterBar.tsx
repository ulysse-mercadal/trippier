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
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoSearch,
  IoArrowBack,
  IoGlobeOutline,
  IoInformationCircleOutline,
  IoStar,
  IoPeople,
  IoReaderOutline,
  IoMapOutline,
  IoCallOutline,
  IoCheckmarkOutline,
} from 'react-icons/io5';
import clsx from 'clsx';
import Image from 'next/image';
import { POI } from '../lib/types';

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
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

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

  const toggleSearch = () => {
    if (!isExpanded) {
      onToggle(true);
    }
  };

  const collapseSearch = () => {
    onToggle(false);
    setInputValue('');
    if (onSearch) {
      onSearch('');
    }
  };

  const copyToClipboard = (text: string) => {
    if (copied) {
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const renderPoiCard = (poi: POI, index: number) => (
    <motion.div
      key={poi.place_id || poi.name + index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group"
      onClick={() => onPoiSelect && onPoiSelect(poi)}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 pr-2">
          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {poi.name}
          </h3>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex items-center text-yellow-500">
              <IoStar size={12} className="mr-0.5" />
              <span className="text-[10px] font-bold">{poi.rating || 'N/A'}</span>
            </div>
            <div className="flex items-center text-gray-400">
              <IoPeople size={12} className="mr-0.5" />
              <span className="text-[10px] font-medium">
                ({poi.user_ratings_total?.toLocaleString() || 0})
              </span>
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
          {poi.distance < 1
            ? `${(poi.distance * 1000).toFixed(0)}m`
            : `${poi.distance.toFixed(1)}km`}
        </span>
      </div>
    </motion.div>
  );

  const openUrl = (url: string) => {
    if (!url) {
      return;
    }
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank');
  };
  const isCurrentImgError = selectedPoi && imgError === selectedPoi.place_id;

  return (
    <>
      <div
        className={clsx(
          'fixed top-0 left-0 h-full bg-white z-0 flex flex-col shadow-2xl transition-all duration-300',
          selectedPoi ? 'pt-6' : 'pt-20',
        )}
        style={{ width: isSmallScreen ? '100vw' : '33vw' }}>
        <AnimatePresence mode="wait">
          {isExpanded && !selectedPoi && (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-4 pb-2">
                <h2 className="text-2xl font-bold">Explore</h2>
              </div>
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: '45%', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="flex flex-col border-b border-gray-100">
                    <div className="px-6 py-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Top Results
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 pb-4 scrollbar-hide">
                      <div className="grid gap-3">
                        {searchResults.length > 0
                          ? searchResults.map((poi, i) => renderPoiCard(poi, i))
                          : !loading && (
                              <p className="text-sm text-gray-400">
                                No popular results found for &quot;{searchQuery}&quot;
                              </p>
                            )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-6 py-2 mt-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {searchQuery ? 'Famous nearby' : 'Popular nearby'}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
                  <div className="grid gap-3">
                    {nearbyPois.length > 0 ? (
                      nearbyPois.map((poi, i) => renderPoiCard(poi, i))
                    ) : loading ? (
                      <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => (
                          <div
                            key={i}
                            className="p-4 bg-gray-50 rounded-2xl animate-pulse h-20 w-full"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">No places found nearby.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {isExpanded && selectedPoi && (
            <motion.div
              key={`detail-${selectedPoi.place_id || selectedPoi.name}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col overflow-y-auto p-6 scrollbar-hide pb-24">
              <div className="flex items-center mb-6">
                <button
                  onClick={() => {
                    if (onPoiSelect) {
                      onPoiSelect(null);
                    }
                    setInputValue('');
                    if (onSearch) {
                      onSearch('');
                    }
                  }}
                  className="flex items-center text-gray-900 font-black text-lg transition-colors hover:text-gray-600">
                  <IoArrowBack size={24} className="mr-2" /> Back
                </button>
              </div>
              {selectedPoi.thumbnail && !isCurrentImgError && (
                <div className="w-full h-auto rounded-3xl overflow-hidden mb-6 shadow-md border border-gray-100 relative min-h-[200px]">
                  <Image
                    src={selectedPoi.thumbnail}
                    alt={selectedPoi.name}
                    fill
                    className="object-cover"
                    onError={() => setImgError(selectedPoi.place_id)}
                    unoptimized
                  />
                </div>
              )}
              <h2
                className={clsx(
                  'text-3xl font-black text-gray-900 mb-2 leading-tight',
                  (!selectedPoi.thumbnail || isCurrentImgError) && 'mt-2',
                )}>
                {selectedPoi.name}
              </h2>
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center text-yellow-500">
                  <IoStar size={16} className="mr-1" />
                  <span className="text-sm font-bold">{selectedPoi.rating}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <IoPeople size={16} className="mr-1" />
                  <span className="text-sm font-medium">
                    {selectedPoi.user_ratings_total?.toLocaleString()} reviews
                  </span>
                </div>
              </div>
              <div className="space-y-8">
                {selectedPoi.description ? (
                  <section>
                    <div className="flex items-center text-gray-400 mb-3">
                      <IoInformationCircleOutline size={20} className="mr-2" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">About</h4>
                    </div>
                    <p className="text-gray-600 leading-relaxed text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
                      &quot;{selectedPoi.description}&quot;
                    </p>
                  </section>
                ) : (
                  loading && (
                    <section className="animate-pulse">
                      <div className="h-4 w-20 bg-gray-100 rounded mb-3" />
                      <div className="h-20 bg-gray-50 rounded-2xl" />
                    </section>
                  )
                )}
                <section>
                  <div className="flex items-center text-gray-400 mb-3">
                    <IoGlobeOutline size={20} className="mr-2" />
                    <h4 className="text-xs font-bold uppercase tracking-wider">Actions & Links</h4>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPoi.name + ' ' + selectedPoi.address)}`,
                          '_blank',
                        )
                      }
                      className="w-full flex items-center justify-between p-4 bg-white border-2 border-black text-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                      <span className="font-bold text-sm">Open in Google Maps</span>
                      <IoMapOutline size={18} />
                    </button>
                    {selectedPoi.officialWebsite || selectedPoi.phoneNumber ? (
                      <div className="flex gap-2">
                        {selectedPoi.officialWebsite && (
                          <button
                            onClick={() =>
                              selectedPoi.officialWebsite && openUrl(selectedPoi.officialWebsite)
                            }
                            className={clsx(
                              'flex-1 flex items-center justify-between p-4 bg-white border-2 border-black text-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm',
                              !selectedPoi.phoneNumber && 'w-full',
                            )}>
                            <span className="font-bold text-sm truncate pr-2">Website</span>
                            <IoGlobeOutline size={18} />
                          </button>
                        )}
                        {selectedPoi.phoneNumber && (
                          <button
                            onClick={() =>
                              selectedPoi.phoneNumber && copyToClipboard(selectedPoi.phoneNumber)
                            }
                            className={clsx(
                              'flex-1 flex items-center justify-between p-4 bg-white border-2 border-black text-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm relative',
                              !selectedPoi.officialWebsite && 'w-full',
                            )}>
                            <div className="flex flex-col items-start overflow-hidden text-left">
                              <span className="font-bold text-sm truncate w-full">
                                {copied ? 'Copied!' : selectedPoi.phoneNumber}
                              </span>
                            </div>
                            {copied ? (
                              <IoCheckmarkOutline size={18} />
                            ) : (
                              <IoCallOutline size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    ) : (
                      loading && <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
                    )}
                    {selectedPoi.wikipediaUrl ? (
                      <button
                        onClick={() =>
                          selectedPoi.wikipediaUrl && openUrl(selectedPoi.wikipediaUrl)
                        }
                        className="w-full flex items-center justify-between p-4 bg-white border-2 border-black text-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                        <span className="font-bold text-sm">Wikipedia</span>
                        <IoReaderOutline size={18} />
                      </button>
                    ) : (
                      loading && <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
                    )}
                    {selectedPoi.wikivoyageUrl ? (
                      <button
                        onClick={() =>
                          selectedPoi.wikivoyageUrl && openUrl(selectedPoi.wikivoyageUrl)
                        }
                        className="w-full flex items-center justify-between p-4 bg-white border-2 border-black text-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                        <span className="font-bold text-sm">Travel Guide</span>
                        <IoGlobeOutline size={18} />
                      </button>
                    ) : (
                      loading && <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
                    )}
                  </div>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Location
                  </h4>
                  <p className="text-sm text-gray-500">{selectedPoi.address}</p>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {!selectedPoi && (
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
        )}
      </AnimatePresence>
    </>
  );
}
