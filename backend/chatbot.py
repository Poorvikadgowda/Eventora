"""
GenericSwap AI Chatbot Engine:
Intelligent AI Pharmacist, Medicine History Guide & Multilingual Voice Assistant.
Provides context-aware answers regarding active molecules, bioequivalence,
Jan Aushadhi alternatives, drug allergies, medical history, and audio speech.
"""

import os
import re
from typing import Dict, List, Any, Optional
from backend.molecule_explainer import BIOEQUIVALENCE_EXPLAINER
from backend.multilingual_voice import (
    generate_audio_speech_base64,
    SUPPORTED_LANGUAGES,
    MULTILINGUAL_KNOWLEDGE,
    get_multilingual_response
)
from backend.medicine_history import check_clinical_safety


class GenericSwapChatbot:
    def __init__(self, drug_registry: List[Dict[str, Any]], jan_catalog: Dict[str, Dict[str, Any]]):
        self.drug_registry = drug_registry
        self.jan_catalog = jan_catalog
        self.gemini_api_key = os.environ.get("GEMINI_API_KEY", "")

    def generate_response(
        self,
        user_message: str,
        history: List[Dict[str, str]] = None,
        prescription_context: Optional[Dict[str, Any]] = None,
        patient_history: Optional[Dict[str, Any]] = None,
        language: str = "en",
        enable_voice: bool = True
    ) -> Dict[str, Any]:
        """
        Generate an intelligent, multilingual clinical response with optional speech audio.
        """
        msg_clean = user_message.lower().strip()
        history = history or []
        lang = language if language in SUPPORTED_LANGUAGES else "en"

        # If prescription context is provided, extract detected drugs
        active_rx_drugs = []
        if prescription_context and "medicines" in prescription_context:
            active_rx_drugs = prescription_context["medicines"]

        # Run clinical safety cross-check if both Rx and medical history exist
        safety_alert_text = ""
        if patient_history and active_rx_drugs:
            safety = check_clinical_safety(patient_history, active_rx_drugs)
            if not safety.get("is_clinically_safe"):
                critical_alerts = [a["message"] for a in safety.get("alerts", []) if a["severity"].startswith("CRITICAL")]
                if critical_alerts:
                    safety_alert_text = f"\n\n🚨 **URGENT MEDICAL HISTORY ALERT:**\n" + "\n".join([f"- {a}" for a in critical_alerts]) + "\n"

        # Check for multilingual responses when non-English is explicitly selected
        if lang != "en":
            # Check for history or general inquiries in native language
            res = get_multilingual_response(user_message, lang, patient_history, prescription_context)
            final_text = res["response"] + safety_alert_text
            audio_b64 = generate_audio_speech_base64(final_text, lang) if enable_voice else None
            return {
                "response": final_text,
                "language": lang,
                "audio_base64": audio_b64,
                "suggested_followups": [
                    "जन औषधि दवाएं कितनी सुरक्षित हैं?",
                    "मेरी मेडिकल हिस्ट्री चेक करें",
                    "साल भर में कितनी बचत होगी?"
                ] if lang == "hi" else ["Check my medicine history", "Are generics bioequivalent?"]
            }

        # --- ENGLISH RESPONSES ---

        # 1. Medical History Inquiries
        if any(w in msg_clean for w in ["history", "my record", "allergies", "allergy", "profile", "conditions", "past meds"]):
            if patient_history:
                name = patient_history.get("patient_name", "Patient")
                conds = ", ".join(patient_history.get("chronic_conditions", ["None recorded"]))
                allgs = ", ".join(patient_history.get("drug_allergies", ["No known allergies"]))
                med_list = [f"{m.get('brand_or_molecule')} ({m.get('strength', '')})" for m in patient_history.get("current_medications", [])]
                meds = ", ".join(med_list) if med_list else "None recorded"
                adverse = patient_history.get("past_adverse_reactions", "None recorded")

                response_text = (
                    f"### 📋 Medical History Review: {name}\n\n"
                    f"- **Chronic Conditions:** {conds}\n"
                    f"- **Known Drug Allergies:** 🚨 **{allgs}**\n"
                    f"- **Current Active Medications:** {meds}\n"
                    f"- **Past Adverse Reactions:** {adverse}\n\n"
                    f"🛡️ *All newly scanned prescriptions are continuously cross-checked against these allergies to prevent adverse drug reactions.*"
                )
                audio_b64 = generate_audio_speech_base64(response_text, "en") if enable_voice else None
                return {
                    "response": response_text,
                    "language": "en",
                    "audio_base64": audio_b64,
                    "suggested_followups": [
                        "Is my current prescription safe with my allergies?",
                        "Update my medicine history",
                        "Explain my current medications"
                    ]
                }

        # 2. Bioequivalence / "Are generics really as effective / safe?"
        if any(w in msg_clean for w in ["effective", "safe", "same", "real", "quality", "bioequivalent", "difference", "fake", "inferior", "trust"]):
            response_text = (
                "### 🛡️ Yes, Government-Approved Generics are 100% Bioequivalent & Safe!\n\n"
                "Here is why you can trust certified generics completely:\n\n"
                "1. **Identical Active Molecule (API):** A generic tablet contains the exact same active pharmaceutical ingredient, at the exact same clinical strength and purity as the expensive branded version.\n"
                "2. **Strict Clinical Bioequivalence Standards:** Both the **CDSCO (India)** and **WHO-GMP** mandate human bioequivalence trials. The rate of absorption (AUC and Cmax) must match between 80% and 125% of the originator drug, meaning your body absorbs it identically.\n"
                "3. **Why is it so much cheaper?** Branded manufacturers charge 5x to 10x higher prices to cover massive advertising, doctor sales representatives (MRs), and branding overhead. Government **Jan Aushadhi (PMBJP)** and certified generic producers spend ₹0 on advertising, passing 70%–90% direct savings to you.\n\n"
                "💡 *Tip:* Ask your chemist: *'Please provide the generic salt equivalent under Jan Aushadhi or a certified generic brand.'*"
            ) + safety_alert_text
            followups = [
                "How much can I save on my current prescription?",
                "What does my active molecule treat?",
                "How do I find the nearest Jan Aushadhi store?"
            ]
            audio_b64 = generate_audio_speech_base64(response_text, "en") if enable_voice else None
            return {"response": response_text, "language": "en", "audio_base64": audio_b64, "suggested_followups": followups}

        # 3. Explain current prescription / detected medicines
        if any(w in msg_clean for w in ["my prescription", "these medicines", "explain", "current", "what do these do", "what are my meds"]):
            if active_rx_drugs:
                lines = ["### 📋 Clinical Overview of Your Prescribed Medicines:\n"]
                for med in active_rx_drugs:
                    b_name = med.get("brand_name", "Medicine")
                    strength = med.get("strength", "")
                    t_class = med.get("therapeutic_class", "")
                    how = med.get("how_to_take", "As directed")
                    savings = med.get("savings_percentage", 0)
                    gen_price = med.get("generic_unit_price", 0)
                    brand_price = med.get("branded_unit_price", 0)

                    lines.append(f"**💊 {b_name}** (`{strength}`)")
                    lines.append(f"- **Purpose:** {t_class}")
                    lines.append(f"- **How to Take:** {how}")
                    lines.append(f"- **Generic Swap:** Available under Jan Aushadhi at **₹{gen_price:.2f}/tab** vs Branded **₹{brand_price:.2f}/tab** (**Save {savings}%**)\n")

                if safety_alert_text:
                    lines.append(safety_alert_text)

                lines.append("⚠️ *Always consult your physician before altering dosage or stopping chronic therapies.*")
                resp = "\n".join(lines)
                audio_b64 = generate_audio_speech_base64(resp, "en") if enable_voice else None
                return {
                    "response": resp,
                    "language": "en",
                    "audio_base64": audio_b64,
                    "suggested_followups": [
                        "Are there any side effects with these?",
                        "How much will I save each year on generics?",
                        "Check for drug allergies with my history"
                    ]
                }
            else:
                resp = (
                    "I would be glad to explain your medications! You haven't scanned a prescription yet in Tab 1.\n\n"
                    "You can either **upload a prescription photo** in Tab 1, or tell me the name of any medicine right here (e.g. *'What is Dolo 650?'* or *'Tell me about Telma 40'*)."
                )
                audio_b64 = generate_audio_speech_base64(resp, "en") if enable_voice else None
                return {
                    "response": resp,
                    "language": "en",
                    "audio_base64": audio_b64,
                    "suggested_followups": [
                        "What is Dolo 650?",
                        "What is Pantocid DSR?",
                        "What is Augmentin 625 Duo?"
                    ]
                }

        # 4. Savings / Price Difference
        if any(w in msg_clean for w in ["save", "saving", "savings", "price", "cost", "cheaper", "how much"]):
            if active_rx_drugs:
                tot_branded = sum(m.get("branded_unit_price", 0) * 30 for m in active_rx_drugs)
                tot_generic = sum(m.get("generic_unit_price", 0) * 30 for m in active_rx_drugs)
                net_month = max(0, tot_branded - tot_generic)
                net_year = net_month * 12
                pct = round((net_year / (tot_branded * 12)) * 100, 1) if tot_branded > 0 else 75.0

                resp = (
                    f"### 💰 Your Potential Savings Breakdown:\n\n"
                    f"- **Monthly Branded Cost (30-day supply):** ₹{tot_branded:.2f}\n"
                    f"- **Jan Aushadhi Generic Cost:** ₹{tot_generic:.2f}\n"
                    f"- **Monthly Savings:** **₹{net_month:.2f}**\n"
                    f"- **Estimated Annual Savings:** **₹{net_year:,.2f}** ({pct}% Saved!)\n\n"
                    f"By requesting the generic salt at a PMBJP Jan Aushadhi Kendra, you keep thousands of rupees in your pocket while receiving identical therapeutic benefits."
                )
            else:
                resp = (
                    "On average, government-certified **Jan Aushadhi generics save 70% to 90%** compared to branded medicines!\n\n"
                    "For example:\n"
                    "- **Pantocid DSR:** Branded ₹23.50/cap ➔ Jan Aushadhi **₹3.20/cap** (*86% Savings*)\n"
                    "- **Telma 40:** Branded ₹9.47/tab ➔ Jan Aushadhi **₹1.40/tab** (*85% Savings*)\n"
                    "- **Augmentin 625 Duo:** Branded ₹22.40/tab ➔ Jan Aushadhi **₹6.00/tab** (*73% Savings*)\n\n"
                    "Scan your prescription in Tab 1 to see your exact personal savings projection."
                )
            audio_b64 = generate_audio_speech_base64(resp, "en") if enable_voice else None
            return {
                "response": resp,
                "language": "en",
                "audio_base64": audio_b64,
                "suggested_followups": [
                    "Generate my generic prescription slip",
                    "Are these generics bioequivalent?",
                    "Where can I buy Jan Aushadhi medicines?"
                ]
            }

        # 5. How to buy / Where is Jan Aushadhi
        if any(w in msg_clean for w in ["chemist", "pharmacy", "buy", "store", "kendra", "jan aushadhi", "where", "ask"]):
            resp = (
                "### 🏪 How to Get Jan Aushadhi & Generic Medicines:\n\n"
                "1. **Locate a Jan Aushadhi Kendra:** India has over 10,000+ PMBJP Jan Aushadhi Kendras (often situated near government hospitals, railway stations, and major market areas). You can also use the official *Jan Aushadhi Sugam* mobile app or call **1800-180-8080**.\n"
                "2. **How to Ask Any Regular Chemist:**\n"
                "   - *'Do you have the generic version of this salt?'*\n"
                "   - Show them the **Generic Rx Slip** from Tab 6 of this app, which contains the exact active molecule and PMBJP code.\n"
                "   - Under National Medical Commission (NMC) guidelines, pharmacists are permitted and encouraged to offer bioequivalent generic substitutes."
            )
            audio_b64 = generate_audio_speech_base64(resp, "en") if enable_voice else None
            return {
                "response": resp,
                "language": "en",
                "audio_base64": audio_b64,
                "suggested_followups": [
                    "Download generic prescription slip",
                    "Is generic quality checked by government?",
                    "What if my chemist refuses generic?"
                ]
            }

        # 6. Specific drug lookup in the query
        for drug in self.drug_registry:
            brand_clean = drug["brand_name"].lower()
            first_word = brand_clean.split()[0]
            if first_word in msg_clean or brand_clean in msg_clean:
                gen = self.jan_catalog.get(drug.get("generic_molecule_slug", ""))
                gen_price = gen.get("jan_aushadhi_unit_price", 0.0) if gen else 0.0
                gen_code = gen.get("pmbjp_drug_code", "PMBJP Generic") if gen else "Generic"
                savings = drug.get("price_per_unit", 1.0) - gen_price
                pct = round((savings / drug.get("price_per_unit", 1.0)) * 100, 1) if drug.get("price_per_unit", 1.0) > 0 else 0

                indications = ", ".join(drug.get("typical_indications", []))
                precautions = " ".join(drug.get("precautions", []))

                resp = (
                    f"### 💊 Clinical Profile: {drug['brand_name']}\n\n"
                    f"- **Active Molecule (API):** **{drug['strength']}**\n"
                    f"- **Manufacturer:** {drug['manufacturer']}\n"
                    f"- **Therapeutic Class:** {drug['therapeutic_class']}\n"
                    f"- **What It Treats:** {indications}\n"
                    f"- **How It Works:** {drug.get('simple_explanation', '')}\n"
                    f"- **Clinical Dosage Advice:** {drug.get('how_to_take', '')}\n\n"
                    f"#### 💰 Generic Alternative:\n"
                    f"- **Jan Aushadhi Equivalent:** `{gen_code}` ({drug['strength']})\n"
                    f"- **Branded Price:** ₹{drug.get('price_per_unit', 0):.2f} / unit\n"
                    f"- **Jan Aushadhi Price:** **₹{gen_price:.2f} / unit**\n"
                    f"- **Direct Savings:** **{pct}%** (Save ₹{savings:.2f} per dose!)\n\n"
                    f"⚠️ **Key Precautions:** {precautions}"
                ) + safety_alert_text
                audio_b64 = generate_audio_speech_base64(resp, "en") if enable_voice else None
                return {
                    "response": resp,
                    "language": "en",
                    "audio_base64": audio_b64,
                    "suggested_followups": [
                        f"Is generic {drug['brand_name']} bioequivalent?",
                        "How do I ask my chemist for this salt?",
                        "Check against my medicine history"
                    ]
                }

        # Default intelligent response
        resp = (
            "👋 Hello! I am your **GenericSwap AI Pharmacist & Multilingual Voice Assistant**.\n\n"
            "I can guide your personal **Medicine History**, check drug allergies, and explain active molecules in English, हिंदी, தமிழ், తెలుగు, বাংলা, मराठी, and more!\n\n"
            "- 🔍 **Active Molecule Identification:** Discover the exact salt and dosage in your medicine.\n"
            "- 🛡️ **Medicine History Safety Check:** Cross-check new drugs against your chronic conditions and drug allergies.\n"
            "- 💰 **Generic Savings:** Find PMBJP Jan Aushadhi alternatives and save 70% to 90%.\n"
            "- 🎙️ **Voice Guidance:** Click the microphone or listen to spoken responses in your language.\n\n"
            "How can I assist you with your health and medications today?"
        )
        audio_b64 = generate_audio_speech_base64(resp, "en") if enable_voice else None
        return {
            "response": resp,
            "language": "en",
            "audio_base64": audio_b64,
            "suggested_followups": [
                "Review my medicine history and allergies",
                "Are generic medicines as safe as branded ones?",
                "Explain the medicines in my prescription",
                "What is the active salt in Dolo 650?"
            ]
        }
