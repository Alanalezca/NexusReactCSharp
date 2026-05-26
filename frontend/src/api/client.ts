// Entrée frontend des appels API

const API_URL = import.meta.env.VITE_API_URL;

function getDefaultErrorMessage(status: number) {
  switch (status) {
    case 400:
      return "Requête invalide.";
    case 401:
      return "Vous devez être connecté pour effectuer cette action.";
    case 403:
      return "Vous n'avez pas les droits nécessaires pour effectuer cette action.";
    case 404:
      return "Appel à une ressource introuvable.";
    case 500:
      return "Erreur serveur.";
    default:
      return `Erreur HTTP ${status}.`;
  }
}

function getApiErrorMessage(status: number, responseText: string) {
  if (!responseText.trim()) {
    return getDefaultErrorMessage(status);
  }

  try {
    const parsedError = JSON.parse(responseText);

    if (typeof parsedError === "string") {
      return parsedError;
    }

    if (typeof parsedError?.error === "string") {
      return parsedError.error;
    }

    if (typeof parsedError?.message === "string") {
      return parsedError.message;
    }

    if (typeof parsedError?.title === "string") {
      return parsedError.title;
    }
  } catch {
    return responseText;
  }

  return responseText;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let responseText = "";

    try {
      responseText = await response.text();
    } catch {}

    const message = getApiErrorMessage(response.status, responseText);

    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
