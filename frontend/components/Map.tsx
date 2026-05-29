// **************************************************************************
//
//  Trippier Project - Web App
//
//  By: Ulysse Mercadal
//  Email: ulyssemercadal@kakao.com
//
// **************************************************************************

'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import Map, {
  Marker,
  MapRef,
  NavigationControl,
  ViewStateChangeEvent,
  Source,
  Layer,
} from 'react-map-gl/maplibre';
import { POI } from '../lib/types';
import { getPoiTypeInfo } from '../lib/poi-type-utils';

interface MapProps {
  onCenterChanged?: (lat: number, lng: number) => void;
  targetLocation?: { lat: number; lng: number; approximate?: boolean } | null;
  mapPois?: { poi: POI; mapIcon: string }[];
  onPoiClick?: (poi: POI) => void;
  hoveredPoi?: POI | null;
  hoveredZone?: GeoJSON.Feature | null;
  resultZones?: GeoJSON.FeatureCollection | null;
}

function registerHatchPattern(map: maplibregl.Map, name: string, r: number, g: number, b: number) {
  if (map.hasImage(name)) {
    return;
  }
  const size = 10;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.65)`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-size / 2, size / 2);
  ctx.lineTo(size / 2, -size / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(size / 2, size * 1.5);
  ctx.lineTo(size * 1.5, size / 2);
  ctx.stroke();
  const { data } = ctx.getImageData(0, 0, size, size);
  map.addImage(name, { width: size, height: size, data });
}

export default function MapComponent({
  onCenterChanged,
  targetLocation,
  mapPois,
  onPoiClick,
  hoveredPoi,
  hoveredZone,
  resultZones,
}: MapProps) {
  const mapRef = useRef<MapRef>(null);
  const mapId = process.env.MAPTILER_MAP_ID || 'dataviz-dark';
  const apiKey = process.env.MAPTILER_API_KEY;

  const mapStyle = useMemo(() => {
    if (!apiKey) {
      return undefined;
    }
    return `https://api.maptiler.com/maps/${mapId}/style.json?key=${apiKey}`;
  }, [mapId, apiKey]);

  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) {
      return;
    }
    // Blue: for approximate zone polygons
    registerHatchPattern(map, 'hatch-blue', 59, 130, 246);
    // Red: for the active search area
    registerHatchPattern(map, 'hatch-red', 239, 68, 68);
  }, []);

  useEffect(() => {
    if (targetLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [targetLocation.lng, targetLocation.lat],
        zoom: targetLocation.approximate ? 13 : 17,
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
        onLoad={onMapLoad}
        attributionControl={false}>
        <NavigationControl position="bottom-right" showCompass={false} />

        {resultZones && (
          <Source id="result-zones" type="geojson" data={resultZones}>
            <Layer
              id="result-zones-hatch"
              type="fill"
              paint={{ 'fill-pattern': 'hatch-red', 'fill-opacity': 1 }}
            />
            <Layer
              id="result-zones-outline"
              type="line"
              paint={{ 'line-color': '#ef4444', 'line-width': 2, 'line-opacity': 0.9 }}
            />
          </Source>
        )}

        {hoveredZone && (
          <Source id="hovered-zone" type="geojson" data={hoveredZone}>
            <Layer
              id="hovered-zone-hatch"
              type="fill"
              paint={{ 'fill-pattern': 'hatch-blue', 'fill-opacity': 1 }}
            />
            <Layer
              id="hovered-zone-outline"
              type="line"
              paint={{ 'line-color': '#3b82f6', 'line-width': 2.5, 'line-opacity': 1 }}
            />
          </Source>
        )}

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
                stroke="#374151"
                strokeWidth="1.5"
                className="w-full h-full drop-shadow-lg scale-110">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              </svg>
              {hoveredPoi.type &&
                (() => {
                  const HoverIcon = getPoiTypeInfo(hoveredPoi.type).Icon;
                  return (
                    <div className="absolute top-0 left-0 w-full h-[75%] flex items-center justify-center pointer-events-none scale-110">
                      <HoverIcon size={18} color="#374151" />
                    </div>
                  );
                })()}
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
              <div
                className={`relative w-14 h-14 group cursor-pointer hover:z-50 ${item.poi.coordsApproximate ? 'opacity-60' : ''}`}>
                <svg
                  viewBox="0 0 24 24"
                  fill={item.poi.coordsApproximate ? '#e5e7eb' : 'white'}
                  stroke={item.poi.coordsApproximate ? '#9ca3af' : '#e5e7eb'}
                  strokeWidth={item.poi.coordsApproximate ? '1.5' : '1'}
                  strokeDasharray={item.poi.coordsApproximate ? '2 1' : undefined}
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
