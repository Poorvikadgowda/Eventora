import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import {
  CheckCircle2,
  Edit2,
  Trash2,
  Plus,
  ArrowRight,
  AlertTriangle,
  Pill,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  ShieldCheck,
  Clock,
  HelpCircle,
  Lock,
  Unlock,
  AlertCircle,
  CheckCheck
} from 'lucide-react';
import { savePrescription, confirmExtractedMedicines } from '../../services/api';

export const ExtractedConfirmation = () => {
  const {
    currentPrescription,
    setCurrentPrescription,
    setActiveTab,
    patientHistory,
    user,
    notify
  } = useApp();

  // Normalize initial medicines list from currentPrescription
  const [medicines, setMedicines] = useState(() => {
    if (currentPrescription?.medicines && currentPrescription.medicines.length > 0) {
      return currentPrescription.medicines.map((m, idx) => ({
        id: m.id || `ext-${idx}-${Date.now()}`,
        drug_id: m.drug_id || `drug-${idx}`,
        brand_name: m.brand_name || m.medicine_name || m.corrected_name || 'Prescribed Medicine',
        medicine_name: m.medicine_name || m.corrected_name || m.brand_name || 'Prescribed Medicine',
        detected_name: m.detected_name || m.brand_name || '',
        corrected_name: m.corrected_name || m.medicine_name || m.brand_name || '',
        active_ingredient: m.active_ingredient || (m.active_ingredients || [])[0]?.molecule || '',
        active_ingredients: m.active_ingredients || [
          { molecule: m.active_ingredient || m.medicine_name || 'Active Salt', strength_mg: m.strength || '650mg' }
        ],
        strength: m.strength || '',
        dosage_form: m.dosage_form || 'Tablet',
        dosage_text: m.dosage_text || m.prescribed_frequency || '1-0-1',
        prescribed_frequency: m.dosage_text || m.prescribed_frequency || '1-0-1',
        prescribed_timing: m.prescribed_timing || 'After food',
        duration: m.duration || '',
        confidence: typeof m.confidence === 'number' ? m.confidence : 0.95,
        confidence_level: m.confidence_level || (m.confidence < 0.85 ? 'LOW' : 'HIGH'),
        match_label: m.match_label || (m.confidence < 0.85 ? 'Possible medicine match' : 'Verified Registry Match'),
        requires_user_confirmation: m.requires_user_confirmation !== undefined
          ? m.requires_user_confirmation
          : (m.confidence < 0.85 || m.verification_status !== 'CONFIRMED'),
        verification_status: m.verification_status || (m.confidence < 0.85 ? 'POSSIBLE_MATCH' : 'AUTO_MATCHED'),
        branded_unit_price: m.branded_unit_price || 20.0,
        generic_unit_price: m.generic_unit_price || 3.0,
        savings_percentage: m.savings_percentage || 80.0,
        generic_alternative: m.generic_alternative || null
      }));
    }
    return [
      {
        id: 'dolo-650-default',
        drug_id: 'dolo-650',
        brand_name: 'Paracetamol',
        medicine_name: 'Paracetamol',
        detected_name: 'Paracetmol',
        corrected_name: 'Paracetamol',
        active_ingredient: 'Paracetamol',
        active_ingredients: [{ molecule: 'Paracetamol', strength_mg: '650 mg' }],
        strength: '650 mg',
        dosage_form: 'Tablet',
        dosage_text: '1-0-1',
        prescribed_frequency: '1-0-1',
        prescribed_timing: 'After food',
        duration: '5 days',
        confidence: 0.952,
        confidence_level: 'HIGH',
        match_label: 'Verified Registry Match',
        requires_user_confirmation: false,
        verification_status: 'CONFIRMED',
        branded_unit_price: 3.2,
        generic_unit_price: 0.95,
        savings_percentage: 70.3
      }
    ];
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize when currentPrescription changes
  useEffect(() => {
    if (currentPrescription?.medicines && currentPrescription.medicines.length > 0) {
      setMedicines(
        currentPrescription.medicines.map((m, idx) => ({
          id: m.id || `ext-${idx}-${Date.now()}`,
          drug_id: m.drug_id || `drug-${idx}`,
          brand_name: m.brand_name || m.medicine_name || m.corrected_name || 'Prescribed Medicine',
          medicine_name: m.medicine_name || m.corrected_name || m.brand_name || 'Prescribed Medicine',
          detected_name: m.detected_name || m.brand_name || '',
          corrected_name: m.corrected_name || m.medicine_name || m.brand_name || '',
          active_ingredient: m.active_ingredient || (m.active_ingredients || [])[0]?.molecule || '',
          active_ingredients: m.active_ingredients || [
            { molecule: m.active_ingredient || m.medicine_name || 'Active Salt', strength_mg: m.strength || '650mg' }
          ],
          strength: m.strength || '',
          dosage_form: m.dosage_form || 'Tablet',
          dosage_text: m.dosage_text || m.prescribed_frequency || '1-0-1',
          prescribed_frequency: m.dosage_text || m.prescribed_frequency || '1-0-1',
          prescribed_timing: m.prescribed_timing || 'After food',
          duration: m.duration || '',
          confidence: typeof m.confidence === 'number' ? m.confidence : 0.95,
          confidence_level: m.confidence_level || (m.confidence < 0.85 ? 'LOW' : 'HIGH'),
          match_label: m.match_label || (m.confidence < 0.85 ? 'Possible medicine match' : 'Verified Registry Match'),
          requires_user_confirmation: m.requires_user_confirmation !== undefined
            ? m.requires_user_confirmation
            : (m.confidence < 0.85 || m.verification_status !== 'CONFIRMED'),
          verification_status: m.verification_status || (m.confidence < 0.85 ? 'POSSIBLE_MATCH' : 'AUTO_MATCHED'),
          branded_unit_price: m.branded_unit_price || 20.0,
          generic_unit_price: m.generic_unit_price || 3.0,
          savings_percentage: m.savings_percentage || 80.0,
          generic_alternative: m.generic_alternative || null
        }))
      );
    }
  }, [currentPrescription]);

  // Check for allergy contraindications
  const allergyAlerts = [];
  if (patientHistory?.drug_allergies) {
    patientHistory.drug_allergies.forEach((allergy) => {
      const allergyLower = allergy.toLowerCase();
      medicines.forEach((med) => {
        const brandLower = (med.medicine_name || med.brand_name || '').toLowerCase();
        const moleculeStr = (med.active_ingredients || [])
          .map((i) => i.molecule)
          .join(' ')
          .toLowerCase();

        if (
          (allergyLower.includes('penicillin') && (brandLower.includes('augmentin') || moleculeStr.includes('amoxicillin'))) ||
          (allergyLower.includes('nsaid') && (brandLower.includes('combiflam') || moleculeStr.includes('ibuprofen')))
        ) {
          allergyAlerts.push({
            medicine: med.medicine_name || med.brand_name,
            allergy,
            message: `CRITICAL ALLERGY ALERT: Patient is allergic to ${allergy}. "${med.medicine_name || med.brand_name}" contains related active ingredients.`
          });
        }
      });
    });
  }

  // Count items that still require confirmation
  const unconfirmedItems = medicines.filter(
    (m) => m.requires_user_confirmation || m.verification_status !== 'CONFIRMED' || !m.medicine_name.trim() || !m.strength.trim()
  );

  const hasUncertainMatches = medicines.some((m) => m.confidence < 0.85 || m.verification_status === 'POSSIBLE_MATCH');

  // Handle inline edits
  const handleUpdateField = (index, field, value) => {
    setValidationError('');
    const updated = [...medicines];
    updated[index][field] = value;

    if (field === 'medicine_name') {
      updated[index].brand_name = value;
      updated[index].corrected_name = value;
    }
    if (field === 'dosage_text') {
      updated[index].prescribed_frequency = value;
    }
    if (field === 'active_ingredient') {
      updated[index].active_ingredients = [{ molecule: value, strength_mg: updated[index].strength }];
    }

    setMedicines(updated);
  };

  // Toggle user confirmation for an individual item
  const handleConfirmItem = (index) => {
    const med = medicines[index];
    if (!med.medicine_name.trim()) {
      setValidationError(`Medicine #${index + 1}: Medicine name cannot be empty.`);
      notify('Medicine name cannot be empty.', 'warning');
      return;
    }
    if (!med.strength.trim()) {
      setValidationError(`Medicine #${index + 1}: Strength cannot be empty (e.g. 650 mg).`);
      notify('Strength cannot be empty.', 'warning');
      return;
    }

    const updated = [...medicines];
    updated[index].requires_user_confirmation = false;
    updated[index].verification_status = 'CONFIRMED';
    updated[index].confidence = 1.0;
    updated[index].confidence_level = 'HIGH';
    updated[index].match_label = 'User Confirmed';
    setMedicines(updated);
    setValidationError('');
    notify(`Confirmed: "${med.medicine_name}" (${med.strength})`, 'success');
  };

  // Confirm all medicines at once
  const handleConfirmAll = () => {
    for (let i = 0; i < medicines.length; i++) {
      const med = medicines[i];
      if (!med.medicine_name.trim()) {
        setValidationError(`Medicine #${i + 1} has an empty medicine name. Please provide an identity before confirming.`);
        notify(`Medicine #${i + 1} has an empty medicine name.`, 'warning');
        return;
      }
      if (!med.strength.trim()) {
        setValidationError(`Medicine "${med.medicine_name}" has an empty strength. Please specify strength (e.g. 650 mg).`);
        notify(`Medicine "${med.medicine_name}" has an empty strength.`, 'warning');
        return;
      }
    }

    const updated = medicines.map((m) => ({
      ...m,
      requires_user_confirmation: false,
      verification_status: 'CONFIRMED',
      confidence: 1.0,
      confidence_level: 'HIGH',
      match_label: 'User Confirmed'
    }));
    setMedicines(updated);
    setValidationError('');
    notify('All medicines verified and confirmed.', 'success');
  };

  const handleDeleteRow = (index) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
    if (editingIndex === index) {
      setEditingIndex(null);
    }
    notify('Removed medicine item', 'info');
  };

  const handleAddMedicine = () => {
    const newMed = {
      id: 'custom-' + Date.now(),
      drug_id: 'custom-' + Date.now(),
      brand_name: 'New Medicine',
      medicine_name: 'New Medicine',
      detected_name: 'Manual Entry',
      corrected_name: 'New Medicine',
      active_ingredient: 'Active Ingredient',
      active_ingredients: [{ molecule: 'Active Salt', strength_mg: '500 mg' }],
      strength: '500 mg',
      dosage_form: 'Tablet',
      dosage_text: '1-0-1',
      prescribed_frequency: '1-0-1',
      prescribed_timing: 'After food',
      duration: '5 days',
      confidence: 1.0,
      confidence_level: 'HIGH',
      match_label: 'Manual Entry',
      requires_user_confirmation: false,
      verification_status: 'CONFIRMED',
      branded_unit_price: 15.0,
      generic_unit_price: 2.5,
      savings_percentage: 83.3,
      generic_alternative: {
        generic_name: 'Generic Equivalent 500mg',
        pmbjp_drug_code: 'PMBJP-GEN',
        jan_aushadhi_unit_price: 2.5,
        manufacturer: 'Jan Aushadhi (BPPI)',
        cdsco_approved: true
      }
    };
    setMedicines([...medicines, newMed]);
    setEditingIndex(medicines.length);
  };

  // Enforce Safety Guard before Generic Matching
  const handleProceedToGenericMatching = async () => {
    setValidationError('');

    if (medicines.length === 0) {
      setValidationError('At least one medicine is required to perform generic matching.');
      notify('Prescription has no medicines.', 'error');
      return;
    }

    // 1. Verify every medicine has non-empty identity and strength
    for (let i = 0; i < medicines.length; i++) {
      const med = medicines[i];
      if (!med.medicine_name.trim()) {
        setValidationError(`Medicine #${i + 1} is missing a medicine name. Identity must be confirmed before generic matching.`);
        notify(`Medicine #${i + 1}: Medicine name is missing.`, 'error');
        return;
      }
      if (!med.strength.trim()) {
        setValidationError(`Medicine "${med.medicine_name}" is missing strength (e.g. 650 mg). Strength must be confirmed.`);
        notify(`"${med.medicine_name}": Strength is missing.`, 'error');
        return;
      }
    }

    // 2. Clinical Safety Guard: Require all uncertain matches to be confirmed
    if (unconfirmedItems.length > 0) {
      setValidationError(
        `Action Required: ${unconfirmedItems.length} medicine(s) require confirmation before generic matching. Please review and confirm the items labeled "Possible medicine match" or unverified.`
      );
      notify('Please confirm all medicine identities and strengths first.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      // 3. Persist confirmed medicines to backend SQLite EXTRACTED_MEDICINES table
      const prescriptionId = currentPrescription?.prescription_id || currentPrescription?.id;
      if (prescriptionId) {
        const payload = medicines.map((m) => ({
          id: m.id,
          medicine_name: m.medicine_name.trim(),
          active_ingredient: m.active_ingredient?.trim() || m.medicine_name.trim(),
          strength: m.strength.trim(),
          dosage_form: m.dosage_form || 'Tablet',
          dosage_text: m.dosage_text || m.prescribed_frequency || '1-0-1',
          duration: m.duration || '',
          verification_status: 'CONFIRMED'
        }));
        await confirmExtractedMedicines(prescriptionId, payload);
      }

      // 4. Update current prescription in AppContext
      const updatedRx = {
        ...currentPrescription,
        medicines,
        total_medicines_found: medicines.length,
        has_uncertain_matches: false,
        all_confirmed: true
      };
      setCurrentPrescription(updatedRx);

      // 5. Asynchronously persist to prescription history
      try {
        await savePrescription({
          user_mobile: user?.mobile_number || '9876543210',
          patient_name: user?.user_name || 'Patient',
          title: 'Prescription with ' + medicines.map((m) => m.medicine_name).join(', '),
          raw_text: currentPrescription?.extracted_text || '',
          total_branded_cost: currentPrescription?.financial_summary?.sample_pack_branded_total_inr || 227.0,
          total_generic_cost: currentPrescription?.financial_summary?.sample_pack_generic_total_inr || 41.5,
          net_savings: currentPrescription?.financial_summary?.net_savings_inr || 185.5,
          savings_percentage: currentPrescription?.financial_summary?.savings_percentage || 81.7,
          items: medicines.map((m) => ({
            brand_name: m.medicine_name,
            active_ingredient: (m.active_ingredients || []).map((i) => i.molecule).join(' + ') || m.medicine_name,
            strength: m.strength || 'Standard',
            dosage_form: m.dosage_form || 'Tablet',
            frequency: m.dosage_text || m.prescribed_frequency || '1-0-1',
            timing: m.prescribed_timing || 'After food',
            branded_unit_price: m.branded_unit_price || 20.0,
            generic_unit_price: m.generic_unit_price || 3.0,
            savings_percentage: m.savings_percentage || 80.0
          }))
        });
      } catch (saveErr) {
        console.warn('Auto save history notice:', saveErr);
      }

      notify('Medicine identity and strength confirmed. Finding bioequivalent generics...', 'success');
      setActiveTab('generics');
    } catch (err) {
      setValidationError(err.message || 'Failed to confirm extracted medicines.');
      notify(err.message || 'Failed to confirm medicines.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Step 3 of 4: Clinical Medicine Confirmation
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            Confirm Extracted Medicine Details
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and edit the extracted medicine name, active molecule, strength, dosage form, and dosage frequency.
            All medicine identities and strengths must be confirmed before finding matching generics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {unconfirmedItems.length > 0 && (
            <button
              onClick={handleConfirmAll}
              className="px-3 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs rounded-xl border border-teal-200 transition-colors flex items-center gap-1.5"
              title="Verify and confirm all medicines at once"
            >
              <CheckCheck className="w-4 h-4 text-teal-600" />
              Confirm All
            </button>
          )}

          <button
            onClick={handleAddMedicine}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Critical Allergy Warning Banner */}
      {allergyAlerts.length > 0 && (
        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            Safety Guard: Potential Drug Allergy Conflict Detected!
          </div>
          {allergyAlerts.map((alt, idx) => (
            <p key={idx} className="text-xs text-rose-900 font-medium">
              • {alt.message}
            </p>
          ))}
          <p className="text-[11px] text-rose-700">
            Please double-check with your doctor before dispensing this medication.
          </p>
        </div>
      )}

      {/* Low OCR Confidence / Uncertain Match Warning Banner */}
      {hasUncertainMatches && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Low OCR Confidence / Possible Medicine Match Detected</span>
          </div>
          <p className="text-xs text-amber-800">
            One or more detected medicine names have low extraction confidence. The system NEVER automatically accepts uncertain corrections.
            Please review the highlighted <span className="font-semibold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">Possible medicine match</span> items, edit if necessary, and confirm their identity.
          </p>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Confirmation Required</div>
            <div>{validationError}</div>
          </div>
        </div>
      )}

      {/* Extracted Medicines Confirmation Cards & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-600" />
            <h2 className="font-bold text-slate-800 text-sm">
              Extracted Prescription Items ({medicines.length})
            </h2>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>
              Confirmed:{' '}
              <strong className="text-emerald-700 font-bold">
                {medicines.length - unconfirmedItems.length}/{medicines.length}
              </strong>
            </span>
            {unconfirmedItems.length > 0 && (
              <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                {unconfirmedItems.length} awaiting confirmation
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {medicines.map((med, idx) => {
            const isEditing = editingIndex === idx;
            const isUncertain = med.confidence < 0.85 || med.verification_status === 'POSSIBLE_MATCH';
            const isConfirmed = med.verification_status === 'CONFIRMED' && !med.requires_user_confirmation;

            return (
              <div
                key={med.id || idx}
                className={`p-4 sm:p-5 transition-colors ${
                  isUncertain && !isConfirmed ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Status Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>

                    {/* Low confidence badge */}
                    {isUncertain && !isConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Possible medicine match
                      </span>
                    ) : isConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Confirmed & Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                        Pending Confirmation
                      </span>
                    )}

                    {med.detected_name && med.detected_name !== med.medicine_name && (
                      <span className="text-[11px] text-slate-500 font-mono">
                        (OCR token: <span className="text-slate-700 font-semibold">{med.detected_name}</span>)
                      </span>
                    )}
                  </div>

                  {/* Actions: Edit, Confirm, Delete */}
                  <div className="flex items-center gap-2">
                    {!isConfirmed ? (
                      <button
                        onClick={() => handleConfirmItem(idx)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                        title="Confirm identity and strength"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirm Medicine
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const updated = [...medicines];
                          updated[idx].requires_user_confirmation = true;
                          updated[idx].verification_status = 'PENDING';
                          setMedicines(updated);
                        }}
                        className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                      >
                        Re-verify
                      </button>
                    )}

                    <button
                      onClick={() => setEditingIndex(isEditing ? null : idx)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isEditing
                          ? 'bg-teal-50 border-teal-300 text-teal-700'
                          : 'border-slate-200 text-slate-500 hover:text-teal-700 hover:bg-slate-100'
                      }`}
                      title={isEditing ? 'Close Editing' : 'Edit Fields'}
                    >
                      {isEditing ? <Save className="w-4 h-4 text-teal-600" /> : <Edit2 className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDeleteRow(idx)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove Medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Form Fields: Editable Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                  {/* 1. Medicine Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>Medicine Name *</span>
                      {!med.medicine_name.trim() && (
                        <span className="text-[10px] text-rose-600 font-semibold">Required</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={med.medicine_name}
                      onChange={(e) => handleUpdateField(idx, 'medicine_name', e.target.value)}
                      placeholder="e.g. Paracetamol"
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                        !med.medicine_name.trim()
                          ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                          : isUncertain && !isConfirmed
                          ? 'border-amber-400 bg-amber-50/30 text-slate-900'
                          : 'border-slate-300 bg-white text-slate-900 focus:border-teal-500'
                      }`}
                    />
                  </div>

                  {/* 2. Strength */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>Strength *</span>
                      {!med.strength.trim() && (
                        <span className="text-[10px] text-rose-600 font-semibold">Required</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={med.strength}
                      onChange={(e) => handleUpdateField(idx, 'strength', e.target.value)}
                      placeholder="e.g. 650 mg"
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono font-medium ${
                        !med.strength.trim()
                          ? 'border-rose-400 bg-rose-50/50 text-rose-900'
                          : 'border-slate-300 bg-white text-slate-900 focus:border-teal-500'
                      }`}
                    />
                  </div>

                  {/* 3. Dosage Form */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Dosage Form
                    </label>
                    <select
                      value={med.dosage_form || 'Tablet'}
                      onChange={(e) => handleUpdateField(idx, 'dosage_form', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:border-teal-500"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Injection">Injection</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Suspension">Suspension</option>
                      <option value="Drops">Drops</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Powder">Powder</option>
                    </select>
                  </div>

                  {/* 4. Dosage Text / Frequency */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Dosage / Frequency
                    </label>
                    <input
                      type="text"
                      value={med.dosage_text || ''}
                      onChange={(e) => handleUpdateField(idx, 'dosage_text', e.target.value)}
                      placeholder="e.g. 1-0-1 or Twice daily"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs font-medium focus:border-teal-500"
                    />
                  </div>

                  {/* 5. Duration */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={med.duration || ''}
                      onChange={(e) => handleUpdateField(idx, 'duration', e.target.value)}
                      placeholder="e.g. 5 days, 30 days"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Subtext info: Active API / Salt Molecule */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-600">Active Molecule:</span>
                    <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-medium border border-teal-100">
                      {med.active_ingredient || med.medicine_name || 'Standard Salt'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {med.confidence && (
                      <span>
                        Match Confidence:{' '}
                        <strong className="text-slate-700">{(med.confidence * 100).toFixed(1)}%</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raw OCR Text Reference */}
      {currentPrescription?.extracted_text && (
        <details className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
          <summary className="font-bold text-slate-700 cursor-pointer select-none">
            View Raw OCR Extracted Text from Prescription
          </summary>
          <pre className="mt-3 p-3 bg-white rounded-xl border border-slate-200 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap text-slate-800">
            {currentPrescription.extracted_text}
          </pre>
        </details>
      )}

      {/* Action Footer & Generic Matching Safety Gate */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <button
          onClick={() => setActiveTab('upload')}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Re-upload / Re-scan Prescription
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {unconfirmedItems.length > 0 && (
            <span className="text-xs text-amber-700 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              {unconfirmedItems.length} item(s) unconfirmed
            </span>
          )}

          <button
            onClick={handleProceedToGenericMatching}
            disabled={isSubmitting || unconfirmedItems.length > 0}
            className={`w-full sm:w-auto px-8 py-3.5 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
              unconfirmedItems.length > 0 || isSubmitting
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20'
            }`}
          >
            {isSubmitting ? (
              <span>Saving & Matching...</span>
            ) : unconfirmedItems.length > 0 ? (
              <>
                <Lock className="w-4 h-4" />
                Confirm Medicines to Unlock Generic Matching
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Confirm & Find Matching Generics
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

