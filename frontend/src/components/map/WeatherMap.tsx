import { useEffect, useMemo } from 'react';
import { divIcon, latLngBounds } from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import type { Location } from '../../types';
import {
  escapeHtml,
  formatWeatherLabel,
  getMapLocations,
  SINGAPORE_CENTER,
} from './mapModel';

interface WeatherMapProps {
  locations: Location[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  className?: string;
}

function ViewportSync({ locations }: { locations: Location[] }) {
  const map = useMap();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize();
      const points = getMapLocations(locations).map(({ position }) => position);

      if (points.length === 0) {
        map.setView(SINGAPORE_CENTER, 11, { animate: false });
      } else if (points.length === 1) {
        map.setView(points[0], 13, { animate: false });
      } else {
        map.fitBounds(latLngBounds(points), {
          animate: false,
          maxZoom: 13,
          padding: [54, 54],
        });
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [locations, map]);

  return null;
}

interface WeatherMarkerProps {
  location: Location;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

function WeatherMarker({ location, isSelected, onSelect }: WeatherMarkerProps) {
  const label = formatWeatherLabel(location);
  const icon = useMemo(
    () =>
      divIcon({
        className: 'weather-marker-host',
        html: `<div class="weather-marker${isSelected ? ' weather-marker--selected' : ''}">
          <div class="weather-marker__label">
            <strong>${escapeHtml(label.temperature)}</strong>
            <span>${escapeHtml(label.condition)}</span>
          </div>
          <span class="weather-marker__pin" aria-hidden="true"></span>
        </div>`,
        iconAnchor: [68, 52],
        iconSize: [136, 56],
      }),
    [isSelected, label.condition, label.temperature],
  );

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{ click: () => onSelect(location.id) }}
      title={label.accessibleLabel}
      keyboard
    />
  );
}

export function WeatherMap({
  locations,
  selectedId,
  onSelect,
  className = '',
}: WeatherMapProps) {
  return (
    <MapContainer
      center={SINGAPORE_CENTER}
      zoom={11}
      scrollWheelZoom
      className={`weather-map ${className}`}
      zoomControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ViewportSync locations={locations} />
      {locations.map((location) => (
        <WeatherMarker
          key={location.id}
          location={location}
          isSelected={location.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </MapContainer>
  );
}
