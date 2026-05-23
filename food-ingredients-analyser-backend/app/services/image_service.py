from typing import List, Tuple
from io import BytesIO

from fastapi import UploadFile
from PIL import Image

from app.schemas.image_schema import ImageResponse


async def process_uploaded_images(
    files: List[UploadFile]
) -> Tuple[List[ImageResponse], List[Image.Image]]:
    images_info = []
    pil_images = []

    for file in files:
        if not file.content_type.startswith("image/"):
            raise ValueError(
                f"Файл {file.filename} не є зображенням"
            )

        contents = await file.read()
        image = Image.open(BytesIO(contents))
        image.load()
        image_info = ImageResponse(
            filename=file.filename,
            format=image.format or "JPEG",
            size=image.size
        )

        images_info.append(image_info)
        pil_images.append(image)

    return images_info, pil_images