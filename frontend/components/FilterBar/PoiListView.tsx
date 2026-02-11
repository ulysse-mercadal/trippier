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
import { POI, Map } from '../../lib/types';
import PoiCard from './PoiCard';
import clsx from 'clsx';
import { 
  MdMuseum, 
  MdRestaurant, 
  MdPark, 
  MdLocalBar, 
  MdShoppingBag, 
  MdDirectionsRun 
} from 'react-icons/md';

interface PoiListViewProps {
  isExpanded: boolean;
  searchQuery: string;
  searchResults: POI[];
  nearbyPois: POI[];
  loading: boolean;
  onPoiSelect?: (poi: POI | null) => void;
  isSmallScreen?: boolean;
  onZoom?: (poi: POI) => void;
  onHover?: (poi: POI | null) => void;
  focusedPoi?: POI | null;
  onMapsChange?: () => void;
  maps?: Map[];
  weights?: string;
  onWeightsChange?: (weights: string) => void;
}

const CATEGORIES = [
  { id: 'culture', name: 'Culture', icon: <MdMuseum /> },
  { id: 'food', name: 'Food', icon: <MdRestaurant /> },
  { id: 'nature', name: 'Nature', icon: <MdPark /> },
  { id: 'nightlife', name: 'Nightlife', icon: <MdLocalBar /> },
  { id: 'shopping', name: 'Shopping', icon: <MdShoppingBag /> },
  { id: 'activities', name: 'Activities', icon: <MdDirectionsRun /> },
];

export default function PoiListView({
  isExpanded,
  searchQuery,
  searchResults,
  nearbyPois,
  loading,
  onPoiSelect,
  isSmallScreen,
  onZoom,
  onHover,
  focusedPoi,
  onMapsChange,
  maps = [],
  weights = '',
  onWeightsChange,
}: PoiListViewProps) {
  const currentWeights = React.useMemo(() => {
    const map: Record<string, number> = {};
    weights.split(',').forEach(w => {
      const [k, v] = w.split(':');
      if (k) map[k] = parseFloat(v) || 0;
    });
    return map;
  }, [weights]);

  const toggleCategory = (id: string) => {
    if (!onWeightsChange) return;
    const newWeights = { ...currentWeights };
    if (newWeights[id]) {
      delete newWeights[id];
    } else {
      newWeights[id] = 10;
    }
    const weightsStr = Object.entries(newWeights)
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    onWeightsChange(weightsStr);
  };

  if (!isExpanded && !isSmallScreen) {
    return null;
  }

  return (
    <motion.div
      key="list-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col min-h-0"
      onPointerDown={e => e.stopPropagation()}>
      
      {/* Sticky Header and Categories */}
      <div className="sticky top-0 bg-white z-10 pt-4 pb-2 border-b border-gray-100">
        <div className="px-6 mb-2">
          <h2 className="text-2xl text-black font-bold">Explore</h2>
        </div>
        <div className="px-6 py-2 overflow-x-auto no-scrollbar flex gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 border cursor-pointer',
                currentWeights[cat.id]
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
              )}>
              <span className={currentWeights[cat.id] ? 'text-white' : 'text-black'}>
                {cat.icon}
              </span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-24">
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="flex flex-col border-b border-gray-100">
              <div className="px-6 py-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Top Results
                </p>
              </div>
              <div className="px-6 pb-4">
                <div className="grid gap-3">
                  {searchResults.length > 0
                    ? searchResults.map((poi, i) => (
                                        <PoiCard
                                          key={poi.place_id || i}
                                          poi={poi}
                                          index={i}
                                          onPoiSelect={onPoiSelect}
                                          onZoom={onZoom}
                                          onHover={onHover}
                                          isHighlighted={focusedPoi?.place_id === poi.place_id}
                                          onMapsChange={onMapsChange}
                                          maps={maps}
                                        />                      ))
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
        <div className="flex flex-col">
          <div className="px-6 py-2 mt-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {searchQuery ? 'Famous nearby' : 'Popular nearby'}
            </p>
          </div>
          <div className="px-6">
            <div className="grid gap-3">
              {nearbyPois.length > 0 ? (
                nearbyPois.map((poi, i) => (
                                  <PoiCard
                                    key={poi.place_id || i}
                                    poi={poi}
                                    index={i}
                                    onPoiSelect={onPoiSelect}
                                    onZoom={onZoom}
                                    onHover={onHover}
                                    isHighlighted={focusedPoi?.place_id === poi.place_id}
                                    onMapsChange={onMapsChange}
                                    maps={maps}
                                  />                ))
              ) : loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 bg-gray-50 rounded-2xl animate-pulse h-20 w-full" />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No places found nearby.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}