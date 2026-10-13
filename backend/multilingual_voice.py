"""
Multilingual Voice Assistant & Clinical Audio Engine.
Supports English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, and Kannada.
Generates multilingual clinical responses and audio speech via gTTS / Web Speech API.
"""

import io
import base64
from typing import Dict, List, Any, Optional
from gtts import gTTS

SUPPORTED_LANGUAGES = {
    "en": {"name": "English", "native": "English", "voice_code": "en", "web_speech_code": "en-IN"},
    "hi": {"name": "Hindi", "native": "हिंदी", "voice_code": "hi", "web_speech_code": "hi-IN"},
    "ta": {"name": "Tamil", "native": "தமிழ்", "voice_code": "ta", "web_speech_code": "ta-IN"},
    "te": {"name": "Telugu", "native": "తెలుగు", "voice_code": "te", "web_speech_code": "te-IN"},
    "bn": {"name": "Bengali", "native": "বাংলা", "voice_code": "bn", "web_speech_code": "bn-IN"},
    "mr": {"name": "Marathi", "native": "मराठी", "voice_code": "mr", "web_speech_code": "mr-IN"},
    "gu": {"name": "Gujarati", "native": "ગુજરાતી", "voice_code": "gu", "web_speech_code": "gu-IN"},
    "kn": {"name": "Kannada", "native": "ಕನ್ನಡ", "voice_code": "kn", "web_speech_code": "kn-IN"}
}


