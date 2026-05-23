from typing import List, Dict, Any
from PIL import Image

from app.services.prompt_builder import PromptBuilder
from app.services.ai_service import AIService


async def generate_analysis(
    images: List[Image.Image],
    preferences: List[str]
) -> Dict[str, Any]:
    prompt = PromptBuilder.build_prompt(preferences)
    return await AIService.analyze_product(prompt=prompt, images=images)