import json
import base64
from PIL import Image, ImageDraw, ImageFont
import io
import random
from datetime import datetime

def generate_scrapbook_template(theme='vintage', pages=5):
    """
    Menghasilkan template scrapbook dengan tema tertentu
    
    Args:
        theme: Tema scrapbook ('vintage', 'modern', 'cute', 'nature', 'travel', 'birthday')
        pages: Jumlah halaman yang akan dibuat
    
    Returns:
        Dictionary berisi template scrapbook
    """
    
    themes = {
        'vintage': {
            'name': 'Vintage Classic',
            'colors': ['bg-amber-50', 'bg-orange-50', 'bg-yellow-50', 'bg-red-50'],
            'text_colors': ['#8B4513', '#A0522D', '#CD853F', '#D2691E'],
            'fonts': ['serif', 'cursive'],
            'decorations': ['🌸', '🍂', '📜', '🕯️', '🗝️', '📸', '🎭', '🌹'],
            'sticker_sets': [
                ['🌸', '🍂', '📜'],
                ['🕯️', '🗝️', '📸'],
                ['🎭', '🌹', '💌']
            ],
            'text_suggestions': [
                'Kenangan Indah',
                'Masa Lalu yang Berharga',
                'Cerita Klasik',
                'Nostalgia'
            ]
        },
        'modern': {
            'name': 'Modern Minimalist',
            'colors': ['bg-white', 'bg-gray-50', 'bg-slate-50', 'bg-zinc-50'],
            'text_colors': ['#374151', '#4B5563', '#6B7280', '#1F2937'],
            'fonts': ['sans-serif', 'monospace'],
            'decorations': ['⭐', '💫', '🔸', '🔹', '◆', '▲', '●', '■'],
            'sticker_sets': [
                ['⭐', '💫', '🔸'],
                ['🔹', '◆', '▲'],
                ['●', '■', '◇']
            ],
            'text_suggestions': [
                'Clean & Simple',
                'Modern Life',
                'Minimalist',
                'Contemporary'
            ]
        },
        'cute': {
            'name': 'Cute & Sweet',
            'colors': ['bg-pink-50', 'bg-rose-50', 'bg-purple-50', 'bg-indigo-50'],
            'text_colors': ['#EC4899', '#F472B6', '#A855F7', '#8B5CF6'],
            'fonts': ['cursive', 'fantasy'],
            'decorations': ['🌸', '🦋', '💕', '🌈', '🎀', '🧸', '🍭', '⭐'],
            'sticker_sets': [
                ['🌸', '🦋', '💕'],
                ['🌈', '🎀', '🧸'],
                ['🍭', '⭐', '💖']
            ],
            'text_suggestions': [
                'Sweet Memories',
                'Kawaii Moments',
                'Cute Adventures',
                'Lovely Times'
            ]
        },
        'nature': {
            'name': 'Nature Fresh',
            'colors': ['bg-green-50', 'bg-emerald-50', 'bg-teal-50', 'bg-lime-50'],
            'text_colors': ['#059669', '#10B981', '#14B8A6', '#65A30D'],
            'fonts': ['serif', 'cursive'],
            'decorations': ['🌿', '🌱', '🍃', '🌳', '🌻', '🦋', '🌺', '🍀'],
            'sticker_sets': [
                ['🌿', '🌱', '🍃'],
                ['🌳', '🌻', '🦋'],
                ['🌺', '🍀', '🌸']
            ],
            'text_suggestions': [
                'Natural Beauty',
                'Green Adventures',
                'Nature Walks',
                'Outdoor Memories'
            ]
        },
        'travel': {
            'name': 'Travel Adventure',
            'colors': ['bg-blue-50', 'bg-sky-50', 'bg-cyan-50', 'bg-indigo-50'],
            'text_colors': ['#2563EB', '#0EA5E9', '#06B6D4', '#4F46E5'],
            'fonts': ['sans-serif', 'serif'],
            'decorations': ['✈️', '🗺️', '🧳', '📍', '🏔️', '🏖️', '🚗', '📷'],
            'sticker_sets': [
                ['✈️', '🗺️', '🧳'],
                ['📍', '🏔️', '🏖️'],
                ['🚗', '📷', '🌍']
            ],
            'text_suggestions': [
                'Adventure Awaits',
                'Travel Memories',
                'Journey Stories',
                'Wanderlust'
            ]
        },
        'birthday': {
            'name': 'Birthday Party',
            'colors': ['bg-yellow-50', 'bg-orange-50', 'bg-red-50', 'bg-pink-50'],
            'text_colors': ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'],
            'fonts': ['cursive', 'fantasy'],
            'decorations': ['🎉', '🎂', '🎈', '🎁', '🎊', '🥳', '🎵', '🌟'],
            'sticker_sets': [
                ['🎉', '🎂', '🎈'],
                ['🎁', '🎊', '🥳'],
                ['🎵', '🌟', '💫']
            ],
            'text_suggestions': [
                'Happy Birthday!',
                'Celebration Time',
                'Party Memories',
                'Special Day'
            ]
        }
    }
    
    selected_theme = themes.get(theme, themes['vintage'])
    
    print(f"Generating {selected_theme['name']} template with {pages} pages...")
    
    template = {
        'theme': theme,
        'theme_name': selected_theme['name'],
        'created_at': datetime.now().isoformat(),
        'pages': []
    }
    
    for page_num in range(pages):
        # Random elements for each page
        page_color = random.choice(selected_theme['colors'])
        text_color = random.choice(selected_theme['text_colors'])
        font_family = random.choice(selected_theme['fonts'])
        sticker_set = random.choice(selected_theme['sticker_sets'])
        text_suggestion = random.choice(selected_theme['text_suggestions'])
        
        page = {
            'id': page_num + 1,
            'background': page_color,
            'suggested_layouts': generate_layout_suggestions(),
            'decorations': sticker_set,
            'text_suggestions': {
                'content': f"{text_suggestion} - Halaman {page_num + 1}",
                'color': text_color,
                'font_family': font_family
            },
            'theme_elements': {
                'primary_color': text_color,
                'font_family': font_family,
                'decoration_style': theme
            }
        }
        template['pages'].append(page)
    
    print(f"✅ Template generated successfully!")
    return template

