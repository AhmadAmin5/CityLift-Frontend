import os
from PIL import Image, ImageOps

# Paths
base_image_path = "/home/danish-hameed/.gemini/antigravity/brain/a7bac79a-6958-4b35-ac12-065a54d9c032/citylift_logo_base_1781128622792.png"
res_dir = "/home/danish-hameed/workspace/DanishHameed8767/CityLift-Frontend/android/app/src/main/res"

# Define the targets
# Legacy icons: (filename, size)
legacy_targets = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192
}

# Adaptive foreground icons: (filename, size)
adaptive_targets = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432
}

def extract_foreground(img):
    """
    Extract the central teal/green logo from the image by removing the dark background.
    We'll do this by targeting pixels that have a high green component and low red/blue,
    or simply checking the color distance from the background color.
    Since the logo is vibrant teal (#008c78 / rgb(0, 140, 120)) and green/mint,
    we can use a chroma keying or thresholding approach.
    """
    rgba_img = img.convert("RGBA")
    data = rgba_img.getdata()
    
    new_data = []
    for item in data:
        r, g, b, a = item
        # If the pixel is dark/indigo (background), make it transparent.
        # Background is roughly: r < 40, g < 40, b < 60
        # Logo is bright: g > 80 and g > r + 20
        # Let's use a soft threshold to preserve smooth edges.
        is_background = (r < 60 and g < 60 and b < 90) or (r < 75 and g < 75 and b < 110 and abs(r - g) < 20)
        
        # Additional check for the dark card background shadow/shading
        # Card background is dark blue gradient
        if is_background:
            new_data.append((0, 0, 0, 0))
        else:
            # Keep the pixel as is, but let's smooth transition by calculating alpha
            # if it's borderline dark
            brightness = (r + g + b) / 3.0
            if brightness < 60:
                # Fade out dark pixels near edges
                alpha = int(max(0, min(255, (brightness - 30) * 8.5)))
                new_data.append((r, g, b, alpha))
            else:
                new_data.append((r, g, b, a))
                
    rgba_img.putdata(new_data)
    
    # Now let's crop the transparent image to the bounding box of the logo to center it perfectly,
    # then pad it to a square with 108dp layout requirements.
    # The logo itself should occupy about 66% of the 108x108 viewport for adaptive icons.
    bbox = rgba_img.getbbox()
    if bbox:
        logo_cropped = rgba_img.crop(bbox)
        # Make it square
        w, h = logo_cropped.size
        max_dim = max(w, h)
        
        # Create a new square image that is 108x108 internally (or scale proportionately)
        # The logo should fit inside the safe zone (approx 60% of the viewport)
        new_size = int(max_dim * 1.5)
        square_img = Image.new("RGBA", (new_size, new_size), (0, 0, 0, 0))
        
        # Paste centered
        offset = ((new_size - w) // 2, (new_size - h) // 2)
        square_img.paste(logo_cropped, offset)
        return square_img
    
    return rgba_img

def process():
    print("Loading base image...")
    img = Image.open(base_image_path)
    
    # 1. Legacy Icons (Crop the central card part of the image, as it's already a rounded rectangle logo)
    # The card is centered. Let's crop it.
    # Bounding box of the card in a 1024x1024 image is roughly from (200, 200) to (824, 824)
    # Let's inspect the card bounding box or use a safe crop.
    # We can also just use the full image for legacy icons, as it already looks nice on a dark background.
    # Let's crop to the rounded card to make it look like a standard full-bleed app icon.
    # The card boundary starts around pixel 200.
    w, h = img.size
    crop_box = (int(w * 0.18), int(h * 0.18), int(w * 0.82), int(h * 0.82))
    cropped_card = img.crop(crop_box)
    
    print("Generating legacy and round icons...")
    for folder, size in legacy_targets.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # legacy square launcher
        icon = cropped_card.resize((size, size), Image.Resampling.LANCZOS)
        icon.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        
        # round launcher
        # We can make a circular mask for round launcher
        mask = Image.new("L", (size, size), 0)
        from PIL import ImageDraw
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, size, size), fill=255)
        
        round_icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        round_icon.paste(icon, (0, 0), mask=mask)
        round_icon.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
        print(f"Saved legacy icons to {folder} ({size}x{size})")
        
    # 2. Adaptive Foreground Icons
    print("Extracting foreground logo...")
    foreground_base = extract_foreground(img)
    
    print("Generating adaptive foreground icons...")
    for folder, size in adaptive_targets.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        fg_icon = foreground_base.resize((size, size), Image.Resampling.LANCZOS)
        fg_icon.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")
        print(f"Saved adaptive foreground to {folder} ({size}x{size})")

if __name__ == "__main__":
    process()
    print("Icon processing completed successfully!")
