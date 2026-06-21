"""
Litter detection service using YOLOv8.
Maps COCO classes to litter-friendly labels.
"""
from pathlib import Path

# COCO class index -> litter-friendly label (subset relevant to litter detection)
COCO_TO_LITTER = {
    39: "plastic bottle",   # bottle
    40: "glass",            # wine glass
    41: "cup",              # cup
    42: "fork",
    43: "knife",
    44: "spoon",
    46: "banana",
    47: "apple",
    48: "sandwich",
    49: "orange",
    50: "broccoli",
    51: "carrot",
    52: "hot dog",
    53: "pizza",
    54: "donut",
    55: "cake",
    56: "chair",
    57: "couch",
    58: "potted plant",
    59: "bed",
    60: "dining table",
    61: "toilet",
    62: "tv",
    63: "laptop",
    64: "mouse",
    65: "remote",
    66: "keyboard",
    67: "cell phone",
    # Add more as needed; unmapped classes use raw COCO name
}


def get_label(class_id: int, class_name: str) -> str:
    """Map COCO class to litter-friendly label."""
    return COCO_TO_LITTER.get(class_id, class_name.replace("_", " "))


def format_detection(label: str, confidence: float) -> dict:
    """Format single detection for API response."""
    return {
        "label": label.title(),
        "confidence": round(float(confidence), 2),
    }