def generate_layout_suggestions():
    """
    Menghasilkan saran layout untuk halaman scrapbook
    """
    layouts = [
        {
            'name': 'Single Focus',
            'description': 'Satu foto besar di tengah dengan teks di bawah',
            'photo_positions': [
                {
                    'x': 150, 
                    'y': 80, 
                    'width': 300, 
                    'height': 200,
                    'rotation': random.randint(-5, 5)
                }
            ],
            'text_positions': [{'x': 200, 'y': 320}],
            'sticker_positions': [
                {'x': 400, 'y': 100},
                {'x': 100, 'y': 250}
            ]
        },
        {
            'name': 'Dual Photos',
            'description': 'Dua foto bersebelahan',
            'photo_positions': [
                {
                    'x': 50, 
                    'y': 100, 
                    'width': 200, 
                    'height': 150,
                    'rotation': random.randint(-3, 3)
                },
                {
                    'x': 350, 
                    'y': 100, 
                    'width': 200, 
                    'height': 150,
                    'rotation': random.randint(-3, 3)
                }
            ],
            'text_positions': [{'x': 250, 'y': 280}],
            'sticker_positions': [
                {'x': 300, 'y': 80},
                {'x': 480, 'y': 200}
            ]
        },
        {
            'name': 'Collage Style',
            'description': 'Beberapa foto dengan ukuran berbeda',
            'photo_positions': [
                {
                    'x': 50, 
                    'y': 50, 
                    'width': 180, 
                    'height': 120,
                    'rotation': random.randint(-8, 8)
                },
                {
                    'x': 280, 
                    'y': 80, 
                    'width': 150, 
                    'height': 100,
                    'rotation': random.randint(-8, 8)
                },
                {
                    'x': 480, 
                    'y': 60, 
                    'width': 100, 
                    'height': 80,
                    'rotation': random.randint(-8, 8)
                },
                {
                    'x': 150, 
                    'y': 200, 
                    'width': 200, 
                    'height': 130,
                    'rotation': random.randint(-8, 8)
                }
            ],
            'text_positions': [{'x': 400, 'y': 250}],
            'sticker_positions': [
                {'x': 250, 'y': 40},
                {'x': 450, 'y': 150},
                {'x': 100, 'y': 300}
            ]
        },
        {
            'name': 'Story Layout',
            'description': 'Layout bercerita dengan foto dan teks bergantian',
            'photo_positions': [
                {
                    'x': 80, 
                    'y': 60, 
                    'width': 150, 
                    'height': 100,
                    'rotation': random.randint(-5, 5)
                }
            ],
            'text_positions': [
                {'x': 280, 'y': 80},
                {'x': 100, 'y': 200},
                {'x': 350, 'y': 250}
            ],
            'sticker_positions': [
                {'x': 450, 'y': 100},
                {'x': 50, 'y': 180}
            ]
        },
        {
            'name': 'Corner Focus',
            'description': 'Foto di sudut dengan dekorasi mengelilingi',
            'photo_positions': [
                {
                    'x': 400, 
                    'y': 50, 
                    'width': 180, 
                    'height': 120,
                    'rotation': random.randint(-10, 10)
                }
            ],
            'text_positions': [
                {'x': 50, 'y': 100},
                {'x': 100, 'y': 250}
            ],
            'sticker_positions': [
                {'x': 200, 'y': 80},
                {'x': 350, 'y': 200},
                {'x': 500, 'y': 250}
            ]
        }
    ]
    
    return random.choice(layouts)

