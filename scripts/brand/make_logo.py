#!/usr/bin/env python3
"""
Complete brand asset pipeline for Hijab World.
Produces:
- hijab-world-emblem-badge-1024.png, -512.png, -256.png, -128.png, -80.png (and WebP)
- hijab-world-logo-full-1024.png, -512.png (and WebP)
- hijab-world-emblem-gold-transparent-512.png (and WebP)
- hijab-world-wordmark.svg, hijab-world-wordmark.png (and WebP)
- Favicons: frontend/src/app/icon.png, apple-icon.png, favicon.ico
- Open Graph: frontend/public/assets/brand/og-image.png
- Verification preview: docs/brand/logo-preview.png
"""
import os
import subprocess
import numpy as np
from PIL import Image, ImageFilter, ImageDraw, ImageFont, ImageOps
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

def main():
    print("=== Step 2 & 3: Cleaning Logo Image & Vector Wordmark Generation ===")
    brand_dir = 'frontend/public/assets/brand'
    font_path = 'scripts/brand/fonts/BerkshireSwash.ttf'
    orig_path = 'frontend/public/assets/brand/hijab-world-logo-original.png'
    app_dir = 'frontend/src/app'
    docs_dir = 'docs/brand'

    os.makedirs(brand_dir, exist_ok=True)
    os.makedirs(docs_dir, exist_ok=True)

    # 1. Load original
    orig_img = Image.open(orig_path).convert('RGB')
    orig_w, orig_h = orig_img.size

    # 2. Crop to circle bounding box (0, 9, 961, 1021)
    crop_box = (0, 9, 961, 1021)
    cropped = orig_img.crop(crop_box)

    # 3. Fix stretch: resize to true 1024x1024 square with Lanczos
    sq_1024 = cropped.resize((1024, 1024), Image.Resampling.LANCZOS)
    arr_1024 = np.array(sq_1024)

    # 4. Anti-aliased circular alpha mask with 1.5px feather
    mask_high = Image.new('L', (2048, 2048), 0)
    draw_m = ImageDraw.Draw(mask_high)
    # Circle diameter 2048, inset by 4px for crisp edge
    draw_m.ellipse((4, 4, 2044, 2044), fill=255)
    mask_1024 = mask_high.filter(ImageFilter.GaussianBlur(radius=2.5)).resize((1024, 1024), Image.Resampling.LANCZOS)
    mask_arr = np.array(mask_1024, dtype=np.float32) / 255.0

    # 5. Text removal mask
    # Text region: y >= 730 for x < 250 and x >= 450; y >= 733 for 250 <= x < 450
    text_paint_mask = np.zeros((1024, 1024), dtype=bool)
    for y in range(730, 875):
        for x in range(90, 960):
            if x < 250 and y >= 730:
                text_paint_mask[y, x] = True
            elif x >= 450 and y >= 730:
                text_paint_mask[y, x] = True
            elif 250 <= x < 450 and y >= 733:
                text_paint_mask[y, x] = True

    badge_rgb = arr_1024.copy()
    badge_rgb_before = arr_1024.copy()

    # Denoise black background: clean JPEG blockiness outside emblem
    # Background pixels have max(R,G,B) < 22
    is_dark_bg = (np.max(badge_rgb, axis=2) < 22)
    badge_rgb[is_dark_bg] = [0, 0, 0]

    # Paint text region with exact uniform black #000000
    badge_rgb[text_paint_mask] = [0, 0, 0]

    # Verify emblem pixels are untouched
    untouched_mask = (~text_paint_mask) & (~is_dark_bg)
    diff = np.sum(np.abs(badge_rgb[untouched_mask].astype(int) - badge_rgb_before[untouched_mask].astype(int)))
    print(f"Emblem difference outside text region: {diff} (Untouched: {diff == 0})")
    assert diff == 0, "Emblem pixels were altered!"

    # Composite with circular alpha mask
    badge_rgba = np.zeros((1024, 1024, 4), dtype=np.uint8)
    badge_rgba[:, :, :3] = badge_rgb
    badge_rgba[:, :, 3] = (mask_arr * 255.0).astype(np.uint8)
    badge_img_1024 = Image.fromarray(badge_rgba, 'RGBA')

    # Save badge-1024.png
    badge_1024_path = os.path.join(brand_dir, 'hijab-world-emblem-badge-1024.png')
    badge_img_1024.save(badge_1024_path, 'PNG', optimize=True)
    print("Saved:", badge_1024_path)

    # 6. Build SVG wordmark with exact Berkshire Swash vector outlines
    font = TTFont(font_path)
    units_per_em = font['head'].unitsPerEm
    hmtx = font['hmtx']
    cmap = font.getBestCmap()
    glyph_set = font.getGlyphSet()

    wordmark_text = "Hijab_world"
    glyph_names = [cmap[ord(c)] for c in wordmark_text]

    x_cursor = 0
    svg_paths = []
    for gname in glyph_names:
        pen = SVGPathPen(glyph_set)
        glyph = glyph_set[gname]
        glyph.draw(pen)
        d = pen.getCommands()
        if d:
            svg_paths.append(f'<path d="{d}" transform="translate({x_cursor}, 0)" />')
        advance, lsb = hmtx[gname]
        x_cursor += advance

    total_w = x_cursor
    target_w = 716.0
    scale = target_w / total_w
    half_w = total_w / 2.0
    text_gold_hex = "#A18A44"
    baseline_y = 816

    # 1024 Full SVG
    svg_wordmark_full = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <g transform="translate(512, {baseline_y}) scale({scale:.6f}, -{scale:.6f}) translate(-{half_w:.2f}, 0)" fill="{text_gold_hex}">
    {''.join(svg_paths)}
  </g>
