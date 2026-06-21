"""
VLM-based image analyzer using BLIP.
Loads model once at startup, runs captioning + VQA.
"""
PROMPTS = {
    "garbage": "Is there garbage or litter in this image?",
    "person": "Is there a person in this image?",
    "cleanliness": "Is this area clean or dirty?",
}


def parse_yes_no(text: str) -> bool:
    """Parse VQA yes/no response."""
    t = text.strip().lower()
    if t in ("yes", "true", "1", "dirty"):
        return True
    if t in ("no", "false", "0", "clean"):
        return False
    if t.startswith("yes"):
        return True
    if t.startswith("no"):
        return False
    return "yes" in t or "dirty" in t


def parse_cleanliness(text: str) -> str:
    """Parse cleanliness response to 'clean' or 'dirty'."""
    t = text.strip().lower()
    if "dirty" in t or "litter" in t or "garbage" in t or "trash" in t:
        return "dirty"
    if "clean" in t:
        return "clean"
    if parse_yes_no(text):
        return "dirty"
    return "clean"


def run_analysis(caption_proc, caption_model, vqa_proc, vqa_model, image, device: str) -> dict:
    """
    Run captioning and VQA. Returns dict with caption and results.
    """
    from torch import no_grad

    with no_grad():
        # 1. Image captioning
        caption_inputs = caption_proc(images=image, return_tensors="pt").to(device)
        caption_ids = caption_model.generate(**caption_inputs, max_length=50)
        caption = caption_proc.decode(caption_ids[0], skip_special_tokens=True).strip()

        # 2. VQA for each prompt
        results = {}

        for key, question in PROMPTS.items():
            inputs = vqa_proc(images=image, text=question, return_tensors="pt").to(device)
            out = vqa_model.generate(**inputs, max_length=10)
            answer = vqa_proc.decode(out[0], skip_special_tokens=True).strip()

            if key == "cleanliness":
                results[key] = parse_cleanliness(answer)
            else:
                results[key] = parse_yes_no(answer)

    return {"caption": caption, "results": results}
