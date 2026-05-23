from pydantic import BaseModel
from typing import Tuple


class ImageResponse(BaseModel):
    filename: str
    format: str
    size: Tuple[int, int]