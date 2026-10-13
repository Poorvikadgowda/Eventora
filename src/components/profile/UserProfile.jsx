import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import {
  User,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Heart,
  Pill,
  Trash2,
  Printer,
  Save,
  CheckCircle2,
  FileText,
  ArrowRight
} from 'lucide-react';
import { savePatientHistory, deletePrescription } from '../../services/api';

export const UserProfile = () => {
  const {
    user,
    patientHistory,
    setPatientHistory,
    prescriptionHistory,
    setPrescriptionHistory,
    setCurrentPrescription,
    setActiveTab,
    notify
  } = useApp();

  const [chronicConditions, setChronicConditions] = useState(
    patientHistory?.chronic_conditions || ['Hypertension (High Blood Pressure)', 'Peptic Ulcer / Acid Reflux (GERD)']
  );

  const [drugAllergies, setDrugAllergies] = useState(
    patientHistory?.drug_allergies || ['Penicillin / Amoxicillin / Ampicillin']
  );

  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');

  const handleSaveProfile = async () => {
    try {
      const updated = {
        mobile_number: user.mobile_number || '9876543210',
        patient_name: user.user_name || 'Rahul Verma',
        age: 38,
        gender: 'Male',
        chronic_conditions: chronicConditions,
        drug_allergies: drugAllergies,
        current_medications: patientHistory?.current_medications || [],
        past_adverse_reactions: 'Mild rash with Amoxicillin in 2023.'
      };
      await savePatientHistory(updated);
      setPatientHistory(updated);
      notify('Medical history profile updated successfully', 'success');
    } catch (err) {
      notify('Failed to save profile: ' + err.message, 'error');
    }
  };

  const handleDeleteRx = async (rxId) => {
    try {
      await deletePrescription(rxId);
      setPrescriptionHistory((prev) => prev.filter((r) => r.id !== rxId));
      notify('Prescription removed from history', 'info');
    } catch (err) {
      notify('Error deleting prescription', 'error');
    }
  };

  const handleOpenRx = (rx) => {
    setCurrentPrescription({
      extracted_text: rx.raw_text,
      total_medicines_found: rx.items ? rx.items.length : 0,
      medicines: (rx.items || []).map((item) => ({
        drug_id: item.generic_molecule_slug || 'drug',
        brand_name: item.brand_name,
        dosage_form: item.dosage_form || 'Tablet',
        strength: item.strength,
        active_ingredients: [{ molecule: item.active_ingredient, strength_mg: item.strength, role: 'Active API' }],
        branded_unit_price: item.branded_unit_price || 20.0,
        generic_unit_price: item.generic_unit_price || 3.5,
        savings_percentage: item.savings_percentage || 80.0,
        prescribed_frequency: item.frequency || '1-0-1',
        prescribed_timing: item.timing || 'After food',
        generic_alternative: {
          generic_name: `${item.active_ingredient} ${item.strength}`,
          pmbjp_drug_code: item.pmbjp_code || 'PMBJP0012',
          jan_aushadhi_unit_price: item.generic_unit_price || 3.5,
          manufacturer: item.generic_manufacturer || 'Jan Aushadhi (BPPI)',
          cdsco_approved: true
        }
      })),
      financial_summary: {
        sample_pack_branded_total_inr: rx.total_branded_cost,
        sample_pack_generic_total_inr: rx.total_generic_cost,
        net_savings_inr: rx.net_savings,
        savings_percentage: rx.savings_percentage
      }
    });
    setActiveTab('confirmation');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Module 18: Patient Profile & Prescription Archive
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">
            User Profile & Medical History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal healthcare profile, chronic conditions, drug allergy safeguards, and past scanned prescriptions.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          Save Medical Profile
        </button>
      </div>

      {/* Patient Identity Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-extrabold text-xl shadow-sm">
            {user.user_name ? user.user_name.charAt(0) : 'U'}
          </div>
          <div className="space-y-0.5">
            <h3 className="font-extrabold text-base text-slate-900">{user.user_name || 'Rahul Verma'}</h3>
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span>Mobile: <strong>+91 {user.mobile_number || '9876543210'}</strong></span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> OTP Verified
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Account Role: {user.role === 'PHARMACY_ADMIN' ? 'Pharmacy Administrator' : 'Patient / Caregiver'}
            </div>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 text-xs text-slate-500 space-y-1">
          <div>Archived Prescriptions: <strong>{prescriptionHistory.length}</strong></div>
          <div>Allergy Safeguard: <strong className="text-rose-600">Active</strong></div>
        </div>
      </div>

      {/* Medical Safety Safeguards (Chronic Conditions & Allergies) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Drug Allergies Guard */}
        <div className="bg-white p-6 rounded-2xl border-2 border-rose-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Recorded Drug Allergies
          </div>
          <p className="text-slate-500 text-xs leading-relaxed">
            Newly scanned prescriptions are cross-checked against these allergies to alert you before taking medications.
          </p>

          <div className="flex flex-wrap gap-2">
            {drugAllergies.map((allergy, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 rounded-full text-xs font-bold"
              >
                {allergy}
                <button
                  type="button"
                  onClick={() => setDrugAllergies(drugAllergies.filter((_, i) => i !== idx))}
                  className="hover:text-rose-950 font-black text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              placeholder="Add drug allergy (e.g. Sulfa, NSAIDs)..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
            <button
              type="button"
              onClick={() => {
                if (newAllergy.trim()) {
                  setDrugAllergies([...drugAllergies, newAllergy.trim()]);
                  setNewAllergy('');
                }
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
            >
              Add
            </button>
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <Heart className="w-4 h-4 text-teal-600" />
            Chronic Health Conditions
          </div>
          <p className="text-slate-500 text-xs leading-relaxed">
            Used to optimize long-term treatment basket savings calculations.
          </p>

          <div className="flex flex-wrap gap-2">
            {chronicConditions.map((cond, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-xs font-semibold"
              >
                {cond}
                <button
                  type="button"
                  onClick={() => setChronicConditions(chronicConditions.filter((_, i) => i !== idx))}
                  className="hover:text-teal-950 font-black text-xs"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              placeholder="Add condition (e.g. Asthma, Diabetes)..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="button"
              onClick={() => {
                if (newCondition.trim()) {
                  setChronicConditions([...chronicConditions, newCondition.trim()]);
                  setNewCondition('');
                }
              }}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl"
            >
              Add
            </button>
          </div>
        </div>

      </div>

      {/* Prescription History Archive Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-base text-slate-900">Archived Doctor Prescriptions</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {prescriptionHistory.length} Record{prescriptionHistory.length !== 1 ? 's' : ''} Saved
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {prescriptionHistory.map((rx) => (
            <div key={rx.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{rx.title}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                    {rx.items ? `${rx.items.length} Medicines` : 'Analyzed'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(rx.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Doctor: {rx.doctor_name || 'Prescribing Physician'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(rx.items || []).map((item, idx) => (
                    <span key={idx} className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                      {item.brand_name} ({item.strength || item.active_ingredient})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Savings</div>
                  <div className="text-sm font-extrabold text-emerald-600">
                    Save ₹{rx.net_savings} ({rx.savings_percentage}%)
                  </div>
                </div>

                <button
                  onClick={() => handleOpenRx(rx)}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  View Details <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleDeleteRx(rx.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
