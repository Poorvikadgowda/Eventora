"""
Generate high-resolution sample prescription images (Handwritten and Printed clinic pads)
for GenericSwap testing and interactive demonstration.
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import os

SAMPLE_DIR = Path(__file__).resolve().parent / "frontend" / "sample_prescriptions"
SAMPLE_DIR.mkdir(parents=True, exist_ok=True)


def create_prescription_image(filename: str, header: dict, medicines: list, notes: str, bg_tint=(252, 252, 250)):
    # Standard prescription pad size (approx A5 ratio: 800 x 1100 px)
    width, height = 800, 1050
    image = Image.new("RGB", (width, height), bg_tint)
    draw = ImageDraw.Draw(image)

    # Use default font
    try:
        font_large = ImageFont.truetype("arial.ttf", 26)
        font_sub = ImageFont.truetype("arial.ttf", 16)
        font_body = ImageFont.truetype("arial.ttf", 20)
        font_rx = ImageFont.truetype("times.ttf", 36)
        font_hand = ImageFont.truetype("comic.ttf", 22)
    except Exception:
        font_large = ImageFont.load_default()
        font_sub = font_large
        font_body = font_large
        font_rx = font_large
        font_hand = font_large

    # Border & Clinic Header Banner
    draw.rectangle([(20, 20), (width - 20, height - 20)], outline=(180, 200, 210), width=2)
    draw.rectangle([(22, 22), (width - 22, 160)], fill=(240, 248, 250))

    # Doctor and Clinic Information
    draw.text((45, 35), header["clinic_name"], fill=(15, 60, 90), font=font_large)
    draw.text((45, 75), f"{header['doctor_name']} | Reg: {header['reg_no']}", fill=(50, 80, 100), font=font_sub)
    draw.text((45, 100), header["qualifications"], fill=(80, 100, 120), font=font_sub)
    draw.text((45, 125), header["address"], fill=(100, 120, 130), font=font_sub)

    # Clinic Divider
    draw.line([(25, 165), (width - 25, 165)], fill=(0, 130, 130), width=3)

    # Patient Details Bar
    draw.rectangle([(30, 175), (width - 30, 220)], fill=(248, 249, 250), outline=(220, 225, 230))
    draw.text((45, 185), f"Patient: {header['patient_name']}  |  Age/Sex: {header['patient_age']}  |  Date: {header['date']}", fill=(40, 50, 60), font=font_sub)

    # Rx Symbol
    draw.text((45, 235), "℞", fill=(0, 100, 120), font=font_rx)

    # Medicine List
    curr_y = 295
    for idx, med in enumerate(medicines, 1):
        # Bullet number & medicine name
        draw.text((55, curr_y), f"{idx}. {med['name']}", fill=(10, 25, 45), font=font_body)
        curr_y += 32
        # Dosage & timing
        draw.text((85, curr_y), f"Sig: {med['sig']}  |  Duration: {med['duration']}", fill=(50, 90, 70), font=font_sub)
        curr_y += 28
        # Instruction
        draw.text((85, curr_y), f"Note: {med['note']}", fill=(110, 110, 110), font=font_sub)
        curr_y += 45
        draw.line([(60, curr_y - 15), (width - 60, curr_y - 15)], fill=(235, 235, 235), width=1)

    # Doctor Advice
    curr_y += 20
    draw.rectangle([(40, curr_y), (width - 40, curr_y + 110)], fill=(248, 252, 248), outline=(200, 230, 210))
    draw.text((55, curr_y + 15), "Clinical Advice & Follow-up:", fill=(30, 80, 50), font=font_sub)
    draw.text((55, curr_y + 45), notes, fill=(60, 70, 80), font=font_sub)

    # Doctor Signature at bottom right
    draw.line([(width - 250, height - 90), (width - 50, height - 90)], fill=(120, 130, 140), width=1)
    draw.text((width - 240, height - 80), "Doctor's Signature & Stamp", fill=(120, 130, 140), font=font_sub)

    out_path = SAMPLE_DIR / filename
    image.save(out_path, "PNG")
    print(f"Created: {out_path}")
    return str(out_path)


if __name__ == "__main__":
    # Sample 1: Fever & Acid Reflux (Dolo 650 + Pantocid DSR)
    create_prescription_image(
        "sample_rx_fever_acidity.png",
        header={
            "clinic_name": "SANJEEVANI HEALTHCARE CLINIC",
            "doctor_name": "Dr. Arvind Sharma, M.D. (Internal Medicine)",
            "reg_no": "MCI-48291",
            "qualifications": "Senior Consultant Physician - General & Internal Medicine",
            "address": "B-42, Metro Health Park, New Delhi | Ph: 011-2894100",
            "patient_name": "Rahul Verma",
            "patient_age": "34 Yrs / Male",
            "date": "29-Sep-2026"
        },
        medicines=[
            {
                "name": "Tab Dolo 650mg",
                "sig": "1 - 0 - 1 (Twice Daily)",
                "duration": "5 Days",
                "note": "Take strictly after food with full glass of water for fever & body ache"
            },
            {
                "name": "Cap Pantocid DSR",
                "sig": "1 - 0 - 0 (Once Daily)",
                "duration": "7 Days",
                "note": "Take on empty stomach 30 mins before breakfast for acid reflux & nausea"
            }
        ],
        notes="Drink boiled warm fluids. Take light bland diet. Review in OPD if fever > 101 F after 3 days."
    )

    # Sample 2: Chronic Hypertension & Diabetes (Telma 40 + Glycomet GP2 + Atorva 10)
    create_prescription_image(
        "sample_rx_chronic_cardiac_diabetes.png",
        header={
            "clinic_name": "METROPOLITAN CARDIOLOGY & ENDOCRINE CENTRE",
            "doctor_name": "Dr. Rajeshwar Mehta, M.D., D.M. (Cardiology)",
            "reg_no": "DMC-81042",
            "qualifications": "Fellow of American College of Cardiology (FACC)",
            "address": "Suite 502, Heart & Diabetes Tower, Ring Road, Mumbai",
            "patient_name": "Suresh Patel",
            "patient_age": "58 Yrs / Male",
            "date": "28-Sep-2026"
        },
        medicines=[
            {
                "name": "Tab Telma 40mg",
                "sig": "1 - 0 - 0 (Morning)",
                "duration": "30 Days (Repeat x 3 months)",
                "note": "Blood pressure management. Monitor BP weekly."
            },
            {
                "name": "Tab Glycomet GP2",
                "sig": "1 - 0 - 0 (Morning with breakfast)",
                "duration": "30 Days (Continuous)",
                "note": "Type 2 Diabetes control. Keep glucose tablets handy for hypoglycemia."
            },
            {
                "name": "Tab Atorva 10mg",
                "sig": "0 - 0 - 1 (Night at bedtime)",
                "duration": "30 Days (Continuous)",
                "note": "Cholesterol lowering. Take after dinner before bed."
            }
        ],
        notes="Low salt, low glycemic index diet. 30 mins brisk walking daily. Fasting lipid & HbA1c repeat after 90 days."
    )

    # Sample 3: Respiratory & Antibiotic (Augmentin 625 Duo + Montair-LC)
    create_prescription_image(
        "sample_rx_respiratory_infection.png",
        header={
            "clinic_name": "APEX PULMONARY & ALLERGY CARE",
            "doctor_name": "Dr. Pritha Sen, M.D. (Respiratory Medicine)",
            "reg_no": "WBMC-92314",
            "qualifications": "Consultant Pulmonologist & Chest Specialist",
            "address": "48 Park Street Medical Hub, Kolkata | Helpline: 033-4019280",
            "patient_name": "Ananya Roy",
            "patient_age": "29 Yrs / Female",
            "date": "29-Sep-2026"
        },
        medicines=[
            {
                "name": "Tab Augmentin 625 Duo",
                "sig": "1 - 0 - 1 (Twice Daily)",
                "duration": "5 Days",
                "note": "Must complete full 5-day course. Take after food."
            },
            {
                "name": "Tab Montair-LC",
                "sig": "0 - 0 - 1 (Night at bedtime)",
                "duration": "10 Days",
                "note": "Allergic cough & rhinitis. May cause slight drowsiness."
            }
        ],
        notes="Steam inhalation twice daily. Avoid cold beverages and air pollutants. Hydrate well."
    )
