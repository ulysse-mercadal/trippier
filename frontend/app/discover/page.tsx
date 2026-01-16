// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import FilterBar from '../../components/FilterBar';
import client from '../../lib/client';
import { POI } from '../../lib/types';

const Map = dynamic(() => import('../../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
      Loading Map...
    </div>
  ),
});

export default function DiscoverPage() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [nearbyPois, setNearbyPois] = useState<POI[]>([]);
  const [searchResults, setSearchResults] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const lastCoords = useRef({ lat: 48.8584, lng: 2.2945 });

  useEffect(() => {
    const checkSize = () => {
      setIsSmallScreen(window.innerWidth < 1000);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const fetchNearby = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const response = await client.get('/discover/nearby', {
        params: { lat, lng, radius: 5 },
      });
      setNearbyPois(response.data);
    } catch (error) {
      console.error('Failed to fetch nearby POIs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearch = useCallback(async (lat: number, lng: number, q: string) => {
    if (!q) {
      setSearchResults([]);
      return;
    }
    try {
      setLoading(true);
      const response = await client.get('/discover/nearby', {
        params: { lat, lng, radius: 50, q },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      fetchSearch(lastCoords.current.lat, lastCoords.current.lng, text);
    },
    [fetchSearch],
  );

  const handleMapMove = useCallback(
    (lat: number, lng: number) => {
      lastCoords.current = { lat, lng };
      fetchNearby(lat, lng);
      if (searchQuery) {
        fetchSearch(lat, lng, searchQuery);
      }
    },
    [fetchNearby, fetchSearch, searchQuery],
  );

  const handlePoiSelect = useCallback(async (poi: POI | null) => {
    setSelectedPoi(poi);
    if (poi) {
      const lat = typeof poi.lat === 'string' ? parseFloat(poi.lat) : poi.lat;
      const lng = typeof poi.lng === 'string' ? parseFloat(poi.lng) : poi.lng;
      lastCoords.current = { lat, lng };
      try {
        setLoading(true);
        const response = await client.get('/discover/details', {
          params: {
            place_id: poi.place_id,
            name: poi.name,
            lat,
            lng,
          },
        });
        setSelectedPoi(prev =>
          prev
            ? {
                ...prev,
                description: response.data.description,
                wikipediaUrl: response.data.wikipediaUrl,
                wikivoyageUrl: response.data.wikivoyageUrl,
                officialWebsite: response.data.website,
                phoneNumber: response.data.phoneNumber,
              }
            : null,
        );
      } catch (error) {
        console.error('Failed to fetch POI details:', error);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      <FilterBar
        isExpanded={isExpanded}
        onToggle={setIsExpanded}
        isSmallScreen={isSmallScreen}
        nearbyPois={nearbyPois}
        searchResults={searchResults}
        searchQuery={searchQuery}
        loading={loading}
        onSearch={handleSearch}
        onPoiSelect={handlePoiSelect}
        selectedPoi={selectedPoi}
      />
      <motion.div
        className="absolute z-10 overflow-hidden shadow-2xl"
        initial={false}
        animate={{
          top: isExpanded ? 12 : 0,
          left: isExpanded ? (isSmallScreen ? '100vw' : '33vw') : 0,
          right: isExpanded ? 12 : 0,
          bottom: isExpanded ? 12 : 0,
          borderRadius: isExpanded ? 24 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <Map
          onCenterChanged={handleMapMove}
          targetLocation={
            selectedPoi
              ? {
                  lat:
                    typeof selectedPoi.lat === 'string'
                      ? parseFloat(selectedPoi.lat)
                      : selectedPoi.lat,
                  lng:
                    typeof selectedPoi.lng === 'string'
                      ? parseFloat(selectedPoi.lng)
                      : selectedPoi.lng,
                }
              : null
          }
        />
      </motion.div>
    </div>
  );
}
