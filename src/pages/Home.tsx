import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';

const stats = [
  { label: 'Items Detected', value: 5420 },
  { label: 'Active Volunteers', value: 210 },
  { label: 'Cleanup Events', value: 1280 },
];

const mapSampleMarkers: { position: LatLngExpression; label: string }[] = [
  { position: [28.6139, 77.209], label: 'Plastic waste reported here' },
  { position: [28.7041, 77.1025], label: 'Mixed litter spotted at this corner' },
  { position: [28.5355, 77.391], label: 'Bottle & cans reported here' },
];

const markerIcon = L.divIcon({
  className: 'flex items-center justify-center',
  html: `<div class="h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-lg"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function useCountUp(target: number, startWhenInView: boolean, durationMs = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!startWhenInView) return;
    let frameId: number;
    const start = performance.now();

    const loop = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * progress));
      if (progress < 1) {
        frameId = requestAnimationFrame(loop);
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [startWhenInView, target, durationMs]);

  return value;
}

export default function Home() {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-100px' });

  const countedValues = stats.map((s) => useCountUp(s.value, statsInView));

  const heroRef = useRef<HTMLDivElement | null>(null);
  const heroInView = useInView(heroRef, { once: true });

  return (
    <div>
      <section
        id="hero"
        className="relative isolate overflow-hidden bg-gradient-to-b from-primary-50 to-white"
      >
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="animate-[pulse_8s_ease-in-out_infinite] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(16,185,129,0.18),_transparent_55%)] h-full w-full" />
        </div>
        <div
          ref={heroRef}
          className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20 lg:px-8"
        >
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
            >
              Smart Litter Spotter & Community Cleanup Tracker
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="text-lg text-slate-700"
            >
              Detect, Clean, Inspire.
            </motion.p>
            <div className="flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/demo"
                  className="relative overflow-hidden rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow transition-colors before:absolute before:inset-0 before:scale-0 before:bg-white/20 before:opacity-0 before:transition-transform before:duration-300 hover:bg-primary-700 hover:before:scale-125 hover:before:opacity-100"
                >
                  <span className="relative z-10">See Demo</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/features"
                  className="relative overflow-hidden rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors before:absolute before:inset-0 before:scale-0 before:bg-slate-100 before:opacity-0 before:transition-transform before:duration-300 hover:bg-slate-50 hover:before:scale-125 hover:before:opacity-100"
                >
                  <span className="relative z-10">Explore Features</span>
                </Link>
              </motion.div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {['Snap a photo of litter', 'AI detects items instantly', 'Report & join cleanups'].map(
                (item, idx) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, y: 12 }}
                    animate={heroInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                    whileHover={{ y: -4, boxShadow: '0 18px 45px rgba(15,23,42,0.12)' }}
                    className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm transition-transform"
                  >
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                      <motion.span
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-[10px]"
                        whileHover={{ rotate: 6, scale: 1.05 }}
                      >
                        ✓
                      </motion.span>
                      <span>Step {idx + 1}</span>
                    </div>
                    <p>{item}.</p>
                  </motion.div>
                )
              )}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={heroInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="https://images.unsplash.com/photo-1599586120429-413831d81d3e?q=80&w=1500&auto=format&fit=crop"
                alt="Community cleanup"
                className="w-full rounded-xl border border-slate-200 shadow-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="absolute -bottom-4 -right-4 rounded-xl bg-white p-4 shadow-lg"
            >
              <p className="text-sm font-semibold text-slate-900">+1,250 items detected</p>
              <p className="text-xs text-slate-600">This month</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="impact" className="bg-white">
        <div
          ref={statsRef}
          className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        >
          <h2 className="mb-6 text-center text-2xl font-bold text-slate-900">Impact</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm"
              >
                <p className="text-3xl font-extrabold text-primary-700">
                  {countedValues[index].toLocaleString()}
                  {stat.label === 'Items Detected' ? '+' : ''}
                </p>
                <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="map-preview" className="bg-white pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900">Live Hotspots Preview</h2>
              <p className="text-sm text-slate-600">
                See a sample of recent litter reports visualized on a live map. Each marker represents
                a community report that helps keep public spaces clean.
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Tap markers to view reported litter notes.</li>
                <li>• Zoom and pan around the city preview.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="h-64 overflow-hidden rounded-lg border border-dashed border-slate-300">
                <MapContainer
                  center={mapSampleMarkers[0].position}
                  zoom={12}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapSampleMarkers.map((m, idx) => (
                    <Marker key={idx} position={m.position} icon={markerIcon}>
                      <Popup>
                        <div className="text-xs">
                          <p className="font-semibold text-slate-800">Plastic waste reported here</p>
                          <p className="text-slate-600">{m.label}</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                This is a preview. The full app shows real-time reports from your community.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


