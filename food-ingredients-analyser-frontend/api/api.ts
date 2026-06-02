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

    if (response.status === 502) {
      throw new Error("Сервер тимчасово недоступний. Спробуйте через хвилину");
    } else if (response.status === 503) {
      throw new Error(detail || "Сервіс тимчасово недоступний. Спробуйте через кілька хвилин");
    } else if (response.status === 429) {
      throw new Error("Забагато запитів. Спробуйте через 1–2 хвилини");
    } else if (response.status === 400) {
      throw new Error(detail || "Невірний запит");
    } else {
      throw new Error(detail || "Щось пішло не так. Спробуйте ще раз");
    }
  }

  return response.json();
}