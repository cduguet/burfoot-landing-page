#!/usr/bin/env python3
"""
Burfoot panel pipeline.

1. Split assets/tree-bg.png into 7 panels of 1024x576 (assets/panels/p01..p07.png).
2. Generate 4 ecosystem panels (Ocean, Jungle, Garden, Shop) at 1920x1080 via
   Gemini's Nano Banana 2 image model, with bottom-of-prev and top-of-next as
   continuity references so the central tree trunk and ground line stitch
   visually across the seams.
3. Save all panels to assets/panels/ ready for CSS to apply per-section.

Env: GEMINI_API_KEY in .env
"""
from __future__ import annotations
import os, sys, json, base64, time, traceback
from pathlib import Path
from PIL import Image
import urllib.request, urllib.error

ROOT     = Path(__file__).resolve().parent.parent
SRC_IMG  = ROOT / "assets" / "tree-bg.png"
PANEL_DIR= ROOT / "assets" / "panels"
ENV_PATH = ROOT / ".env"

# --- env -------------------------------------------------------------------
def load_env():
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line: continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
load_env()
API_KEY = os.environ.get("GEMINI_API_KEY")
assert API_KEY, "GEMINI_API_KEY missing in .env"

# Nano Banana 2 candidates (try in order, fall back if 404)
MODELS = [
    "gemini-3-pro-image-preview",
    "gemini-3-pro-image",
    "gemini-2.5-flash-image-preview",
]

# --- step 1: slice ---------------------------------------------------------
def slice_existing():
    PANEL_DIR.mkdir(parents=True, exist_ok=True)
    src = Image.open(SRC_IMG).convert("RGB")
    print(f"[slice] source = {src.size}")
    W, H = 1024, 576
    out = []
    for i in range(7):
        top = i * H
        crop = src.crop((0, top, W, top + H))
        path = PANEL_DIR / f"p{i+1:02d}.png"
        crop.save(path, optimize=True)
        out.append(path)
        print(f"[slice] {path.name}  size={crop.size}")
    return out

# --- step 2: continuity helpers --------------------------------------------
def edge_strip(panel_path: Path, where: str, height: int = 256) -> Path:
    """Return a 1024×height crop from the top or bottom of a panel for
    continuity reference. Saved into assets/panels/_refs/."""
    out_dir = PANEL_DIR / "_refs"
    out_dir.mkdir(exist_ok=True)
    im = Image.open(panel_path).convert("RGB")
    w, h = im.size
    if where == "top":
        crop = im.crop((0, 0, w, height))
    else:
        crop = im.crop((0, h - height, w, h))
    out = out_dir / f"{panel_path.stem}_{where}.png"
    crop.save(out)
    return out

def encode_image(path: Path) -> dict:
    data = path.read_bytes()
    return {"inlineData": {"mimeType": "image/png", "data": base64.b64encode(data).decode()}}

# --- step 3: Gemini call ---------------------------------------------------
def call_image_model(prompt: str, refs: list[Path], aspect: str = "16:9"):
    parts = [{"text": prompt}]
    for r in refs:
        parts.append(encode_image(r))
    body = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": aspect},
        },
    }
    last_err = None
    for model in MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
        req = urllib.request.Request(
            url,
            data=json.dumps(body).encode(),
            headers={"Content-Type": "application/json", "x-goog-api-key": API_KEY},
        )
        try:
            print(f"[gen] try model={model}")
            with urllib.request.urlopen(req, timeout=180) as r:
                resp = json.loads(r.read().decode())
            for cand in resp.get("candidates", []):
                for part in cand.get("content", {}).get("parts", []):
                    inline = part.get("inlineData") or part.get("inline_data")
                    if inline and inline.get("data"):
                        return base64.b64decode(inline["data"]), model
            err_text = json.dumps(resp)[:600]
            print(f"[gen] no image in response: {err_text}")
            last_err = "no image in response"
        except urllib.error.HTTPError as e:
            err_body = e.read().decode(errors="replace")[:600]
            print(f"[gen] HTTP {e.code} model={model}: {err_body}")
            last_err = f"HTTP {e.code}: {err_body}"
        except Exception as e:
            print(f"[gen] error model={model}: {e}")
            last_err = str(e)
    raise RuntimeError(f"All models failed: {last_err}")

# --- step 4: generation specs ---------------------------------------------
STYLE_HEAD = """You are extending a continuous vertical illustration for a
website background. Style: painterly photorealism, cinematic natural light,
heavy bark texture, rich greens with amber highlights, Studio Ghibli meets
naturalist plate. Output 1920x1080 (16:9). The tree trunk runs perfectly
vertical and centered horizontally in every frame, with bare lateral
branches. NO text, no garments, no hangers, no patches, no UI elements, no
people, no treehouse. Clean safe margins flanking the trunk for later
overlay compositing. CLEAN PLATE ONLY.
"""

