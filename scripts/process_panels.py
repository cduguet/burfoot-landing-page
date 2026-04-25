#!/usr/bin/env python3
"""
Post-process all 11 panels:

1. Upscale each to a uniform 1920×1080 (Lanczos).
2. Seam-blend an 80-px gradient between every adjacent pair so the joins
   are pixel-identical on both sides — invisible cut between sections.

Run after generate_panels.py.
"""
from pathlib import Path
from PIL import Image

PANEL_DIR = Path(__file__).resolve().parent.parent / "assets" / "panels"
TARGET    = (1920, 1080)   # 16:9, full HD
SEAM      = 80             # blend zone height in px

# top-to-bottom order matching the website sections
ORDER = [
    "p01",   # Hero (sky + treehouse)
    "p02",   # Prologue (canopy)
    "p03",   # Forest
    "ocean", # Ocean
    "jungle",# Jungle
    "garden",# English Garden
    "p04",   # Story
    "p05",   # Sustainability
    "p06",   # Mission (roots emerging)
    "shop",  # Shop (deep root cave)
    "p07",   # Footer (deep roots + magic pool)
]

def upscale_all():
    for name in ORDER:
        p = PANEL_DIR / f"{name}.png"
        im = Image.open(p).convert("RGB")
        if im.size != TARGET:
            im = im.resize(TARGET, Image.LANCZOS)
            im.save(p, optimize=True)
            print(f"  upscaled {name}: → {TARGET}")
        else:
            print(f"  {name}: already {TARGET}")

def gradient_mask(w: int, h: int) -> Image.Image:
    """L-mode mask, 0 at top → 255 at bottom (smoothstep for nicer blend)."""
    m = Image.new("L", (w, h))
    for y in range(h):
        t = y / max(1, h - 1)
        # smoothstep — eases the transition at the ends
        v = 3*t*t - 2*t*t*t
        m.paste(int(255 * v), (0, y, w, y + 1))
    return m

def seam_blend():
    for i in range(len(ORDER) - 1):
        a_path = PANEL_DIR / f"{ORDER[i]}.png"
        b_path = PANEL_DIR / f"{ORDER[i+1]}.png"
        a = Image.open(a_path).convert("RGB")
        b = Image.open(b_path).convert("RGB")

        # strips: bottom of A, top of B
        a_strip = a.crop((0, a.size[1] - SEAM, a.size[0], a.size[1]))
        b_strip = b.crop((0, 0, b.size[0], SEAM))

        mask = gradient_mask(a.size[0], SEAM)
        # smoothly blend: top of strip = pure A, bottom of strip = pure B
        blended = Image.composite(b_strip, a_strip, mask)

        # write the same blended strip into BOTH panels — A's bottom and B's
        # top now contain pixel-identical content, so when stacked the seam
        # has zero visible cut
        a.paste(blended, (0, a.size[1] - SEAM))
        b.paste(blended, (0, 0))
        a.save(a_path, optimize=True)
        b.save(b_path, optimize=True)
        print(f"  blended  {ORDER[i]:>7} ↔ {ORDER[i+1]:<7}")

if __name__ == "__main__":
    print("[upscale]"); upscale_all()
    print("[seam blend]"); seam_blend()
    print("[done]")
