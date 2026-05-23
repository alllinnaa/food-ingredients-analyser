from typing import List
from io import BytesIO

from fastapi import UploadFile
from PIL import Image


async def process_uploaded_images(
    files: List[UploadFile]
) -> List[Image.Image]:
    images = []

    for file in files:
        if not file.content_type.startswith("image/"):
            raise ValueError(f"Файл {file.filename} не є зображенням")

        contents = await file.read()
        image = Image.open(BytesIO(contents))
        image.load()
        images.append(image)

    return images