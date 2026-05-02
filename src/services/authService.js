import axios from "axios";

const API_URL = "https://socialfly-web-app2-production.up.railway.app";
const API = `${API_URL}/api/auth`;

const login = async (data) => {
  const res = await axios.post(`${API}/login`, data);
  return res.data;
};
const signup = (data) => axios.post(`${API}/signup`, data);

export default { login , signup};