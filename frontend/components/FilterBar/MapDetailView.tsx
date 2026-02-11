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
import { motion } from 'framer-motion';
import { IoArrowBack, IoCalendarOutline, IoTimeOutline, IoLocationOutline } from 'react-icons/io5';
import { Map, POI } from '../../lib/types';
import PoiCard from './PoiCard';
import client from '../../lib/client';

interface MapDetailViewProps {
  map: Map;
  onBack: () => void;
  onPoiSelect?: (poi: POI | null) => void;
  onZoom?: (poi: POI) => void;
  onMapsChange?: () => void;
}

export default function MapDetailView({
  map,
  onBack,
  onPoiSelect,
  onZoom,
  onMapsChange,
}: MapDetailViewProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleRemovePoi = async (poiId: string) => {
    try {
      await client.delete(`/maps/${map.id}/pois/${poiId}`);
      onMapsChange?.();
    } catch (error) {
      console.error('Failed to remove POI:', error);
    }
  };

  return (
    <motion.div
      key={`map-detail-${map.id}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col overflow-y-auto p-6 scrollbar-hide pb-24">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-900 font-black text-lg transition-colors hover:text-gray-600">
          <IoArrowBack size={24} className="mr-2" /> Back
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-4xl shadow-sm shrink-0 border border-gray-100">
          {map.icon || '🌍'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-black text-gray-900 leading-tight truncate">{map.title}</h2>
          <p className="text-gray-500 font-bold">{map.pois?.length || 0} locations</p>
        </div>
      </div>
      {map.description && (
        <p className="text-gray-500 mb-6 px-1 text-sm leading-relaxed">{map.description}</p>
      )}
      <div className="flex flex-col space-y-2 mb-6 px-1">
        <div className="flex items-center text-gray-400">
          <IoCalendarOutline size={14} className="mr-2 shrink-0" />
          <p className="text-xs font-medium">
            Created on <span className="text-gray-700 font-bold">{formatDate(map.createdAt)}</span>
          </p>
        </div>
        <div className="flex items-center text-gray-400">
          <IoTimeOutline size={14} className="mr-2 shrink-0" />
          <p className="text-xs font-medium">
            Last updated{' '}
            <span className="text-gray-700 font-bold">{formatDate(map.updatedAt)}</span>
          </p>
        </div>
      </div>
      <div className="border-t border-gray-100 mb-4" />
      <div className="flex flex-col space-y-4">
        <div className="flex items-center text-gray-400 px-1">
          <IoLocationOutline size={20} className="mr-2" />
          <h4 className="text-xs font-bold uppercase tracking-wider">Places in this map</h4>
        </div>
        <div className="grid gap-3">
          {map.pois && map.pois.length > 0 ? (
            map.pois.map((poi, i) => (
              <PoiCard
                key={poi.place_id || poi.id || i}
                poi={poi}
                index={i}
                onPoiSelect={onPoiSelect}
                onZoom={onZoom}
                onMapsChange={onMapsChange}
                onDelete={handleRemovePoi}
              />
            ))
          ) : (
            <p className="text-sm text-gray-400 italic px-1">No places added yet.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
