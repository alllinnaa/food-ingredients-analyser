import { apiRequest } from "../api/api";

export async function sendImageWithPreferences(images: string[], preferences: string[]) {
  const formData = new FormData();

  images.forEach((uri, index) => {
    formData.append("files", {
      uri,
      type: "image/jpeg",
      name: `photo_${index}.jpg`,
    } as any);
  });


  formData.append("preferences", JSON.stringify(preferences));

  return apiRequest("/analyze", {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  });
}