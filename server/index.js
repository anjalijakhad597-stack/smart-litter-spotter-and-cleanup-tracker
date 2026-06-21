import express from 'express';
import cors from 'cors';
import multer from 'multer';
import mongoose from 'mongoose';

const app = express();
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://127.0.0.1:8000';
const PYTHON_VLM_URL = process.env.PYTHON_VLM_URL || 'http://127.0.0.1:8001';

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart-litter-spotter';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error', err);
  });

const detectedItemSchema = new mongoose.Schema(
  {
    label: String,
    confidence: Number,
  },
  { _id: false }
);

const detectionSchema = new mongoose.Schema(
  {
    createdAt: { type: Date, default: Date.now },
    items: [detectedItemSchema],
    latitude: Number,
    longitude: Number,
    source: { type: String, enum: ['upload', 'camera'], default: 'upload' },
  },
  { collection: 'detections' }
);

const Detection = mongoose.model('Detection', detectionSchema);

// Report submission: items + location + optional image
const handleReport = async (req, res) => {
  try {
    const { items, latitude, longitude, source } = req.body;

    let parsedItems = [];
    try {
      parsedItems = typeof items === 'string' ? JSON.parse(items) : items || [];
    } catch {
      return res.status(400).json({ error: 'Invalid items format.' });
    }

    const lat = latitude != null ? Number(latitude) : undefined;
    const lng = longitude != null ? Number(longitude) : undefined;

    const detection = await Detection.create({
      items: parsedItems,
      latitude: lat,
      longitude: lng,
      source: source === 'camera' ? 'camera' : 'upload',
    });

    return res.json({
      id: detection._id.toString(),
      items: detection.items,
      location: { lat: detection.latitude, lng: detection.longitude },
      createdAt: detection.createdAt,
    });
  } catch (err) {
    console.error('Report submission error', err);
    return res.status(500).json({ error: 'Failed to submit report.' });
  }
};

app.post('/api/report', upload.single('image'), handleReport);
app.post('/api/reports', upload.single('image'), handleReport);

/**
 * VLM Analyze endpoint: forwards image to Python VLM service.
 * POST /api/analyze - expects multipart/form-data with "image" file field.
 */
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'image/jpeg' });
    formData.append('file', blob, req.file.originalname || 'image.jpg');

    const pyRes = await fetch(`${PYTHON_VLM_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!pyRes.ok) {
      const errText = await pyRes.text();
      let errJson;
      try {
        errJson = JSON.parse(errText);
      } catch {
        errJson = { detail: errText };
      }
      const msg = errJson.detail || errJson.error || `VLM service error: ${pyRes.status}`;
      return res.status(pyRes.status >= 500 ? 503 : 400).json({ error: msg });
    }

    const data = await pyRes.json();
    return res.json(data);
  } catch (err) {
    console.error('VLM proxy error', err);
    const isNetwork = err.cause?.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED';
    return res.status(503).json({
      error: isNetwork
        ? 'VLM service unavailable. Start the Python VLM service (port 8001).'
        : 'Analysis failed.',
    });
  }
});

/**
 * Detection endpoint: forwards image to Python ML service and returns detections.
 * POST /api/detect - expects multipart/form-data with "image" file field.
 */
app.post('/api/detect', upload.single('image'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const formData = new FormData();
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype || 'image/jpeg' });
    formData.append('file', blob, req.file.originalname || 'image.jpg');

    const pyRes = await fetch(`${PYTHON_API_URL}/detect`, {
      method: 'POST',
      body: formData,
    });

    if (!pyRes.ok) {
      const errText = await pyRes.text();
      let errJson;
      try {
        errJson = JSON.parse(errText);
      } catch {
        errJson = { detail: errText };
      }
      const msg = errJson.detail || errJson.error || `Python API error: ${pyRes.status}`;
      return res.status(pyRes.status >= 500 ? 503 : 400).json({ error: msg });
    }

    const data = await pyRes.json();
    return res.json({ detections: data.detections || [] });
  } catch (err) {
    console.error('Detection proxy error', err);
    const isNetwork = err.cause?.code === 'ECONNREFUSED' || err.code === 'ECONNREFUSED';
    return res.status(503).json({
      error: isNetwork
        ? 'Detection service unavailable. Ensure the Python detector is running on port 8000.'
        : 'Detection failed.',
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Detection API server listening on port ${PORT}`);
});

