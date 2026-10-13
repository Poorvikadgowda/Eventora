import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import {
  uploadPrescriptionImage,
  preprocessPrescriptionById,
  compareOCREngines,
  selectOCRResult,
  extractMedicinesFromPrescription,
  runTrOCR,
  runTesseractOCR,
  compareAllOCREngines,
  evaluateOCREngines,
  getOCREvaluations,
  analyzePrescriptionFile,
  analyzePrescriptionText
} from '../../services/api';
import {
  Upload,
  Camera,
  Trash2,
  FileText,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Loader2,
  RefreshCw,
  FileCheck,
  Check,
  AlertTriangle,
  Sliders,
  Layers,
  Eye,
  Cpu,
  Clock,
  Award,
  Edit3
} from 'lucide-react';

export const PrescriptionUpload = () => {
  const { setCurrentPrescription, setActiveTab, notify } = useApp();

  const [activeMode, setActiveMode] = useState('upload'); // 'upload' | 'samples' | 'text'
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageDimensions, setImageDimensions] = useState(null);

  // Upload & Progress States
  // 'idle' | 'uploading' | 'validating' | 'ready_for_ocr' | 'error'
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadResult, setUploadResult] = useState(null);
  const [backendError, setBackendError] = useState(null);
  const [clientValidationError, setClientValidationError] = useState(null);

  // OpenCV Preprocessing States
  const [isPreprocessing, setIsPreprocessing] = useState(false);
  const [preprocessingData, setPreprocessingData] = useState(null);
  const [preprocessingError, setPreprocessingError] = useState(null);
  const [activePreset, setActivePreset] = useState('default_medical');

  // OCR Execution & 4-Engine Multi-Model States (TrOCR, PaddleOCR, EasyOCR, Tesseract)
  const [isScanningOCR, setIsScanningOCR] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [ocrComparisonResult, setOcrComparisonResult] = useState(null);
  const [multiOcrResult, setMultiOcrResult] = useState(null);
  const [selectedOcrEngine, setSelectedOcrEngine] = useState('TrOCR');
  const [editableOcrText, setEditableOcrText] = useState('');
  const [isConfirmingOCR, setIsConfirmingOCR] = useState(false);

  // Research Evaluation States (CER, WER, Latency, Medicine Accuracy)
  const [groundTruthText, setGroundTruthText] = useState(
    'Rx\n1. Tab Dolo 650mg - 1-0-1 - 5 days\n2. Cap Pantocid DSR - 1-0-0 - 10 days\n3. Tab Augmentin 625 Duo - 1-0-1'
  );
  const [evaluationResults, setEvaluationResults] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [rawText, setRawText] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const comparisonSectionRef = useRef(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Client-Side Image Validation (Format, Size, Minimum size)
  const validateImageFile = (file) => {
    if (!file) return { valid: false, message: 'No file selected.' };

    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const fileName = (file.name || '').toLowerCase();
    const hasValidExt = validExtensions.some((ext) => fileName.endsWith(ext));
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const hasValidMime = validMimes.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      return {
        valid: false,
        message: 'Unsupported file format. Please upload a JPG, JPEG, or PNG prescription image.'
      };
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        message: `File size (${sizeMB} MB) exceeds maximum allowed limit of 10 MB. Please upload a smaller image.`
      };
    }

    if (file.size < 200) {
      return {
        valid: false,
        message: 'Uploaded file is too small or corrupted (< 200 bytes). Please select a valid prescription image.'
      };
    }

    return { valid: true };
  };

  const handleFileSelection = (file) => {
    if (!file) return;

    // Reset previous states
    setBackendError(null);
    setUploadResult(null);
    setUploadStatus('idle');
    setPreprocessingData(null);
    setPreprocessingError(null);
    setOcrComparisonResult(null);
    setMultiOcrResult(null);
    setEvaluationResults(null);
    setEditableOcrText('');

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setClientValidationError(validation.message);
      notify(validation.message, 'error');
      return;
    }

    setClientValidationError(null);
    setSelectedFile(file);

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    const img = new Image();
    img.src = url;
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = (e) => {
    if (e) e.stopPropagation();
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageDimensions(null);
    setUploadStatus('idle');
    setUploadResult(null);
    setPreprocessingData(null);
    setPreprocessingError(null);
    setOcrComparisonResult(null);
    setMultiOcrResult(null);
    setEvaluationResults(null);
    setEditableOcrText('');
    setBackendError(null);
    setClientValidationError(null);

    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Execute Preprocessing with a chosen preset configuration
  const runPreprocessing = async (prescriptionId, presetName = 'default_medical') => {
    setIsPreprocessing(true);
    setPreprocessingError(null);
    try {
      const data = await preprocessPrescriptionById(prescriptionId, { preset_name: presetName });
      setPreprocessingData(data);
      setActivePreset(presetName);
      notify(`Preprocessing complete using '${presetName}' configuration!`, 'success');
    } catch (err) {
      const msg = err.message || 'Image preprocessing failed.';
      setPreprocessingError(msg);
      notify(msg, 'error');
    } finally {
      setIsPreprocessing(false);
    }
  };

  // Execute Backend Upload & Validation (POST /api/prescriptions/upload)
  const handleUploadAndValidate = async () => {
    if (!selectedFile) {
      notify('Please select a prescription image first.', 'warning');
      return;
    }

    setBackendError(null);
    setUploadResult(null);
    setPreprocessingData(null);
    setOcrComparisonResult(null);

    try {
      // Stage 1: Uploading
      setUploadStatus('uploading');
      await new Promise((r) => setTimeout(r, 400));

      // Stage 2: Image validation
      setUploadStatus('validating');

      // Call Backend API
      const result = await uploadPrescriptionImage(selectedFile);
      await new Promise((r) => setTimeout(r, 300));

      // Stage 3: Ready for OCR / Preprocessing
      setUploadStatus('ready_for_ocr');
      setUploadResult(result);
      notify(result.message || 'Prescription uploaded & validated successfully!', 'success');

      // Auto-trigger OpenCV Preprocessing Pipeline
      await runPreprocessing(result.prescription_id, 'default_medical');
    } catch (err) {
      setUploadStatus('error');
      const msg = err.message || 'Image validation failed.';
      setBackendError(msg);
      notify(msg, 'error');
    }
  };

  // Run individual TrOCR Handwritten Model (microsoft/trocr-base-handwritten)
  const handleRunTrOCR = async () => {
    if (!uploadResult?.prescription_id) {
      notify('Please upload and preprocess a prescription first.', 'warning');
      return;
    }

    setIsScanningOCR(true);
    setScanStep('Executing Hugging Face TrOCR (Vision Transformer) on handwritten prescription...');

    try {
      const trocrData = await runTrOCR(uploadResult.prescription_id);
      setSelectedOcrEngine('TrOCR');
      setEditableOcrText(trocrData.text || '');

      // Update multi-model table
      setMultiOcrResult((prev) => {
        const engines = prev?.engines ? [...prev.engines] : [];
        const existingIdx = engines.findIndex((e) => e.engine === 'TrOCR');
        const entry = {
          engine: 'TrOCR',
          model_type: 'Vision Transformer (Encoder-Decoder)',
          specialty: 'Handwritten Prescription Recognition',
          recognized_text: trocrData.text || '',
          processing_time_ms: trocrData.processing_time_ms || Math.round((trocrData.processing_time || 0) * 1000),
          confidence: null,
          status: 'success'
        };
        if (existingIdx >= 0) {
          engines[existingIdx] = entry;
        } else {
          engines.unshift(entry);
        }
        return {
          ...(prev || {}),
          trocr_result: trocrData,
          engines
        };
      });

      notify('TrOCR inference complete! Recognized handwritten clinical text.', 'success');
    } catch (err) {
      notify(err.message || 'TrOCR execution failed.', 'error');
    } finally {
      setIsScanningOCR(false);
      setScanStep('');
    }
  };

  // Run all 4 OCR models side-by-side: TrOCR, PaddleOCR, EasyOCR, Tesseract
  const handleRunAllOCRModels = async () => {
    if (!uploadResult?.prescription_id) {
      notify('Please upload and preprocess a prescription first.', 'warning');
      return;
    }

    setIsScanningOCR(true);
    setScanStep('Benchmarking TrOCR, PaddleOCR, EasyOCR, and Tesseract side-by-side...');

    try {
      const compAll = await compareAllOCREngines(uploadResult.prescription_id, groundTruthText);
      setMultiOcrResult(compAll);

      if (compAll.evaluations && compAll.evaluations.length > 0) {
        setEvaluationResults(compAll.evaluations);
      }

      // Default active selection to TrOCR if non-empty, otherwise PaddleOCR
      const trocrText = compAll.trocr_result?.text || '';
      const paddleText = compAll.paddle_result?.detected_text || '';
      const defaultEngine = trocrText.trim() ? 'TrOCR' : 'PaddleOCR';
      const defaultText = trocrText.trim() || paddleText;

      setSelectedOcrEngine(defaultEngine);
      setEditableOcrText(defaultText);

      notify('All 4 OCR models benchmarked successfully!', 'success');
    } catch (err) {
      notify(err.message || 'Multi-engine OCR benchmark failed.', 'error');
    } finally {
      setIsScanningOCR(false);
      setScanStep('');
    }
  };

  // Run Ground Truth Research Evaluation (CER, WER, Latency, Medicine Accuracy)
  const handleEvaluateResearch = async () => {
    if (!uploadResult?.prescription_id) {
      notify('Please upload a prescription first.', 'warning');
      return;
    }
    if (!groundTruthText.trim()) {
      notify('Please enter or upload ground-truth prescription text for evaluation.', 'warning');
      return;
    }

    setIsEvaluating(true);
    try {
      const res = await evaluateOCREngines(uploadResult.prescription_id, groundTruthText);
      setEvaluationResults(res.evaluations || []);
      notify(`Research evaluation complete! Best CER: ${res.best_cer_engine} (${res.total_engines_evaluated} models)`, 'success');
    } catch (err) {
      notify(err.message || 'Evaluation calculation failed.', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Quick Dual Run OCR button handler (Executes All OCR models)
  const handleRunOCR = async () => {
    await handleRunAllOCRModels();
  };

  // Switch or scroll to OCR comparison view
  const handleCompareResultsClick = async () => {
    if (!uploadResult?.prescription_id) {
      notify('Please upload and preprocess a prescription first.', 'warning');
      return;
    }
    if (!multiOcrResult && !ocrComparisonResult) {
      await handleRunAllOCRModels();
    }
    setTimeout(() => {
      comparisonSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Switch chosen OCR engine among TrOCR, PaddleOCR, EasyOCR, Tesseract
  const handleSelectEngine = (engineName) => {
    setSelectedOcrEngine(engineName);

    // 1. From multiOcrResult
    if (multiOcrResult?.engines) {
      const target = multiOcrResult.engines.find((e) => e.engine === engineName);
      if (target && target.recognized_text) {
        setEditableOcrText(target.recognized_text);
        return;
      }
    }

    // 2. From individual objects
    if (engineName === 'TrOCR' && multiOcrResult?.trocr_result?.text) {
      setEditableOcrText(multiOcrResult.trocr_result.text);
    } else if (engineName === 'PaddleOCR' && (multiOcrResult?.paddle_result?.detected_text || ocrComparisonResult?.paddle_result?.detected_text)) {
      setEditableOcrText(multiOcrResult?.paddle_result?.detected_text || ocrComparisonResult?.paddle_result?.detected_text);
    } else if (engineName === 'EasyOCR' && (multiOcrResult?.easy_result?.detected_text || ocrComparisonResult?.easy_result?.detected_text)) {
      setEditableOcrText(multiOcrResult?.easy_result?.detected_text || ocrComparisonResult?.easy_result?.detected_text);
    } else if (engineName === 'Tesseract' && multiOcrResult?.tesseract_result?.detected_text) {
      setEditableOcrText(multiOcrResult.tesseract_result.detected_text);
    }
  };

  // Confirm user-selected OCR output and proceed to medicine entity extraction
  const handleConfirmAndExtractMedicines = async () => {
    if (!uploadResult?.prescription_id || !editableOcrText.trim()) {
      notify('Please ensure recognized OCR text is present.', 'warning');
      return;
    }

    setIsConfirmingOCR(true);
    setScanStep('Saving confirmed OCR output and extracting active pharmaceutical molecules...');

    try {
      // 1. Save user selection in database without silent merging
      await selectOCRResult(uploadResult.prescription_id, {
        selected_engine: selectedOcrEngine,
        selected_text: editableOcrText
      });

      // 2. Call extraction endpoint: POST /api/medicines/extract/{prescription_id}
      let extractionData = null;
      try {
        extractionData = await extractMedicinesFromPrescription(uploadResult.prescription_id, editableOcrText);
      } catch (extractErr) {
        console.warn('Backend extractMedicines notice:', extractErr);
      }

      // 3. Run clinical parser for downstream savings and generic matching catalog
      const parsedRx = await analyzePrescriptionText(editableOcrText);

      // 4. Merge extraction output with legacy parsedRx if available
      let finalMedicines = parsedRx?.medicines || [];
      if (extractionData?.medicines && extractionData.medicines.length > 0) {
        finalMedicines = extractionData.medicines.map((m) => {
          const matchedLegacy = (parsedRx?.medicines || []).find(
            (lm) => (lm.brand_name || '').toLowerCase().includes((m.medicine_name || '').toLowerCase()) ||
                    (m.medicine_name || '').toLowerCase().includes((lm.brand_name || '').toLowerCase())
          );
          return {
            id: m.id,
            drug_id: matchedLegacy?.drug_id || `extracted-${m.id}`,
            brand_name: m.corrected_name || m.medicine_name,
            detected_name: m.detected_name,
            corrected_name: m.corrected_name,
            medicine_name: m.corrected_name || m.medicine_name,
            active_ingredient: m.active_ingredient || matchedLegacy?.active_ingredients?.[0]?.molecule || m.medicine_name,
            active_ingredients: matchedLegacy?.active_ingredients || [
              { molecule: m.active_ingredient || m.medicine_name, strength_mg: m.strength }
            ],
            strength: m.strength,
            dosage_form: m.dosage_form,
            dosage_text: m.dosage_text,
            prescribed_frequency: m.dosage_text,
            prescribed_timing: matchedLegacy?.prescribed_timing || 'As advised',
            duration: m.duration || '',
            confidence: m.confidence,
            confidence_level: m.confidence_level,
            match_label: m.match_label,
            requires_user_confirmation: m.requires_user_confirmation,
            verification_status: m.verification_status,
            branded_unit_price: matchedLegacy?.branded_unit_price || 20.0,
            generic_unit_price: matchedLegacy?.generic_unit_price || 3.0,
            savings_percentage: matchedLegacy?.savings_percentage || 80.0,
            generic_alternative: matchedLegacy?.generic_alternative || null
          };
        });
      }

      setCurrentPrescription({
        ...parsedRx,
        prescription_id: uploadResult.prescription_id,
        extracted_text: editableOcrText,
        total_medicines_found: finalMedicines.length,
        has_uncertain_matches: extractionData?.has_uncertain_matches ?? false,
        all_confirmed: extractionData?.all_confirmed ?? false,
        medicines: finalMedicines
      });

      notify(`Extracted ${finalMedicines.length} medicines from ${selectedOcrEngine} output`, 'success');
      setActiveTab('confirmation');
    } catch (err) {
      notify(err.message || 'Medicine extraction failed.', 'error');
    } finally {
      setIsConfirmingOCR(false);
      setScanStep('');
    }
  };

  // Text / Sample prescription helper
  const handleAnalyzePresetOrText = async (text) => {
    setIsScanningOCR(true);
    setScanStep('Parsing clinical prescription text...');
    try {
      await new Promise((r) => setTimeout(r, 600));
      const result = await analyzePrescriptionText(text);
      setCurrentPrescription(result);
      notify(`Extracted ${result.total_medicines_found} medicines from prescription`, 'success');
      setActiveTab('confirmation');
    } catch (err) {
      notify(err.message || 'Prescription analysis failed', 'error');
    } finally {
      setIsScanningOCR(false);
      setScanStep('');
    }
  };

  const presetsList = [
    {
      id: 'default_medical',
      label: 'Standard Medical (Balanced)',
      description: 'Bilateral Denoise + CLAHE + Adaptive Gaussian + Deskew + Close',
      badge: 'Recommended'
    },
    {
      id: 'faint_handwriting',
      label: 'Faint Handwriting (High Contrast)',
      description: 'Median Filter + Strong CLAHE + Sensitive Threshold + Dilate',
      badge: 'Handwriting'
    },
    {
      id: 'low_light_camera',
      label: 'Low-Light Camera Photo',
      description: 'Bilateral + High-Clip CLAHE + Otsu Binarization + Deskew',
      badge: 'Mobile'
    },
    {
      id: 'dense_printed',
      label: 'Dense Printed Prescription',
      description: 'Gaussian Smoothing + Mild CLAHE + Otsu + Morphological Open',
      badge: 'Printed'
    }
  ];

  const samplePresets = [
    {
      title: 'Rx 1: Acute Fever & Acidity Care',
      subtitle: 'Dr. A. Sharma, MD • Clinic Prescription Pad',
      medicines: ['Dolo 650 (Paracetamol 650mg)', 'Pantocid DSR (Pantoprazole + Domperidone)'],
      text: 'Rx\n1. Tab Dolo 650mg - 1-0-1 - 5 days\n2. Cap Pantocid DSR - 1-0-0 - 10 days\nAdv: Warm water, Light diet'
    },
    {
      title: 'Rx 2: Chronic Lifestyle (Hypertension & Diabetes)',
      subtitle: 'Dr. R. Mehta, DM • Cardiac & Endocrinology Care',
      medicines: ['Telma 40 (Telmisartan)', 'Glycomet GP2 (Metformin + Glimepiride)', 'Atorva 10 (Atorvastatin)'],
      text: 'Rx\n1. Tab Telma 40mg - 1-0-0 (Morning) - 30 days\n2. Tab Glycomet GP2 - 1-0-0 (With Breakfast) - 30 days\n3. Tab Atorva 10mg - 0-0-1 (Bedtime) - 30 days\nAdv: Low salt diet, 30 min brisk walk'
    },
    {
      title: 'Rx 3: Respiratory & Allergy Care',
      subtitle: 'Dr. P. Sen, MD • Pulmonology & Chest Medicine',
      medicines: ['Augmentin 625 Duo (Amoxicillin + Clavulanate)', 'Montair-LC (Montelukast + Levocetirizine)'],
      text: 'Rx\n1. Tab Augmentin 625 Duo - 1-0-1 (After food) - 5 days\n2. Tab Montair-LC - 0-0-1 (Night) - 10 days\nAdv: Steam inhalation bd, Avoid cold water'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 pb-16">
      {/* Title & Explainer */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Module 8: Dual OCR Engine & Verification
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Prescription Image Preprocessing & Dual OCR
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          Upload and preprocess your prescription, benchmark PaddleOCR and EasyOCR models side-by-side, inspect confidence scores and processing latencies, and confirm the superior text extraction.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-200/80 p-1 rounded-xl max-w-md mx-auto text-xs font-semibold">
        <button
          onClick={() => setActiveMode('upload')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'upload' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload Image
        </button>
        <button
          onClick={() => setActiveMode('samples')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'samples' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 1-Click Samples
        </button>
        <button
          onClick={() => setActiveMode('text')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeMode === 'text' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Paste Text
        </button>
      </div>

      {/* MODE 1: PROFESSIONAL PRESCRIPTION UPLOAD, PREPROCESSING & DUAL OCR */}
      {activeMode === 'upload' && (
        <div className="space-y-6">
          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={(e) => handleFileSelection(e.target.files?.[0])}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            capture="environment"
            onChange={(e) => handleFileSelection(e.target.files?.[0])}
            className="hidden"
          />

          {/* INITIAL DROP ZONE */}
          {!previewUrl && (
            <div
              onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50/50 shadow-xs'
              }`}
            >
              <div className="space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center shadow-inner">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">
                    Drag & Drop Prescription Image Here
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Supports JPG, JPEG, and PNG formats up to 10MB.
                    Clear, well-lit photos with legible handwriting are recommended.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Browse Image
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-600" />
                    Take Photo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* INITIAL SELECTED FILE PREVIEW & UPLOAD TRIGGER */}
          {previewUrl && uploadStatus !== 'ready_for_ocr' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Selected Prescription Preview
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadStatus === 'uploading' || uploadStatus === 'validating'}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Change Image
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={uploadStatus === 'uploading' || uploadStatus === 'validating'}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Image
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 bg-slate-900/5 rounded-2xl p-3 border border-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Prescription preview"
                    className="max-h-60 rounded-xl object-contain shadow-xs border border-slate-200"
                  />
                </div>

                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-sm text-slate-900 break-all">
                      {selectedFile?.name}
                    </h4>
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded uppercase font-semibold">
                        {selectedFile.type.replace('image/', '') || 'IMAGE'}
                      </span>
                      {imageDimensions && (
                        <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-medium border border-teal-100">
                          {imageDimensions.width} × {imageDimensions.height} px
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      Client Pre-Checks Passed
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Click below to validate readability, resolution, and automatically trigger OpenCV image preprocessing.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleUploadAndValidate}
                    disabled={uploadStatus === 'uploading' || uploadStatus === 'validating'}
                    className="w-full py-3 px-5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {uploadStatus === 'uploading' || uploadStatus === 'validating' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Validating & Uploading Image...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload & Preprocess Prescription
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CLIENT VALIDATION ERROR */}
          {clientValidationError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">File Selection Error: </strong>
                {clientValidationError}
              </div>
            </div>
          )}

          {/* 3-STAGE PROGRESS STATUS */}
          {uploadStatus !== 'idle' && uploadStatus !== 'ready_for_ocr' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Upload & Validation Pipeline
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                    uploadStatus === 'uploading'
                      ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20'
                      : uploadStatus === 'validating'
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {uploadStatus === 'uploading' ? (
                      <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">1. Uploading</div>
                    <div className="text-[11px] text-slate-500">File transfer & integrity</div>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
                    uploadStatus === 'validating'
                      ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20'
                      : uploadStatus === 'error'
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {uploadStatus === 'validating' ? (
                      <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />
                    ) : uploadStatus === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                        2
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">2. Image validation</div>
                    <div className="text-[11px] text-slate-500">Sharpness, blur & size check</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border text-xs flex items-start gap-3 bg-slate-50 border-slate-200 text-slate-400">
                  <div className="shrink-0 mt-0.5">
                    <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400">
                      3
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">3. Ready for OCR</div>
                    <div className="text-[11px] text-slate-500">Stored & queued for extraction</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ERROR CALLOUT */}
          {uploadStatus === 'error' && backendError && (
            <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-rose-900">
                    Prescription Image Validation Failed
                  </h4>
                  <p className="text-xs text-rose-700 leading-relaxed font-medium">
                    {backendError}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-rose-200/60 text-xs text-rose-800 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  Tips for Clear Prescription Photos:
                </div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 text-rose-700 pl-1">
                  <li>Place the paper flat under adequate natural or overhead lighting.</li>
                  <li>Hold your smartphone camera steady directly above the prescription.</li>
                  <li>Ensure doctor's handwriting and drug names are sharp and not blurry.</li>
                  <li>Ensure the image resolution is at least 250 × 250 pixels.</li>
                </ul>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors"
                >
                  Upload Clearer Photo
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* SECTION 1: SIDE-BY-SIDE ORIGINAL VS PREPROCESSED IMAGE         */}
          {/* ============================================================== */}
          {uploadStatus === 'ready_for_ocr' && uploadResult && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
              
              {/* Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900">
                        Prescription Pipeline: Quality Enhanced
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                        8-Stage OpenCV Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      ID: {uploadResult.prescription_id} • File: {uploadResult.filename}
                    </p>
                  </div>
                </div>

                {/* Action Buttons: Run TrOCR | Run All OCR Models | Compare Results */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={handleRunTrOCR}
                    disabled={isScanningOCR}
                    className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                    title="Run Hugging Face TrOCR handwriting Vision Transformer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run TrOCR</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRunAllOCRModels}
                    disabled={isScanningOCR}
                    className="py-2.5 px-4 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                    title="Benchmark TrOCR, PaddleOCR, EasyOCR, and Tesseract side-by-side"
                  >
                    <Layers className="w-4 h-4 text-teal-200" />
                    <span>Run All OCR Models</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCompareResultsClick}
                    disabled={isScanningOCR}
                    className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm border border-slate-200 transition-all flex items-center gap-1.5"
                    title="Compare OCR engine outputs side-by-side"
                  >
                    <Cpu className="w-4 h-4 text-teal-600" />
                    <span>Compare Results</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-2.5 text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                    title="Upload another prescription"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Side-by-Side Dual Image Comparison */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-teal-600" />
                    Comparative Visual Inspection (Original vs Preprocessed)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Original image is strictly preserved and never overwritten
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Original Image */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span className="font-bold text-xs text-slate-800">Original Image</span>
                      </div>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                        Raw Input
                      </span>
                    </div>

                    <div className="h-64 bg-slate-900/5 rounded-xl border border-slate-200 flex items-center justify-center p-2 overflow-hidden">
                      <img
                        src={previewUrl}
                        alt="Original doctor prescription"
                        className="max-h-full max-w-full object-contain rounded-lg shadow-xs"
                      />
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                      <span>Dimensions: {imageDimensions ? `${imageDimensions.width} × ${imageDimensions.height} px` : 'Natural'}</span>
                      <span>Format: {selectedFile?.type.replace('image/', '').toUpperCase() || 'PNG'}</span>
                    </div>
                  </div>

                  {/* Right Column: Preprocessed Image */}
                  <div className="bg-teal-50/40 rounded-2xl border border-teal-200 p-4 space-y-3 flex flex-col justify-between">
                    <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                        <span className="font-bold text-xs text-teal-900">Preprocessed Image</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {preprocessingData?.metrics?.execution_time_ms && (
                          <span className="text-[10px] font-mono bg-teal-100 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                            {preprocessingData.metrics.execution_time_ms} ms
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase bg-teal-600 text-white px-2 py-0.5 rounded">
                          Enhanced
                        </span>
                      </div>
                    </div>

                    <div className="h-64 bg-white rounded-xl border border-teal-200 flex items-center justify-center p-2 overflow-hidden relative">
                      {isPreprocessing ? (
                        <div className="text-center space-y-2">
                          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                          <p className="text-xs text-slate-600 font-medium">Applying 8-Stage OpenCV Pipeline...</p>
                        </div>
                      ) : preprocessingData?.base64_preprocessed ? (
                        <img
                          src={preprocessingData.base64_preprocessed}
                          alt="OpenCV preprocessed prescription"
                          className="max-h-full max-w-full object-contain rounded-lg shadow-xs"
                        />
                      ) : (
                        <div className="text-center text-xs text-slate-400">
                          Preprocessed preview unavailable
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-teal-800 flex items-center justify-between pt-1">
                      <span>
                        Resized: {preprocessingData?.metrics?.preprocessed_dimensions?.width || '—'} × {preprocessingData?.metrics?.preprocessed_dimensions?.height || '—'} px
                      </span>
                      <span>
                        Tilt: {preprocessingData?.metrics?.skew_angle !== undefined ? `${preprocessingData.metrics.skew_angle}°` : '0°'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8-Stage Pipeline Visualization Chips */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Executed Pipeline Stages:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    '1. Resize',
                    '2. Grayscale',
                    '3. Noise Reduction',
                    '4. Contrast (CLAHE)',
                    '5. Adaptive Thresholding',
                    '6. Deskew',
                    '7. Morphological Processing',
                    '8. Preprocessed Image'
                  ].map((st, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium flex items-center gap-1.5 text-[11px]"
                    >
                      <Check className="w-3 h-3 text-emerald-600 font-bold" />
                      {st}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modular Experimental Preset Selector */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-teal-600" />
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                      Compare Preprocessing Configurations (Experimental)
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Test different OpenCV filter combinations before OCR execution
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {presetsList.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => runPreprocessing(uploadResult.prescription_id, preset.id)}
                      disabled={isPreprocessing}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                        activePreset === preset.id
                          ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                          : 'bg-white/60 border-slate-200 hover:border-teal-300 hover:bg-white text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-slate-900">{preset.label}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            activePreset === preset.id ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {preset.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      {activePreset === preset.id && (
                        <div className="text-[10px] font-bold text-teal-600 flex items-center gap-1 pt-1 border-t border-slate-100">
                          <Check className="w-3 h-3" /> Active Configuration
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* ============================================================== */}
              {/* SECTION 2: 4-ENGINE OCR BENCHMARK & RESEARCH EVALUATION        */}
              {/* ============================================================== */}
              {(multiOcrResult || ocrComparisonResult) && (() => {
                // Unified engines list across TrOCR, PaddleOCR, EasyOCR, Tesseract
                const enginesList = multiOcrResult?.engines || [
                  ...(ocrComparisonResult?.paddle_result ? [{
                    engine: 'PaddleOCR',
                    model_type: 'Deep Learning (PP-OCRv4)',
                    specialty: 'Directional Printed Text & Layout',
                    recognized_text: ocrComparisonResult.paddle_result.detected_text,
                    confidence_percentage: ocrComparisonResult.paddle_result.confidence_percentage,
                    confidence: ocrComparisonResult.paddle_result.confidence_score,
                    processing_time_ms: ocrComparisonResult.paddle_result.processing_time_ms,
                    status: 'success'
                  }] : []),
                  ...(ocrComparisonResult?.easy_result ? [{
                    engine: 'EasyOCR',
                    model_type: 'PyTorch (CRAFT + CRNN)',
                    specialty: 'Character Region & Scene Text',
                    recognized_text: ocrComparisonResult.easy_result.detected_text,
                    confidence_percentage: ocrComparisonResult.easy_result.confidence_percentage,
                    confidence: ocrComparisonResult.easy_result.confidence_score,
                    processing_time_ms: ocrComparisonResult.easy_result.processing_time_ms,
                    status: 'success'
                  }] : [])
                ];

                const isLowConfidence =
                  enginesList.some((e) => e.confidence_percentage !== null && e.confidence_percentage !== undefined && e.confidence_percentage < 70) ||
                  ocrComparisonResult?.is_low_confidence;

                // Research evaluation best performers
                const bestCerEval = evaluationResults && evaluationResults.length > 0
                  ? [...evaluationResults].sort((a, b) => a.cer - b.cer)[0]
                  : null;
                const fastestEval = evaluationResults && evaluationResults.length > 0
                  ? [...evaluationResults].sort((a, b) => a.processing_time_ms - b.processing_time_ms)[0]
                  : null;

                return (
                  <div ref={comparisonSectionRef} className="pt-6 border-t border-slate-200 space-y-8 animate-in fade-in">
                    
                    {/* OCR Comparative Header & Stats */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-teal-50 via-slate-50 to-blue-50/50 p-5 rounded-2xl border border-teal-100 shadow-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-5 h-5 text-teal-700" />
                          <h4 className="font-extrabold text-base text-slate-900">
                            Multi-Engine OCR Benchmark & Comparison
                          </h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                            {enginesList.length} Models Active
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 max-w-2xl">
                          Side-by-side benchmarking of TrOCR (Vision Transformer), PaddleOCR (PP-OCRv4), EasyOCR (CRAFT), and Tesseract. Select the superior transcription to feed downstream active ingredient matching.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-medium shadow-xs">
                          Active Choice: <strong className="text-teal-700 font-extrabold">{selectedOcrEngine}</strong>
                        </span>
                        {ocrComparisonResult?.comparison?.recommended_engine && (
                          <span className="bg-teal-600 text-white px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xs">
                            <Award className="w-3.5 h-3.5" />
                            Recommended: {ocrComparisonResult.comparison.recommended_engine}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* LOW CONFIDENCE ALERT BANNER (If confidence < 70%) */}
                    {isLowConfidence && (
                      <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 flex items-start gap-3 shadow-xs">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <strong className="font-extrabold text-sm block text-amber-950">
                            Low OCR confidence. Please verify the extracted medicine details.
                          </strong>
                          <p className="text-xs text-amber-800 leading-relaxed font-medium">
                            Handwriting irregularity, illumination noise, or non-standard fonts caused one or more engines to score below 70% confidence. Uncertain results are never silently merged or substituted. Please inspect the recognized text and edit any discrepancies below.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ============================================================== */}
                    {/* COMPARISON TABLE (Exact OCR Engine vs Recognized Text)         */}
                    {/* ============================================================== */}
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="font-extrabold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-teal-600" />
                          <span>Comparative OCR Engines Overview</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Click any engine row or card to populate the verified review box
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-100/70 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                              <th className="py-3 px-4 w-44">OCR Engine</th>
                              <th className="py-3 px-3 w-48">Model Architecture</th>
                              <th className="py-3 px-3 w-28">Confidence</th>
                              <th className="py-3 px-3 w-24">Latency</th>
                              <th className="py-3 px-4">Recognized Text Preview</th>
                              <th className="py-3 px-4 text-right w-36">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans">
                            {enginesList.map((item) => {
                              const isSelected = selectedOcrEngine === item.engine;
                              return (
                                <tr
                                  key={item.engine}
                                  onClick={() => handleSelectEngine(item.engine)}
                                  className={`cursor-pointer transition-colors ${
                                    isSelected
                                      ? 'bg-teal-50/80 font-medium'
                                      : 'hover:bg-slate-50/80'
                                  }`}
                                >
                                  <td className="py-3 px-4 font-extrabold text-slate-900 flex items-center gap-2">
                                    <span
                                      className={`w-2.5 h-2.5 rounded-full ${
                                        isSelected ? 'bg-teal-600 ring-2 ring-teal-200' : 'bg-slate-300'
                                      }`}
                                    />
                                    <span>{item.engine}</span>
                                    {item.engine === 'TrOCR' && (
                                      <span className="text-[9px] font-bold uppercase bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded border border-purple-200">
                                        HF Vision
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-slate-600 text-[11px]">
                                    <div className="font-semibold text-slate-800">{item.model_type || 'Optical Recognizer'}</div>
                                    <div className="text-[10px] text-slate-400">{item.specialty || 'General Text'}</div>
                                  </td>
                                  <td className="py-3 px-3">
                                    {item.confidence_percentage !== null && item.confidence_percentage !== undefined ? (
                                      <span
                                        className={`font-bold px-2 py-0.5 rounded-full text-[11px] border ${
                                          item.confidence_percentage >= 70
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                            : 'bg-amber-100 text-amber-800 border-amber-200'
                                        }`}
                                      >
                                        {item.confidence_percentage}%
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200" title="Beam token generation does not fabricate pseudo-confidence">
                                        Beam Search
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                                    {item.processing_time_ms ? `${item.processing_time_ms} ms` : '—'}
                                  </td>
                                  <td className="py-3 px-4 font-mono text-slate-800 text-[11px] max-w-md truncate">
                                    {item.recognized_text ? item.recognized_text.replace(/\n/g, ' ↵ ') : '—'}
                                  </td>
                                  <td className="py-3 px-4 text-right">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelectEngine(item.engine);
                                      }}
                                      className={`py-1 px-3 rounded-lg text-[11px] font-bold transition-all ${
                                        isSelected
                                          ? 'bg-teal-600 text-white shadow-xs'
                                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                      }`}
                                    >
                                      {isSelected ? '✓ Selected' : 'Select'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ============================================================== */}
                    {/* ENGINE CARDS GRID (Deep Inspection & Raw Preview)              */}
                    {/* ============================================================== */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {enginesList.map((item) => {
                        const isSelected = selectedOcrEngine === item.engine;
                        return (
                          <div
                            key={item.engine}
                            onClick={() => handleSelectEngine(item.engine)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                              isSelected
                                ? 'bg-white border-teal-500 ring-2 ring-teal-500/25 shadow-md'
                                : 'bg-slate-50/80 border-slate-200 hover:border-teal-300 hover:bg-white'
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div>
                                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                                    <span>{item.engine}</span>
                                    {item.engine === 'TrOCR' && (
                                      <span className="text-[10px] font-normal text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                                        HF Vision Transformer
                                      </span>
                                    )}
                                    {item.engine === 'PaddleOCR' && (
                                      <span className="text-[10px] font-normal text-slate-500">(PP-OCRv4)</span>
                                    )}
                                    {item.engine === 'EasyOCR' && (
                                      <span className="text-[10px] font-normal text-slate-500">(CRAFT + CRNN)</span>
                                    )}
                                    {item.engine === 'Tesseract' && (
                                      <span className="text-[10px] font-normal text-slate-500">(LSTM)</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    {item.specialty || item.model_type}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {item.confidence_percentage !== null && item.confidence_percentage !== undefined ? (
                                    <span
                                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                                        item.confidence_percentage >= 70
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                          : 'bg-amber-100 text-amber-800 border-amber-200'
                                      }`}
                                    >
                                      {item.confidence_percentage}% Conf
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                      Encoder-Decoder Beam
                                    </span>
                                  )}

                                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {item.processing_time_ms ? `${item.processing_time_ms} ms` : '—'}
                                  </span>
                                </div>
                              </div>

                              {/* Text Preview Monospace Box */}
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                  Detected Text:
                                </span>
                                <div className="bg-slate-900 text-slate-100 p-3 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto border border-slate-800">
                                  {item.recognized_text || <span className="text-slate-500 italic">No text recognized</span>}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectEngine(item.engine);
                              }}
                              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? 'bg-teal-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="w-3.5 h-3.5 font-bold" />
                                  Selected for Molecule Extraction
                                </>
                              ) : (
                                `Select ${item.engine} Result`
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* ============================================================== */}
                    {/* CONFIRMED TEXT REVIEW & EDITABLE CORRECTION AREA               */}
                    {/* ============================================================== */}
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-teal-600" />
                          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                            Review & Verify OCR Text (Active Engine: {selectedOcrEngine})
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          Edit doctor notes or dosage strengths before running active molecule extraction
                        </span>
                      </div>

                      <textarea
                        rows={5}
                        value={editableOcrText}
                        onChange={(e) => setEditableOcrText(e.target.value)}
                        placeholder="Verified clinical transcript will appear here..."
                        className="w-full p-3.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 bg-white"
                      />

                      {/* Confirmation and Downstream Molecule Extraction */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <span className="text-[11px] text-slate-500">
                          GenericSwap enforces physician verification: OCR results never directly trigger medicine substitutions.
                        </span>

                        <button
                          type="button"
                          onClick={handleConfirmAndExtractMedicines}
                          disabled={isConfirmingOCR || !editableOcrText.trim()}
                          className="py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {isConfirmingOCR ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Extracting Active Molecules...
                            </>
                          ) : (
                            <>
                              <span>Confirm & Extract Medicines</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ============================================================== */}
                    {/* SECTION 3: RESEARCH EVALUATION BENCHMARK SUITE (CER / WER)     */}
                    {/* ============================================================== */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-slate-800">
                      
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" />
                            <h4 className="font-extrabold text-base text-white">
                              OCR Research Evaluation & Clinical Benchmark Suite
                            </h4>
                          </div>
                          <p className="text-xs text-slate-300 max-w-2xl">
                            Empirically assess recognition accuracy against ground truth. Calculates exact Character Error Rate (CER), Word Error Rate (WER), Latency, and Medicine Extraction Accuracy. Results are logged to the database for clinical auditing.
                          </p>
                        </div>

                        <span className="text-[10px] font-mono bg-slate-800 text-teal-300 px-3 py-1 rounded-full border border-slate-700">
                          SQLite: ocr_evaluations
                        </span>
                      </div>

                      {/* Ground Truth Input Box */}
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-teal-400" />
                            Ground-Truth Prescription Transcription:
                          </label>

                          {/* Quick Sample Presets */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">Load Preset:</span>
                            <button
                              type="button"
                              onClick={() => setGroundTruthText('Rx\n1. Tab Dolo 650mg - 1-0-1 - 5 days\n2. Cap Pantocid DSR - 1-0-0 - 10 days\n3. Tab Augmentin 625 Duo - 1-0-1')}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 border border-slate-700 transition-colors"
                            >
                              Standard Rx
                            </button>
                            <button
                              type="button"
                              onClick={() => setGroundTruthText('Paracetamol 650 mg tab 1-0-1')}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 border border-slate-700 transition-colors"
                            >
                              Paracetamol Single
                            </button>
                            <button
                              type="button"
                              onClick={() => setGroundTruthText('1. Tab Telma 40mg - 1-0-0\n2. Tab Atorva 10mg - 0-0-1')}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-medium text-slate-300 border border-slate-700 transition-colors"
                            >
                              Cardio Rx
                            </button>
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          value={groundTruthText}
                          onChange={(e) => setGroundTruthText(e.target.value)}
                          placeholder="Paste verified ground-truth clinical text for this prescription..."
                          className="w-full p-3.5 rounded-xl border border-slate-700 bg-slate-800/80 text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <span className="text-[11px] text-slate-400">
                            Mathematical formulation: \(\text{CER} = \frac{S_c + D_c + I_c}{N_c}\), \(\text{WER} = \frac{S_w + D_w + I_w}{N_w}\)
                          </span>

                          <button
                            type="button"
                            onClick={handleEvaluateResearch}
                            disabled={isEvaluating || !groundTruthText.trim()}
                            className="py-2.5 px-5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {isEvaluating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                                <span>Evaluating Models...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 text-slate-950 font-bold" />
                                <span>Evaluate Models (Calculate CER / WER)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* EVALUATION RESULTS DASHBOARD */}
                      {evaluationResults && evaluationResults.length > 0 && (
                        <div className="pt-4 border-t border-slate-800 space-y-5 animate-in fade-in">
                          
                          {/* KPI Highlight Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-emerald-500/40 space-y-1">
                              <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5" />
                                Lowest CER (Best Accuracy)
                              </div>
                              <div className="text-base font-extrabold text-white">
                                {bestCerEval?.engine_name || 'N/A'}
                              </div>
                              <div className="text-[11px] text-emerald-300 font-mono">
                                CER: {bestCerEval?.cer !== undefined ? `${(bestCerEval.cer * 100).toFixed(2)}%` : '—'}
                              </div>
                            </div>

                            <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-teal-500/40 space-y-1">
                              <div className="text-[10px] uppercase font-bold text-teal-400 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Fastest Processing Engine
                              </div>
                              <div className="text-base font-extrabold text-white">
                                {fastestEval?.engine_name || 'N/A'}
                              </div>
                              <div className="text-[11px] text-teal-300 font-mono">
                                Latency: {fastestEval?.processing_time_ms ? `${fastestEval.processing_time_ms} ms` : '—'}
                              </div>
                            </div>

                            <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1">
                              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                Evaluated Engines
                              </div>
                              <div className="text-base font-extrabold text-white">
                                {evaluationResults.length} Models
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">
                                Stored in DB table
                              </div>
                            </div>
                          </div>

                          {/* Scientific Metrics Table */}
                          <div className="bg-slate-800/50 rounded-2xl border border-slate-700/80 overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse font-sans">
                                <thead>
                                  <tr className="border-b border-slate-700 bg-slate-800/90 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                                    <th className="py-3 px-4">OCR Engine</th>
                                    <th className="py-3 px-3">CER (%)</th>
                                    <th className="py-3 px-3">WER (%)</th>
                                    <th className="py-3 px-3">Character Accuracy</th>
                                    <th className="py-3 px-3">Latency</th>
                                    <th className="py-3 px-3">Medicine Accuracy</th>
                                    <th className="py-3 px-4">Research Assessment</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/60 font-sans">
                                  {evaluationResults.map((ev) => {
                                    const cerPct = (ev.cer * 100).toFixed(2);
                                    const werPct = (ev.wer * 100).toFixed(2);
                                    const accPct = (ev.accuracy * 100).toFixed(2);
                                    const medAccPct = ev.medicine_recognition_accuracy !== undefined && ev.medicine_recognition_accuracy !== null
                                      ? `${(ev.medicine_recognition_accuracy * 100).toFixed(1)}%`
                                      : '—';
                                    const isBestCer = bestCerEval?.engine_name === ev.engine_name;

                                    return (
                                      <tr key={ev.engine_name} className="hover:bg-slate-800/80 transition-colors">
                                        <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                                          <span>{ev.engine_name}</span>
                                          {isBestCer && (
                                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold uppercase">
                                              Best CER
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3 px-3 font-mono font-bold">
                                          <span
                                            className={`px-2 py-0.5 rounded text-[11px] ${
                                              ev.cer <= 0.15
                                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                                : ev.cer <= 0.35
                                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                            }`}
                                          >
                                            {cerPct}%
                                          </span>
                                        </td>
                                        <td className="py-3 px-3 font-mono text-slate-300">
                                          {werPct}%
                                        </td>
                                        <td className="py-3 px-3 font-mono text-emerald-400 font-semibold">
                                          {accPct}%
                                        </td>
                                        <td className="py-3 px-3 font-mono text-slate-300">
                                          {ev.processing_time_ms ? `${ev.processing_time_ms} ms` : '—'}
                                        </td>
                                        <td className="py-3 px-3 font-mono text-teal-300 font-bold">
                                          {medAccPct}
                                        </td>
                                        <td className="py-3 px-4 text-[11px] text-slate-300">
                                          {ev.engine_name === 'TrOCR' && 'High robustness for cursive handwriting strokes'}
                                          {ev.engine_name === 'PaddleOCR' && 'Superior directional detection on printed clinic headers'}
                                          {ev.engine_name === 'EasyOCR' && 'Effective region bounding box recall on scene text'}
                                          {ev.engine_name === 'Tesseract' && 'Standard OCR baseline for crisp printed fonts'}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              Evaluation metrics automatically stored in database (<code>ocr_evaluations</code> table) linked to prescription #{uploadResult?.prescription_id}.
                            </span>
                          </div>

                        </div>
                      )}

                    </div>

                  </div>
                );
              })()}

            </div>
          )}

        </div>
      )}

      {/* MODE 2: 1-CLICK CLINIC SAMPLE PRESETS */}
      {activeMode === 'samples' && (
        <div className="space-y-4">
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong>Instant Evaluation Presets:</strong> Test the active molecule matching and price comparisons immediately without searching for local prescription photos.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {samplePresets.map((preset, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded w-fit">
                    Preset {idx + 1}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{preset.title}</h4>
                  <div className="text-[11px] text-slate-400">{preset.subtitle}</div>

                  <div className="space-y-1 pt-2">
                    <div className="text-[11px] font-semibold text-slate-600">Prescribed:</div>
                    {preset.medicines.map((med, mIdx) => (
                      <div key={mIdx} className="text-xs bg-slate-50 text-slate-700 p-1.5 rounded-lg border border-slate-100 font-medium">
                        • {med}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleAnalyzePresetOrText(preset.text)}
                  disabled={isScanningOCR}
                  className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  Analyze This Prescription
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3: MANUAL TEXT INPUT */}
      {activeMode === 'text' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Prescription Clinical Text / Handwritten Transcript
            </label>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste doctor notes, e.g.&#10;Rx&#10;1. Tab Dolo 650mg - 1-0-1 - 5 days&#10;2. Cap Pantocid DSR - 1-0-0 - 10 days"
              className="w-full p-3.5 rounded-xl border border-slate-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <button
            onClick={() => handleAnalyzePresetOrText(rawText)}
            disabled={!rawText.trim() || isScanningOCR}
            className="w-full py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isScanningOCR ? scanStep : 'Parse Prescription Text'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* OCR PROGRESS OVERLAY */}
      {isScanningOCR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-3xl max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center relative overflow-hidden">
              <Cpu className="w-8 h-8 text-teal-600 animate-pulse" />
              <div className="ocr-scan-line" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">Running OCR Models</h3>
              <p className="text-xs text-teal-700 font-medium animate-pulse">{scanStep}</p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
