"use client";

import { useEffect, useRef, useState } from "react";

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
}

export default function LocationPage() {
  const [userId, setUserId] = useState("USER123");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const watchId = useRef<number | null>(null);

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setTracking(false);
    setStatus("Tracking stopped");
  };

  const startTracking = () => {
    if (!userId.trim()) {
      setError("Please enter a user ID");
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    if (watchId.current !== null) return;

    setError("");
    setStatus("Requesting location permission...");

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const coords = position.coords;

        const data: LocationData = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          altitude: coords.altitude,
          speed: coords.speed,
          heading: coords.heading,
        };

        setLocation(data);
        setTracking(true);
        setStatus("Location acquired");

        try {
          const response = await fetch("/api/location", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId.trim(),
              ...data,
              timestamp: position.timestamp,
            }),
          });

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || "Failed to sync location");
          }

          setLastUpdated(new Date().toLocaleTimeString());
          setStatus("Live location synced");
        } catch (err) {
          setStatus("Location acquired, server sync failed");
          setError(
            err instanceof Error ? err.message : "Server error"
          );
        }
      },
      (err) => {
        setError(err.message);
        setStatus("Location error");
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 20000,
      }
    );
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-5">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111113] p-6 shadow-2xl">

        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-500/15 flex items-center justify-center text-blue-400 text-xl">
              ◎
            </div>

            <div>
              <h1 className="text-xl font-bold">
                Live Location
              </h1>
              <p className="text-sm text-zinc-500">
                GPS Location Tracking System
              </p>
            </div>
          </div>
        </div>

        <label className="mb-2 block text-sm text-zinc-400">
          User ID
        </label>

        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          disabled={tracking}
          placeholder="Enter user ID"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-blue-500 disabled:opacity-50"
        />

        <div className="my-5 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">
              Tracking status
            </span>

            <span className={`text-xs ${tracking ? "text-green-400" : "text-zinc-500"}`}>
              {tracking ? "● LIVE" : "● OFFLINE"}
            </span>
          </div>

          <p className="mt-3 text-sm text-zinc-300">
            {status}
          </p>

          {lastUpdated && (
            <p className="mt-1 text-xs text-zinc-500">
              Last synced: {lastUpdated}
            </p>
          )}
        </div>

        {location && (
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Latitude", location.latitude],
              ["Longitude", location.longitude],
              ["Accuracy", `${location.accuracy.toFixed(2)} m`],
              ["Altitude", location.altitude == null ? "N/A" : `${location.altitude} m`],
              ["Speed", location.speed == null ? "N/A" : `${(location.speed * 3.6).toFixed(2)} km/h`],
              ["Heading", location.heading == null ? "N/A" : `${location.heading}°`],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-xl border border-white/10 bg-black/20 p-3"
              >
                <p className="text-xs text-zinc-500">{label}</p>
                <p className="mt-2 break-all text-sm font-medium">
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={startTracking}
            disabled={tracking}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Tracking
          </button>

          <button
            onClick={stopTracking}
            disabled={!tracking}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Stop Tracking
          </button>
        </div>

        <p className="mt-5 text-center text-xs leading-5 text-zinc-600">
          Location is collected only after you grant browser permission.
          You can stop tracking at any time.
        </p>
      </div>
    </main>
  );
}