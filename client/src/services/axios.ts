import axios, { AxiosResponse } from "axios";
import { getToken } from "./auth/auth.helper";

const API_URL = "http://localhost:3006/api";

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
  (error: Error) => {
    return Promise.reject(new Error(error.message));
  }
);
export default request;
