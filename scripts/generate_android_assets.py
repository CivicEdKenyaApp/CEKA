#!/usr/bin/env python3
"""
CEKA Android Asset Generator 🚀
================================
Generates all required Android resource images (app icons, splash screens)
from a single source image. Outputs to the correct res/ folder structure.

Usage:
    python generate_android_assets.py --icon logo.png --splash splash.png

Requirements:
    pip install Pillow
"""

import os
import sys
import argparse
from PIL import Image

# ==================== CONFIGURATION ====================

# Android app icon sizes (mipmap folders)
ICON_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

# Foreground icon for adaptive icons (with padding)
FOREGROUND_SIZES = {
    'mipmap-mdpi': 108,
    'mipmap-hdpi': 162,
    'mipmap-xhdpi': 216,
    'mipmap-xxhdpi': 324,
    'mipmap-xxxhdpi': 432,
}

# Splash screen sizes (portrait orientation)
SPLASH_PORTRAIT_SIZES = {
    'drawable-port-mdpi': (320, 480),
    'drawable-port-hdpi': (480, 800),
    'drawable-port-xhdpi': (720, 1280),
    'drawable-port-xxhdpi': (960, 1600),
    'drawable-port-xxxhdpi': (1280, 1920),
}

# Splash screen sizes (landscape orientation)
SPLASH_LANDSCAPE_SIZES = {
    'drawable-land-mdpi': (480, 320),
    'drawable-land-hdpi': (800, 480),
    'drawable-land-xhdpi': (1280, 720),
    'drawable-land-xxhdpi': (1600, 960),
    'drawable-land-xxxhdpi': (1920, 1280),
}

# Output directory (Android res folder)
RES_DIR = os.path.join(os.path.dirname(__file__), 
    '..', 'android', 'app', 'src', 'main', 'res')


def ensure_dir(path: str):
    """Create directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)


def resize_image(img: Image.Image, size: int | tuple, mode: str = 'contain') -> Image.Image:
    """
    Resize image to target size.
    - 'contain': Fit inside bounds, maintain aspect ratio
    - 'cover': Fill bounds, may crop
    - 'stretch': Exact size, may distort
    """
    if isinstance(size, int):
        size = (size, size)
    
    if mode == 'contain':
        img.thumbnail(size, Image.Resampling.LANCZOS)
        # Center on transparent background
        result = Image.new('RGBA', size, (0, 0, 0, 0))
        offset = ((size[0] - img.width) // 2, (size[1] - img.height) // 2)
        result.paste(img, offset, img if img.mode == 'RGBA' else None)
        return result
    elif mode == 'cover':
        # Scale to cover, then center crop
        img_ratio = img.width / img.height
        target_ratio = size[0] / size[1]
        if img_ratio > target_ratio:
            new_height = size[1]
            new_width = int(new_height * img_ratio)
        else:
            new_width = size[0]
            new_height = int(new_width / img_ratio)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        left = (new_width - size[0]) // 2
        top = (new_height - size[1]) // 2
        return img.crop((left, top, left + size[0], top + size[1]))
    else:  # stretch
        return img.resize(size, Image.Resampling.LANCZOS)


def generate_icons(source_path: str, res_dir: str):
    """Generate all app icon variants."""
    print(f"\n📱 Generating app icons from: {source_path}")
    
    img = Image.open(source_path).convert('RGBA')
    
    for folder, size in ICON_SIZES.items():
        output_dir = os.path.join(res_dir, folder)
        ensure_dir(output_dir)
        
        # Standard launcher icon
        resized = resize_image(img.copy(), size, 'contain')
        output_path = os.path.join(output_dir, 'ic_launcher.png')
        resized.save(output_path, 'PNG')
        print(f"  ✅ {folder}/ic_launcher.png ({size}x{size})")
        
        # Round launcher icon
        output_path = os.path.join(output_dir, 'ic_launcher_round.png')
        resized.save(output_path, 'PNG')
        print(f"  ✅ {folder}/ic_launcher_round.png ({size}x{size})")
    
    # Generate foreground for adaptive icons
    for folder, size in FOREGROUND_SIZES.items():
        output_dir = os.path.join(res_dir, folder)
        ensure_dir(output_dir)
        
        resized = resize_image(img.copy(), size, 'contain')
        output_path = os.path.join(output_dir, 'ic_launcher_foreground.png')
        resized.save(output_path, 'PNG')
        print(f"  ✅ {folder}/ic_launcher_foreground.png ({size}x{size})")
    
    print(f"\n✨ Generated {len(ICON_SIZES) * 3} icon files")


def generate_splash(source_path: str, res_dir: str, bg_color: str = '#006633'):
    """Generate all splash screen variants."""
    print(f"\n🎨 Generating splash screens from: {source_path}")
    
    img = Image.open(source_path).convert('RGBA')
    
    # Parse background color
    bg_color = bg_color.lstrip('#')
    bg_rgb = tuple(int(bg_color[i:i+2], 16) for i in (0, 2, 4))
    
    # Portrait splash screens
    for folder, size in SPLASH_PORTRAIT_SIZES.items():
        output_dir = os.path.join(res_dir, folder)
        ensure_dir(output_dir)
        
        # Create background with Kenya Green
        splash = Image.new('RGB', size, bg_rgb)
        
        # Center the logo (scaled to 40% of width)
        logo_size = int(size[0] * 0.4)
        logo = resize_image(img.copy(), logo_size, 'contain')
        offset = ((size[0] - logo.width) // 2, (size[1] - logo.height) // 2)
        splash.paste(logo, offset, logo)
        
        output_path = os.path.join(output_dir, 'splash.png')
        splash.save(output_path, 'PNG', quality=95)
        print(f"  ✅ {folder}/splash.png ({size[0]}x{size[1]})")
    
    # Landscape splash screens
    for folder, size in SPLASH_LANDSCAPE_SIZES.items():
        output_dir = os.path.join(res_dir, folder)
        ensure_dir(output_dir)
        
        splash = Image.new('RGB', size, bg_rgb)
        logo_size = int(size[1] * 0.4)
        logo = resize_image(img.copy(), logo_size, 'contain')
        offset = ((size[0] - logo.width) // 2, (size[1] - logo.height) // 2)
        splash.paste(logo, offset, logo)
        
        output_path = os.path.join(output_dir, 'splash.png')
        splash.save(output_path, 'PNG', quality=95)
        print(f"  ✅ {folder}/splash.png ({size[0]}x{size[1]})")
    
    total = len(SPLASH_PORTRAIT_SIZES) + len(SPLASH_LANDSCAPE_SIZES)
    print(f"\n✨ Generated {total} splash screen files")


def main():
    parser = argparse.ArgumentParser(
        description='Generate Android resource images for CEKA app',
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument('--icon', '-i', 
        help='Path to source icon image (min 512x512 recommended)')
    parser.add_argument('--splash', '-s', 
        help='Path to source splash/logo image')
    parser.add_argument('--bg', '-b', default='#006633',
        help='Splash background color (default: Kenya Green #006633)')
    parser.add_argument('--res-dir', '-r', default=RES_DIR,
        help='Output res directory (default: android/app/src/main/res)')
    
    args = parser.parse_args()
    
    if not args.icon and not args.splash:
        print("❌ Error: Please provide at least --icon or --splash")
        print("\nUsage examples:")
        print("  python generate_android_assets.py --icon logo.png")
        print("  python generate_android_assets.py --splash logo.png --bg #006633")
        print("  python generate_android_assets.py --icon logo.png --splash splash.png")
        sys.exit(1)
    
    print("=" * 50)
    print("🚀 CEKA Android Asset Generator")
    print("=" * 50)
    print(f"Output directory: {os.path.abspath(args.res_dir)}")
    
    if args.icon:
        if not os.path.exists(args.icon):
            print(f"❌ Icon file not found: {args.icon}")
            sys.exit(1)
        generate_icons(args.icon, args.res_dir)
    
    if args.splash:
        if not os.path.exists(args.splash):
            print(f"❌ Splash file not found: {args.splash}")
            sys.exit(1)
        generate_splash(args.splash, args.res_dir, args.bg)
    
    print("\n" + "=" * 50)
    print("✅ All assets generated successfully!")
    print("=" * 50)
    print("\nNext steps:")
    print("  1. Run: npx cap sync android")
    print("  2. Open in Android Studio: npx cap open android")
    print("  3. Build and run!")


if __name__ == '__main__':
    main()
