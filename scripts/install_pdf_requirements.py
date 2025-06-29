import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def check_package(package):
    """Check if a package is already installed"""
    try:
        __import__(package)
        print(f"✅ {package} is already installed")
        return True
    except ImportError:
        print(f"⚠️ {package} is not installed")
        return False

def main():
    print("📄 Installing PDF Generation Requirements")
    print("=" * 50)
    
    # Required packages for PDF generation
    packages = [
        "reportlab",
        "Pillow"
    ]
    
    print("Checking and installing required packages...\n")
    
    all_installed = True
    
    for package in packages:
        if not check_package(package):
            print(f"Installing {package}...")
            if not install_package(package):
                all_installed = False
        print()
    
    if all_installed:
        print("🎉 All packages installed successfully!")
        print("\nYou can now use the PDF generation features:")
        print("  - JavaScript: Export to PDF button in the app")
        print("  - Python: Run pdf_generator.py script")
        
        # Test import
        try:
            from reportlab.lib.pagesizes import letter
            from PIL import Image
            print("\n✅ PDF generation modules imported successfully!")
        except ImportError as e:
            print(f"\n❌ Import test failed: {e}")
    else:
        print("❌ Some packages failed to install.")
        print("Please install them manually:")
        for package in packages:
            print(f"  pip install {package}")

if __name__ == "__main__":
    main()
