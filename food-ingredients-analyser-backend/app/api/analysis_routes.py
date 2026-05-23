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
        if len(files) > 4:
            raise HTTPException(
                status_code=400,
                detail="Можна передати максимум 4 фото"
            )

        try:
            parsed_preferences = json.loads(preferences)
        except json.JSONDecodeError:
            parsed_preferences = []

        images = await process_uploaded_images(files)
        return await generate_analysis(images, parsed_preferences)

    except HTTPException:
        raise
    except RuntimeError as e:
        print(f"RuntimeError: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        print(f"Exception: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail=str(e))