# VLM Image Analysis Service

BLIP-based Vision-Language Model for image captioning and zero-shot classification.

## Setup

```bash
cd python_vlm
pip install -r requirements.txt
```

Requires Python 3.8+ and ~2GB RAM for models. GPU optional but recommended.

## Run

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Or from project root: `npm run vlm`

## API

- `GET /health` - Model status
- `POST /analyze` - Image analysis (multipart, field `file`)

Response:
```json
{
  "caption": "a street with plastic waste",
  "results": {
    "garbage": true,
    "person": false,
    "cleanliness": "dirty"
  }
}
```
