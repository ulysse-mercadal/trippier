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
import {
  IoArrowBack,
  IoInformationCircleOutline,
  IoGlobeOutline,
  IoMapOutline,
  IoCheckmarkOutline,
  IoCallOutline,
  IoBookmarkOutline,
  IoBookmark,
} from 'react-icons/io5';
import clsx from 'clsx';
import Image from 'next/image';
import { POI, Map } from '../../lib/types';
import CommentSection from './CommentSection';
import MapSelectionModal from '../MapSelectionModal';
import { useAuth } from '../../context/AuthContext';

interface PoiDetailViewProps {
  selectedPoi: POI;
  onPoiSelect?: (poi: POI | null) => void;
  loading: boolean;
  onSearch?: (text: string) => void;
  setInputValue: (val: string) => void;
  maps?: Map[];
  onMapClick?: (mapId: number) => void;
  onShowWiki?: (url: string | null) => void;
}

export default function PoiDetailView({
  selectedPoi,
  onPoiSelect,
  loading,
  onSearch,
  setInputValue,
  maps = [],
  onMapClick,
  onShowWiki,
}: PoiDetailViewProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const savedInMaps = useMemo(() => {
    return maps.filter(m =>
      m.pois?.some(p => {
        const lat1 = Number(p.lat);
        const lng1 = Number(p.lng);
        const lat2 = Number(selectedPoi.lat);
        const lng2 = Number(selectedPoi.lng);
        return Math.abs(lat1 - lat2) < 0.0001 && Math.abs(lng1 - lng2) < 0.0001;
      }),
    );
  }, [maps, selectedPoi.lat, selectedPoi.lng]);

  const copyToClipboard = (text: string) => {
    if (copied) {
      return;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const openUrl = (url: string) => {
    if (!url) {
      return;
    }
    const finalUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(finalUrl, '_blank');
  };

  const isCurrentImgError = selectedPoi && imgError === selectedPoi.place_id;

  return (
    <motion.div
      key={`detail-${selectedPoi.place_id || selectedPoi.name}`}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col overflow-y-auto p-6 scrollbar-hide pb-24">
      <div className="flex items-center justify-between mb-6">
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

        {user && (
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all bg-black text-white hover:bg-gray-800">
            {savedInMaps.length > 0 ? (
              <>
                <IoBookmark size={18} /> Saved
              </>
            ) : (
              <>
                <IoBookmarkOutline size={18} /> Save
              </>
            )}
          </button>
        )}
      </div>

      {!user && (
        <div className="mb-8 bg-gray-50 p-6 rounded-3xl border border-gray-100 text-center">
          <p className="text-sm text-gray-600 mb-4 font-medium">
            Login to save this place to your maps and plan your trip.
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full py-3 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all uppercase text-xs tracking-widest shadow-sm">
            Login or Register
          </button>
        </div>
      )}

      {selectedPoi.thumbnail && !isCurrentImgError && (
        <div className="w-full h-auto rounded-3xl overflow-hidden mb-6 shadow-md border border-gray-100 relative min-h-50">
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
                    {copied ? <IoCheckmarkOutline size={18} /> : <IoCallOutline size={18} />}
                  </button>
                )}
              </div>
            ) : (
              loading && <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
            )}
            {selectedPoi.wikivoyageUrl ? (
              <button
                onClick={() =>
                  selectedPoi.wikivoyageUrl &&
                  (onShowWiki
                    ? onShowWiki(selectedPoi.wikivoyageUrl)
                    : openUrl(selectedPoi.wikivoyageUrl))
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

        {savedInMaps.length > 0 && (
          <section className="pt-4 border-t border-gray-100">
            <div className="flex items-center text-gray-400 mb-4">
              <IoBookmarkOutline size={20} className="mr-2" />
              <h4 className="text-xs font-bold uppercase tracking-wider">Saved in your maps</h4>
            </div>
            <div className="flex flex-col gap-2">
              {savedInMaps.map(map => (
                <button
                  key={map.id}
                  onClick={() => onMapClick?.(map.id)}
                  className="flex items-center p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all border border-gray-100 group">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm mr-3">
                    {map.icon || '🌍'}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-bold text-gray-900 truncate">{map.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {map.pois?.length || 0} locations
                    </p>
                  </div>
                  <IoArrowBack
                    size={16}
                    className="rotate-180 text-gray-300 group-hover:text-black transition-colors"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        <CommentSection poi={selectedPoi} />
      </div>

      <MapSelectionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        poi={selectedPoi}
      />
    </motion.div>
  );
}
