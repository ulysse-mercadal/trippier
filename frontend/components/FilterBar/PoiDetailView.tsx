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
import {
  IoArrowBack,
  IoStar,
  IoPeople,
  IoInformationCircleOutline,
  IoGlobeOutline,
  IoMapOutline,
  IoCheckmarkOutline,
  IoCallOutline,
  IoReaderOutline,
} from 'react-icons/io5';
import clsx from 'clsx';
import Image from 'next/image';
import { POI } from '../../lib/types';

interface PoiDetailViewProps {
  selectedPoi: POI;
  onPoiSelect?: (poi: POI | null) => void;
  loading: boolean;
  onSearch?: (text: string) => void;
  setInputValue: (val: string) => void;
}

export default function PoiDetailView({
  selectedPoi,
  onPoiSelect,
  loading,
  onSearch,
  setInputValue,
}: PoiDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

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
      <div className="flex items-center mb-6">
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
      </div>
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
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center text-yellow-500">
          <IoStar size={16} className="mr-1" />
          <span className="text-sm font-bold">{selectedPoi.rating}</span>
        </div>
        <div className="flex items-center text-gray-400">
          <IoPeople size={16} className="mr-1" />
          <span className="text-sm font-medium">
            {selectedPoi.user_ratings_total?.toLocaleString()} reviews
          </span>
        </div>
      </div>
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
            {selectedPoi.wikipediaUrl ? (
              <button
                onClick={() => selectedPoi.wikipediaUrl && openUrl(selectedPoi.wikipediaUrl)}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-black text-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                <span className="font-bold text-sm">Wikipedia</span>
                <IoReaderOutline size={18} />
              </button>
            ) : (
              loading && <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
            )}
            {selectedPoi.wikivoyageUrl ? (
              <button
                onClick={() => selectedPoi.wikivoyageUrl && openUrl(selectedPoi.wikivoyageUrl)}
                className="w-full flex items-center justify-between p-4 bg-white border-2 border-black text-black rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                <span className="font-bold text-sm">Travel Guide</span>
                <IoGlobeOutline size={18} />
              </button>
            ) : (
              loading && <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
            )}
          </div>
        </section>
        <section>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Location
          </h4>
          <p className="text-sm text-gray-500">{selectedPoi.address}</p>
        </section>
      </div>
    </motion.div>
  );
}
