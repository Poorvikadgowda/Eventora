"""
Module 6: Prescription Image Preprocessing Engine using OpenCV.
Implements a modular 8-stage image enhancement pipeline:
Original Image -> Resize -> Grayscale -> Noise Reduction -> Contrast Enhancement (CLAHE)
-> Adaptive Thresholding -> Deskew -> Optional Morphological Processing -> Preprocessed Image.

Fully configurable to allow experimental comparison across different clinical document presets.
"""

import time
import base64
import cv2
import numpy as np
from typing import Dict, Any, Tuple, Optional
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Configuration Schema for Experimental Comparisons
# -------------------------------------------------------------

class PreprocessingConfig(BaseModel):
    """
    Hyperparameters for the 8-stage OpenCV prescription preprocessing pipeline.
    Allows comparing different filters experimentally for printed vs handwritten notes.
    """
    preset_name: str = Field(default="default_medical", description="Preset name: default_medical, faint_handwriting, low_light_camera, dense_printed, custom")
    
    # Stage 1: Resize
    enable_resize: bool = Field(default=True, description="Enable aspect-ratio preserving dimension normalization")
    resize_max_width: int = Field(default=1800, description="Maximum width in pixels for downsampling")
    resize_min_width: int = Field(default=800, description="Minimum width in pixels for upsampling")
    
    # Stage 2: Grayscale (Standard single-channel conversion)
    
    # Stage 3: Noise Reduction
    denoise_method: str = Field(default="bilateral", description="Denoise method: bilateral, gaussian, median, none")
    denoise_strength: int = Field(default=9, description="Kernel/neighborhood size for noise filter")
    
    # Stage 4: Contrast Enhancement
    contrast_method: str = Field(default="clahe", description="Contrast method: clahe, equalize, none")
    clahe_clip_limit: float = Field(default=2.5, description="CLAHE clipping limit threshold")
    clahe_tile_grid: int = Field(default=8, description="CLAHE grid size (NxN tiles)")
    
    # Stage 5: Adaptive Thresholding
    threshold_method: str = Field(default="adaptive_gaussian", description="Threshold method: adaptive_gaussian, adaptive_mean, otsu, none")
    threshold_block_size: int = Field(default=17, description="Adaptive threshold pixel neighborhood size (must be odd)")
    threshold_c: int = Field(default=8, description="Constant subtracted from weighted mean in adaptive thresholding")
    
    # Stage 6: Deskew
    enable_deskew: bool = Field(default=True, description="Detect document tilt and horizontally align text lines")
    max_deskew_angle: float = Field(default=25.0, description="Maximum allowed rotation angle to prevent flip distortion")
    
    # Stage 7: Morphological Processing
    morphology_operation: str = Field(default="close", description="Morphological operation: none, close, open, dilate, erode")
    morphology_kernel_size: int = Field(default=2, description="Structuring element kernel dimensions (NxN)")


PRESET_CONFIGS: Dict[str, PreprocessingConfig] = {
    "default_medical": PreprocessingConfig(
        preset_name="default_medical",
        denoise_method="bilateral",
        contrast_method="clahe",
        clahe_clip_limit=2.5,
        threshold_method="adaptive_gaussian",
        threshold_block_size=17,
        threshold_c=8,
        enable_deskew=True,
        morphology_operation="close",
        morphology_kernel_size=2
    ),
    "faint_handwriting": PreprocessingConfig(
        preset_name="faint_handwriting",
        denoise_method="median",
        denoise_strength=5,
        contrast_method="clahe",
        clahe_clip_limit=3.5,
        threshold_method="adaptive_gaussian",
        threshold_block_size=21,
        threshold_c=5,
        enable_deskew=True,
        morphology_operation="dilate",
        morphology_kernel_size=2
    ),
    "low_light_camera": PreprocessingConfig(
        preset_name="low_light_camera",
        denoise_method="bilateral",
        denoise_strength=11,
        contrast_method="clahe",
        clahe_clip_limit=4.0,
        threshold_method="otsu",
        enable_deskew=True,
        morphology_operation="close",
        morphology_kernel_size=2
    ),
    "dense_printed": PreprocessingConfig(
        preset_name="dense_printed",
        denoise_method="gaussian",
        denoise_strength=3,
        contrast_method="clahe",
        clahe_clip_limit=2.0,
        threshold_method="otsu",
        enable_deskew=True,
        morphology_operation="open",
        morphology_kernel_size=2
    )
}


