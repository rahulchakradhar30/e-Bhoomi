import cv2
import numpy as np
from typing import List, Tuple, Dict, Any

class LineSegmenter:
    """
    OpenCV-based Text-Line Segmentation & Reading Order Extractor.
    Segments full preprocessed page images into individual line crops for line-level OCR engines (e.g. TrOCR).
    """

    def segment_lines(self, image_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detects text line regions in reading order (top-to-bottom).
        Returns a list of dicts containing line_index, line_crop (np.ndarray), and bounding_box.
        """
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        
        # Binarize page for morphological line extraction
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        # Morphological horizontal dilation to group characters into horizontal lines
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 3))
        dilated = cv2.morphologyEx(binary, cv2.MORPH_DILATE, h_kernel)

        # Find contours representing horizontal text lines
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        line_boxes = []
        h_img, w_img = image_bgr.shape[:2]

        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            # Filter noise contours and full page borders
            if w > 40 and 10 <= h <= 150 and w < w_img * 0.98:
                line_boxes.append((x, y, w, h))

        # Sort line boxes in logical top-to-bottom reading order
        line_boxes.sort(key=lambda b: (b[1] // 15, b[0]))

        # Fallback if no distinct line contours detected (e.g. sparse document)
        if not line_boxes:
            line_boxes = [(0, 0, w_img, h_img)]

        segmented_lines = []
        for idx, (x, y, w, h) in enumerate(line_boxes):
            # Pad line crop safely
            pad_y = 4
            pad_x = 4
            y1 = max(0, y - pad_y)
            y2 = min(h_img, y + h + pad_y)
            x1 = max(0, x - pad_x)
            x2 = min(w_img, x + w + pad_x)

            crop = image_bgr[y1:y2, x1:x2]
            segmented_lines.append({
                "line_index": idx,
                "line_crop": crop,
                "bounding_box": {"x": x1, "y": y1, "width": x2 - x1, "height": y2 - y1}
            })

        return segmented_lines
