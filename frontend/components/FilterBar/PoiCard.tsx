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
import { IoStar, IoPeople, IoMapOutline } from 'react-icons/io5';
import clsx from 'clsx';
import { POI } from '../../lib/types';

interface PoiCardProps {
  poi: POI;
  index: number;
  onPoiSelect?: (poi: POI | null) => void;
  onZoom?: (poi: POI) => void;
  isHighlighted?: boolean;
}

export default function PoiCard({ poi, index, onPoiSelect, onZoom, isHighlighted }: PoiCardProps) {
  return (
    <motion.div
      key={poi.place_id || poi.name + index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer group flex flex-col',
        isHighlighted ? 'border-4 border-black' : 'border-4 border-transparent',
      )}
      onClick={() => onPoiSelect && onPoiSelect(poi)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1 mr-2 flex-1">
          {poi.name}
        </h3>
        {onZoom && (
          <button
            onClick={e => {
              e.stopPropagation();
              onZoom(poi);
            }}
            className="p-1.5 bg-white rounded-lg hover:bg-gray-50 transition-colors shrink-0 text-gray-900">
            <IoMapOutline size={16} />
          </button>
        )}
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
  );
}
