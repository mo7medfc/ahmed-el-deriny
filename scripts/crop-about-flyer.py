from pathlib import Path
from PIL import Image

src = Path(
    r"C:\Users\mo7me\.cursor\projects\c-Users-mo7me-OneDrive-Desktop-AHMED-DRENY\assets"
    r"\c__Users_mo7me_AppData_Roaming_Cursor_User_workspaceStorage_0aa4028ca3bbf8f4b18d728c43590d9e_images____________copy-b860a0f4-1a79-4a25-a9f1-6b5b03037f38.png"
)
out = Path(r"C:\Users\mo7me\OneDrive\Desktop\AHMED DRENY\public\images\about")
partners_dir = out / "partners"
partners_dir.mkdir(parents=True, exist_ok=True)

im = Image.open(src).convert("RGB")
w, h = im.size

# Clean map card at bottom
map_img = im.crop((18, 618, w - 18, h - 18))
map_img.save(out / "branches-map.png", optimize=True)
print("map", map_img.size)

# Logo tiles only (skip شركاء النجاح title; include all 6 rows)
grid = im.crop((36, 152, 258, 602))
grid.save(out / "partners-panel.png", optimize=True)
print("grid", grid.size)

gw, gh = grid.size
cols, rows = 3, 6
cell_w, cell_h = gw / cols, gh / rows

row_imgs = [
    grid.crop((0, int(r * cell_h), gw, int((r + 1) * cell_h))) for r in range(rows)
]
strip = Image.new("RGB", (gw * rows, int(cell_h)), (248, 248, 248))
x = 0
for r in row_imgs:
    strip.paste(r, (x, 0))
    x += r.width
strip.save(out / "partners-strip.png", optimize=True)
print("strip", strip.size)

names = [
    "total-air",
    "police-academy",
    "ebda",
    "gbs",
    "new-alamein",
    "mostaqbal-watan",
    "water-holding",
    "health-ministry",
    "aqarmap",
    "al-wazzan",
    "2b",
    "gourmet",
    "oraimo",
    "air-gym",
    "banque-misr",
    "wazin",
    "october6-uni",
    "golden-pyramids",
]
pad = 3
for r in range(rows):
    for c in range(cols):
        i = r * cols + c
        box = (
            int(c * cell_w) + pad,
            int(r * cell_h) + pad,
            int((c + 1) * cell_w) - pad,
            int((r + 1) * cell_h) - pad,
        )
        grid.crop(box).save(partners_dir / f"{names[i]}.png", optimize=True)

print("ok")
