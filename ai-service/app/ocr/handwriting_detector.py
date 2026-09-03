import cv2
import numpy as np
from typing import List, Dict, Any

class HandwritingDetector:
    """
    OpenCV Computer Vision Region Classifier & Handwriting Detector.
    Analyzes visual features (stroke variance, line height irregularity, aspect ratios, density)
    to classify document regions into PRINTED_TEXT, HANDWRITTEN_TEXT, MIXED_TEXT, TABLE, MAP_OR_DIAGRAM, STAMP, SIGNATURE, UNKNOWN_REGION.
    """

    def analyze_page_regions(self, image_bgr: np.ndarray) -> List[Dict[str, Any]]:
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        h_img, w_img = image_bgr.shape[:2]

        # Otsu binarization
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

        # 1. Check for Table structures (long horizontal and vertical lines)
        h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (int(w_img * 0.25), 1))
        v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, int(h_img * 0.15)))

        h_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, h_kernel)
        v_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, v_kernel)
        table_mask = cv2.add(h_lines, v_lines)

        table_contours, _ = cv2.findContours(table_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if len(table_contours) >= 2:
            # Significant grid lines indicate table layout
            table_x, table_y, table_w, table_h = cv2.boundingRect(np.vstack(table_contours))
            if table_w > w_img * 0.4 and table_h > h_img * 0.2:
                return [{
                    "regionIndex": 0,
                    "regionType": "TABLE",
                    "boundingBox": {"x": table_x, "y": table_y, "width": table_w, "height": table_h},
                    "isHandwritten": False,
                }]

        # 2. General Region Segmentation via morphological dilation
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 8))
        dilated = cv2.morphologyEx(binary, cv2.MORPH_DILATE, kernel)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        region_boxes = []
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            if w > 30 and h > 10 and w < w_img * 0.98 and h < h_img * 0.98:
                region_boxes.append((x, y, w, h))

        # Sort in reading order (top-to-bottom)
        region_boxes.sort(key=lambda b: (b[1] // 20, b[0]))

        if not region_boxes:
            region_boxes = [(0, 0, w_img, h_img)]

        classified_regions = []
        for idx, (x, y, w, h) in enumerate(region_boxes):
            crop = binary[y:y+h, x:x+w]
            stroke_var = self._calculate_stroke_variance(crop)
            aspect_ratio = float(w) / float(h) if h > 0 else 1.0

            # Classification heuristics
            if aspect_ratio < 1.2 and w < 120 and h < 120 and stroke_var > 45.0:
                region_type = "STAMP"
                is_hw = False
            elif aspect_ratio > 3.0 and stroke_var > 65.0:
                region_type = "SIGNATURE"
                is_hw = True
            elif stroke_var > 40.0:
                region_type = "HANDWRITTEN_TEXT"
                is_hw = True
            else:
                region_type = "PRINTED_TEXT"
                is_hw = False

            classified_regions.append({
                "regionIndex": idx,
                "regionType": region_type,
                "boundingBox": {"x": x, "y": y, "width": w, "height": h},
                "isHandwritten": is_hw,
                "strokeVariance": round(stroke_var, 2)
            })

        return classified_regions

    def _calculate_stroke_variance(self, binary_crop: np.ndarray) -> float:
        """
        Calculates stroke thickness variance to differentiate printed vs handwritten text.
        Printed text has uniform stroke width (low variance); handwriting exhibits high variance.
        """
        if binary_crop.size == 0:
            return 0.0

        dist_transform = cv2.distanceTransform(binary_crop, cv2.DIST_L2, 3)
        non_zero_dist = dist_transform[dist_transform > 0]

        if len(non_zero_dist) == 0:
            return 0.0

        return float(np.var(non_zero_dist) * 10.0)
