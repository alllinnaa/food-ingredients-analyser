from app.schemas.preferences_sсhema import UserPreferences
from app.services.prompt_builder import PromptBuilder
from app.services.ai_service import AIService
from typing import Optional, Dict, Any

async def generate_analysis_prompt(
    image_filename: str,
    preferences: Optional[UserPreferences] = None
) -> Dict[str, Any]:
    """
    Генерує фінальний промпт для аналізу продукту і викликає модель AI.
    """
    prompt = PromptBuilder.build_prompt(preferences)

    print("\n" + "=" * 80)
    print(f"📄 СФОРМОВАНИЙ ПРОМПТ ДЛЯ АНАЛІЗУ ФОТО: {image_filename}")
    print("=" * 80)
    print(prompt)
    print("=" * 80 + "\n")

    # ✅ Викликаємо AI модель (зараз — імітація)
    result = await AIService.analyze_product(prompt, image_filename)

    return {
        "image_filename": image_filename,
        "prompt_preview": prompt[:500] + "...",  # лише для відлагодження
        "analysis_result": result
    }
