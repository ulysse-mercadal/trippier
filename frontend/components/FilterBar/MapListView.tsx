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
import { Map } from '../../lib/types';
import MapListItem from './MapListItem';
import CreateMapForm from '../CreateMapForm';

interface MapListViewProps {
  maps: Map[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: Partial<Map>) => void;
  onMapCreated: () => void;
  onClick: (map: Map) => void;
}

export default function MapListView({
  maps,
  onDelete,
  onUpdate,
  onMapCreated,
  onClick,
}: MapListViewProps) {
  return (
    <motion.div
      key="map-list-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-24"
      onPointerDown={e => e.stopPropagation()}>
      <div className="px-6 pt-4 pb-2">
        <h2 className="text-2xl text-black font-bold">My Maps</h2>
      </div>
      <div className="px-6 pb-4">
        <CreateMapForm onMapCreated={onMapCreated} />
        <div className="grid gap-3 mt-4">
          {maps.length > 0 ? (
            maps.map(map => (
              <MapListItem
                key={map.id}
                map={map}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onClick={onClick}
              />
            ))
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 mt-10">
              <p>No maps created yet.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