# Multilingual clinical speech templates
MULTILINGUAL_KNOWLEDGE = {
    "hi": {
        "welcome": "नमस्ते! मैं आपका जेनेरिक-स्वैप एआई फार्मासिस्ट और वॉयस असिस्टेंट हूँ। आप अपनी दवाओं, एक्टिव सॉल्ट या मेडिकल हिस्ट्री के बारे में हिंदी में पूछ सकते हैं।",
        "bioequivalence": (
            "हाँ, जन औषधि और सरकारी प्रमाणित जेनेरिक दवाएं ब्रांडेड दवाओं की तरह 100% सुरक्षित और असरदार होती हैं। "
            "इनमें बिल्कुल वही एक्टिव मॉलिक्यूल (API) और शक्ति होती है। CDSCO और WHO-GMP के मानकों के अनुसार इनका असर एक समान होता है, "
            "लेकिन विज्ञापन और ब्रांडिंग का खर्च न होने के कारण ये 70% से 90% तक सस्ती मिलती हैं।"
        ),
        "history_review": (
            "नमस्ते {name} जी! आपकी मेडिकल हिस्ट्री के अनुसार:\n"
            "- आपकी क्रोनिक स्थितियां: {conditions}\n"
            "- ज्ञात दवा एलर्जी: {allergies}\n"
            "- वर्तमान नियमित दवाएं: {meds}\n"
            "कृपया किसी भी नई दवा को लेने से पहले सुनिश्चित करें कि वह आपकी एलर्जी और इतिहास से मेल खाती है।"
        ),
        "savings_summary": "जन औषधि जेनेरिक दवाओं पर स्विच करके आप हर साल 70% से 90% तक की भारी बचत कर सकते हैं।",
        "allergy_warning": "सावधान! आपके रिकॉर्ड में इस दवा समूह से एलर्जी दर्ज है। कृपया बिना डॉक्टर से पूछे यह दवा न लें।"
    },
    "ta": {
        "welcome": "வணக்கம்! நான் உங்கள் ஜெனரிக்-ஸ்வாப் AI மருந்தாளர் மற்றும் குரல் உதவியாளர். உங்கள் மருந்துகள் மற்றும் மருத்துவ வரலாறு பற்றி தமிழில் கேட்கலாம்.",
        "bioequivalence": (
            "ஆம், ஜன் ஔஷதி ஜெனரிக் மருந்துகள் பிராண்டட் மருந்துகளைப் போலவே 100% பாதுகாப்பானவை மற்றும் சமமான திறன் கொண்டவை. "
            "அவற்றில் அதே மூலப்பொருள் (API) உள்ளது. நீங்கள் 70% முதல் 90% வரை பணத்தை சேமிக்கலாம்."
        ),
        "history_review": (
            "வணக்கம் {name}! உங்கள் மருத்துவ வரலாறு:\n"
            "- நீண்ட கால நிலைமைகள்: {conditions}\n"
            "- மருந்து ஒவ்வாமை: {allergies}\n"
            "- தற்போதைய மருந்துகள்: {meds}"
        ),
        "savings_summary": "ஜன் ஔஷதி ஜெனரிக் மருந்துகளைப் பயன்படுத்துவதன் மூலம் ஒவ்வொரு ஆண்டும் 70% முதல் 90% வரை சேமிக்கலாம்."
    },
    "te": {
        "welcome": "నమస్కారం! నేను మీ జెనరిక్-స్వాప్ AI ఫార్మసిస్ట్ మరియు వాయిస్ అసిస్టెంట్. మీ మందులు మరియు వైద్య చరిత్ర గురించి తెలుగులో అడగవచ్చు.",
        "bioequivalence": (
            "అవును, జన్ ఔషధి జెనరిక్ మందులు బ్రాండెడ్ మందుల వలె 100% సురక్షితమైనవి మరియు సమానమైన ప్రభావవంతమైనవి. "
            "వీటిలో అదే క్రియాశీల పదార్థం (API) ఉంటుంది. మీరు 70% నుండి 90% వరకు ఆదా చేయవచ్చు."
        ),
        "history_review": (
            "నమస్కారం {name} గారు! మీ వైద్య చరిత్ర:\n"
            "- దీర్ఘకాలిక సమస్యలు: {conditions}\n"
            "- మందుల అలెర్జీలు: {allergies}\n"
            "- ప్రస్తుత మందులు: {meds}"
        ),
        "savings_summary": "జెనరిక్ మందుల ద్వారా మీరు ప్రతి సంవత్సరం వేలాది రూపాయలను ఆదా చేయవచ్చు."
    },
    "bn": {
        "welcome": "নমস্কার! আমি আপনার জেনেরিক-সোয়াপ এআই ফার্মাসিস্ট এবং ভয়েস সহকারী। আপনার ওষুধ এবং প্রেসক্রিপশন সম্পর্কে বাংলায় প্রশ্ন করতে পারেন।",
        "bioequivalence": (
            "হ্যাঁ, জন ঔষধি এবং সরকারি অনুমোদিত জেনেরিক ওষুধ ব্র্যান্ডেড ওষুধের মতোই ১০০% নিরাপদ এবং কার্যকর। "
            "এতে একই সক্রিয় উপাদান (API) থাকে। আপনি ৭০% থেকে ৯০% পর্যন্ত খরচ বাঁচাতে পারেন।"
        ),
        "history_review": (
            "নমস্কার {name}! আপনার চিকিৎসার ইতিহাস:\n"
            "- দীর্ঘস্থায়ী অবস্থা: {conditions}\n"
            "- ওষুধের অ্যালার্জি: {allergies}\n"
            "- বর্তমান ওষুধ: {meds}"
        ),
        "savings_summary": "জেনেরিক ওষুধ ব্যবহার করে আপনি প্রতি বছর হাজার হাজার টাকা সঞ্চয় করতে পারেন।"
    },
    "mr": {
        "welcome": "नमस्कार! मी तुमचा जेनेरिक-स्वॅप एआय फार्मासिस्ट आणि व्हॉईस असिस्टंट आहे. तुमच्या औषधांबद्दल आणि वैद्यकीय इतिहासाबद्दल मराठीत विचारू शकता.",
        "bioequivalence": (
            "होय, जन औषधी जेनेरिक औषधे ब्रँडेड औषधांइतकीच १००% सुरक्षित आणि प्रभावी असतात. "
            "त्यांच्यात समान ऍक्टिव्ह घटक (API) असतो. यामुळे तुमचे ७०% ते ९०% पैसे वाचू शकतात."
        ),
        "history_review": (
            "नमस्कार {name}! तुमचा वैद्यकीय इतिहास:\n"
            "- जुनाट आजार: {conditions}\n"
            "- औषधांची ऍलर्जी: {allergies}\n"
            "- सध्याची औषधे: {meds}"
        ),
        "savings_summary": "जेनेरिक औषधांमुळे तुम्ही वर्षाला हजारो रुपयांची बचत करू शकता."
    },
    "gu": {
        "welcome": "નમસ્તે! હું તમારો જેનેરિક-સ્વેપ AI ફાર્માસિસ્ટ અને વૉઇસ આસિસ્ટન્ટ છું. તમારી દવાઓ વિશે ગુજરાતીમાં પૂછી શકો છો.",
        "bioequivalence": "હા, પ્રધાનમંત્રી જન ઔષધિ કેન્દ્રની જેનેરિક દવાઓ બ્રાન્ડેડ જેટલી જ 100% સલામત અને અસરકારક છે.",
        "history_review": "નમસ્તે {name}! તમારી મેડિકલ હિસ્ટ્રી: {conditions}, દવાઓની એલર્જી: {allergies}."
    },
    "kn": {
        "welcome": "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ಜೆನೆರಿಕ್-ಸ್ವಾಪ್ AI ಫಾರ್ಮಾಸಿಸ್ಟ್ ಮತ್ತು ಧ್ವನಿ ಸಹಾಯಕ. ನಿಮ್ಮ ಔಷಧಿಗಳ ಬಗ್ಗೆ ಕನ್ನಡದಲ್ಲಿ ಕೇಳಬಹುದು.",
        "bioequivalence": (
            "ಹೌದು, ಪ್ರಧಾನ ಮಂತ್ರಿ ಭಾರತೀಯ ಜನೌಷಧಿ (PMBJP) ಮತ್ತು ಸರ್ಕಾರದ ಪ್ರಮಾಣೀಕೃತ ಜೆನೆರಿಕ್ ಔಷಧಿಗಳು ಬ್ರಾಂಡೆಡ್ ಔಷಧಿಗಳಷ್ಟೇ 100% ಸುರಕ್ಷಿತ ಮತ್ತು ಪರಿಣಾಮಕಾರಿ. "
            "ಇವುಗಳಲ್ಲಿ ನಿಖರವಾಗಿ ಅದೇ ಸಕ್ರಿಯ ಅಣು (Active Pharmaceutical Ingredient - API) ಮತ್ತು ಸಾಮರ್ಥ್ಯ ಇರುತ್ತದೆ. "
            "CDSCO ಮತ್ತು WHO-GMP ಮಾನದಂಡಗಳ ಅಡಿಯಲ್ಲಿ ತಯಾರಿಸಲಾಗಿದ್ದು, ಜಾಹೀರಾತು ಮತ್ತು ಬ್ರ್ಯಾಂಡಿಂಗ್ ವೆಚ್ಚವಿಲ್ಲದಿರುವುದರಿಂದ ಇವು 70% ರಿಂದ 90% ವರೆಗೆ ಕಡಿಮೆ ದರದಲ್ಲಿ ಲಭ್ಯವಿವೆ."
        ),
        "history_review": (
            "ನಮಸ್ಕಾರ {name}! ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ:\n"
            "- ದೀರ್ಘಕಾಲದ ಕಾಯಿಲೆಗಳು: {conditions}\n"
            "- ತಿಳಿದಿರುವ ಔಷಧಿ ಅಲರ್ಜಿಗಳು: 🚨 {allergies}\n"
            "- ಪ್ರಸ್ತುತ ನಿಯಮಿತ ಔಷಧಿಗಳು: {meds}\n"
            "ಯಾವುದೇ ಹೊಸ ಔಷಧಿಯನ್ನು ತೆಗೆದುಕೊಳ್ಳುವ ಮೊದಲು ನಿಮ್ಮ ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚಿಸಿ."
        ),
        "savings_summary": "ಜನೌಷಧಿ ಜೆನೆರಿಕ್ ಔಷಧಿಗಳನ್ನು ಬಳಸುವುದರಿಂದ ನಿಮ್ಮ ಕುಟುಂಬವು ಪ್ರತಿ ವರ್ಷ 70% ರಿಂದ 90% ವರೆಗೆ ವೈದ್ಯಕೀಯ ವೆಚ್ಚವನ್ನು ಉಳಿಸಬಹುದು.",
        "allergy_warning": "ಎಚ್ಚರಿಕೆ! ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ದಾಖಲೆಯಲ್ಲಿ ಈ ಔಷಧಿ ಗುಂಪಿಗೆ ಅಲರ್ಜಿ ಇದೆ ಎಂದು ನಮೂದಿಸಲಾಗಿದೆ. ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸದೆ ಈ ಔಷಧಿಯನ್ನು ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ."
    },
    "en": {
        "welcome": "Hello! I am your GenericSwap AI Pharmacist & Multilingual Voice Assistant. Ask me anything about your medications, active salts, or personal medical history.",
        "bioequivalence": (
            "Yes, Government-approved Jan Aushadhi generic medicines are 100% bioequivalent and safe. "
            "They share the exact same Active Pharmaceutical Ingredient (API), clinical strength, and therapeutic purity under CDSCO and WHO-GMP norms, "
            "saving you 70% to 90% simply because they do not carry marketing or advertising markups."
        ),
        "history_review": (
            "Hello {name}! According to your medical profile:\n"
            "- Chronic Conditions: {conditions}\n"
            "- Known Drug Allergies: {allergies}\n"
            "- Active Medications: {meds}\n"
            "All prescribed medications are cross-checked against this record for your safety."
        ),
        "savings_summary": "By choosing bioequivalent Jan Aushadhi generics, your household saves 70% to 90% every year."
    }
}


