from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.image_service import process_uploaded_image
from app.services.analysis_service import generate_analysis_prompt
from app.schemas.preferences_sсhema import UserPreferences
import json
from typing import Optional

router = APIRouter(tags=["Analysis"])

@router.post("/analyze")
async def analyze_product(
    file: UploadFile = File(...),
    preferences: Optional[str] = Form(None)
):
    """
    Отримує зображення + (необов’язково) користувацькі налаштування,
    надсилає запит до AI для аналізу продукту.
    """
    try:
        image_response = await process_uploaded_image(file)
        print("📸 Отримане фото:", image_response.model_dump())

        user_preferences = None
        if preferences:
            preferences_dict = json.loads(preferences)
            user_preferences = UserPreferences(**preferences_dict)
            print("⚙️ Отримані побажання:", user_preferences.model_dump())

        # 🧠 Генеруємо промпт і передаємо його до AI
        analysis_response = await generate_analysis_prompt(
            image_filename=image_response.filename,
            preferences=user_preferences
        )

        return {
            "message": "✅ Аналіз успішно виконано",
            "image_info": image_response.model_dump(),
            "preferences": user_preferences.model_dump() if user_preferences else None,
            "analysis_result": analysis_response["analysis_result"]
        }

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Невалідний JSON у полі preferences")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
