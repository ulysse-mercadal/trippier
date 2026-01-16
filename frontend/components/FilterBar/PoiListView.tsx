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
import { POI } from '../../lib/types';
import PoiCard from './PoiCard';

interface PoiListViewProps {
  isExpanded: boolean;
  searchQuery: string;
  searchResults: POI[];
  nearbyPois: POI[];
  loading: boolean;
  onPoiSelect?: (poi: POI | null) => void;
}

export default function PoiListView({
  isExpanded,
  searchQuery,
  searchResults,
  nearbyPois,
  loading,
  onPoiSelect,
}: PoiListViewProps) {
  if (!isExpanded) {
    return null;
  }

  return (
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
                  ? searchResults.map((poi, i) => (
                      <PoiCard
                        key={poi.place_id || i}
                        poi={poi}
                        index={i}
                        onPoiSelect={onPoiSelect}
                      />
                    ))
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
              nearbyPois.map((poi, i) => (
                <PoiCard key={poi.place_id || i} poi={poi} index={i} onPoiSelect={onPoiSelect} />
              ))
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
    </motion.div>
  );
}