CONTINUITY = """The TOP 256 pixels of your output must visually match the
first attached reference image (it is the bottom edge of the panel above
yours: same trunk position, same bark, same ground line, same lighting).
{NEXT_TEXT}
Blend new environmental content downward from the top join with soft
atmospheric haze and overlapping foliage — no hard horizon cuts."""

NEXT_WITH = ("The BOTTOM 256 pixels of your output must visually match the "
             "second attached reference image (it is the top edge of the panel "
             "below yours).")
NEXT_NONE = ("The bottom edge can be open — leave it ready for further extension.")

PROMPTS = {
    "ocean": STYLE_HEAD + """
ZONE: OCEAN. Below the join, transition the world behind the tree into a
moody coastal seascape. Deep indigo-teal water with long horizontal wave
lines, hazy salt horizon, distant sea cliffs, cold sea-spray light.
Sea-foam and kelp lap around the base of the trunk by mid-frame. The tree
stands straight through shallow water — slightly surreal, tree-in-sea.
Salt-wet atmosphere. Palette: deep teal, slate, faint amber from a low sun.
""",
    "jungle": STYLE_HEAD + """
ZONE: JUNGLE. Below the join, the world warms into a dense tropical
rainforest. Giant monstera and banana leaves, hanging lianas, tree ferns,
epiphytic orchids clinging to the bark. A single golden sun-shaft cuts
through the upper canopy. Palette: amber-green, humid, loud-with-life.
""",
    "garden": STYLE_HEAD + """
ZONE: ENGLISH COUNTRY GARDEN (limited edition feel). Below the join, the
world softens into a romantic English country garden at late golden hour.
Low hedgerows, climbing old-roses, hollyhocks, foxgloves, a crumbling
stone wall in the distance, wildflower meadow. Palette: dusty rose, sage,
buttermilk, soft cream. Peaceful, nostalgic, slightly melancholy.
""",
    "shop": STYLE_HEAD + """
ZONE: DEEP EARTH (between the root system above and the magic pool below).
Below the join, descend further underground. Rich chocolate-brown soil,
mineral striations, glinting quartz pebbles, a scatter of taproots
reaching further down. A faint warm internal glow as if from a buried
lantern or bioluminescence. Cohesive with the root system above — same
tree, wider and more primal.
""",
}

# Order of generation matters because each panel uses the previous as ref.
# (prev_panel  is the one above this section in the page;
#  next_panel  is the one below this section in the page, if known.)
GEN_ORDER = [
    # name      prev  next       (None means generated, will use the just-created one)
    ("ocean",   "p03", None     ),  # Forest above; next will be jungle (not yet)
    ("jungle",  "ocean", None   ),  # Ocean above; next will be garden (not yet)
    ("garden",  "jungle", "p04" ),  # Jungle above; Story (p04) below — both known
    ("shop",    "p06",  "p07"   ),  # Mission (p06) above; Footer (p07) below
]

# --- main ------------------------------------------------------------------
def resolve_panel(name: str) -> Path:
    if name.startswith("p"):
        return PANEL_DIR / f"{name}.png"
    return PANEL_DIR / f"{name}.png"

def main():
    slice_existing()

    for name, prev, nxt in GEN_ORDER:
        prev_path = resolve_panel(prev)
        if not prev_path.exists():
            raise FileNotFoundError(prev_path)
        prev_ref = edge_strip(prev_path, "bottom")
        refs = [prev_ref]
        next_text = NEXT_NONE
        if nxt:
            nxt_path = resolve_panel(nxt)
            if not nxt_path.exists():
                raise FileNotFoundError(nxt_path)
            refs.append(edge_strip(nxt_path, "top"))
            next_text = NEXT_WITH
        prompt = (PROMPTS[name].rstrip()
                  + "\n\n"
                  + CONTINUITY.replace("{NEXT_TEXT}", next_text))
        print(f"\n[gen] === {name} === prev={prev}  next={nxt}")
        out_path = PANEL_DIR / f"{name}.png"
        if out_path.exists():
            print(f"[gen] {out_path} already exists — skipping")
            continue
        try:
            data, used = call_image_model(prompt, refs)
            out_path.write_bytes(data)
            im = Image.open(out_path)
            print(f"[gen] saved {out_path.name}  size={im.size}  model={used}")
        except Exception as e:
            print(f"[gen] FAILED {name}: {e}")
            traceback.print_exc()

    print("\n[done] panels in", PANEL_DIR)
    for p in sorted(PANEL_DIR.glob("*.png")):
        try:
            sz = Image.open(p).size
        except Exception:
            sz = "?"
        print(f"  {p.name:<14} {sz}")

if __name__ == "__main__":
    main()
