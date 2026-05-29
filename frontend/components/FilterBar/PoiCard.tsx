// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { IoBookmark, IoTrash } from 'react-icons/io5';
import clsx from 'clsx';
import { POI, Map } from '../../lib/types';
import { isPoiEqual } from '../../lib/poi-utils';
import MapSelectionModal from '../MapSelectionModal';
import { TbZoomInArea } from 'react-icons/tb';
import { useAuth } from '../../context/AuthContext';
import { MdLocationOn } from 'react-icons/md';
import { getPoiTypeInfo } from '../../lib/poi-type-utils';

interface PoiCardProps {
  poi: POI;
  index: number;
  onPoiSelect?: (poi: POI | null) => void;
  onZoom?: (poi: POI) => void;
  onHover?: (poi: POI | null) => void;
  isHighlighted?: boolean;
  onMapsChange?: () => void;
  maps?: Map[];
  onDelete?: (poiId: string) => void;
}

export default function PoiCard({
  poi,
  index,
  onPoiSelect,
  onZoom,
  onHover,
  isHighlighted,
  onMapsChange,
  maps = [],
  onDelete,
}: PoiCardProps) {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const { user } = useAuth();

  const savedCount = useMemo(() => {
    return maps.filter(m => m.pois?.some(p => isPoiEqual(p, poi))).length;
  }, [maps, poi]);

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
        onClick={() => onPoiSelect && onPoiSelect(poi)}
        onMouseEnter={() => onHover?.(poi)}
        onMouseLeave={() => onHover?.(null)}>
        <div className="flex items-center justify-between mb-2 overflow-hidden">
          <div className="flex items-center flex-1 min-w-0 mr-2">
            <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
              {poi.name}
            </h3>
            {savedCount > 0 && (
              <div className="ml-2 flex items-center bg-white text-black border border-gray-200 px-2 py-0.5 rounded-full shrink-0">
                <IoBookmark size={10} className="mr-1" />
                <span className="text-[10px] font-black">{savedCount}</span>
              </div>
            )}
          </div>
          <div className="flex space-x-2 shrink-0">
            {onDelete && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(poi.place_id || (poi.id as string));
                }}
                className="p-1.5 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                <IoTrash size={16} />
              </button>
            )}
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
            {user && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  setIsSaveModalOpen(true);
                }}
                className="p-1.5 bg-black rounded-lg hover:bg-gray-800 transition-colors text-white">
                <IoBookmark size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          {poi.distance !== undefined && (
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg">
              {poi.distance < 1
                ? `${(poi.distance * 1000).toFixed(0)}m`
                : `${poi.distance.toFixed(1)}km`}
            </span>
          )}
          {poi.type &&
            (() => {
              const typeInfo = getPoiTypeInfo(poi.type);
              return (
                <span className="text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 text-gray-600 bg-gray-100">
                  <typeInfo.Icon size={11} />
                  {typeInfo.label}
                </span>
              );
            })()}
          {poi.coordsApproximate && poi.zone && (
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1">
              <MdLocationOn size={11} />
              {poi.zone}
            </span>
          )}
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
