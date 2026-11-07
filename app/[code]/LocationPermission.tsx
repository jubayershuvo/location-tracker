"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, Loader2, ShieldAlert, RefreshCw } from "lucide-react";

interface Props {
  code: string;
  destination: string;
}

type Status = "asking" | "saving" | "denied" | "unavailable" | "timeout";

export default function LocationPermission({ code, destination }: Props) {
  const [status, setStatus] = useState<Status>("asking");
  const started = useRef(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    setStatus("asking");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatus("saving");

        try {
          await fetch("/api/visit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            }),
          });
        } catch {
          // Saving failed — don't block the visitor from reaching the link.
        }

        window.location.replace(destination);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) setStatus("denied");
        else if (error.code === error.TIMEOUT) setStatus("timeout");
        else setStatus("unavailable");
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  }, [code, destination]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    requestLocation();
  }, [requestLocation]);

  const busy = status === "asking" || status === "saving";

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#09090b] px-4 text-white">


        {!busy && (
          <button
            type="button"
            onClick={requestLocation}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        )}

    </div>
  );
}
