import json 
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import List, Optional

from app.services.image_service import process_uploaded_images
from app.services.analysis_service import generate_analysis

router = APIRouter(tags=["Analysis"])


@router.post("/analyze")
async def analyze_product(
    files: List[UploadFile] = File(...),
    preferences: Optional[str] = Form(default="[]") 
):
    try:
        if len(files) == 0:
            raise HTTPException(
                status_code=400,
                detail="Не передано жодного фото"
            )

        if len(files) > 4:
            raise HTTPException(
                status_code=400,
                detail="Можна передати максимум 4 фото"
            )

        try:
            parsed_preferences = json.loads(preferences)
        except json.JSONDecodeError:
             parsed_preferences = []

        images_info, pil_images = await process_uploaded_images(files)

        analysis_response = await generate_analysis(images_info, pil_images, parsed_preferences)

        return analysis_response

    except HTTPException:
        raise
    except Exception as e:
        print(f"Помилка сервера: {e}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )