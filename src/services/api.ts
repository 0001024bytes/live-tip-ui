import API from "../lib/api";

export default new API(import.meta.env.VITE_API_URL || "https://live-tip-api.onrender.com");