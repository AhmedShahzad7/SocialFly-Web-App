import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL ;
console.log("API_URL =", API_URL);
const API = `${API_URL}/api/auth`;

const login = async (data) => {
  const res = await axios.post(`${API}/login`, data);
  return res.data;
};
const signup = (data) => axios.post(`${API}/signup`, data);

export default { login , signup};