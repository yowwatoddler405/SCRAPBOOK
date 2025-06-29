from reportlab.lib.pagesizes import letter, A4, A3
from reportlab.platypus import SimpleDocTemplate, Image, Spacer, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import json
import base64
import io
from PIL import Image as PILImage
import os
from datetime import datetime

class ScrapbookPDFGenerator:
    """
    Generator PDF untuk scrapbook dengan ReportLab
    """
    
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom styles untuk PDF"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='ScrapbookTitle',
            parent=self.styles['Title'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#92400e')
        ))
        
        # Page title style
        self.styles.add(ParagraphStyle(
            name='PageTitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#374151')
        ))
        
        # Text content style
        self.styles.add(ParagraphStyle(
            name='ScrapbookText',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=10,
            alignment=TA_LEFT
        ))
    
    def base64_to_image(self, base64_string, max_width=400, max_height=300):
        """
        Convert base64 string to PIL Image
        
        Args:
            base64_string: Base64 encoded image
            max_width: Maximum width for resizing
            max_height: Maximum height for resizing
        
        Returns:
            PIL Image object
        """
        try:
            # Remove data URL prefix if present
            if base64_string.startswith('data:'):
                base64_string = base64_string.split(',')[1]
            
            # Decode base64
            image_data = base64.b64decode(base64_string)
            image = PILImage.open(io.BytesIO(image_data))
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize if too large
            image.thumbnail((max_width, max_height), PILImage.Resampling.LANCZOS)
            
            return image
            
        except Exception as e:
            print(f"Error converting base64 to image: {e}")
            return None
    
    def create_pdf_from_scrapbook(self, scrapbook_data, output_filename="scrapbook.pdf", 
                                 page_size=letter, include_toc=True):
        """
        Membuat PDF dari data scrapbook
        
        Args:
            scrapbook_data: Dictionary berisi data scrapbook
            output_filename: Nama file PDF output
            page_size: Ukuran halaman (letter, A4, A3)
            include_toc: Include table of contents
        
        Returns:
            Path file PDF yang dibuat
        """
        try:
            # Create PDF document
            doc = SimpleDocTemplate(
                output_filename,
                pagesize=page_size,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Story (content) list
            story = []
            
            # Add title
            title = scrapbook_data.get('title', 'My Digital Scrapbook')
            story.append(Paragraph(title, self.styles['ScrapbookTitle']))
            story.append(Spacer(1, 20))
            
            # Add creation date
            created_date = datetime.now().strftime('%d %B %Y')
            story.append(Paragraph(f"Dibuat pada: {created_date}", self.styles['Normal']))
            story.append(Spacer(1, 30))
            
            # Process each page
            pages = scrapbook_data.get('pages', [])
            
            for i, page in enumerate(pages, 1):
                # Page title
                story.append(Paragraph(f"Halaman {i}", self.styles['PageTitle']))
                story.append(Spacer(1, 20))
                
                # Process photos
                photos = page.get('photos', [])
                for photo in photos:
                    if photo.get('src'):
                        pil_image = self.base64_to_image(photo['src'])
                        if pil_image:
                            # Save temporary image
                            temp_filename = f"temp_photo_{i}_{photo['id']}.jpg"
                            pil_image.save(temp_filename, 'JPEG', quality=85)
                            
                            # Add to PDF
                            img = Image(temp_filename)
                            img.drawHeight = 3 * inch
                            img.drawWidth = 4 * inch
                            story.append(img)
                            story.append(Spacer(1, 10))
                            
                            # Clean up temp file
                            try:
                                os.remove(temp_filename)
                            except:
                                pass
                
                # Process texts
                texts = page.get('texts', [])
                for text in texts:
                    content = text.get('content', '')
                    if content:
                        story.append(Paragraph(content, self.styles['ScrapbookText']))
                        story.append(Spacer(1, 10))
                
                # Process stickers (as text)
                stickers = page.get('stickers', [])
                if stickers:
                    sticker_text = ' '.join([sticker.get('emoji', '') for sticker in stickers])
                    story.append(Paragraph(f"Stickers: {sticker_text}", self.styles['Normal']))
                    story.append(Spacer(1, 10))
                
                # Add page break except for last page
                if i < len(pages):
                    story.append(Spacer(1, 50))
            
            # Build PDF
            doc.build(story)
            
            print(f"✅ PDF created successfully: {output_filename}")
            return output_filename
            
        except Exception as e:
            print(f"❌ Error creating PDF: {e}")
            return None
    
    def create_advanced_pdf(self, scrapbook_data, output_filename="advanced_scrapbook.pdf"):
        """
        Membuat PDF dengan layout yang lebih advanced
        
        Args:
            scrapbook_data: Dictionary berisi data scrapbook
            output_filename: Nama file PDF output
        
        Returns:
            Path file PDF yang dibuat
        """
        try:
            from reportlab.platypus import PageTemplate, Frame
            from reportlab.lib.units import cm
            
            # Custom page template
            def create_page_template():
                frame = Frame(
                    2*cm, 2*cm, 17*cm, 25*cm,
                    leftPadding=1*cm, rightPadding=1*cm,
                    topPadding=1*cm, bottomPadding=1*cm
                )
                return PageTemplate(id='normal', frames=frame)
            
            doc = SimpleDocTemplate(
                output_filename,
                pagesize=A4,
                pageTemplates=[create_page_template()]
            )
            
            story = []
            
            # Enhanced title page
            title = scrapbook_data.get('title', 'My Digital Scrapbook')
            story.append(Paragraph(title, self.styles['ScrapbookTitle']))
            story.append(Spacer(1, 2*cm))
            
            # Add decorative line
            from reportlab.platypus import HRFlowable
            story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#92400e')))
            story.append(Spacer(1, 1*cm))
            
            # Metadata
            metadata = [
                f"Total Halaman: {len(scrapbook_data.get('pages', []))}",
                f"Dibuat: {datetime.now().strftime('%d %B %Y')}",
                f"Tema: Mixed Themes"
            ]
            
            for meta in metadata:
                story.append(Paragraph(meta, self.styles['Normal']))
                story.append(Spacer(1, 0.5*cm))
            
            story.append(Spacer(1, 2*cm))
            
            # Process pages with enhanced layout
            pages = scrapbook_data.get('pages', [])
            
            for i, page in enumerate(pages, 1):
                # New page for each scrapbook page
                if i > 1:
                    from reportlab.platypus import PageBreak
                    story.append(PageBreak())
                
                # Page header with theme info
                theme = page.get('theme', 'default').title()
                header_text = f"Halaman {i} - Tema {theme}"
                story.append(Paragraph(header_text, self.styles['PageTitle']))
                story.append(Spacer(1, 1*cm))
                
                # Create a table-like layout for photos and text
                from reportlab.platypus import Table, TableStyle
                
                page_content = []
                
                # Photos section
                photos = page.get('photos', [])
                if photos:
                    photo_row = []
                    for j, photo in enumerate(photos[:2]):  # Max 2 photos per row
                        if photo.get('src'):
                            pil_image = self.base64_to_image(photo['src'], 200, 150)
                            if pil_image:
                                temp_filename = f"temp_adv_{i}_{j}.jpg"
                                pil_image.save(temp_filename, 'JPEG', quality=90)
                                
                                img = Image(temp_filename, width=6*cm, height=4*cm)
                                photo_row.append(img)
                                
                                # Clean up
                                try:
                                    os.remove(temp_filename)
                                except:
                                    pass
                    
                    if photo_row:
                        # Pad row if needed
                        while len(photo_row) < 2:
                            photo_row.append("")
                        
                        page_content.append(photo_row)
                
                # Text section
                texts = page.get('texts', [])
                text_content = []
                for text in texts:
                    content = text.get('content', '')
                    if content:
                        text_content.append(content)
                
                if text_content:
                    text_para = Paragraph(' • '.join(text_content), self.styles['ScrapbookText'])
                    page_content.append([text_para, ""])
                
                # Stickers section
                stickers = page.get('stickers', [])
                if stickers:
                    sticker_text = ' '.join([s.get('emoji', '') for s in stickers])
                    sticker_para = Paragraph(f"Dekorasi: {sticker_text}", self.styles['Normal'])
                    page_content.append([sticker_para, ""])
                
                # Create table if we have content
                if page_content:
                    table = Table(page_content, colWidths=[10*cm, 6*cm])
                    table.setStyle(TableStyle([
                        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                        ('LEFTPADDING', (0, 0), (-1, -1), 6),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                        ('TOPPADDING', (0, 0), (-1, -1), 6),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
                    ]))
                    story.append(table)
                
                story.append(Spacer(1, 1*cm))
            
            # Build PDF
            doc.build(story)
            
            print(f"✅ Advanced PDF created successfully: {output_filename}")
            return output_filename
            
        except Exception as e:
            print(f"❌ Error creating advanced PDF: {e}")
            return None

def create_pdf_from_json(json_file, output_pdf=None, advanced=False):
    """
    Utility function untuk membuat PDF dari file JSON
    
    Args:
        json_file: Path ke file JSON scrapbook
        output_pdf: Nama file PDF output (optional)
        advanced: Use advanced layout
    
    Returns:
        Path file PDF yang dibuat
    """
    try:
        # Load JSON data
        with open(json_file, 'r', encoding='utf-8') as f:
            scrapbook_data = json.load(f)
        
        # Generate output filename if not provided
        if output_pdf is None:
            base_name = os.path.splitext(os.path.basename(json_file))[0]
            output_pdf = f"{base_name}.pdf"
        
        # Create PDF
        generator = ScrapbookPDFGenerator()
        
        if advanced:
            return generator.create_advanced_pdf(scrapbook_data, output_pdf)
        else:
            return generator.create_pdf_from_scrapbook(scrapbook_data, output_pdf)
            
    except Exception as e:
        print(f"❌ Error creating PDF from JSON: {e}")
        return None

# Example usage
if __name__ == "__main__":
    print("📄 Scrapbook PDF Generator")
    print("=" * 40)
    
    # Sample scrapbook data
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
                        "content": "Kenangan Indah dari Liburan",
                        "x": 100,
                        "y": 320,
                        "fontSize": 24,
                        "color": "#8B4513",
                        "fontFamily": "Dancing Script"
                    }
                ],
                "stickers": [
                    {"id": "sticker1", "emoji": "❤️", "x": 380, "y": 100, "size": 30},
                    {"id": "sticker2", "emoji": "⭐", "x": 420, "y": 250, "size": 25}
                ],
                "theme": "vintage"
            },
            {
                "id": 2,
                "photos": [],
                "texts": [
                    {
                        "id": "text2",
                        "content": "Momen Berharga Bersama Keluarga",
                        "x": 120,
                        "y": 150,
                        "fontSize": 20,
                        "color": "#2563eb",
                        "fontFamily": "serif"
                    }
                ],
                "stickers": [
                    {"id": "sticker3", "emoji": "🌟", "x": 300, "y": 120, "size": 28},
                    {"id": "sticker4", "emoji": "🎈", "x": 500, "y": 80, "size": 32}
                ],
                "theme": "modern"
            }
        ]
    }
    
    # Create PDF generator
    generator = ScrapbookPDFGenerator()
    
    # Test basic PDF creation
    print("Creating basic PDF...")
    basic_pdf = generator.create_pdf_from_scrapbook(sample_data, "sample_basic.pdf")
    
    # Test advanced PDF creation
    print("Creating advanced PDF...")
    advanced_pdf = generator.create_advanced_pdf(sample_data, "sample_advanced.pdf")
    
    print("\n✅ PDF Generator ready!")
    print("Available functions:")
    print("  - create_pdf_from_scrapbook(data, filename)")
    print("  - create_advanced_pdf(data, filename)")
    print("  - create_pdf_from_json(json_file, output_pdf)")
    
    print(f"\nSample PDFs created:")
    if basic_pdf:
        print(f"  - {basic_pdf}")
    if advanced_pdf:
        print(f"  - {advanced_pdf}")
