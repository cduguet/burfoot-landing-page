#!/usr/bin/env python3
"""
Super-res tree-bg.png in 4 vertical parts via Nano Banana 2, with CHAINED
continuity references — each panel gets the bottom of the previous panel
as an extra reference image, with explicit instructions to match its top
edge to it. Then stitch with a wide histogram-matched blend.

Part 1 also swaps the small creature on the treehouse for Burfoot
(assets/burfoot.jpeg).
"""
from __future__ import annotations
import os, json, base64
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw
import urllib.request, urllib.error

ROOT       = Path(__file__).resolve().parent.parent
SRC        = ROOT / "assets" / "tree-bg.png"
BURFOOT    = ROOT / "assets" / "burfoot.jpeg"
WORK       = ROOT / "assets" / "_superres"
FINAL_PNG  = ROOT / "assets" / "tree-bg-hires.png"
FINAL_WEBP = ROOT / "assets" / "tree-bg-hires.webp"
ENV        = ROOT / ".env"

# --- env -----------------------------------------------------------------
for line in ENV.read_text().splitlines():
    line = line.strip()
    if not line or line.startswith("#") or "=" not in line: continue
    k, v = line.split("=", 1)
    os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
API_KEY = os.environ["GEMINI_API_KEY"]

MODELS = [
    "nano-banana-pro-preview",
    "gemini-3-pro-image-preview",
    "gemini-3.1-flash-image-preview",
    "gemini-2.5-flash-image",
]

# --- helpers -------------------------------------------------------------
def encode(path: Path) -> dict:
    mime = "image/jpeg" if path.suffix.lower() in (".jpg", ".jpeg") else "image/png"
    return {"inlineData": {"mimeType": mime, "data": base64.b64encode(path.read_bytes()).decode()}}

def call(prompt: str, refs: list[Path], aspect: str = "1:1"):
    parts = [{"text": prompt}]
    for r in refs:
        parts.append(encode(r))
    body = {
        "contents": [{"role": "user", "parts": parts}],
        "generationConfig": {
            "responseModalities": ["IMAGE"],
            "imageConfig": {"aspectRatio": aspect},
        },
    }
    last = None
    for m in MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent"
        req = urllib.request.Request(url,
            data=json.dumps(body).encode(),
            headers={"Content-Type":"application/json","x-goog-api-key":API_KEY})
        try:
            print(f"  [api] try {m}")
            with urllib.request.urlopen(req, timeout=300) as r:
                resp = json.loads(r.read().decode())
            for c in resp.get("candidates", []):
                for p in c.get("content",{}).get("parts",[]):
                    inline = p.get("inlineData") or p.get("inline_data")
                    if inline and inline.get("data"):
                        return base64.b64decode(inline["data"]), m
            last = "no image: " + json.dumps(resp)[:300]
            print(f"  [api] {last}")
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code}: {e.read().decode(errors='replace')[:300]}"
            print(f"  [api] {last}")
        except Exception as e:
            last = str(e)
            print(f"  [api] {last}")
    raise RuntimeError(f"all models failed: {last}")

# --- 1. slice source into 4 ---------------------------------------------
def slice_source(n: int = 4):
    WORK.mkdir(exist_ok=True)
    src = Image.open(SRC).convert("RGB")
    w, h = src.size
    print(f"[slice] {w}x{h} → {n} parts")
    out = []
    for i in range(n):
        top = (h * i) // n
        bot = (h * (i+1)) // n
        crop = src.crop((0, top, w, bot))
        p = WORK / f"src_{i+1}.png"
        crop.save(p, optimize=True)
        out.append(p)
        print(f"  part {i+1}: rows {top}..{bot}  {crop.size}")
    return out

def edge_strip(img_path: Path, where: str, h: int = 256) -> Path:
    """Save the top or bottom strip of an image as a new file."""
    im = Image.open(img_path).convert("RGB")
    w, ih = im.size
    if where == "bottom":
        crop = im.crop((0, ih - h, w, ih))
        out = img_path.parent / f"{img_path.stem}_bot{h}.png"
    else:
        crop = im.crop((0, 0, w, h))
        out = img_path.parent / f"{img_path.stem}_top{h}.png"
    crop.save(out)
    return out

# --- 2. prompts ----------------------------------------------------------
PROMPT_FIRST = """Recreate the FIRST reference image at higher resolution and crisper detail.

The FIRST reference has a bright MAGENTA RECTANGLE drawn on it. This rectangle is a MASK — a non-printing marker. It defines the ONLY area you may edit.

EDIT INSIDE the magenta rectangle:
- Replace whatever is inside it with the character shown in the SECOND reference (Burfoot — a small soft round furry friendly forest creature with antler-like horns and a floral crown). Same scale, painted in the same illustrated style as the rest of the scene.

NON-EDITING AREA — DO NOT TOUCH anything OUTSIDE the magenta rectangle:
- Keep every pixel outside the rectangle pixel-identical to the first reference.
- Do NOT change the trees, branches, treehouse, sky, water, lighting, colors, or composition.
- DO NOT include the magenta rectangle itself in your output — paint over it cleanly with the new content.

Match the top edge and bottom edge of the source exactly so the panels stitch."""

