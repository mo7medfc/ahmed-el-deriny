from PIL import Image
from pathlib import Path
import numpy as np

src = Path(
    r"C:\Users\mo7me\.cursor\projects\c-Users-mo7me-OneDrive-Desktop-AHMED-DRENY"
    r"\assets\c__Users_mo7me_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"0aa4028ca3bbf8f4b18d728c43590d9e_images_Screenshot_1569-2ec53fe1-fdb8-420d-b82e-9e511dc46a6e.png"
)
im = Image.open(src).convert("RGB")
arr = np.asarray(im)
# White-ish pixels (the product cards)
white = (arr[:, :, 0] > 220) & (arr[:, :, 1] > 220) & (arr[:, :, 2] > 220)
# Split into top / bottom halves for the two cards
h, w = white.shape
out = Path("public/images/products")
out.mkdir(parents=True, exist_ok=True)

regions = {
    "desk-set-black.jpg": white[: h // 2, :],
    "desk-set-brown.jpg": white[h // 2 :, :],
}
y_offsets = {
    "desk-set-black.jpg": 0,
    "desk-set-brown.jpg": h // 2,
}

for name, mask in regions.items():
    ys, xs = np.where(mask)
    if len(xs) == 0:
        raise SystemExit(f"no white region for {name}")
    y0, y1 = int(ys.min()), int(ys.max())
    x0, x1 = int(xs.min()), int(xs.max())
    # Shrink a few px to drop the gray frame edge
    pad = 8
    y0 += pad
    x0 += pad
    y1 -= pad
    x1 -= pad
    y0 += y_offsets[name]
    y1 += y_offsets[name]
    crop = im.crop((x0, y0, x1, y1))
    target_w, target_h = 1200, 900
    bg = Image.new("RGB", (target_w, target_h), (255, 255, 255))
    scale = min(target_w / crop.width, target_h / crop.height) * 0.94
    nw, nh = max(1, int(crop.width * scale)), max(1, int(crop.height * scale))
    resized = crop.resize((nw, nh), Image.Resampling.LANCZOS)
    bg.paste(resized, ((target_w - nw) // 2, (target_h - nh) // 2))
    bg.save(out / name, quality=93)
    print(name, "box", (x0, y0, x1, y1), "->", bg.size)
