import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from PIL import Image
from typing import List, Dict, Any

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

class AIService:
    @staticmethod
    async def analyze_product(
        prompt: str,
        images: List[Image.Image]
    ) -> Dict[str, Any]:
        contents = [prompt] + images

        try:
            response = await client.aio.models.generate_content(
                model='gemini-2.5-pro', 
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json", 
                    temperature=0.3, 
                    thinking_config=types.ThinkingConfig(thinking_budget=512)
                )
            )
            
            return json.loads(response.text)

        except json.JSONDecodeError:
            print("Помилка: Gemini повернув невалідний JSON")
            return {"error": "Не вдалося розпізнати відповідь нейромережі."}
        except Exception as e:
            print(f"Помилка API Gemini: {str(e)}")
            return {"error": f"Виникла помилка під час аналізу: {str(e)}"}