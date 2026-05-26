const API_URL = import.meta.env.DEV
  ? "http://localhost:5284"
  : "";

export const getImageUrl = (path?: string): string => {
  if (!path) return "";

  const normalizedPath = path.replaceAll("\\", "/");

  if (normalizedPath.startsWith("http")) {
    return normalizedPath;
  }

  return `${API_URL}${
    normalizedPath.startsWith("/") ? "" : "/"
  }${normalizedPath}`;
};