PROMPT_CHAIN = """Recreate the FIRST reference image at higher resolution and crisper detail.

The FIRST reference has a bright MAGENTA RECTANGLE drawn around its TOP region. This rectangle is a MASK marker. The pixels INSIDE the magenta rectangle are a LOCKED, NON-EDITING ZONE — they are the bottom edge of the panel above this one and they MUST appear pixel-identical in your output. Do not redraw, restyle, recolor, or shift them. Do NOT include the magenta rectangle line itself in your output.

OUTSIDE the magenta rectangle:
- Re-render the source image at higher resolution and crisper detail.
- Same composition, same tree, same branches, same roots, same lighting, same colors, same painterly Studio Ghibli / illustrated naturalist style.
- Continue the trunk and bark from the locked top zone smoothly down — no horizontal cuts, no shifts in trunk position, no colour banding.

Match the bottom edge of the FIRST reference exactly so the next panel below stitches cleanly."""

# --- 3. super-res with chained continuity --------------------------------
def add_edit_mask(src_path: Path, box: tuple[int,int,int,int]) -> Path:
    """Draw a translucent magenta rectangle on a copy of src_path.

    box = (left, top, right, bottom) in source coords. The model treats
    this as a "edit-only-inside" marker; everything outside is locked.
    """
    im = Image.open(src_path).convert("RGB")
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle(box, outline=(255, 0, 220, 255), width=8,
                fill=(255, 0, 220, 60))
    out = im.convert("RGBA")
    out.alpha_composite(overlay)
    out = out.convert("RGB")
    p = src_path.parent / f"{src_path.stem}_masked.png"
    out.save(p)
    return p

# Original creature in src_1 (1024x1032): small horned furry thing peeking
# from the right side of the treehouse. Box hugs that area only.
BURFOOT_BOX = (720, 200, 940, 420)

LOCK_H = 256  # rows pinned at the top of each chain panel

def build_locked_source(src_path: Path, prev_path: Path, lock_h: int = LOCK_H) -> Path:
    """Build a composite: top `lock_h` rows = bottom `lock_h` rows of the
    previous super-resed panel (resized to source width), bottom rows =
    source panel's content from row `lock_h` down. Then draw a magenta
    border around the top zone marking it as the non-editing region."""
    src = Image.open(src_path).convert("RGB")
    prev = Image.open(prev_path).convert("RGB")
    # take prev's bottom `lock_h` rows, resize to source width
    pw, ph = prev.size
    bot = prev.crop((0, ph - lock_h, pw, ph))
    if bot.size[0] != src.size[0]:
        ratio = src.size[0] / bot.size[0]
        bot = bot.resize((src.size[0], int(bot.size[1] * ratio)), Image.LANCZOS)
        # if resize changed height, crop to lock_h
        if bot.size[1] > lock_h:
            bot = bot.crop((0, 0, bot.size[0], lock_h))
    # composite onto src
    comp = src.copy()
    comp.paste(bot, (0, 0))
    # magenta marker around the locked zone
    overlay = Image.new("RGBA", comp.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, 0, comp.size[0]-1, lock_h-1),
                outline=(255, 0, 220, 255), width=8,
                fill=(255, 0, 220, 30))
    out = comp.convert("RGBA")
    out.alpha_composite(overlay)
    out = out.convert("RGB")
    p = src_path.parent / f"{src_path.stem}_locked.png"
    out.save(p)
    return p

def superres(parts):
    out = []
    for i, p in enumerate(parts):
        target = WORK / f"hi_{i+1}.png"
        if target.exists():
            print(f"[sr] {target.name} exists — skip")
            out.append(target)
            continue
        print(f"[sr] part {i+1}")
        if i == 0:
            masked = add_edit_mask(p, BURFOOT_BOX)
            print(f"  edit-mask drawn at {BURFOOT_BOX}")
            data, used = call(PROMPT_FIRST, [masked, BURFOOT])
            target.write_bytes(data)
        else:
            locked = build_locked_source(p, out[-1], LOCK_H)
            print(f"  locked-top composite built")
            data, used = call(PROMPT_CHAIN, [locked])
            target.write_bytes(data)
            # post-process: force pixel-identical lock zone using prev's bottom
            prev = Image.open(out[-1]).convert("RGB")
            cur = Image.open(target).convert("RGB")
            pw, ph = prev.size
            cw, ch = cur.size
            bot = prev.crop((0, ph - LOCK_H, pw, ph))
            # scale lock height proportionally to current panel resolution
            cur_lock_h = round(LOCK_H * ch / Image.open(p).size[1])
            if bot.size != (cw, cur_lock_h):
                bot = bot.resize((cw, cur_lock_h), Image.LANCZOS)
            cur.paste(bot, (0, 0))
            cur.save(target, optimize=True)
            print(f"  force-pasted prev bottom into top {cur_lock_h}px")
        sz = Image.open(target).size
        print(f"  saved {target.name} {sz} via {used}")
        out.append(target)
    return out

