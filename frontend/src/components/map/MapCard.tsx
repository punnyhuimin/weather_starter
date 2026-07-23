import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Location } from '../../types';
import { CloseIcon, ExpandIcon, LocationIcon } from '../icons';
import { WeatherMap } from './WeatherMap';

interface MapCardProps {
  locations: Location[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function MapCard({ locations, selectedId, onSelect }: MapCardProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isFullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsFullscreen(false);
    };
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
      expandButtonRef.current?.focus();
    };
  }, [isFullscreen]);

  const locationSummary = `${locations.length} saved ${locations.length === 1 ? 'location' : 'locations'}`;

  return (
    <>
      <section className="map-card overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] backdrop-blur-xl">
        <header className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
              <LocationIcon className="h-3.5 w-3.5" />
              <span>Map</span>
            </div>
            <p className="mt-1 text-xs text-white/55">{locationSummary}</p>
          </div>
          <button
            ref={expandButtonRef}
            type="button"
            onClick={() => setIsFullscreen(true)}
            aria-label="Expand map"
            className="rounded-full border border-white/15 bg-white/10 p-2 text-white/85 hover:bg-white/20"
          >
            <ExpandIcon className="h-4 w-4" />
          </button>
        </header>
        <div className="h-72 sm:h-80">
          <WeatherMap locations={locations} selectedId={selectedId} onSelect={onSelect} />
        </div>
      </section>

      {isFullscreen &&
        createPortal(
          <div
            className="map-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-dialog-title"
            aria-describedby="map-dialog-summary"
          >
            <div className="map-dialog__map">
              <WeatherMap locations={locations} selectedId={selectedId} onSelect={onSelect} />
            </div>
            <header className="map-dialog__header">
              <div>
                <h2 id="map-dialog-title" className="text-sm font-semibold text-white">
                  Weather Map
                </h2>
                <p id="map-dialog-summary" className="mt-0.5 text-xs text-white/65">
                  {locationSummary}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setIsFullscreen(false)}
                aria-label="Close fullscreen map"
                className="rounded-full border border-white/20 bg-black/20 p-2.5 text-white hover:bg-black/35"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </header>
          </div>,
          document.body,
        )}
    </>
  );
}