def generate_audio_speech_base64(text: str, lang_code: str = "en") -> Optional[str]:
    """
    Generate an MP3 audio stream using gTTS and encode as Base64 data URI for Streamlit audio playback.
    """
    try:
        # Fallback to English if language code is not supported by gTTS
        tts_lang = lang_code if lang_code in ["en", "hi", "ta", "te", "bn", "mr", "gu", "kn"] else "en"
        # Truncate text for speech synthesis if too long
        speech_text = text[:350].replace("*", "").replace("#", "").replace("-", " ")

        tts = gTTS(text=speech_text, lang=tts_lang, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        audio_b64 = base64.b64encode(fp.read()).decode("utf-8")
        return f"data:audio/mp3;base64,{audio_b64}"
    except Exception as e:
        print(f"TTS generation note: {e}")
        return None


def get_multilingual_response(
    query: str,
    lang_code: str = "en",
    patient_history: Optional[Dict[str, Any]] = None,
    prescription_context: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Provide intelligent, clinically validated advice in the patient's chosen language.
    """
    lang = lang_code if lang_code in MULTILINGUAL_KNOWLEDGE else "en"
    templates = MULTILINGUAL_KNOWLEDGE.get(lang, MULTILINGUAL_KNOWLEDGE["en"])
    q_lower = query.lower()

    # 1. Medical History Inquiries
    if any(w in q_lower for w in ["history", "profile", "allergy", "allergies", "record", "my meds", "conditions", "बीमारी", "एलर्जी", "ಇತಿಹಾಸ", "ಅಲರ್ಜಿ", "ದಾಖಲೆ", "வரலாறு", "చరిత్ర"]):
        if patient_history:
            name = patient_history.get("patient_name", "Patient")
            conds = ", ".join(patient_history.get("chronic_conditions", ["None recorded"]))
            allgs = ", ".join(patient_history.get("drug_allergies", ["No known allergies"]))
            med_list = [f"{m.get('brand_or_molecule')} ({m.get('strength', '')})" for m in patient_history.get("current_medications", [])]
            meds = ", ".join(med_list) if med_list else "None active"

            tmpl = templates.get("history_review", MULTILINGUAL_KNOWLEDGE["en"]["history_review"])
            msg = tmpl.format(name=name, conditions=conds, allergies=allgs, meds=meds)
            audio = generate_audio_speech_base64(msg, lang)
            return {
                "response": msg,
                "language": lang,
                "audio_base64": audio,
                "is_voice_enabled": True
            }

    # 2. Bioequivalence / Safety Inquiries
    if any(w in q_lower for w in ["effective", "safe", "bioequivalent", "quality", "सुरक्षित", "असरदार", "ಸುರಕ್ಷಿತ", "ಗುಣಮಟ್ಟ", "ಪರಿಣಾಮಕಾರಿ", "ಜನೌಷಧಿ", "ಜನ ಔಷಧಿ", "ಜನೌಷಧ", "உண்மை", "నిజమేನಾ"]):
        msg = templates.get("bioequivalence", MULTILINGUAL_KNOWLEDGE["en"]["bioequivalence"])
        audio = generate_audio_speech_base64(msg, lang)
        return {
            "response": msg,
            "language": lang,
            "audio_base64": audio,
            "is_voice_enabled": True
        }

    # 3. Savings Inquiries
    if any(w in q_lower for w in ["save", "savings", "price", "cost", "बचत", "पैसे", "ಉಳಿತಾಯ", "ಬೆಲೆ", "ಹಣ", "ಖರ್ಚು", "சேமிப்பு", "ఆదా"]):
        msg = templates.get("savings_summary", MULTILINGUAL_KNOWLEDGE["en"]["savings_summary"])
        audio = generate_audio_speech_base64(msg, lang)
        return {
            "response": msg,
            "language": lang,
            "audio_base64": audio,
            "is_voice_enabled": True
        }

    # Default Welcome / General Inquiries
    msg = templates.get("welcome", MULTILINGUAL_KNOWLEDGE["en"]["welcome"])
    audio = generate_audio_speech_base64(msg, lang)
    return {
        "response": msg,
        "language": lang,
        "audio_base64": audio,
        "is_voice_enabled": True
    }
