"""
Molecule Explainer Engine: Patient-friendly clinical translation and bioequivalence guidance.
"""

from typing import Dict, Any, List

# Educational explanations of bioequivalence standards
BIOEQUIVALENCE_EXPLAINER = {
    "title": "What Does 'Bioequivalent Generic' Mean?",
    "summary": "A generic medicine has the identical active molecule, strength, route of administration, and clinical therapeutic efficacy as the expensive branded version.",
    "key_facts": [
        "Identical Active Pharmaceutical Ingredient (API): Same molecule, purity, and dosage strength.",
        "Clinical Bioequivalence: CDSCO and WHO-GMP mandate that the generic medicine delivers the exact same blood concentration (Cmax) and total absorption (AUC) within standard 80%–125% clinical bioequivalence bounds.",
        "Same Safety & Efficacy: Generic medicines undergo identical dissolution testing, stability tests, and cGMP quality audits as branded counterparts.",
        "Cost Difference Origin: Generic manufacturers spend $0 on consumer advertising, celebrity endorsements, and doctor sales reps, passing 70% to 90% direct savings to patients."
    ],
    "regulatory_bodies": ["CDSCO (India)", "Jan Aushadhi (PMBJP)", "US-FDA Orange Book", "WHO International Pharmacopoeia"]
}


def explain_molecule_combination(active_ingredients: List[Dict[str, str]], therapeutic_class: str = "") -> Dict[str, Any]:
    """
    Generate an intuitive, patient-centered explanation for a single or combination drug.
    """
    molecules_list = [item.get("molecule", "") for item in active_ingredients if item.get("molecule")]
    molecules_str = " + ".join(molecules_list)

    breakdown = []
    for item in active_ingredients:
        mol = item.get("molecule", "")
        dosage = item.get("dosage", "")
        inn = item.get("inn_name", mol)

        explanation = get_individual_molecule_summary(mol)
        breakdown.append({
            "molecule": mol,
            "dosage": dosage,
            "official_inn": inn,
            "role": explanation.get("role", "Active therapeutic agent"),
            "how_it_acts": explanation.get("mechanism", "Works systematically to alleviate target symptoms.")
        })

    return {
        "title": f"Understanding {molecules_str}",
        "combination_overview": f"This formulation contains {len(active_ingredients)} active pharmaceutical ingredient(s) working synergistically.",
        "therapeutic_class": therapeutic_class,
        "ingredients": breakdown,
        "bioequivalence_assurance": BIOEQUIVALENCE_EXPLAINER
    }


def get_individual_molecule_summary(molecule_name: str) -> Dict[str, str]:
    """Provide layman's clinical breakdown of known active pharmaceutical ingredients."""
    mol_lower = molecule_name.lower().strip()

    knowledge_base = {
        "paracetamol": {
            "role": "Antipyretic (Fever Reducer) & Analgesic (Pain Reliever)",
            "mechanism": "Blocks prostaglandin signals in the central nervous system to reset the hypothalamus thermostat and diminish pain perception."
        },
        "pantoprazole": {
            "role": "Proton Pump Inhibitor (PPI / Acidity Reducer)",
            "mechanism": "Directly inhibits the H+/K+ ATPase pump in gastric parietal cells, drastically reducing stomach acid secretion and healing reflux irritation."
        },
        "domperidone": {
            "role": "Prokinetic & Antiemetic (Prevents Nausea & Bloating)",
            "mechanism": "Blocks peripheral dopamine D2 receptors to promote forward gastrointestinal motility and prevent stomach contents from splashing back upward into the esophagus."
        },
        "amoxicillin": {
            "role": "Broad-Spectrum Penicillin Antibiotic",
            "mechanism": "Prevents bacteria from synthesizing protective peptidoglycan cell walls, causing bacterial cell lysis and destruction."
        },
        "clavulanic acid": {
            "role": "Beta-Lactamase Inhibitor (Resistance Shield)",
            "mechanism": "Inactivates bacterial beta-lactamase defense enzymes, protecting amoxicillin from degradation and restoring full antibiotic potency."
        },
        "azithromycin": {
            "role": "Macrolide Antibiotic",
            "mechanism": "Binds to bacterial 50S ribosomal subunits, halting protein synthesis and arresting bacterial multiplication."
        },
        "telmisartan": {
            "role": "Angiotensin II Receptor Blocker (Blood Pressure Lowerer)",
            "mechanism": "Selectively blocks AT1 receptors, preventing blood vessel contraction and easing arterial pressure on the heart and kidneys."
        },
        "amlodipine": {
            "role": "Calcium Channel Blocker (Vasodilator)",
            "mechanism": "Relaxes smooth muscles in arterial walls by inhibiting calcium influx, lowering blood pressure and improving coronary blood flow."
        },
        "metformin": {
            "role": "Biguanide Antidiabetic (Insulin Sensitizer)",
            "mechanism": "Decreases hepatic gluconeogenesis (sugar made by liver), decreases intestinal glucose absorption, and boosts cellular insulin sensitivity."
        },
        "glimepiride": {
            "role": "Second-Generation Sulfonylurea Antidiabetic",
            "mechanism": "Stimulates pancreatic beta cells to produce and release natural insulin in response to food intake."
        },
        "sitagliptin": {
            "role": "DPP-4 Inhibitor Antidiabetic",
            "mechanism": "Protects incretin hormones GLP-1 and GIP from degradation, allowing natural insulin secretion when glucose is elevated."
        },
        "atorvastatin": {
            "role": "HMG-CoA Reductase Inhibitor (Cholesterol Lowerer)",
            "mechanism": "Inhibits the rate-limiting enzyme in cholesterol synthesis within the liver, markedly dropping harmful LDL-C and triglycerides."
        },
        "montelukast": {
            "role": "Leukotriene Receptor Antagonist (Airway Protector)",
            "mechanism": "Blocks inflammatory leukotriene receptors (CysLT1) to decrease bronchial swelling, mucus hypersecretion, and airway hypersensitivity."
        },
        "levocetirizine": {
            "role": "Second-Generation Antihistamine",
            "mechanism": "Selectively blocks peripheral H1 histamine receptors to halt sneezing, itchy eyes, runny nose, and allergic skin hives."
        },
        "fexofenadine": {
            "role": "Non-Sedating Antihistamine",
            "mechanism": "Blocks histamine receptor activation without crossing the blood-brain barrier, providing effective allergy relief without drowsiness."
        },
        "ibuprofen": {
            "role": "Non-Steroidal Anti-Inflammatory Drug (NSAID)",
            "mechanism": "Inhibits COX-1 and COX-2 enzymes to suppress inflammatory prostaglandins, relieving joint swelling, stiffness, and pain."
        },
        "cefixime": {
            "role": "Third-Generation Cephalosporin Antibiotic",
            "mechanism": "Binds to penicillin-binding proteins to dismantle bacterial cell wall synthesis during bacterial growth."
        }
    }

    for key, data in knowledge_base.items():
        if key in mol_lower:
            return data

    return {
        "role": "Active Pharmaceutical Ingredient (API)",
        "mechanism": "Delivers target clinical therapeutic action matching national pharmacopoeia standards."
    }