def create_page_background(width=600, height=400, color='#F5E6D3', pattern='dots'):
    """
    Membuat background untuk halaman scrapbook
    
    Args:
        width: Lebar halaman
        height: Tinggi halaman
        color: Warna background
        pattern: Pola background ('dots', 'lines', 'grid', 'plain')
    
    Returns:
        Base64 encoded background image
    """
    
    # Convert hex color to RGB
    color_rgb = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))
    
    # Create image
    img = Image.new('RGB', (width, height), color_rgb)
    draw = ImageDraw.Draw(img)
    
    if pattern == 'dots':
        # Add dot pattern
        for x in range(0, width, 30):
            for y in range(0, height, 30):
                if (x + y) % 60 == 0:
                    draw.ellipse([x-2, y-2, x+2, y+2], fill=(200, 200, 200, 50))
    
    elif pattern == 'lines':
        # Add line pattern
        for y in range(0, height, 25):
            draw.line([(0, y), (width, y)], fill=(200, 200, 200, 30), width=1)
    
    elif pattern == 'grid':
        # Add grid pattern
        for x in range(0, width, 20):
            draw.line([(x, 0), (x, height)], fill=(200, 200, 200, 20), width=1)
        for y in range(0, height, 20):
            draw.line([(0, y), (width, y)], fill=(200, 200, 200, 20), width=1)
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_str}"

def add_decorative_border(image_data, border_style='ornate'):
    """
    Menambahkan border dekoratif ke gambar
    
    Args:
        image_data: Base64 encoded image
        border_style: Style border ('ornate', 'simple', 'floral')
    
    Returns:
        Image with border as base64 string
    """
    
    # Decode image
    image_bytes = base64.b64decode(image_data.split(',')[1])
    image = Image.open(io.BytesIO(image_bytes))
    
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Create new image with border space
    border_size = 20
    new_width = image.width + 2 * border_size
    new_height = image.height + 2 * border_size
    
    bordered_image = Image.new('RGB', (new_width, new_height), 'white')
    bordered_image.paste(image, (border_size, border_size))
    
    draw = ImageDraw.Draw(bordered_image)
    
    if border_style == 'ornate':
        # Draw ornate border
        for i in range(0, new_width, 10):
            draw.rectangle([i, 0, i+5, 5], fill='gold')
            draw.rectangle([i, new_height-5, i+5, new_height], fill='gold')
        
        for i in range(0, new_height, 10):
            draw.rectangle([0, i, 5, i+5], fill='gold')
            draw.rectangle([new_width-5, i, new_width, i+5], fill='gold')
    
    elif border_style == 'simple':
        # Draw simple border
        draw.rectangle([0, 0, new_width, 5], fill='black')
        draw.rectangle([0, new_height-5, new_width, new_height], fill='black')
        draw.rectangle([0, 0, 5, new_height], fill='black')
        draw.rectangle([new_width-5, 0, new_width, new_height], fill='black')
    
    # Convert back to base64
    buffer = io.BytesIO()
    bordered_image.save(buffer, format='JPEG', quality=90)
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/jpeg;base64,{img_str}"

def create_themed_page(theme='vintage', page_number=1):
    """
    Membuat halaman scrapbook dengan tema tertentu
    
    Args:
        theme: Tema halaman
        page_number: Nomor halaman
    
    Returns:
        Dictionary berisi data halaman
    """
    template = generate_scrapbook_template(theme, 1)
    page_data = template['pages'][0]
    page_data['id'] = page_number
    
    # Apply layout suggestions
    layout = page_data['suggested_layouts']
    
    # Create sample content based on layout
    page_data['photos'] = []
    page_data['texts'] = []
    page_data['stickers'] = []
    
    # Add suggested text
    if 'text_suggestions' in page_data:
        text_data = page_data['text_suggestions']
        for i, pos in enumerate(layout['text_positions']):
            page_data['texts'].append({
                'id': f"text_{i+1}",
                'content': text_data['content'],
                'x': pos['x'],
                'y': pos['y'],
                'fontSize': 20,
                'color': text_data['color'],
                'fontFamily': text_data['font_family']
            })
    
    # Add suggested stickers
    for i, pos in enumerate(layout.get('sticker_positions', [])):
        if i < len(page_data['decorations']):
            page_data['stickers'].append({
                'id': f"sticker_{i+1}",
                'emoji': page_data['decorations'][i],
                'x': pos['x'],
                'y': pos['y'],
                'size': random.randint(25, 35)
            })
    
    print(f"✅ Themed page created for {theme} theme")
    return page_data

