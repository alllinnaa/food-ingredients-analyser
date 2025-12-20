from PIL import Image
from fastapi import UploadFile
from io import BytesIO
from app.schemas.image_schema import ImageResponse

async def process_uploaded_image(file: UploadFile) -> ImageResponse:
    """
    Зчитує зображення, перевіряє тип і повертає Pydantic-модель з інформацією.
    """
    if not file.content_type.startswith("image/"):
        raise ValueError("Неправильний формат файлу. Очікується зображення.")

    contents = await file.read()
    image = Image.open(BytesIO(contents))

    return ImageResponse(
        filename=file.filename,
        format=image.format,
        size=image.size
    )
