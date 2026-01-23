// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IoStar, IoPeople, IoBookmark } from 'react-icons/io5';
import clsx from 'clsx';
import { POI } from '../../lib/types';
import MapSelectionModal from '../MapSelectionModal';
import { TbZoomInArea } from 'react-icons/tb';

interface PoiCardProps {
  poi: POI;
  index: number;
  onPoiSelect?: (poi: POI | null) => void;
  onZoom?: (poi: POI) => void;
  isHighlighted?: boolean;
  onMapsChange?: () => void;
}

export default function PoiCard({
  poi,
  index,
  onPoiSelect,
  onZoom,
  isHighlighted,
  onMapsChange,
}: PoiCardProps) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  return (
    <>
      <motion.div
        key={poi.place_id || poi.name + index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={clsx(
          'p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group flex flex-col border',
          isHighlighted ? 'border-black border-4' : 'border-gray-100',
        )}
        onClick={() => onPoiSelect && onPoiSelect(poi)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1 mr-2 flex-1">
            {poi.name}
          </h3>
          <div className="flex space-x-2 shrink-0">
            {onZoom && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onZoom(poi);
                }}
                className="p-1.5 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-900 border border-gray-200">
                <TbZoomInArea size={16} />
              </button>
            )}
            <button
              onClick={e => {
                e.stopPropagation();
                setIsSaveModalOpen(true);
              }}
              className="p-1.5 bg-black rounded-lg hover:bg-gray-800 transition-colors text-white">
              <IoBookmark size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center mb-2">
          <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
            {poi.distance < 1
              ? `${(poi.distance * 1000).toFixed(0)}m`
              : `${poi.distance.toFixed(1)}km`}
          </span>
        </div>
        <div className="flex items-center space-x-2">
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
      </motion.div>
      <MapSelectionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        poi={poi}
        onMapsChange={onMapsChange}
      />
    </>
  );
}
