import axios, { AxiosResponse } from "axios";

// const API_URL = "http://localhost:3000/api";
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
