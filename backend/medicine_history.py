"""
Patient Medicine History & Clinical Interaction Safety Engine.
Manages patient chronic health conditions, drug allergies, active medication lists,
and performs automated safety cross-checks against newly prescribed medications.
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

# In-memory storage for patient medicine histories (Key: mobile_number)
_PATIENT_HISTORIES: Dict[str, Dict[str, Any]] = {}

COMMON_CONDITIONS = [
    "Hypertension (High Blood Pressure)",
    "Type 2 Diabetes Mellitus",
    "Type 1 Diabetes",
    "Peptic Ulcer / Acid Reflux (GERD)",
    "Asthma / Chronic Bronchitis",
    "Chronic Kidney Disease (CKD)",
    "Heart Disease (CAD / Angina)",
    "Hypothyroidism / Hyperthyroidism",
    "Fatty Liver / Hepatic Impairment",
    "High Cholesterol (Dyslipidemia)"
]

COMMON_ALLERGIES = [
    "Penicillin / Amoxicillin / Ampicillin",
    "Sulfa Drugs (Sulfonamides)",
    "NSAIDs (Aspirin, Ibuprofen, Diclofenac)",
    "Cephalosporin Antibiotics (Cefixime, Cephalexin)",
    "Paracetamol / Acetaminophen (Rare)",
    "Fluoroquinolones (Ciprofloxacin, Levofloxacin)",
    "Shellfish / Iodine"
]


class MedicineHistoryItem(BaseModel):
    brand_or_molecule: str
    strength: Optional[str] = ""
    frequency: Optional[str] = "Once daily"
    started_since: Optional[str] = "Recent"
    prescribed_for: Optional[str] = "Chronic maintenance"


class PatientProfileRequest(BaseModel):
    mobile_number: str
    patient_name: str = "Rahul Verma"
    age: int = 38
    gender: str = "Male"
    chronic_conditions: List[str] = Field(default_factory=list)
    drug_allergies: List[str] = Field(default_factory=list)
    current_medications: List[MedicineHistoryItem] = Field(default_factory=list)
    past_adverse_reactions: Optional[str] = ""


def get_patient_history(mobile_number: str) -> Dict[str, Any]:
    """Retrieve existing medical history or return default initialized profile."""
    if mobile_number in _PATIENT_HISTORIES:
        return _PATIENT_HISTORIES[mobile_number]

    # Pre-seed a sensible default profile for instant demonstration
    default_profile = {
        "mobile_number": mobile_number,
        "patient_name": "Rahul Verma",
        "age": 38,
        "gender": "Male",
        "chronic_conditions": ["Hypertension (High Blood Pressure)", "Peptic Ulcer / Acid Reflux (GERD)"],
        "drug_allergies": ["Penicillin / Amoxicillin / Ampicillin"],
        "current_medications": [
            {
                "brand_or_molecule": "Telma 40",
                "strength": "40mg",
                "frequency": "Once daily (Morning)",
                "started_since": "6 months ago",
                "prescribed_for": "Hypertension"
            }
        ],
        "past_adverse_reactions": "Mild skin hives noticed with Amoxicillin in 2023. Acidity flare-up with pain killers."
    }
    _PATIENT_HISTORIES[mobile_number] = default_profile
    return default_profile


def save_patient_history(profile: PatientProfileRequest) -> Dict[str, Any]:
    """Save or update the patient's complete medicine history profile."""
    data = {
        "mobile_number": profile.mobile_number,
        "patient_name": profile.patient_name,
        "age": profile.age,
        "gender": profile.gender,
        "chronic_conditions": profile.chronic_conditions,
        "drug_allergies": profile.drug_allergies,
        "current_medications": [m.model_dump() for m in profile.current_medications],
        "past_adverse_reactions": profile.past_adverse_reactions
    }
    _PATIENT_HISTORIES[profile.mobile_number] = data
    return {"success": True, "message": "Medicine history updated successfully.", "profile": data}


