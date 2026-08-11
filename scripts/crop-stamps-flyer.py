"""Crop stamp thumbnails from the price-list flyer into public/images/products."""
from pathlib import Path
import numpy as np
from PIL import Image

SRC = Path(
    r"C:\Users\mo7me\.cursor\projects\c-Users-mo7me-OneDrive-Desktop-AHMED-DRENY"
    r"\assets\c__Users_mo7me_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"0aa4028ca3bbf8f4b18d728c43590d9e_images_image-029351ec-3cff-47da-8fdf-6c4c86431e53.png"
)
OUT = Path("public/images/products")

NAMES = [
    "stamp-wood-hand.jpg",
    "stamp-auto-small.jpg",
    "stamp-auto-medium.jpg",
    "stamp-auto-large.jpg",
    "stamp-round-4.jpg",
    "stamp-round-5.jpg",
    "stamp-rect-3x7.jpg",
    "stamp-date-only.jpg",
    "stamp-date-company.jpg",
    "stamp-embosser.jpg",
    "stamp-cliche-only.jpg",
    "stamp-square-4.jpg",
    "stamp-pocket.jpg",
]

im = Image.open(SRC).convert("RGB")
w, h = im.size

# Photo column sits between price (left) and Arabic names (right)
x0, x1 = int(w * 0.28), int(w * 0.50)
top = int(h * 0.098)
bottom = int(h * 0.988)
row_h = (bottom - top) / len(NAMES)

for i, name in enumerate(NAMES):
    y0 = int(top + i * row_h + 1)
    y1 = int(top + (i + 1) * row_h - 1)
    crop = np.asarray(im.crop((x0, y0, x1, y1))).copy()

    # Keep product pixels; only wipe very light gray speckled flyer bg
    gray = crop.mean(axis=2)
    bg = gray > 225
    crop[bg] = [255, 255, 255]

    img = Image.fromarray(crop)
    size = 640
    canvas = Image.new("RGB", (size, size), (255, 255, 255))
    scale = min(size / img.width, size / img.height) * 0.88
    nw, nh = max(1, int(img.width * scale)), max(1, int(img.height * scale))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas.paste(resized, ((size - nw) // 2, (size - nh) // 2))
    canvas.save(OUT / name, quality=93)
    print(f"{i+1:02d} {name} {img.size}")

# cleanup diagnostic strips
for p in OUT.glob("_strip*.jpg"):
    p.unlink()
print("done")