def generate_memory_prompts(theme='general'):
    """
    Menghasilkan prompt untuk membantu pengguna mengisi scrapbook
    
    Args:
        theme: Tema untuk prompt
    
    Returns:
        List of memory prompts
    """
    prompts = {
        'general': [
            "Ceritakan tentang hari yang paling berkesan minggu ini",
            "Apa yang membuat Anda tersenyum hari ini?",
            "Siapa orang yang paling berarti dalam hidup Anda?",
            "Tempat favorit yang ingin Anda kunjungi lagi",
            "Makanan yang mengingatkan Anda pada masa kecil"
        ],
        'travel': [
            "Destinasi impian yang ingin Anda kunjungi",
            "Pengalaman perjalanan paling berkesan",
            "Makanan lokal terenak yang pernah dicoba",
            "Pemandangan terindah yang pernah dilihat",
            "Orang menarik yang ditemui saat traveling"
        ],
        'family': [
            "Tradisi keluarga yang paling Anda sukai",
            "Cerita lucu tentang anggota keluarga",
            "Momen kebersamaan yang tak terlupakan",
            "Pelajaran hidup dari orang tua",
            "Kenangan masa kecil bersama saudara"
        ],
        'friendship': [
            "Sahabat pertama yang masih diingat",
            "Petualangan seru bersama teman",
            "Momen tertawa paling keras bersama",
            "Teman yang selalu ada saat dibutuhkan",
            "Kenangan sekolah yang tak terlupakan"
        ]
    }
    
    return prompts.get(theme, prompts['general'])

def export_scrapbook_data(pages_data, filename='scrapbook_export.json'):
    """
    Mengekspor data scrapbook ke file JSON
    
    Args:
        pages_data: List of page data
        filename: Nama file output
    
    Returns:
        Success status
    """
    try:
        export_data = {
            'scrapbook_title': 'My Digital Scrapbook',
            'created_at': datetime.now().isoformat(),
            'total_pages': len(pages_data),
            'pages': pages_data,
            'metadata': {
                'version': '1.0',
                'format': 'digital_scrapbook',
                'exported_by': 'Scrapbook Generator'
            }
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Scrapbook exported to {filename}")
        return True
        
    except Exception as e:
        print(f"❌ Error exporting scrapbook: {e}")
        return False

# Example usage dan testing
if __name__ == "__main__":
    print("📚 Scrapbook Template Generator")
    print("=" * 50)
    
    # Generate different themed templates
    themes = ['vintage', 'modern', 'cute', 'nature', 'travel', 'birthday']
    
    print("Available themes:")
    for i, theme in enumerate(themes, 1):
        print(f"  {i}. {theme.title()}")
    
    print("\n🎨 Generating sample templates...")
    
    # Generate a vintage scrapbook
    vintage_template = generate_scrapbook_template('vintage', 3)
    print(f"\nVintage template created with {len(vintage_template['pages'])} pages")
    
    # Generate memory prompts
    travel_prompts = generate_memory_prompts('travel')
    print(f"\nTravel memory prompts:")
    for i, prompt in enumerate(travel_prompts[:3], 1):
        print(f"  {i}. {prompt}")
    
    # Create a themed page
    sample_page = create_themed_page('cute', 1)
    print(f"\nSample cute page created with:")
    print(f"  - {len(sample_page.get('texts', []))} text elements")
    print(f"  - {len(sample_page.get('stickers', []))} stickers")
    print(f"  - Background: {sample_page.get('background', 'default')}")
    
    # Export sample data
    sample_pages = [sample_page]
    export_success = export_scrapbook_data(sample_pages, 'sample_scrapbook.json')
    
    print(f"\n✅ Scrapbook generator ready!")
    print("Available functions:")
    print("  - generate_scrapbook_template(theme, pages)")
    print("  - create_themed_page(theme, page_number)")
    print("  - generate_memory_prompts(theme)")
    print("  - export_scrapbook_data(pages_data, filename)")