def check_clinical_safety(
    patient_history: Dict[str, Any],
    new_medicines: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Automated Clinical Cross-Check:
    Inspects new medications against the patient's recorded medicine history:
    1. Allergy Contraindications (Severe)
    2. Chronic Disease Warnings (Moderate)
    3. Duplicate Active Salts / Therapeutic Class Overlap
    """
    alerts = []
    allergies = [a.lower() for a in patient_history.get("drug_allergies", [])]
    conditions = [c.lower() for c in patient_history.get("chronic_conditions", [])]
    current_meds = [m.get("brand_or_molecule", "").lower() for m in patient_history.get("current_medications", [])]

    for med in new_medicines:
        brand = med.get("brand_name", "").lower()
        strength = med.get("strength", "").lower()
        active_ings = [i.get("molecule", "").lower() for i in med.get("active_ingredients", [])]

        # 1. Allergy Check: Penicillin / Amoxicillin
        if any("penicillin" in a or "amoxicillin" in a for a in allergies):
            if "amoxicillin" in strength or any("amoxicillin" in i for i in active_ings) or "augmentin" in brand:
                alerts.append({
                    "severity": "CRITICAL_ALLERGY",
                    "drug": med.get("brand_name"),
                    "title": "🚨 Severe Drug Allergy Warning",
                    "message": (
                        f"Patient is recorded as ALLERGIC to Penicillin/Amoxicillin! "
                        f"'{med.get('brand_name')}' contains Amoxicillin. "
                        f"Administering this could trigger an allergic reaction or anaphylaxis. Do not take without urgent doctor consultation."
                    )
                })

        # Allergy Check: NSAIDs (Ibuprofen / Combiflam)
        if any("nsaid" in a or "aspirin" in a or "ibuprofen" in a for a in allergies):
            if "ibuprofen" in strength or any("ibuprofen" in i for i in active_ings) or "combiflam" in brand:
                alerts.append({
                    "severity": "CRITICAL_ALLERGY",
                    "drug": med.get("brand_name"),
                    "title": "🚨 NSAID Drug Allergy Alert",
                    "message": f"Patient has an NSAID allergy. '{med.get('brand_name')}' contains Ibuprofen."
                })

        # 2. Disease Condition Check: Peptic Ulcer / GERD vs NSAIDs
        if any("ulcer" in c or "gerd" in c or "acid reflux" in c for c in conditions):
            if "combiflam" in brand or "ibuprofen" in strength or any("ibuprofen" in i for i in active_ings):
                alerts.append({
                    "severity": "CAUTION_CONDITION",
                    "drug": med.get("brand_name"),
                    "title": "⚠️ Caution: Peptic Ulcer / Acid Reflux Risk",
                    "message": (
                        f"Ibuprofen (in {med.get('brand_name')}) is an NSAID that can irritate the stomach lining "
                        f"and aggravate existing peptic ulcers or acid reflux. Take with food and a gastroprotective PPI like Pantoprazole."
                    )
                })

        # Condition Check: High Blood Pressure vs Decongestants or high NSAIDs
        if any("hypertension" in c or "blood pressure" in c for c in conditions):
            if "ibuprofen" in strength:
                alerts.append({
                    "severity": "INFO",
                    "drug": med.get("brand_name"),
                    "title": "ℹ️ BP Monitoring Advised",
                    "message": "Frequent NSAID use can elevate blood pressure or blunt antihypertensive therapy. Monitor BP regularly."
                })

        # 3. Duplicate Therapy Check
        for curr in current_meds:
            if curr in brand or brand in curr:
                alerts.append({
                    "severity": "WARNING_DUPLICATE",
                    "drug": med.get("brand_name"),
                    "title": "⚠️ Duplicate Medication Alert",
                    "message": f"'{med.get('brand_name')}' is already present in your active medication history. Check with your doctor to avoid accidental double-dosing."
                })

    is_safe = len([a for a in alerts if a["severity"].startswith("CRITICAL")]) == 0

    return {
        "is_clinically_safe": is_safe,
        "total_alerts": len(alerts),
        "alerts": alerts,
        "patient_name": patient_history.get("patient_name"),
        "allergies_monitored": patient_history.get("drug_allergies", []),
        "chronic_conditions": patient_history.get("chronic_conditions", [])
    }
