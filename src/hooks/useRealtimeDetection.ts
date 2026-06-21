import { useEffect, useRef, useState } from 'react';

export type Detection = { label: string; confidence: number; bbox: [number, number, number, number] };

export function useRealtimeDetection(videoRef: React.RefObject<HTMLVideoElement | null>, enabled: boolean) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [liveDetections, setLiveDetections] = useState<Detection[]>([]);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(0);
  const modelRef = useRef<{ detect: (input: HTMLVideoElement) => Promise<Array<{ class: string; score: number; bbox: [number, number, number, number] }> } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setModelError(null);

    const loadModel = async () => {
      try {
        console.log('[COCO-SSD] Initializing TensorFlow.js...');
        const tf = await import('@tensorflow/tfjs');
        try {
          await import('@tensorflow/tfjs-backend-webgl');
          await tf.setBackend('webgl');
        } catch {
          console.warn('[COCO-SSD] WebGL backend failed, using CPU');
        }
        await tf.ready();
        console.log('[COCO-SSD] TensorFlow.js ready, loading model...');

        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        const model = await cocoSsd.load();

        if (cancelled) return;
        modelRef.current = model;
        setModelReady(true);
        setModelError(null);
        console.log('[COCO-SSD] Model loaded successfully');
      } catch (err) {
        console.error('[COCO-SSD] Failed to load model', err);
        const msg = err instanceof Error ? err.message : 'Unknown error';
        const isNetwork = msg.includes('fetch') || msg.includes('network') || msg.includes('Failed to fetch');
        if (!cancelled) {
          setModelError(isNetwork ? 'Model download failed. Check your connection.' : `Model load failed: ${msg}`);
          setModelReady(false);
        }
      }
    };

    loadModel();
    return () => {
      cancelled = true;
      modelRef.current = null;
      setModelReady(false);
      setModelError(null);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !modelReady || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const detect = async () => {
      if (!running || !modelRef.current || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const predictions = await modelRef.current.detect(video);
        const detections: Detection[] = predictions.map((p) => ({
          label: p.class,
          confidence: p.score,
          bbox: p.bbox,
        }));
        setLiveDetections(detections);

        const w = video.videoWidth;
        const h = video.videoHeight;
        const rect = video.getBoundingClientRect();
        const scaleX = rect.width / w;
        const scaleY = rect.height / h;

        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        predictions.forEach((p) => {
          const [x, y, bw, bh] = p.bbox;
          const sx = x * scaleX;
          const sy = y * scaleY;
          const sw = bw * scaleX;
          const sh = bh * scaleY;

          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 2;
          ctx.strokeRect(sx, sy, sw, sh);
          ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
          ctx.fillRect(sx, sy, sw, sh);

          ctx.fillStyle = '#fff';
          ctx.font = '12px sans-serif';
          ctx.fillText(`${p.class} ${Math.round(p.score * 100)}%`, sx, sy - 4);
        });
      } catch (err) {
        console.error('Detection error', err);
      }

      timeoutRef.current = setTimeout(() => {
        rafRef.current = requestAnimationFrame(detect);
      }, 300);
    };

    rafRef.current = requestAnimationFrame(detect);

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setLiveDetections([]);
    };
  }, [enabled, modelReady, videoRef]);

  return { canvasRef, modelReady, modelError, liveDetections };
}
