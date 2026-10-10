"""Print mean luma (0-255) and lit-pixel fraction (luma above 20) per image as JSON.
Used by the story-still quality gate. Pillow only; no numpy."""
import json, sys
from PIL import Image
LIT = 20
out = {}
for path in sys.argv[1:]:
    with Image.open(path) as picture:
        hist = picture.convert('L').histogram()
    total = sum(hist)
    out[path] = {'mean': round(sum(i * n for i, n in enumerate(hist)) / total, 2), 'lit': round(sum(hist[LIT + 1:]) / total, 4)}
print(json.dumps(out))
