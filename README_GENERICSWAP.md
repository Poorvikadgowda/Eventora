# GenericSwap 💊
### Active Molecule & Low-Cost Generic Medicine Finder with Mobile 6-Digit OTP Authentication

Branded medicines prescribed by doctors often cost **5x–10x more** than identical generic alternatives manufactured under the same clinical bioequivalence standards. **GenericSwap** empowers patients, caregivers, and medical practitioners to upload doctor's prescriptions, instantly identify the active pharmaceutical ingredients (APIs/salts), understand what each molecule treats in simple terms, and compare prices with government-approved **Jan Aushadhi (PMBJP)** bioequivalent generics to save 70% to 90% on medical expenses.

---

## 🌟 Key Features

1. **🔐 Mobile Number Login & 6-Digit OTP Confirmation**:
   - Secure mobile number authentication.
   - Generates and delivers 6-digit confirmation code with expiry timer and resend capability.
   - Demo 1-click login helper for rapid testing.
   - Persistent verified user session displaying verified badge.

2. **📸 Vision OCR Prescription Scanner**:
   - Accepts uploaded images of doctor's handwritten or printed clinic prescriptions (PNG, JPG).
   - Includes 3 pre-built realistic clinic prescription pads for immediate one-click testing:
     - *Sample 1: Acute Fever & Acidity (Dolo 650 + Pantocid DSR)*
     - *Sample 2: Chronic Lifestyle Care (Telma 40 + Glycomet GP2 + Atorva 10)*
     - *Sample 3: Respiratory & Allergy Care (Augmentin 625 Duo + Montair-LC)*
   - Extracts drug names, salt combinations, dosage strengths, and doctor instructions.

3. **🔬 Patient-Friendly Active Molecule Explainer**:
   - Jargon-free explanation of what each active pharmaceutical ingredient does.
   - Therapeutic purpose, how it acts in the body, dosage timings (e.g. before food / after meals).
   - Crucial safety precautions and contraindications.
   - Clear clinical explanation of bioequivalence standards (Indian Pharmacopoeia, CDSCO, WHO-GMP).

4. **🏷️ Side-by-Side Branded vs. Generic Price Comparator**:
   - Direct price comparison between Prescribed Brand MRP vs. Government Jan Aushadhi (PMBJP) unit cost vs. Certified Commercial Generics (Cipla, Mankind, Zydus).
   - Highlighting net savings percentage (e.g., Save 86.4% on Pantocid DSR).

5. **💰 Chronic Prescription Basket & Annual Savings Calculator**:
   - Calculates monthly and annual savings for long-term chronic treatments (diabetes, hypertension, cholesterol).
   - Dynamic duration sliders and household patient multipliers showing thousands of rupees saved per year.

6. **📄 Generic Rx Request Slip**:
   - Printable / downloadable standardized slip with official INN salt names and Jan Aushadhi product codes to present to any pharmacy or Jan Aushadhi Kendra.

7. **🎙️ 24/7 Context-Aware Multilingual Voice Assistant**:
   - Dynamic clinical pharmacology assistant supporting 8 languages (English, हिंदी, தமிழ், తెలుగు, বাংলা, मराठी, ગુજરાતી, ಕನ್ನಡ).
   - Generates natural spoken audio speech for all medical and savings guidance.

8. **📋 Patient Medicine History & Real-Time Safety Guard**:
   - Manages chronic illnesses, drug allergies, and active medications.
   - Automatically cross-checks scanned prescriptions to prevent allergic reactions or duplicate therapy.

9. **📍 Nearby Pharmacy & Live Stock Locator**:
   - Locates government PMBJP Jan Aushadhi Kendras and certified generic pharmacies on an interactive map.
   - Real-time stock status check (In-Stock vs. Out-of-Stock) so patients never make wasted trips.
   - Filter by "In-Stock Only" and direct store phone calling.
   - 1-Hour Pickup Hold: Reserve a medicine strip online before traveling.

---

## 🏗️ Tech Stack

- **Frontend**: Streamlit with custom healthcare theme CSS and responsive widgets
- **Backend API**: Python FastAPI with Pydantic data schemas
- **Vision OCR & NER**: PIL Image preprocessing, fuzzy matching, and prescription layout entity recognition
- **Data Layer**: Curated JSON datasets based on National Drug Registries and PMBJP Jan Aushadhi official catalogs
- **Testing**: Pytest automated test suite (100% test pass rate)

---

## 🚀 Quick Start Guide

### 1. Requirements
Ensure Python 3.10+ is installed on your system.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Launch GenericSwap (One-Click)
Run the automated launcher:
```bash
run_genericswap.bat
```
Or with python:
```bash
python run_app.py
```

- **Streamlit Web Dashboard**: [http://localhost:8501](http://localhost:8501)
- **FastAPI Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🧪 Running Automated Tests
```bash
python -m pytest tests/test_genericswap.py -v
```
Verifies mobile number validation, 6-digit OTP verification, dataset integrity, OCR extraction, savings calculations, and live FastAPI endpoints.
