import { API_URL } from "../constants/config";

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Помилка сервера: ${response.status}`);
  }

  return response.json();
}