</svg>'''

    svg_dest = os.path.join(brand_dir, 'hijab-world-wordmark.svg')
    with open(svg_dest, 'w', encoding='utf-8') as f:
        f.write(svg_wordmark_full)
    print("Saved wordmark SVG:", svg_dest)

    # Standalone tight-box wordmark SVG
    ascender_h = 1600.0 * scale
    descender_h = 600.0 * scale
    svg_tight_h = int(ascender_h + descender_h + 20)
    svg_tight_w = int(target_w + 20)
    svg_wordmark_tight = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_tight_w} {svg_tight_h}" width="{svg_tight_w}" height="{svg_tight_h}">
  <g transform="translate(10, {int(ascender_h + 10)}) scale({scale:.6f}, -{scale:.6f})" fill="{text_gold_hex}">
    {''.join(svg_paths)}
  </g>
</svg>'''
    with open(os.path.join(brand_dir, 'hijab-world-wordmark-standalone.svg'), 'w', encoding='utf-8') as f:
        f.write(svg_wordmark_tight)

    # 7. Rasterize wordmark using sharp via node
    print("Rasterizing wordmark with sharp...")
    raster_script = """
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('frontend/node_modules/sharp'));

async function run() {
  const svgBuf = fs.readFileSync('frontend/public/assets/brand/hijab-world-wordmark.svg');
  await sharp(svgBuf).png().toFile('frontend/public/assets/brand/hijab-world-wordmark.png');
  
  const tightBuf = fs.readFileSync('frontend/public/assets/brand/hijab-world-wordmark-standalone.svg');
  await sharp(tightBuf).png().toFile('frontend/public/assets/brand/hijab-world-wordmark-tight.png');
  console.log('Rasterized wordmarks!');
}
run().catch(console.error);
"""
    with open('scripts/brand/run_sharp.mjs', 'w', encoding='utf-8') as f:
        f.write(raster_script)
    subprocess.run(['node', 'scripts/brand/run_sharp.mjs'], check=True)

    # 8. Compose Full Logo (Badge + Wordmark)
    wordmark_img = Image.open(os.path.join(brand_dir, 'hijab-world-wordmark.png')).convert('RGBA')
    logo_full_1024 = badge_img_1024.copy()
    logo_full_1024.alpha_composite(wordmark_img)
    logo_full_path = os.path.join(brand_dir, 'hijab-world-logo-full-1024.png')
    logo_full_1024.save(logo_full_path, 'PNG', optimize=True)
    print("Saved:", logo_full_path)

    # 9. Gold Emblem Only on Transparent Background (512x512)
    # Color to alpha on black
    badge_clean_rgb = badge_rgb.astype(np.float32)
    max_c = np.max(badge_clean_rgb, axis=2)
    # Noise threshold
    alpha_clean = np.clip((max_c - 10.0) / 245.0, 0.0, 1.0)
    # Apply circular mask
    alpha_clean = alpha_clean * mask_arr
    safe_a = np.maximum(alpha_clean, 1e-5)[:, :, np.newaxis]
    rgb_unmult = np.clip(badge_clean_rgb / safe_a, 0.0, 255.0)

    gold_rgba = np.zeros((1024, 1024, 4), dtype=np.uint8)
    gold_rgba[:, :, :3] = rgb_unmult.astype(np.uint8)
    gold_rgba[:, :, 3] = (alpha_clean * 255.0).astype(np.uint8)
    gold_512 = Image.fromarray(gold_rgba, 'RGBA').resize((512, 512), Image.Resampling.LANCZOS)
    gold_path = os.path.join(brand_dir, 'hijab-world-emblem-gold-transparent-512.png')
    gold_512.save(gold_path, 'PNG', optimize=True)
    print("Saved:", gold_path)

    # 10. Export all badge sizes: 512, 256, 128, 80
    badge_sizes = [512, 256, 128, 80]
    for s in [1024] + badge_sizes:
        if s != 1024:
            b_img = badge_img_1024.resize((s, s), Image.Resampling.LANCZOS)
            p = os.path.join(brand_dir, f'hijab-world-emblem-badge-{s}.png')
            b_img.save(p, 'PNG', optimize=True)
        else:
            b_img = badge_img_1024
        # WebP version
        wp = os.path.join(brand_dir, f'hijab-world-emblem-badge-{s}.webp')
        b_img.save(wp, 'WEBP', quality=85)

    # Full logo 512 + WebP
    logo_full_512 = logo_full_1024.resize((512, 512), Image.Resampling.LANCZOS)
    logo_full_512.save(os.path.join(brand_dir, 'hijab-world-logo-full-512.png'), 'PNG', optimize=True)
    logo_full_512.save(os.path.join(brand_dir, 'hijab-world-logo-full-512.webp'), 'WEBP', quality=85)
    logo_full_1024.save(os.path.join(brand_dir, 'hijab-world-logo-full-1024.webp'), 'WEBP', quality=85)

    # Wordmark WebP
    wordmark_img.save(os.path.join(brand_dir, 'hijab-world-wordmark.webp'), 'WEBP', quality=85)
    gold_512.save(os.path.join(brand_dir, 'hijab-world-emblem-gold-transparent-512.webp'), 'WEBP', quality=85)

    # 11. Favicons
    # src/app/icon.png (512x512 badge)
    icon_512 = badge_img_1024.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512.save(os.path.join(app_dir, 'icon.png'), 'PNG', optimize=True)

    # src/app/apple-icon.png (180x180 badge)
    apple_180 = badge_img_1024.resize((180, 180), Image.Resampling.LANCZOS)
    apple_180.save(os.path.join(app_dir, 'apple-icon.png'), 'PNG', optimize=True)

    # src/app/favicon.ico (16, 32, 48)
    ico_img = badge_img_1024.resize((48, 48), Image.Resampling.LANCZOS)
    ico_img.save(os.path.join(app_dir, 'favicon.ico'), format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    # Also public/favicon.ico
    ico_img.save('frontend/public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print("Saved favicons (icon.png, apple-icon.png, favicon.ico)")

    # 12. Open Graph image (1200 x 630): dark brown/black background, full logo centered + text
    og_img = Image.new('RGB', (1200, 630), (14, 11, 10)) # Luxury dark brown #0E0B0A
    draw_og = ImageDraw.Draw(og_img)

    # Full logo centered at 380x380
    logo_og = logo_full_1024.resize((380, 380), Image.Resampling.LANCZOS)
    og_img.paste(logo_og, ((1200 - 380) // 2, 45), logo_og)

    # Text: "HIJAB GRIP by HIJAB WORLD"
    # Try serif font from system or draw elegant text
    try:
        f_playfair = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 38)
        f_sub = ImageFont.truetype('C:/Windows/Fonts/georgia.ttf', 20)
    except:
        f_playfair = ImageFont.load_default()
        f_sub = ImageFont.load_default()

    t1 = "HIJAB GRIP™"
    t2 = "BY HIJAB WORLD"
    # Centered text
    bbox1 = draw_og.textbbox((0, 0), t1, font=f_playfair)
    w1 = bbox1[2] - bbox1[0]
    draw_og.text(((1200 - w1) // 2, 455), t1, font=f_playfair, fill=(247, 242, 236))

    bbox2 = draw_og.textbbox((0, 0), t2, font=f_sub)
    w2 = bbox2[2] - bbox2[0]
    draw_og.text(((1200 - w2) // 2, 515), t2, font=f_sub, fill=(197, 160, 89))

    og_path = os.path.join(brand_dir, 'og-image.png')
    og_img.save(og_path, 'PNG', optimize=True)
    print("Saved Open Graph image:", og_path)

    # 13. Create docs/brand/logo-preview.png contact sheet
    # Showing original, final badge, and full logo on cream (#F7F2EC), black, and white
    # At 40, 128, 512 px + zoom crops of old text vs new text
    preview_w = 1200
    preview_h = 1350
    preview = Image.new('RGB', (preview_w, preview_h), (250, 248, 245))
    draw_p = ImageDraw.Draw(preview)

    try:
        f_title = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 24)
        f_lbl = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)
        f_sm = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)
    except:
        f_title = f_lbl = f_sm = ImageFont.load_default()

    draw_p.text((40, 25), "HIJAB WORLD BRAND LOGO VERIFICATION SHEET", fill=(20, 20, 20), font=f_title)
    draw_p.text((40, 60), "Emblem Preservation • Circle Unstretch • Flat Denoise • Swash Wordmark Outline (Hijab_world)", fill=(100, 100, 100), font=f_lbl)

    # Row 1: Original vs Final Badge vs Final Full Logo (at 300px each)
    draw_p.text((50, 110), "Original Logo (Profile Screenshot)", fill=(40, 40, 40), font=f_lbl)
    draw_p.text((430, 110), "Final Badge (Unstretched, Crisp Black)", fill=(40, 40, 40), font=f_lbl)
    draw_p.text((810, 110), "Final Full Logo (Clean Wordmark)", fill=(40, 40, 40), font=f_lbl)

    im_orig_disp = orig_img.resize((320, int(320 * orig_h / orig_w)), Image.Resampling.LANCZOS)
    preview.paste(im_orig_disp, (50, 140))

    im_badge_disp = badge_img_1024.resize((320, 320), Image.Resampling.LANCZOS)
    preview.paste(im_badge_disp, (430, 140), im_badge_disp)

    im_full_disp = logo_full_1024.resize((320, 320), Image.Resampling.LANCZOS)
    preview.paste(im_full_disp, (810, 140), im_full_disp)

    # Row 2: Zoom crops of old text vs new text
    draw_p.text((50, 500), "Original Text Region (Zoom: @Hijab_worl with @ and truncated 'l')", fill=(180, 50, 50), font=f_lbl)
    old_zoom = orig_img.crop((120, 720, 880, 855)).resize((520, 95), Image.Resampling.LANCZOS)
    preview.paste(old_zoom, (50, 530))

    draw_p.text((630, 500), "New Vector Wordmark Region (Zoom: Hijab_world in Berkshire Swash)", fill=(40, 120, 40), font=f_lbl)
    new_zoom = logo_full_1024.crop((120, 720, 880, 855)).resize((520, 95), Image.Resampling.LANCZOS)
    preview.paste(new_zoom, (630, 530), new_zoom)

    # Row 3: Multi-background checks (Cream #F7F2EC, Black #000000, White #FFFFFF)
    draw_p.text((50, 660), "Background Verification (Cream #F7F2EC / Pure Black #000000 / Pure White #FFFFFF)", fill=(40, 40, 40), font=f_lbl)

    bg_configs = [
        ("Cream #F7F2EC (Site Header)", (247, 242, 236), 50),
        ("Dark / Black (Site Footer)", (14, 11, 10), 430),
        ("Pure White (Clean Spec)", (255, 255, 255), 810)
    ]

    for label, bg_color, x_start in bg_configs:
        draw_p.text((x_start, 695), label, fill=(60, 60, 60), font=f_sm)
        # Background card
        card = Image.new('RGB', (340, 340), bg_color)
        # paste 128px badge, 128px full logo, 40px header badge
        b128 = badge_img_1024.resize((128, 128), Image.Resampling.LANCZOS)
        f128 = logo_full_1024.resize((128, 128), Image.Resampling.LANCZOS)
        b40 = badge_img_1024.resize((40, 40), Image.Resampling.LANCZOS)

        card.paste(b128, (20, 20), b128)
        card.paste(f128, (180, 20), f128)
        card.paste(b40, (20, 190), b40)
        draw_c = ImageDraw.Draw(card)
        text_color = (20, 20, 20) if bg_color != (14, 11, 10) else (230, 230, 230)
        draw_c.text((75, 200), "40px Header Badge", fill=text_color, font=f_sm)
        draw_c.text((20, 155), "128px Badge", fill=text_color, font=f_sm)
        draw_c.text((180, 155), "128px Full Logo", fill=text_color, font=f_sm)

        # Border for visibility
        card_border = ImageOps.expand(card, border=1, fill=(210, 205, 200))
        preview.paste(card_border, (x_start, 725))

    # Row 4: Transparent Gold Emblem on Dark Background
    draw_p.text((50, 1100), "Emblem Gold Transparent on Dark Background (Smooth Luminance Alpha, Zero Black Fringe)", fill=(40, 40, 40), font=f_lbl)
    gold_card = Image.new('RGB', (1100, 160), (28, 25, 23))
    g_disp = gold_512.resize((140, 140), Image.Resampling.LANCZOS)
    gold_card.paste(g_disp, (40, 10), g_disp)
    draw_g = ImageDraw.Draw(gold_card)
    draw_g.text((220, 50), "Color-to-alpha extracted gold emblem (100% vector-like smooth transparency)", fill=(235, 225, 215), font=f_lbl)
    draw_g.text((220, 85), "Ideal for dark hero banners, premium foils, packaging, and watermark overlays.", fill=(180, 165, 150), font=f_sm)
    preview.paste(gold_card, (50, 1135))

    preview_path = os.path.join(docs_dir, 'logo-preview.png')
    preview.save(preview_path, 'PNG', optimize=True)
    print("Saved preview sheet:", preview_path)
    print("=== Pipeline Complete! ===")

if __name__ == '__main__':
    main()
