"""Encode rendered Phase 2 stills without changing dimensions or composition.

Run with the bundled Python (Pillow). PNG sources may be archived after the
frontend uses these WebPs. NASA source textures remain outside public/.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
folder = root / "public" / "look"
for stem in ["ring", "satellite", "payload", "focal-plane", "pixel", "plume"]:
    for suffix in ["", "-phone"]:
        source = folder / f"{stem}{suffix}.png"
        if not source.exists():
            source = root / "research" / "look" / "renders" / source.name
        if not source.exists():
            raise FileNotFoundError(source)
        destination = folder / f"{stem}{suffix}.webp"
        with Image.open(source) as picture:
            picture.save(destination, "WEBP", quality=92, method=6)
        print(f"{destination.name}: {destination.stat().st_size:,} bytes")
