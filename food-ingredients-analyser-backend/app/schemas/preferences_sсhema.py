from pydantic import BaseModel
from typing import List, Optional


class UserPreferences(BaseModel):
    individual_features: Optional[List[str]] = []  # ["алергія", "непереносимість"]
    dietary_restrictions: Optional[List[str]] = []  # ["діабет", "вагітність", тощо]
    religious_restrictions: Optional[List[str]] = []  # ["іслам", "юдаїзм", "індуїзм"]
    lifestyle: Optional[List[str]] = []  # ["вегани", "вегетаріанці", "сироїди"]