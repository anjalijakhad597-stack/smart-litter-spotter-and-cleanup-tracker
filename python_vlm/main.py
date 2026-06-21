"""
FastAPI VLM service for image analysis using BLIP.
Loads models once at startup.
"""
import io
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image

from analyzer import PROMPTS, run_analysis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

caption_model = None
caption_processor = None
vqa_model = None
vqa_processor = None
device = "cpu"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load BLIP models once at startup."""
    global caption_model, caption_processor, vqa_model, vqa_processor, device
    try:
        import torch
        from transformers import BlipForConditionalGeneration, BlipForQuestionAnswering, BlipProcessor

        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}")

        logger.info("Loading BLIP caption model...")
        caption_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        caption_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base").to(
            device
        )
        caption_model.eval()
        logger.info("BLIP caption model loaded")

        logger.info("Loading BLIP VQA model...")
        vqa_processor = BlipProcessor.from_pretrained("Salesforce/blip-vqa-base")
        vqa_model = BlipForQuestionAnswering.from_pretrained("Salesforce/blip-vqa-base").to(device)
        vqa_model.eval()
        logger.info("BLIP VQA model loaded")
    except Exception as e:
        logger.error(f"Model load failed: {e}")
        caption_model = caption_processor = vqa_model = vqa_processor = None

    yield

    caption_model = caption_processor = vqa_model = vqa_processor = None


app = FastAPI(title="VLM Image Analysis API", lifespan=lifespan)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "caption_loaded": caption_model is not None,
        "vqa_loaded": vqa_model is not None,
    }


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    """
    Analyze image: caption + zero-shot classification (garbage, person, cleanliness).
    """
    if caption_model is None or vqa_model is None:
        raise HTTPException(status_code=503, detail="Models not loaded. Check server logs.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")

    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty image file.")

        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    try:
        result = run_analysis(
            caption_processor, caption_model, vqa_processor, vqa_model, image, device
        )
        return result
    except Exception as e:
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail=str(e))