# -------------------------------------------------------------
# Modular Stage 1 to Stage 7 OpenCV Step Functions
# -------------------------------------------------------------

def step_resize(
    cv_img: np.ndarray,
    enable: bool = True,
    max_width: int = 1800,
    min_width: int = 800
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Stage 1: Resize
    Normalizes image dimensions while strictly preserving aspect ratio.
    """
    orig_h, orig_w = cv_img.shape[:2]
    if not enable:
        return cv_img, {
            "step": "1. Resize",
            "applied": False,
            "detail": f"Preserved original dimensions ({orig_w}x{orig_h})"
        }

    new_w, new_h = orig_w, orig_h
    interpolation = cv2.INTER_AREA

    if orig_w > max_width:
        ratio = max_width / float(orig_w)
        new_w = max_width
        new_h = int(orig_h * ratio)
        interpolation = cv2.INTER_AREA
    elif orig_w < min_width and orig_w > 0:
        ratio = min_width / float(orig_w)
        new_w = min_width
        new_h = int(orig_h * ratio)
        interpolation = cv2.INTER_CUBIC

    if (new_w, new_h) != (orig_w, orig_h):
        resized = cv2.resize(cv_img, (new_w, new_h), interpolation=interpolation)
        return resized, {
            "step": "1. Resize",
            "applied": True,
            "detail": f"Normalized dimensions from {orig_w}x{orig_h} to {new_w}x{new_h}"
        }

    return cv_img, {
        "step": "1. Resize",
        "applied": False,
        "detail": f"Dimensions ({orig_w}x{orig_h}) within optimal OCR range"
    }


def step_grayscale(cv_img: np.ndarray) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Stage 2: Grayscale
    Converts multi-channel RGB/BGR image to single-channel 8-bit luminance representation.
    """
    if len(cv_img.shape) == 2 or cv_img.shape[2] == 1:
        return cv_img, {
            "step": "2. Grayscale",
            "applied": False,
            "detail": "Input image is already single-channel grayscale"
        }

    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
    return gray, {
        "step": "2. Grayscale",
        "applied": True,
        "detail": "Converted 3-channel color image to 8-bit grayscale"
    }


def step_noise_reduction(
    cv_gray: np.ndarray,
    method: str = "bilateral",
    strength: int = 9
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Stage 3: Noise Reduction
    Removes speckle and paper grain while preserving sharp pen strokes and character edges.
    """
    k = strength if strength % 2 == 1 else strength + 1

    if method == "bilateral":
        # Bilateral filter is edge-preserving (ideal for handwriting)
        denoised = cv2.bilateralFilter(cv_gray, d=strength, sigmaColor=75, sigmaSpace=75)
        return denoised, {
            "step": "3. Noise Reduction",
            "applied": True,
            "detail": f"Bilateral edge-preserving filter (diameter={strength}, sigmaColor=75, sigmaSpace=75)"
        }
    elif method == "gaussian":
        denoised = cv2.GaussianBlur(cv_gray, (k, k), 0)
        return denoised, {
            "step": "3. Noise Reduction",
            "applied": True,
            "detail": f"Gaussian spatial smoothing filter (kernel={k}x{k})"
        }
    elif method == "median":
        denoised = cv2.medianBlur(cv_gray, k)
        return denoised, {
            "step": "3. Noise Reduction",
            "applied": True,
            "detail": f"Median filter for salt-and-pepper noise suppression (kernel={k}x{k})"
        }
    else:
        return cv_gray, {
            "step": "3. Noise Reduction",
            "applied": False,
            "detail": "Noise reduction skipped (method=none)"
        }


def step_contrast_enhancement(
    cv_gray: np.ndarray,
    method: str = "clahe",
    clip_limit: float = 2.5,
    tile_grid_size: int = 8
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Stage 4: Contrast Enhancement
    Applies CLAHE (Contrast Limited Adaptive Histogram Equalization) to balance uneven lighting
    and heighten faint ink visibility without over-saturating paper background.
    """
    if method == "clahe":
        clahe = cv2.createCLAHE(
            clipLimit=clip_limit,
            tileGridSize=(tile_grid_size, tile_grid_size)
        )
        enhanced = clahe.apply(cv_gray)
        return enhanced, {
            "step": "4. Contrast Enhancement",
            "applied": True,
            "detail": f"CLAHE adaptive histogram equalization (clipLimit={clip_limit}, tiles={tile_grid_size}x{tile_grid_size})"
        }
    elif method == "equalize":
        enhanced = cv2.equalizeHist(cv_gray)
        return enhanced, {
            "step": "4. Contrast Enhancement",
            "applied": True,
            "detail": "Global histogram equalization"
        }
    else:
        return cv_gray, {
            "step": "4. Contrast Enhancement",
            "applied": False,
            "detail": "Contrast enhancement skipped (method=none)"
        }


def step_adaptive_threshold(
    cv_gray: np.ndarray,
    method: str = "adaptive_gaussian",
    block_size: int = 17,
    c: int = 8
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Stage 5: Adaptive Thresholding
    Converts grayscale image into clean binary black-on-white text image.
    Uses localized neighborhood thresholding to overcome shadows and gradients.
    """
    k = max(3, block_size if block_size % 2 == 1 else block_size + 1)

    if method == "adaptive_gaussian":
        binarized = cv2.adaptiveThreshold(
            cv_gray,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            k,
            c
        )
        return binarized, {
            "step": "5. Adaptive Thresholding",
            "applied": True,
            "detail": f"Gaussian adaptive binarization (blockSize={k}, C={c})"
        }
    elif method == "adaptive_mean":
        binarized = cv2.adaptiveThreshold(
            cv_gray,
            255,
            cv2.ADAPTIVE_THRESH_MEAN_C,
            cv2.THRESH_BINARY,
            k,
            c
        )
        return binarized, {
            "step": "5. Adaptive Thresholding",
            "applied": True,
            "detail": f"Mean adaptive binarization (blockSize={k}, C={c})"
        }
    elif method == "otsu":
        _, binarized = cv2.threshold(cv_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return binarized, {
            "step": "5. Adaptive Thresholding",
            "applied": True,
            "detail": "Otsu global optimal variance binarization"
        }
    else:
        return cv_gray, {
            "step": "5. Adaptive Thresholding",
            "applied": False,
            "detail": "Thresholding skipped (method=none)"
        }


def compute_skew_angle(cv_gray_or_bin: np.ndarray) -> float:
    """
    Calculates document text skew angle using minimum bounding box of foreground ink pixels.
    """
    try:
        if len(cv_gray_or_bin.shape) == 3:
            cv_gray_or_bin = cv2.cvtColor(cv_gray_or_bin, cv2.COLOR_BGR2GRAY)

        # Ensure text is white foreground on black background for coordinate calculation
        if np.mean(cv_gray_or_bin) > 127:
            # White background, invert
            thresh = cv2.threshold(cv_gray_or_bin, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]
        else:
            thresh = cv_gray_or_bin

        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) < 50:
            return 0.0

        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle

        if abs(angle) > 25:
            return 0.0
        return float(round(angle, 2))
    except Exception:
        return 0.0


def rotate_image(cv_img: np.ndarray, angle: float, border_value: int = 255) -> np.ndarray:
    """
    Rotates image around its center by angle degrees with white background fill.
    """
    if abs(angle) < 0.5:
        return cv_img
    (h, w) = cv_img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(
        cv_img, M, (w, h),
        flags=cv2.INTER_CUBIC,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(border_value, border_value, border_value) if len(cv_img.shape) == 3 else border_value
    )
    return rotated


def step_deskew(
    cv_img: np.ndarray,
    enable: bool = True,
    max_angle: float = 25.0
) -> Tuple[np.ndarray, float, Dict[str, Any]]:
    """
    Stage 6: Deskew
    Calculates document alignment angle and rotates image so text lines are horizontally oriented.
    """
    if not enable:
        return cv_img, 0.0, {
            "step": "6. Deskew",
            "applied": False,
            "detail": "Deskewing disabled by configuration"
        }

    angle = compute_skew_angle(cv_img)
    if abs(angle) >= 0.5 and abs(angle) <= max_angle:
        rotated = rotate_image(cv_img, angle, border_value=255)
        return rotated, angle, {
            "step": "6. Deskew",
            "applied": True,
            "detail": f"Corrected {angle}° text tilt angle"
        }

    return cv_img, angle, {
        "step": "6. Deskew",
        "applied": False,
        "detail": f"Tilt angle ({angle}°) is negligible (< 0.5°)"
    }


def step_morphological_processing(
    cv_binary: np.ndarray,
    operation: str = "close",
    kernel_size: int = 2
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Stage 7: Optional Morphological Processing
    Cleans binary character morphology:
    - 'close': Bridges broken strokes in faint handwriting (dilation followed by erosion).
    - 'open': Eliminates isolated dust specks (erosion followed by dilation).
    - 'dilate': Expands text strokes for ultra-faint pencil lines.
    - 'erode': Thins overly thick bled ink strokes.
    """
    if operation == "none" or kernel_size < 1:
        return cv_binary, {
            "step": "7. Morphological Processing",
            "applied": False,
            "detail": "Morphological processing skipped"
        }

    # Invert binary so text is white (255) and background is black (0) for OpenCV morphology
    inv = cv2.bitwise_not(cv_binary)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (kernel_size, kernel_size))

    if operation == "close":
        morphed = cv2.morphologyEx(inv, cv2.MORPH_CLOSE, kernel)
        detail = f"Morphological close (kernel={kernel_size}x{kernel_size}) to bridge broken pen strokes"
    elif operation == "open":
        morphed = cv2.morphologyEx(inv, cv2.MORPH_OPEN, kernel)
        detail = f"Morphological open (kernel={kernel_size}x{kernel_size}) to eliminate dust specks"
    elif operation == "dilate":
        morphed = cv2.dilate(inv, kernel, iterations=1)
        detail = f"Morphological dilation (kernel={kernel_size}x{kernel_size}) to thicken faint handwriting"
    elif operation == "erode":
        morphed = cv2.erode(inv, kernel, iterations=1)
        detail = f"Morphological erosion (kernel={kernel_size}x{kernel_size}) to thin bled ink strokes"
    else:
        return cv_binary, {
            "step": "7. Morphological Processing",
            "applied": False,
            "detail": f"Unknown operation '{operation}' skipped"
        }

    # Invert back to black text on white background
    result = cv2.bitwise_not(morphed)
    return result, {
        "step": "7. Morphological Processing",
        "applied": True,
        "detail": detail
    }


# -------------------------------------------------------------
# Main Modular Preprocessing Pipeline Engine
# -------------------------------------------------------------

def run_modular_preprocessing_pipeline(
    cv_img: np.ndarray,
    config: Optional[PreprocessingConfig] = None
) -> Dict[str, Any]:
    """
    Executes the full 8-stage prescription image enhancement pipeline:
    Original Image -> Resize -> Grayscale -> Noise Reduction -> Contrast Enhancement
    -> Adaptive Thresholding -> Deskew -> Morphological Processing -> Preprocessed Image
    """
    if cv_img is None or cv_img.size == 0:
        raise ValueError("Invalid image provided for preprocessing pipeline.")

    if config is None:
        config = PRESET_CONFIGS["default_medical"]

    start_time = time.time()
    steps_applied = []
    orig_h, orig_w = cv_img.shape[:2]

    # Stage 1: Resize
    img_s1, meta_s1 = step_resize(
        cv_img,
        enable=config.enable_resize,
        max_width=config.resize_max_width,
        min_width=config.resize_min_width
    )
    steps_applied.append(meta_s1)

    # Stage 2: Grayscale
    img_s2, meta_s2 = step_grayscale(img_s1)
    steps_applied.append(meta_s2)

    # Stage 3: Noise Reduction
    img_s3, meta_s3 = step_noise_reduction(
        img_s2,
        method=config.denoise_method,
        strength=config.denoise_strength
    )
    steps_applied.append(meta_s3)

    # Stage 4: Contrast Enhancement
    img_s4, meta_s4 = step_contrast_enhancement(
        img_s3,
        method=config.contrast_method,
        clip_limit=config.clahe_clip_limit,
        tile_grid_size=config.clahe_tile_grid
    )
    steps_applied.append(meta_s4)

    # Stage 5: Adaptive Thresholding
    img_s5, meta_s5 = step_adaptive_threshold(
        img_s4,
        method=config.threshold_method,
        block_size=config.threshold_block_size,
        c=config.threshold_c
    )
    steps_applied.append(meta_s5)

    # Stage 6: Deskew
    img_s6, skew_angle, meta_s6 = step_deskew(
        img_s5,
        enable=config.enable_deskew,
        max_angle=config.max_deskew_angle
    )
    steps_applied.append(meta_s6)

    # Stage 7: Optional Morphological Processing
    img_s7, meta_s7 = step_morphological_processing(
        img_s6,
        operation=config.morphology_operation,
        kernel_size=config.morphology_kernel_size
    )
    steps_applied.append(meta_s7)

    # Stage 8: Output Preprocessed Image
    final_img = img_s7
    final_h, final_w = final_img.shape[:2]

    # Encode to PNG bytes
    success, buffer = cv2.imencode(".png", final_img)
    if not success:
        raise ValueError("Failed to encode preprocessed image to PNG format.")

    processed_bytes = buffer.tobytes()
    base64_preview = f"data:image/png;base64,{base64.b64encode(processed_bytes).decode('utf-8')}"
    execution_time_ms = int((time.time() - start_time) * 1000)

    return {
        "success": True,
        "processed_bytes": processed_bytes,
        "base64_preview": base64_preview,
        "pipeline_steps": steps_applied,
        "skew_angle_detected": skew_angle,
        "configuration": config.model_dump() if hasattr(config, "model_dump") else config.dict(),
        "metrics": {
            "original_dimensions": {"width": orig_w, "height": orig_h},
            "preprocessed_dimensions": {"width": final_w, "height": final_h},
            "execution_time_ms": execution_time_ms,
            "skew_angle": skew_angle
        }
    }


# -------------------------------------------------------------
# Backward-Compatibility Adapter for Legacy & Test Suites
# -------------------------------------------------------------

def preprocess_prescription_cv(
    image_bytes: bytes,
    apply_binarization: bool = True,
    apply_deskew: bool = True
) -> Dict[str, Any]:
    """
    Backward-compatible adapter for existing test suites and quick validations.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    cv_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if cv_img is None:
        raise ValueError("Could not decode image for OpenCV preprocessing.")

    cfg = PreprocessingConfig(
        preset_name="legacy_adapter",
        enable_resize=False,
        denoise_method="bilateral",
        contrast_method="clahe",
        threshold_method="otsu" if apply_binarization else "none",
        enable_deskew=apply_deskew,
        morphology_operation="none"
    )

    res = run_modular_preprocessing_pipeline(cv_img, cfg)

    # Transform steps to legacy string list format expected by test_image_pipeline.py
    steps_applied_legacy = []
    steps_applied_legacy.append("grayscale_conversion")
    if res["skew_angle_detected"] != 0.0:
        steps_applied_legacy.append(f"deskew_corrected_{res['skew_angle_detected']}deg")
    steps_applied_legacy.append("bilateral_denoising")
    steps_applied_legacy.append("clahe_contrast_enhancement")
    if apply_binarization:
        steps_applied_legacy.append("otsu_adaptive_binarization")

    return {
        "success": True,
        "processed_bytes": res["processed_bytes"],
        "base64_preview": res["base64_preview"],
        "steps_applied": steps_applied_legacy,
        "skew_angle_detected": res["skew_angle_detected"],
        "original_dimensions": res["metrics"]["original_dimensions"],
        "processed_dimensions": res["metrics"]["preprocessed_dimensions"]
    }
