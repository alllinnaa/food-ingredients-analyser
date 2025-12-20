from typing import Optional
from app.schemas.preferences_sсhema import UserPreferences


class PromptBuilder:
    """Клас для побудови динамічного промпту для аналізу продукту"""
    
    BASE_PROMPT = """Ти — висококваліфікований експерт із харчової хімії, дієтології та законодавства про маркування продуктів харчування. Твоє завдання — провести глибокий, науково обґрунтований, але зрозумілий аналіз складу харчового продукту на основі наданого фото етикетки.

Вхідні дані: Я надаю тобі фото етикетки зі складом харчового продукту.

Вимоги до мови: Якщо інформація на фото надана не українською мовою, ти повинен перекласти її українською. Вся кінцева відповідь має бути виключно українською мовою.

Вимоги до формату: Кінцеву відповідь надай у структурованому форматі JSON, який суворо відповідає наданій схемі.

Твоє завдання:

1. Розпізнати назву продукту (поле назва_продукту). Якщо точної назви не вказано на фото, залиш поле пустим ("").
2. Виділити всі інгредієнти зі складу для детального аналізу.
3. Створити поле пояснення_споживачу, де людською мовою, просто та доступно будуть пояснені загальні тонкощі: позначки, скорочення (E-коди, ГМО), технологічні інгредієнти, взаємозамінні компоненти.
4. Для кожного інгредієнта у списку інгредієнти надати детальний аналіз: назва, опис (що це таке і для чого використовується, простими словами), користь (детально про користь або вказати "Не має прямої користі для здоров'я."), шкода (детально про потенційну шкоду або вказати "При дотриманні норм споживання вважається безпечним.")."""

    DIETARY_RESTRICTIONS = {
        "діабет": "diabetes",
        "вагітність": "pregnancy",
        "захворювання нирок": "kidney_disease",
        "діти до 3 років": "children_under_3_years",
        "гіпертонія": "hypertension",
        "гастрит": "gastritis",
        "виразка": "ulcer",
        "панкреатит": "pancreatitis",
        "подагра": "gout",
        "онкологія": "oncology",
        "ожиріння": "obesity",
        "анорексія": "anorexia"
    }

    RELIGIOUS_RESTRICTIONS = {
        "іслам": "islam",
        "юдаїзм": "judaism",
        "індуїзм": "hinduism"
    }

    LIFESTYLE_RESTRICTIONS = {
        "вегани": "vegans",
        "вегетаріанці": "vegetarians",
        "сироїди": "raw_foodists"
    }

    @staticmethod
    def build_prompt(preferences: Optional[UserPreferences] = None) -> str:
        """
        Формує динамічний промпт на основі побажань користувача
        """
        prompt_parts = [PromptBuilder.BASE_PROMPT]
        
        # Визначаємо, які секції потрібно аналізувати
        analyze_allergens = False
        analyze_intolerances = False
        analyze_dietary = []
        analyze_religious = []
        analyze_lifestyle = []
        
        if preferences:
            # Перевіряємо індивідуальні особливості
            if preferences.individual_features:
                if "Алергени" in preferences.individual_features:
                    analyze_allergens = True
                if "Непереносимість" in preferences.individual_features:
                    analyze_intolerances = True
            
            # Збираємо дієтичні обмеження
            if preferences.dietary_restrictions:
                analyze_dietary = preferences.dietary_restrictions
            
            # Збираємо релігійні обмеження
            if preferences.religious_restrictions:
                analyze_religious = preferences.religious_restrictions
            
            # Збираємо обмеження за способом харчування
            if preferences.lifestyle:
                analyze_lifestyle = preferences.lifestyle
        
        # Додаємо аналіз алергенів
        if analyze_allergens:
            prompt_parts.append("""
5. Надати інформацію про алергени: виділити інгредієнти та вказати, який саме тип алергену вони містять (наприклад, глютен, білок молока). Якщо компонент викликає і алергію, і непереносимість (наприклад, глютен), обов'язково включити його в обидва розділи.""")
        
        # Додаємо аналіз непереносимості
        if analyze_intolerances:
            prompt_parts.append("""
6. Надати інформацію про непереносимість: виділити інгредієнти та вказати, який тип непереносимості вони містять (наприклад, лактоза, глютен, гістамін). Не плутати з алергенами.""")
        
        # Додаємо аналіз обмежень
        if analyze_dietary or analyze_religious or analyze_lifestyle:
            restrictions_text = "\n7. Виділити загальні обмеження для продукту в цілому: для кожного типу обмеження вказати, чи підходить продукт (\"так\"/\"ні\"/\"з_обмеженнями\") та надати лаконічне, але детальне пояснення, вказавши конкретні інгредієнти, які на це впливають.\nПерелік обмежень для аналізу:"
            
            if analyze_dietary:
                dietary_list = ", ".join(analyze_dietary)
                restrictions_text += f"\nДієтичні: {dietary_list}."
            
            if analyze_religious:
                religious_list = ", ".join(analyze_religious)
                restrictions_text += f"\nРелігійні: {religious_list}."
            
            if analyze_lifestyle:
                lifestyle_list = ", ".join(analyze_lifestyle)
                restrictions_text += f"\nСпосіб харчування: {lifestyle_list}."
            
            prompt_parts.append(restrictions_text)
        
        # Формуємо JSON схему
        json_schema = PromptBuilder._build_json_schema(
            analyze_allergens, 
            analyze_intolerances,
            analyze_dietary,
            analyze_religious,
            analyze_lifestyle
        )
        
        prompt_parts.append(f"\n\nФормат відповіді (JSON):\n{json_schema}")
        
        return "\n".join(prompt_parts)
    
    @staticmethod
    def _build_json_schema(
        include_allergens: bool,
        include_intolerances: bool,
        dietary_restrictions: list,
        religious_restrictions: list,
        lifestyle_restrictions: list
    ) -> str:
        """Формує JSON схему на основі вибраних параметрів"""
        
        schema = """{
"product_name": "Назва продукту з етикетки",
"consumer_explanation": "Пояснення людською мовою про E-коди, скорочення, технологічні компоненти тощо.",
"ingredients": [
{
"name": "Назва_Інгредієнта_1",
"description": "Що це таке і для чого використовується.",
"benefits": "Детальна інформація про користь або її відсутність.",
"harm": "Детальна інформація про потенційну шкоду або її відсутність."
}
]"""
        
        if include_allergens:
            schema += """,
"allergens": [
{
"ingredient": "Інгредієнт, що викликає алергію",
"allergen_type": "Який саме алерген міститься (наприклад, глютен, білок молока, арахіс)"
}
]"""
        
        if include_intolerances:
            schema += """,
"intolerances": [
{
"ingredient": "Інгредієнт, що викликає непереносимість",
"intolerance_type": "Тип непереносимості (наприклад, лактоза, глютен, гістамін, фруктоза)"
}
]"""
        
        # Додаємо секцію обмежень, якщо є хоча б одне
        if dietary_restrictions or religious_restrictions or lifestyle_restrictions:
            schema += ',\n"restrictions": {'
            
            restrictions_parts = []
            
            # Дієтичні обмеження
            if dietary_restrictions:
                dietary_schema = '\n"dietary": {'
                dietary_items = []
                for restriction in dietary_restrictions:
                    key = PromptBuilder.DIETARY_RESTRICTIONS.get(restriction.lower())
                    if key:
                        dietary_items.append(f"""
"{key}": {{
"suitable": "так/ні/з_обмеженнями",
"explanation": "Чому можна/не можна, які саме інгредієнти впливають."
}}""")
                dietary_schema += ",".join(dietary_items)
                dietary_schema += '\n}'
                restrictions_parts.append(dietary_schema)
            
            # Релігійні обмеження
            if religious_restrictions:
                religious_schema = '\n"religious": {'
                religious_items = []
                for restriction in religious_restrictions:
                    key = PromptBuilder.RELIGIOUS_RESTRICTIONS.get(restriction.lower())
                    if key:
                        explanation = "халяль" if key == "islam" else "кошер" if key == "judaism" else ""
                        religious_items.append(f"""
"{key}": {{
"suitable": "так/ні/з_обмеженнями",
"explanation": "Чому можна/не можна{' (' + explanation + ')' if explanation else ''}, які саме інгредієнти впливають."
}}""")
                religious_schema += ",".join(religious_items)
                religious_schema += '\n}'
                restrictions_parts.append(religious_schema)
            
            # Обмеження за способом харчування
            if lifestyle_restrictions:
                lifestyle_schema = '\n"eating_style": {'
                lifestyle_items = []
                for restriction in lifestyle_restrictions:
                    key = PromptBuilder.LIFESTYLE_RESTRICTIONS.get(restriction.lower())
                    if key:
                        lifestyle_items.append(f"""
"{key}": {{
"suitable": "так/ні/з_обмеженнями",
"explanation": "Чому можна/не можна, які саме інгредієнти впливають."
}}""")
                lifestyle_schema += ",".join(lifestyle_items)
                lifestyle_schema += '\n}'
                restrictions_parts.append(lifestyle_schema)
            
            schema += ",".join(restrictions_parts)
            schema += '\n}'
        
        schema += '\n}'
        
        return schema