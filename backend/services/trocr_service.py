"""
backend/services/trocr_service.py

Pretrained Hugging Face TrOCR Service for Handwritten Prescription OCR.
Model: microsoft/trocr-base-handwritten
Integrates TrOCRProcessor and VisionEncoderDecoderModel with OpenCV line segmentation,
RGB conversion, PyTorch inference, and token decoding.
Maintains a singleton model instance loaded once at application startup.
"""

import os
import time
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import numpy as np
import cv2
from PIL import Image

DEFAULT_MODEL_NAME = "microsoft/trocr-base-handwritten"


class TrOCRService:
    """
    TrOCR Handwritten Prescription OCR Service.
    Loads pretrained VisionEncoderDecoderModel and TrOCRProcessor from Hugging Face.
    Provides line segmentation, batch generation, and text decoding.
    Modular design allows future fine-tuning on custom clinical prescription datasets.
    """

    def __init__(
        self,
        model_name_or_path: str = DEFAULT_MODEL_NAME,
        device: Optional[str] = None
    ):
        self.engine_name = "TrOCR"
        self.model_name_or_path = model_name_or_path
        self.processor = None
        self.model = None
        self.is_loaded = False
        self.load_error: Optional[str] = None
        self._device_str = device
        self.device = None

    def _resolve_device(self):
        """Resolves optimal PyTorch inference device (CUDA GPU or CPU)."""
        if self._device_str:
            return self._device_str
        try:
            import torch
            return "cuda" if torch.cuda.is_available() else "cpu"
        except Exception:
            return "cpu"

    def load_model(self, force_reload: bool = False) -> bool:
        """
        Loads TrOCRProcessor and VisionEncoderDecoderModel once at application startup.
        Does not reload for each request.
        """
        if self.is_loaded and not force_reload:
            return True

        start_time = time.time()
        try:
            import torch
            from transformers import TrOCRProcessor, VisionEncoderDecoderModel

            self.device = self._resolve_device()
            self.processor = TrOCRProcessor.from_pretrained(self.model_name_or_path)
            self.model = VisionEncoderDecoderModel.from_pretrained(self.model_name_or_path)
            self.model.to(self.device)
            self.model.eval()

            self.is_loaded = True
            self.load_error = None
            elapsed = round(time.time() - start_time, 2)
            print(f"[TrOCRService] Successfully loaded '{self.model_name_or_path}' on {self.device} in {elapsed}s")
            return True

        except Exception as e:
            self.is_loaded = False
            self.load_error = str(e)
            print(f"[TrOCRService] Warning: Failed to load TrOCR model '{self.model_name_or_path}': {e}")
            return False

    def preprocess_image(
        self,
        image_input: Union[str, Path, np.ndarray, Image.Image]
    ) -> Image.Image:
        """
        Accepts prescription image and converts to RGB PIL Image:
        - If file path: verifies existence and reads into memory.
        - If OpenCV numpy array: converts BGR/Grayscale to RGB.
        - If PIL Image: ensures 'RGB' mode.
        """
        if isinstance(image_input, (str, Path)):
            path_obj = Path(image_input)
            if not path_obj.exists():
                raise FileNotFoundError(f"Prescription image file not found at: {path_obj}")

            cv_img = cv2.imread(str(path_obj))
            if cv_img is None:
                # Try opening with PIL
                try:
                    pil_img = Image.open(str(path_obj))
                    return pil_img.convert("RGB")
                except Exception as err:
                    raise ValueError(f"Corrupted or unreadable image file '{path_obj.name}': {err}")

            rgb_img = cv2.cvtColor(cv_img, cv2.COLOR_BGR2RGB)
            return Image.fromarray(rgb_img)

        elif isinstance(image_input, np.ndarray):
            if len(image_input.shape) == 2:
                rgb_img = cv2.cvtColor(image_input, cv2.COLOR_GRAY2RGB)
            elif image_input.shape[2] == 4:
                rgb_img = cv2.cvtColor(image_input, cv2.COLOR_BGRA2RGB)
            elif image_input.shape[2] == 3:
                rgb_img = cv2.cvtColor(image_input, cv2.COLOR_BGR2RGB)
            else:
                rgb_img = image_input
            return Image.fromarray(rgb_img)

        elif isinstance(image_input, Image.Image):
            return image_input.convert("RGB")

        else:
            raise TypeError(f"Unsupported image input type: {type(image_input)}")

    def segment_prescription_lines(self, pil_image: Image.Image) -> List[Image.Image]:
        """
        Segments a multi-line prescription into individual text-line crops using OpenCV contour detection.
        TrOCR was pretrained on line-level crops; line segmentation significantly enhances recognition accuracy.
        If line segmentation yields 0 or 1 crop, returns the entire image.
        """
        np_img = np.array(pil_image)
        gray = cv2.cvtColor(np_img, cv2.COLOR_RGB2GRAY)

        # Invert if light background
        if np.mean(gray) > 127:
            inv = cv2.bitwise_not(gray)
        else:
            inv = gray

        # Horizontal dilation to connect words in each clinical line
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (35, 4))
        dilated = cv2.dilate(inv, kernel, iterations=1)

        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        line_crops = []
        h_img, w_img = gray.shape[:2]

        boxes = []
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            # Filter tiny noise specks or margins
            if w > 40 and h > 10 and h < int(h_img * 0.5):
                # Add slight padding
                pad_y = 4
                pad_x = 6
                y0 = max(0, y - pad_y)
                y1 = min(h_img, y + h + pad_y)
                x0 = max(0, x - pad_x)
                x1 = min(w_img, x + w + pad_x)
                boxes.append((x0, y0, x1 - x0, y1 - y0))

        # Sort top-to-bottom
        boxes.sort(key=lambda b: b[1])

        for (bx, by, bw, bh) in boxes:
            crop = pil_image.crop((bx, by, bx + bw, by + bh))
            line_crops.append(crop)

        # Fallback to full image if line contours are empty
        if not line_crops:
            line_crops = [pil_image]

        return line_crops

    def run_ocr(
        self,
        image_input: Union[str, Path, np.ndarray, Image.Image]
    ) -> Dict[str, Any]:
        """
        Executes TrOCR inference on the prescription image:
        1. Preprocesses image to RGB PIL Image.
        2. Segments multi-line prescription into line crops.
        3. Extracts pixel values via TrOCRProcessor.
        4. Runs VisionEncoderDecoderModel generation.
        5. Decodes generated tokens into text.
        6. Measures and returns processing time in seconds and milliseconds.
        """
        start_time = time.time()

        # 1. Check model availability
        if not self.is_loaded:
            loaded_ok = self.load_model()
            if not loaded_ok:
                # If weights cannot be loaded, report clear error
                elapsed_sec = round(time.time() - start_time, 3)
                raise RuntimeError(
                    f"TrOCR model could not be loaded: {self.load_error or 'Transformers/PyTorch unavailable'}. "
                    f"Please verify Hugging Face weights for '{self.model_name_or_path}'."
                )

        # 2. Preprocess image
        try:
            pil_rgb = self.preprocess_image(image_input)
        except Exception as e:
            raise ValueError(f"Failed to process prescription image: {str(e)}")

        # 3. Segment into line crops
        line_crops = self.segment_prescription_lines(pil_rgb)

        import torch
        recognized_lines = []

        try:
            for crop in line_crops:
                pixel_values = self.processor(crop, return_tensors="pt").pixel_values.to(self.device)
                with torch.no_grad():
                    generated_ids = self.model.generate(
                        pixel_values,
                        max_new_tokens=64,
                        num_beams=2,
                        early_stopping=True
                    )
                line_text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
                cleaned = line_text.strip()
                if cleaned:
                    recognized_lines.append(cleaned)

        except Exception as e:
            raise RuntimeError(f"TrOCR token generation error during inference: {str(e)}")

        full_text = "\n".join(recognized_lines) if recognized_lines else ""
        elapsed_sec = round(time.time() - start_time, 3)

        return {
            "engine": self.engine_name,
            "text": full_text,
            "processing_time": elapsed_sec,
            "processing_time_ms": int(elapsed_sec * 1000),
            "status": "success",
            "lines_count": len(recognized_lines),
            "confidence": None,  # Do not invent uncalibrated confidence score
            "confidence_note": "TrOCR autoregressive transformer does not generate calibrated line confidence. Clinician verification required."
        }


# Singleton service instance loaded once at application startup
trocr_service = TrOCRService()
