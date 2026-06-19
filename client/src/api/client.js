const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5001/api"
).replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 15000;

export const apiBase = API;
export const mediaBase = API.replace(/\/api\/?$/, "");

export function resolveMediaUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  return `${mediaBase}${url.startsWith("/") ? "" : "/"}${url}`;
}

function normalizePath(path) {
  if (typeof path !== "string" || !path.trim()) {
    throw new Error("Некоректний шлях запиту");
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function getAuthToken() {
  try {
    return localStorage.getItem("token") || "";
  } catch {
    return "";
  }
}

function buildHeaders(body, extraHeaders = {}) {
  const token = getAuthToken();
  const isFormData = body instanceof FormData;

  return {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function parseResponse(res) {
  if (res.status === 204) return null;

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json().catch(() => ({}));
  }

  const text = await res.text().catch(() => "");
  return text ? { message: text } : {};
}

export async function request(path, options = {}) {
  const normalizedPath = normalizePath(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API}${normalizedPath}`, {
      ...options,
      headers: buildHeaders(options.body, options.headers),
      signal: controller.signal,
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      const message = data?.message || `Помилка запиту (${response.status})`;
      const error = new Error(message);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Час очікування запиту вичерпано");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
