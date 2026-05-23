from typing import List, Dict, Any
from PIL import Image

from app.schemas.image_schema import ImageResponse
from app.services.prompt_builder import PromptBuilder
from app.services.ai_service import AIService


async def generate_analysis(
    images_info: List[ImageResponse],
    pil_images: List[Image.Image],
    preferences: List[str]
) -> Dict[str, Any]:

    prompt = PromptBuilder.build_prompt(preferences)
    filenames = [img.filename for img in images_info]

    result = await AIService.analyze_product(
        prompt=prompt,
        images=pil_images
    )

    return {
        "image_filenames": filenames,
        "analysis_result": result
    }