"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
}

export default function VisitorMap({ points }: { points: MapPoint[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    async function init() {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;

      map = L.map(ref.current, { scrollWheelZoom: false }).setView([20, 0], 2);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const bounds: [number, number][] = [];

      for (const p of points) {
        L.circleMarker([p.latitude, p.longitude], {
          radius: 8,
          color: "#1d4ed8",
          fillColor: "#3b82f6",
          fillOpacity: 0.8,
          weight: 2,
        })
          .bindPopup(p.label)
          .addTo(map);
        bounds.push([p.latitude, p.longitude]);
      }

      if (bounds.length === 1) map.setView(bounds[0], 13);
      else if (bounds.length > 1) map.fitBounds(bounds, { padding: [40, 40] });
    }

    void init();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [points]);

  return (
    <div
      ref={ref}
      className="h-80 w-full overflow-hidden rounded-xl border border-white/10"
    />
  );
}
