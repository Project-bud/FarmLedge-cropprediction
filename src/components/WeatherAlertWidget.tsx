import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CloudRain, Loader2, MapPin, RefreshCw, ThermometerSun } from "lucide-react";

const FALLBACK_COORDS = { lat: 20.2961, lon: 85.8245 }; // Bhubaneswar, Odisha

const severityColor: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

const formatTemp = (t?: number) =>
  typeof t === "number" ? `${Math.round(t)}°C` : "--";

const formatHumidity = (h?: number) =>
  typeof h === "number" ? `${Math.round(h)}%` : "--";

export default function WeatherAlertWidget() {
  const [coords, setCoords] = useState<{ lat: number; lon: number }>(FALLBACK_COORDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Array<{ alertType: string; message: string; severity?: string }>>([]);
  const [temp, setTemp] = useState<number | undefined>();
  const [humidity, setHumidity] = useState<number | undefined>();

  const locationLabel = useMemo(() => {
    if (!coords) return "";
    return `Lat ${coords.lat.toFixed(2)}, Lon ${coords.lon.toFixed(2)}`;
  }, [coords]);

  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async (lat: number, lon: number) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          `/api/weather/current?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&lang=en`
        );
        const data = await resp.json();
        if (!resp.ok || !data?.ok) {
          const err = data?.error || "weather_error";
          throw new Error(err);
        }
        if (cancelled) return;
        setAlerts(data.alerts || []);
        setTemp(data.weather?.current?.temp);
        setHumidity(data.weather?.current?.humidity);
      } catch (e: any) {
        if (cancelled) return;
        const msg = e?.message || "Unable to fetch weather";
        if (msg === "openweather_unauthorized") {
          setError("Weather service auth failed (OpenWeather 401). Check/replace API key.");
        } else if (msg === "openweather_rate_limited") {
          setError("Weather service rate-limited. Try again later.");
        } else if (msg === "location_not_supported") {
          setError("Only Odisha locations are supported.");
        } else {
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const useFallback = () => fetchWeather(FALLBACK_COORDS.lat, FALLBACK_COORDS.lon);

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          setCoords({ lat, lon });
          fetchWeather(lat, lon);
        },
        () => {
          setCoords(FALLBACK_COORDS);
          useFallback();
        },
        { enableHighAccuracy: false, timeout: 6000 }
      );
    } else {
      useFallback();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRefresh = () => {
    setError(null);
    setAlerts([]);
    setLoading(true);
    fetch(`/api/weather/current?lat=${coords.lat}&lon=${coords.lon}&lang=en`)
      .then(async (resp) => {
        const data = await resp.json();
        if (!resp.ok || !data?.ok) throw new Error(data?.error || "weather_error");
        setAlerts(data.alerts || []);
        setTemp(data.weather?.current?.temp);
        setHumidity(data.weather?.current?.humidity);
      })
      .catch((e) => {
        const msg = e?.message || "Unable to fetch weather";
        if (msg === "openweather_unauthorized") {
          setError("Weather service auth failed. Check API key.");
        } else if (msg === "openweather_rate_limited") {
          setError("Weather service rate-limited. Try again later.");
        } else if (msg === "location_not_supported") {
          setError("Only Odisha locations are supported.");
        } else {
          setError(msg);
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Card className="p-4 shadow-sm border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-slate-800">Weather Alerts (Odisha)</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4" />
          <span>{locationLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <ThermometerSun className="w-4 h-4 text-amber-600" />
          <span>Temp: {loading ? <Skeleton className="w-10 h-4" /> : formatTemp(temp)}</span>
        </div>
        <div className="flex items-center gap-2">
          <CloudRain className="w-4 h-4 text-blue-600" />
          <span>Humidity: {loading ? <Skeleton className="w-10 h-4" /> : formatHumidity(humidity)}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading} className="ml-auto gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 mb-3">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {loading && !alerts.length ? (
        <div className="space-y-2">
          {[1, 2, 3].map((k) => (
            <Skeleton key={k} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : alerts.length ? (
        <div className="space-y-3">
          {alerts.map((a, idx) => (
            <div
              key={`${a.alertType}-${idx}`}
              className="flex items-start gap-3 rounded-md border border-slate-100 bg-slate-50 p-3"
            >
              <Badge className={severityColor[a.severity || "low"] || severityColor.low}>
                {a.alertType}
              </Badge>
              <p className="text-sm text-slate-700 leading-relaxed">{a.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">No alerts right now. Good conditions ahead.</p>
      )}
    </Card>
  );
}
