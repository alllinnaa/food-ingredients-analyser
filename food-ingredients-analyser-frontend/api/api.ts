import { API_URL } from "../constants/config";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  let response: Response;
  
  try {
    response = await fetch(url, options);
  } catch {
    throw new Error("Немає з'єднання з інтернетом або сервер недоступний");
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body.detail || "";
    } catch {}

    if (response.status === 503) {
      throw new Error(detail || "Сервіс тимчасово недоступний, спробуйте пізніше");
    } else if (response.status === 429) {
      throw new Error("Перевищено ліміт запитів, спробуйте через 1-2 хвилини");
    } else if (response.status === 400) {
      throw new Error(detail || "Невірний запит");
    } else {
      throw new Error(detail || `Помилка сервера: ${response.status}`);
    }
  }

  return response.json();
}
