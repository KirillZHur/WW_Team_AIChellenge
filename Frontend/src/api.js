import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api/v1",
});

const TOKEN =
  "eyJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcHAiLCJzdWIiOiJiYzczYjg0Zi0xOTViLTQzMjctYjhkOC1kOTJkNzY4ZTdiYjMiLCJpYXQiOjE3NjQzODEwNDUsImV4cCI6MTc2NDQxNzA0NX0.pneWxgMLJwIIFC88OXuhni_N1cIY7IOP4-VNasHdj6U";

api.defaults.headers.common["Authorization"] = `Bearer ${TOKEN}`;

export default api;
