"""
Repeatable image processing script for HIJAB GRIP client photos.
Strips all metadata, crops, scales, and exports optimized WebP & JPEG assets.
"""

import os
import shutil
from PIL import Image, ImageFilter, ImageDraw

def strip_metadata(img: Image.Image) -> Image.Image:
    """Create a pristine copy of the image without any EXIF or metadata."""
    clean_img = Image.new(img.mode, img.size)
    clean_img.putdata(list(img.getdata()))
    return clean_img

def apply_privacy_face_blur(img: Image.Image) -> Image.Image:
    """
    Applies a tasteful gentle Gaussian blur to the influencer model's face for privacy,
    while keeping the black Hijab Grip band, undercap, and olive hijab fabric 100% sharp.
    """
    w, h = img.size
    blurred = img.filter(ImageFilter.GaussianBlur(radius=5))
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)
    cx, cy = 415, 385
    rx, ry = 120, 160
    draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=255)
    feathered_mask = mask.filter(ImageFilter.GaussianBlur(radius=20))
    return Image.composite(blurred, img, feathered_mask)

def process_photos():
    orig_dir = os.path.normpath("frontend/design-assets/originals")
    out_dirs = [
        os.path.normpath("frontend/public/assets/images"),
        os.path.normpath("frontend/public/images")
    ]
    archive_dir = os.path.normpath("frontend/design-assets/archive")

    for od in out_dirs:
        os.makedirs(od, exist_ok=True)
    os.makedirs(archive_dir, exist_ok=True)

    # 1. Archive non-black and outdated 3D render images
    files_to_archive = [
        "grip_three_pack_tray.jpg",
        "grip_isolated_nude.jpg",
        "grip_isolated_ivory.jpg",
        "packs_screen_full.png",
        "grip_isolated_black.jpg"
    ]

    for fname in files_to_archive:
        for od in out_dirs:
            src = os.path.join(od, fname)
            if os.path.exists(src):
                dest = os.path.join(archive_dir, fname)
                shutil.move(src, dest)
                print(f"Archived {src} -> {dest}")

    # 2. Process Model Photo (Olive Hijab with Black Grip)
    model_src = os.path.join(orig_dir, "model-olive-hijab.jpeg")
    if not os.path.exists(model_src):
        raise FileNotFoundError(f"Model source photo not found: {model_src}")

    im_model_raw = Image.open(model_src).convert("RGB")
    im_model = strip_metadata(im_model_raw)
    im_model = apply_privacy_face_blur(im_model)

    # 4:5 Crop: original is 768x1024. For 4:5, height is 768 / 0.8 = 960.
    # The head/grip starts around y=104. Taking y from 48 to 1008 keeps 56px white margin at top.
    w, h = im_model.size
    crop_4_5_h = int(w / 0.8) # 960
    crop_4_5_top = 48
    crop_4_5_bottom = crop_4_5_top + crop_4_5_h
    im_model_4_5 = im_model.crop((0, crop_4_5_top, w, crop_4_5_bottom))

    # Rescale to 1200x1500, 800x1000, 480x600
    model_sizes = {
        1200: (1200, 1500),
        800: (800, 1000),
        480: (480, 600)
    }

    print("\n--- Model 4:5 Exports ---")
    for width, size in model_sizes.items():
        resized = im_model_4_5.resize(size, Image.Resampling.LANCZOS)
        # WebP export
        webp_name = f"model-olive-hijab-{width}.webp"
        for od in out_dirs:
            target_webp = os.path.join(od, webp_name)
            resized.save(target_webp, "WEBP", quality=82, method=6)
        size_kb = os.path.getsize(os.path.join(out_dirs[0], webp_name)) / 1024
        print(f"{webp_name}: {size[0]}x{size[1]}, {size_kb:.1f} KB")

        # JPEG fallback for hero (1200px)
        if width == 1200:
            jpg_name = f"model-olive-hijab-{width}.jpg"
            for od in out_dirs:
                target_jpg = os.path.join(od, jpg_name)
                resized.save(target_jpg, "JPEG", quality=82, optimize=True)
            size_kb = os.path.getsize(os.path.join(out_dirs[0], jpg_name)) / 1024
            print(f"{jpg_name} (JPEG Fallback): {size[0]}x{size[1]}, {size_kb:.1f} KB")

    # Square Crop (800x800) centered on face & grip
    # Grip is at y=104. Taking y from 40 to 808 gives a 768x768 square.
    im_model_sq = im_model.crop((0, 40, 768, 808)).resize((800, 800), Image.Resampling.LANCZOS)
    sq_name = "model-olive-hijab-square-800.webp"
    for od in out_dirs:
        im_model_sq.save(os.path.join(od, sq_name), "WEBP", quality=82, method=6)
    size_kb = os.path.getsize(os.path.join(out_dirs[0], sq_name)) / 1024
    print(f"\n--- Model Square Export ---")
    print(f"{sq_name}: 800x800, {size_kb:.1f} KB")

    # 3. Process Close-up Photo (Black Grip on Mannequin Head)
    grip_src = os.path.join(orig_dir, "grip-closeup.png")
    if not os.path.exists(grip_src):
        raise FileNotFoundError(f"Grip source photo not found: {grip_src}")

    im_grip_raw = Image.open(grip_src).convert("RGB")
    im_grip = strip_metadata(im_grip_raw)

    grip_sizes = [1200, 800, 480]
    print("\n--- Grip Closeup Exports ---")
    for sz in grip_sizes:
        resized_grip = im_grip.resize((sz, sz), Image.Resampling.LANCZOS)
        grip_name = f"grip-closeup-{sz}.webp"
        for od in out_dirs:
            resized_grip.save(os.path.join(od, grip_name), "WEBP", quality=82, method=6)
        size_kb = os.path.getsize(os.path.join(out_dirs[0], grip_name)) / 1024
        print(f"{grip_name}: {sz}x{sz}, {size_kb:.1f} KB")

    print("\nAll photo processing completed successfully!")

if __name__ == "__main__":
    process_photos()
