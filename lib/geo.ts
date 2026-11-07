export function detectDevice(userAgent: string): string {
  if (/ipad|tablet/i.test(userAgent)) return "Tablet";
  if (/mobi|android|iphone/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

/**
 * Best-effort reverse geocoding (OpenStreetMap Nominatim).
 * Returns "" on any failure. Set REVERSE_GEOCODE=false to disable.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<string> {
  if (process.env.REVERSE_GEOCODE === "false") return "";

  try {
    const url =
      "https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14" +
      `&lat=${latitude}&lon=${longitude}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "link-tracker/1.0" },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) return "";

    const data = (await res.json()) as {
      address?: Record<string, string>;
      display_name?: string;
    };

    const a = data.address ?? {};
    const city = a.city || a.town || a.village || a.suburb || a.county || "";
    const parts = [city, a.state, a.country].filter(Boolean);

    return (parts.length ? parts.join(", ") : data.display_name ?? "").slice(
      0,
      200
    );
  } catch {
    return "";
  }
}
