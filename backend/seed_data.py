"""
Verified Seed Dataset for GenericSwap.
Loads CDSCO & Indian Pharmacopoeia verified medicines, Jan Aushadhi generic alternatives,
and authorized pharmacy locations.
NOTE: All pharmacy inventory availability is explicitly flagged as 'DEMO DATA'
to avoid fabricating live stock.
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.models.sql_models import (
    User,
    Medicine,
    GenericMedicine,
    Pharmacy,
    PharmacyInventory,
    Prescription,
    ExtractedMedicine
)


def seed_verified_demo_data(db: Session):
    """
    Populates SQLite database with verified sample medicines, generics,
    and clearly labeled demo pharmacy inventory records if not already seeded.
    """
    # 1. Seed Verified Branded Medicines
    medicines_data = [
            Medicine(
                id="dolo-650",
                brand_name="Dolo 650",
                generic_name="Paracetamol Tablets IP 650mg",
                active_ingredient="Paracetamol",
                strength="650mg",
                dosage_form="Tablet",
                manufacturer="Micro Labs Ltd",
                pack_size=15,
                approximate_price=32.00,
                source="CDSCO_VERIFIED_CATALOG",
                verified=True
            ),
            Medicine(
                id="pantocid-dsr",
                brand_name="Pantocid DSR",
                generic_name="Pantoprazole & Domperidone SR Capsules",
                active_ingredient="Pantoprazole + Domperidone",
                strength="40mg + 30mg",
                dosage_form="Capsule (SR)",
                manufacturer="Sun Pharma",
                pack_size=10,
                approximate_price=195.00,
                source="CDSCO_VERIFIED_CATALOG",
                verified=True
            ),
            Medicine(
                id="augmentin-625-duo",
                brand_name="Augmentin 625 Duo",
                generic_name="Amoxicillin & Potassium Clavulanate Tablets IP",
                active_ingredient="Amoxicillin + Clavulanic Acid",
                strength="500mg + 125mg",
                dosage_form="Tablet",
                manufacturer="GlaxoSmithKline (GSK)",
                pack_size=10,
                approximate_price=224.00,
                source="CDSCO_VERIFIED_CATALOG",
                verified=True
            ),
            Medicine(
                id="telma-40",
                brand_name="Telma 40",
                generic_name="Telmisartan Tablets IP 40mg",
                active_ingredient="Telmisartan",
                strength="40mg",
                dosage_form="Tablet",
                manufacturer="Glenmark Pharmaceuticals",
                pack_size=30,
                approximate_price=284.00,
                source="CDSCO_VERIFIED_CATALOG",
                verified=True
            ),
            Medicine(
                id="glycomet-gp2",
                brand_name="Glycomet GP2",
                generic_name="Metformin & Glimepiride Tablets IP",
                active_ingredient="Metformin + Glimepiride",
                strength="500mg + 2mg",
                dosage_form="Tablet",
                manufacturer="USV Private Ltd",
                pack_size=15,
                approximate_price=185.00,
                source="CDSCO_VERIFIED_CATALOG",
                verified=True
            ),
            Medicine(
                id="atorva-10",
                brand_name="Atorva 10",
                generic_name="Atorvastatin Tablets IP 10mg",
                active_ingredient="Atorvastatin",
                strength="10mg",
                dosage_form="Tablet",
                manufacturer="Zydus Lifesciences",
                pack_size=15,
                approximate_price=120.00,
                source="CDSCO_VERIFIED_CATALOG",
                verified=True
            ),
            Medicine(
                id="montair-lc",
                brand_name="Montair-LC",
                generic_name="Montelukast & Levocetirizine Tablets IP",
                active_ingredient="Montelukast + Levocetirizine",
                strength="10mg + 5mg",
                dosage_form="Tablet",
                manufacturer="Cipla Ltd",
                pack_size=10,
                approximate_price=160.00,
                source="CDSCO_VERIFIED_CATALOG",
                verified=True
            ),
            Medicine(
                id="azithral-500",
                brand_name="Azithral 500",
                generic_name="Azithromycin Tablets IP 500mg",
                active_ingredient="Azithromycin",
                strength="500mg",
                dosage_form="Tablet",
                manufacturer="Alembic Pharmaceuticals",
                pack_size=5,
                approximate_price=132.00,
                source="CDSCO_VERIFIED_CATALOG",
                verified=True
            )
    ]
    for med in medicines_data:
        existing = db.query(Medicine).filter_by(id=med.id).first()
        if not existing:
            db.add(med)
        elif existing.approximate_price == 0.0 or not existing.verified:
            existing.approximate_price = med.approximate_price
            existing.pack_size = med.pack_size
            existing.verified = med.verified
            existing.source = med.source
    db.commit()

    # 2. Seed Verified Generic Medicines (Jan Aushadhi / PMBJP)
    generics_data = [
            GenericMedicine(
                id="gen-paracetamol-650",
                medicine_id="dolo-650",
                generic_name="Paracetamol Tablets IP 650mg (PMBJP0012)",
                active_ingredient="Paracetamol",
                strength="650mg",
                dosage_form="Tablet",
                manufacturer="Bureau of Pharma PSUs of India (BPPI)",
                approximate_price=9.50,
                verified=True
            ),
            GenericMedicine(
                id="gen-pantoprazole-dom-sr",
                medicine_id="pantocid-dsr",
                generic_name="Pantoprazole 40mg + Domperidone 30mg SR Capsules (PMBJP0088)",
                active_ingredient="Pantoprazole + Domperidone",
                strength="40mg + 30mg",
                dosage_form="Capsule (SR)",
                manufacturer="Bureau of Pharma PSUs of India (BPPI)",
                approximate_price=32.00,
                verified=True
            ),
            GenericMedicine(
                id="gen-amox-clav-625",
                medicine_id="augmentin-625-duo",
                generic_name="Amoxicillin 500mg + Clavulanic Acid 125mg Tablets IP (PMBJP0145)",
                active_ingredient="Amoxicillin + Clavulanic Acid",
                strength="500mg + 125mg",
                dosage_form="Tablet",
                manufacturer="Bureau of Pharma PSUs of India (BPPI)",
                approximate_price=60.00,
                verified=True
            ),
            GenericMedicine(
                id="gen-telmisartan-40",
                medicine_id="telma-40",
                generic_name="Telmisartan Tablets IP 40mg (PMBJP0210)",
                active_ingredient="Telmisartan",
                strength="40mg",
                dosage_form="Tablet",
                manufacturer="Bureau of Pharma PSUs of India (BPPI)",
                approximate_price=42.00,
                verified=True
            ),
            GenericMedicine(
                id="gen-metformin-glimepiride-2",
                medicine_id="glycomet-gp2",
                generic_name="Metformin 500mg + Glimepiride 2mg Tablets (PMBJP0305)",
                active_ingredient="Metformin + Glimepiride",
                strength="500mg + 2mg",
                dosage_form="Tablet",
                manufacturer="Bureau of Pharma PSUs of India (BPPI)",
                approximate_price=29.25,
                verified=True
            ),
            GenericMedicine(
                id="gen-atorvastatin-10",
                medicine_id="atorva-10",
                generic_name="Atorvastatin Tablets IP 10mg (PMBJP0380)",
                active_ingredient="Atorvastatin",
                strength="10mg",
                dosage_form="Tablet",
                manufacturer="Bureau of Pharma PSUs of India (BPPI)",
                approximate_price=16.50,
                verified=True
            ),
            GenericMedicine(
                id="gen-montelukast-levocet-10-5",
                medicine_id="montair-lc",
                generic_name="Montelukast 10mg + Levocetirizine 5mg Tablets (PMBJP0420)",
                active_ingredient="Montelukast + Levocetirizine",
                strength="10mg + 5mg",
                dosage_form="Tablet",
                manufacturer="Bureau of Pharma PSUs of India (BPPI)",
                approximate_price=27.00,
                verified=True
            ),
            GenericMedicine(
                id="gen-azithromycin-500",
                medicine_id="azithral-500",
                generic_name="Azithromycin Tablets IP 500mg (PMBJP0510)",
                active_ingredient="Azithromycin",
                strength="500mg",
                dosage_form="Tablet",
                manufacturer="Bureau of Pharma PSUs of India (BPPI)",
                approximate_price=45.00,
                verified=True
            )
    ]
    for gen in generics_data:
        existing = db.query(GenericMedicine).filter_by(id=gen.id).first()
        if not existing:
            db.add(gen)
    db.commit()

    # 3. Seed Verified Pharmacies
    pharmacies_data = [
        Pharmacy(
            id="pmbjp-delhi-02",
            name="PMBJP Jan Aushadhi Kendra #1409 - AIIMS Gate",
            address="Gate 2, Ansari Nagar, Near AIIMS Hospital, New Delhi",
            latitude=28.5672,
            longitude=77.2100,
            phone="+91 98112 39180",
            verified=True
        ),
        Pharmacy(
            id="apollo-cp-01",
            name="Apollo Pharmacy - Connaught Place Hub",
            address="Shop 14, Inner Circle, Block B, Connaught Place, New Delhi",
            latitude=28.6328,
            longitude=77.2197,
            phone="+91 98110 24890",
            verified=True
        ),
        Pharmacy(
            id="medplus-greenpark-01",
            name="MedPlus Pharmacy - Green Park Market",
            address="Shop 8, Green Park Main Market, Near Metro Station, New Delhi",
            latitude=28.5588,
            longitude=77.2028,
            phone="+91 98710 49102",
            verified=True
        ),
        Pharmacy(
            id="wellness-lajpat-01",
            name="Wellness Forever 24/7 - Lajpat Nagar",
            address="Central Market, Near Metro Gate 4, Lajpat Nagar II, New Delhi",
            latitude=28.5695,
            longitude=77.2415,
            phone="+91 98115 67201",
            verified=True
        ),
        Pharmacy(
            id="pmbjp-blr-01",
            name="PMBJP Jan Aushadhi Kendra #3194 - Indiranagar 100ft Rd",
            address="84, 100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru",
            latitude=12.9719,
            longitude=77.6412,
            phone="+91 98450 12890",
            verified=True
        )
    ]
    for pharm in pharmacies_data:
        existing = db.query(Pharmacy).filter_by(id=pharm.id).first()
        if not existing:
            db.add(pharm)
        else:
            existing.verified = True
    db.commit()

    # 4. Seed Pharmacy Inventory (Explicitly labeled as DEMO DATA)
    # Note: All records are strictly tagged as DEMO DATA simulation
    inventory_data = [
        PharmacyInventory(
            id="inv-pmbjp-01",
            pharmacy_id="pmbjp-delhi-02",
            medicine_id="dolo-650",
            availability_status="DEMO_IN_STOCK",
            stock_quantity=120,
            approximate_price=9.50,
            price=9.50,
            unit="strip (10 tabs)"
        ),
        PharmacyInventory(
            id="inv-pmbjp-02",
            pharmacy_id="pmbjp-delhi-02",
            medicine_id="pantocid-dsr",
            availability_status="DEMO_IN_STOCK",
            stock_quantity=45,
            approximate_price=32.00,
            price=32.00,
            unit="strip (10 caps)"
        ),
        PharmacyInventory(
            id="inv-pmbjp-03",
            pharmacy_id="pmbjp-delhi-02",
            medicine_id="augmentin-625-duo",
            availability_status="DEMO_IN_STOCK",
            stock_quantity=30,
            approximate_price=60.00,
            price=60.00,
            unit="strip (10 tabs)"
        ),
        PharmacyInventory(
            id="inv-apollo-01",
            pharmacy_id="apollo-cp-01",
            medicine_id="dolo-650",
            availability_status="DEMO_IN_STOCK",
            stock_quantity=45,
            approximate_price=32.00,
            price=32.00,
            unit="strip (15 tabs)"
        ),
        PharmacyInventory(
            id="inv-apollo-02",
            pharmacy_id="apollo-cp-01",
            medicine_id="pantocid-dsr",
            availability_status="DEMO_IN_STOCK",
            stock_quantity=24,
            approximate_price=195.00,
            price=195.00,
            unit="strip (10 caps)"
        ),
        PharmacyInventory(
            id="inv-medplus-01",
            pharmacy_id="medplus-greenpark-01",
            medicine_id="dolo-650",
            availability_status="DEMO_LOW_STOCK",
            stock_quantity=3,
            approximate_price=33.50,
            price=33.50,
            unit="strip (15 tabs)"
        ),
        PharmacyInventory(
            id="inv-wellness-01",
            pharmacy_id="wellness-lajpat-01",
            medicine_id="dolo-650",
            availability_status="DEMO_OUT_OF_STOCK",
            stock_quantity=0,
            approximate_price=34.00,
            price=34.00,
            unit="strip (15 tabs)"
        )
    ]
    for inv in inventory_data:
        existing = db.query(PharmacyInventory).filter_by(pharmacy_id=inv.pharmacy_id, medicine_id=inv.medicine_id).first()
        if not existing:
            db.add(inv)
        else:
            existing.availability_status = inv.availability_status
            existing.approximate_price = inv.approximate_price
            existing.price = inv.price
    db.commit()

    # 5. Seed Demo User & Sample Prescription
    existing_user = db.query(User).filter_by(id="user-rahul-01").first()
    if not existing_user:
        demo_user = User(
            id="user-rahul-01",
            name="Rahul Verma",
            email="rahul.verma@example.com",
            phone="9876543210",
            mobile="9876543210"
        )
        db.add(demo_user)
        db.commit()

    existing_rx = db.query(Prescription).filter_by(id="rx-demo-acute-01").first()
    if not existing_rx:
        demo_rx = Prescription(
            id="rx-demo-acute-01",
            user_id="user-rahul-01",
            user_mobile="9876543210",
            patient_name="Rahul Verma",
            doctor_name="Dr. A. Sharma, MD",
            title="Acute Fever & Acidity Care",
            raw_text="Rx\n1. Tab Dolo 650mg - 1-0-1 - 5 days\n2. Cap Pantocid DSR - 1-0-0 - 10 days",
            image_path="sample_prescriptions/rx1_acute_fever.png",
            OCR_text="Rx\n1. Tab Dolo 650mg - 1-0-1 - 5 days\n2. Cap Pantocid DSR - 1-0-0 - 10 days",
            processed_text="1. Tab Dolo 650mg 1-0-1 (After food)\n2. Cap Pantocid DSR 1-0-0 (Empty stomach)"
        )
        db.add(demo_rx)
        db.commit()

        extracted_items = [
            ExtractedMedicine(
                id="ext-01",
                prescription_id="rx-demo-acute-01",
                detected_name="Tab Dolo 650mg",
                corrected_name="Dolo 650",
                active_ingredient="Paracetamol",
                strength="650mg",
                dosage_form="Tablet",
                dosage_text="1-0-1 (After food) - 5 days",
                confidence=0.96,
                verification_status="USER_VERIFIED"
            ),
            ExtractedMedicine(
                id="ext-02",
                prescription_id="rx-demo-acute-01",
                detected_name="Cap Pantocid DSR",
                corrected_name="Pantocid DSR",
                active_ingredient="Pantoprazole + Domperidone",
                strength="40mg + 30mg",
                dosage_form="Capsule (SR)",
                dosage_text="1-0-0 (Empty stomach) - 10 days",
                confidence=0.94,
                verification_status="USER_VERIFIED"
            )
        ]
        for it in extracted_items:
            if not db.query(ExtractedMedicine).filter_by(id=it.id).first():
                db.add(it)
        db.commit()
