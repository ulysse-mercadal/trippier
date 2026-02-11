// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, OverlayView } from '@react-google-maps/api';
import { POI } from '../lib/types';

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 48.8584,
  lng: 2.2945,
};

const mapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#757575' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'poi', stylers: [{ visibility: 'on' }] },
  { featureType: 'transit', stylers: [{ visibility: 'on' }] },
];

interface MapProps {
  onCenterChanged?: (lat: number, lng: number) => void;
  targetLocation?: { lat: number; lng: number } | null;
  mapPois?: { poi: POI; mapIcon: string }[];
  onPoiClick?: (poi: POI) => void;
}

export default function Map({ onCenterChanged, targetLocation, mapPois, onPoiClick }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const isAnimating = useRef(false);
  const lastAnimatedCoords = useRef<{ lat: number; lng: number } | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(function callback() {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (!mapRef.current || !targetLocation) {
      lastAnimatedCoords.current = null;
      return;
    }
    if (
      lastAnimatedCoords.current?.lat === targetLocation.lat &&
      lastAnimatedCoords.current?.lng === targetLocation.lng
    ) {
      return;
    }
    const map = mapRef.current;
    lastAnimatedCoords.current = targetLocation;
    map.setCenter(targetLocation);
    map.setZoom(17);
    const center = map.getCenter();
    if (center && onCenterChanged) {
      onCenterChanged(center.lat(), center.lng());
    }
  }, [targetLocation, onCenterChanged]);

  const handleIdle = useCallback(() => {
    if (mapRef.current && onCenterChanged && !isAnimating.current) {
      const center = mapRef.current.getCenter();
      if (center) {
        onCenterChanged(center.lat(), center.lng());
      }
    }
  }, [onCenterChanged]);
  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-[#212121] flex items-center justify-center text-white">
        Loading Map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onIdle={handleIdle}
      options={{
        styles: mapStyle,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
        clickableIcons: false,
      }}>
      {targetLocation && (
        <MarkerF
          position={targetLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#000',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
            scale: 8,
          }}
        />
      )}
      {mapPois?.map((item, index) => {
        const id = item.poi.place_id || item.poi.id;
        if (!id) {
          return null;
        }
        return (
          <OverlayView
            key={`${id}-${index}`}
            position={{
              lat: typeof item.poi.lat === 'string' ? parseFloat(item.poi.lat) : item.poi.lat,
              lng: typeof item.poi.lng === 'string' ? parseFloat(item.poi.lng) : item.poi.lng,
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
            <div
              onClick={e => {
                e.stopPropagation();
                onPoiClick?.(item.poi);
              }}
              className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group hover:z-50"
              style={{ width: '56px', height: '56px' }}>
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
          </OverlayView>
        );
      })}
    </GoogleMap>
  );
}
