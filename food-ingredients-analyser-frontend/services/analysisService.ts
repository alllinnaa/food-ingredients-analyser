import { apiRequest } from "../api/api";

export async function sendImageWithPreferences(
  imageUri: string, 
  preferences: any
) {
  const formData = new FormData();
  
  formData.append("file", {
    uri: imageUri,
    type: "image/jpeg",
    name: "product_photo.jpg",
  } as any);

  formData.append("preferences", JSON.stringify(preferences));

  return apiRequest("/analyze", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: formData,
  });
}