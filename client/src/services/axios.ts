import axios, { AxiosResponse } from "axios";
import { getToken } from "./auth/auth.helper";

// const API_URL = "http://localhost:3006/api";
const API_URL = "https://pos.api.dev.cxgenie.ai/api";

const request = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

request.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: Error) => {
    return Promise.reject(new Error(error.message));
  }
);

request.interceptors.response.use(
  <T>(response: AxiosResponse<T>) => {
    return response.data;
  },
  (error: any) => {
    // Preserve the original axios error structure to access response data
    if (error.response) {
      // Server responded with error status
      return Promise.reject(error);
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error("Không thể kết nối đến server"));
    } else {
      // Something else happened
      return Promise.reject(new Error(error.message));
    }
  }
);
export default request;
