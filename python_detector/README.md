# Python Litter Detection Service

YOLOv8-based object detection for the Smart Litter Spotter app.

## Setup

```bash
cd python_detector
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Or from project root:

```bash
npm run detector
```

## API

- `GET /health` - Check if model is loaded
- `POST /detect` - Upload image (multipart, field `file`), returns `{ "detections": [ { "label": "...", "confidence": 0.9 } ] }`

## Model

Uses YOLOv8n (nano) pre-trained on COCO. On first run, the model is downloaded (~6MB).
