import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"   # fixes the OpenMP error on Windows
 
import io
from pathlib import Path
 
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from PIL import Image, ImageOps, UnidentifiedImageError
from torchvision import transforms
 
from model import CNN
 
BASE = Path(__file__).parent
MODEL_PATH = BASE / "cats_dogs_cnn.pth"
MAX_BYTES = 8 * 1024 * 1024
THRESHOLD = 0.80   # below this confidence the answer becomes "other" (neither cat nor dog). Tune it.
 
app = FastAPI(title="Cat vs Dog Classifier")
 
if not MODEL_PATH.exists():
    raise SystemExit("cats_dogs_cnn.pth not found. Run the notebook first and copy the file next to main.py.")
 
ckpt = torch.load(MODEL_PATH, map_location="cpu")
model = CNN()
model.load_state_dict(ckpt["state_dict"])
model.eval()
 
CLASSES = ckpt["classes"]  # e.g. ["cat", "dog"]; index 1 is the sigmoid output
preprocess = transforms.Compose([
    transforms.Resize((ckpt["img_size"], ckpt["img_size"])),
    transforms.ToTensor(),
    transforms.Normalize(ckpt["mean"], ckpt["std"]),
])
 
 
@app.get("/api/health")
def health():
    return {"status": "ok", "classes": CLASSES}
 
 
@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(400, "Please upload an image file (JPG, PNG or WEBP).")
    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image is larger than 8 MB.")
    try:
        img = ImageOps.exif_transpose(Image.open(io.BytesIO(data))).convert("RGB")
    except (UnidentifiedImageError, OSError):
        raise HTTPException(400, "That file could not be read as an image.")
 
    with torch.no_grad():
        p_second = torch.sigmoid(model(preprocess(img).unsqueeze(0))).item()
    probs = {CLASSES[0]: 1 - p_second, CLASSES[1]: p_second}
    best = max(probs, key=probs.get)
    label = best if probs[best] >= THRESHOLD else "other"
    return {"label": label, "best_guess": best, "confidence": probs[best], "probabilities": probs}
 
 
@app.get("/")
def index():
    return FileResponse(BASE / "static" / "index.html")
 
 
app.mount("/static", StaticFiles(directory=BASE / "static"), name="static")
