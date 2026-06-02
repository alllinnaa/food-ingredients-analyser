import json
import asyncio
import logging
from google import genai
from google.genai import types
from google.api_core.exceptions import ServiceUnavailable, ResourceExhausted, DeadlineExceeded, ServerError
from PIL import Image
from typing import List, Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)
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
                timeout=50
            )

            return json.loads(response.text)

        except asyncio.TimeoutError:
            logger.error("Gemini timeout: відповідь не отримана за 50 секунд")
            raise RuntimeError("Час очікування відповіді вичерпано. Спробуйте ще раз — зазвичай допомагає")

        except ResourceExhausted as e:
            logger.error(f"Gemini ResourceExhausted (ліміт запитів): {e}")
            raise RuntimeError("Зараз дуже багато запитів до сервісу аналізу. Спробуйте через 1–2 хвилини")

        except ServiceUnavailable as e:
            logger.error(f"Gemini ServiceUnavailable: {e}")
            raise RuntimeError("Сервіс аналізу тимчасово недоступний. Спробуйте через кілька хвилин")

        except DeadlineExceeded as e:
            logger.error(f"Gemini DeadlineExceeded: {e}")
            raise RuntimeError("Час очікування відповіді вичерпано. Спробуйте ще раз")

        except ServerError as e:
            logger.error(f"Gemini ServerError (помилка на стороні Google): {e}")
            raise RuntimeError("Сервіс аналізу тимчасово не працює на стороні Google. Спробуйте через кілька хвилин")

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error від Gemini: {e}")
            raise RuntimeError("Не вдалося розпізнати відповідь нейромережі. Спробуйте ще раз")

        except Exception as e:
            logger.error(f"Невідома помилка Gemini ({type(e).__name__}): {e}")
            raise RuntimeError("Під час аналізу сталася непередбачена помилка. Спробуйте ще раз")