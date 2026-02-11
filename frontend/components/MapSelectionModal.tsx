// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { IoClose, IoCheckmark } from 'react-icons/io5';
import client from '../lib/client';
import { Map, POI } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import CreateMapForm from './CreateMapForm';

interface MapSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  poi: POI | null;
  onMapsChange?: () => void;
}

interface MapWithDetails extends Map {
  hasPoi: boolean;
}

export default function MapSelectionModal({
  isOpen,
  onClose,
  poi,
  onMapsChange,
}: MapSelectionModalProps) {
  const { token } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [maps, setMaps] = useState<MapWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchMapsAndStatus = useCallback(async () => {
    if (!poi || !token) {
      return;
    }
    setLoading(true);
    try {
      const { data: userMaps } = await client.get<Map[]>('/maps');
      const mapsWithStatus = await Promise.all(
        userMaps.map(async map => {
          try {
            const { data: mapDetails } = await client.get<Map>(`/maps/${map.id}`);
            const hasPoi =
              mapDetails.pois?.some(p => (p.place_id || p.id) === poi.place_id) || false;
            return { ...map, hasPoi };
          } catch (e) {
            console.error(`Failed to fetch details for map ${map.id}`, e);
            return { ...map, hasPoi: false };
          }
        }),
      );
      setMaps(mapsWithStatus);
    } catch (error) {
      console.error('Failed to fetch maps', error);
    } finally {
      setLoading(false);
    }
  }, [poi, token]);

  const handleMapCreated = () => {
    fetchMapsAndStatus();
    onMapsChange?.();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && poi && token) {
      setIsVisible(true);
      fetchMapsAndStatus();
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, poi, token, fetchMapsAndStatus]);

  const toggleMap = async (map: MapWithDetails) => {
    if (!poi) {
      return;
    }
    setMaps(prev => prev.map(m => (m.id === map.id ? { ...m, hasPoi: !m.hasPoi } : m)));
    try {
      if (map.hasPoi) {
        await client.delete(`/maps/${map.id}/pois/${poi.place_id}`);
      } else {
        await client.post(`/maps/${map.id}/pois`, {
          place_id: poi.place_id,
          name: poi.name,
          lat: Number(poi.lat),
          lng: Number(poi.lng),
          address: poi.address,
          category: poi.type,
          rating: poi.rating,
          userRatingsTotal: poi.user_ratings_total,
          thumbnail: poi.thumbnail,
          description: poi.description,
          wikipediaUrl: poi.wikipediaUrl,
          wikivoyageUrl: poi.wikivoyageUrl,
          website: poi.officialWebsite,
          phoneNumber: poi.phoneNumber,
        });
      }
      onMapsChange?.();
    } catch (error) {
      console.error('Failed to update map', error);
      setMaps(prev => prev.map(m => (m.id === map.id ? { ...m, hasPoi: map.hasPoi } : m)));
    }
  };
  if (!mounted) {
    return null;
  }
  if (!isVisible && !isOpen) {
    return null;
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-9999 flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen
          ? 'opacity-100 backdrop-blur-sm bg-black/30'
          : 'opacity-0 backdrop-blur-none bg-black/0'
      }`}
      onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all duration-300 flex flex-col max-h-[80vh] ${
          isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="text-xl font-bold text-gray-900">Save to Map</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <IoClose size={24} />
          </button>
        </div>
        <div className="mb-4 shrink-0">
          <CreateMapForm onMapCreated={handleMapCreated} />
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : maps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No maps found. Create one first!</div>
          ) : (
            maps.map(map => (
              <button
                key={map.id}
                onClick={() => toggleMap(map)}
                className={`w-full p-3 rounded-xl flex items-center space-x-3 transition-all border ${
                  map.hasPoi
                    ? 'bg-black text-white border-black'
                    : 'bg-gray-50 text-gray-900 border-gray-100 hover:bg-gray-100'
                }`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${
                    map.hasPoi ? 'bg-white/20' : 'bg-white'
                  }`}>
                  {map.icon || '🌍'}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-bold truncate">{map.title}</div>
                  {map.description && (
                    <div
                      className={`text-xs truncate ${map.hasPoi ? 'text-gray-300' : 'text-gray-500'}`}>
                      {map.description}
                    </div>
                  )}
                </div>
                {map.hasPoi && <IoCheckmark size={20} className="shrink-0" />}
              </button>
            ))
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-xl transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
