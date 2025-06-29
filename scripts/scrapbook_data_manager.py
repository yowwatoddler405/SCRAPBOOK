import json
import os
from datetime import datetime

class ScrapbookDataManager:
    """
    Mengelola data scrapbook untuk aplikasi vanilla JavaScript
    """
    
    def __init__(self, data_dir="scrapbook_data"):
        self.data_dir = data_dir
        self.ensure_data_directory()
    
    def ensure_data_directory(self):
        """Memastikan direktori data ada"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
            print(f"Created data directory: {self.data_dir}")
    
    def save_scrapbook(self, scrapbook_data, filename=None):
        """
        Menyimpan data scrapbook ke file JSON
        
        Args:
            scrapbook_data: Dictionary berisi data scrapbook
            filename: Nama file (optional)
        
        Returns:
            Path file yang disimpan
        """
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"scrapbook_{timestamp}.json"
        
        filepath = os.path.join(self.data_dir, filename)
        
        # Add metadata
        scrapbook_data['metadata'] = {
            'saved_at': datetime.now().isoformat(),
            'version': '1.0',
            'app_type': 'vanilla_js_scrapbook'
        }
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(scrapbook_data, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Scrapbook saved to: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"❌ Error saving scrapbook: {e}")
            return None
    
    def load_scrapbook(self, filename):
        """
        Memuat data scrapbook dari file JSON
        
        Args:
            filename: Nama file atau path lengkap
        
        Returns:
            Dictionary berisi data scrapbook
        """
        if not os.path.dirname(filename):
            filepath = os.path.join(self.data_dir, filename)
        else:
            filepath = filename
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"✅ Scrapbook loaded from: {filepath}")
            return data
            
        except Exception as e:
            print(f"❌ Error loading scrapbook: {e}")
            return None
    
    def list_scrapbooks(self):
        """
        Menampilkan daftar file scrapbook yang tersimpan
        
        Returns:
            List of scrapbook files
        """
        try:
            files = [f for f in os.listdir(self.data_dir) if f.endswith('.json')]
            files.sort(reverse=True)  # Newest first
            
            print(f"📚 Found {len(files)} scrapbook files:")
            for i, file in enumerate(files, 1):
                filepath = os.path.join(self.data_dir, file)
                size = os.path.getsize(filepath)
                modified = datetime.fromtimestamp(os.path.getmtime(filepath))
                print(f"  {i}. {file} ({size} bytes, modified: {modified.strftime('%Y-%m-%d %H:%M')})")
            
            return files
            
        except Exception as e:
            print(f"❌ Error listing scrapbooks: {e}")
            return []
    
    def export_to_html(self, scrapbook_data, output_file="scrapbook_export.html"):
        """
        Mengekspor scrapbook ke file HTML standalone
        
        Args:
            scrapbook_data: Data scrapbook
            output_file: Nama file output HTML
        
        Returns:
            Path file HTML yang dibuat
        """
        html_template = """
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📖 {title}</title>
    <style>
        body {{
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 50%, #fecaca 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }}
        .container {{
            max-width: 800px;
            margin: 0 auto;
        }}
        .header {{
            text-align: center;
            margin-bottom: 2rem;
        }}
        .title {{
            font-size: 2.5rem;
            color: #92400e;
            margin-bottom: 0.5rem;
        }}
        .page {{
            background: white;
            border-radius: 0.75rem;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            position: relative;
            min-height: 400px;
        }}
        .page-number {{
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            color: #6b7280;
            font-size: 0.9rem;
        }}
        .photo {{
            position: absolute;
            border: 4px solid white;
            border-radius: 0.25rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }}
        .photo img {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 0.125rem;
        }}
        .text {{
            position: absolute;
            font-family: 'Dancing Script', cursive;
            font-weight: 600;
        }}
        .sticker {{
            position: absolute;
            font-size: 2rem;
        }}
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap');
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">📖 {title}</h1>
            <p>Dibuat pada: {created_date}</p>
        </div>
        {pages_html}
    </div>
</body>
</html>
        """
        
        try:
            title = scrapbook_data.get('title', 'My Digital Scrapbook')
            created_date = datetime.now().strftime('%d %B %Y')
            
            pages_html = ""
            for i, page in enumerate(scrapbook_data.get('pages', []), 1):
                page_html = f'<div class="page">\n'
                page_html += f'  <div class="page-number">Halaman {i}</div>\n'
                
                # Add photos
                for photo in page.get('photos', []):
                    style = f"left: {photo['x']}px; top: {photo['y']}px; width: {photo['width']}px; height: {photo['height']}px; transform: rotate({photo['rotation']}deg);"
                    page_html += f'  <div class="photo" style="{style}"><img src="{photo['src']}" alt="Photo"></div>\n'
                
                # Add texts
                for text in page.get('texts', []):
                    style = f"left: {text['x']}px; top: {text['y']}px; font-size: {text['fontSize']}px; color: {text['color']}; font-family: {text['fontFamily']};"
                    page_html += f'  <div class="text" style="{style}">{text['content']}</div>\n'
                
                # Add stickers
                for sticker in page.get('stickers', []):
                    style = f"left: {sticker['x']}px; top: {sticker['y']}px; font-size: {sticker['size']}px;"
                    page_html += f'  <div class="sticker" style="{style}">{sticker['emoji']}</div>\n'
                
                page_html += '</div>\n'
                pages_html += page_html
            
            html_content = html_template.format(
                title=title,
                created_date=created_date,
                pages_html=pages_html
            )
            
            output_path = os.path.join(self.data_dir, output_file)
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            print(f"✅ HTML export created: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"❌ Error exporting to HTML: {e}")
            return None

# Example usage
if __name__ == "__main__":
    print("📚 Scrapbook Data Manager - Vanilla JS Version")
    print("=" * 50)
    
    # Initialize data manager
    manager = ScrapbookDataManager()
    
    # Example scrapbook data
    sample_data = {
        "title": "My Digital Scrapbook",
        "created": datetime.now().isoformat(),
        "pages": [
            {
                "id": 1,
                "photos": [
                    {
                        "id": "photo1",
                        "src": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjMwMCB4IDIwMDwvdGV4dD48L3N2Zz4=",
                        "x": 50,
                        "y": 80,
                        "width": 300,
                        "height": 200,
                        "rotation": -2
                    }
                ],
                "texts": [
                    {
                        "id": "text1",
                        "content": "Kenangan Indah",
                        "x": 100,
                        "y": 320,
                        "fontSize": 24,
                        "color": "#8B4513",
                        "fontFamily": "Dancing Script"
                    }
                ],
                "stickers": [
                    {
                        "id": "sticker1",
                        "emoji": "❤️",
                        "x": 380,
                        "y": 100,
                        "size": 30
                    }
                ],
                "theme": "vintage"
            }
        ]
    }
    
    # Save sample data
    saved_file = manager.save_scrapbook(sample_data, "sample_scrapbook.json")
    
    # List all scrapbooks
    manager.list_scrapbooks()
    
    # Export to HTML
    if saved_file:
        loaded_data = manager.load_scrapbook("sample_scrapbook.json")
        if loaded_data:
            manager.export_to_html(loaded_data, "sample_scrapbook.html")
    
    print("\n✅ Data manager ready!")
    print("Available methods:")
    print("  - save_scrapbook(data, filename)")
    print("  - load_scrapbook(filename)")
    print("  - list_scrapbooks()")
    print("  - export_to_html(data, output_file)")
