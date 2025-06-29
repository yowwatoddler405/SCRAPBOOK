from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageFont
import io
import base64
import json
import random

def process_scrapbook_image(image_data, effects=None):
    """
    Memproses gambar untuk scrapbook dengan berbagai efek
    
    Args:
        image_data: Base64 encoded image data atau path file
        effects: Dictionary berisi efek yang ingin diterapkan
    
    Returns:
        Processed image as base64 string
    """
    if effects is None:
        effects = {}
    
    try:
        # Handle base64 atau file path
        if isinstance(image_data, str) and image_data.startswith('data:'):
            # Base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            image = Image.open(io.BytesIO(image_bytes))
        else:
            # File path
            image = Image.open(image_data)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        print(f"Processing image: {image.size}")
        
        # Apply vintage effect
        if effects.get('vintage', False):
            print("Applying vintage effect...")
            # Reduce saturation
            enhancer = ImageEnhance.Color(image)
            image = enhancer.enhance(0.7)
            
            # Add sepia tone
            pixels = image.load()
            for i in range(image.width):
                for j in range(image.height):
                    r, g, b = pixels[i, j]
                    # Sepia formula
                    tr = int(0.393 * r + 0.769 * g + 0.189 * b)
                    tg = int(0.349 * r + 0.686 * g + 0.168 * b)
                    tb = int(0.272 * r + 0.534 * g + 0.131 * b)
                    
                    pixels[i, j] = (min(255, tr), min(255, tg), min(255, tb))
        
        # Apply blur effect
        if effects.get('blur', 0) > 0:
            print(f"Applying blur: {effects['blur']}")
            image = image.filter(ImageFilter.GaussianBlur(radius=effects['blur']))
        
        # Adjust brightness
        if effects.get('brightness', 1.0) != 1.0:
            print(f"Adjusting brightness: {effects['brightness']}")
            enhancer = ImageEnhance.Brightness(image)
            image = enhancer.enhance(effects['brightness'])
        
        # Adjust contrast
        if effects.get('contrast', 1.0) != 1.0:
            print(f"Adjusting contrast: {effects['contrast']}")
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(effects['contrast'])
        
        # Add polaroid frame
        if effects.get('polaroid_frame', False):
            print("Adding polaroid frame...")
            frame_width = 40
            frame_height_top = 40
            frame_height_bottom = 80
            
            new_width = image.width + 2 * frame_width
            new_height = image.height + frame_height_top + frame_height_bottom
            
            framed = Image.new('RGB', (new_width, new_height), 'white')
            framed.paste(image, (frame_width, frame_height_top))
            image = framed
        
        # Convert back to base64
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=90)
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        print("Image processing completed!")
        return f"data:image/jpeg;base64,{img_str}"
        
    except Exception as e:
        print(f"Error processing image: {e}")
        return None

def create_photo_collage(image_paths, layout='grid', output_size=(800, 600)):
    """
    Membuat kolase foto untuk scrapbook
    
    Args:
        image_paths: List of image file paths
        layout: Layout type ('grid', 'horizontal', 'vertical', 'random')
        output_size: Tuple (width, height) for output size
    
    Returns:
        Collage image as base64 string
    """
    try:
        if not image_paths:
            print("No images provided")
            return None
        
        print(f"Creating collage with {len(image_paths)} images")
        
        # Load images
        images = []
        for path in image_paths:
            try:
                img = Image.open(path)
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                images.append(img)
            except Exception as e:
                print(f"Error loading image {path}: {e}")
                continue
        
        if not images:
            print("No valid images found")
            return None
        
        # Create collage based on layout
        collage = Image.new('RGB', output_size, 'white')
        
        if layout == 'grid':
            # Calculate grid dimensions
            num_images = len(images)
            cols = int(num_images ** 0.5) or 1
            rows = (num_images + cols - 1) // cols
            
            cell_width = output_size[0] // cols
            cell_height = output_size[1] // rows
            
            for i, img in enumerate(images):
                row = i // cols
                col = i % cols
                
                # Resize image to fit cell
                img_resized = img.resize((cell_width - 10, cell_height - 10), Image.Resampling.LANCZOS)
                
                x = col * cell_width + 5
                y = row * cell_height + 5
                
                collage.paste(img_resized, (x, y))
        
        elif layout == 'random':
            # Random placement with rotation
            for i, img in enumerate(images):
                # Random size (between 100-300 pixels)
                size = random.randint(100, 300)
                aspect_ratio = img.width / img.height
                
                if aspect_ratio > 1:
                    new_width = size
                    new_height = int(size / aspect_ratio)
                else:
                    new_height = size
                    new_width = int(size * aspect_ratio)
                
                img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Random position
                max_x = output_size[0] - new_width
                max_y = output_size[1] - new_height
                
                if max_x > 0 and max_y > 0:
                    x = random.randint(0, max_x)
                    y = random.randint(0, max_y)
                    
                    # Create rotated image
                    angle = random.randint(-15, 15)
                    rotated = img_resized.rotate(angle, expand=True, fillcolor='white')
                    
                    # Paste with some overlap handling
                    try:
                        collage.paste(rotated, (x, y))
                    except:
                        collage.paste(img_resized, (x, y))
        
        # Convert to base64
        buffer = io.BytesIO()
        collage.save(buffer, format='JPEG', quality=90)
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        print("Collage created successfully!")
        return f"data:image/jpeg;base64,{img_str}"
        
    except Exception as e:
        print(f"Error creating collage: {e}")
        return None

# Example usage dan testing
if __name__ == "__main__":
    print("🎨 Scrapbook Image Processor - Vanilla JS Version")
    print("=" * 50)
    
    # Test effects
    effects = {
        'vintage': True,
        'brightness': 1.1,
        'contrast': 1.2,
        'polaroid_frame': True
    }
    
    print("Available effects:")
    for effect, value in effects.items():
        print(f"  - {effect}: {value}")
    
    print("\nAvailable functions:")
    print("  - process_scrapbook_image(image_data, effects)")
    print("  - create_photo_collage(image_paths, layout)")
    
    print("\nCollage layouts: grid, horizontal, vertical, random")
    
    print("\n✅ Image processor ready for vanilla JS scrapbook!")
