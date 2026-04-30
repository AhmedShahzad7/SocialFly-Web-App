import axios from "axios";

const API = "http://localhost:5000/api/auth";

const login = async (data) => {
  const res = await axios.post(`${API}/login`, data);
  return res.data;
};
const signup = (data) => axios.post(`${API}/signup`, data);

export default { login , signup};