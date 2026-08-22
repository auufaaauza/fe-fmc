import axios from "axios";

function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000/api`;
  }

  return "http://localhost:8000/api";
}

export const TOKEN_KEY = "fmc_token";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: false,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Attach Bearer token from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.message ?? "Terjadi kesalahan pada server.";
    if (error.response?.data?.errors) {
      const firstErrorKey = Object.keys(error.response.data.errors)[0];
      const errorArray = error.response.data.errors[firstErrorKey];
      if (Array.isArray(errorArray) && errorArray.length > 0) {
        message = errorArray[0];
      }
    }
    error.appMessage = message;
    return Promise.reject(error);
  }
);
