'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface AnuntMapViewProps {
  lat?: number;
  lng?: number;
  title: string;
}

function LocationMarker({ listingLat, listingLng, title }: { listingLat: number, listingLng: number, title: string }) {
  const [position, setPosition] = useState<[number, number]>([listingLat || 44.4268, listingLng || 26.1025]);
  const [distance, setDistance] = useState<string>('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;
          setPosition([userLat, userLng]);
          const dist = calculateDistance(userLat, userLng, listingLat, listingLng);
          setDistance(`${dist.toFixed(1)} km`);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, [listingLat, listingLng]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useMapEvents({
    click: () => {
      navigator.geolocation.getCurrentPosition((pos) => setPosition([pos.coords.latitude, pos.coords.longitude]));
    }
  });

  return (
    <>
      <Marker position={position}>
        <Popup>Poziția ta: {distance ? distance : 'Calculând...'}</Popup>
      </Marker>
      <Marker position={[listingLat || 44.4268, listingLng || 26.1025]}>
        <Popup>{title}</Popup>
      </Marker>
    </>
  );
}

export default function AnuntMapView({ lat, lng, title }: AnuntMapViewProps) {
  const listingPosition: LatLngExpression = [lat || 44.4268, lng || 26.1025];

  return (
    <div className="h-96 w-full rounded-lg shadow-lg">
      <MapContainer center={listingPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker listingLat={lat || 44.4268} listingLng={lng || 26.1025} title={title} />
      </MapContainer>
    </div>
  );
}
