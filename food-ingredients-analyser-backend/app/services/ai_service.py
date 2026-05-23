import json
import asyncio
from google import genai
from google.genai import types
from google.api_core.exceptions import ServiceUnavailable, ResourceExhausted
from PIL import Image
from typing import List, Dict, Any

from app.core.config import settings

client = genai.Client(api_key=settings.gemini_api_key)


class AIService:
    @staticmethod
    async def analyze_product(
        prompt: str,
        images: List[Image.Image]
    ) -> Dict[str, Any]:
        contents = [prompt] + images

        try:
            response = await asyncio.wait_for(
                client.aio.models.generate_content(
                    model='gemini-2.5-pro',
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.3,
                        thinking_config=types.ThinkingConfig(thinking_budget=512)
                    )
                ),
                timeout=30
            )

            return json.loads(response.text)

        except asyncio.TimeoutError:
            raise RuntimeError("Час очікування відповіді вичерпано, спробуйте пізніше")
        except ServiceUnavailable:
            raise RuntimeError("Сервіс аналізу тимчасово недоступний, спробуйте пізніше")
        except ResourceExhausted:
            raise RuntimeError("Перевищено ліміт запитів, спробуйте пізніше")
        except json.JSONDecodeError:
            raise RuntimeError("Не вдалося розпізнати відповідь нейромережі")