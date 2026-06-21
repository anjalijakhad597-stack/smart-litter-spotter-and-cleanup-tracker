import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';

let modelCache: cocoSsd.ObjectDetection | null = null;

async function getModel() {
  if (!modelCache) {
    await tf.ready();
    modelCache = await cocoSsd.load();
  }
  return modelCache;
}

export type DetectedItem = { label: string; confidence: number };

export async function detectInImage(img: Blob | File | HTMLImageElement | HTMLCanvasElement): Promise<DetectedItem[]> {
  const model = await getModel();

  let element: HTMLImageElement | HTMLCanvasElement;
  if (img instanceof HTMLImageElement || img instanceof HTMLCanvasElement) {
    element = img;
  } else {
    const url = URL.createObjectURL(img);
    element = await new Promise<HTMLImageElement>((resolve, reject) => {
      const im = new Image();
      im.onload = () => {
        URL.revokeObjectURL(url);
        resolve(im);
      };
      im.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      im.src = url;
    });
  }

  const predictions = await model.detect(element);
  return predictions.map((p) => ({
    label: p.class,
    confidence: Math.round(p.score * 100) / 100,
  }));
}
