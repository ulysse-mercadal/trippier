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
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

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
}

export default function Map({ onCenterChanged, targetLocation }: MapProps) {
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

  const calculateDistance = (
    p1: { lat: number; lng: number },
    p2: { lat: number; lng: number },
  ) => {
    const R = 6371;
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

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
    const currentCenter = map.getCenter()?.toJSON();
    if (!currentCenter) {
      return;
    }
    isAnimating.current = true;
    lastAnimatedCoords.current = targetLocation;
    const distance = calculateDistance(currentCenter, targetLocation);
    let flyZoom = 12;
    if (distance > 1000) {
      flyZoom = 3;
    } else if (distance > 100) {
      flyZoom = 5;
    } else if (distance > 10) {
      flyZoom = 8;
    }
    map.setOptions({ gestureHandling: 'none' });
    map.setZoom(flyZoom);
    setTimeout(() => {
      map.panTo(targetLocation);
      const listener = google.maps.event.addListener(map, 'idle', () => {
        map.setZoom(17);
        google.maps.event.removeListener(listener);
        map.setOptions({ gestureHandling: 'greedy' });
        setTimeout(() => {
          isAnimating.current = false;
          const center = map.getCenter();
          if (center && onCenterChanged) {
            onCenterChanged(center.lat(), center.lng());
          }
        }, 500);
      });
    }, 400);
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
    </GoogleMap>
  );
}
