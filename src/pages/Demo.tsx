import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';

// ─── Types ─────────────────────────────────────────────────────────────────
type AnalysisResults = {
  garbage: boolean;
  person: boolean;
  cleanliness: 'clean' | 'dirty';
};

type Location = { lat: number; lng: number } | null;

// ─── Constants ─────────────────────────────────────────────────────────────
const DEFAULT_CENTER: [number, number] = [28.6139, 77.209];
const DEFAULT_ZOOM = 15;

// ─── Map ───────────────────────────────────────────────────────────────────
function RecenterMap({ center, zoom, trigger }: { center: [number, number]; zoom: number; trigger?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center[0], center[1], zoom, map, trigger]);
  return null;
}

const createMarkerIcon = () =>
  L.divIcon({
    className: 'border-0 bg-transparent',
    html: `<div class="h-5 w-5 rounded-full border-2 border-white bg-emerald-500 shadow-lg"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

// ─── Main ──────────────────────────────────────────────────────────────────
export default function Demo() {
  const [image, setImage] = useState<Blob | File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [location, setLocation] = useState<Location>(null);

  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      imagePreviewUrl && URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (!cameraOpen || !streamRef.current || !videoRef.current) return;
    const video = videoRef.current;
    const stream = streamRef.current;
    video.srcObject = stream;
    video.play().catch(console.error);
    return () => {
      video.srcObject = null;
    };
  }, [cameraOpen]);

  const fetchLocation = useCallback((): Promise<Location> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { maximumAge: 10_000, timeout: 15_000, enableHighAccuracy: true }
      );
    });
  }, []);

  const runAnalysis = useCallback(async (img: Blob | File) => {
    const formData = new FormData();
    formData.append('image', img);

    const res = await fetch('/api/analyze', { method: 'POST', body: formData });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Analysis failed: ${res.status}`);
    }

    const data = await res.json();
    return {
      caption: data.caption ?? '',
      results: data.results ?? { garbage: false, person: false, cleanliness: 'clean' as const },
    };
  }, []);

  const submitReport = useCallback(
    async (
      captionVal: string,
      resultsVal: AnalysisResults,
      loc: Location,
      img: Blob | File | null,
      source: 'upload' | 'camera'
    ) => {
      const items = [
        { label: captionVal || 'No caption', confidence: 1 },
        { label: resultsVal.garbage ? 'Garbage detected' : 'Clean area', confidence: 1 },
        { label: resultsVal.person ? 'Person detected' : 'No person', confidence: 1 },
        { label: `Cleanliness: ${resultsVal.cleanliness}`, confidence: 1 },
      ];
      const formData = new FormData();
      formData.append('items', JSON.stringify(items));
      formData.append('latitude', String(loc?.lat ?? ''));
      formData.append('longitude', String(loc?.lng ?? ''));
      formData.append('source', source);
      if (img) formData.append('image', img);

      const res = await fetch('/api/report', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Report failed: ${res.status}`);
      }
    },
    []
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    imagePreviewUrl && URL.revokeObjectURL(imagePreviewUrl);
    setImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setCaption(null);
    setResults(null);
    setReportError(null);
    setReportSuccess(false);
    setAnalysisComplete(false);
  };

  const openCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        .catch(() => navigator.mediaDevices.getUserMedia({ video: true, audio: false }));
      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError('Camera access denied. Please allow camera permissions.');
    }
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      imagePreviewUrl && URL.revokeObjectURL(imagePreviewUrl);
      setImage(blob);
      setImagePreviewUrl(URL.createObjectURL(blob));
      setCaption(null);
      setResults(null);
      setReportError(null);
      setReportSuccess(false);
      setAnalysisComplete(false);
      closeCamera();
    }, 'image/png');
  };

  const handleRunDetection = async () => {
    if (!image) {
      setReportError('Please select or capture an image first.');
      return;
    }

    setLoading(true);
    setReportError(null);
    setReportSuccess(false);
    setAnalysisComplete(false);

    try {
      const { caption: cap, results: res } = await runAnalysis(image);
      setCaption(cap);
      setResults(res);
      setAnalysisComplete(true);

      const loc = await fetchLocation();
      if (!loc) {
        setReportError('Location access denied. Please enable location permissions.');
        setLoading(false);
        return;
      }

      setLocation(loc);
      setMapCenter([loc.lat, loc.lng]);
      setRecenterTrigger((t) => t + 1);

      try {
        const source = image instanceof File ? 'upload' : 'camera';
        await submitReport(cap, res, loc, image, source);
        setReportSuccess(true);
      } catch {
        // Ignore report submission errors
      }
    } catch (err) {
      setReportError(err instanceof Error ? err.message : 'Analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const hasImage = !!image;
  const canRun = hasImage && !loading;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-extrabold text-slate-900">Demo</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Image source</h2>
            <div className="flex flex-wrap gap-3">
              <label className="cursor-pointer rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Upload image
                <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
              </label>
              <button
                type="button"
                onClick={cameraOpen ? closeCamera : openCamera}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {cameraOpen ? 'Close camera' : 'Open camera'}
              </button>
            </div>
            {cameraError && <p className="mt-2 text-sm text-red-600">{cameraError}</p>}
          </div>

          {cameraOpen && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  playsInline
                />
              </div>
              <button
                type="button"
                onClick={capturePhoto}
                className="mt-3 w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Capture photo
              </button>
            </div>
          )}

          {imagePreviewUrl && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-800">Preview</h2>
              <img src={imagePreviewUrl} alt="Preview" className="h-48 w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={handleRunDetection}
                disabled={!canRun}
                className={`mt-3 w-full rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                  canRun ? 'bg-emerald-600 hover:bg-emerald-700' : 'cursor-not-allowed bg-slate-400'
                }`}
              >
                {loading ? 'Analyzing…' : 'Run analysis'}
              </button>
              {reportSuccess && (
                <p className="mt-2 text-sm font-medium text-emerald-700">Report submitted successfully.</p>
              )}
              {reportError && <p className="mt-2 text-sm font-medium text-red-600">{reportError}</p>}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Analysis results</h2>
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
                Analyzing image…
              </div>
            )}
            {!loading && !analysisComplete && (
              <p className="text-sm text-slate-500">Select or capture an image, then run analysis.</p>
            )}
            {!loading && analysisComplete && (
              <div className="space-y-3">
                {caption && (
                  <div>
                    <p className="text-xs font-medium text-slate-500">Caption</p>
                    <p className="text-sm text-slate-800">{caption}</p>
                  </div>
                )}
                {results && (
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        results.garbage ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {results.garbage ? 'Garbage detected' : 'Clean area'}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        results.person ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {results.person ? 'Person detected' : 'No person'}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        results.cleanliness === 'dirty' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {results.cleanliness === 'dirty' ? 'Dirty' : 'Clean'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-800">Map</h2>
            <div className="h-80 overflow-hidden rounded-lg border border-slate-200">
              <MapContainer center={mapCenter} zoom={DEFAULT_ZOOM} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap center={mapCenter} zoom={DEFAULT_ZOOM} trigger={recenterTrigger} />
                {location && (
                  <Marker position={[location.lat, location.lng]} icon={createMarkerIcon()}>
                    <Popup>
                      <div className="text-xs">
                        <p className="mb-1 font-semibold">Report location</p>
                        {caption && <p>{caption}</p>}
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
