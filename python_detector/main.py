"""
FastAPI service for image-based litter detection using YOLOv8.
"""
import io
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image

from detector import format_detection, get_label

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

model = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load YOLO model on startup, clean up on shutdown."""
    global model
    try:
        from ultralytics import YOLO
        model = YOLO("yolov8n.pt")  # Nano model - fast, good for CPU
        logger.info("YOLO model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        model = None
    yield
    model = None


app = FastAPI(title="Litter Detection API", lifespan=lifespan)


@app.get("/health")
async def health():
    """Health check."""
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    """
    Run object detection on uploaded image.
    Returns detected objects with labels and confidence scores.
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Check server logs.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty image file.")

        img = Image.open(io.BytesIO(contents)).convert("RGB")
        results = model(img, verbose=False)[0]

        detections = []
        for box in results.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            cls_name = results.names.get(cls_id, "unknown")
            label = get_label(cls_id, cls_name)
            detections.append(format_detection(label, conf))

        # Sort by confidence descending
        detections.sort(key=lambda x: x["confidence"], reverse=True)
        # Limit to top 10
        detections = detections[:10]

        return {"detections": detections}

    except Image.UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image.")
    except Exception as e:
        logger.exception("Detection failed")
        raise HTTPException(status_code=500, detail=str(e))
