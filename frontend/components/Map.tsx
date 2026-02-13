// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React, { useEffect, useRef } from 'react';
import Map, {
  Marker,
  MapRef,
  NavigationControl,
  ViewStateChangeEvent,
} from 'react-map-gl/maplibre';
import { POI } from '../lib/types';

interface MapProps {
  onCenterChanged?: (lat: number, lng: number) => void;
  targetLocation?: { lat: number; lng: number } | null;
  mapPois?: { poi: POI; mapIcon: string }[];
  onPoiClick?: (poi: POI) => void;
  hoveredPoi?: POI | null;
}

export default function MapComponent({
  onCenterChanged,
  targetLocation,
  mapPois,
  onPoiClick,
  hoveredPoi,
}: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const mapId = process.env.MAPTILER_MAP_ID || 'dataviz-dark';
  const apiKey = process.env.MAPTILER_API_KEY;

  const mapStyle = React.useMemo(() => {
    if (!apiKey) {
      return undefined;
    }
    return `https://api.maptiler.com/maps/${mapId}/style.json?key=${apiKey}`;
  }, [mapId, apiKey]);

  useEffect(() => {
    if (targetLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [targetLocation.lng, targetLocation.lat],
        zoom: 17,
        duration: 1500,
      });
    }
  }, [targetLocation]);
  const onMoveEnd = (evt: ViewStateChangeEvent) => {
    if (onCenterChanged) {
      const { longitude, latitude } = evt.viewState;
      onCenterChanged(latitude, longitude);
    }
  };

  if (!mapStyle) {
    return (
      <div className="w-full h-full bg-[#212121] text-white flex items-center justify-center">
        Missing API Key
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#212121] text-white relative">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 2.2945,
          latitude: 48.8584,
          zoom: 14,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        onMoveEnd={onMoveEnd}
        attributionControl={false}>
        <NavigationControl position="bottom-right" showCompass={false} />
        {hoveredPoi && (
          <Marker
            longitude={
              typeof hoveredPoi.lng === 'string' ? parseFloat(hoveredPoi.lng) : hoveredPoi.lng
            }
            latitude={
              typeof hoveredPoi.lat === 'string' ? parseFloat(hoveredPoi.lat) : hoveredPoi.lat
            }
            anchor="bottom"
            style={{ zIndex: 100 }}>
            <div className="relative w-14 h-14 cursor-pointer">
              <svg
                viewBox="0 0 24 24"
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="1"
                className="w-full h-full drop-shadow-md scale-110">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
            </div>
          </Marker>
        )}
        {targetLocation && (
          <Marker longitude={targetLocation.lng} latitude={targetLocation.lat} anchor="center">
            <div
              className="w-4 h-4 rounded-full bg-black border-2 border-white shadow-lg"
              style={{ transform: 'scale(1.5)' }}
            />
          </Marker>
        )}
        {mapPois?.map((item, index) => {
          const id = item.poi.place_id || item.poi.id || `poi-${index}`;
          const lat = typeof item.poi.lat === 'string' ? parseFloat(item.poi.lat) : item.poi.lat;
          const lng = typeof item.poi.lng === 'string' ? parseFloat(item.poi.lng) : item.poi.lng;
          return (
            <Marker
              key={id}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                onPoiClick?.(item.poi);
              }}>
              <div className="relative w-14 h-14 group cursor-pointer hover:z-50">
                <svg
                  viewBox="0 0 24 24"
                  fill="white"
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  className="w-full h-full drop-shadow-md group-hover:scale-110 transition-transform origin-bottom">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                </svg>
                <div className="absolute top-0 left-0 w-full h-[75%] flex items-center justify-center text-xl group-hover:scale-110 transition-transform origin-bottom pointer-events-none">
                  {item.mapIcon}
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
