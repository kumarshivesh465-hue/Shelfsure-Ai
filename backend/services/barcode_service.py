import os
import sys

# Fix for pyzbar DLL loading issue on Windows
_pyzbar_dir = os.path.join(
    os.path.dirname(sys.executable), "Lib", "site-packages", "pyzbar"
)
if os.path.exists(_pyzbar_dir):
    os.add_dll_directory(_pyzbar_dir)

import cv2
from pyzbar import pyzbar


def scan_barcode(image_path):
    """
    Scans the given image for barcodes (EAN, UPC, QR, Code128, etc.)

    Returns:
    {
        "barcode": str or None,
        "barcode_type": str or None,
        "found": bool
    }
    """
    image = cv2.imread(image_path)
    if image is None:
        return {
            "error": "Could not read image file."
        }

    # Convert to grayscale — barcode detection works better on grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Try scanning the grayscale image first
    barcodes = pyzbar.decode(gray)

    # If nothing found, try the original color image as fallback
    if not barcodes:
        barcodes = pyzbar.decode(image)

    if not barcodes:
        return {
            "barcode": None,
            "barcode_type": None,
            "found": False
        }

    # Take the first detected barcode (most products have one)
    first_barcode = barcodes[0]
    barcode_value = first_barcode.data.decode("utf-8")
    barcode_type = first_barcode.type  # e.g. EAN13, CODE128, QRCODE, UPCA

    return {
        "barcode": barcode_value,
        "barcode_type": barcode_type,
        "found": True
    }