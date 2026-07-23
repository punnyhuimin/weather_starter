import type { Location } from '../../types';

export const SINGAPORE_CENTER: [number, number] = [1.3521, 103.8198];

export interface MapLocation {
  id: number;
  position: [number, number];
}

export interface WeatherLabel {
  temperature: string;
  condition: string;
  accessibleLabel: string;
}

export function getMapLocations(locations: Location[]): MapLocation[] {
  return locations.map(({ id, latitude, longitude }) => ({
    id,
    position: [latitude, longitude],
  }));
}

export function formatWeatherLabel(location: Location): WeatherLabel {
  const temperature =
    typeof location.weather.temperature_c === 'number' &&
    Number.isFinite(location.weather.temperature_c)
      ? `${Math.round(location.weather.temperature_c)}\u00b0`
      : '--\u00b0';
  const condition = location.weather.condition?.trim() || 'Conditions unavailable';
  const area =
    location.weather.area?.trim() ||
    `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`;

  return {
    temperature,
    condition,
    accessibleLabel: `${area}: ${temperature}, ${condition}`,
  };
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character] ?? character,
  );
}
