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
import { IoStar, IoPeople } from 'react-icons/io5';
import { POI } from '../../lib/types';

interface PoiCardProps {
  poi: POI;
  index: number;
  onPoiSelect?: (poi: POI | null) => void;
}

export default function PoiCard({ poi, index, onPoiSelect }: PoiCardProps) {
  return (
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
}