# --- 4. histogram-match each panel's seam to the panel above -----------
def match_histogram(src: Image.Image, ref: Image.Image) -> Image.Image:
    """Match per-channel histogram of src to ref. Pure-Python (no numpy).
    Both images must be the same size; returns a copy of src remapped to
    the cumulative distribution of ref."""
    out_bands = []
    for sb, rb in zip(src.split(), ref.split()):
        s_hist = sb.histogram()
        r_hist = rb.histogram()
        s_total = sum(s_hist) or 1
        r_total = sum(r_hist) or 1
        # cumulative distributions
        s_cum = []; acc = 0
        for v in s_hist: acc += v; s_cum.append(acc / s_total)
        r_cum = []; acc = 0
        for v in r_hist: acc += v; r_cum.append(acc / r_total)
        # build lookup table: for each src level, find ref level with same quantile
        lut = [0] * 256
        ri = 0
        for si in range(256):
            target = s_cum[si]
            while ri < 255 and r_cum[ri] < target:
                ri += 1
            lut[si] = ri
        out_bands.append(sb.point(lut))
    return Image.merge("RGB", out_bands)

# --- 5. stitch with wide smoothstep blend -------------------------------
SEAM = 384

def gradient_mask(w, h):
    m = Image.new("L", (w, h))
    for y in range(h):
        t = y / max(1, h-1)
        v = 3*t*t - 2*t*t*t
        m.paste(int(255*v), (0, y, w, y+1))
    return m

def stitch(parts):
    """With locked-top chain panels, panel i+1's top LOCK_H rows are
    already pixel-identical to panel i's bottom LOCK_H rows (force-pasted).
    To avoid duplicating those rows in the canvas, we keep panel i fully
    and skip panel i+1's top LOCK_H rows. A small smoothstep blend covers
    any model deviation just below the locked zone.
    """
    imgs = [Image.open(p).convert("RGB") for p in parts]
    target_w = max(im.size[0] for im in imgs)
    norm = []
    for im in imgs:
        if im.size[0] != target_w:
            r = target_w / im.size[0]
            im = im.resize((target_w, int(im.size[1]*r)), Image.LANCZOS)
        norm.append(im)

    # scale LOCK_H to each panel's actual height (model output is 1024 even
    # though source was 1032 — keep the proportion)
    src_h = 1032
    BLEND = 64  # short cross-fade just below the locked zone

    pieces = [norm[0]]
    for i in range(1, len(norm)):
        cur = norm[i]
        prev = pieces[-1] if i == 1 else norm[i-1]  # both at full panel res
        cur_lock = max(1, LOCK_H * cur.size[1] // src_h)
        # crop current panel to drop the locked top rows (they duplicate prev's bottom)
        cropped = cur.crop((0, cur_lock, cur.size[0], cur.size[1]))
        # cross-fade the first BLEND rows of the cropped panel against
        # what would be 'prev's content extending downward': use prev's
        # bottom BLEND rows as the source of the fade-from
        prev_tail = prev.crop((0, prev.size[1]-BLEND, prev.size[0], prev.size[1]))
        cur_head = cropped.crop((0, 0, cropped.size[0], BLEND))
        cur_head_matched = match_histogram(cur_head, prev_tail)
        mask = gradient_mask(cropped.size[0], BLEND)
        blended_head = Image.composite(cur_head_matched, prev_tail, mask)
        cropped.paste(blended_head, (0, 0))
        pieces.append(cropped)

    total_h = sum(p.size[1] for p in pieces)
    canvas = Image.new("RGB", (target_w, total_h))
    y = 0
    for p in pieces:
        canvas.paste(p, (0, y))
        y += p.size[1]

    canvas.save(FINAL_PNG, optimize=True)
    canvas.save(FINAL_WEBP, "WEBP", quality=85, method=6)
    print(f"[stitch] {FINAL_PNG.name}: {canvas.size}  ({os.path.getsize(FINAL_PNG)/1024:.0f} KB)")
    print(f"[stitch] {FINAL_WEBP.name}: ({os.path.getsize(FINAL_WEBP)/1024:.0f} KB)")

if __name__ == "__main__":
    parts = slice_source(4)
    hi = superres(parts)
    stitch(hi)
    print("[done]")
