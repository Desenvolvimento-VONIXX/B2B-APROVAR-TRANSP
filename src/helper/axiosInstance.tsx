import axios from "axios";

// Criando uma instância do axios com a URL base configurada
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API, // A URL base será a variável de ambiente VITE_API
});

export default axiosInstance;
