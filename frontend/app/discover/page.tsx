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
import { POI, Map as MapType } from '../../lib/types';
import { useAuth } from '../../context/AuthContext';

const MapComponent = dynamic(() => import('../../components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">
      Loading Map...
    </div>
  ),
});

export default function DiscoverPage() {
  const { token } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [nearbyPois, setNearbyPois] = useState<POI[]>([]);
  const [searchResults, setSearchResults] = useState<POI[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [weights, setWeights] = useState('culture:5,nature:5,food:5');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [focusedPoi, setFocusedPoi] = useState<POI | null>(null);
  const [hoveredPoi, setHoveredPoi] = useState<POI | null>(null);
  const [maps, setMaps] = useState<MapType[]>([]);
  const lastCoords = useRef({ lat: 48.8584, lng: 2.2945 });
  const lastFetchedCoords = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const checkSize = () => {
      setIsSmallScreen(window.innerWidth < 1000);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const fetchMaps = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const response = await client.get('/maps');
      setMaps(response.data);
    } catch (error) {
      console.error('Failed to fetch maps:', error);
    }
  }, [token]);
  useEffect(() => {
    if (token) {
      fetchMaps();
    }
  }, [token, fetchMaps]);

  const handleDeleteMap = async (id: number) => {
    if (!token) {
      return;
    }
    try {
      await client.delete(`/maps/${id}`);
      fetchMaps();
    } catch (error) {
      console.error('Failed to delete map:', error);
      alert('Failed to delete map.');
    }
  };

  const handleUpdateMap = async (id: number, data: Partial<MapType>) => {
    if (!token) {
      return;
    }
    try {
      await client.patch(`/maps/${id}`, data);
      fetchMaps();
    } catch (error) {
      console.error('Failed to update map:', error);
      alert('Failed to update map.');
    }
  };

  const visibleMapPois = React.useMemo(() => {
    const poisMap = new Map<string, { poi: POI; mapIcon: string }>();
    maps.forEach(map => {
      if (map.isVisible && map.pois) {
        map.pois.forEach(p => {
          const id = p.place_id || p.id;
          if (id && !poisMap.has(id)) {
            poisMap.set(id, { poi: p, mapIcon: map.icon || '🌍' });
          }
        });
      }
    });
    return Array.from(poisMap.values());
  }, [maps]);

  const orderedNearbyPois = React.useMemo(() => {
    if (!focusedPoi) {
      return nearbyPois;
    }
    return [focusedPoi, ...nearbyPois.filter(p => p.place_id !== focusedPoi.place_id)];
  }, [nearbyPois, focusedPoi]);

  const orderedSearchResults = React.useMemo(() => {
    if (!focusedPoi) {
      return searchResults;
    }
    const exists = searchResults.some(p => p.place_id === focusedPoi.place_id);
    if (!exists) {
      return searchResults;
    }
    return [focusedPoi, ...searchResults.filter(p => p.place_id !== focusedPoi.place_id)];
  }, [searchResults, focusedPoi]);

  const fetchNearby = useCallback(async (lat: number, lng: number, currentWeights: string) => {
    try {
      setLoading(true);
      const response = await client.get('/discover/nearby', {
        params: { lat, lng, radius: 5, weights: currentWeights },
      });
      setNearbyPois(response.data);
    } catch (error) {
      console.error('Failed to fetch nearby POIs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSearch = useCallback(
    async (lat: number, lng: number, q: string, currentWeights: string) => {
      if (!q) {
        setSearchResults([]);
        return;
      }
      try {
        setLoading(true);
        const response = await client.get('/discover/nearby', {
          params: { lat, lng, radius: 50, q, weights: currentWeights },
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Failed to fetch search results:', error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      fetchSearch(lastCoords.current.lat, lastCoords.current.lng, text, weights);
    },
    [fetchSearch, weights],
  );

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const handleMapMove = useCallback(
    (lat: number, lng: number) => {
      lastCoords.current = { lat, lng };
      const shouldFetch =
        !lastFetchedCoords.current ||
        calculateDistance(lat, lng, lastFetchedCoords.current.lat, lastFetchedCoords.current.lng) >
          0.5;
      if (shouldFetch) {
        lastFetchedCoords.current = { lat, lng };
        fetchNearby(lat, lng, weights);
        if (searchQuery) {
          fetchSearch(lat, lng, searchQuery, weights);
        }
      }
    },
    [fetchNearby, fetchSearch, searchQuery, weights],
  );

  const handleWeightsChange = useCallback(
    (newWeights: string) => {
      setWeights(newWeights);
      fetchNearby(lastCoords.current.lat, lastCoords.current.lng, newWeights);
      if (searchQuery) {
        fetchSearch(lastCoords.current.lat, lastCoords.current.lng, searchQuery, newWeights);
      }
    },
    [fetchNearby, fetchSearch, searchQuery],
  );

  const handlePoiSelect = useCallback(async (poi: POI | null) => {
    setSelectedPoi(poi);
    if (poi) {
      setIsExpanded(true);
      setFocusedPoi(poi);
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
                wikivoyageUrl: response.data.wikivoyageUrl,
                officialWebsite: response.data.website,
                phoneNumber: response.data.phoneNumber,
                lat: response.data.lat ?? prev.lat,
                lng: response.data.lng ?? prev.lng,
              }
            : null,
        );
      } catch (error) {
        console.error('Failed to fetch POI details:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setFocusedPoi(null);
    }
  }, []);

  const handleZoomToPoi = useCallback((poi: POI) => {
    setFocusedPoi(poi);
  }, []);

  const handleHover = useCallback((poi: POI | null) => {
    setHoveredPoi(poi);
  }, []);

  const targetLocation = React.useMemo(() => {
    const poi = focusedPoi || selectedPoi;
    if (!poi) {
      return null;
    }
    return {
      lat: typeof poi.lat === 'string' ? parseFloat(poi.lat) : poi.lat,
      lng: typeof poi.lng === 'string' ? parseFloat(poi.lng) : poi.lng,
      id: poi.place_id,
    };
  }, [focusedPoi, selectedPoi]);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      <FilterBar
        isExpanded={isExpanded}
        onToggle={setIsExpanded}
        isSmallScreen={isSmallScreen}
        nearbyPois={orderedNearbyPois}
        searchResults={orderedSearchResults}
        searchQuery={searchQuery}
        loading={loading}
        onSearch={handleSearch}
        onPoiSelect={handlePoiSelect}
        selectedPoi={selectedPoi}
        onZoom={handleZoomToPoi}
        onHover={handleHover}
        focusedPoi={focusedPoi}
        maps={maps}
        onDeleteMap={handleDeleteMap}
        onUpdateMap={handleUpdateMap}
        onMapCreated={fetchMaps}
        onMapsRefresh={fetchMaps}
        weights={weights}
        onWeightsChange={handleWeightsChange}
      />
      <motion.div
        className="absolute z-10 overflow-hidden shadow-2xl"
        initial={false}
        animate={{
          top: isExpanded ? (isSmallScreen ? 0 : 12) : 0,
          left: isExpanded ? (isSmallScreen ? 0 : '33vw') : 0,
          right: isExpanded ? (isSmallScreen ? 0 : 12) : 0,
          bottom: isExpanded ? (isSmallScreen ? 0 : 12) : 0,
          borderRadius: isExpanded ? (isSmallScreen ? 0 : 24) : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
        <MapComponent
          onCenterChanged={handleMapMove}
          mapPois={visibleMapPois}
          onPoiClick={handlePoiSelect}
          hoveredPoi={hoveredPoi}
          targetLocation={targetLocation}
        />
      </motion.div>
    </div>
  );
}
